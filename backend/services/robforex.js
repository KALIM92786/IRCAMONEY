const axios = require('axios');

class RoboForexService {
  constructor() {
    this.baseUrl = process.env.ROBOFOREX_API_URL || 'https://api.stockstrader.com';
    this.accountId = process.env.ROBOFOREX_ACCOUNT_ID;
    this.token = process.env.ROBOFOREX_API_TOKEN;
    
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getAccount(accountId = this.accountId) {
    try {
      // Adjust endpoint based on actual API docs
      const response = await this.api.get(`/api/v1/accounts/${accountId}`);
      
      // Normalize data structure from { code: 'ok', data: { margin: { ... } } }
      if (response.data && response.data.data && response.data.data.margin) {
        const m = response.data.data.margin;
        return {
          id: accountId,
          balance: m.balance,
          equity: m.equity,
          margin: m.margin,
          freeMargin: m.free_margin,
          marginLevel: m.margin_level || (m.margin > 0 ? (m.equity / m.margin) * 100 : 0)
        };
      }
      return null;
    } catch (error) {
      console.error('RoboForex API Error (Account):', error.message);
      // Return null or throw depending on desired resilience
      return null;
    }
  }

  async getOrders(accountId = this.accountId) {
    try {
      const response = await this.api.get(`/api/v1/accounts/${accountId}/orders`);
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('RoboForex API Error (Orders):', error.message);
      return [];
    }
  }

  async getDeals(accountId = this.accountId) {
    try {
      // Fetch last 50 deals or time-based
      const response = await this.api.get(`/api/v1/accounts/${accountId}/deals?limit=50`);
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('RoboForex API Error (Deals):', error.message);
      return [];
    }
  }

  async getQuote(ticker = 'XAUUSD', accountId = this.accountId) {
    try {
      const response = await this.api.get(`/api/v1/accounts/${accountId}/instruments/${ticker}/quote`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error(`RoboForex API Error (Quote ${ticker}):`, error.message);
      return null;
    }
  }

  async placeOrder(accountId, ticker, side, volume, type = 'market') {
    try {
      const response = await this.api.post(`/api/v1/accounts/${accountId}/orders`, {
        ticker,
        side,
        volume,
        type
      });
      return response.data;
    } catch (error) {
      console.error(`RoboForex API Error (Place Order ${ticker}):`, error.message);
      return null;
    }
  }

  async closeOrder(accountId, orderId) {
    try {
      const response = await this.api.delete(`/api/v1/accounts/${accountId}/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`RoboForex API Error (Close Order ${orderId}):`, error.message);
      return null;
    }
  }
}

module.exports = new RoboForexService();