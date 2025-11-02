'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  monthlyPrice: number;
  tokensPerExecution: number;
  features: string[];
  hired: boolean;
}

export default function AgentsPage() {
  const router = useRouter();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [hiredAgents, setHiredAgents] = useState<string[]>([]);
  const [isHiring, setIsHiring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch hired agents on mount
  useEffect(() => {
    fetchHiredAgents();
  }, []);

  const fetchHiredAgents = async () => {
    try {
      const response = await fetch('/api/agents/hire', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const hiredAgentIds = data.hiredAgents.map((agent: any) => agent.agent_id);
        setHiredAgents(hiredAgentIds);
      }
    } catch (error) {
      console.error('Failed to fetch hired agents:', error);
    }
  };

  const handleHireAgent = async (agent: Agent) => {
    setIsHiring(true);
    setError(null);

    try {
      const response = await fetch('/api/agents/hire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          agentId: agent.id,
          agentName: agent.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to hire agent');
        return;
      }

      // Update hired agents list
      setHiredAgents([...hiredAgents, agent.id]);
      setSelectedAgent(null);

      // Refresh the page to update sidebar
      router.refresh();
    } catch (error) {
      console.error('Failed to hire agent:', error);
      setError('Failed to hire agent. Please try again.');
    } finally {
      setIsHiring(false);
    }
  };

  const agents: Agent[] = [
    {
      id: 'coshh-generator',
      name: 'COSHH Generator Agent',
      description: 'Automatically generate COSHH assessments and chemical safety documentation',
      category: 'Chemical Safety',
      icon: '🧪',
      monthlyPrice: 49,
      tokensPerExecution: 5000,
      features: [
        'Generate COSHH assessments',
        'Chemical hazard identification',
        'Control measure recommendations',
        'SDS analysis and extraction',
      ],
      hired: false,
    },
    {
      id: 'rams-management',
      name: 'RAMS Management Agent',
      description: 'Manage approval & review process for Risk Assessments and Method Statements',
      category: 'Risk Management',
      icon: '📋',
      monthlyPrice: 79,
      tokensPerExecution: 7000,
      features: [
        'Approval workflow automation',
        'Review process management',
        'Version control tracking',
        'Stakeholder notifications',
      ],
      hired: false,
    },
    {
      id: 'risk-assessment-management',
      name: 'Risk Assessment Management Agent',
      description: 'Comprehensive risk assessment lifecycle management and tracking',
      category: 'Risk Management',
      icon: '🛡️',
      monthlyPrice: 69,
      tokensPerExecution: 6000,
      features: [
        'Risk register management',
        'Assessment scheduling',
        'Review reminders',
        'Compliance tracking',
      ],
      hired: false,
    },
    {
      id: 'training-coordination',
      name: 'Training Coordination Agent',
      description: 'Coordinate and manage safety training schedules and compliance',
      category: 'Training',
      icon: '🎓',
      monthlyPrice: 59,
      tokensPerExecution: 4000,
      features: [
        'Training schedule management',
        'Certification tracking',
        'Compliance monitoring',
        'Automated reminders',
      ],
      hired: false,
    },
    {
      id: 'risk-assessment-creator',
      name: 'Risk Assessment Creator Agent',
      description: 'AI-powered creation of comprehensive risk assessments',
      category: 'Risk Management',
      icon: '📊',
      monthlyPrice: 89,
      tokensPerExecution: 8000,
      features: [
        'Intelligent risk identification',
        'Control measure suggestions',
        'Risk scoring automation',
        'Regulatory compliance checks',
      ],
      hired: false,
    },
    {
      id: 'ram-creator',
      name: 'RAM Creator Agent',
      description: 'Create detailed Risk Assessment and Method Statements',
      category: 'Documentation',
      icon: '📝',
      monthlyPrice: 89,
      tokensPerExecution: 8000,
      features: [
        'RAMS document generation',
        'Task-specific method statements',
        'Hazard identification',
        'Safe work procedures',
      ],
      hired: false,
    },
    {
      id: 'manual-handling-creator',
      name: 'Manual Handling Creator Agent',
      description: 'Generate manual handling risk assessments and safe lifting guides',
      category: 'Ergonomics',
      icon: '💪',
      monthlyPrice: 49,
      tokensPerExecution: 4000,
      features: [
        'Manual handling assessments',
        'Lifting technique guidance',
        'Load weight calculations',
        'Injury prevention plans',
      ],
      hired: false,
    },
    {
      id: 'havs-monitoring',
      name: "HAV's Monitoring Agent",
      description: 'Monitor and manage Hand-Arm Vibration Syndrome exposure and compliance',
      category: 'Health Monitoring',
      icon: '⚠️',
      monthlyPrice: 69,
      tokensPerExecution: 5000,
      features: [
        'Exposure time tracking',
        'EAV/ELV compliance alerts',
        'Health surveillance scheduling',
        'Equipment vibration database',
      ],
      hired: false,
    },
    {
      id: 'noise-monitoring',
      name: 'Noise Monitoring Agent',
      description: 'Track workplace noise levels and manage hearing protection compliance',
      category: 'Health Monitoring',
      icon: '🔊',
      monthlyPrice: 69,
      tokensPerExecution: 5000,
      features: [
        'Noise level tracking',
        'LEP,d calculations',
        'Hearing protection recommendations',
        'Audiometry scheduling',
      ],
      hired: false,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Safety Agents</h1>
          <p className="mt-2 text-gray-600">
            Hire specialized AI agents to automate your health & safety tasks
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const isHired = hiredAgents.includes(agent.id);
            return (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader
                title={
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{agent.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{agent.name}</h3>
                    </div>
                  </div>
                }
                subtitle={
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {agent.category}
                    </span>
                  </div>
                }
              />
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {agent.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Monthly Fee:</span>
                    <span className="font-bold text-gray-900">£{agent.monthlyPrice}/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tokens/Use:</span>
                    <span className="font-medium text-gray-700">{agent.tokensPerExecution.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Key Features:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {agent.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    if (isHired) {
                      router.push(`/dashboard/agents/${agent.id}`);
                    } else {
                      setSelectedAgent(agent);
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    isHired
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isHired ? 'Open Agent' : 'Hire Agent'}
                </button>
              </CardContent>
            </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader
            title="How It Works"
            subtitle="Hire agents with a monthly subscription + token usage"
          />
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl mb-2">💳</div>
                <h3 className="font-semibold text-gray-900 mb-1">Monthly Subscription</h3>
                <p className="text-sm text-gray-600">
                  Pay a fixed monthly fee to access each agent
                </p>
              </div>
              <div>
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-1">Token Usage</h3>
                <p className="text-sm text-gray-600">
                  Each execution consumes tokens based on complexity
                </p>
              </div>
              <div>
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900 mb-1">Track & Manage</h3>
                <p className="text-sm text-gray-600">
                  Monitor usage and manage subscriptions anytime
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hire Agent Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{selectedAgent.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedAgent.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">{selectedAgent.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-900">£{selectedAgent.monthlyPrice}</div>
                    <div className="text-sm text-blue-700">per month + tokens</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-blue-900">
                      {selectedAgent.tokensPerExecution.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">tokens per use</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">All Features:</h3>
                <ul className="space-y-2">
                  {selectedAgent.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <span className="text-green-600 mr-2 mt-0.5">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">What's Included:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Unlimited agent access during subscription</li>
                  <li>• Token charges apply per execution</li>
                  <li>• Cancel anytime, no long-term commitment</li>
                  <li>• Priority support and updates</li>
                </ul>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedAgent(null);
                    setError(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  disabled={isHiring}
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedAgent && handleHireAgent(selectedAgent)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isHiring}
                >
                  {isHiring ? 'Hiring...' : 'Hire Agent'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
