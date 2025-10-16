#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VERCEL_TOKEN = '1fxufR8OOMHgIJA1sKNHVNVI';
const PROJECT_NAME = 'fhe-microloan-bazaar';

async function deployToVercel() {
  try {
    console.log('🚀 Starting Vercel deployment...');
    
    // Build the frontend
    console.log('📦 Building frontend...');
    execSync('cd frontend && npm run build', { stdio: 'inherit' });
    
    // Create a temporary directory for deployment
    const tempDir = path.join(__dirname, '../temp-deploy');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    fs.mkdirSync(tempDir);
    
    // Copy built files
    console.log('📋 Copying built files...');
    execSync(`cp -r frontend/dist/* ${tempDir}/`, { stdio: 'inherit' });
    
    // Create vercel.json for the deployment
    const vercelConfig = {
      "version": 2,
      "rewrites": [
        {
          "source": "/(.*)",
          "destination": "/index.html"
        }
      ]
    };
    
    fs.writeFileSync(
      path.join(tempDir, 'vercel.json'),
      JSON.stringify(vercelConfig, null, 2)
    );
    
    // Deploy using Vercel CLI
    console.log('🌐 Deploying to Vercel...');
    process.env.VERCEL_TOKEN = VERCEL_TOKEN;
    
    const deployCommand = `cd ${tempDir} && vercel --prod --yes --name ${PROJECT_NAME}`;
    const result = execSync(deployCommand, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log('✅ Deployment successful!');
    console.log('📱 Your app is live at: https://fhe-microloan-bazaar.vercel.app/');
    
    // Clean up
    fs.rmSync(tempDir, { recursive: true });
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deployToVercel();
