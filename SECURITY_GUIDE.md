# 🔒 Security Guide - API Key Management

## ⚠️ CRITICAL: Your API Keys Are Currently Exposed!

Your external API keys are hardcoded in the frontend code, which is a **major security vulnerability**.

## 🚨 Immediate Actions Required:

### 1. **Create Environment Variables**
Create a `.env` file in your project root:

```bash
# Copy the example file
cp env.example .env

# Edit with your actual API keys
nano .env
```

### 2. **Add .env to .gitignore**
Make sure `.env` is in your `.gitignore` file:

```bash
echo ".env" >> .gitignore
```

### 3. **Rotate Your API Keys**
**IMMEDIATELY** rotate these exposed API keys:

- **RapidAPI Key**: `20963faf74mshd7e2b2b5c31072dp144d88jsnedee80161863`
- **TripAdvisor API Key**: `F99007CEF189438793FFD5D7B484839A`
- **Foursquare API Key**: `X5ZAL1Q3QSXJPTNY2IFTUTKCUEDL3AXL5XY2N05ML42OYT0J`

### 4. **Update Your .env File**
```bash
# Supabase (Public - OK to expose)
EXPO_PUBLIC_SUPABASE_URL=https://qlnllnqrdxjiigmzyhlu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbmxsbnFyZHhqaWlnbXp5aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTA3NDAsImV4cCI6MjA3MTU4Njc0MH0.xpAzHk2LGr39YZEMyR2JdRwpyhMKdFLsyrKhDieok-c

# External APIs (PRIVATE - Keep secret)
EXPO_PUBLIC_RAPIDAPI_KEY=your_new_rapidapi_key_here
EXPO_PUBLIC_TRIPADVISOR_API_KEY=your_new_tripadvisor_key_here
EXPO_PUBLIC_FOURSQUARE_API_KEY=your_new_foursquare_key_here
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key_here
```

## 🛡️ Security Best Practices:

### **For Development:**
1. ✅ Use environment variables
2. ✅ Never commit API keys to git
3. ✅ Use `.env.example` for documentation
4. ✅ Rotate keys regularly

### **For Production:**
1. ✅ Use server-side API calls
2. ✅ Implement rate limiting
3. ✅ Use API key rotation
4. ✅ Monitor API usage
5. ✅ Set up alerts for unusual activity

## 🔧 How to Rotate API Keys:

### **RapidAPI:**
1. Go to [RapidAPI Dashboard](https://rapidapi.com/developer/dashboard)
2. Find your project
3. Generate a new API key
4. Update your `.env` file
5. Delete the old key

### **TripAdvisor:**
1. Go to [TripAdvisor Developer Portal](https://developer-tripadvisor.com/)
2. Generate a new API key
3. Update your `.env` file
4. Revoke the old key

### **Foursquare:**
1. Go to [Foursquare Developer Portal](https://developer.foursquare.com/)
2. Generate a new API key
3. Update your `.env` file
4. Revoke the old key

## 📱 Expo Environment Variables:

Expo automatically loads environment variables prefixed with `EXPO_PUBLIC_`:

```typescript
// This will work in Expo
const apiKey = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
```

## 🚀 Production Deployment:

### **For App Stores:**
- Environment variables are bundled with the app
- Keys are still visible in the app bundle
- Consider server-side proxy for sensitive APIs

### **For Web:**
- Environment variables are exposed in the browser
- Use server-side API calls for sensitive operations

## 🔍 Monitoring:

Set up monitoring for:
- API usage spikes
- Unusual request patterns
- Rate limit violations
- Cost overruns

## 📞 Emergency Contacts:

If you suspect API key compromise:
1. **Immediately** rotate all exposed keys
2. **Monitor** API usage for abuse
3. **Contact** API providers if needed
4. **Review** access logs

## ✅ Security Checklist:

- [ ] Create `.env` file
- [ ] Add `.env` to `.gitignore`
- [ ] Rotate all exposed API keys
- [ ] Update environment variables
- [ ] Test with new keys
- [ ] Remove hardcoded keys from code
- [ ] Set up monitoring
- [ ] Document security procedures

## 🆘 If You Need Help:

1. **Immediate**: Rotate your API keys NOW
2. **Short-term**: Set up environment variables
3. **Long-term**: Consider server-side API proxy

**Remember: Security is everyone's responsibility!**
