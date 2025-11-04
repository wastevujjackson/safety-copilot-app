-- =============================================
-- SEED DATA: H-PHRASES (HAZARD STATEMENTS)
-- Complete GHS/CLP Hazard Statements
-- Severity Scale: 1=Negligible, 2=Low, 3=Moderate, 4=High, 5=Severe
-- =============================================

-- Clear existing data if re-running
TRUNCATE TABLE public.h_phrases CASCADE;

INSERT INTO public.h_phrases (code, description, hazard_class, category, inhalation_severity, ingestion_severity, skin_eye_severity, other_severity, signal_word, notes) VALUES

-- PHYSICAL HAZARDS
-- Explosives
('H200', 'Unstable explosive', 'Explosives', 'Unstable explosive', NULL, NULL, NULL, 5, 'Danger', 'Extreme physical hazard'),
('H201', 'Explosive; mass explosion hazard', 'Explosives', 'Division 1.1', NULL, NULL, NULL, 5, 'Danger', 'Mass explosion hazard'),
('H202', 'Explosive; severe projection hazard', 'Explosives', 'Division 1.2', NULL, NULL, NULL, 5, 'Danger', 'Severe projection hazard'),
('H203', 'Explosive; fire, blast or projection hazard', 'Explosives', 'Division 1.3', NULL, NULL, NULL, 4, 'Danger', 'Fire, blast or projection hazard'),
('H204', 'Fire or projection hazard', 'Explosives', 'Division 1.4', NULL, NULL, NULL, 3, 'Warning', 'Fire or projection hazard'),
('H205', 'May mass explode in fire', 'Explosives', 'Division 1.5', NULL, NULL, NULL, 4, 'Danger', 'May mass explode in fire'),

-- Flammable Gases
('H220', 'Extremely flammable gas', 'Flammable Gases', 'Category 1', NULL, NULL, NULL, 4, 'Danger', 'Extreme flammability'),
('H221', 'Flammable gas', 'Flammable Gases', 'Category 2', NULL, NULL, NULL, 3, 'Warning', 'Flammable'),

-- Aerosols
('H222', 'Extremely flammable aerosol', 'Aerosols', 'Category 1', NULL, NULL, NULL, 4, 'Danger', 'Extremely flammable aerosol'),
('H223', 'Flammable aerosol', 'Aerosols', 'Category 2', NULL, NULL, NULL, 3, 'Warning', 'Flammable aerosol'),
('H229', 'Pressurised container: may burst if heated', 'Aerosols', 'All categories', NULL, NULL, 2, 2, 'Warning', 'Pressurized container hazard'),

-- Oxidising Gases
('H270', 'May cause or intensify fire; oxidiser', 'Oxidising Gases', 'Category 1', 3, NULL, NULL, 4, 'Danger', 'Oxidizing gas'),

-- Gases Under Pressure
('H280', 'Contains gas under pressure; may explode if heated', 'Gases Under Pressure', 'Compressed/Liquefied/Dissolved', NULL, NULL, NULL, 3, 'Warning', 'Pressurized gas'),
('H281', 'Contains refrigerated gas; may cause cryogenic burns or injury', 'Gases Under Pressure', 'Refrigerated liquefied gas', NULL, NULL, 4, NULL, 'Warning', 'Cryogenic hazard'),

-- Flammable Liquids
('H224', 'Extremely flammable liquid and vapour', 'Flammable Liquids', 'Category 1', 3, NULL, 2, 4, 'Danger', 'Extreme flammability'),
('H225', 'Highly flammable liquid and vapour', 'Flammable Liquids', 'Category 2', 3, NULL, 2, 4, 'Danger', 'Highly flammable'),
('H226', 'Flammable liquid and vapour', 'Flammable Liquids', 'Category 3', 2, NULL, 1, 3, 'Warning', 'Flammable'),

-- Flammable Solids
('H228', 'Flammable solid', 'Flammable Solids', 'Categories 1,2', NULL, NULL, NULL, 3, 'Danger/Warning', 'Flammable solid'),

-- Self-Reactive Substances
('H240', 'Heating may cause an explosion', 'Self-Reactive Substances', 'Type A', NULL, NULL, NULL, 5, 'Danger', 'Explosive when heated'),
('H241', 'Heating may cause a fire or explosion', 'Self-Reactive Substances', 'Type B', NULL, NULL, NULL, 4, 'Danger', 'Fire/explosion hazard when heated'),
('H242', 'Heating may cause a fire', 'Self-Reactive Substances', 'Types C,D,E,F', NULL, NULL, NULL, 3, 'Danger/Warning', 'Fire hazard when heated'),

-- Pyrophoric Liquids/Solids
('H250', 'Catches fire spontaneously if exposed to air', 'Pyrophoric Liquids/Solids', 'Category 1', 3, NULL, 3, 5, 'Danger', 'Spontaneously combustible'),

-- Self-Heating Substances
('H251', 'Self-heating; may catch fire', 'Self-Heating Substances', 'Category 1', 2, NULL, 2, 4, 'Danger', 'Self-heating'),
('H252', 'Self-heating in large quantities; may catch fire', 'Self-Heating Substances', 'Category 2', 2, NULL, 2, 3, 'Warning', 'Self-heating in large quantities'),

-- Substances which in contact with water emit flammable gases
('H260', 'In contact with water releases flammable gases which may ignite spontaneously', 'Water-Reactive Substances', 'Category 1', 3, NULL, 3, 5, 'Danger', 'Reacts violently with water'),
('H261', 'In contact with water releases flammable gas', 'Water-Reactive Substances', 'Categories 2,3', 2, NULL, 2, 4, 'Danger/Warning', 'Water-reactive'),

-- Oxidising Liquids/Solids
('H271', 'May cause fire or explosion; strong oxidiser', 'Oxidising Liquids/Solids', 'Category 1', 3, NULL, 2, 5, 'Danger', 'Strong oxidizer'),
('H272', 'May intensify fire; oxidiser', 'Oxidising Liquids/Solids', 'Categories 2,3', 2, NULL, 1, 4, 'Danger/Warning', 'Oxidizer'),

-- Organic Peroxides (NOTE: H240-H242 same as Self-Reactive Substances above)

-- Corrosive to Metals
('H290', 'May be corrosive to metals', 'Corrosive to Metals', 'Category 1', 2, 2, 2, 2, 'Warning', 'Metal corrosion'),

-- HEALTH HAZARDS
-- Acute Toxicity (Oral)
('H300', 'Fatal if swallowed', 'Acute Toxicity (Oral)', 'Category 1,2', NULL, 5, NULL, NULL, 'Danger', 'Severe acute oral toxicity'),
('H301', 'Toxic if swallowed', 'Acute Toxicity (Oral)', 'Category 3', NULL, 4, NULL, NULL, 'Danger', 'Acute oral toxicity'),
('H302', 'Harmful if swallowed', 'Acute Toxicity (Oral)', 'Category 4', NULL, 3, NULL, NULL, 'Warning', 'Moderate oral toxicity'),

-- Acute Toxicity (Dermal)
('H310', 'Fatal in contact with skin', 'Acute Toxicity (Dermal)', 'Category 1,2', NULL, NULL, 5, NULL, 'Danger', 'Severe acute dermal toxicity'),
('H311', 'Toxic in contact with skin', 'Acute Toxicity (Dermal)', 'Category 3', NULL, NULL, 4, NULL, 'Danger', 'Acute dermal toxicity'),
('H312', 'Harmful in contact with skin', 'Acute Toxicity (Dermal)', 'Category 4', NULL, NULL, 3, NULL, 'Warning', 'Moderate dermal toxicity'),

-- Acute Toxicity (Inhalation)
('H330', 'Fatal if inhaled', 'Acute Toxicity (Inhalation)', 'Category 1,2', 5, NULL, NULL, NULL, 'Danger', 'Severe acute inhalation toxicity'),
('H331', 'Toxic if inhaled', 'Acute Toxicity (Inhalation)', 'Category 3', 4, NULL, NULL, NULL, 'Danger', 'Acute inhalation toxicity'),
('H332', 'Harmful if inhaled', 'Acute Toxicity (Inhalation)', 'Category 4', 3, NULL, NULL, NULL, 'Warning', 'Moderate inhalation toxicity'),

-- Skin Corrosion/Irritation
('H314', 'Causes severe skin burns and eye damage', 'Skin Corrosion', 'Category 1A,1B,1C', NULL, NULL, 5, NULL, 'Danger', 'Corrosive to skin'),
('H315', 'Causes skin irritation', 'Skin Irritation', 'Category 2', NULL, NULL, 2, NULL, 'Warning', 'Skin irritant'),

-- Serious Eye Damage/Irritation
('H318', 'Causes serious eye damage', 'Serious Eye Damage', 'Category 1', NULL, NULL, 5, NULL, 'Danger', 'Causes serious eye damage'),
('H319', 'Causes serious eye irritation', 'Eye Irritation', 'Category 2', NULL, NULL, 3, NULL, 'Warning', 'Eye irritant'),
('H320', 'Causes eye irritation', 'Eye Irritation', 'Category 2B', NULL, NULL, 2, NULL, 'Warning', 'Mild eye irritant'),

-- Respiratory/Skin Sensitisation
('H334', 'May cause allergy or asthma symptoms or breathing difficulties if inhaled', 'Respiratory Sensitisation', 'Category 1', 4, NULL, NULL, NULL, 'Danger', 'Respiratory sensitizer'),
('H317', 'May cause an allergic skin reaction', 'Skin Sensitisation', 'Category 1', NULL, NULL, 3, NULL, 'Warning', 'Skin sensitizer'),

-- Germ Cell Mutagenicity
('H340', 'May cause genetic defects', 'Germ Cell Mutagenicity', 'Category 1A,1B', 4, 4, 3, NULL, 'Danger', 'Mutagenic'),
('H341', 'Suspected of causing genetic defects', 'Germ Cell Mutagenicity', 'Category 2', 3, 3, 2, NULL, 'Warning', 'Suspected mutagen'),

-- Carcinogenicity
('H350', 'May cause cancer', 'Carcinogenicity', 'Category 1A,1B', 5, 5, 4, NULL, 'Danger', 'Carcinogenic'),
('H350i', 'May cause cancer by inhalation', 'Carcinogenicity', 'Category 1A,1B', 5, NULL, NULL, NULL, 'Danger', 'Carcinogenic by inhalation'),
('H351', 'Suspected of causing cancer', 'Carcinogenicity', 'Category 2', 4, 4, 3, NULL, 'Warning', 'Suspected carcinogen'),

-- Reproductive Toxicity
('H360', 'May damage fertility or the unborn child', 'Reproductive Toxicity', 'Category 1A,1B', 4, 4, 4, NULL, 'Danger', 'Reproductive toxin'),
('H360F', 'May damage fertility', 'Reproductive Toxicity', 'Category 1A,1B', 4, 4, 4, NULL, 'Danger', 'Fertility hazard'),
('H360D', 'May damage the unborn child', 'Reproductive Toxicity', 'Category 1A,1B', 4, 4, 4, NULL, 'Danger', 'Developmental toxin'),
('H360FD', 'May damage fertility. May damage the unborn child', 'Reproductive Toxicity', 'Category 1A,1B', 4, 4, 4, NULL, 'Danger', 'Fertility and developmental hazard'),
('H360Fd', 'May damage fertility. Suspected of damaging the unborn child', 'Reproductive Toxicity', 'Category 1A,1B,2', 4, 4, 4, NULL, 'Danger', 'Fertility hazard, suspected developmental'),
('H360Df', 'May damage the unborn child. Suspected of damaging fertility', 'Reproductive Toxicity', 'Category 1A,1B,2', 4, 4, 4, NULL, 'Danger', 'Developmental hazard, suspected fertility'),
('H361', 'Suspected of damaging fertility or the unborn child', 'Reproductive Toxicity', 'Category 2', 3, 3, 3, NULL, 'Warning', 'Suspected reproductive toxin'),
('H361f', 'Suspected of damaging fertility', 'Reproductive Toxicity', 'Category 2', 3, 3, 3, NULL, 'Warning', 'Suspected fertility hazard'),
('H361d', 'Suspected of damaging the unborn child', 'Reproductive Toxicity', 'Category 2', 3, 3, 3, NULL, 'Warning', 'Suspected developmental toxin'),
('H361fd', 'Suspected of damaging fertility. Suspected of damaging the unborn child', 'Reproductive Toxicity', 'Category 2', 3, 3, 3, NULL, 'Warning', 'Suspected reproductive toxin'),
('H362', 'May cause harm to breast-fed children', 'Reproductive Toxicity (Lactation)', 'Additional category', NULL, 3, NULL, NULL, 'Warning', 'Lactation hazard'),

-- Specific Target Organ Toxicity - Single Exposure (STOT-SE)
('H370', 'Causes damage to organs', 'STOT-SE', 'Category 1', 5, 5, NULL, NULL, 'Danger', 'Causes organ damage'),
('H371', 'May cause damage to organs', 'STOT-SE', 'Category 2', 4, 4, NULL, NULL, 'Warning', 'May cause organ damage'),
('H335', 'May cause respiratory irritation', 'STOT-SE', 'Category 3', 3, NULL, NULL, NULL, 'Warning', 'Respiratory tract irritation'),
('H336', 'May cause drowsiness or dizziness', 'STOT-SE', 'Category 3', 3, NULL, NULL, NULL, 'Warning', 'CNS depression'),

-- Specific Target Organ Toxicity - Repeated Exposure (STOT-RE)
('H372', 'Causes damage to organs through prolonged or repeated exposure', 'STOT-RE', 'Category 1', 5, 5, 4, NULL, 'Danger', 'Chronic organ damage'),
('H373', 'May cause damage to organs through prolonged or repeated exposure', 'STOT-RE', 'Category 2', 4, 4, 3, NULL, 'Warning', 'May cause chronic organ damage'),

-- Aspiration Hazard
('H304', 'May be fatal if swallowed and enters airways', 'Aspiration Hazard', 'Category 1', 5, 4, NULL, NULL, 'Danger', 'Aspiration hazard'),
('H305', 'May be harmful if swallowed and enters airways', 'Aspiration Hazard', 'Category 2', 3, 2, NULL, NULL, 'Warning', 'Aspiration hazard'),

-- ENVIRONMENTAL HAZARDS
-- Hazardous to Aquatic Environment (Acute)
('H400', 'Very toxic to aquatic life', 'Aquatic Toxicity (Acute)', 'Category 1', NULL, NULL, NULL, 5, 'Warning', 'Acute aquatic toxicity'),

-- Hazardous to Aquatic Environment (Chronic)
('H410', 'Very toxic to aquatic life with long lasting effects', 'Aquatic Toxicity (Chronic)', 'Category 1', NULL, NULL, NULL, 5, 'Warning', 'Chronic aquatic toxicity'),
('H411', 'Toxic to aquatic life with long lasting effects', 'Aquatic Toxicity (Chronic)', 'Category 2', NULL, NULL, NULL, 4, 'Warning', 'Chronic aquatic toxicity'),
('H412', 'Harmful to aquatic life with long lasting effects', 'Aquatic Toxicity (Chronic)', 'Category 3', NULL, NULL, NULL, 3, 'Warning', 'Chronic aquatic toxicity'),
('H413', 'May cause long lasting harmful effects to aquatic life', 'Aquatic Toxicity (Chronic)', 'Category 4', NULL, NULL, NULL, 2, 'Warning', 'Chronic aquatic toxicity'),

-- Hazardous to the Ozone Layer
('H420', 'Harms public health and the environment by destroying ozone in the upper atmosphere', 'Ozone Layer', 'Category 1', NULL, NULL, NULL, 5, 'Danger', 'Ozone depletion'),

-- ADDITIONAL EU-SPECIFIC HAZARDS
-- Physical Hazards (Additional)
('EUH001', 'Explosive when dry', 'Physical Hazard (EU)', NULL, NULL, NULL, NULL, 5, 'Danger', 'EU-specific explosive hazard'),
('EUH006', 'Explosive with or without contact with air', 'Physical Hazard (EU)', NULL, NULL, NULL, NULL, 5, 'Danger', 'EU-specific explosive hazard'),
('EUH014', 'Reacts violently with water', 'Physical Hazard (EU)', NULL, NULL, NULL, NULL, 4, 'Danger', 'EU-specific water-reactive'),
('EUH018', 'In use may form flammable/explosive vapour-air mixture', 'Physical Hazard (EU)', NULL, 3, NULL, NULL, 3, 'Warning', 'EU-specific flammability'),
('EUH019', 'May form explosive peroxides', 'Physical Hazard (EU)', NULL, NULL, NULL, NULL, 4, 'Danger', 'EU-specific peroxide former'),
('EUH044', 'Risk of explosion if heated under confinement', 'Physical Hazard (EU)', NULL, NULL, NULL, NULL, 4, 'Danger', 'EU-specific explosion hazard'),

-- Health Hazards (Additional EU)
('EUH029', 'Contact with water liberates toxic gas', 'Health Hazard (EU)', NULL, NULL, 4, 3, 4, 'Danger', 'EU-specific toxic gas release'),
('EUH031', 'Contact with acids liberates toxic gas', 'Health Hazard (EU)', NULL, NULL, 4, 3, 4, 'Danger', 'EU-specific toxic gas release'),
('EUH032', 'Contact with acids liberates very toxic gas', 'Health Hazard (EU)', NULL, NULL, 5, 4, 5, 'Danger', 'EU-specific very toxic gas release'),
('EUH066', 'Repeated exposure may cause skin dryness or cracking', 'Health Hazard (EU)', NULL, NULL, NULL, 2, NULL, 'Warning', 'EU-specific skin effects'),
('EUH070', 'Toxic by eye contact', 'Health Hazard (EU)', NULL, NULL, NULL, 5, NULL, 'Danger', 'EU-specific eye toxicity'),
('EUH071', 'Corrosive to the respiratory tract', 'Health Hazard (EU)', NULL, 5, NULL, NULL, NULL, 'Danger', 'EU-specific respiratory corrosion'),

-- Combined Exposure
('H300+H310', 'Fatal if swallowed or in contact with skin', 'Acute Toxicity (Combined)', 'Category 1,2', NULL, 5, 5, NULL, 'Danger', 'Multiple routes - fatal'),
('H300+H330', 'Fatal if swallowed or if inhaled', 'Acute Toxicity (Combined)', 'Category 1,2', 5, 5, NULL, NULL, 'Danger', 'Multiple routes - fatal'),
('H310+H330', 'Fatal in contact with skin or if inhaled', 'Acute Toxicity (Combined)', 'Category 1,2', 5, NULL, 5, NULL, 'Danger', 'Multiple routes - fatal'),
('H300+H310+H330', 'Fatal if swallowed, in contact with skin or if inhaled', 'Acute Toxicity (Combined)', 'Category 1,2', 5, 5, 5, NULL, 'Danger', 'All routes - fatal'),
('H301+H311', 'Toxic if swallowed or in contact with skin', 'Acute Toxicity (Combined)', 'Category 3', NULL, 4, 4, NULL, 'Danger', 'Multiple routes - toxic'),
('H301+H331', 'Toxic if swallowed or if inhaled', 'Acute Toxicity (Combined)', 'Category 3', 4, 4, NULL, NULL, 'Danger', 'Multiple routes - toxic'),
('H311+H331', 'Toxic in contact with skin or if inhaled', 'Acute Toxicity (Combined)', 'Category 3', 4, NULL, 4, NULL, 'Danger', 'Multiple routes - toxic'),
('H301+H311+H331', 'Toxic if swallowed, in contact with skin or if inhaled', 'Acute Toxicity (Combined)', 'Category 3', 4, 4, 4, NULL, 'Danger', 'All routes - toxic'),
('H302+H312', 'Harmful if swallowed or in contact with skin', 'Acute Toxicity (Combined)', 'Category 4', NULL, 3, 3, NULL, 'Warning', 'Multiple routes - harmful'),
('H302+H332', 'Harmful if swallowed or if inhaled', 'Acute Toxicity (Combined)', 'Category 4', 3, 3, NULL, NULL, 'Warning', 'Multiple routes - harmful'),
('H312+H332', 'Harmful in contact with skin or if inhaled', 'Acute Toxicity (Combined)', 'Category 4', 3, NULL, 3, NULL, 'Warning', 'Multiple routes - harmful'),
('H302+H312+H332', 'Harmful if swallowed, in contact with skin or if inhaled', 'Acute Toxicity (Combined)', 'Category 4', 3, 3, 3, NULL, 'Warning', 'All routes - harmful')
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  hazard_class = EXCLUDED.hazard_class,
  category = EXCLUDED.category,
  inhalation_severity = EXCLUDED.inhalation_severity,
  ingestion_severity = EXCLUDED.ingestion_severity,
  skin_eye_severity = EXCLUDED.skin_eye_severity,
  other_severity = EXCLUDED.other_severity,
  signal_word = EXCLUDED.signal_word,
  notes = EXCLUDED.notes;
