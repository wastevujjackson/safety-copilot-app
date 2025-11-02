'use client';

import { useEffect, useState } from 'react';

interface HazardousSubstance {
  id?: string;
  name?: string;
  coshhReference?: string;
  manufacturer?: string;
  hazards?: string[];
  hazardDescription?: string;
  exposureRoutes?: string[];
  exposureDetails?: string;
  exposureRouteDetails?: { [route: string]: string };
  activities?: string[];
  methodOfUse?: string;
  hPhrases?: Array<{
    code: string;
    description: string;
    riskLevel: 'High' | 'Medium' | 'Low';
  }>;
  howUsed?: string;
  whoExposed?: string[];
  substanceForm?: string;
  quantityUsed?: string;
  quantityUnit?: string;
  workingEnvironment?: string;
  workingEnvironmentDescription?: string;
  temperature?: string;
  confinedSpace?: boolean;
  frequencyOfUse?: string;
  durationOfUse?: string;
  numberOfWorkers?: number;
  trainingLevel?: string;
  trainingProvided?: boolean;
  existingPPE?: string[];
  healthSurveillance?: boolean;
  workplaceExposureLimitLTEL?: string;
  workplaceExposureLimitSTEL?: string;
  canEliminate?: boolean;
  canSubstitute?: boolean;
  eliminationSubstitutionJustification?: string;
  controlMeasures?: any[];
  ppeItems?: any[];
  healthSurveillanceItems?: any[];
  storageRequirementItems?: any[];
  emergencyProcedureItems?: any[];
  emergencyContacts?: Array<{
    id: string;
    name: string;
    number: string;
  }>;
  methodStatementSteps?: Array<{
    id: string;
    stepNumber: number;
    title: string;
    description?: string;
    substeps: Array<{
      id: string;
      description: string;
      linkedExposureRoutes?: string[];
      linkedActivities?: string[];
      linkedControlMeasures?: string[];
      linkedPPEItems?: string[];
    }>;
  }>;
  preControlConsequence?: number;
  preControlLikelihood?: 'Very Unlikely' | 'Unlikely' | 'Possible' | 'Likely' | 'Very Likely';
  preControlRiskLevel?: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  postControlConsequence?: number;
  postControlLikelihood?: 'Very Unlikely' | 'Unlikely' | 'Possible' | 'Likely' | 'Very Likely';
  residualRiskLevel?: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  dateCreated?: string;
  reviewDate?: string;
}

export interface COSHHFormData {
  title?: string;
  description?: string;
  assessmentReference?: string;
  date?: string;
  reviewDate?: string;
  site?: string;
  location?: string;
  client?: string;
  assessorName?: string;
  teamMembers?: Array<{ id: string; name: string; position: string }>;
  approvals?: Array<{ id: string; name: string; position: string }>;
  hazardousSubstances?: HazardousSubstance[];
}

interface COSHHFormPreviewProps {
  data: COSHHFormData;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Not specified';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getRiskLevelStyling = (riskLevel: string | undefined) => {
  const styles: { [key: string]: { color: string; bg: string } } = {
    'Very Low': { color: '#16a34a', bg: '#dcfce7' },
    'Low': { color: '#ffffff', bg: '#16a34a' },
    'Medium': { color: '#854d0e', bg: '#fef08a' },
    'High': { color: '#ffffff', bg: '#ea580c' },
    'Very High': { color: '#ffffff', bg: '#dc2626' }
  };
  return styles[riskLevel || ''] || { color: '#6b7280', bg: '#f3f4f6' };
};

export function COSHHFormPreview({ data }: COSHHFormPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl mb-2">📋</div>
          <p className="text-sm text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  const substance = data.hazardousSubstances?.[0];
  const hasAnyData = data.title || data.assessorName || substance;

  const preControl = substance?.preControlRiskLevel ? {
    level: substance.preControlRiskLevel,
    ...getRiskLevelStyling(substance.preControlRiskLevel)
  } : null;

  const postControl = (substance?.residualRiskLevel || substance?.preControlRiskLevel) ? {
    level: substance?.residualRiskLevel || substance?.preControlRiskLevel!,
    ...getRiskLevelStyling(substance?.residualRiskLevel || substance?.preControlRiskLevel)
  } : null;

  return (
    <div className="h-full overflow-y-auto bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-linear-to-r from-cyan-500 to-cyan-400 px-4 py-3 border-b border-cyan-600">
        <h3 className="text-base font-semibold text-white">
          COSHH Assessment Preview
        </h3>
        <p className="text-xs text-cyan-50 mt-1">
          Live preview - updates as information is collected
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {!hasAnyData ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📋</div>
            <h4 className="font-semibold text-gray-900 mb-2">Preview Ready</h4>
            <p className="text-sm text-gray-600 mb-4">
              Upload an SDS file in the chat to see the live preview populate with extracted data
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-200 max-w-md mx-auto">
              <p className="font-semibold mb-1">💡 Testing with Dummy Data</p>
              <p>Upload any file (even a blank .txt) and the preview will populate with sample Acetone data to demonstrate the layout</p>
            </div>
          </div>
        ) : (
          <>
            {/* COSHH Assessment Information Section */}
            <div className="border-b-4 border-cyan-500 pb-3 mb-4">
              <div className="bg-linear-to-r from-cyan-500 to-cyan-400 px-3 py-2 rounded-t">
                <h4 className="text-xs font-bold text-white text-center uppercase tracking-wide">
                  COSHH Assessment Information
                </h4>
              </div>
              <div className="bg-white p-3 mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {data.title && (
                    <div className="col-span-2 p-2 bg-gray-50 border-l-4 border-cyan-500 rounded">
                      <div className="text-xs font-semibold text-gray-700 uppercase">Assessment Title:</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">{data.title}</div>
                    </div>
                  )}
                  <div className="p-2 bg-gray-50 border-l-4 border-cyan-500 rounded">
                    <div className="text-xs font-semibold text-gray-700 uppercase">Reference:</div>
                    <div className="text-sm text-gray-900 mt-1">{data.assessmentReference || 'Not specified'}</div>
                  </div>
                  <div className="p-2 bg-gray-50 border-l-4 border-cyan-500 rounded">
                    <div className="text-xs font-semibold text-gray-700 uppercase">Date:</div>
                    <div className="text-sm text-gray-900 mt-1">{formatDate(data.date)}</div>
                  </div>
                  {data.client && (
                    <div className="p-2 bg-gray-50 border-l-4 border-cyan-500 rounded">
                      <div className="text-xs font-semibold text-gray-700 uppercase">Client:</div>
                      <div className="text-sm text-gray-900 mt-1">{data.client}</div>
                    </div>
                  )}
                  {data.location && (
                    <div className="p-2 bg-gray-50 border-l-4 border-cyan-500 rounded">
                      <div className="text-xs font-semibold text-gray-700 uppercase">Location:</div>
                      <div className="text-sm text-gray-900 mt-1">{data.location}</div>
                    </div>
                  )}
                  {data.reviewDate && (
                    <div className="p-2 bg-gray-50 border-l-4 border-cyan-500 rounded">
                      <div className="text-xs font-semibold text-gray-700 uppercase">Review Date:</div>
                      <div className="text-sm text-gray-900 mt-1">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded text-xs font-semibold">
                          {formatDate(data.reviewDate)}
                        </span>
                      </div>
                    </div>
                  )}
                  {data.assessorName && (
                    <div className="p-2 bg-gray-50 border-l-4 border-cyan-500 rounded">
                      <div className="text-xs font-semibold text-gray-700 uppercase">Assessor:</div>
                      <div className="text-sm text-gray-900 mt-1">{data.assessorName}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Substance Header with Risk Assessment */}
            {substance && (
              <>
                <div className="bg-white p-3 border-l-4 border-cyan-500 shadow-sm rounded">
                  <div className="grid grid-cols-[2fr_1fr] gap-3">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">
                        {substance.name || 'Chemical Substance'}
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        {substance.coshhReference && (
                          <div>
                            <span className="font-semibold text-gray-900">Ref:</span> {substance.coshhReference}
                          </div>
                        )}
                        {substance.manufacturer && (
                          <div>
                            <span className="font-semibold text-gray-900">Manufacturer:</span> {substance.manufacturer}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Risk Assessment Summary */}
                    {preControl && postControl && (
                      <div className="bg-gray-50 p-2 rounded border border-gray-200">
                        <div className="text-xs font-semibold text-gray-700 mb-2 text-center">RISK ASSESSMENT</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center">
                            <div className="text-xs text-gray-600 mb-1">Pre-Control</div>
                            <div
                              className="px-2 py-1 rounded text-xs font-semibold border"
                              style={{ backgroundColor: preControl.bg, color: preControl.color, borderColor: preControl.color }}
                            >
                              {preControl.level}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-600 mb-1">Post-Control</div>
                            <div
                              className="px-2 py-1 rounded text-xs font-semibold border"
                              style={{ backgroundColor: postControl.bg, color: postControl.color, borderColor: postControl.color }}
                            >
                              {postControl.level}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hazard Pictograms */}
                {(substance as any).hazardPictograms && (substance as any).hazardPictograms.length > 0 && (
                  <div>
                    <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                      <h6 className="text-xs font-semibold text-gray-700 uppercase">Hazard Pictograms</h6>
                    </div>
                    <div className="bg-white p-3 border-l-4 border-red-500 shadow-sm rounded">
                      <div className="grid grid-cols-3 gap-3">
                        {(substance as any).hazardPictograms.map((hazard: any, idx: number) => {
                          const hazardInfo: { [key: string]: { name: string; icon: string; desc: string } } = {
                            'flammable': { name: 'Flammable', icon: '/Flammable.png', desc: 'Highly flammable liquid and vapor' },
                            'health-hazard': { name: 'Health Hazard', icon: '/Health Hazard.png', desc: 'May cause respiratory irritation' },
                            'acute-toxicity': { name: 'Acute Toxicity', icon: '/Acute Toxicity.png', desc: 'Fatal/toxic if swallowed, inhaled, or skin contact' },
                            'corrosive': { name: 'Corrosive', icon: '/Corrosive.png', desc: 'Causes severe skin burns and eye damage' },
                            'explosives': { name: 'Explosives', icon: '/Explosives.png', desc: 'May mass explode in fire' },
                            'gas-stored': { name: 'Gas Under Pressure', icon: '/Gas Stored.png', desc: 'Contains gas under pressure' },
                            'serious-health-hazard': { name: 'Serious Health Hazard', icon: '/Serious Health Hazard.png', desc: 'May cause cancer or organ damage' },
                            'oxidising': { name: 'Oxidising', icon: '/Oxidising.png', desc: 'May intensify fire; oxidizer' },
                            'environmental-hazard': { name: 'Environmental Hazard', icon: '/Hazardous to the Environment.png', desc: 'Toxic to aquatic life' }
                          };
                          const info = hazardInfo[hazard.type];
                          return info ? (
                            <div key={idx} className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                              <img src={info.icon} alt={info.name} className="w-16 h-16 mx-auto mb-2" />
                              <div className="text-xs font-semibold text-gray-900 mb-1">{info.name}</div>
                              <div className="text-xs text-gray-600">{hazard.hazardClass}</div>
                              <div className="text-xs text-gray-500 mt-1">{info.desc}</div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Exposure & Usage Information */}
                <div>
                  <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                    <h6 className="text-xs font-semibold text-gray-700 uppercase">Exposure & Usage Information</h6>
                  </div>
                  <div className="bg-white p-3 border-l-4 border-cyan-500 shadow-sm rounded">
                    <div className="grid grid-cols-3 gap-2">
                      {substance.activities && substance.activities.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Activities</div>
                          <div className="text-xs text-gray-600">{substance.activities.join(', ')}</div>
                        </div>
                      )}
                      {substance.methodOfUse && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Method of Use</div>
                          <div className="text-xs text-gray-600">{substance.methodOfUse}</div>
                        </div>
                      )}
                      {substance.exposureRoutes && substance.exposureRoutes.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Routes of Exposure</div>
                          <div className="text-xs text-gray-600">{substance.exposureRoutes.join(', ')}</div>
                        </div>
                      )}
                      {substance.substanceForm && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Substance Form</div>
                          <div className="text-xs text-gray-600">{substance.substanceForm}</div>
                        </div>
                      )}
                      {substance.quantityUsed && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Quantity Used</div>
                          <div className="text-xs text-gray-600">
                            {substance.quantityUsed}{substance.quantityUnit ? ` ${substance.quantityUnit}` : ''}
                          </div>
                        </div>
                      )}
                      {substance.workingEnvironment && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Ventilation</div>
                          <div className="text-xs text-gray-600">{substance.workingEnvironment}</div>
                        </div>
                      )}
                      {substance.workingEnvironmentDescription && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Environment Description</div>
                          <div className="text-xs text-gray-600">{substance.workingEnvironmentDescription}</div>
                        </div>
                      )}
                      {substance.temperature && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Temperature</div>
                          <div className="text-xs text-gray-600">{substance.temperature}</div>
                        </div>
                      )}
                      {substance.confinedSpace !== undefined && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Confined Space</div>
                          <div className="text-xs text-gray-600">{substance.confinedSpace ? 'Yes' : 'No'}</div>
                        </div>
                      )}
                      {substance.whoExposed && substance.whoExposed.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Who is Exposed</div>
                          <div className="text-xs text-gray-600">{substance.whoExposed.join(', ')}</div>
                        </div>
                      )}
                      {substance.numberOfWorkers !== undefined && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Number of Workers</div>
                          <div className="text-xs text-gray-600">{substance.numberOfWorkers}</div>
                        </div>
                      )}
                      {substance.trainingLevel && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Training Level</div>
                          <div className="text-xs text-gray-600">{substance.trainingLevel}</div>
                        </div>
                      )}
                      {substance.trainingProvided !== undefined && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Training Provided</div>
                          <div className="text-xs text-gray-600">{substance.trainingProvided ? 'Yes' : 'No'}</div>
                        </div>
                      )}
                      {substance.existingPPE && substance.existingPPE.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Existing PPE</div>
                          <div className="text-xs text-gray-600">{substance.existingPPE.join(', ')}</div>
                        </div>
                      )}
                      {substance.frequencyOfUse && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Frequency of Use</div>
                          <div className="text-xs text-gray-600">{substance.frequencyOfUse}</div>
                        </div>
                      )}
                      {substance.durationOfUse && (
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Duration of Use</div>
                          <div className="text-xs text-gray-600">{substance.durationOfUse}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* H-Phrases & Workplace Exposure Limits */}
                {((substance.hPhrases && substance.hPhrases.length > 0) || substance.workplaceExposureLimitLTEL || substance.workplaceExposureLimitSTEL) && (
                  <div>
                    <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                      <h6 className="text-xs font-semibold text-gray-700 uppercase">Hazard Statements & Exposure Limits</h6>
                    </div>
                    <div className="bg-white p-3 border-l-4 border-red-500 shadow-sm rounded">
                      <div className={`grid ${substance.workplaceExposureLimitLTEL || substance.workplaceExposureLimitSTEL ? 'grid-cols-[2fr_1fr]' : 'grid-cols-1'} gap-3`}>
                        {substance.hPhrases && substance.hPhrases.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-900 mb-2">H-Phrases</div>
                            {substance.hPhrases.map((phrase, idx) => (
                              <div key={idx} className="flex justify-between items-start mb-1 pb-1 border-b border-gray-200">
                                <div className="flex-1">
                                  <span className="text-xs font-semibold text-gray-900">{phrase.code}:</span>
                                  <span className="text-xs text-gray-600 ml-1">{phrase.description}</span>
                                </div>
                                <span
                                  className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                                    phrase.riskLevel === 'High'
                                      ? 'bg-red-100 text-red-800'
                                      : phrase.riskLevel === 'Medium'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {phrase.riskLevel}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {(substance.workplaceExposureLimitLTEL || substance.workplaceExposureLimitSTEL) && (
                          <div>
                            <div className="text-xs font-semibold text-gray-900 mb-2">WEL</div>
                            <div className="space-y-1">
                              {substance.workplaceExposureLimitLTEL && (
                                <div className="p-2 bg-gray-50 rounded">
                                  <div className="text-xs text-gray-600">8-hr TWA</div>
                                  <div className="text-sm font-semibold text-gray-900">{substance.workplaceExposureLimitLTEL}</div>
                                </div>
                              )}
                              {substance.workplaceExposureLimitSTEL && (
                                <div className="p-2 bg-gray-50 rounded">
                                  <div className="text-xs text-gray-600">15-min STEL</div>
                                  <div className="text-sm font-semibold text-gray-900">{substance.workplaceExposureLimitSTEL}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* P-Phrases (Precautionary Statements) */}
                {(substance as any).pPhrases && (substance as any).pPhrases.length > 0 && (
                  <div>
                    <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                      <h6 className="text-xs font-semibold text-gray-700 uppercase">Precautionary Statements (P-Phrases)</h6>
                    </div>
                    <div className="bg-white p-3 border-l-4 border-orange-500 shadow-sm rounded">
                      <div className="space-y-2">
                        {(substance as any).pPhrases.map((phrase: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-start p-2 bg-gray-50 rounded border border-gray-200">
                            <div className="flex-1">
                              <span className="text-xs font-semibold text-gray-900">{phrase.code}:</span>
                              <span className="text-xs text-gray-600 ml-1">{phrase.description}</span>
                            </div>
                            <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 whitespace-nowrap">
                              {phrase.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* First Aid Measures */}
                {(substance as any).firstAid && (
                  <div>
                    <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                      <h6 className="text-xs font-semibold text-gray-700 uppercase">First Aid Measures</h6>
                    </div>
                    <div className="bg-white p-3 border-l-4 border-green-500 shadow-sm rounded">
                      <div className="text-xs text-gray-700 whitespace-pre-line">
                        {(substance as any).firstAid}
                      </div>
                    </div>
                  </div>
                )}

                {/* Firefighting Measures */}
                {(substance as any).firefighting && (
                  <div>
                    <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                      <h6 className="text-xs font-semibold text-gray-700 uppercase">Firefighting Measures</h6>
                    </div>
                    <div className="bg-white p-3 border-l-4 border-red-600 shadow-sm rounded">
                      <div className="space-y-3">
                        {(substance as any).firefighting.extinguishingMedia && (
                          <div>
                            <div className="text-xs font-semibold text-gray-900 mb-1">Extinguishing Media</div>
                            <div className="text-xs text-gray-700">{(substance as any).firefighting.extinguishingMedia}</div>
                          </div>
                        )}
                        {(substance as any).firefighting.specialHazards && (
                          <div>
                            <div className="text-xs font-semibold text-gray-900 mb-1">Special Hazards</div>
                            <div className="text-xs text-gray-700">{(substance as any).firefighting.specialHazards}</div>
                          </div>
                        )}
                        {(substance as any).firefighting.firefightingEquipment && (
                          <div>
                            <div className="text-xs font-semibold text-gray-900 mb-1">Protective Equipment for Firefighters</div>
                            <div className="text-xs text-gray-700">{(substance as any).firefighting.firefightingEquipment}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Storage Requirements */}
                {(substance as any).storageRequirements && (
                  <div>
                    <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                      <h6 className="text-xs font-semibold text-gray-700 uppercase">Handling & Storage Requirements</h6>
                    </div>
                    <div className="bg-white p-3 border-l-4 border-yellow-600 shadow-sm rounded">
                      <div className="text-xs text-gray-700">
                        {(substance as any).storageRequirements}
                      </div>
                    </div>
                  </div>
                )}

                {/* Elimination & Substitution */}
                {(substance.canEliminate !== undefined || substance.canSubstitute !== undefined || substance.eliminationSubstitutionJustification) && (
                  <div>
                    <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                      <h6 className="text-xs font-semibold text-gray-700 uppercase">Elimination & Substitution Assessment</h6>
                    </div>
                    <div className="bg-white p-3 border-l-4 border-cyan-500 shadow-sm rounded space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {substance.canEliminate !== undefined && (
                          <div className={`p-2 bg-gray-50 rounded border ${substance.canEliminate ? 'border-green-500' : 'border-red-500'}`}>
                            <div className="text-xs text-gray-600 mb-1">Can be eliminated?</div>
                            <div className={`text-sm font-semibold ${substance.canEliminate ? 'text-green-600' : 'text-red-600'}`}>
                              {substance.canEliminate ? '✓ YES' : '✗ NO'}
                            </div>
                          </div>
                        )}
                        {substance.canSubstitute !== undefined && (
                          <div className={`p-2 bg-gray-50 rounded border ${substance.canSubstitute ? 'border-green-500' : 'border-red-500'}`}>
                            <div className="text-xs text-gray-600 mb-1">Can be substituted?</div>
                            <div className={`text-sm font-semibold ${substance.canSubstitute ? 'text-green-600' : 'text-red-600'}`}>
                              {substance.canSubstitute ? '✓ YES' : '✗ NO'}
                            </div>
                          </div>
                        )}
                      </div>
                      {substance.eliminationSubstitutionJustification && (
                        <div className="p-2 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                          <div className="text-xs font-semibold text-gray-900 mb-1">Justification</div>
                          <div className="text-xs text-gray-700">{substance.eliminationSubstitutionJustification}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Method Statement - Job Steps */}
                {substance.methodStatementSteps && substance.methodStatementSteps.length > 0 && (
                  <div>
                    <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                      <h6 className="text-xs font-semibold text-gray-700 uppercase">Method Statement - Job Steps</h6>
                    </div>
                    <div className="bg-white p-3 border-l-4 border-cyan-500 shadow-sm rounded">
                      <div className="text-xs text-gray-600">
                        {substance.methodStatementSteps.length} step{substance.methodStatementSteps.length !== 1 ? 's' : ''} defined
                      </div>
                    </div>
                  </div>
                )}

                {/* Control Measures */}
                {substance.controlMeasures && substance.controlMeasures.length > 0 && (
                  <div>
                    <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                      <h6 className="text-xs font-semibold text-gray-700 uppercase">Control Measures (COSHH Hierarchy)</h6>
                    </div>
                    <div className="bg-white p-3 border-l-4 border-blue-500 shadow-sm rounded">
                      <div className="text-xs text-gray-600">
                        {substance.controlMeasures.length} control measure{substance.controlMeasures.length !== 1 ? 's' : ''} in place
                      </div>
                    </div>
                  </div>
                )}

                {/* PPE Requirements */}
                {substance.ppeItems && substance.ppeItems.length > 0 && (
                  <div>
                    <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                      <h6 className="text-xs font-semibold text-gray-700 uppercase">Personal Protective Equipment (PPE)</h6>
                    </div>
                    <div className="bg-white p-3 border-l-4 border-blue-500 shadow-sm rounded">
                      <div className="text-xs text-gray-600">
                        {substance.ppeItems.length} PPE item{substance.ppeItems.length !== 1 ? 's' : ''} required
                      </div>
                    </div>
                  </div>
                )}

                {/* Emergency Procedures & Storage */}
                {((substance.emergencyProcedureItems && substance.emergencyProcedureItems.length > 0) ||
                  (substance.storageRequirementItems && substance.storageRequirementItems.length > 0)) && (
                  <div className="grid grid-cols-2 gap-3">
                    {substance.emergencyProcedureItems && substance.emergencyProcedureItems.length > 0 && (
                      <div>
                        <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                          <h6 className="text-xs font-semibold text-gray-700 uppercase">Emergency Procedures</h6>
                        </div>
                        <div className="bg-white p-3 border-l-4 border-red-500 shadow-sm rounded">
                          <div className="text-xs text-gray-600">
                            {substance.emergencyProcedureItems.length} procedure{substance.emergencyProcedureItems.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    )}
                    {substance.storageRequirementItems && substance.storageRequirementItems.length > 0 && (
                      <div>
                        <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                          <h6 className="text-xs font-semibold text-gray-700 uppercase">Storage Requirements</h6>
                        </div>
                        <div className="bg-white p-3 border-l-4 border-yellow-500 shadow-sm rounded">
                          <div className="text-xs text-gray-600">
                            {substance.storageRequirementItems.length} requirement{substance.storageRequirementItems.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Emergency Contacts */}
                {substance.emergencyContacts && substance.emergencyContacts.length > 0 && (
                  <div>
                    <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                      <h6 className="text-xs font-semibold text-gray-700 uppercase">Emergency Contacts</h6>
                    </div>
                    <div className="bg-white p-3 border-l-4 border-red-600 shadow-sm rounded">
                      <div className="text-xs text-gray-600">
                        {substance.emergencyContacts.length} contact{substance.emergencyContacts.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )}

                {/* Health Surveillance */}
                {substance.healthSurveillanceItems && substance.healthSurveillanceItems.length > 0 && (
                  <div>
                    <div className="bg-gray-100 px-2 py-1 rounded mb-2">
                      <h6 className="text-xs font-semibold text-gray-700 uppercase">Health Surveillance</h6>
                    </div>
                    <div className="bg-white p-3 border-l-4 border-green-500 shadow-sm rounded">
                      <div className="text-xs text-gray-600">
                        {substance.healthSurveillanceItems.length} requirement{substance.healthSurveillanceItems.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
