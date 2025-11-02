'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { COSHHChat } from '@/components/agents/COSHHChat';
import { COSHHFormPreview, type COSHHFormData } from '@/components/agents/COSHHFormPreview';

interface AgentOutput {
  id: string;
  title: string;
  created_at: string;
  output_data: any;
}

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
  const [outputs, setOutputs] = useState<AgentOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createMode, setCreateMode] = useState(false);
  const [formData, setFormData] = useState<COSHHFormData>({});

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

  // Filter assessments by search query
  const filteredOutputs = outputs.filter((output) =>
    output.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate review status for each assessment
  const getReviewStatus = (createdAt: string) => {
    const created = new Date(createdAt);
    const monthsOld = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsOld >= 12) {
      return { status: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (monthsOld >= 11) {
      return { status: 'due-soon', label: 'Due Soon', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    }
    return null;
  };

  // Count assessments needing review
  const reviewCount = outputs.filter((output) => {
    const monthsOld = (Date.now() - new Date(output.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsOld >= 11;
  }).length;

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

      {/* Split Layout: Assessments/Preview on Left (60%), Chat on Right (40%) */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Previous Assessments / Form Preview Column - 60% */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ flexBasis: '60%' }}>
          {createMode ? (
            <COSHHFormPreview data={formData} />
          ) : (
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader
                title={
                  <div className="flex items-center justify-between">
                    <span>Previous Assessments</span>
                    {reviewCount > 0 && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        {reviewCount} due for review
                      </span>
                    )}
                  </div>
                }
              />
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                {/* Search Bar */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search assessments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Assessments List */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : filteredOutputs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-3">
                        {searchQuery ? '🔍' : agentInfo.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {searchQuery ? 'No assessments found' : 'No assessments yet'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {searchQuery
                          ? 'Try adjusting your search'
                          : 'Use the chat to create your first assessment'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredOutputs.map((output) => {
                        const reviewStatus = getReviewStatus(output.created_at);
                        return (
                          <div
                            key={output.id}
                            className={`p-3 border rounded-lg hover:shadow-sm transition-all cursor-pointer ${
                              reviewStatus
                                ? `${reviewStatus.color} border`
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              console.log('Load assessment:', output.id);
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900 text-sm flex-1">
                                {output.title}
                              </h4>
                              {reviewStatus && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap">
                                  {reviewStatus.label}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(output.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chat Column - 40% */}
        <div className="flex flex-col overflow-hidden" style={{ flexBasis: '40%' }}>
          {agentId === 'coshh-generator' ? (
            <COSHHChat
              agentId={agentId}
              onComplete={() => {
                setCreateMode(false);
                setFormData({});
                fetchOutputs();
              }}
              onModeChange={(mode) => {
                if (mode === 'create') {
                  setCreateMode(true);
                  // Set initial empty state to show the preview structure
                  setFormData({
                    title: '',
                    assessmentReference: '',
                    date: new Date().toISOString(),
                    hazardousSubstances: []
                  });
                } else {
                  setCreateMode(false);
                }
              }}
              onDataUpdate={(data) => {
                console.log('[AgentPage] Updating form data:', data);
                setFormData(data);
              }}
            />
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl mb-4">{agentInfo.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    This agent's interface is under development.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
