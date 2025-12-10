# Deployment Guide

## 🚀 How to Deploy Your Chatbot

Your chatbot has **two parts** that need to be deployed separately:
1. **Frontend** (React app) → Deploy to **Vercel**
2. **Backend** (Node.js server) → Deploy to **Render** or **Railway**

---

## Step 1: Deploy Backend to Render (Free)

### 1.1 Create Render Account
- Go to https://render.com
- Sign up (free tier available)

### 1.2 Deploy Backend
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (or upload code)
3. **Settings:**
   - **Name:** `chatbot-backend` (or any name)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
4. Click **"Create Web Service"**
5. Wait for deployment (5-10 minutes)
6. **Copy your backend URL** (e.g., `https://chatbot-backend-xyz.onrender.com`)

### 1.3 Test Backend
Visit: `https://your-backend-url.onrender.com/`

You should see a message or the server running.

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Update Environment Variables
1. Open your `.env` file
2. Add your backend URL:
   ```env
   VITE_BACKEND_URL=https://your-backend-url.onrender.com
   ```
3. Save the file

### 2.2 Deploy to Vercel
1. Go to https://vercel.com
2. Sign up/login
3. Click **"Add New"** → **"Project"**
4. Import your GitHub repository
5. **Configure:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add all variables from your `.env` file:
     ```
     VITE_API_KEY=your_api_key_here
     VITE_API_URL=https://generativelanguage.googleapis.com
     VITE_MODEL_NAME=gemini-2.0-flash
     VITE_MAX_TOKENS=1000
     VITE_BACKEND_URL=https://your-backend-url.onrender.com
     ```
7. Click **"Deploy"**
8. Wait for deployment (2-5 minutes)

### 2.3 Test Your Chatbot
Visit your Vercel URL (e.g., `https://your-app.vercel.app`)

---

## Alternative: Deploy Backend to Railway

Railway is another free option for backend:

1. Go to https://railway.app
2. Sign up
3. **New Project** → **Deploy from GitHub**
4. Select your repository
5. **Settings:**
   - **Start Command:** `node server.js`
6. Deploy
7. Copy the URL and use it in your `.env` file

---

## Important Notes

### ⚠️ CORS Configuration
Your backend (`server.js`) already has CORS enabled for all origins:
```javascript
app.use(cors());
```

If you want to restrict it to only your Vercel domain:
```javascript
app.use(cors({
  origin: 'https://your-app.vercel.app'
}));
```

### 🔑 Environment Variables on Vercel
Make sure to add ALL environment variables in Vercel dashboard:
- `VITE_API_KEY`
- `VITE_API_URL`
- `VITE_MODEL_NAME`
- `VITE_MAX_TOKENS`
- `VITE_BACKEND_URL` ← **Most important!**

### 💤 Render Free Tier Limitation
- Free tier servers **sleep after 15 minutes** of inactivity
- First request after sleep takes **30-60 seconds** to wake up
- Consider upgrading to paid tier ($7/month) for always-on server

### 🔄 Updating Your Deployment
**Frontend (Vercel):**
- Push to GitHub → Auto-deploys

**Backend (Render):**
- Push to GitHub → Auto-deploys
- Or manually redeploy from Render dashboard

---

## Troubleshooting

### "Failed to fetch" error on Vercel
- Check if `VITE_BACKEND_URL` is set correctly in Vercel environment variables
- Make sure backend is running on Render
- Check browser console for CORS errors

### Backend not responding
- Check Render logs for errors
- Make sure `server.js` is in the root directory
- Verify `package.json` has correct dependencies

### API Key not working
- Make sure you added `VITE_API_KEY` in Vercel environment variables
- Redeploy after adding environment variables

---

## Cost Summary

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Vercel** (Frontend) | ✅ Free forever | $20/month |
| **Render** (Backend) | ✅ Free (sleeps after 15min) | $7/month (always-on) |
| **Railway** (Backend) | ✅ $5 free credit/month | Pay-as-you-go |
| **Google Gemini API** | ✅ 60 req/min free | Pay-as-you-go |

**Total Cost:** **$0/month** (with limitations) or **$7-20/month** (production-ready)

---

## Quick Deploy Checklist

- [ ] Deploy backend to Render/Railway
- [ ] Copy backend URL
- [ ] Add `VITE_BACKEND_URL` to `.env`
- [ ] Add all environment variables to Vercel
- [ ] Deploy frontend to Vercel
- [ ] Test chatbot on live URL
- [ ] ✅ Done!

---

**Need help?** Check the main README.md for more details.
