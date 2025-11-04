'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface COSHHChatProps {
  agentId: string;
  onComplete?: (assessmentId: string) => void;
  onModeChange?: (mode: 'menu' | 'create' | 'search' | 'review') => void;
  onDataUpdate?: (data: any) => void;
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
}

interface SelectedProcess {
  id: string;
  processType: string;
  material?: string;
  customMaterial?: string;
  duration?: string;
  frequency?: string;
}

type CreateStep = 'select_sources' | 'upload_sds' | 'select_processes' | 'review';

export function COSHHChat({ agentId, onComplete, onModeChange, onDataUpdate }: COSHHChatProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'search' | 'review'>('menu');

  // Create mode state
  const [createStep, setCreateStep] = useState<CreateStep>('select_sources');
  const [hasSDS, setHasSDS] = useState(false);
  const [hasProcesses, setHasProcesses] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedProcesses, setSelectedProcesses] = useState<SelectedProcess[]>([]);

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
                    onModeChange?.('create');
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
                    onModeChange?.('review');
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
                    onModeChange?.('search');
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
          <div className="h-full flex flex-col">
            {/* Step 1: Select Hazard Sources */}
            {createStep === 'select_sources' && (
              <div className="flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What hazards do you need to assess?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select all that apply
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={hasSDS}
                      onChange={(e) => setHasSDS(e.target.checked)}
                      className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        I have Safety Data Sheets (SDS)
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        For chemicals, substances, or products with SDS documentation
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={hasProcesses}
                      onChange={(e) => setHasProcesses(e.target.checked)}
                      className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        I have work processes or activities
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        For activities like welding, grinding, cutting that create hazardous substances
                      </div>
                    </div>
                  </label>
                </div>

                <div className="mt-auto flex gap-3">
                  <Button
                    onClick={() => setMode('menu')}
                    variant="ghost"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (hasSDS) {
                        setCreateStep('upload_sds');
                      } else if (hasProcesses) {
                        setCreateStep('select_processes');
                      }
                    }}
                    disabled={!hasSDS && !hasProcesses}
                  >
                    Continue →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2a: Upload SDS Files */}
            {createStep === 'upload_sds' && (
              <div className="flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Safety Data Sheets
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload one or multiple SDS files (PDF format)
                  </p>
                </div>

                {/* File Upload Area */}
                <div className="mb-6">
                  <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const newFiles = files.map(file => ({
                          id: Math.random().toString(36).substring(2, 11),
                          file,
                          name: file.name
                        }));
                        setUploadedFiles([...uploadedFiles, ...newFiles]);
                      }}
                    />
                    <div className="text-4xl mb-2">📄</div>
                    <div className="text-sm font-medium text-gray-900">
                      Click to upload or drag and drop
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      PDF files only
                    </div>
                  </label>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Uploaded Files ({uploadedFiles.length})
                    </h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📄</span>
                            <span className="text-sm text-gray-900">{file.name}</span>
                          </div>
                          <button
                            onClick={() => {
                              setUploadedFiles(uploadedFiles.filter(f => f.id !== file.id));
                            }}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto flex gap-3">
                  <Button
                    onClick={() => setCreateStep('select_sources')}
                    variant="ghost"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (hasProcesses) {
                        setCreateStep('select_processes');
                      } else {
                        setCreateStep('review');
                      }
                    }}
                    disabled={uploadedFiles.length === 0}
                  >
                    Continue →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2b: Select Processes */}
            {createStep === 'select_processes' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select Work Processes
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose activities that create hazardous substances
                  </p>
                </div>

                {/* Add Process Button */}
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setSelectedProcesses([
                        ...selectedProcesses,
                        {
                          id: Math.random().toString(36).substring(2, 11),
                          processType: '',
                          material: '',
                          duration: '',
                          frequency: ''
                        }
                      ]);
                    }}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
                  >
                    + Add Process/Activity
                  </button>
                </div>

                {/* Selected Processes List */}
                <div className="flex-1 overflow-y-auto mb-4">
                  {selectedProcesses.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <div className="text-4xl mb-3">⚙️</div>
                        <p className="text-sm text-gray-600">
                          No processes added yet.<br />Click "Add Process/Activity" to begin.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedProcesses.map((process, index) => (
                        <div
                          key={process.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              Process {index + 1}
                            </h4>
                            <button
                              onClick={() => {
                                setSelectedProcesses(
                                  selectedProcesses.filter((p) => p.id !== process.id)
                                );
                              }}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="space-y-3">
                            {/* Process Type */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Process/Activity Type *
                              </label>
                              <select
                                value={process.processType}
                                onChange={(e) => {
                                  const updated = [...selectedProcesses];
                                  updated[index].processType = e.target.value;
                                  setSelectedProcesses(updated);
                                }}
                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select a process...</option>
                                <optgroup label="Welding & Hot Work">
                                  <option value="welding">Welding</option>
                                  <option value="mig_welding">MIG Welding</option>
                                  <option value="tig_welding">TIG Welding</option>
                                  <option value="arc_welding">Arc Welding</option>
                                  <option value="brazing">Brazing</option>
                                  <option value="soldering">Soldering</option>
                                  <option value="flame_cutting">Flame Cutting</option>
                                </optgroup>
                                <optgroup label="Cutting & Grinding">
                                  <option value="grinding">Grinding</option>
                                  <option value="cutting">Cutting (Mechanical)</option>
                                  <option value="abrasive_wheels">Abrasive Wheel Use</option>
                                  <option value="angle_grinding">Angle Grinding</option>
                                  <option value="disc_cutting">Disc Cutting</option>
                                </optgroup>
                                <optgroup label="Woodworking">
                                  <option value="wood_cutting">Wood Cutting/Sawing</option>
                                  <option value="wood_sanding">Wood Sanding</option>
                                  <option value="wood_routing">Wood Routing</option>
                                  <option value="wood_drilling">Wood Drilling</option>
                                </optgroup>
                                <optgroup label="Surface Treatment">
                                  <option value="paint_spraying">Paint Spraying</option>
                                  <option value="powder_coating">Powder Coating</option>
                                  <option value="sandblasting">Sandblasting/Abrasive Blasting</option>
                                </optgroup>
                                <optgroup label="Other Processes">
                                  <option value="diesel_exhaust">Diesel Engine Operation</option>
                                  <option value="flour_dust">Flour/Grain Handling</option>
                                  <option value="latex">Latex/Rubber Processing</option>
                                  <option value="concrete_cutting">Concrete Cutting/Drilling</option>
                                  <option value="stone_cutting">Stone Cutting/Masonry</option>
                                  <option value="other">Other (describe in material field)</option>
                                </optgroup>
                              </select>
                            </div>

                            {/* Material/Substance */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Material/Substance Being Worked
                              </label>
                              <select
                                value={process.material}
                                onChange={(e) => {
                                  const updated = [...selectedProcesses];
                                  updated[index].material = e.target.value;
                                  if (e.target.value !== 'other') {
                                    updated[index].customMaterial = '';
                                  }
                                  setSelectedProcesses(updated);
                                }}
                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select material/substance...</option>

                                <optgroup label="Metals & Alloys">
                                  <option value="mild_steel">Mild Steel</option>
                                  <option value="stainless_steel">Stainless Steel</option>
                                  <option value="galvanized_steel">Galvanized Steel</option>
                                  <option value="aluminium">Aluminium</option>
                                  <option value="copper">Copper</option>
                                  <option value="brass">Brass</option>
                                  <option value="bronze">Bronze</option>
                                  <option value="cunifer">Cunifer (Copper-Nickel)</option>
                                  <option value="cast_iron">Cast Iron</option>
                                  <option value="lead">Lead-containing Material</option>
                                </optgroup>

                                <optgroup label="Wood Types">
                                  <option value="hardwood">Hardwood (General)</option>
                                  <option value="oak">Oak</option>
                                  <option value="beech">Beech</option>
                                  <option value="mahogany">Mahogany</option>
                                  <option value="teak">Teak</option>
                                  <option value="softwood">Softwood (General)</option>
                                  <option value="pine">Pine</option>
                                  <option value="mdf">MDF (Medium-Density Fibreboard)</option>
                                  <option value="plywood">Plywood</option>
                                  <option value="chipboard">Chipboard/Particleboard</option>
                                </optgroup>

                                <optgroup label="Construction Materials">
                                  <option value="concrete">Concrete</option>
                                  <option value="brick">Brick</option>
                                  <option value="stone">Stone/Natural Stone</option>
                                  <option value="mortar">Mortar</option>
                                  <option value="plaster">Plaster</option>
                                  <option value="render">Render</option>
                                </optgroup>

                                <optgroup label="Hazardous Substances Produced">
                                  <option value="silica">Respirable Crystalline Silica (RCS)</option>
                                  <option value="wood_dust">Wood Dust</option>
                                  <option value="metal_fumes">Metal Fumes</option>
                                  <option value="welding_fumes">Welding Fumes/Gases</option>
                                  <option value="chromium_vi">Hexavalent Chromium (Cr(VI))</option>
                                  <option value="nickel">Nickel Compounds</option>
                                  <option value="manganese">Manganese Fumes</option>
                                  <option value="zinc_oxide">Zinc Oxide Fumes</option>
                                  <option value="flour_dust">Flour/Grain Dust</option>
                                  <option value="isocyanates">Isocyanates</option>
                                  <option value="solvents">Solvents/VOCs</option>
                                </optgroup>

                                <optgroup label="Other">
                                  <option value="other">Other (specify below)</option>
                                  <option value="mixed">Mixed Materials</option>
                                </optgroup>
                              </select>

                              {/* Custom Material Input - shown when "other" is selected */}
                              {process.material === 'other' && (
                                <input
                                  type="text"
                                  value={process.customMaterial || ''}
                                  onChange={(e) => {
                                    const updated = [...selectedProcesses];
                                    updated[index].customMaterial = e.target.value;
                                    setSelectedProcesses(updated);
                                  }}
                                  placeholder="Specify the material or substance"
                                  className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                                />
                              )}

                              <p className="text-xs text-gray-500 mt-1">
                                Select the primary material or hazardous substance produced
                              </p>
                            </div>

                            {/* Duration */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Typical Duration per Session
                              </label>
                              <input
                                type="text"
                                value={process.duration}
                                onChange={(e) => {
                                  const updated = [...selectedProcesses];
                                  updated[index].duration = e.target.value;
                                  setSelectedProcesses(updated);
                                }}
                                placeholder="e.g., 2 hours, 30 minutes"
                                className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            {/* Frequency */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Frequency
                              </label>
                              <select
                                value={process.frequency}
                                onChange={(e) => {
                                  const updated = [...selectedProcesses];
                                  updated[index].frequency = e.target.value;
                                  setSelectedProcesses(updated);
                                }}
                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select frequency...</option>
                                <option value="continuous">Continuous (daily, all day)</option>
                                <option value="frequent">Frequent (daily, part of day)</option>
                                <option value="occasional">Occasional (few times per week)</option>
                                <option value="infrequent">Infrequent (once per week or less)</option>
                                <option value="rare">Rare (once per month or less)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      if (hasSDS) {
                        setCreateStep('upload_sds');
                      } else {
                        setCreateStep('select_sources');
                      }
                    }}
                    variant="ghost"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => setCreateStep('review')}
                    disabled={selectedProcesses.length === 0 || selectedProcesses.some(p => !p.processType)}
                  >
                    Continue →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review - Placeholder */}
            {createStep === 'review' && (
              <div className="flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Review Hazards
                  </h3>
                  <p className="text-sm text-gray-600">
                    Confirm all hazards before generating assessment
                  </p>
                </div>

                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <div className="text-4xl mb-4">🚧</div>
                    <p className="text-gray-600">
                      Review interface coming next
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex gap-3">
                  <Button
                    onClick={() => {
                      if (hasProcesses) {
                        setCreateStep('select_processes');
                      } else if (hasSDS) {
                        setCreateStep('upload_sds');
                      } else {
                        setCreateStep('select_sources');
                      }
                    }}
                    variant="ghost"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={() => {
                      // TODO: Generate assessment
                      console.log('Generate assessment');
                    }}
                  >
                    Generate Assessment
                  </Button>
                </div>
              </div>
            )}
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
