'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui';

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

interface AgentOutput {
  id: string;
  title: string;
  created_at: string;
  output_data: any;
}

type TabType = 'create' | 'search' | 'review';

interface COSHHChatWithTabsProps {
  agentId: string;
  onComplete?: (assessmentId: string) => void;
}

export function COSHHChatWithTabs({ agentId, onComplete }: COSHHChatWithTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [outputs, setOutputs] = useState<AgentOutput[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchOutputs();
  }, [agentId]);

  const fetchOutputs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/agents/${agentId}/outputs`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setOutputs(data.outputs || []);
      }
    } catch (error) {
      console.error('Failed to fetch outputs:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF or image file (JPG, PNG)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setShowChat(true);
      handleSendMessage(file);
    }
  };

  const handleSendMessage = async (file?: File) => {
    const messageFile = file || selectedFile;
    if (!input.trim() && !messageFile) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input || 'Uploaded SDS document',
      timestamp: new Date(),
      fileAttachment: messageFile
        ? {
            name: messageFile.name,
            type: messageFile.type,
            size: messageFile.size,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', input);
      formData.append('messages', JSON.stringify(messages));
      if (messageFile) {
        formData.append('file', messageFile);
      }

      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.complete && data.assessmentId) {
        fetchOutputs();
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
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter and calculate review assessments
  const filteredAssessments = outputs.filter((output) =>
    output.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const assessmentsDueForReview = outputs.filter((output) => {
    const createdDate = new Date(output.created_at);
    const monthsOld = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsOld >= 11;
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Tab Buttons */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setActiveTab('create');
              setShowChat(false);
              setMessages([]);
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Create Assessment
          </button>
          <button
            onClick={() => {
              setActiveTab('search');
              setShowChat(false);
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => {
              setActiveTab('review');
              setShowChat(false);
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors relative ${
              activeTab === 'review'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Review
            {assessmentsDueForReview.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {assessmentsDueForReview.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {/* CREATE TAB */}
        {activeTab === 'create' && !showChat && <CreateTabContent onFileSelect={handleFileSelect} fileInputRef={fileInputRef} />}

        {/* CREATE TAB - CHAT MODE */}
        {activeTab === 'create' && showChat && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.fileAttachment && (
                      <div className="mb-2 pb-2 border-b border-gray-300">
                        <div className="flex items-center space-x-2 text-sm">
                          <span>📎</span>
                          <span className="font-medium">{message.fileAttachment.name}</span>
                        </div>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
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
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <Button onClick={() => handleSendMessage()} disabled={isLoading || !input.trim()}>
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH TAB */}
        {activeTab === 'search' && <SearchTabContent outputs={filteredAssessments} loading={loading} searchQuery={searchQuery} onSearchChange={setSearchQuery} />}

        {/* REVIEW TAB */}
        {activeTab === 'review' && <ReviewTabContent assessments={assessmentsDueForReview} loading={loading} />}
      </div>
    </div>
  );
}

// Create Tab Content
function CreateTabContent({ onFileSelect, fileInputRef }: { onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void; fileInputRef: React.RefObject<HTMLInputElement> }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      fileInputRef.current.files = dataTransfer.files;
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
        >
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Safety Data Sheet (SDS)</h3>
          <p className="text-gray-600 mb-6">Drag and drop your SDS file here, or click to browse</p>

          <input type="file" ref={fileInputRef} accept=".pdf,.jpg,.jpeg,.png" onChange={onFileSelect} className="hidden" id="sds-upload-main" />

          <label htmlFor="sds-upload-main" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer font-medium transition-colors">
            Browse Files
          </label>

          <p className="text-xs text-gray-500 mt-4">Supported formats: PDF, JPG, PNG (max 10MB)</p>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• AI extracts chemical information from your SDS</li>
            <li>• You'll confirm the extracted data</li>
            <li>• Answer questions about usage and environment</li>
            <li>• Review suggested control measures</li>
            <li>• Generate your complete COSHH assessment</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Search Tab Content
function SearchTabContent({ outputs, loading, searchQuery, onSearchChange }: { outputs: AgentOutput[]; loading: boolean; searchQuery: string; onSearchChange: (query: string) => void }) {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search assessments by chemical name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : outputs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{searchQuery ? 'No assessments found' : 'No assessments yet'}</h3>
            <p className="text-gray-600">{searchQuery ? 'Try adjusting your search' : 'Create your first assessment to get started'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outputs.map((output) => (
              <Card key={output.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{output.title}</h4>
                  <p className="text-xs text-gray-500 mb-4">Created: {new Date(output.created_at).toLocaleDateString('en-GB')}</p>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">Download PDF</button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Review Tab Content
function ReviewTabContent({ assessments, loading }: { assessments: AgentOutput[]; loading: boolean }) {
  return (
    <div className="h-full overflow-y-auto p-6">
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All assessments up to date</h3>
          <p className="text-gray-600">No assessments require review at this time</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">
                  {assessments.length} assessment{assessments.length > 1 ? 's' : ''} due for review
                </h4>
                <p className="text-sm text-yellow-800">COSHH assessments should be reviewed annually or when circumstances change</p>
              </div>
            </div>
          </div>

          {assessments.map((assessment) => {
            const monthsOld = Math.floor((Date.now() - new Date(assessment.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30));

            return (
              <Card key={assessment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{assessment.title}</h4>
                      <p className="text-xs text-gray-500 mb-2">Created: {new Date(assessment.created_at).toLocaleDateString('en-GB')}</p>
                      <p className="text-sm text-yellow-700 font-medium">{monthsOld} months old - Review required</p>
                    </div>
                    <button className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium transition-colors">Review Now</button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
