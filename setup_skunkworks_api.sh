#!/bin/bash
# setup_skunkworks_api.sh — Auto-setup and deploy Skunkworks API to Cloud Run

PROJECT_ID="easyfilev20-27833257-6347a"
REGION="us-central1"
SERVICE_NAME="skunkworks-api"

echo "🚀 Starting setup for $SERVICE_NAME in project $PROJECT_ID..."

# Step 1: Create cloudbuild.yaml
cat > cloudbuild.yaml <<'EOF'
# cloudbuild.yaml — Skunkworks API auto-deploy
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/skunkworks-api', '.']

  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/skunkworks-api']

  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      [
        'run', 'deploy', 'skunkworks-api',
        '--image', 'gcr.io/$PROJECT_ID/skunkworks-api',
        '--region', 'us-central1',
        '--platform', 'managed',
        '--allow-unauthenticated',
        '--port', '8080'
      ]

images:
  - 'gcr.io/$PROJECT_ID/skunkworks-api'

timeout: '900s'

options:
  logging: CLOUD_LOGGING_ONLY
EOF
echo "✅ Created cloudbuild.yaml"

# Step 2: Create Dockerfile
cat > Dockerfile <<'EOF'
# Dockerfile — Skunkworks API
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV NODE_ENV=production
EXPOSE 8080
CMD ["npm", "start"]
EOF
echo "✅ Created Dockerfile"

# Step 3: Create package.json
cat > package.json <<'EOF'
{
  "name": "skunkworks-api",
  "version": "1.0.0",
  "description": "Skunkworks API – Cloud Run & Firebase auto-deploy pipeline",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required'"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  },
  "engines": {
    "node": ">=18.x"
  },
  "license": "MIT"
}
EOF
echo "✅ Created package.json"

# Step 4: Create server.js
cat > server.js <<'EOF'
// server.js — Minimal Express API
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'skunkworks-api', environment: process.env.NODE_ENV });
});

app.listen(PORT, () => console.log(\`🚀 Skunkworks API running on port \${PORT}\`));
EOF
echo "✅ Created server.js"

# Step 5: Install dependencies locally (optional sanity check)
echo "📦 Installing local dependencies..."
npm install

# Step 6: Git commit
echo "📚 Committing files..."
git add cloudbuild.yaml Dockerfile package.json server.js
git commit -m "Setup Skunkworks API build and deploy pipeline"
git push origin main
echo "✅ Files committed and pushed to GitHub."

# Step 7: Trigger Cloud Build deployment
echo "🚢 Submitting build to Google Cloud..."
gcloud builds submit --config=cloudbuild.yaml --project=$PROJECT_ID --verbosity=info

echo "🎉 Setup complete! Check Cloud Run for your deployed service:"
echo "�� https://console.cloud.google.com/run?project=$PROJECT_ID&region=$REGION"

