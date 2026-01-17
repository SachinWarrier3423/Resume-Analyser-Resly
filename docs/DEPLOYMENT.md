# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Groq AI
GROQ_API_KEY=your_groq_api_key
```

### 2. Database Setup

1. Open Supabase Dashboard → SQL Editor
2. Run the SQL from `supabase/schema.sql`
3. Verify tables are created:
   - `users`
   - `resumes`
   - `analyses`
   - `usage_logs`
4. Verify RLS policies are enabled

### 3. Build & Test

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm start
```

## Deployment to Render

### Step 1: Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your Git repository

### Step 2: Configure Build Settings

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment**: `Node`

### Step 3: Set Environment Variables

In Render dashboard, add all environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`

### Step 4: Deploy

1. Render will automatically build and deploy
2. Monitor build logs for errors
3. Once deployed, test the application

## Post-Deployment

### 1. Verify API Endpoints

Test the following endpoints:
- `POST /api/analyze` - Should accept file uploads
- `GET /api/history` - Should return empty array (or data if authenticated)

### 2. Monitor Logs

- Check Render logs for errors
- Monitor Supabase logs for database issues
- Check usage_logs table for API activity

### 3. Performance Optimization

- Enable caching for static assets
- Monitor API response times
- Set up error tracking (Sentry, etc.)

## Troubleshooting

### Build Fails

- Check Node.js version (requires 18+)
- Verify all dependencies are in package.json
- Check for TypeScript errors: `npm run build`

### API Errors

- Verify environment variables are set correctly
- Check Supabase connection
- Verify Groq API key is valid
- Check API route logs in Render

### Database Issues

- Verify schema.sql was run successfully
- Check RLS policies are correct
- Verify service role key has proper permissions

## Production Optimizations

### 1. Caching

Add caching headers for static assets in `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

### 2. Rate Limiting

Implement rate limiting for API routes:
- Use Upstash Redis for distributed rate limiting
- Set limits: 100 requests/minute per IP
- Return 429 status on limit exceeded

### 3. Error Monitoring

Set up error tracking:
- Sentry for error tracking
- LogRocket for session replay
- Custom error logging to Supabase

### 4. Performance Monitoring

- Use Vercel Analytics (if on Vercel)
- Set up custom metrics in Render
- Monitor API response times
- Track token usage from Groq

## Security Checklist

- [ ] Environment variables are not exposed in client code
- [ ] Service role key is server-only
- [ ] CORS is properly configured
- [ ] File upload size limits are enforced
- [ ] Input validation on all API routes
- [ ] RLS policies are enabled on all tables
- [ ] API keys are rotated regularly

## Scaling Considerations

### Database

- Monitor Supabase usage limits
- Set up connection pooling if needed
- Archive old analyses if storage grows

### API

- Consider adding Redis for caching
- Implement request queuing for high traffic
- Set up CDN for static assets

### AI Processing

- Monitor Groq API rate limits
- Implement request queuing for AI calls
- Cache common analyses if possible

## Support

For issues:
1. Check application logs in Render
2. Check Supabase logs
3. Review error messages in usage_logs table
4. Check Groq API status

