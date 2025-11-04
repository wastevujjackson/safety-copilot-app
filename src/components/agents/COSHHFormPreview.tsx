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

export interface TaskRiskScoring {
  taskName: string;
  inhalation?: { likelihood: number; severity: number; risk: number };
  ingestion?: { likelihood: number; severity: number; risk: number };
  skinEyeContact?: { likelihood: number; severity: number; risk: number };
  other?: { likelihood: number; severity: number; risk: number };
}

export interface ChemicalRiskAssessment {
  chemicalName: string;
  tasks: TaskRiskScoring[];
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
  taskRiskAssessments?: ChemicalRiskAssessment[];
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
  ppeRequirements?: {
    inWorkArea?: string[];
    handlingContainers?: string[];
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
            {/* Assessment Header */}
            {substances.length > 0 && (
              <>
                <div className="bg-white rounded-lg border-2 border-gray-800 shadow-sm mb-4">
                  <div className="bg-gray-800 px-4 py-3">
                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div>
                        <div className="font-bold text-white uppercase mb-1">Assessment No:</div>
                        <div className="text-white">
                          {data.assessmentReference || `CRA${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white uppercase mb-1">Date:</div>
                        <div className="text-white">
                          {formatDate(data.date) !== 'Not specified' ? formatDate(data.date) : new Date().toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white uppercase mb-1">Assessor:</div>
                        <div className="text-white">
                          {data.assessorName || 'Loading...'}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white uppercase mb-1">Approver:</div>
                        <div className="text-white">
                          {data.client || 'To be approved'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job/Tasks Section */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
                  <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                    <h4 className="text-sm font-semibold text-white">
                      JOB/TASKS:
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-gray-900">
                      {data.title || 'To be defined in chat workflow'}
                    </div>
                  </div>
                </div>

                {/* Section 1: Product/Chemical Names */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
                  <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                    <h4 className="text-sm font-semibold text-white">
                      1. PRODUCT/CHEMICAL NAMES
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-bold text-gray-900">
                      {substances.map(s => s.name).join(', ')}
                    </div>
                  </div>
                </div>

                {/* Section 2: Process/Operations */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
                  <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                    <h4 className="text-sm font-semibold text-white">
                      2. PROCESS / OPERATIONS:
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-gray-900 bg-gray-100 px-4 py-3 rounded border border-gray-200">
                      <p className="italic text-gray-700 mb-2">
                        Process description will be generated from chat workflow based on:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2 text-gray-800">
                        <li>Tasks identified in Section 4</li>
                        <li>Usage information (activities, method of use, substance form)</li>
                        <li>Environment details (confined space, ventilation, temperature)</li>
                        <li>Duration and frequency of use</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section 3: Chemicals & Hazards Table */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
                  <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                    <h4 className="text-sm font-semibold text-white">
                      3. CHEMICALS & HAZARDS
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                          <th className="px-3 py-2 text-left font-bold text-gray-900 border-r border-gray-300">NAME</th>
                          <th className="px-3 py-2 text-left font-bold text-gray-900 border-r border-gray-300">SYMBOL</th>
                          <th className="px-3 py-2 text-left font-bold text-gray-900 border-r border-gray-300">HAZARD TERM</th>
                          <th className="px-3 py-2 text-left font-bold text-gray-900 border-r border-gray-300">HAZARD STATEMENTS</th>
                          <th className="px-3 py-2 text-left font-bold text-gray-900">EXPOSURE LIMITS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {substances.map((substance, idx) => (
                          <tr key={idx} className="border-b border-gray-300">
                            <td className="px-3 py-3 border-r border-gray-300 align-top">
                              <div className="font-bold text-gray-900">{substance.name || 'Chemical Substance'}</div>
                              {substance.manufacturer && (
                                <div className="text-gray-600 mt-1">(Contains: {substance.manufacturer})</div>
                              )}
                            </td>
                            <td className="px-3 py-3 border-r border-gray-300 align-top">
                              {substance.hazardPictograms && substance.hazardPictograms.length > 0 && (
                                <div className="flex flex-col items-center gap-2">
                                  {substance.hazardPictograms.slice(0, 2).map((hazard, hIdx) => {
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
                                      <div key={hIdx} className="text-center">
                                        <img src={info.icon} alt={info.name} className="w-12 h-12 mx-auto" />
                                        <div className="text-xs font-bold text-gray-900 mt-1">Signal Word: {hazard.signalWord}</div>
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 border-r border-gray-300 align-top">
                              {substance.hazardPictograms && substance.hazardPictograms.length > 0 && (
                                <div className="space-y-1">
                                  {substance.hazardPictograms.map((hazard, hIdx) => (
                                    <div key={hIdx}>
                                      <div className="font-bold text-gray-900">{hazard.hazardClass}</div>
                                      <div className="text-gray-600">[CLP]</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 border-r border-gray-300 align-top">
                              {substance.hPhrases && substance.hPhrases.length > 0 && (
                                <div className="space-y-1">
                                  {substance.hPhrases.map((phrase, pIdx) => (
                                    <div key={pIdx} className="text-gray-900">
                                      <span className="font-bold text-gray-900">{phrase.code}</span>: {phrase.description}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 align-top">
                              {substance.workplaceExposureLimitSTEL && (
                                <div className="mb-2">
                                  <div className="font-bold text-gray-900">STEL (15mins):</div>
                                  <div className="text-gray-900">{substance.workplaceExposureLimitSTEL}</div>
                                </div>
                              )}
                              {substance.workplaceExposureLimitLTEL && (
                                <div>
                                  <div className="font-bold text-gray-900">LTEL (8hr):</div>
                                  <div className="text-gray-900">{substance.workplaceExposureLimitLTEL}</div>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Section 2: Usage, Environment & Personnel */}
            {sharedData && (
              <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
                <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                  <h4 className="text-sm font-semibold text-white">
                    2. USAGE, ENVIRONMENT & PERSONNEL
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <tbody>
                      {/* Usage & Exposure */}
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 uppercase" colSpan={2}>Usage & Exposure</td>
                      </tr>
                      {sharedData.activities && sharedData.activities.length > 0 && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50 w-1/4">Activities:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.activities.join(', ')}</td>
                        </tr>
                      )}
                      {sharedData.methodOfUse && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50 w-1/4">Method of Use:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.methodOfUse}</td>
                        </tr>
                      )}
                      {sharedData.exposureRoutes && sharedData.exposureRoutes.length > 0 && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50">Exposure Routes:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.exposureRoutes.join(', ')}</td>
                        </tr>
                      )}
                      {sharedData.quantityUsed && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50">Quantity Used:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.quantityUsed}</td>
                        </tr>
                      )}
                      {sharedData.frequencyOfUse && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50">Frequency:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.frequencyOfUse}</td>
                        </tr>
                      )}
                      {sharedData.durationOfUse && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50">Duration:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.durationOfUse}</td>
                        </tr>
                      )}

                      {/* Working Environment */}
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 uppercase" colSpan={2}>Working Environment</td>
                      </tr>
                      {sharedData.confinedSpace !== undefined && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50 w-1/4">Confined Space:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.confinedSpace ? 'Yes' : 'No'}</td>
                        </tr>
                      )}
                      {sharedData.workingEnvironment && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50">Ventilation:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.workingEnvironment}</td>
                        </tr>
                      )}
                      {sharedData.temperature && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50">Temperature:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.temperature}</td>
                        </tr>
                      )}
                      {sharedData.workingEnvironmentDescription && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50">Environment:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.workingEnvironmentDescription}</td>
                        </tr>
                      )}

                      {/* Personnel & Training */}
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 uppercase" colSpan={2}>Personnel & Training</td>
                      </tr>
                      {sharedData.whoExposed && sharedData.whoExposed.length > 0 && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50 w-1/4">Who is Exposed:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.whoExposed.join(', ')}</td>
                        </tr>
                      )}
                      {sharedData.numberOfWorkers && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50">Number of Workers:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.numberOfWorkers}</td>
                        </tr>
                      )}
                      {sharedData.trainingLevel && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50">Training Level:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.trainingLevel}</td>
                        </tr>
                      )}
                      {sharedData.trainingProvided !== undefined && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50">Training Provided:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.trainingProvided ? 'Yes' : 'No'}</td>
                        </tr>
                      )}
                      {sharedData.existingPPE && sharedData.existingPPE.length > 0 && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50">Existing PPE:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.existingPPE.join(', ')}</td>
                        </tr>
                      )}
                      {sharedData.healthScreening !== undefined && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50">Health Screening:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.healthScreening ? 'Completed' : 'Not Completed'}</td>
                        </tr>
                      )}
                      {sharedData.healthSurveillance !== undefined && (
                        <tr>
                          <td className="px-4 py-2 border-2 border-gray-400 font-semibold text-gray-900 bg-gray-50">Ongoing Health Surveillance:</td>
                          <td className="px-4 py-2 border-2 border-gray-400 text-gray-900">{sharedData.healthSurveillance ? 'In Place' : 'Not In Place'}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 4: Exposure Routes & Risk Scoring (5x5 Matrix) */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
              <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                <h4 className="text-sm font-semibold text-white">
                  4. EXPOSURE ROUTES & RISK SCORING (5x5 Matrix)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 border-2 border-gray-400 font-bold text-gray-900" rowSpan={2}>EXPOSURE ROUTE</th>
                      <th className="px-3 py-2 border-2 border-gray-400 font-bold text-gray-900 text-center" colSpan={3}>INHALATION</th>
                      <th className="px-3 py-2 border-2 border-gray-400 font-bold text-gray-900 text-center" colSpan={3}>INGESTION</th>
                      <th className="px-3 py-2 border-2 border-gray-400 font-bold text-gray-900 text-center" colSpan={3}>SKIN/EYE CONTACT:</th>
                      <th className="px-3 py-2 border-2 border-gray-400 font-bold text-gray-900 text-center" colSpan={3}>OTHER:</th>
                    </tr>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1 border-2 border-gray-400 font-bold text-gray-900 text-center text-[10px]">LIKELY</th>
                      <th className="px-2 py-1 border-2 border-gray-400 font-bold text-gray-900 text-center text-[10px]">SEVERITY HARM</th>
                      <th className="px-2 py-1 border-2 border-gray-400 font-bold text-gray-900 text-center text-[10px]">RISK</th>
                      <th className="px-2 py-1 border-2 border-gray-400 font-bold text-gray-900 text-center text-[10px]">LIKELY</th>
                      <th className="px-2 py-1 border-2 border-gray-400 font-bold text-gray-900 text-center text-[10px]">SEVERITY HARM</th>
                      <th className="px-2 py-1 border-2 border-gray-400 font-bold text-gray-900 text-center text-[10px]">RISK</th>
                      <th className="px-2 py-1 border-2 border-gray-400 font-bold text-gray-900 text-center text-[10px]">LIKELY</th>
                      <th className="px-2 py-1 border-2 border-gray-400 font-bold text-gray-900 text-center text-[10px]">SEVERITY HARM</th>
                      <th className="px-2 py-1 border-2 border-gray-400 font-bold text-gray-900 text-center text-[10px]">RISK</th>
                      <th className="px-2 py-1 border-2 border-gray-400 font-bold text-gray-900 text-center text-[10px]">LIKELY</th>
                      <th className="px-2 py-1 border-2 border-gray-400 font-bold text-gray-900 text-center text-[10px]">SEVERITY HARM</th>
                      <th className="px-2 py-1 border-2 border-gray-400 font-bold text-gray-900 text-center text-[10px]">RISK</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="px-3 py-2 border-2 border-gray-400 font-bold text-gray-900" colSpan={13}>TASKS / RISK SCORING</td>
                    </tr>
                    {/* Dummy data - will be populated from chat workflow */}
                    <tr>
                      <td className="px-3 py-2 border-2 border-gray-400 font-semibold text-gray-900">Spraying Tanks</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">5</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">2</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center bg-yellow-400 font-bold text-gray-900">10</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">1</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">3</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center bg-green-400 font-bold text-gray-900">3</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">5</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">4</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center bg-red-500 font-bold text-white">20</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">-</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">-</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">-</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-2 border-gray-400 font-semibold text-gray-900">Mixing, Decanting & Pumping Chemicals</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">2</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">2</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center bg-green-300 font-bold text-gray-900">4</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">1</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">3</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center bg-green-400 font-bold text-gray-900">3</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">4</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">4</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center bg-orange-500 font-bold text-white">16</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">-</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">-</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">-</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-2 border-gray-400 font-semibold text-gray-900">Handling Containers</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">1</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">2</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center bg-green-300 font-bold text-gray-900">2</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">1</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">3</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center bg-green-400 font-bold text-gray-900">3</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">1</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">4</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center bg-yellow-400 font-bold text-gray-900">4</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">-</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">-</td>
                      <td className="px-2 py-2 border-2 border-gray-400 text-center text-gray-900">-</td>
                    </tr>
                    <tr className="italic text-gray-700">
                      <td className="px-3 py-2 border-2 border-gray-400" colSpan={13}>Additional tasks will be generated through chat workflow...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 5: Operational Controls & Precautions */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
              <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                <h4 className="text-sm font-semibold text-white">
                  5. OPERATIONAL CONTROLS & PRECAUTIONS
                </h4>
              </div>
              <div className="p-4 space-y-2 text-xs text-gray-900">
                <div className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>Decant/Mix/Pump concentrated chemicals in outdoor/well ventilated areas only.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>Water supply readily available for emergency washes down of spills/persons. If applicable eyes wash bottles placed at plumbed stations.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>Work area / chemical drums to be suitably barriered, warning signage displayed and supervised by EPSCO preventing unauthorised access.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>Ensure spill kit is close at hand and all drains close by are identified.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>DO not discharge chemical solution to unapproved drains or water courses.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>Follow training on use and application of chemicals.</span>
                </div>
                <div className="text-gray-800 italic mt-3">
                  Additional controls to be generated from P-phrases and task requirements through chat workflow
                </div>
              </div>
            </div>

            {/* Section 6: PPE Requirements */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
              <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                <h4 className="text-sm font-semibold text-white">
                  6. PPE REQUIREMENTS
                </h4>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {/* IN WORK AREA/HANDLING CONTAINERS (CLOSED) */}
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 uppercase mb-2 pb-1 border-b border-gray-200">
                      IN WORK AREA/HANDLING CONTAINERS (CLOSED):
                    </h5>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          ✓
                        </div>
                        <span className="text-xs text-gray-900">Safety Glasses/Goggles</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          ✓
                        </div>
                        <span className="text-xs text-gray-900">Chemical Resistant Gloves</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          ✓
                        </div>
                        <span className="text-xs text-gray-900">Protective Coveralls</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          ✓
                        </div>
                        <span className="text-xs text-gray-900">Safety Boots</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-800 italic mt-2">
                      PPE requirements will be generated based on task and exposure route risk scores
                    </div>
                  </div>

                  {/* MIXING/DECANTING/SPRAYING */}
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 uppercase mb-2 pb-1 border-b border-gray-200">
                      MIXING/DECANTING/SPRAYING:
                    </h5>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                        <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          ✓
                        </div>
                        <span className="text-xs text-gray-900">Full Face Shield</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                        <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          ✓
                        </div>
                        <span className="text-xs text-gray-900">Nitrile Gloves (Heavy Duty)</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                        <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          ✓
                        </div>
                        <span className="text-xs text-gray-900">Chemical Suit (Type 3/4)</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                        <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          ✓
                        </div>
                        <span className="text-xs text-gray-900">RPE: A1P2 Half Mask (Face-fit tested)</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                        <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          ✓
                        </div>
                        <span className="text-xs text-gray-900">Chemical Resistant Boots</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 7: Residual Risk of Exposure with Controls */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
              <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                <h4 className="text-sm font-semibold text-white">
                  7. RESIDUAL RISK OF EXPOSURE WITH CONTROLS
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900">INHALATION:</th>
                      <th className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900">INGESTION:</th>
                      <th className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900">SKIN/EYE CONTACT:</th>
                      <th className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900">OTHER:</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 border-2 border-gray-400 text-center bg-green-400 font-bold">LOW RISK</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-center bg-green-400 font-bold">LOW RISK</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-center bg-yellow-400 font-bold">MODERATE RISK</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-center font-bold">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-3 text-xs text-gray-600 italic bg-gray-50">
                Calculated from task-based risk scores after controls applied
              </div>
            </div>

            {/* Section 8: Monitoring Requirements */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
              <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                <h4 className="text-sm font-semibold text-white">
                  8. MONITORING REQUIREMENTS
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 border-2 border-gray-400 font-bold text-gray-900 uppercase" colSpan={4}>
                        EXPOSURE MONITORING REQUIRED? ("X" APPROPRIATE BOX)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border-2 border-gray-400 text-center font-bold text-gray-900 bg-green-100 w-1/4">
                        <div className="flex items-center justify-center gap-2">
                          <input type="checkbox" className="w-5 h-5" checked readOnly />
                          <span className="text-sm">YES</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-center font-bold text-gray-900 w-1/4">
                        <div className="flex items-center justify-center gap-2">
                          <input type="checkbox" className="w-5 h-5" />
                          <span className="text-sm">NO</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-center font-bold text-gray-900 w-1/4">
                        <div className="flex items-center justify-center gap-2">
                          <input type="checkbox" className="w-5 h-5" />
                          <span className="text-sm">N/A</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900" colSpan={4}>
                        <div className="font-bold mb-2">Monitoring Details:</div>
                        <div>Hydrochloric Acid vapours in atmosphere within confined spaces can be monitored using Gastec Passive-Dosi tubes. Where spraying in confined space with Full face respirator - monitoring is not required.</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-3 text-xs text-gray-800 italic bg-gray-50">
                To be generated based on substance properties, WELs, and confined space work
              </div>
            </div>

            {/* Section 9: Resultant Risks */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
              <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                <h4 className="text-sm font-semibold text-white">
                  9. RESULTANT RISKS
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 w-1/4 uppercase">Equipment/Hose Failure</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        Splitting of hoses and leaking valves. Equipment all undergoes regular periodic maintenance and inspection, with EPSCO personnel trained in equipment maintenance. All equipment inspected prior to dispatch and prior to use.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 uppercase">Slips, Trips or Falls</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        Could result in unplanned, unexpected contact with chemical. Ensure work area is kept clear, well-lit, and free from trip hazards.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 uppercase">Human Error</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        Operative accidentally spills chemical drum/tub, or discharges contrary to guidance, consent and training. Ensure all personnel are adequately trained and supervised.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-3 text-xs text-gray-800 italic bg-gray-50">
                Additional risks to be identified through chat workflow based on tasks and environment
              </div>
            </div>

            {/* Section 10: First Aid */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
              <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                <h4 className="text-sm font-semibold text-white">
                  10. FIRST AID
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <tbody>
                    <tr className="bg-yellow-50">
                      <td className="px-4 py-3 border-2 border-gray-400 font-bold text-gray-900" colSpan={2}>
                        In all cases of contact with the product call for immediate assistance from the designated First Aider.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 w-1/4 uppercase">General Advice</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        Take off dirty, soaked clothing immediately. In case of accident or illness contact a doctor immediately, if possible show safety data sheet.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 uppercase">Skin Contact</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        Remove any contaminated clothing and/or PPE and rinse immediately with water. If burns have resulted consult a doctor.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 uppercase">Eye Contact</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        Rinse immediately and thoroughly for 10-15 minutes with water while holding eye lids open. Consult a doctor.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 uppercase">Ingestion</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        Wash out mouth and drink plenty of water. Do not induce vomiting, consult a doctor.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 uppercase">Inhalation</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        Provide fresh air. Consult a doctor in case of illness. Where person is unconscious use artificial respiration but do not give mouth to mouth.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-3 text-xs text-gray-800 italic bg-gray-50">
                First aid measures extracted from SDS Section 4
              </div>
            </div>

            {/* Section 11: Fire */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
              <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                <h4 className="text-sm font-semibold text-white">
                  11. FIRE
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 w-1/4 uppercase">Flammability</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        <div className="font-bold mb-1">ALL products are non-flammable</div>
                        <div className="text-red-600 font-semibold">However: May release oxygen during decomposition which will support fire.</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 uppercase">Fire Fighting</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        Self-contained breathing apparatus (BA) and protective suit required.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 uppercase">Extinguishing Media</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        Foam, Dry Powder, <span className="font-bold text-red-600">WATER*</span> (see warnings below)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 uppercase">Hazardous Combustion Products</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        <div className="space-y-1">
                          <div>• <span className="font-bold">EPSOLVE D1 and EPSOLVE HD1:</span> Hydrogen Chloride</div>
                          <div>• <span className="font-bold">EPSOLVE D2:</span> Oxygen</div>
                          <div>• <span className="font-bold">MICROSOLVE 3:</span> Alkali mist</div>
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-red-50">
                      <td className="px-4 py-3 border-2 border-red-400 font-bold text-red-600 uppercase" colSpan={2}>
                        <div className="space-y-1">
                          <div>⚠ *USE WATER ONLY WHERE MICROSOLVE 1 IS PRESENT!</div>
                          <div>⚠ DO NOT USE WATER WHERE MICROSOLVE 3 IS PRESENT!</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-3 text-xs text-gray-800 italic bg-gray-50">
                Fire information extracted from SDS Section 5
              </div>
            </div>

            {/* Section 12: Environment */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
              <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                <h4 className="text-sm font-semibold text-white">
                  12. ENVIRONMENT
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 w-1/4 uppercase">Environmental Hazards</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        Readily biodegradable in water. Do not allow to enter water courses in large volumes or neat form as may cause acidification. Does not encourage Bio-accumulation but may harm sewerage network.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 uppercase">Method of Disposal</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        Can be disposed of observing local legislation, where appropriate diluting and neutralizing to approx. pH 7. Neutralize using MICROSOLVE 3.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 uppercase">Spillage Procedures</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        Block surface water drains. Use absorbents - inert material such as gravel/sand to mop up spillages involving EPSOLVE D2. Dilute with plenty of water. Materials should be disposed of as special waste using a licensed contractor.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 bg-gray-50 uppercase">Packaging Disposal</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        Should be cleaned thoroughly using water. DISPOSABLE drums are to be returned for recycling/disposal by licensed contractor. Recommended Cleaning Agent: Water
                      </td>
                    </tr>
                    <tr className="bg-red-50">
                      <td className="px-4 py-3 border-2 border-red-400 font-bold text-red-600 uppercase" colSpan={2}>
                        ⚠ Un-cleaned packaging should be considered hazardous/special waste.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-3 text-xs text-gray-800 italic bg-gray-50">
                Environmental information extracted from SDS Sections 12 & 13
              </div>
            </div>

            {/* Section 13: Storage and Handling */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm mb-4">
              <div className="bg-gray-800 px-4 py-3 rounded-t-lg">
                <h4 className="text-sm font-semibold text-white">
                  13. STORAGE AND HANDLING
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 uppercase w-1/4">Storage Requirements:</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        <div className="space-y-1">
                          <div>• Store in original containers with labels intact</div>
                          <div>• Keep containers tightly closed when not in use</div>
                          <div>• Store in cool, dry, well-ventilated area away from heat sources and direct sunlight</div>
                          <div>• Keep away from incompatible materials (acids, alkalis, oxidizing agents)</div>
                          <div>• Store in designated chemical storage area with appropriate signage</div>
                          <div>• Ensure storage area has bund/containment for spills</div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-2 border-gray-400 font-bold text-gray-900 uppercase bg-gray-50">Handling Precautions:</td>
                      <td className="px-4 py-3 border-2 border-gray-400 text-gray-900">
                        <div className="space-y-1">
                          <div>• Handle containers with care - avoid dropping or rough handling</div>
                          <div>• Ensure containers are properly labeled and dated</div>
                          <div>• Use mechanical handling equipment where appropriate</div>
                          <div>• Inspect containers for damage or leaks before handling</div>
                          <div>• Follow COSHH safe systems of work at all times</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-3 text-xs text-gray-800 italic bg-gray-50">
                Storage and handling requirements to be extracted from SDS Section 7 and customized based on workplace conditions
              </div>
            </div>

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
