'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  fileAttachment?: {
    name: string;
    type: string;
    size: number;
  };
}

interface COSHHChatProps {
  agentId: string;
  onComplete?: (assessmentId: string) => void;
  onModeChange?: (mode: 'menu' | 'create' | 'search' | 'review') => void;
  onDataUpdate?: (data: any) => void;
}

export function COSHHChat({ agentId, onComplete, onModeChange, onDataUpdate }: COSHHChatProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'search' | 'review'>('menu');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your COSHH Assessment Assistant.

What would you like to do today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF or image file (JPG, PNG)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedFile) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input || (selectedFile ? `Uploaded ${selectedFile.name}` : ''),
      timestamp: new Date(),
      fileAttachment: selectedFile
        ? {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    const fileToSend = selectedFile;
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsLoading(true);

    try {
      // Send message to API
      const formData = new FormData();
      formData.append('message', input);
      formData.append('messages', JSON.stringify(messages));
      if (fileToSend) {
        formData.append('file', fileToSend);
      }

      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[COSHHChat] API error:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update form data if workflow data is returned
      if (data.workflowData) {
        console.log('[COSHHChat] Received workflow data:', data.workflowData);
        onDataUpdate?.(data.workflowData);
      } else {
        console.log('[COSHHChat] No workflow data in response');
      }

      // Check if assessment is complete
      if (data.complete && data.assessmentId) {
        onComplete?.(data.assessmentId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          COSHH Assessment Chat
        </h3>
        <p className="text-sm text-gray-600">
          Answer questions to generate your assessment
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.fileAttachment && (
                <div className="mb-2 pb-2 border-b border-gray-300">
                  <div className="flex items-center space-x-2 text-sm">
                    <span>📎</span>
                    <span className="font-medium">
                      {message.fileAttachment.name}
                    </span>
                    <span className="text-xs opacity-75">
                      ({Math.round(message.fileAttachment.size / 1024)} KB)
                    </span>
                  </div>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        {/* Option Buttons - Show only in menu mode */}
        {mode === 'menu' && messages.length === 1 && (
          <div className="flex flex-col gap-2 px-6">
            <button
              onClick={() => {
                setMode('create');
                onModeChange?.('create');
                const msg: ChatMessage = {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: 'Great! Let\'s create a new COSHH assessment. Please upload the Safety Data Sheet (SDS) for the chemical substance you\'re assessing.\n\nI\'ll extract the key information automatically from the document. You can upload a PDF or image file (JPG, PNG) using the 📎 button below.',
                  timestamp: new Date(),
                };
                setMessages([...messages, msg]);
              }}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors text-left"
            >
              Create New Assessment
            </button>

            <button
              onClick={() => {
                setMode('search');
                onModeChange?.('search');
                const msg: ChatMessage = {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: 'Use the search box in the Previous Assessments panel on the left to find specific assessments by chemical name.',
                  timestamp: new Date(),
                };
                setMessages([...messages, msg]);
              }}
              className="w-full px-3 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors text-left"
            >
              Search Assessments
            </button>

            <button
              onClick={() => {
                setMode('review');
                onModeChange?.('review');
                const msg: ChatMessage = {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: 'Check the Previous Assessments panel on the left. Assessments due for review (11+ months old) will be highlighted in yellow.',
                  timestamp: new Date(),
                };
                setMessages([...messages, msg]);
              }}
              className="w-full px-3 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors text-left"
            >
              Review Assessments
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200">
        {selectedFile && (
          <div className="mb-3 flex items-center justify-between px-3 py-2 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-blue-900">
              <span>📎</span>
              <span>{selectedFile.name}</span>
              <span className="text-xs text-blue-600">
                ({Math.round(selectedFile.size / 1024)} KB)
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            📎
          </Button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            rows={1}
            className="flex-1 px-4 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <Button
            onClick={handleSendMessage}
            disabled={isLoading || (!input.trim() && !selectedFile)}
          >
            Send
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
