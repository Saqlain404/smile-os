"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  User,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  createAIConversation,
  getAIConversations,
  getAIConversation,
  sendAIMessage,
} from "@/server/actions/ai";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export function AIChatbot() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    const convs = await getAIConversations("user");
    setConversations(convs as Conversation[]);
  }

  async function loadConversation(id: string) {
    setActiveConversation(id);
    const conv = await getAIConversation(id);
    if (conv) {
      setMessages(conv.messages as Message[]);
    }
  }

  async function startNewConversation() {
    const conv = await createAIConversation("user", "New Chat");
    setConversations((prev) => [{ ...conv, messages: [] } as Conversation, ...prev]);
    setActiveConversation(conv.id);
    setMessages([]);
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input,
      createdAt: new Date(),
    };

    let convId = activeConversation;

    if (!convId) {
      const conv = await createAIConversation("user", input.slice(0, 50));
      convId = conv.id;
      setActiveConversation(convId);
      setConversations((prev) => [
        { ...conv, messages: [] } as Conversation,
        ...prev,
      ]);
    }

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const { userMessage, assistantMessage } = await sendAIMessage(
        convId!,
        currentInput
      );

      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== userMsg.id);
        return [...withoutTemp, userMessage as Message, assistantMessage as Message];
      });

      loadConversations();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
    }
  }

  function formatMessage(content: string) {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>")
      .replace(/^- (.*)/gm, '<span class="ml-2">• $1</span>');
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border bg-card">
      {/* Conversations sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col border-r bg-muted/30 overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 border-b">
              <span className="text-sm font-medium">Chats</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={startNewConversation}
                className="h-7 w-7 p-0"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b border-border/50",
                    activeConversation === conv.id && "bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                </button>
              ))}
              {conversations.length === 0 && (
                <p className="p-4 text-xs text-muted-foreground text-center">
                  No conversations yet
                </p>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSidebar(!showSidebar)}
            className="h-7 w-7 p-0"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  SmileOS AI Assistant
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Ask me about your practice — patients, revenue, schedule,
                  treatments, or anything else.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {[
                  "How many patients do we have?",
                  "What's our revenue?",
                  "Show today's schedule",
                  "What's our no-show rate?",
                  "List available treatments",
                  "What can you do?",
                ].map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setInput(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(msg.content),
                    }}
                  />
                </div>
                {msg.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="rounded-xl bg-muted px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your practice..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" size="sm" disabled={!input.trim() || loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
