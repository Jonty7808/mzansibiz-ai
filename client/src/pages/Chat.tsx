import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { HudPanel } from '@/components/HudPanel';
import { Send, Trash2, Globe } from 'lucide-react';
import { toast } from 'sonner';

type Language = 'en' | 'zu' | 'xh' | 'af';
type Topic = 'sars_tax' | 'ccma_labour' | 'general_business' | 'document_help';

const LANGUAGES = {
  en: 'English',
  zu: 'isiZulu',
  xh: 'isiXhosa',
  af: 'Afrikaans',
};

const TOPICS = {
  sars_tax: 'SARS Tax Questions',
  ccma_labour: 'CCMA Labour Law',
  general_business: 'General Business',
  document_help: 'Document Help',
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [topic, setTopic] = useState<Topic>('general_business');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.ai.chat.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <p className="text-text-secondary">Please sign in to use the AI chat.</p>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error('Please enter a message');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Math.random().toString(36),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatMutation.mutateAsync({
        message: input,
        language,
        topic,
      });

      const assistantMessage: Message = {
        id: Math.random().toString(36),
        role: 'assistant',
        content: typeof response.response === 'string' ? response.response : JSON.stringify(response.response),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to get response');
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([]);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-glow-dual mb-2">AI Business Consultant</h1>
          <p className="text-text-secondary">Ask questions about SARS tax, CCMA labour law, and more</p>
        </div>

        {/* Settings Panel */}
        <HudPanel title="Chat Settings" className="mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neon-cyan mb-2">
                <Globe className="inline w-4 h-4 mr-2" />
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="input-neon w-full px-4 py-2 rounded-sm"
              >
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neon-cyan mb-2">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as Topic)}
                className="input-neon w-full px-4 py-2 rounded-sm"
              >
                {Object.entries(TOPICS).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </HudPanel>

        {/* Chat Area */}
        <HudPanel title="Conversation" className="mb-8 flex flex-col h-96">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-text-secondary">
                <p>Start a conversation by asking a question...</p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-sm ${
                        message.role === 'user'
                          ? 'bg-neon-pink/20 border border-neon-pink text-text-primary'
                          : 'bg-neon-cyan/20 border border-neon-cyan text-text-primary'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-text-tertiary mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <NeonInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1"
            />
            <NeonButton
              type="submit"
              variant="pink"
              size="md"
              loading={isLoading}
              disabled={isLoading}
            >
              <Send className="w-4 h-4" />
            </NeonButton>
          </form>
        </HudPanel>

        {/* Actions */}
        <div className="flex justify-end">
          <NeonButton
            variant="cyan"
            size="sm"
            onClick={handleClearChat}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
