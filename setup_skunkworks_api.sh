#!/bin/bash
set -e

PROJECT_ID="easyfilev20-27833257-6347a"
SERVICE_ACCOUNT="firebase-adminsdk-fbsvc@$PROJECT_ID.iam.gserviceaccount.com"
KEY_FILE="serviceAccountKey.json"

echo "🚀 Starting Skunkworks Cloud setup for skunkworks-api in project $PROJECT_ID ..."

# ---------------------------------------------------------------------------
# 1. Create Firebase Admin SDK key (if not already exists)
# ---------------------------------------------------------------------------
if [ ! -f "$KEY_FILE" ]; then
  echo "🔑 Generating new Firebase Admin SDK key..."
  gcloud iam service-accounts keys create "$KEY_FILE" \
    --iam-account="$SERVICE_ACCOUNT" \
    --project="$PROJECT_ID"
  echo "✅ Key saved at $KEY_FILE"
else
  echo "ℹ️ Existing Admin SDK key found at $KEY_FILE"
fi

# ---------------------------------------------------------------------------
# 2. Enable core APIs
# ---------------------------------------------------------------------------
echo "⚙️ Enabling necessary Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  firebase.googleapis.com \
  firebasehosting.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  --project="$PROJECT_ID"

# ---------------------------------------------------------------------------
# 3. Grant required IAM roles to Firebase App Hosting service agent
# ---------------------------------------------------------------------------
AGENT="service-837078045227@gcp-sa-firebaseapphosting.iam.gserviceaccount.com"

echo "🔧 Granting IAM roles to Firebase App Hosting service agent..."
for ROLE in roles/cloudbuild.builds.editor roles/storage.admin roles/run.admin; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$AGENT" \
    --role="$ROLE" \
    --condition=None >/dev/null
done
echo "✅ IAM permissions updated for App Hosting agent."

# ---------------------------------------------------------------------------
# 4. Create apphosting.yaml for Firebase Hosting → Cloud Run integration
# ---------------------------------------------------------------------------
cat > apphosting.yaml <<'EOF'
runConfig:
  maxInstances: 1
runtime: nodejs
env:
  - key: FIREBASE_CONFIG
    value: '{"projectId":"easyfilev20-27833257-6347a","storageBucket":"easyfilev20-27833257-6347a.appspot.com"}'
  - key: GOOGLE_APPLICATION_CREDENTIALS
    value: "/workspace/serviceAccountKey.json"
EOF
echo "✅ Created apphosting.yaml"

# ---------------------------------------------------------------------------
# 5. Create cloudbuild.yaml for Cloud Run auto-deploy
# ---------------------------------------------------------------------------
cat > cloudbuild.yaml <<'EOF'
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/skunkworks-api', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/skunkworks-api']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      [
        'run','deploy','skunkworks-api',
        '--image','gcr.io/$PROJECT_ID/skunkworks-api',
        '--region','us-central1',
        '--platform','managed',
        '--allow-unauthenticated',
        '--port','8080'
      ]
images:
  - 'gcr.io/$PROJECT_ID/skunkworks-api'
options:
  logging: CLOUD_LOGGING_ONLY
EOF
echo "✅ Created cloudbuild.yaml"

# ---------------------------------------------------------------------------
# 6. Generate firebase.json (fallback configuration)
# ---------------------------------------------------------------------------
cat > firebase.json <<'EOF'
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
EOF
echo "✅ Created firebase.json"

# ---------------------------------------------------------------------------
# 7. Initialize Admin SDK in Node backend (if not already present)
# ---------------------------------------------------------------------------
if ! grep -q "firebase-admin" ./index.js 2>/dev/null; then
  echo "🧠 Injecting Firebase Admin SDK init block into index.js..."
  cat <<'JSBLOCK' > index.js
import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "easyfilev20-27833257-6347a.appspot.com"
});

export const db = admin.firestore();
export const auth = admin.auth();
export const bucket = admin.storage().bucket();

console.log("✅ Firebase Admin SDK initialized successfully.");
JSBLOCK
fi

# ---------------------------------------------------------------------------
# 8. Deploy to Cloud Run
# ---------------------------------------------------------------------------
echo "🚢 Deploying to Cloud Run..."
gcloud builds submit --config=cloudbuild.yaml --project="$PROJECT_ID"

echo "🎉 Deployment complete! Your Skunkworks API is live."

