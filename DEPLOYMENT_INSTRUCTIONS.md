# 🚀 Vercel Deployment Instructions

## Option 1: Manual Deployment via Vercel Dashboard

1. **Visit Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose `william2332-limf/CipheredMicroloan-Bazaar`

3. **Configure Project**
   - **Project Name**: `fhe-microloan-bazaar`
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at: `https://fhe-microloan-bazaar.vercel.app/`

## Option 2: CLI Deployment (if token is valid)

```bash
# Install Vercel CLI
npm install -g vercel

# Login with token
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod --name fhe-microloan-bazaar
```

## Option 3: GitHub Actions (Recommended)

The repository is already configured with GitHub Actions for automatic deployment. You just need to:

1. **Add Vercel Token to GitHub Secrets**
   - Go to your GitHub repository settings
   - Navigate to "Secrets and variables" → "Actions"
   - Add a new secret named `VERCEL_TOKEN` with your Vercel token

2. **Trigger Deployment**
   - Push any changes to the `main` branch
   - GitHub Actions will automatically deploy to Vercel

## Current Status

✅ **Frontend built successfully**  
✅ **Vercel configuration ready**  
✅ **GitHub Actions configured**  
⏳ **Waiting for valid Vercel token or manual deployment**

## Expected Result

Once deployed, your app will be available at:
- **Primary URL**: `https://fhe-microloan-bazaar.vercel.app/`
- **Vercel URL**: `https://fhe-microloan-bazaar-[hash].vercel.app/`

## Features Included

- 🔐 FHE-enabled microloan platform
- 💰 ETH-based loan amounts
- 🌐 English interface
- 📱 Responsive design
- 🔗 Wallet integration (MetaMask, etc.)
- 📊 Real-time loan tracking
- 🛡️ Privacy-preserving technology
