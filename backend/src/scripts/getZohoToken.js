const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../../.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ Error: backend/.env file not found at:', envPath);
  process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(envPath));

const rawCode = process.argv[2];

if (!rawCode || rawCode.trim() === '' || rawCode === 'YOUR_GENERATED_CODE') {
  console.log('\n❌ Usage: npm run get-zoho-token <YOUR_GENERATED_CODE>');
  console.log('📌 Example: npm run get-zoho-token 1000.3fa8c9b2e...c7bc4de27de4fabef\n');
  console.log('👉 Please generate a fresh Grant Code in Zoho API Console (Self Client -> Generate Code) and paste it as the argument.\n');
  process.exit(1);
}

const code = rawCode.trim().replace(/^["']|["']$/g, '');

const clientId = (envConfig.ZOHO_CLIENT_ID || '').trim().replace(/^["']|["']$/g, '');
const clientSecret = (envConfig.ZOHO_CLIENT_SECRET || '').trim().replace(/^["']|["']$/g, '');

if (!clientId || !clientSecret) {
  console.error('❌ Error: ZOHO_CLIENT_ID or ZOHO_CLIENT_SECRET is missing in backend/.env');
  process.exit(1);
}

async function exchangeToken() {
  console.log('\n🔄 Connecting to Zoho OAuth 2.0 gateway (India region: accounts.zoho.in)...');
  
  // Prioritize India accounts since client is registered in IN data center
  const domains = ['in', 'com', 'eu', 'com.au', 'ca'];

  for (const domain of domains) {
    const tokenUrl = `https://accounts.zoho.${domain}/oauth/v2/token`;
    try {
      const params = new URLSearchParams({
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code'
      });

      const res = await axios.post(tokenUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 12000
      });

      if (res.data.refresh_token) {
        const maskedRefresh = res.data.refresh_token.substring(0, 10) + '...' + res.data.refresh_token.slice(-6);
        const maskedAccess = res.data.access_token ? res.data.access_token.substring(0, 10) + '...' : 'Generated';

        console.log(`\n=======================================================`);
        console.log(`✅ ZOHO OAUTH CONNECTION SUCCESSFUL!`);
        console.log(`✨ Region: accounts.zoho.${domain}`);
        console.log(`🔑 Refresh Token: ${maskedRefresh} (Securely Saved)`);
        console.log(`🔑 Initial Access Token: ${maskedAccess} (Valid for ${res.data.expires_in || 3600}s)`);
        console.log(`=======================================================`);

        // Update backend/.env automatically
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Update or append ZOHO_REFRESH_TOKEN
        if (/ZOHO_REFRESH_TOKEN=/.test(envContent)) {
          envContent = envContent.replace(/ZOHO_REFRESH_TOKEN=.*(\r?\n|$)/, `ZOHO_REFRESH_TOKEN=${res.data.refresh_token}$1`);
        } else {
          envContent += `\nZOHO_REFRESH_TOKEN=${res.data.refresh_token}\n`;
        }

        // Update ZOHO_ACCOUNTS_URL & ZOHO_API_BASE_URL to matching domain
        envContent = envContent.replace(/ZOHO_ACCOUNTS_URL=.*(\r?\n|$)/, `ZOHO_ACCOUNTS_URL=https://accounts.zoho.${domain}$1`);
        envContent = envContent.replace(/ZOHO_API_BASE_URL=.*(\r?\n|$)/, `ZOHO_API_BASE_URL=https://www.zohoapis.${domain}$1`);

        fs.writeFileSync(envPath, envContent, 'utf8');
        console.log(`💾 Saved directly to backend/.env.`);
        console.log(`🚀 Your Employee Portal is now actively integrated with live Zoho One APIs!\n`);
        return;
      } else if (res.data.error) {
        if (res.data.error !== 'invalid_client') {
          console.log(`ℹ️ [accounts.zoho.${domain}]: ${res.data.error}`);
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      if (errorMsg !== 'invalid_client') {
        console.log(`ℹ️ [accounts.zoho.${domain}]: ${errorMsg}`);
      }
    }
  }

  console.error('\n❌ Token exchange failed: The authorization code provided was invalid or already expired.');
  console.log('📌 Zoho authorization codes are single-use and expire within 5-10 minutes.');
  console.log('👉 Please generate a FRESH code from Zoho API Console and run the command again.\n');
}

exchangeToken();
