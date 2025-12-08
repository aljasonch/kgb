#!/usr/bin/env bash
set -e

cd _kgb

mkdir -p .vercel

cat > .vercel/project.json <<EOF
{
  "projectId": "$PROJECT_ID",
  "orgId": "$ORG_ID"
}
EOF

echo "Created .vercel/project.json:"
cat .vercel/project.json

echo "Running fix-react2shell-next..."
npx --yes fix-react2shell-next

npm install -g vercel@latest

echo "Using Vercel project: $PROJECT_ID"
vercel pull --yes --environment=production --token "$VERCEL_TOKEN"

vercel build --prod --token "$VERCEL_TOKEN"
vercel deploy --prebuilt --prod --token "$VERCEL_TOKEN"
