# Getting Your Service Role Key

## 🔑 To use the automated script, you need your Service Role Key

### **Step 1: Access Project Settings**

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `qlnllnqrdxjiigmzyhlu`
3. Click on **"Settings"** in the left sidebar
4. Click on **"API"** in the settings menu

### **Step 2: Copy Service Role Key**

1. Scroll down to the **"Project API keys"** section
2. Find the **"service_role"** key (it starts with `eyJ...`)
3. Copy the entire key
4. **⚠️ Keep this key secret - it has admin privileges!**

### **Step 3: Update the Script**

Replace the placeholder key in `apply-schema-directly.js`:

```javascript
const supabaseKey = 'YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE';
```

### **Step 4: Run the Script**

```bash
node apply-schema-directly.js
```

## 🛡️ Security Note

- The **service_role** key has full admin access to your database
- Never commit this key to version control
- Use environment variables in production
- Consider using the manual approach (Supabase Dashboard) for better security

## 🎯 Alternative: Manual Application

If you prefer not to use the service role key, use the **Manual Schema Application Guide** instead, which uses the Supabase Dashboard SQL Editor.
