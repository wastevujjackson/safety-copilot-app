'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface COSHHChatSimpleProps {
  agentId: string;
  onCreateNew?: () => void;
  onReviewExisting?: () => void;
  onSearch?: () => void;
}

export function COSHHChatSimple({
  agentId,
  onCreateNew,
  onReviewExisting,
  onSearch,
}: COSHHChatSimpleProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'review' | 'search'>('menu');

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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {mode === 'menu' && (
          <div className="flex flex-col items-center justify-center h-full">
            {/* Welcome Message */}
            <div className="max-w-md w-full mb-8">
              <div className="bg-gray-100 rounded-lg px-6 py-4 mb-6">
                <p className="text-sm text-gray-900">
                  Hello! I'm your COSHH Assessment Assistant.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setMode('create');
                    onCreateNew?.();
                  }}
                  className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-left transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold mb-1">Create New Assessment</div>
                      <div className="text-sm text-blue-100">
                        Start a new COSHH risk assessment
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-blue-200 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMode('review');
                    onReviewExisting?.();
                  }}
                  className="w-full px-6 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-lg hover:border-gray-300 hover:bg-gray-50 text-left transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold mb-1">Review & Update Existing</div>
                      <div className="text-sm text-gray-600">
                        View and update your assessments
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMode('search');
                    onSearch?.();
                  }}
                  className="w-full px-6 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-lg hover:border-gray-300 hover:bg-gray-50 text-left transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold mb-1">Search Assessments</div>
                      <div className="text-sm text-gray-600">
                        Find existing assessments
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">🚧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create New Assessment
              </h3>
              <p className="text-gray-600 mb-4">
                This flow will be built next
              </p>
              <Button
                onClick={() => setMode('menu')}
                variant="outline"
              >
                ← Back to Menu
              </Button>
            </div>
          </div>
        )}

        {mode === 'review' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Review & Update
              </h3>
              <p className="text-gray-600 mb-4">
                Use the list on the left to select an assessment
              </p>
              <Button
                onClick={() => setMode('menu')}
                variant="outline"
              >
                ← Back to Menu
              </Button>
            </div>
          </div>
        )}

        {mode === 'search' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Search Assessments
              </h3>
              <p className="text-gray-600 mb-4">
                Use the search box in the Previous Assessments panel
              </p>
              <Button
                onClick={() => setMode('menu')}
                variant="outline"
              >
                ← Back to Menu
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
