const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const ACCOUNT_ID = process.env.ROBOFOREX_ACCOUNT_ID;
const API_TOKEN = process.env.ROBOFOREX_API_TOKEN;
const API_URL = process.env.ROBOFOREX_API_URL || 'https://api.stockstrader.com';

async function testApi() {
  console.log('🔍 Testing RoboForex API Credentials...');
  console.log(`Target: ${API_URL}`);
  console.log(`Account: ${ACCOUNT_ID}`);

  if (!ACCOUNT_ID || !API_TOKEN) {
    console.error('❌ Missing credentials in .env');
    process.exit(1);
  }

  const isAccountIdPlaceholder = ACCOUNT_ID.includes('your_account_id');
  const isApiTokenPlaceholder = API_TOKEN.includes('your_api_token');
  if (isAccountIdPlaceholder || isApiTokenPlaceholder) {
    console.error('❌ Credentials in .env appear to be placeholders. Please update them.');
    process.exit(1);
  }

  try {
    // Attempting a basic account info fetch
    // Updated based on StocksTrader REST API.txt
    const endpoint = `${API_URL}/api/v1/accounts/${ACCOUNT_ID}`;
    
    const response = await axios.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    console.log('✅ API Connection Successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ API Request Failed');
    if (error.response) {
      console.error(`Status: ${error.response.status} - ${error.response.statusText}`);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testApi();