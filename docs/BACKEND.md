# Backend Documentation

## Architecture

The backend is built with Next.js API Routes, designed to be:
- **Stateless**: No server-side session storage
- **Reliable**: Comprehensive error handling and validation
- **Simple**: Minimal abstractions, clear code flow
- **Secure**: Input validation, RLS policies, API key isolation
- **Observable**: Usage logging for all requests

## API Endpoints

### POST /api/analyze

Analyzes a resume against a job description using AI.

**Request Formats:**

1. **FormData** (file upload):
   - `resume`: PDF file (max 5MB)
   - `jobDescription`: Text string
   - `userId`: Optional UUID string

2. **JSON**:
   ```json
   {
     "resumeText": "string (min 100 chars)",
     "jobDescription": "string (min 50 chars)",
     "userId": "optional UUID"
   }
   ```

**Query Parameters:**
- `stream=true`: Enable streaming response (SSE format)

**Response:**

Non-streaming:
```json
{
  "matchScore": 78,
  "atsScore": 82,
  "skillGaps": [...],
  "keywords": [...],
  "improvements": [...]
}
```

Streaming (SSE):
```
data: {"status": "processing", "message": "Analyzing resume..."}
data: {"status": "progress", "data": {...}}
data: {"status": "complete", "message": "Analysis complete"}
```

**Error Responses:**
- `400`: Validation error
- `500`: Server error
- `502`: AI service error

### GET /api/history

Returns saved analyses for the authenticated user.

**Query Parameters:**
- `userId`: User UUID (required for now, will use JWT in production)
- `limit`: Number of results (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": "uuid",
    "jobTitle": "Software Engineer",
    "company": "Tech Corp",
    "matchScore": 85,
    "atsScore": 88,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

## Database Schema

See `supabase/schema.sql` for complete schema.

**Tables:**
- `users`: User profiles
- `resumes`: Uploaded resumes with parsed text
- `analyses`: Analysis results
- `usage_logs`: API usage observability

**Security:**
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Service role used for server-side operations

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-only)
- `GROQ_API_KEY`: Groq API key for AI analysis

See `.env.example` for template.

## Security Considerations

### File Upload
- Maximum file size: 5MB
- Allowed types: PDF only
- Files are parsed and stored as text (not stored as files in production)

### Rate Limiting
- Basic in-memory rate limiting implemented
- For production, use distributed rate limiting (Upstash Redis, etc.)
- Current limit: 100 requests per minute per identifier

### API Keys
- Groq API key stored in environment variables
- Never exposed to client
- Service role key for Supabase (server-only)

### Input Validation
- All inputs validated with Zod schemas
- File size and type validation
- Text length validation

## Error Handling

All errors are:
1. Caught and formatted consistently
2. Logged to `usage_logs` table
3. Returned with appropriate HTTP status codes

Error response format:
```json
{
  "error": "ErrorType",
  "message": "Human-readable message",
  "code": "ERROR_CODE"
}
```

## Deployment

### Backend (Render)
1. Set environment variables
2. Deploy Next.js app
3. Configure build command: `npm run build`
4. Configure start command: `npm start`

### Database (Supabase)
1. Run `supabase/schema.sql` in Supabase SQL editor
2. Configure RLS policies
3. Set up storage buckets for resume files (future)

## Observability

All API requests are logged to `usage_logs` table with:
- User ID
- Endpoint
- Token usage (for AI calls)
- Latency
- Status code
- Error messages

Query usage logs:
```sql
SELECT * FROM usage_logs 
WHERE endpoint = '/api/analyze' 
ORDER BY created_at DESC 
LIMIT 100;
```

## Future Improvements

- [ ] JWT authentication with Supabase Auth
- [ ] Distributed rate limiting (Redis)
- [ ] Resume file storage in Supabase Storage
- [ ] Retry logic for AI API calls
- [ ] Caching for repeated analyses
- [ ] Webhook support for async processing
- [ ] Batch analysis support

