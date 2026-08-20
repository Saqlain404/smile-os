# Feature: AI Assistant

## Overview
AI-powered features including insights, diagnosis suggestions, treatment planning, schedule optimization, and a conversational chatbot. Currently simulated (pattern-based, no LLM).

## Files
- `src/server/actions/ai.ts` — 13 server actions
- `src/components/ai/ai-chatbot.tsx` — Chat UI
- `src/components/ai/ai-insights-panel.tsx` — Insights list
- `src/components/ai/ai-diagnosis-panel.tsx` — Diagnosis suggestions
- `src/components/ai/ai-treatment-plan-panel.tsx` — Treatment planning
- `src/components/ai/ai-schedule-panel.tsx` — Schedule optimization
- `src/app/(dashboard)/ai/page.tsx` — AI Dashboard
- `src/app/(dashboard)/ai/chat/page.tsx` — AI Chat page

## Database Models

### AIConversation
- id, userId, title, timestamps
- Has many AIMessage

### AIMessage
- id, conversationId, role (user/assistant), content, timestamp

### AIInsight
- id, clinicId, type, severity, title, description
- entityId, entityType, metadata (JSON)
- isRead, isDismissed

## Insight Types
DIAGNOSIS, TREATMENT, RISK, PREDICTION, OPTIMIZATION, REVENUE

## Insight Severities
LOW, MEDIUM, HIGH, CRITICAL

## Server Actions
| Action | Purpose |
|--------|---------|
| `getAIInsights` | List insights with filters |
| `generateInsights` | Generate sample insights |
| `markInsightRead` | Mark insight as read |
| `dismissInsight` | Dismiss insight |
| `getAIDiagnosisSuggestions` | Get diagnosis from symptoms |
| `getAITreatmentPlan` | Generate treatment plan |
| `getAIScheduleOptimization` | Analyze schedule patterns |
| `createAIConversation` | Start new chat |
| `getAIConversations` | List conversations |
| `getAIConversation` | Get conversation with messages |
| `sendAIMessage` | Send message and get response |
| `generateAIResponse` | Generate simulated AI response |
| `getAIGlobalStats` | AI usage statistics |

## AI Chat Features
- Conversation management (new, switch)
- Message history with role indicators (user/assistant)
- Simulated AI responses (pattern-based)
- Auto-generated conversation titles

## AI Dashboard Features
- Stats cards (total insights, unread, conversations)
- Tabbed sections: Overview, Diagnosis, Treatment, Schedule
- Insights panel with type/severity filters
- Mark as read, dismiss actions

## Diagnosis Panel
- Enter symptoms (text input)
- Get diagnosis suggestions with confidence scores
- Based on symptom keywords matching

## Treatment Plan Panel
- Select patient
- Generate treatment plan with phases
- Cost estimates per phase
- Duration estimates

## Schedule Panel
- Analyze appointment patterns
- Suggest optimizations (reducing gaps, balancing load)
- Show current vs optimized schedule

## Known Gaps
- **Simulated AI** — No actual LLM integration
- No real diagnosis capability
- No streaming responses
- No cost tracking
- No AI response caching
- No patient data context for AI
