'use client';

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
  pPhrases?: Array<{
    code: string;
    description: string;
    type: string;
  }>;
  hazardPictograms?: Array<{
    type: string;
    hazardClass: string;
    pictogram: string;
    signalWord: string;
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
  healthScreening?: boolean;
  healthSurveillance?: boolean;
  workplaceExposureLimitLTEL?: string;
  workplaceExposureLimitSTEL?: string;
  firstAid?: string;
  firefighting?: {
    extinguishingMedia: string;
    specialHazards: string;
    firefightingEquipment: string;
  };
  storageRequirements?: string;
  controlMeasures?: any[];
}

export interface HealthSurveillanceRequirement {
  substance: string;
  mandatory: boolean;
  frequency: string;
  surveillanceType: string[];
  legalReference: string;
  additionalInfo?: string;
}

export interface ControlMeasure {
  code: string;
  description: string;
  hierarchy: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  icon: string;
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
  hazardousSubstances?: HazardousSubstance[];
  healthSurveillanceRequirements?: HealthSurveillanceRequirement[];
  controlMeasures?: {
    riskBeforeControls?: {
      likelihood: number;
      severity: number;
      score: number;
      rating: string;
    };
    riskAfterControls?: {
      likelihood: number;
      severity: number;
      score: number;
      rating: string;
    };
    normalControls?: ControlMeasure[];
    storageControls?: ControlMeasure[];
    handlingControls?: ControlMeasure[];
    disposalControls?: ControlMeasure[];
    firstAidControls?: ControlMeasure[];
    spillControls?: ControlMeasure[];
  };
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
    year: 'numeric',
  });
};

export function COSHHFormPreview({ data }: COSHHFormPreviewProps) {
  if (!data) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-center py-12">
          <p className="text-sm text-gray-600">No data yet</p>
          <p className="text-xs text-gray-500 mt-2">
            Start by uploading an SDS in the chat
          </p>
        </div>
      </div>
    );
  }

  const substances = data.hazardousSubstances || [];
  const hasAnyData = data.title || data.assessorName || substances.length > 0;

  // Get shared data from first substance (all substances share this data)
  const sharedData = substances[0];

  return (
    <div className="h-full overflow-y-auto bg-gray-50 border border-gray-300 rounded-lg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-cyan-700 px-4 py-3 border-b border-cyan-800">
        <h3 className="text-base font-semibold text-white">
          COSHH Assessment Preview
        </h3>
        <p className="text-xs text-cyan-100 mt-1">
          Live preview - updates as information is collected
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {!hasAnyData ? (
          <div className="text-center py-12">
            <h4 className="font-semibold text-gray-900 mb-2">Preview Ready</h4>
            <p className="text-sm text-gray-600 mb-4">
              Upload an SDS file in the chat to see the live preview populate with extracted data
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-200 max-w-md mx-auto">
              <p className="font-semibold mb-1">Testing with Dummy Data</p>
              <p>Upload any file (even a blank .txt) and the preview will populate with sample Acetone data to demonstrate the layout</p>
            </div>
          </div>
        ) : (
          <>
            {/* Assessment Title Section */}
            {substances.length > 0 && (
              <>
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
                  <div className="bg-cyan-700 px-4 py-3 rounded-t-lg">
                    <h4 className="text-sm font-semibold text-white">
                      COSHH Assessment for Working with {substances.map(s => s.name).join(', ')}
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Reference Number</div>
                        <div className="text-sm text-gray-900">
                          {data.assessmentReference || `COSHH-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Date Created</div>
                        <div className="text-sm text-gray-900">
                          {formatDate(data.date) !== 'Not specified' ? formatDate(data.date) : new Date().toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Review Date</div>
                        <div className="text-sm text-gray-900">
                          {data.reviewDate ? formatDate(data.reviewDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hazardous Substances Section - Substance-specific data only */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
                  <div className="bg-cyan-700 px-4 py-3 rounded-t-lg">
                    <h4 className="text-sm font-semibold text-white">
                      Hazardous Substances ({substances.length})
                    </h4>
                  </div>
                <div className="p-4 space-y-4">
                  {substances.map((substance, idx) => (
                    <div key={idx} className="p-4 border border-gray-300 bg-white rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-1">
                            {substance.name || 'Chemical Substance'}
                          </h5>
                          {substance.manufacturer && (
                            <div className="text-xs text-gray-600">
                              <span className="font-semibold">Manufacturer:</span> {substance.manufacturer}
                            </div>
                          )}
                        </div>

                        {/* WELs in top right corner */}
                        {(substance.workplaceExposureLimitLTEL || substance.workplaceExposureLimitSTEL) && (
                          <div className="flex gap-2">
                            {substance.workplaceExposureLimitLTEL && (
                              <div className="p-2 bg-gray-50 rounded border border-gray-300">
                                <div className="text-xs font-semibold text-gray-900">WEL (8hr TWA)</div>
                                <div className="text-xs text-gray-600">{substance.workplaceExposureLimitLTEL}</div>
                              </div>
                            )}
                            {substance.workplaceExposureLimitSTEL && (
                              <div className="p-2 bg-gray-50 rounded border border-gray-300">
                                <div className="text-xs font-semibold text-gray-900">WEL (15min STEL)</div>
                                <div className="text-xs text-gray-600">{substance.workplaceExposureLimitSTEL}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Left Column: Pictograms in 2-col grid */}
                        <div>
                          {substance.hazardPictograms && substance.hazardPictograms.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-gray-900 mb-2">Hazard Pictograms</div>
                              <div className="grid grid-cols-2 gap-2">
                                {substance.hazardPictograms.map((hazard, hIdx) => {
                                  const hazardInfo: { [key: string]: { name: string; icon: string } } = {
                                    'flammable': { name: 'Flammable', icon: '/Flammable.png' },
                                    'health-hazard': { name: 'Health Hazard', icon: '/Health Hazard.png' },
                                    'acute-toxicity': { name: 'Acute Toxicity', icon: '/Acute Toxicity.png' },
                                    'corrosive': { name: 'Corrosive', icon: '/Corrosive.png' },
                                    'explosives': { name: 'Explosives', icon: '/Explosives.png' },
                                    'gas-stored': { name: 'Gas Under Pressure', icon: '/Gas Stored.png' },
                                    'serious-health-hazard': { name: 'Serious Health Hazard', icon: '/Serious Health Hazard.png' },
                                    'oxidising': { name: 'Oxidising', icon: '/Oxidising.png' },
                                    'environmental-hazard': { name: 'Environmental Hazard', icon: '/Hazardous to the Environment.png' }
                                  };
                                  const info = hazardInfo[hazard.type];
                                  return info ? (
                                    <div key={hIdx} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded border border-gray-300">
                                      <img src={info.icon} alt={info.name} className="w-8 h-8 shrink-0" />
                                      <div className="min-w-0">
                                        <div className="text-xs font-semibold text-gray-900 leading-tight">{info.name}</div>
                                        <div className="text-xs text-gray-600 truncate">{hazard.hazardClass}</div>
                                      </div>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column: H-Phrases */}
                        <div>
                          {substance.hPhrases && substance.hPhrases.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-gray-900 mb-2">Hazard Statements</div>
                              <div className="space-y-1">
                                {substance.hPhrases.map((phrase, pIdx) => (
                                  <div key={pIdx} className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-300">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap ${
                                      phrase.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                                      phrase.riskLevel === 'Medium' ? 'bg-orange-100 text-orange-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {phrase.code}
                                    </span>
                                    <span className="text-xs text-gray-700 flex-1">{phrase.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </>
            )}

            {/* Usage, Environment & Personnel - Sectioned Layout */}
            {sharedData && (
              <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
                <div className="bg-cyan-700 px-4 py-3 rounded-t-lg">
                  <h4 className="text-sm font-semibold text-white">
                    Usage, Environment & Personnel
                  </h4>
                </div>
                <div className="p-4 space-y-4">
                  {/* Usage & Exposure Section */}
                  <div>
                    <h5 className="text-xs font-bold text-cyan-700 uppercase mb-2 pb-1 border-b border-gray-200">Usage & Exposure</h5>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-2 mt-2">
                      {sharedData.activities && sharedData.activities.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Activities:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.activities.join(', ')}</span>
                        </div>
                      )}
                      {sharedData.methodOfUse && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Method of Use:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.methodOfUse}</span>
                        </div>
                      )}
                      {(() => {
                        const forms = substances.map(s => s.substanceForm).filter(Boolean);
                        const uniqueForms = [...new Set(forms)];
                        if (uniqueForms.length === 0) return null;
                        if (uniqueForms.length === 1) {
                          return (
                            <div>
                              <span className="text-xs font-semibold text-gray-900">Substance Form:</span>
                              <span className="text-xs text-gray-600 ml-2">{uniqueForms[0]}</span>
                            </div>
                          );
                        } else {
                          return (
                            <div className="col-span-3">
                              <span className="text-xs font-semibold text-gray-900">Substance Forms:</span>
                              <span className="text-xs text-gray-600 ml-2">
                                {substances.map((s, idx) => (
                                  s.substanceForm ? (
                                    <span key={idx} className="mr-3">
                                      <span className="font-semibold">{s.name}:</span> {s.substanceForm}
                                    </span>
                                  ) : null
                                ))}
                              </span>
                            </div>
                          );
                        }
                      })()}
                      {sharedData.exposureRoutes && sharedData.exposureRoutes.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Exposure Routes:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.exposureRoutes.join(', ')}</span>
                        </div>
                      )}
                      {sharedData.quantityUsed && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Quantity Used:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.quantityUsed}</span>
                        </div>
                      )}
                      {sharedData.frequencyOfUse && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Frequency:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.frequencyOfUse}</span>
                        </div>
                      )}
                      {sharedData.durationOfUse && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Duration:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.durationOfUse}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Working Environment Section */}
                  <div>
                    <h5 className="text-xs font-bold text-cyan-700 uppercase mb-2 pb-1 border-b border-gray-200">Working Environment</h5>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-2 mt-2">
                      {sharedData.confinedSpace !== undefined && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Confined Space:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.confinedSpace ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                      {sharedData.workingEnvironment && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Ventilation:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.workingEnvironment}</span>
                        </div>
                      )}
                      {sharedData.temperature && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Temperature:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.temperature}</span>
                        </div>
                      )}
                      {sharedData.workingEnvironmentDescription && (
                        <div className="col-span-3">
                          <span className="text-xs font-semibold text-gray-900">Environment:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.workingEnvironmentDescription}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personnel & Training Section */}
                  <div>
                    <h5 className="text-xs font-bold text-cyan-700 uppercase mb-2 pb-1 border-b border-gray-200">Personnel & Training</h5>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-2 mt-2">
                      {sharedData.whoExposed && sharedData.whoExposed.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Who is Exposed:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.whoExposed.join(', ')}</span>
                        </div>
                      )}
                      {sharedData.numberOfWorkers && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Number of Workers:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.numberOfWorkers}</span>
                        </div>
                      )}
                      {sharedData.trainingLevel && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Training Level:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.trainingLevel}</span>
                        </div>
                      )}
                      {sharedData.trainingProvided !== undefined && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Training Provided:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.trainingProvided ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                      {sharedData.existingPPE && sharedData.existingPPE.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Existing PPE:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.existingPPE.join(', ')}</span>
                        </div>
                      )}
                      {sharedData.healthScreening !== undefined && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Health Screening:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.healthScreening ? 'Completed' : 'Not Completed'}</span>
                        </div>
                      )}
                      {sharedData.healthSurveillance !== undefined && (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">Ongoing Health Surveillance:</span>
                          <span className="text-xs text-gray-600 ml-2">{sharedData.healthSurveillance ? 'In Place' : 'Not In Place'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hazard Assessment & Controls */}
            {substances.length > 0 && substances.some(s => s.hPhrases && s.hPhrases.length > 0) && (
              <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
                <div className="bg-red-700 px-4 py-3 rounded-t-lg">
                  <h4 className="text-base font-semibold text-white">
                    Hazard Assessment & Controls
                  </h4>
                </div>
                <div className="p-4 space-y-6">
                  {substances.map((substance, subIdx) => (
                    substance.hPhrases && substance.hPhrases.length > 0 && (
                      <div key={subIdx}>
                        {substances.length > 1 && (
                          <h5 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">{substance.name}</h5>
                        )}
                        <div className="space-y-4">
                          {substance.hPhrases.map((phrase, pIdx) => (
                            <div key={pIdx} className="border-2 border-gray-300 rounded-lg overflow-hidden">
                              {/* Hazard Header */}
                              <div className="bg-gray-100 p-3 border-b border-gray-300">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                                      phrase.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                                      phrase.riskLevel === 'Medium' ? 'bg-orange-100 text-orange-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {phrase.code}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 flex-1">{phrase.description}</span>
                                  </div>
                                  <span className={`text-xs font-bold px-3 py-1 rounded ml-3 ${
                                    phrase.riskLevel === 'High' ? 'bg-red-600 text-white' :
                                    phrase.riskLevel === 'Medium' ? 'bg-orange-500 text-white' :
                                    'bg-yellow-500 text-white'
                                  }`}>
                                    {phrase.riskLevel}
                                  </span>
                                </div>
                              </div>

                              {/* Risk Assessment */}
                              <div className="p-3 bg-white">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  {/* Before Controls */}
                                  <div>
                                    <div className="text-xs font-semibold text-gray-600 mb-1">Before Controls</div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-6 bg-linear-to-r from-green-500 to-red-600 rounded relative">
                                        <div
                                          className="absolute top-0 h-full w-0.5 bg-gray-900"
                                          style={{ left: '80%' }}
                                        />
                                      </div>
                                      <div className="text-lg font-bold text-white bg-red-600 px-2 py-0.5 rounded text-center min-w-[40px]">
                                        20
                                      </div>
                                    </div>
                                    <div className="text-xs text-red-700 font-semibold mt-1">High Risk</div>
                                  </div>

                                  {/* After Controls */}
                                  <div>
                                    <div className="text-xs font-semibold text-gray-600 mb-1">After Controls</div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-6 bg-linear-to-r from-green-500 to-red-600 rounded relative">
                                        <div
                                          className="absolute top-0 h-full w-0.5 bg-gray-900"
                                          style={{ left: '20%' }}
                                        />
                                      </div>
                                      <div className="text-lg font-bold text-white bg-green-600 px-2 py-0.5 rounded text-center min-w-[40px]">
                                        5
                                      </div>
                                    </div>
                                    <div className="text-xs text-green-700 font-semibold mt-1">Low Risk</div>
                                  </div>
                                </div>

                                {/* Controls for this hazard */}
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="text-xs font-bold text-gray-900 mb-2">Controls for this Hazard</div>
                                  <div className="space-y-1.5">
                                    {/* Dummy controls - in real implementation these would be filtered by hazard */}
                                    <div className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-200 text-xs">
                                      <span className="font-semibold text-blue-900 shrink-0">P260:</span>
                                      <span className="text-gray-700">Do not breathe vapours/spray. Use Local Exhaust Ventilation (LEV)</span>
                                    </div>
                                    <div className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-200 text-xs">
                                      <span className="font-semibold text-blue-900 shrink-0">P284:</span>
                                      <span className="text-gray-700">Wear respiratory protection (A1P2 filters). RPE must be face-fit tested</span>
                                    </div>
                                    <div className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-200 text-xs">
                                      <span className="font-semibold text-blue-900 shrink-0">P280:</span>
                                      <span className="text-gray-700">Wear nitrile gloves, coveralls, safety goggles and face shield</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Control Measures */}
            {data.controlMeasures && (
              <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
                <div className="bg-gray-700 px-4 py-3 rounded-t-lg">
                  <h4 className="text-base font-semibold text-white">
                    Control Measures
                  </h4>
                </div>
                <div className="p-4">

                  {/* Normal Controls In Place */}
                  {data.controlMeasures.normalControls && data.controlMeasures.normalControls.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        Controls In Place
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {data.controlMeasures.normalControls.map((control, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-300">
                            <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-800">
                              {control.code.startsWith('P') ? 'P' : control.hierarchy === 'engineering' ? 'E' : control.hierarchy === 'ppe' ? 'PPE' : 'A'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-gray-900 mb-1">{control.code}</div>
                              <div className="text-xs text-gray-700">{control.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Storage Controls */}
                  {data.controlMeasures.storageControls && data.controlMeasures.storageControls.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        Storage Requirements
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {data.controlMeasures.storageControls.map((control, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-purple-50 rounded border border-purple-200">
                            <div className="shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-800">
                              S
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-gray-900 mb-1">{control.code}</div>
                              <div className="text-xs text-gray-700">{control.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Handling Controls */}
                  {data.controlMeasures.handlingControls && data.controlMeasures.handlingControls.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        Safe Handling Procedures
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {data.controlMeasures.handlingControls.map((control, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-800">
                              H
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-gray-900 mb-1">{control.code}</div>
                              <div className="text-xs text-gray-700">{control.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disposal Controls */}
                  {data.controlMeasures.disposalControls && data.controlMeasures.disposalControls.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        Disposal Procedures
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {data.controlMeasures.disposalControls.map((control, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-300">
                            <div className="shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-800">
                              D
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-gray-900 mb-1">{control.code}</div>
                              <div className="text-xs text-gray-700">{control.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* First Aid Controls */}
                  {data.controlMeasures.firstAidControls && data.controlMeasures.firstAidControls.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        First Aid Measures
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {data.controlMeasures.firstAidControls.map((control, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
                            <div className="shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-800">
                              FA
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-gray-900 mb-1">{control.code}</div>
                              <div className="text-xs text-gray-700">{control.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Spill Response Controls */}
                  {data.controlMeasures.spillControls && data.controlMeasures.spillControls.length > 0 && (
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        Spill Response Procedures
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {data.controlMeasures.spillControls.map((control, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 rounded border border-orange-200">
                            <div className="shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-800">
                              SP
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-gray-900 mb-1">{control.code}</div>
                              <div className="text-xs text-gray-700">{control.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Health Surveillance Requirements */}
            {data.healthSurveillanceRequirements && data.healthSurveillanceRequirements.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
                <div className="bg-cyan-700 px-4 py-3 rounded-t-lg">
                  <h4 className="text-sm font-semibold text-white">
                    Mandatory Health Surveillance Required
                  </h4>
                </div>
                <div className="p-4">
                  {data.healthSurveillanceRequirements.map((req, idx) => (
                    <div key={idx} className="mb-4 last:mb-0 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="text-sm font-bold text-gray-900 mb-1">{req.substance}</h5>
                          <div className="text-xs text-amber-800 font-semibold">
                            {req.legalReference}
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                          MANDATORY
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Frequency</div>
                          <div className="text-xs text-gray-700">{req.frequency}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-900 mb-1">Surveillance Type</div>
                          <div className="text-xs text-gray-700">
                            {req.surveillanceType.join(', ')}
                          </div>
                        </div>
                      </div>

                      {req.additionalInfo && (
                        <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                          <span className="font-semibold">Note:</span> {req.additionalInfo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
