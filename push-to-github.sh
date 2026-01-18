#!/bin/bash
# Git commands to push all changes to GitHub

echo "📋 Checking git status..."
git status

echo ""
echo "➕ Adding all changes..."
git add .

echo ""
echo "💾 Committing changes..."
git commit -m "Fix: Lazy initialize Groq client for Vercel build, rebrand to Resly

- Changed Groq client initialization from module-level to lazy loading
- Prevents build-time errors when GROQ_API_KEY is not available  
- Rebranded app name from Centa to Resly across all files
- Updated package.json, README, and UI components"

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! All changes have been pushed to GitHub."

