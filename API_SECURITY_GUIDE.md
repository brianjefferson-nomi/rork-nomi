# 🔐 API Security Guide

## 🚨 **CRITICAL: API Keys Exposed**

Your API keys were **hardcoded** in the source code, making them publicly visible and vulnerable to abuse.

## ✅ **Security Fixes Applied**

### 1. **Removed All Hardcoded API Keys**
- ❌ **Before:** `apiKey: 'AIzaSyBGoXbra5DeNieDNhP5pmn1B5V3Jg5Ap4Y'`
- ✅ **After:** `apiKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || ''`

### 2. **Added API Key Validation**
- Apps now check for API keys before making requests
- Graceful fallback when keys are missing
- Clear error messages guide users to set up keys

### 3. **Enabled Development Mode**
- External APIs disabled by default
- Uses local data to prevent accidental API calls
- Safe for development and testing

## 🔧 **How to Set Up Secure API Keys**

### Step 1: Create Environment File
```bash
# Copy the example file
cp env.example .env
```

### Step 2: Add Your API Keys
```bash
# Edit .env file
nano .env
```

Add your actual API keys:
```env
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_actual_google_places_key
EXPO_PUBLIC_RAPIDAPI_KEY=your_actual_rapidapi_key
EXPO_PUBLIC_TRIPADVISOR_API_KEY=your_actual_tripadvisor_key
# ... etc
```

### Step 3: Enable External APIs
```env
EXPO_PUBLIC_DEV_MODE=false
```

## 🛡️ **Security Best Practices**

### ✅ **Do:**
- Use environment variables for all API keys
- Keep `.env` file in `.gitignore`
- Rotate API keys regularly
- Monitor API usage for unusual activity
- Use API key restrictions (domain, IP, etc.)

### ❌ **Don't:**
- Hardcode API keys in source code
- Commit API keys to version control
- Share API keys publicly
- Use the same key across multiple projects
- Ignore API usage alerts

## 🔍 **API Key Sources**

### Google Places API (New)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Places API (New)
4. Create credentials → API Key
5. Restrict key to Places API and your domain

### RapidAPI
1. Go to [RapidAPI](https://rapidapi.com/)
2. Sign up/Login
3. Subscribe to needed APIs
4. Copy your API key from dashboard

### TripAdvisor Content API
1. Go to [TripAdvisor Developer Portal](https://developer-tripadvisor.com/)
2. Register as developer
3. Apply for Content API access
4. Get API key

### Foursquare
1. Go to [Foursquare Developer Portal](https://developer.foursquare.com/)
2. Create app
3. Get Client ID and Secret

## 🚨 **Immediate Actions Required**

### 1. **Revoke Exposed Keys**
- **Google Places:** Revoke the exposed key immediately
- **RapidAPI:** Regenerate your API key
- **TripAdvisor:** Contact support to revoke exposed key
- **Foursquare:** Regenerate client credentials
- **Mapbox:** Revoke the exposed key

### 2. **Monitor Usage**
- Check all API dashboards for unusual usage
- Look for unauthorized charges
- Monitor rate limit usage

### 3. **Set Up New Keys**
- Generate new API keys with proper restrictions
- Add them to your `.env` file
- Test functionality

## 🔒 **Production Security**

### For Production Deployment:
1. **Server-Side API Calls:** Move API calls to backend
2. **Environment Variables:** Use secure environment management
3. **API Key Restrictions:** Limit keys to specific domains/IPs
4. **Rate Limiting:** Implement proper rate limiting
5. **Monitoring:** Set up usage alerts

### Current Client-Side Approach:
- ⚠️ **Risk:** API keys visible in client bundle
- ✅ **Mitigation:** Key restrictions by domain/IP
- ✅ **Mitigation:** Rate limiting and monitoring

## 📊 **Current Security Status**

| API | Status | Action Required |
|-----|--------|----------------|
| Google Places | 🔴 Exposed | Revoke & Replace |
| RapidAPI | 🔴 Exposed | Regenerate |
| TripAdvisor | 🔴 Exposed | Contact Support |
| Foursquare | 🔴 Exposed | Regenerate |
| Mapbox | 🔴 Exposed | Revoke & Replace |
| OpenAI | ✅ Secure | None |

## 🆘 **Emergency Contacts**

- **Google Cloud Support:** https://cloud.google.com/support
- **RapidAPI Support:** support@rapidapi.com
- **TripAdvisor Developer Support:** developer-support@tripadvisor.com
- **Foursquare Support:** https://developer.foursquare.com/support
- **Mapbox Support:** https://support.mapbox.com/

## 📝 **Next Steps**

1. **Immediately:** Revoke all exposed API keys
2. **Today:** Set up new API keys with restrictions
3. **This Week:** Implement proper environment management
4. **Next Sprint:** Move API calls to server-side
5. **Ongoing:** Monitor usage and rotate keys regularly

---

**Remember:** API keys are like passwords - keep them secret and secure!
