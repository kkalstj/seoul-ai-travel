'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw } from 'lucide-react';
import ChatMessage from './ChatMessage';
import QuickPrompts from './QuickPrompts';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  var { t, locale } = useLanguage();
  var [messages, setMessages] = useState<Message[]>([]);
  var [input, setInput] = useState('');
  var [loading, setLoading] = useState(false);
  var messagesEndRef = useRef<HTMLDivElement>(null);
  var inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(function() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(function() {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    var userMessage: Message = { role: 'user', content: text.trim() };
    var newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      var response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages,
          locale: locale,
        }),
      });

      if (!response.ok) {
        var errorData = await response.json();
        throw new Error(errorData.error || t('ai.error'));
      }

      var data = await response.json();

      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.response },
      ]);
    } catch (error: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: t('ai.errorMessage') + error.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleQuickPrompt(prompt: string) {
    sendMessage(prompt);
  }

  function resetChat() {
    setMessages([]);
    setInput('');
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗼</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('ai.title')}
              </h2>
              <p className="text-gray-500">
                {t('ai.subtitle')}
              </p>
            </div>

            <QuickPrompts onSelect={handleQuickPrompt} />
          </div>
        ) : (
          <>
            {messages.map(function(msg, i) {
              return <ChatMessage key={i} role={msg.role} content={msg.content} />;
            })}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <<div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">{t('ai.loading')}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-gray-100 bg-white px-4 py-3">
        {messages.length > 0 && (
          <div className="flex justify-center mb-2">
            <button
              onClick={resetChat}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              {t('ai.newChat')}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={function(e) { setInput(e.target.value); }}
            onKeyDown={handleKeyDown}
            placeholder={t('ai.placeholder')}
            rows={1}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}


