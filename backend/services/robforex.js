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
      return response.data;
    } catch (error) {
      console.error('RoboForex API Error (Account):', error.message);
      // Return null or throw depending on desired resilience
      return null;
    }
  }

  async getOrders(accountId = this.accountId) {
    try {
      const response = await this.api.get(`/api/v1/accounts/${accountId}/orders`);
      return response.data;
    } catch (error) {
      console.error('RoboForex API Error (Orders):', error.message);
      return [];
    }
  }

  async getDeals(accountId = this.accountId) {
    try {
      // Fetch last 50 deals or time-based
      const response = await this.api.get(`/api/v1/accounts/${accountId}/deals?limit=50`);
      return response.data;
    } catch (error) {
      console.error('RoboForex API Error (Deals):', error.message);
      return [];
    }
  }

  async getQuote(ticker = 'XAUUSD') {
    try {
      const response = await this.api.get(`/api/v1/quotes/${ticker}`);
      return response.data;
    } catch (error) {
      console.error(`RoboForex API Error (Quote ${ticker}):`, error.message);
      return null;
    }
  }

  async placeOrder(accountId, symbol, side, volume, type = 'market') {
    try {
      const response = await this.api.post(`/api/v1/accounts/${accountId}/orders`, {
        symbol,
        side,
        volume,
        type
      });
      return response.data;
    } catch (error) {
      console.error(`RoboForex API Error (Place Order ${symbol}):`, error.message);
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