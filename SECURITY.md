# Security Configuration Guide

## 🔐 OAuth Security Be### 🛡️ Additional Security Features

- ✅ **CSRF Protection** - State parameter validation
- ✅ **Rate Limiting** - Prevents brute force and DoS attacks  
- ✅ **Input Sanitization** - All inputs validated and cleaned
- ✅ **Session Management** - Secure token storage with expiration
- ✅ **Security Headers** - CSP, HSTS, and other protective headers
- ✅ **Real-time Monitoring** - Security events logging and alerts
- ✅ **API Obfuscation** - Endpoint names and parameters obfuscated
- ✅ **Request Encryption** - Payloads encrypted with timestamps
- ✅ **Security Through Obscurity** - API structure hidden from attackers

### 🔐 API Endpoint Obfuscation

The application uses advanced API obfuscation to hide endpoint structures:

#### **Obfuscated Endpoints:**
- `/api/auth_exchange` (was: `/api/oauth-token`)
- `/api/student_data` (was: `/api/cursus-users`)
- `/api/profile_info` (was: `/api/user-me`)
- `/api/api_bridge` (was: `/api/intra-proxy`)

#### **Request Encryption:**
All API requests are encrypted with:
- Timestamp validation (5-minute expiry)
- Unique nonce for each request
- Parameter name obfuscation
- Payload encryptionices

### ⚠️ Critical Security Notice

**NEVER expose client secrets in frontend code!** This application follows OAuth 2.0 security best practices:

### 📋 Environment Variables Setup

#### **Frontend Environment Variables** (`.env` file)
```bash
# Safe for frontend - publicly visible
VITE_42_CLIENT_ID=your_client_id_here
VITE_42_REDIRECT_URI=https://yourdomain.com/
VITE_42_AUTHORIZE_URL=https://api.intra.42.fr/oauth/authorize
VITE_42_TOKEN_URL=https://api.intra.42.fr/oauth/token
VITE_42_API_BASE_URL=https://api.intra.42.fr/v2
VITE_APP_DOMAIN=yourdomain.com
VITE_SESSION_TIMEOUT=3600000
VITE_MAX_LOGIN_ATTEMPTS=5
```

#### **Server Environment Variables** (Deployment platform)
```bash
# CRITICAL: Server-side only - NEVER expose in frontend
VITE_42_CLIENT_SECRET=your_actual_client_secret_here
```

### 🚀 Deployment Configuration

#### **Vercel**
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the client secret as a **server-side** environment variable:
   - Name: `VITE_42_CLIENT_SECRET`
   - Value: `your_actual_client_secret`
   - Environment: Production, Preview, Development

#### **Netlify**
1. Go to your Netlify site dashboard  
2. Navigate to Site Settings → Environment Variables
3. Add the client secret:
   - Key: `VITE_42_CLIENT_SECRET`
   - Value: `your_actual_client_secret`

#### **Other Platforms**
Ensure your deployment platform sets `VITE_42_CLIENT_SECRET` as a server-side environment variable.

### 🔒 Security Flow

1. **Frontend** → Only sends authorization code to backend
2. **Backend** → Uses server-side client secret to exchange code for token
3. **Result** → Client secret never exposed to browser

### 🛡️ Additional Security Features

- ✅ **CSRF Protection** - State parameter validation
- ✅ **Rate Limiting** - Prevents brute force attacks
- ✅ **Input Sanitization** - All inputs validated and cleaned
- ✅ **Session Management** - Secure token storage with expiration
- ✅ **Security Headers** - CSP, HSTS, and other protective headers
- ✅ **Real-time Monitoring** - Security events logging and alerts

### 📊 Security Monitoring

The application includes a real-time security monitor accessible via the shield icon in the bottom-right corner. It shows:

- Authentication status
- Session validity
- Security score
- Threat alerts
- Configuration status

### 🔧 Troubleshooting

#### "OAuth configuration not properly set on server"
- Verify `VITE_42_CLIENT_SECRET` is set in your deployment environment
- Check that all required environment variables are configured
- Ensure the client secret matches your 42 OAuth application

#### "Missing authorization code"
- Verify the redirect URI in your 42 OAuth application matches your environment
- Check that the OAuth flow is completing properly

#### Security warnings in browser console
- These are intentional security events being logged
- Check the Security Monitor for details
- Warnings help detect potential security threats

### 🏆 Best Practices Implemented

1. **Server-side OAuth** - Client secret never exposed to frontend
2. **Token Security** - Secure storage with integrity checks  
3. **Session Management** - Automatic expiration and renewal
4. **Rate Limiting** - Protection against abuse
5. **Input Validation** - All data sanitized and validated
6. **Security Headers** - Comprehensive HTTP security
7. **Monitoring** - Real-time threat detection

This configuration ensures your 1337 Leaderboard application meets enterprise security standards while protecting user data and preventing common web vulnerabilities.
