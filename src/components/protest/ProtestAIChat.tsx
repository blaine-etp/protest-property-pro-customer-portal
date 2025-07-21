import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Lightbulb, FileText, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface ProtestAIChatProps {
  protestId: string;
  protestData?: any;
}

export function ProtestAIChat({ protestId, protestData }: ProtestAIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatHistory();
  }, [protestId]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      // For now, using mock data until types are updated
      setMessages([]);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setLoading(true);

    try {
      // For now, add mock messages to the local state
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString()
      };

      const aiResponse = `I understand you're asking about: "${userMessage}". As an AI assistant for property tax protests, I can help analyze evidence, suggest strategies, and provide guidance. Based on the protest data, I notice this is for ${protestData?.situs_address || 'the property'} with an assessed value of ${protestData?.assessed_value ? `$${protestData.assessed_value.toLocaleString()}` : 'unknown'}. How can I specifically assist with this protest?`;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMsg, aiMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    {
      icon: <Lightbulb className="h-4 w-4" />,
      text: "Analyze evidence strength",
      prompt: "Please analyze the strength of evidence for this protest and suggest improvements."
    },
    {
      icon: <FileText className="h-4 w-4" />,
      text: "Draft response letter",
      prompt: "Help me draft a response letter to the appraisal district for this protest."
    },
    {
      icon: <Calculator className="h-4 w-4" />,
      text: "Value analysis",
      prompt: "Provide a comparative market analysis for this property's assessed value."
    }
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-96 flex flex-col">
        {/* Quick Prompts */}
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt(prompt.prompt)}
                className="flex items-center gap-1"
              >
                {prompt.icon}
                {prompt.text}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Start a conversation to get AI assistance with this protest.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about this protest..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading || !inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}