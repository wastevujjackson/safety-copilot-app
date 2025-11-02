'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { COSHHChat } from '@/components/agents/COSHHChat';

interface AgentOutput {
  id: string;
  title: string;
  created_at: string;
  output_data: any;
}

type TabType = 'create' | 'search' | 'review';

const AGENT_INFO: Record<string, { name: string; icon: string; description: string }> = {
  'coshh-generator': {
    name: 'COSHH Generator Agent',
    icon: '🧪',
    description: 'Generate comprehensive COSHH assessments and chemical safety documentation',
  },
};

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params?.agentId as string;
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [outputs, setOutputs] = useState<AgentOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<AgentOutput | null>(null);

  const agentInfo = AGENT_INFO[agentId];

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

  if (!agentInfo) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Agent not found</h1>
      </div>
    );
  }

  // Filter assessments for search
  const filteredAssessments = outputs.filter((output) =>
    output.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get assessments due for review (created more than 11 months ago)
  const assessmentsDueForReview = outputs.filter((output) => {
    const createdDate = new Date(output.created_at);
    const monthsOld = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsOld >= 11;
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Agent Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-5xl">{agentInfo.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{agentInfo.name}</h1>
            <p className="mt-1 text-gray-600">{agentInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('create');
              setShowChat(false);
              setSelectedAssessment(null);
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Create Assessment
          </button>
          <button
            onClick={() => {
              setActiveTab('search');
              setShowChat(false);
              setSelectedAssessment(null);
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'search'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Search Assessments
          </button>
          <button
            onClick={() => {
              setActiveTab('review');
              setShowChat(false);
              setSelectedAssessment(null);
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
              activeTab === 'review'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Review Assessments
            {assessmentsDueForReview.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {assessmentsDueForReview.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'create' && !showChat && (
          <CreateTab onStartChat={() => setShowChat(true)} />
        )}

        {activeTab === 'create' && showChat && (
          <div className="h-full">
            <COSHHChat
              agentId={agentId}
              onComplete={() => {
                fetchOutputs();
                setShowChat(false);
              }}
            />
          </div>
        )}

        {activeTab === 'search' && (
          <SearchTab
            outputs={filteredAssessments}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onDownload={(assessment) => {
              console.log('Download:', assessment.id);
              // TODO: Implement download
            }}
          />
        )}

        {activeTab === 'review' && (
          <ReviewTab
            assessments={assessmentsDueForReview}
            loading={loading}
            onReview={(assessment) => {
              setSelectedAssessment(assessment);
              // TODO: Open chat for review
            }}
          />
        )}
      </div>
    </div>
  );
}

// Create Tab Component
function CreateTab({ onStartChat }: { onStartChat: () => void }) {
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
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
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

    // Start chat with file
    onStartChat();
    // TODO: Pass file to chat
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
        >
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Upload Safety Data Sheet (SDS)
          </h3>
          <p className="text-gray-600 mb-6">
            Drag and drop your SDS file here, or click to browse
          </p>

          <input
            type="file"
            id="sds-upload"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />

          <label
            htmlFor="sds-upload"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer font-medium transition-colors"
          >
            Browse Files
          </label>

          <p className="text-xs text-gray-500 mt-4">
            Supported formats: PDF, JPG, PNG (max 10MB)
          </p>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
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

// Search Tab Component
function SearchTab({
  outputs,
  loading,
  searchQuery,
  onSearchChange,
  onDownload,
}: {
  outputs: AgentOutput[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onDownload: (assessment: AgentOutput) => void;
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search assessments by chemical name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : outputs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No assessments found' : 'No assessments yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Create your first assessment to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outputs.map((output) => (
              <Card key={output.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{output.title}</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Created: {new Date(output.created_at).toLocaleDateString('en-GB')}
                  </p>
                  <button
                    onClick={() => onDownload(output)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                  >
                    Download PDF
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Review Tab Component
function ReviewTab({
  assessments,
  loading,
  onReview,
}: {
  assessments: AgentOutput[];
  loading: boolean;
  onReview: (assessment: AgentOutput) => void;
}) {
  return (
    <div className="h-full overflow-y-auto">
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            All assessments up to date
          </h3>
          <p className="text-gray-600">
            No assessments require review at this time
          </p>
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
                <p className="text-sm text-yellow-800">
                  COSHH assessments should be reviewed annually or when circumstances change
                </p>
              </div>
            </div>
          </div>

          {assessments.map((assessment) => {
            const monthsOld = Math.floor(
              (Date.now() - new Date(assessment.created_at).getTime()) /
                (1000 * 60 * 60 * 24 * 30)
            );

            return (
              <Card key={assessment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {assessment.title}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">
                        Created: {new Date(assessment.created_at).toLocaleDateString('en-GB')}
                      </p>
                      <p className="text-sm text-yellow-700 font-medium">
                        {monthsOld} months old - Review required
                      </p>
                    </div>
                    <button
                      onClick={() => onReview(assessment)}
                      className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium transition-colors"
                    >
                      Review Now
                    </button>
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
