# AI Layer Documentation

## Overview

The AI layer is a deterministic, production-safe inference engine built on Groq LLM. It's designed to feel instant, reliable, insightful, and calm—not a chatbot, but a structured analysis engine.

## Architecture

### Model Configuration
- **Model**: `llama-3.1-70b-versatile` (fast, JSON-optimized)
- **Temperature**: `0.1` (very low for deterministic outputs)
- **Max Tokens**: `2000` (focused, fast responses)
- **Response Format**: `json_object` (strict JSON enforcement)

### Core Principles

1. **Deterministic Outputs**: Low temperature, strict schema validation
2. **JSON Only**: No markdown, no explanations, just structured data
3. **Automatic Retries**: Up to 3 retries on malformed JSON
4. **Streaming Support**: Partial JSON chunks for real-time updates
5. **Schema Validation**: Zod validation with robustness checks

## Output Schema

```typescript
{
  match_score: number;           // 0-100 integer
  missing_skills: string[];      // Required skills not in resume
  ats_score: number;             // 0-100 integer
  keyword_analysis: {
    present: string[];            // Keywords found in resume
    missing: string[];            // Keywords missing from resume
  };
  resume_strengths: string[];     // What makes resume strong
  improvements: string[];         // Prioritized, actionable improvements
  role_fit_summary: string;      // 50-500 character summary
}
```

## System Prompt

The system prompt enforces:
- **JSON only** - No markdown, no code blocks
- **Exact keys** - Must match schema exactly
- **Conservative scoring** - Realistic, not optimistic
- **Specific feedback** - Concrete, actionable insights

## Retry Logic

The system automatically retries on:
1. **JSON Parse Errors**: Invalid JSON structure
2. **Schema Validation Errors**: Missing or incorrect fields
3. **Bounded Retries**: Maximum 3 attempts to prevent infinite loops

## Streaming

Streaming provides real-time updates:
1. **Partial JSON Parsing**: Extracts values from incomplete JSON
2. **Incremental Updates**: Only yields when new data is available
3. **Final Validation**: Complete result validated before completion

## Error Handling

### Malformed JSON
- Automatic retry (up to 3 times)
- JSON cleaning (removes markdown code blocks)
- Fallback error messages

### Schema Validation
- Detailed error messages with field paths
- Automatic retry on validation failures
- Robustness checks for edge cases

## Performance

### Latency Targets
- **Non-streaming**: < 3 seconds
- **Streaming**: First chunk < 1 second
- **Total**: < 5 seconds for complete analysis

### Token Usage
- **Average**: ~1500 tokens per analysis
- **Max**: ~2000 tokens (enforced)
- **Logged**: All token usage tracked

## Quality Assurance

### Schema Robustness Checks
- Score ranges (0-100)
- Array type validation
- String length validation
- Required field presence

### Output Quality
- **Conservative Scoring**: Prevents overconfidence
- **Specific Skills**: No vague skill names
- **Actionable Improvements**: Concrete, prioritized
- **Professional Tone**: Calm, helpful language

## Frontend Integration

The AI layer outputs the new deterministic schema, which is automatically converted to the legacy frontend format via `schema-adapter.ts`. This ensures:
- Backward compatibility
- Type safety
- Consistent data structure

## Monitoring

All AI calls are logged with:
- Token usage
- Latency
- Success/failure status
- Retry counts
- Error messages

Query usage logs:
```sql
SELECT * FROM usage_logs 
WHERE endpoint = '/api/analyze' 
ORDER BY created_at DESC;
```

## Future Improvements

- [ ] Model selection based on complexity
- [ ] Caching for repeated analyses
- [ ] Batch processing support
- [ ] Custom model fine-tuning
- [ ] A/B testing different prompts
- [ ] Real-time quality scoring

