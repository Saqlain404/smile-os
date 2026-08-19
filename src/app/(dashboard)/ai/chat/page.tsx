import { PageHeader } from "@/components/layout/page-header";
import { AIChatbot } from "@/components/ai/ai-chatbot";

export default function AIChatPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Chat Assistant"
        description="Ask questions about your dental practice"
      />
      <AIChatbot />
    </div>
  );
}
