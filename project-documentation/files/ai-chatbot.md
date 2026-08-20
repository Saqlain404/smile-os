# File: src/components/ai/ai-chatbot.tsx

**Path:** `src/components/ai/ai-chatbot.tsx`
**Purpose:** Conversational AI chatbot interface

## What It Does
Renders a chat UI for conversing with the AI assistant. Manages conversations (create, switch), sends messages, displays response history with role indicators (user/assistant).

## Features
- **Conversation management:** Create new conversation, switch between conversations
- **Message history:** Scrollable list with role indicators
- **Message input:** Text input with send button
- **Auto-scroll:** Scrolls to bottom on new messages
- **Loading states:** Shows typing indicator while AI responds
- **Empty state:** Welcome message when no conversations exist

## State
- `conversations` — List of user's conversations
- `activeConversationId` — Currently selected conversation
- `messages` — Messages in active conversation
- `inputValue` — Current input text
- `isLoading` — Whether AI is generating response

## Server Actions Used
- `createAIConversation()` — Start new chat
- `getAIConversations()` — List conversations
- `getAIConversation(id)` — Get conversation with messages
- `sendAIMessage(conversationId, content)` — Send message and get response

## Known Limitation
AI responses are simulated (pattern-based). No actual LLM integration.

## Related Files
- `src/server/actions/ai.ts` — Server actions
- `src/app/(dashboard)/ai/chat/page.tsx` — Page wrapper
- `src/app/(dashboard)/ai/page.tsx` — AI Dashboard
