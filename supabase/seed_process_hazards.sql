-- =============================================
-- SEED DATA: PROCESS-GENERATED HAZARDS
-- Common workplace hazards without SDS
-- =============================================

-- Clear existing data
TRUNCATE TABLE public.process_hazard_control_measures CASCADE;
TRUNCATE TABLE public.process_generated_hazards CASCADE;

-- =============================================
-- INSERT PROCESS-GENERATED HAZARDS
-- =============================================

INSERT INTO public.process_generated_hazards (
    hazard_name, hazard_category, process_type,
    physical_form, particle_size,
    equivalent_h_codes, hazard_description,
    has_eh40_wel, wel_8hr_twa_mgm3, wel_15min_stel_mgm3, wel_notes,
    is_carcinogen, is_respiratory_sensitiser, is_asthmagen, is_skin_sensitiser,
    inhalation_severity, skin_eye_severity, ingestion_severity,
    health_effects, acute_effects, target_organs,
    hse_guidance_link, additional_notes
) VALUES

-- =============================================
-- WELDING & HOT WORK FUMES
-- =============================================

('Welding fume (general)', 'Welding fumes', 'Welding (MIG, TIG, arc, oxy-acetylene)',
 'Fume', 'Respirable (<10 µm)',
 ARRAY['H350', 'H334', 'H335', 'H372'], -- Carcinogen, resp. sens., STOT-RE
 'Complex mixture of metal oxides, fluorides and gases produced during welding',
 TRUE, 5.0, NULL, 'General welding fume WEL (as total inhalable)',
 TRUE, TRUE, TRUE, FALSE,
 5, 2, 0,
 'Lung cancer, occupational asthma, chronic obstructive lung disease, metal fume fever',
 'Cough, shortness of breath, eye irritation, flu-like symptoms (metal fume fever)',
 ARRAY['Lungs', 'Respiratory system', 'Eyes'],
 'https://www.hse.gov.uk/welding/index.htm',
 'IARC Group 1 carcinogen. WEL lowered in 2019 from 5 mg/m³ to 5 mg/m³ (inhalable)'),

('Stainless steel welding fume', 'Welding fumes', 'Welding stainless steel',
 'Fume', 'Respirable (<10 µm)',
 ARRAY['H350', 'H334', 'H372', 'H317'], -- Carcinogen, resp. sens., STOT-RE, skin sens.
 'Contains chromium VI and nickel - higher cancer risk than mild steel welding',
 TRUE, 5.0, NULL, 'General welding fume WEL (as total inhalable)',
 TRUE, TRUE, TRUE, TRUE,
 5, 3, 0,
 'Lung cancer (chromium VI), occupational asthma, chrome ulcers (skin)',
 'Respiratory irritation, skin burns from hot metal',
 ARRAY['Lungs', 'Respiratory system', 'Skin', 'Nasal passages'],
 'https://www.hse.gov.uk/welding/stainless-steel.htm',
 'Contains hexavalent chromium (Cr(VI)) - Group 1 carcinogen'),

('Solder fume (lead-free)', 'Welding fumes', 'Soldering',
 'Fume', 'Respirable (<10 µm)',
 ARRAY['H335', 'H315'], -- STOT-SE Cat 3, skin irritation
 'Fume from lead-free solder containing tin, copper, silver',
 FALSE, NULL, NULL, 'No specific WEL - use general metal fume controls',
 FALSE, FALSE, FALSE, FALSE,
 3, 2, 0,
 'Respiratory irritation with prolonged exposure',
 'Eye and respiratory tract irritation',
 ARRAY['Respiratory system', 'Eyes'],
 'https://www.hse.gov.uk/pubns/indg248.htm',
 'Rosin-based flux can cause occupational asthma (H334)'),

('Solder fume (lead-based)', 'Welding fumes', 'Soldering (lead solder)',
 'Fume', 'Respirable (<10 µm)',
 ARRAY['H360', 'H372', 'H302'], -- Reproductive toxicant, STOT-RE, harmful if swallowed
 'Fume from lead-tin solder - contains lead',
 TRUE, 0.15, NULL, 'Lead compounds (as Pb) - biological monitoring required',
 FALSE, FALSE, FALSE, FALSE,
 4, 1, 3,
 'Lead poisoning, reproductive harm, neurological effects',
 'Headache, nausea, metallic taste',
 ARRAY['Nervous system', 'Blood', 'Kidneys', 'Reproductive organs'],
 'https://www.hse.gov.uk/pubns/indg305.htm',
 'Biological monitoring required (blood lead). Being phased out.'),

-- =============================================
-- WOOD DUST
-- =============================================

('Hardwood dust', 'Wood dust', 'Cutting, sanding, routing hardwood',
 'Dust', 'Inhalable (<100 µm)',
 ARRAY['H350', 'H334', 'H335'], -- Carcinogen, resp. sens., STOT-SE
 'Dust from oak, beech, mahogany, teak, ash - established nasal cancer risk',
 TRUE, 3.0, NULL, 'WEL lowered in 2020 from 5 mg/m³ to 3 mg/m³ (inhalable)',
 TRUE, TRUE, TRUE, FALSE,
 5, 2, 0,
 'Nasal cancer, occupational asthma, dermatitis',
 'Nasal congestion, sneezing, coughing, eye irritation',
 ARRAY['Nasal passages', 'Lungs', 'Respiratory system', 'Skin', 'Eyes'],
 'https://www.hse.gov.uk/woodworking/index.htm',
 'Group 1 carcinogen (IARC). Higher risk than softwood. Health surveillance recommended.'),

('Softwood dust', 'Wood dust', 'Cutting, sanding, routing softwood',
 'Dust', 'Inhalable (<100 µm)',
 ARRAY['H334', 'H335', 'H315'], -- Resp. sens., STOT-SE, skin irritation
 'Dust from pine, fir, spruce, cedar - respiratory sensitiser',
 TRUE, 5.0, NULL, 'WEL 5 mg/m³ (inhalable)',
 FALSE, TRUE, TRUE, FALSE,
 4, 2, 0,
 'Occupational asthma, chronic bronchitis, dermatitis',
 'Coughing, sneezing, nasal irritation, skin rash',
 ARRAY['Respiratory system', 'Nasal passages', 'Skin', 'Eyes'],
 'https://www.hse.gov.uk/woodworking/index.htm',
 'Lower cancer risk than hardwood but still respiratory hazard'),

('MDF dust', 'Wood dust', 'Cutting, sanding MDF (Medium Density Fibreboard)',
 'Dust', 'Inhalable (<100 µm)',
 ARRAY['H350', 'H334', 'H335', 'H317'], -- Carcinogen, resp. sens., STOT-SE, skin sens.
 'Composite wood product containing formaldehyde resin binders',
 TRUE, 3.0, NULL, 'WEL 3 mg/m³ (as hardwood dust)',
 TRUE, TRUE, TRUE, TRUE,
 5, 3, 0,
 'Nasal cancer (formaldehyde), occupational asthma, dermatitis',
 'Eye, nose and throat irritation, coughing, skin rash',
 ARRAY['Nasal passages', 'Respiratory system', 'Eyes', 'Skin'],
 'https://www.hse.gov.uk/woodworking/mdf.htm',
 'Contains formaldehyde (Group 1 carcinogen). Higher hazard than solid wood.'),

-- =============================================
-- SILICA DUST
-- =============================================

('Respirable Crystalline Silica (RCS)', 'Silica dust', 'Cutting, grinding, drilling stone/concrete/brick',
 'Dust', 'Respirable (<10 µm)',
 ARRAY['H350', 'H372'], -- Carcinogen, STOT-RE
 'Fine silica dust from cutting, grinding, drilling stone, concrete, brick, tiles',
 TRUE, 0.1, NULL, 'WEL lowered in 2020 from 0.3 mg/m³ to 0.1 mg/m³ (respirable)',
 TRUE, FALSE, FALSE, FALSE,
 5, 1, 0,
 'Silicosis (irreversible lung disease), lung cancer, COPD',
 'Coughing, shortness of breath',
 ARRAY['Lungs', 'Respiratory system'],
 'https://www.hse.gov.uk/silica/index.htm',
 'Group 1 carcinogen. WEL significantly lowered in 2020. Health surveillance required for regular exposure.'),

('Sandblasting dust (silica)', 'Silica dust', 'Abrasive blasting',
 'Dust', 'Respirable (<10 µm)',
 ARRAY['H350', 'H372'], -- Carcinogen, STOT-RE
 'Extremely high exposure to respirable crystalline silica from sandblasting',
 TRUE, 0.1, NULL, 'RCS WEL 0.1 mg/m³ (respirable)',
 TRUE, FALSE, FALSE, FALSE,
 5, 2, 0,
 'Acute silicosis (can develop in months with high exposure), lung cancer',
 'Severe coughing, shortness of breath, chest tightness',
 ARRAY['Lungs', 'Respiratory system'],
 'https://www.hse.gov.uk/pubns/guidance/g244.pdf',
 'Sandblasting banned in many countries. Use alternative abrasives (steel shot, garnet). Health surveillance mandatory.'),

('Concrete/cement dust', 'Silica dust', 'Mixing, cutting, grinding concrete/cement',
 'Dust', 'Respirable/Inhalable',
 ARRAY['H350', 'H318', 'H315', 'H335'], -- Carcinogen (silica), eye damage, skin/respiratory irrit.
 'Contains respirable crystalline silica and alkaline compounds (calcium oxide)',
 TRUE, 0.1, NULL, 'RCS component: 0.1 mg/m³. Cement dust: 10 mg/m³ (inhalable)',
 TRUE, FALSE, FALSE, FALSE,
 5, 4, 1,
 'Silicosis, lung cancer, cement dermatitis (chemical burns)',
 'Eye damage (alkaline), skin burns, respiratory irritation',
 ARRAY['Lungs', 'Eyes', 'Skin', 'Respiratory system'],
 'https://www.hse.gov.uk/construction/healthrisks/hazardous-substances/silica.htm',
 'Dual hazard: silica (cancer) + alkaline (burns). Wet methods reduce dust.'),

-- =============================================
-- METALWORKING FLUIDS (MWF)
-- =============================================

('Metalworking fluid mist', 'Metalworking fluids', 'Machining, grinding, turning with coolant',
 'Mist/Aerosol', 'Respirable (<10 µm)',
 ARRAY['H334', 'H317', 'H315'], -- Resp. sens., skin sens., skin irritation
 'Mist/aerosol from metal cutting/grinding fluids (water-based or oil-based)',
 TRUE, 5.0, NULL, 'WEL 5 mg/m³ (mist), 0.2 mg/m³ (steam)',
 FALSE, TRUE, TRUE, TRUE,
 4, 3, 0,
 'Occupational asthma, dermatitis, chronic bronchitis',
 'Cough, wheeze, skin rash, eye irritation',
 ARRAY['Lungs', 'Respiratory system', 'Skin'],
 'https://www.hse.gov.uk/metalworking/index.htm',
 'Can become contaminated with bacteria/fungi increasing health risk. Regular maintenance essential.'),

-- =============================================
-- DIESEL & COMBUSTION PRODUCTS
-- =============================================

('Diesel Engine Exhaust Emissions (DEEE)', 'Diesel exhaust', 'Operating diesel vehicles/equipment indoors or in confined spaces',
 'Fume/Gas', 'Respirable (<2.5 µm)',
 ARRAY['H350', 'H335', 'H331'], -- Carcinogen, STOT-SE, toxic if inhaled
 'Complex mixture of gases and particulates from diesel combustion',
 FALSE, NULL, NULL, 'No UK WEL - use exhaust extraction and ventilation',
 TRUE, FALSE, FALSE, FALSE,
 5, 1, 0,
 'Lung cancer (IARC Group 1), cardiovascular disease, respiratory illness',
 'Headache, dizziness, nausea, eye/throat irritation',
 ARRAY['Lungs', 'Respiratory system', 'Cardiovascular system'],
 'https://www.hse.gov.uk/pubns/priced/hsg187.pdf',
 'IARC Group 1 carcinogen. Eliminate indoor diesel use where possible. Use exhaust extraction.'),

('Carbon monoxide (vehicle exhaust)', 'Vehicle exhaust', 'Running engines indoors (cars, forklifts, generators)',
 'Gas', 'N/A (gas)',
 ARRAY['H331', 'H360D', 'H372'], -- Toxic if inhaled, reproductive harm, STOT-RE
 'Colourless, odourless gas from incomplete combustion',
 TRUE, 20.0, 100.0, 'WEL 20 ppm 8-hr TWA, 100 ppm 15-min STEL',
 FALSE, FALSE, FALSE, FALSE,
 5, 0, 0,
 'Poisoning (binds to haemoglobin), heart damage, reproductive harm',
 'Headache, dizziness, nausea, confusion, unconsciousness, death',
 ARRAY['Blood', 'Brain', 'Heart', 'Reproductive organs'],
 'https://www.hse.gov.uk/carbonmonoxide/index.htm',
 'Silent killer - no warning. CO monitors essential in indoor vehicle areas.'),

-- =============================================
-- FLOUR & GRAIN DUST
-- =============================================

('Flour dust', 'Flour/grain dust', 'Mixing, sieving, handling flour (bakeries, food production)',
 'Dust', 'Inhalable (<100 µm)',
 ARRAY['H334', 'H335'], -- Resp. sens., STOT-SE
 'Wheat, rye, or other grain flour dust - major cause of baker''s asthma',
 TRUE, 10.0, NULL, 'WEL 10 mg/m³ (inhalable)',
 FALSE, TRUE, TRUE, FALSE,
 4, 1, 0,
 'Occupational asthma (baker''s asthma), rhinitis, dermatitis',
 'Cough, wheeze, chest tightness, nasal congestion',
 ARRAY['Respiratory system', 'Nasal passages', 'Eyes'],
 'https://www.hse.gov.uk/food/allergies.htm',
 'Baker''s asthma is irreversible - early detection critical. Health surveillance required.'),

('Grain dust', 'Flour/grain dust', 'Handling, storage, processing grain (farms, mills)',
 'Dust', 'Inhalable (<100 µm)',
 ARRAY['H334', 'H335'], -- Resp. sens., STOT-SE
 'Dust from wheat, barley, oats, corn - contains allergens and contaminants',
 TRUE, 10.0, NULL, 'WEL 10 mg/m³ (inhalable)',
 FALSE, TRUE, TRUE, FALSE,
 4, 1, 0,
 'Occupational asthma, farmer''s lung, chronic bronchitis',
 'Cough, wheeze, shortness of breath, eye irritation',
 ARRAY['Respiratory system', 'Lungs'],
 'https://www.hse.gov.uk/agriculture/topics/grain-dust.htm',
 'Can contain fungal spores, bacteria, insect debris - increases hazard'),

-- =============================================
-- RUBBER & PLASTICS PROCESSING
-- =============================================

('Rubber fume (vulcanisation)', 'Rubber processing fumes', 'Rubber vulcanisation/curing',
 'Fume', 'Respirable (<10 µm)',
 ARRAY['H350', 'H334'], -- Carcinogen (possible), resp. sens.
 'Fume from heating rubber during vulcanisation process',
 FALSE, NULL, NULL, 'No specific WEL - control to lowest practicable level',
 TRUE, TRUE, FALSE, FALSE,
 4, 1, 0,
 'Possible bladder cancer risk, occupational asthma',
 'Respiratory irritation, headache, nausea',
 ARRAY['Respiratory system', 'Bladder'],
 'https://www.hse.gov.uk/pubns/guidance/ms23.pdf',
 'IARC Group 2B (possibly carcinogenic). LEV essential.'),

-- =============================================
-- STONE & MASONRY
-- =============================================

('Granite dust', 'Stone dust', 'Cutting, grinding, polishing granite',
 'Dust', 'Respirable (<10 µm)',
 ARRAY['H350', 'H372'], -- Carcinogen (high silica content), STOT-RE
 'Granite dust contains high levels of respirable crystalline silica (20-40%)',
 TRUE, 0.1, NULL, 'RCS component WEL 0.1 mg/m³',
 TRUE, FALSE, FALSE, FALSE,
 5, 1, 0,
 'Silicosis, lung cancer',
 'Coughing, shortness of breath',
 ARRAY['Lungs', 'Respiratory system'],
 'https://www.hse.gov.uk/stone/index.htm',
 'Very high silica content. Wet cutting mandatory in stone industry.'),

('Sandstone/limestone dust', 'Stone dust', 'Cutting, grinding sandstone or limestone',
 'Dust', 'Respirable (<10 µm)',
 ARRAY['H350', 'H372'], -- Carcinogen (silica), STOT-RE
 'Stone dust containing respirable crystalline silica',
 TRUE, 0.1, NULL, 'RCS component WEL 0.1 mg/m³',
 TRUE, FALSE, FALSE, FALSE,
 5, 1, 0,
 'Silicosis, lung cancer',
 'Coughing, shortness of breath',
 ARRAY['Lungs', 'Respiratory system'],
 'https://www.hse.gov.uk/stone/index.htm',
 'Sandstone has higher silica content than limestone. Wet methods essential.')

ON CONFLICT (hazard_name) DO UPDATE SET
    hazard_category = EXCLUDED.hazard_category,
    process_type = EXCLUDED.process_type,
    physical_form = EXCLUDED.physical_form,
    particle_size = EXCLUDED.particle_size,
    equivalent_h_codes = EXCLUDED.equivalent_h_codes,
    hazard_description = EXCLUDED.hazard_description,
    has_eh40_wel = EXCLUDED.has_eh40_wel,
    wel_8hr_twa_mgm3 = EXCLUDED.wel_8hr_twa_mgm3,
    wel_15min_stel_mgm3 = EXCLUDED.wel_15min_stel_mgm3,
    wel_notes = EXCLUDED.wel_notes,
    is_carcinogen = EXCLUDED.is_carcinogen,
    is_respiratory_sensitiser = EXCLUDED.is_respiratory_sensitiser,
    is_asthmagen = EXCLUDED.is_asthmagen,
    is_skin_sensitiser = EXCLUDED.is_skin_sensitiser,
    inhalation_severity = EXCLUDED.inhalation_severity,
    skin_eye_severity = EXCLUDED.skin_eye_severity,
    ingestion_severity = EXCLUDED.ingestion_severity,
    health_effects = EXCLUDED.health_effects,
    acute_effects = EXCLUDED.acute_effects,
    target_organs = EXCLUDED.target_organs,
    hse_guidance_link = EXCLUDED.hse_guidance_link,
    additional_notes = EXCLUDED.additional_notes,
    updated_at = NOW();


-- =============================================
-- INSERT CONTROL MEASURES FOR EACH HAZARD
-- =============================================

-- Helper: Get hazard IDs
DO $$
DECLARE
    welding_general_id UUID;
    welding_stainless_id UUID;
    hardwood_id UUID;
    softwood_id UUID;
    rcs_id UUID;
    mwf_id UUID;
    deee_id UUID;
    flour_id UUID;
BEGIN
    SELECT id INTO welding_general_id FROM public.process_generated_hazards WHERE hazard_name = 'Welding fume (general)';
    SELECT id INTO welding_stainless_id FROM public.process_generated_hazards WHERE hazard_name = 'Stainless steel welding fume';
    SELECT id INTO hardwood_id FROM public.process_generated_hazards WHERE hazard_name = 'Hardwood dust';
    SELECT id INTO softwood_id FROM public.process_generated_hazards WHERE hazard_name = 'Softwood dust';
    SELECT id INTO rcs_id FROM public.process_generated_hazards WHERE hazard_name = 'Respirable Crystalline Silica (RCS)';
    SELECT id INTO mwf_id FROM public.process_generated_hazards WHERE hazard_name = 'Metalworking fluid mist';
    SELECT id INTO deee_id FROM public.process_generated_hazards WHERE hazard_name = 'Diesel Engine Exhaust Emissions (DEEE)';
    SELECT id INTO flour_id FROM public.process_generated_hazards WHERE hazard_name = 'Flour dust';

    -- WELDING GENERAL - Control Measures
    INSERT INTO public.process_hazard_control_measures (
        hazard_id, control_type, control_order, control_measure, effectiveness,
        relates_to_operational_controls, relates_to_ventilation, relates_to_ppe, relates_to_monitoring, relates_to_health_surveillance,
        implementation_notes
    ) VALUES
    (welding_general_id, 'Engineering', 3, 'Local Exhaust Ventilation (LEV) - fume extraction at source', 'High', TRUE, TRUE, FALSE, FALSE, FALSE,
     'On-torch extraction or fixed extraction hood. Must capture fume before it reaches breathing zone.'),
    (welding_general_id, 'Engineering', 3, 'General ventilation - ensure adequate air changes', 'Medium', TRUE, TRUE, FALSE, FALSE, FALSE,
     'Not sufficient on its own - supplement to LEV'),
    (welding_general_id, 'Administrative', 4, 'Limit duration of welding tasks', 'Medium', TRUE, FALSE, FALSE, FALSE, FALSE,
     'Job rotation to reduce individual exposure'),
    (welding_general_id, 'PPE', 5, 'Respiratory Protective Equipment (RPE) - FFP3 mask or powered air respirator', 'High', FALSE, FALSE, TRUE, FALSE, FALSE,
     'Face-fit testing required for tight-fitting masks. RPE must be adequate for fume type.'),
    (welding_general_id, 'Administrative', 4, 'Health surveillance - respiratory questionnaire and lung function tests', 'High', FALSE, FALSE, FALSE, TRUE, TRUE,
     'Annual health surveillance for regular welders (>30 days/year)'),
    (welding_general_id, 'Administrative', 4, 'Air monitoring - measure fume exposure', 'High', FALSE, FALSE, FALSE, TRUE, FALSE,
     'Personal air sampling to verify controls are adequate');

    -- HARDWOOD DUST - Control Measures
    INSERT INTO public.process_hazard_control_measures (
        hazard_id, control_type, control_order, control_measure, effectiveness,
        relates_to_operational_controls, relates_to_ventilation, relates_to_ppe, relates_to_monitoring, relates_to_health_surveillance,
        implementation_notes
    ) VALUES
    (hardwood_id, 'Engineering', 3, 'LEV - on-tool dust extraction', 'High', TRUE, TRUE, FALSE, FALSE, FALSE,
     'Extract dust at point of generation (saws, sanders, routers)'),
    (hardwood_id, 'Engineering', 3, 'Enclosed extraction booth for sanding/routing', 'High', TRUE, TRUE, FALSE, FALSE, FALSE,
     'Enclose dusty operations where possible'),
    (hardwood_id, 'Administrative', 4, 'Regular cleaning using vacuum (not sweeping)', 'Medium', TRUE, FALSE, FALSE, FALSE, FALSE,
     'Sweeping spreads dust. Use H-class vacuum.'),
    (hardwood_id, 'PPE', 5, 'RPE - FFP3 mask or powered air respirator', 'High', FALSE, FALSE, TRUE, FALSE, FALSE,
     'Face-fit tested. Hardwood is Group 1 carcinogen - strict RPE required.'),
    (hardwood_id, 'Administrative', 4, 'Health surveillance - respiratory questionnaire and nasal examination', 'High', FALSE, FALSE, FALSE, TRUE, TRUE,
     'Annual health surveillance mandatory for regular hardwood workers');

    -- RESPIRABLE CRYSTALLINE SILICA - Control Measures
    INSERT INTO public.process_hazard_control_measures (
        hazard_id, control_type, control_order, control_measure, effectiveness,
        relates_to_operational_controls, relates_to_ventilation, relates_to_ppe, relates_to_monitoring, relates_to_health_surveillance,
        implementation_notes
    ) VALUES
    (rcs_id, 'Substitution', 2, 'Use low-silica abrasives (steel shot, garnet) instead of sand', 'High', TRUE, FALSE, FALSE, FALSE, FALSE,
     'Applies to abrasive blasting only'),
    (rcs_id, 'Engineering', 3, 'Wet cutting/grinding - water suppression', 'High', TRUE, FALSE, FALSE, FALSE, FALSE,
     'Reduces dust by 90%. Mandatory in stone industry.'),
    (rcs_id, 'Engineering', 3, 'On-tool dust extraction (vacuum with H-class filter)', 'High', TRUE, TRUE, FALSE, FALSE, FALSE,
     'For dry cutting (emergency only). Wet methods preferred.'),
    (rcs_id, 'Administrative', 4, 'Restrict access to dusty areas', 'Medium', TRUE, FALSE, FALSE, FALSE, FALSE,
     'Reduce number of exposed workers'),
    (rcs_id, 'PPE', 5, 'RPE - FFP3 mask minimum, powered air respirator for prolonged work', 'High', FALSE, FALSE, TRUE, FALSE, FALSE,
     'RCS is Group 1 carcinogen. Tight-fitting FFP3 face-fit tested.'),
    (rcs_id, 'Administrative', 4, 'Health surveillance - respiratory questionnaire, lung function, chest X-ray', 'High', FALSE, FALSE, FALSE, TRUE, TRUE,
     'Mandatory for regular RCS exposure. Detect silicosis early.'),
    (rcs_id, 'Administrative', 4, 'Air monitoring - personal sampling', 'High', FALSE, FALSE, FALSE, TRUE, FALSE,
     'WEL 0.1 mg/m³ very low - monitoring essential to verify controls');

    -- METALWORKING FLUIDS - Control Measures
    INSERT INTO public.process_hazard_control_measures (
        hazard_id, control_type, control_order, control_measure, effectiveness,
        relates_to_operational_controls, relates_to_ventilation, relates_to_ppe, relates_to_monitoring, relates_to_health_surveillance,
        implementation_notes
    ) VALUES
    (mwf_id, 'Engineering', 3, 'Machine enclosure with mist extraction', 'High', TRUE, TRUE, FALSE, FALSE, FALSE,
     'Enclose machining operations. Extract mist before it escapes.'),
    (mwf_id, 'Administrative', 4, 'Regular MWF maintenance - monitor concentration, pH, bacteria', 'High', TRUE, FALSE, FALSE, FALSE, FALSE,
     'Contaminated MWF increases health risk. Weekly monitoring.'),
    (mwf_id, 'Administrative', 4, 'Use biocide to control bacterial growth', 'Medium', TRUE, FALSE, FALSE, FALSE, FALSE,
     'Follow manufacturer guidance. Over-use can cause skin irritation.'),
    (mwf_id, 'PPE', 5, 'Skin protection - gloves and apron (water-resistant)', 'Medium', FALSE, FALSE, TRUE, FALSE, FALSE,
     'Prevent prolonged skin contact. Wash hands before breaks.'),
    (mwf_id, 'Administrative', 4, 'Health surveillance - skin checks and respiratory questionnaire', 'Medium', FALSE, FALSE, FALSE, TRUE, TRUE,
     'Annual surveillance for workers with regular MWF exposure');

    -- DIESEL ENGINE EXHAUST - Control Measures
    INSERT INTO public.process_hazard_control_measures (
        hazard_id, control_type, control_order, control_measure, effectiveness,
        relates_to_operational_controls, relates_to_ventilation, relates_to_ppe, relates_to_monitoring, relates_to_health_surveillance,
        implementation_notes
    ) VALUES
    (deee_id, 'Elimination', 1, 'Eliminate indoor use of diesel vehicles - use electric/LPG forklifts', 'High', TRUE, FALSE, FALSE, FALSE, FALSE,
     'Best control - remove diesel source'),
    (deee_id, 'Engineering', 3, 'Exhaust extraction - connect vehicle exhaust to extraction system', 'High', TRUE, TRUE, FALSE, FALSE, FALSE,
     'For vehicles that must operate indoors (emergency vehicles, workshops)'),
    (deee_id, 'Engineering', 3, 'General ventilation - increase air changes', 'Medium', TRUE, TRUE, FALSE, FALSE, FALSE,
     'Not sufficient alone - supplement to exhaust extraction'),
    (deee_id, 'Administrative', 4, 'Limit idling time - switch off engines when stationary', 'Medium', TRUE, FALSE, FALSE, FALSE, FALSE,
     'Reduce emissions at source'),
    (deee_id, 'Administrative', 4, 'Use modern diesel engines with particulate filters', 'Medium', TRUE, FALSE, FALSE, FALSE, FALSE,
     'Reduces particulate emissions by 90%');

    -- FLOUR DUST - Control Measures
    INSERT INTO public.process_hazard_control_measures (
        hazard_id, control_type, control_order, control_measure, effectiveness,
        relates_to_operational_controls, relates_to_ventilation, relates_to_ppe, relates_to_monitoring, relates_to_health_surveillance,
        implementation_notes
    ) VALUES
    (flour_id, 'Engineering', 3, 'LEV - extract dust at mixing, sieving, weighing', 'High', TRUE, TRUE, FALSE, FALSE, FALSE,
     'Capture flour dust before it becomes airborne'),
    (flour_id, 'Administrative', 4, 'Use vacuum cleaning (not sweeping or compressed air)', 'Medium', TRUE, FALSE, FALSE, FALSE, FALSE,
     'Sweeping/blowing spreads allergens. H-class vacuum only.'),
    (flour_id, 'Engineering', 3, 'Automate flour handling - reduce manual contact', 'High', TRUE, FALSE, FALSE, FALSE, FALSE,
     'Enclosed transfer systems, bulk handling'),
    (flour_id, 'PPE', 5, 'RPE - FFP2 mask minimum for dusty tasks', 'Medium', FALSE, FALSE, TRUE, FALSE, FALSE,
     'RPE does not prevent sensitisation but reduces symptoms'),
    (flour_id, 'Administrative', 4, 'Health surveillance - respiratory questionnaire, lung function tests', 'High', FALSE, FALSE, FALSE, TRUE, TRUE,
     'Mandatory for bakers/flour handlers. Detect asthma early - relocate affected workers.');

END $$;
