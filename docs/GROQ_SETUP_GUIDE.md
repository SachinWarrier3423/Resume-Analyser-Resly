# Complete Groq Setup Guide for Resly

## Step 1: Get Your Groq API Key

1. **Go to Groq Website**: https://console.groq.com
2. **Sign up or Log in**:
   - Click "Sign Up" if you don't have an account
   - Use your email or GitHub account
   - Verify your email if needed

3. **Get API Key**:
   - After logging in, go to: https://console.groq.com/keys
   - Click "Create API Key"
   - Give it a name (e.g., "Resly Production")
   - **Copy the key immediately** - you won't see it again!
   - Store it safely (we'll add it to `.env.local` next)

## Step 2: Add API Key to Your Project

### For Local Development:

1. **Open `.env.local` file** in your project root
2. **Add the Groq API key**:
   ```bash
   GROQ_API_KEY=your_actual_api_key_here
   ```
   Replace `your_actual_api_key_here` with the key you copied from Groq

3. **Save the file**

### For Vercel Deployment:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add new variable**:
   - **Name**: `GROQ_API_KEY`
   - **Value**: Your Groq API key
   - **Environments**: Select all (Production, Preview, Development)
5. **Click "Save"**
6. **Redeploy** your project (or it will auto-redeploy on next push)

## Step 3: Test the Setup

### Test Locally:

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Open your browser**: http://localhost:3000

3. **Test the analyze flow**:
   - Go to `/analyze`
   - Upload a PDF resume
   - Paste a job description
   - Click "Analyze Resume"
   - You should see the progress page working

### Check if it's working:

- ✅ Progress page shows timeline and progress bar
- ✅ Tips rotate during analysis
- ✅ Eventually redirects to `/results` page
- ✅ Results page shows match score, ATS score, skills, etc.

## Step 4: Verify API Key is Working

If you want to test the Groq API directly:

```bash
# Test with curl (optional)
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Say hello"}],
    "model": "llama-3.3-70b-versatile"
  }'
```

## Current Model Configuration

Your app is configured to use:
- **Model**: `llama-3.3-70b-versatile`
- **Temperature**: `0.1` (for deterministic outputs)
- **Max Tokens**: `2000`

This model is:
- ✅ Fast (optimized for speed)
- ✅ Good for structured JSON outputs
- ✅ Currently supported by Groq

## Troubleshooting

### "GROQ_API_KEY environment variable is not set"

**Solution**: Make sure `.env.local` exists and has `GROQ_API_KEY=your_key`

### "Model decommissioned" error

**Solution**: Already fixed! We're using `llama-3.3-70b-versatile` which is current.

### "Streaming analysis failed"

**Possible causes**:
- Invalid API key
- API key not set in Vercel (for deployed version)
- Network issues

**Check**:
- Verify API key in `.env.local` (local) or Vercel dashboard (deployed)
- Check browser console for error messages
- Check Vercel function logs

### Progress page keeps looping

**This is a bug we're fixing!** See the fix below.

## Next Steps

After setting up Groq:
1. ✅ Test locally
2. ✅ Deploy to Vercel with environment variable
3. ✅ Test on deployed version
4. ✅ Monitor API usage in Groq dashboard

## Groq API Limits

- **Free tier**: Usually has rate limits (check Groq dashboard)
- **Cost**: Check current pricing at https://console.groq.com
- **Usage**: Monitor in Groq dashboard → Usage

## Support

- **Groq Documentation**: https://console.groq.com/docs
- **Groq Status**: Check if there are any outages
- **Error Messages**: Check the error response from API for details

