# HSE Customer Procurement Agent - Design Plan

## Overview
Customer-facing agent for HSE product and service recommendations based on industry, activity, hazard, and specification requirements.

## Core Capabilities

### 1. Intelligent Product Matching
- Multi-factor scoring algorithm
- Industry-specific compliance checking
- Hazard-based filtering
- Specification-driven recommendations

### 2. Conversational Interface
- Natural language requirement gathering
- Context-aware suggestions
- Comparison features
- Procurement report generation

## Matching Algorithm

### Scoring Components
1. **Mandatory Requirements** (Pass/Fail)
   - Required standards compliance
   - Industry-specific certifications
   - Critical safety specifications

2. **Weighted Specification Matching**
   - User-specified requirements
   - Industry best practices
   - Hazard protection levels

3. **Industry Compliance Score**
   - Sector-specific standards
   - Regional regulations (UK focus)

4. **Hazard Coverage Score**
   - Protection against identified hazards
   - Multi-hazard suitability

5. **Cost-Effectiveness Ratio**
   - Price vs. specification value
   - Total cost of ownership

6. **Supplier Reliability**
   - Availability status
   - Lead times
   - Ratings

## Example Query Flows

### Example 1: PPE for Chemical Handling
**User Input:** "I need gloves for chemical handling in a pharmaceutical lab"

**Agent Processing:**
```
1. Identify: Industry=Pharmaceutical, Activity=Chemical Handling
2. Lookup: Required standards (EN374, EN ISO 374-5)
3. Determine: Hazards likely include acids, solvents
4. Query: Gloves WHERE
   - has_standard('EN374')
   - chemical_resistance.acid >= 'Level 3'
   - chemical_resistance.solvent >= 'Level 3'
   - dexterity >= 3 (for lab work)
5. Rank by: Compliance > Protection > Dexterity > Cost
6. Present: Top 5 with supplier options
```

### Example 2: Work at Height Equipment
**User Input:** "Need a powered access platform for offshore maintenance, max height 15m"

**Agent Processing:**
```
1. Identify: Industry=Oil & Gas/Offshore, Activity=WAH, Task=Maintenance
2. Lookup: Required standards (EN280, ATEX if in hazardous areas)
3. Determine: Specifications needed:
   - Max working height >= 15m
   - Rough terrain capability = true
   - ATEX rated (offshore environment)
   - Wind stability suitable for offshore
4. Query: Powered Access WHERE
   - max_working_height >= 15
   - rough_terrain = true
   - has_standard('ATEX')
   - has_industry('Oil & Gas')
5. Rank by: Compliance > Height capability > Stability > Availability
6. Present: Top products with rental/purchase options
```

### Example 3: RPE for Confined Space
**User Input:** "Respiratory protection for confined space work in sewage treatment, 2-hour duration"

**Agent Processing:**
```
1. Identify: Activity=Confined Space, Industry=Water/Utilities, Duration=2hrs
2. Lookup: Required standards (BS EN 137, BS EN 14593)
3. Determine: Specifications needed:
   - APF factor >= 40 (high contamination)
   - Max duration >= 120 mins
   - Suitable for confined space (BA not just mask)
   - H2S protection (sewage environment)
4. Query: RPE WHERE
   - apf_factor >= 40
   - max_duration >= 120
   - equipment_type = 'Self-Contained BA'
   - gas_protection CONTAINS 'H2S'
5. Rank by: Compliance > Duration > APF > Supplier service availability
6. Present: Equipment + service providers for maintenance
```

## Service Provider Integration

**Service Types:**
- Equipment servicing (BA overhaul, lifting equipment inspection)
- Maintenance programs (MEWP, RPE)
- Testing & certification
- Training & competency
- Emergency response equipment servicing

**Service-Product Linkage:**
- Products link to required service schedules
- Service providers mapped to product categories
- Geographic coverage matching
- Compliance deadline tracking

## Interface Design

### Chat Interface
- Context retention across conversation
- Progressive requirement gathering
- Visual product cards with key specs
- Comparison view (side-by-side specs)

### Outputs
- Product recommendation list with justification
- Compliance summary
- Cost comparison
- Supplier contact details
- Procurement report (PDF/export)

## Implementation Phases

### Phase 1: Core Matching Engine
- Build specification-based filtering
- Implement scoring algorithm
- Create ranking system

### Phase 2: LLM Integration
- Requirement extraction from natural language
- Context-aware questioning
- Justification generation

### Phase 3: Industry Intelligence
- Standards database integration
- Industry-specific rule engine
- Hazard-to-requirement mapping

### Phase 4: Service Provider Module
- Service catalog integration
- Maintenance schedule generation
- Multi-vendor coordination

### Phase 5: Advanced Features
- Historical procurement learning
- Predictive replacement scheduling
- Cost optimization recommendations
- Contract management integration

## Data Requirements

**From Product Database:**
- Product specifications
- Standards & certifications
- Industry mappings
- Hazard protection ratings
- Supplier information

**From Industry Requirements:**
- Mandatory standards by industry
- Activity-specific regulations
- Hazard-specification mappings

**From User Context:**
- Company industry
- Previous procurement history
- Site-specific requirements
- Budget constraints

## Success Metrics

- Time to recommendation (target: <2 min conversation)
- Recommendation acceptance rate (target: >80%)
- Compliance accuracy (target: 100% for mandatory)
- User satisfaction score
- Procurement cost savings

## Future Enhancements

- Integration with procurement systems
- Automated RFQ generation
- Contract negotiation support
- Lifecycle cost analysis
- Sustainability scoring
- Alternative product suggestions
- Bulk procurement optimization

---

**Status:** Design phase - awaiting Owner Dashboard implementation
**Dependencies:** Product database, specification definitions, industry standards
**Next Review:** After initial product seeding complete
