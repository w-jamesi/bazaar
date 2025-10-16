#!/bin/bash

# Vercel deployment script
VERCEL_TOKEN="1fxufR8OOMHgIJA1sKNHVNVI"
PROJECT_NAME="bazaar-hub"

echo "🚀 Starting Vercel deployment..."

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Created temp directory: $TEMP_DIR"

# Copy built files
echo "📋 Copying built files..."
cp -r frontend/dist/* "$TEMP_DIR/"

# Create vercel.json
cat > "$TEMP_DIR/vercel.json" << EOF
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
EOF

# Create a zip file
echo "📦 Creating deployment package..."
cd "$TEMP_DIR"
zip -r ../deployment.zip . > /dev/null
cd - > /dev/null

# Deploy using Vercel API
echo "🌐 Deploying to Vercel..."

# First, create/get project
PROJECT_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v10/projects" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PROJECT_NAME\",
    \"framework\": \"vite\"
  }")

echo "Project response: $PROJECT_RESPONSE"

# Deploy the files
DEPLOY_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -F "files=@$TEMP_DIR/../deployment.zip" \
  -F "name=$PROJECT_NAME" \
  -F "project=$PROJECT_NAME")

echo "Deploy response: $DEPLOY_RESPONSE"

# Extract deployment URL
DEPLOYMENT_URL=$(echo "$DEPLOY_RESPONSE" | grep -o '"url":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$DEPLOYMENT_URL" ]; then
    echo "✅ Deployment successful!"
    echo "📱 Your app is live at: https://$DEPLOYMENT_URL"
    echo "🌐 Custom domain: https://bazaar-hub.vercel.app/"
else
    echo "❌ Deployment failed. Response: $DEPLOY_RESPONSE"
fi

# Clean up
rm -rf "$TEMP_DIR"
rm -f "$TEMP_DIR/../deployment.zip"

echo "🧹 Cleanup completed."
