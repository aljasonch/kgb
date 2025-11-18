set -e

cd "$(System.DefaultWorkingDirectory)/_kgb"

mkdir -p .vercel

cat > .vercel/project.json <<EOF
{
  "projectId": "$PROJECT_ID",
  "orgId": "$ORG_ID"
}
EOF

echo "Created .vercel/project.json:"
cat .vercel/project.json

npm install -g vercel@latest

echo "Using Vercel project: $PROJECT_ID"
vercel pull --yes --environment=production --token "$VERCEL_TOKEN"

vercel build --prod --token "$VERCEL_TOKEN"
vercel deploy --prebuilt --prod --token "$VERCEL_TOKEN"
