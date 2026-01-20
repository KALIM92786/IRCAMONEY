const db = require('../config/database');
const roboForex = require('./robforex');

class SyncEngine {
  constructor(io) {
    this.io = io;
    this.interval = null;
    this.isRunning = false;
  }

  start(intervalMs = 3000) {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`Starting sync engine with ${intervalMs}ms interval`);
    
    this.interval = setInterval(async () => {
      await this.syncCycle();
    }, intervalMs);
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    this.isRunning = false;
    console.log('Sync engine stopped');
  }

  async syncCycle() {
    try {
      // 1. Sync Account
      const accountData = await roboForex.getAccount();
      if (accountData) {
        await this.updateAccount(accountData);
        this.io.emit('account_update', accountData);
      }

      // 2. Sync Orders
      const ordersData = await roboForex.getOrders();
      if (ordersData) {
        await this.updateOrders(ordersData);
        this.io.emit('orders_update', ordersData);
      }

      // 3. Sync Deals (History)
      const dealsData = await roboForex.getDeals();
      if (dealsData) {
        await this.updateDeals(dealsData);
        this.io.emit('deals_update', dealsData);
      }

      // 4. Sync Quote (XAUUSD)
      const quoteData = await roboForex.getQuote('XAUUSD');
      if (quoteData) {
        this.io.emit('price_update', { ticker: 'XAUUSD', ...quoteData });
      }

      // 5. Snapshot Equity (Optional: Logic to do this less frequently)
      if (accountData) {
        await this.snapshotEquity(accountData);
      }

      // 6. Process Copy Trading
      await this.processCopyTrading();

    } catch (error) {
      console.error('Sync cycle failed:', error.message);
    }
  }

  async updateAccount(data) {
    const query = `
      INSERT INTO accounts (id, balance, equity, margin, free_margin, margin_level, last_updated)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) DO UPDATE SET
        balance = EXCLUDED.balance,
        equity = EXCLUDED.equity,
        margin = EXCLUDED.margin,
        free_margin = EXCLUDED.free_margin,
        margin_level = EXCLUDED.margin_level,
        last_updated = NOW()
    `;
    const values = [
      data.id, 
      data.balance, 
      data.equity, 
      data.margin, 
      data.freeMargin, 
      data.marginLevel
    ];
    await db.query(query, values);
  }

  async updateOrders(orders) {
    // Basic implementation: Upsert orders
    // In production, you might want to handle deletions/closures more robustly
    for (const order of orders) {
      const query = `
        INSERT INTO orders (id, account_id, ticker, side, volume, open_price, current_price, profit, open_time)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          current_price = EXCLUDED.current_price,
          profit = EXCLUDED.profit,
          updated_at = NOW()
      `;
      const values = [
        order.id,
        process.env.ROBOFOREX_ACCOUNT_ID,
        order.symbol,
        order.side,
        order.volume,
        order.openPrice,
        order.currentPrice,
        order.profit,
        new Date(order.openTime)
      ];
      await db.query(query, values);
    }
  }

  async updateDeals(deals) {
    for (const deal of deals) {
      const query = `
        INSERT INTO deals (id, order_id, account_id, ticker, side, volume, price, profit, close_time)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `;
      const values = [
        deal.id,
        deal.orderId,
        process.env.ROBOFOREX_ACCOUNT_ID,
        deal.symbol,
        deal.side,
        deal.volume,
        deal.price,
        deal.profit,
        new Date(deal.closeTime)
      ];
      await db.query(query, values);
    }
  }

  async snapshotEquity(account) {
    // Simple snapshot logic - insert every time (cleanup job handles old data)
    // Or check if snapshot exists for this hour
    const query = `
      INSERT INTO equity_snapshots (account_id, equity, balance, margin)
      VALUES ($1, $2, $3, $4)
    `;
    await db.query(query, [account.id, account.equity, account.balance, account.margin]);
  }

  async processCopyTrading() {
    try {
      // 1. Get active settings
      const settingsResult = await db.query('SELECT * FROM copy_settings WHERE is_active = TRUE');
      const settings = settingsResult.rows;

      for (const setting of settings) {
        // 2. Get Master Orders
        const masterOrders = await roboForex.getOrders(setting.master_account_id);
        
        for (const order of masterOrders) {
          // 3. Check if already copied
          const copiedResult = await db.query(
            'SELECT * FROM copied_trades WHERE master_order_id = $1 AND setting_user_id = $2',
            [order.id, setting.user_id]
          );

          if (copiedResult.rows.length === 0) {
            // 4. Place Copy Trade
            const volume = (parseFloat(order.volume) * parseFloat(setting.multiplier)).toFixed(2);
            
            console.log(`[CopyTrading] Replicating Order ${order.id} (${order.symbol}) to ${setting.slave_account_id}`);
            
            const result = await roboForex.placeOrder(
              setting.slave_account_id,
              order.symbol,
              order.side,
              parseFloat(volume)
            );

            if (result && result.id) {
              // 5. Record success
              await db.query(
                'INSERT INTO copied_trades (setting_user_id, master_order_id, slave_order_id) VALUES ($1, $2, $3)',
                [setting.user_id, order.id, result.id]
              );
              
              // Notify frontend
              this.io.emit('notification', {
                message: `Copied trade ${order.symbol} to ${setting.slave_account_id}`,
                type: 'success'
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Copy trading process failed:', error.message);
    }
  }
}

module.exports = SyncEngine;