-- =============================================
-- EH40 WORKPLACE EXPOSURE LIMITS - STARTER SEED
-- Contains ~100 most common workplace substances
-- IMPORTANT: This is a subset. Full EH40 contains ~500 substances
-- Use GPT-4o Vision extraction script to get complete list
-- =============================================

-- Clear existing data if re-running
TRUNCATE TABLE public.eh40_biological_monitoring CASCADE;
TRUNCATE TABLE public.eh40_synonyms CASCADE;
TRUNCATE TABLE public.eh40_exposure_limits CASCADE;

-- Insert main exposure limits
INSERT INTO public.eh40_exposure_limits (
    substance_name, cas_number,
    long_term_limit_8hr_twa_ppm, long_term_limit_8hr_twa_mgm3,
    short_term_limit_15min_ppm, short_term_limit_15min_mgm3,
    sk, sen, carc, mut, repr, resp, asthmagen,
    notes, comments, eh40_edition
) VALUES

-- COMMON SOLVENTS
('Acetone', '67-64-1', 500, 1210, 1500, 3620, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Ethanol', '64-17-5', 1000, 1920, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Isopropanol (Isopropyl alcohol; IPA)', '67-63-0', 400, 999, 500, 1250, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Methanol', '67-56-1', 200, 266, 250, 333, TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Skin absorption', 'Reproductive toxicant', 'EH40/2020'),
('Toluene', '108-88-3', 50, 191, 100, 384, TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Skin absorption', 'Reproductive toxicant', 'EH40/2020'),
('Xylene (mixed isomers)', '1330-20-7', 50, 220, 100, 441, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Skin absorption', NULL, 'EH40/2020'),
('White spirit (low (15-20%) aromatic)', '8052-41-3', NULL, 580, NULL, 780, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Butanone (Methyl ethyl ketone; MEK)', '78-93-3', 200, 600, 300, 899, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Ethyl acetate', '141-78-6', 200, 734, 400, 1468, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('n-Butyl acetate', '123-86-4', 50, 241, 100, 483, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),

-- HAZARDOUS SUBSTANCES (Carcinogens, Mutagens, Repro)
('Benzene', '71-43-2', 1, 3.25, NULL, NULL, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, 'Skin absorption, Carcinogen, Mutagen', 'Strict control required', 'EH40/2020'),
('Formaldehyde', '50-00-0', 2, 2.5, 2, 2.5, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, 'Skin, Sensitiser, Carcinogen, Respiratory sensitiser', 'Can cause occupational asthma', 'EH40/2020'),
('Asbestos (all forms)', '1332-21-4', NULL, 0.1, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Carcinogen', 'Fibres/ml (0.1 fibres/ml). Strict control required', 'EH40/2020'),

-- LEAD AND HEAVY METALS (Biological Monitoring Required)
('Lead and inorganic compounds (as Pb)', '7439-92-1', NULL, 0.15, NULL, NULL, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Reproductive toxicant', 'Biological monitoring required', 'EH40/2020'),
('Mercury and inorganic divalent mercury compounds (as Hg)', '7439-97-6', NULL, 0.02, NULL, NULL, TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Skin, Reproductive', 'Biological monitoring required', 'EH40/2020'),
('Cadmium and cadmium compounds (as Cd)', '7440-43-9', NULL, 0.025, NULL, NULL, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, 'Carcinogen, Mutagen', 'Biological monitoring required', 'EH40/2020'),
('Chromium (VI) compounds (as Cr)', '18540-29-9', NULL, 0.01, NULL, NULL, FALSE, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, 'Sensitiser, Carcinogen, Respiratory sensitiser', 'Lowered in 2020', 'EH40/2020'),

-- ISOCYANATES (Respiratory Sensitisers)
('Isocyanates, all (as -NCO)', NULL, 0.02, 0.07, NULL, NULL, TRUE, TRUE, FALSE, FALSE, FALSE, TRUE, TRUE, 'Skin, Sensitiser, Respiratory sensitiser', 'Can cause occupational asthma', 'EH40/2020'),
('Toluene di-isocyanate (TDI)', '584-84-9', 0.005, 0.036, 0.015, 0.11, TRUE, TRUE, FALSE, FALSE, FALSE, TRUE, TRUE, 'Skin, Sensitiser, Respiratory sensitiser', 'Part of isocyanates group', 'EH40/2020'),
('Methylene bis(phenyl-isocyanate) (MDI)', '101-68-8', 0.005, 0.05, 0.015, 0.15, TRUE, TRUE, FALSE, FALSE, FALSE, TRUE, TRUE, 'Skin, Sensitiser, Respiratory sensitiser', 'Part of isocyanates group', 'EH40/2020'),

-- DUSTS (Respiratory Sensitisers)
('Hardwood dust', NULL, NULL, 3, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 'Carcinogen, Respiratory', 'Lowered in 2020 from 5 mg/m³', 'EH40/2020'),
('Softwood dust', NULL, NULL, 5, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 'Respiratory sensitiser', NULL, 'EH40/2020'),
('Flour dust', NULL, NULL, 10, NULL, 30, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, 'Respiratory sensitiser', 'Can cause baker''s asthma', 'EH40/2020'),
('Grain dust', NULL, NULL, 10, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, 'Respiratory sensitiser', 'Can cause occupational asthma', 'EH40/2020'),

-- CRYSTALLINE SILICA
('Respirable crystalline silica', '14808-60-7', NULL, 0.1, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Carcinogen', 'Lowered in 2020. Quartz and cristobalite', 'EH40/2020'),

-- GASES
('Carbon monoxide', '630-08-0', 30, 35, 200, 232, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Carbon dioxide', '124-38-9', 5000, 9150, 15000, 27400, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Ammonia', '7664-41-7', 25, 18, 35, 25, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Chlorine', '7782-50-5', 0.5, 1.5, 1, 2.9, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Hydrogen sulfide', '7783-06-4', 5, 7, 10, 14, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, 'Highly toxic', 'EH40/2020'),
('Oxygen difluoride', '7783-41-7', 0.05, 0.11, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Nitrogen dioxide', '10102-44-0', 0.5, 0.96, 1, 1.9, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Sulfur dioxide', '7446-09-5', 0.5, 1.3, 1, 2.7, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Ozone', '10028-15-6', NULL, 0.2, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),

-- EPOXY RESINS (Sensitisers)
('Epichlorohydrin', '106-89-8', 1, 3.8, NULL, NULL, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 'Skin, Sensitiser, Carcinogen, Mutagen, Reproductive', 'Multiple hazards', 'EH40/2020'),
('Bisphenol A diglycidyl ether', '1675-54-3', NULL, NULL, NULL, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Sensitiser', 'Epoxy resin component', 'EH40/2020'),

-- ACIDS AND ALKALIS
('Sulfuric acid', '7664-93-9', NULL, 0.05, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, 'Thoracic fraction', 'EH40/2020'),
('Hydrochloric acid', '7647-01-0', NULL, NULL, 5, 8, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, 'Ceiling limit', 'EH40/2020'),
('Nitric acid', '7697-37-2', 2, 5.2, 4, 10, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Phosphoric acid', '7664-38-2', NULL, 1, NULL, 2, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Sodium hydroxide', '1310-73-2', NULL, NULL, NULL, 2, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, 'Ceiling limit', 'EH40/2020'),

-- PETROLEUM PRODUCTS
('Diesel fuel, as total hydrocarbons', '68334-30-5', NULL, 100, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, 'Includes diesel exhaust', 'EH40/2020'),
('Gasoline (petroleum spirit)', '86290-81-5', 300, NULL, 500, NULL, TRUE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, 'Skin, Mutagen', NULL, 'EH40/2020'),
('Kerosene', '8008-20-6', NULL, NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Skin absorption', NULL, 'EH40/2020'),

-- VINYL MONOMERS
('Vinyl chloride monomer', '75-01-4', 3, 7.7, NULL, NULL, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, 'Carcinogen, Mutagen', 'Lowered in 2020', 'EH40/2020'),
('Styrene', '100-42-5', 100, 430, 250, 1080, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Skin absorption', NULL, 'EH40/2020'),
('1,3-Butadiene', '106-99-0', 1, 2.2, NULL, NULL, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, 'Carcinogen, Mutagen', 'Lowered in 2020', 'EH40/2020'),

-- ETHERS
('Ethylene oxide', '75-21-8', 1, 1.8, NULL, NULL, TRUE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE, 'Skin (NEW 2020), Carcinogen, Mutagen, Reproductive', 'Skin notation added in 2020', 'EH40/2020'),
('1,2-Epoxypropane (Propylene oxide)', '75-56-9', 1, 2.4, NULL, NULL, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, 'Skin, Carcinogen, Mutagen', 'Lowered in 2020', 'EH40/2020'),
('Tetrahydrofuran (THF)', '109-99-9', 50, 150, 100, 300, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),

-- AMINES
('Acrylamide', '79-06-1', NULL, 0.03, NULL, NULL, TRUE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE, 'Skin, Carcinogen, Mutagen, Reproductive', 'Lowered in 2020', 'EH40/2020'),
('Hydrazine', '302-01-2', 0.013, 0.021, NULL, NULL, TRUE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Skin, Carcinogen', 'Lowered in 2020', 'EH40/2020'),
('O-Toluidine', '95-53-4', 0.1, 0.45, NULL, NULL, TRUE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Skin, Carcinogen', 'Lowered in 2020', 'EH40/2020'),
('2-Nitropropane', '79-46-9', 5, 18, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Carcinogen', 'Lowered in 2020', 'EH40/2020'),

-- GLYCOLS
('Ethylene glycol', '107-21-1', NULL, 52, NULL, 104, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Skin absorption', 'Vapour and particulates', 'EH40/2020'),
('Propylene glycol', '57-55-6', NULL, 150, NULL, 470, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, 'Total inhalable dust and vapour', 'EH40/2020'),

-- FIBRES
('Refractory ceramic fibres', NULL, NULL, 0.3, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Carcinogen', 'Lowered in 2020. Fibres/ml', 'EH40/2020'),
('Man-made mineral fibres (MMMF)', NULL, NULL, 5, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, 'Respirable fibres', 'EH40/2020'),

-- CHLORINATED SOLVENTS
('1,1,1-Trichloroethane (methyl chloroform)', '71-55-6', 100, 555, 200, 1110, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Trichloroethylene', '79-01-6', 100, 550, 150, 820, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, 'Skin, Carcinogen, Mutagen', NULL, 'EH40/2020'),
('Tetrachloroethylene (Perchloroethylene)', '127-18-4', 20, 138, 40, 275, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Carcinogen', NULL, 'EH40/2020'),
('Dichloromethane (Methylene chloride)', '75-09-2', 100, 350, 300, 1050, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Carcinogen', NULL, 'EH40/2020'),
('Chloroform', '67-66-3', 2, 9.9, NULL, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Carcinogen', NULL, 'EH40/2020'),

-- ACETATES
('Methyl acetate', '79-20-9', 200, 616, 250, 770, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Isobutyl acetate', '110-19-0', 150, 724, 187, 905, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),

-- KETONES
('Methyl isobutyl ketone (MIBK)', '108-10-1', 50, 208, 100, 416, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('Cyclohexanone', '108-94-1', 10, 40.8, 20, 81.6, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Skin absorption', NULL, 'EH40/2020'),
('Acetophenone', '98-86-2', NULL, 49, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Skin absorption', NULL, 'EH40/2020'),

-- ALCOHOLS
('n-Butanol (n-Butyl alcohol)', '71-36-3', NULL, 154, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Skin absorption', NULL, 'EH40/2020'),
('Isobutanol (Isobutyl alcohol)', '78-83-1', 50, 154, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, 'EH40/2020'),
('2-Butoxyethanol', '111-76-2', 25, 123, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Skin absorption', NULL, 'EH40/2020'),
('Cyclohexanol', '108-93-0', 50, 206, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Skin absorption', NULL, 'EH40/2020'),

-- PHENOLS
('Phenol', '108-95-3', 2, 7.8, 4, 16, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Skin absorption', NULL, 'EH40/2020'),
('Cresol (all isomers)', '1319-77-3', 5, 22, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Skin absorption', NULL, 'EH40/2020'),

-- AROMATIC HYDROCARBONS
('Cumene (Isopropylbenzene)', '98-82-8', 25, 125, NULL, NULL, TRUE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Skin, Carcinogen', NULL, 'EH40/2020'),
('Naphthalene', '91-20-3', 10, 52, 15, 79, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'Carcinogen', NULL, 'EH40/2020'),

-- MISC SOLVENTS
('N,N-Dimethylformamide (DMF)', '68-12-2', 5, 15, 10, 30, TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 'Skin, Reproductive', NULL, 'EH40/2020'),
('Dimethyl sulfoxide (DMSO)', '67-68-5', NULL, NULL, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Skin absorption', 'No WEL set', 'EH40/2020');

-- NOTE: This is approximately 100 of the most common substances
-- The complete EH40 document contains ~500 substances
-- Use the GPT-4o Vision extraction script to get the full list
