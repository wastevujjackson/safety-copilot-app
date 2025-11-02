# Development Standards & Guidelines

## Project Overview
B2B Health & Safety AI Agent Platform - A scalable, production-ready application enabling companies to deploy specialized AI agents for health and safety tasks.

---

## Core Principles

### 1. Code Quality & Architecture

#### Component Structure
- **Maximum component size**: 250 lines
- **Modularization required**: Break large components into smaller, focused units
- **Single Responsibility**: Each component/function should have one clear purpose
- **File organization**: Follow established project structure strictly

#### TypeScript Standards
- **Zero `any` types**: Always define proper types and interfaces upfront
- **Interfaces first**: Define all data structures before implementation
- **Type safety**: Use strict TypeScript configuration
- **No type assertions**: Avoid `as` keyword unless absolutely necessary with justification

```typescript
// ✅ GOOD
interface UserProfile {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  companyId: string;
  createdAt: Date;
}

// ❌ BAD
const user: any = getData();
const profile = response as UserProfile; // without validation
```

---

### 2. Responsive Design

#### Required Breakpoints
- **Desktop**: 1920px, 1440px, 1024px
- **Tablet**: iPad (768px - 1024px)
- **Mobile**: iPhone XR (414px), iPhone SE (375px), minimum 320px

#### Implementation
- Use Tailwind CSS responsive utilities
- Mobile-first approach
- Test all breakpoints before completion
- Touch-friendly UI elements (minimum 44x44px tap targets)

```typescript
// Example responsive component
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Content */}
</div>
```

---

### 3. Security Requirements

#### Authentication & Authorization
- **Row Level Security (RLS)**: Enforce at database level
- **Multi-tenancy isolation**: Companies cannot access other company data
- **Role-based access control**: Super Admin > Admin > User hierarchy
- **Session management**: Secure token handling, automatic expiry
- **Password requirements**: Minimum 12 characters, complexity rules

#### Data Security
- **Encryption at rest**: Sensitive data must be encrypted
- **Encryption in transit**: HTTPS only, TLS 1.3
- **Input validation**: Sanitize all user inputs
- **SQL injection prevention**: Use parameterized queries only
- **XSS protection**: Sanitize outputs, CSP headers
- **API rate limiting**: Prevent abuse
- **Audit logging**: Track all sensitive operations

#### Environment Security
- **No secrets in code**: Use environment variables
- **Separate environments**: Dev, staging, production
- **Regular dependency updates**: Security patches
- **Security headers**: HSTS, X-Frame-Options, etc.

```typescript
// ✅ GOOD - RLS Policy Example
// In Supabase migration
CREATE POLICY "Users can only access their company data"
ON companies
FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

// ✅ GOOD - Input validation
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  role: z.enum(['super_admin', 'admin', 'user'])
});
```

---

### 4. Scalability & Performance

#### Architecture Principles
- **Modular agent system**: Each health & safety agent is independent
- **Plugin architecture**: Easy to add new agents without refactoring
- **Database optimization**: Proper indexing, query optimization
- **Caching strategy**: Redis/Edge caching where appropriate
- **CDN for static assets**: Optimize load times globally
- **Code splitting**: Lazy load routes and components
- **Image optimization**: Next.js Image component, WebP format

#### Performance Targets
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: > 90
- **Bundle size**: Monitor and optimize (< 200KB initial)

```typescript
// ✅ GOOD - Lazy loading agents
const RiskAssessmentAgent = dynamic(() => import('@/components/agents/RiskAssessmentAgent'), {
  loading: () => <AgentSkeleton />,
  ssr: false
});
```

---

### 5. Testing Strategy

#### Required Tests
**Unit Tests** (Jest + React Testing Library)
- All utility functions
- All hooks
- Component logic
- Minimum 80% coverage

**Integration Tests**
- API endpoints
- Database operations
- Authentication flows
- Agent interactions

**E2E Tests** (Playwright)
- Critical user journeys
- Login/signup flows
- Agent workflows
- Multi-user scenarios

**Performance Tests**
- Load testing (Artillery/k6)
- Database query performance
- API response times
- Lighthouse CI in pipeline

#### Testing Standards
- Write tests BEFORE or ALONGSIDE feature development
- Test edge cases and error states
- Mock external dependencies
- Test responsive behavior
- Accessibility testing (axe-core)

```typescript
// ✅ GOOD - Comprehensive test
describe('UserManagement', () => {
  it('super admin can promote users to admin', async () => {
    const { getByRole, findByText } = render(<UserManagement />);

    await userEvent.click(getByRole('button', { name: /promote/i }));

    expect(await findByText(/user promoted/i)).toBeInTheDocument();
  });

  it('regular users cannot access admin functions', async () => {
    mockUser({ role: 'user' });

    const { queryByRole } = render(<UserManagement />);

    expect(queryByRole('button', { name: /promote/i })).not.toBeInTheDocument();
  });
});
```

---

## Project Structure

```
src/
├── app/                        # Next.js app router
│   ├── (auth)/                # Auth-related routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── (marketing)/           # Public website
│   │   ├── page.tsx          # Landing page
│   │   ├── pricing/
│   │   └── about/
│   ├── (platform)/            # Platform owner only
│   │   └── admin/
│   │       ├── page.tsx      # Platform dashboard
│   │       ├── companies/    # All companies view
│   │       ├── usage/        # Platform-wide usage
│   │       ├── revenue/      # Revenue metrics
│   │       └── analytics/    # Platform analytics
│   ├── dashboard/             # Protected company dashboards
│   │   ├── (super-admin)/    # Super admin routes
│   │   │   ├── users/        # User management
│   │   │   ├── billing/      # Billing management
│   │   │   └── settings/     # Company settings
│   │   ├── (user)/           # Regular user routes
│   │   │   ├── page.tsx     # User dashboard
│   │   │   └── agents/       # Access agents
│   │   └── analytics/        # Company analytics
│   └── api/                   # API routes
│       ├── auth/
│       ├── agents/
│       ├── analytics/
│       └── admin/            # Platform owner endpoints
├── components/
│   ├── agents/                # Individual agent components
│   ├── auth/                  # Authentication components
│   ├── dashboard/
│   │   ├── company/          # Company dashboard components
│   │   └── platform/         # Platform owner dashboard
│   ├── ui/                    # Reusable UI components
│   └── layouts/               # Layout components
├── lib/
│   ├── db/                    # Database utilities
│   ├── auth/                  # Auth helpers
│   ├── agents/                # Agent system core
│   ├── analytics/             # Analytics utilities
│   └── utils/                 # Shared utilities
├── hooks/                     # Custom React hooks
│   ├── useUser.ts
│   ├── useCompany.ts
│   └── usePlatformMetrics.ts
├── types/                     # TypeScript definitions
│   ├── user.ts
│   ├── company.ts
│   ├── agent.ts
│   └── analytics.ts
├── services/                  # Business logic layer
│   ├── user.service.ts
│   ├── company.service.ts
│   └── analytics.service.ts
└── config/                    # Configuration files
```

---

## Agent System Architecture

### Agent Interface
Every agent must implement this interface:

```typescript
interface HealthSafetyAgent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  requiredPermissions: Permission[];

  // Core methods
  initialize(context: AgentContext): Promise<void>;
  execute(input: AgentInput): Promise<AgentOutput>;
  validate(input: unknown): input is AgentInput;

  // Lifecycle hooks
  onStart?(): Promise<void>;
  onComplete?(): Promise<void>;
  onError?(error: Error): Promise<void>;
}

// Agent registry for easy addition of new agents
class AgentRegistry {
  private agents: Map<string, HealthSafetyAgent> = new Map();

  register(agent: HealthSafetyAgent): void {
    this.agents.set(agent.id, agent);
  }

  get(id: string): HealthSafetyAgent | undefined {
    return this.agents.get(id);
  }

  getByCategory(category: AgentCategory): HealthSafetyAgent[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.category === category);
  }
}
```

---

## User Management System

### Role Hierarchy
```typescript
type UserRole = 'platform_owner' | 'super_admin' | 'admin' | 'user';

interface RolePermissions {
  platform_owner: [
    'view_all_companies',
    'view_company_usage',
    'view_platform_analytics',
    'manage_platform_settings',
    'view_all_users',
    'view_revenue_metrics',
    'manage_subscriptions',
    'view_token_usage',
    'access_admin_dashboard'
  ];
  super_admin: [
    'manage_company',           // Their company only
    'manage_users',
    'promote_users',
    'manage_billing',
    'access_all_agents',
    'view_analytics'            // Company analytics only
  ];
  admin: [
    'manage_users',
    'access_all_agents',
    'view_analytics'
  ];
  user: [
    'access_assigned_agents',
    'view_own_data'
  ];
}
```

### Database Schema (Core)
```sql
-- User role enum
CREATE TYPE user_role AS ENUM ('platform_owner', 'super_admin', 'admin', 'user');

-- Subscription tier enum
CREATE TYPE subscription_tier AS ENUM ('trial', 'basic', 'professional', 'enterprise');

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  subscription_tier subscription_tier DEFAULT 'trial',
  subscription_status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled
  max_users INTEGER DEFAULT 10,
  max_agents INTEGER DEFAULT 5,
  billing_email VARCHAR(255),
  monthly_token_limit INTEGER,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  last_payment_date TIMESTAMP,
  trial_ends_at TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  is_platform_owner BOOLEAN DEFAULT FALSE,  -- Only one user should have this
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- User sessions
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agent executions (usage tracking)
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id VARCHAR(100) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 4) DEFAULT 0.0000,
  cache_hit BOOLEAN DEFAULT FALSE,
  execution_time_ms INTEGER,
  status VARCHAR(50) DEFAULT 'success', -- success, failed, timeout
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Company usage metrics (aggregated daily)
CREATE TABLE company_usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_executions INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10, 2) DEFAULT 0.00,
  unique_users INTEGER DEFAULT 0,
  unique_agents INTEGER DEFAULT 0,
  cache_hit_rate DECIMAL(5, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, date)
);

-- Platform analytics (for owner dashboard)
CREATE TABLE platform_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  total_companies INTEGER DEFAULT 0,
  active_companies INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  total_executions INTEGER DEFAULT 0,
  total_revenue_usd DECIMAL(10, 2) DEFAULT 0.00,
  total_costs_usd DECIMAL(10, 2) DEFAULT 0.00,
  new_companies INTEGER DEFAULT 0,
  churned_companies INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_platform_owner ON users(is_platform_owner) WHERE is_platform_owner = TRUE;
CREATE INDEX idx_sessions_token ON user_sessions(token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_executions_company ON agent_executions(company_id);
CREATE INDEX idx_executions_user ON agent_executions(user_id);
CREATE INDEX idx_executions_date ON agent_executions(created_at);
CREATE INDEX idx_executions_agent ON agent_executions(agent_id);
CREATE INDEX idx_usage_company_date ON company_usage_metrics(company_id, date);
CREATE INDEX idx_platform_metrics_date ON platform_metrics(date);

-- Row Level Security Policies

-- Companies: Users can only see their own company
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own company"
ON companies FOR SELECT
USING (
  id IN (SELECT company_id FROM users WHERE id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_owner = TRUE)
);

CREATE POLICY "Super admins can update their company"
ON companies FOR UPDATE
USING (
  id IN (
    SELECT company_id FROM users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
  OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_owner = TRUE)
);

-- Users: Can only see users in their company
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view users in their company"
ON users FOR SELECT
USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_owner = TRUE)
);

CREATE POLICY "Admins can manage users in their company"
ON users FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM users
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  )
  OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_owner = TRUE)
);

-- Agent executions: Users can only see their company's executions
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company executions"
ON agent_executions FOR SELECT
USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_owner = TRUE)
);

CREATE POLICY "Users can insert executions for their company"
ON agent_executions FOR INSERT
WITH CHECK (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Company usage metrics: Only company admins and platform owner can see
ALTER TABLE company_usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view company usage"
ON company_usage_metrics FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM users
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  )
  OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_owner = TRUE)
);

-- Platform metrics: Only platform owner can see
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only platform owner can view platform metrics"
ON platform_metrics FOR SELECT
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_owner = TRUE)
);

CREATE POLICY "Only platform owner can manage platform metrics"
ON platform_metrics FOR ALL
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_owner = TRUE)
);
```

---

## Development Workflow

### Before Starting Any Feature
1. Define TypeScript interfaces/types
2. Write test cases (TDD approach)
3. Implement feature with proper error handling
4. Test responsive behavior at all breakpoints
5. Run performance tests
6. Security review (check RLS, input validation)
7. Update documentation if needed

### Code Review Checklist
- [ ] No `any` types used
- [ ] All components < 250 lines
- [ ] Proper error handling
- [ ] Tests written and passing
- [ ] Responsive design tested
- [ ] Security measures implemented
- [ ] Performance benchmarks met
- [ ] TypeScript strict mode passing
- [ ] No console.logs or debug code
- [ ] Accessibility standards met (WCAG 2.1 AA)

### Git Commit Standards
```
type(scope): brief description

[optional body]

[optional footer]

Types: feat, fix, refactor, test, docs, style, perf, security
```

---

## Production Readiness Checklist

### Pre-Launch Requirements
- [ ] All tests passing (unit, integration, e2e)
- [ ] Performance metrics met
- [ ] Security audit completed
- [ ] RLS policies tested
- [ ] Error monitoring configured (Sentry/similar)
- [ ] Analytics integrated
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan
- [ ] Rate limiting configured
- [ ] CDN configured
- [ ] SSL/TLS certificates
- [ ] Environment variables secured
- [ ] Database migrations tested
- [ ] Monitoring dashboards set up
- [ ] Documentation complete

### Monitoring & Maintenance
- Error tracking and alerting
- Performance monitoring (Core Web Vitals)
- Database query monitoring
- User analytics
- Security vulnerability scanning
- Automated dependency updates
- Regular security audits

---

## Key Technologies & Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (RLS, social providers)
- **AI Backend**: Railway (Python/Node.js services for agents)
- **AI/LLM**: OpenAI GPT-4, Anthropic Claude (per agent needs)
- **Testing**: Jest, React Testing Library, Playwright
- **State Management**: React Context + Zustand (where needed)
- **API**: Next.js API Routes + tRPC (type-safe APIs)
- **Validation**: Zod
- **Forms**: React Hook Form
- **Deployment**:
  - Frontend: Vercel
  - AI Services: Railway
- **Monitoring**: Vercel Analytics + Sentry
- **Caching**: Upstash Redis (Railway alternative: Redis on Railway)

---

## Phase 1 - Foundation (Current)

### Immediate Priorities

**Platform Owner Setup**
1. Platform owner account creation
2. Platform admin dashboard (`/admin`)
   - View all companies
   - View company usage & metrics
   - Revenue tracking
   - Token usage monitoring
   - User activity across platform

**Public Marketing Site**
3. Landing page
4. Pricing page
5. About page

**Authentication & User Management**
6. Custom authentication system (Supabase Auth)
7. User registration & login
8. Company creation flow
9. Role-based access control (Platform Owner → Super Admin → Admin → User)

**Company Dashboards**
10. Super Admin dashboard
    - User management
    - Billing management
    - Company analytics
    - Company settings
11. Admin dashboard
    - User management (limited)
    - Company analytics
12. User dashboard
    - Personal metrics
    - Assigned agents

**Security & Infrastructure**
13. Row Level Security (RLS) policies
14. Multi-tenant data isolation
15. Platform owner data access (all companies)
16. Responsive design implementation
17. Testing suite setup

### Platform Owner Dashboard Features

**Companies Overview**
- List all companies with key metrics
- Search and filter companies
- View company status (trial, active, suspended)
- Quick actions (suspend, reactivate, delete)

**Usage Analytics**
- Platform-wide token usage
- Cost breakdown by company
- Agent usage statistics
- Active users per company
- Cache hit rates

**Revenue Metrics**
- Monthly recurring revenue (MRR)
- Revenue by subscription tier
- Churn rate
- Customer lifetime value (LTV)
- Payment status tracking

**User Activity**
- Total users across platform
- Active users (daily/weekly/monthly)
- User growth trends
- Top companies by usage

### Ready for Agent Development After
- Foundation is production-ready
- Platform owner dashboard functional
- All tests passing
- Security audit complete
- Performance benchmarks met
- Usage tracking implemented

---

## AI Agent Architecture & Token Efficiency

### Core Principle: 80% Code, 20% AI
Maximize efficiency by using deterministic code for known patterns and AI only for complex reasoning, analysis, or generation tasks.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (Vercel)                │
│  - User Interface                                           │
│  - Authentication (Supabase Auth)                           │
│  - Basic Validation & Business Logic                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──── Direct Database Access (Supabase)
                     │     - User data, company data
                     │     - Agent configurations
                     │     - Historical results (cached)
                     │
                     └──── API Routes (Next.js)
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │   Railway AI Service (Python/Node.js)        │
        │                                              │
        │  ┌─────────────────────────────────────┐   │
        │  │  Agent Orchestrator (Code-First)    │   │
        │  │  - Request validation               │   │
        │  │  - Template selection               │   │
        │  │  - Context preparation              │   │
        │  │  - Response formatting              │   │
        │  └────────┬────────────────────────────┘   │
        │           │                                 │
        │           ▼                                 │
        │  ┌─────────────────────────────────────┐   │
        │  │  Smart Caching Layer (Redis)        │   │
        │  │  - Common queries cached            │   │
        │  │  - Template responses               │   │
        │  │  - Partial results                  │   │
        │  └────────┬────────────────────────────┘   │
        │           │                                 │
        │           ▼                                 │
        │  ┌─────────────────────────────────────┐   │
        │  │  LLM Gateway (Only when needed)     │   │
        │  │  - OpenAI API / Anthropic           │   │
        │  │  - Token optimization               │   │
        │  │  - Prompt engineering               │   │
        │  └─────────────────────────────────────┘   │
        └──────────────────────────────────────────────┘
```

### Token Efficiency Strategy

#### 1. Code-First Approach (80% of work)

**Use Code For:**
- Data validation and sanitization
- Template-based responses
- Structured data extraction
- Rule-based logic
- Calculations and formulas
- Report formatting
- PDF generation
- Known compliance checks
- Predefined checklists

**Example: Risk Assessment Agent**
```typescript
// ✅ EFFICIENT - 80% handled by code
interface RiskAssessmentInput {
  hazardType: HazardType;
  severity: 1 | 2 | 3 | 4 | 5;
  likelihood: 1 | 2 | 3 | 4 | 5;
  existingControls: string[];
  location: string;
}

class RiskAssessmentAgent {
  // Pure code - no AI needed (0 tokens)
  calculateRiskScore(severity: number, likelihood: number): {
    score: number;
    level: 'Low' | 'Medium' | 'High' | 'Critical';
    color: string;
  } {
    const score = severity * likelihood;
    if (score <= 4) return { score, level: 'Low', color: 'green' };
    if (score <= 9) return { score, level: 'Medium', color: 'yellow' };
    if (score <= 15) return { score, level: 'High', color: 'orange' };
    return { score, level: 'Critical', color: 'red' };
  }

  // Use template with cached common recommendations (0 tokens for cache hits)
  async getStandardControls(hazardType: HazardType): Promise<string[]> {
    const cacheKey = `controls:${hazardType}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Only call AI for unknown hazard types
    return this.generateControlsWithAI(hazardType);
  }

  // Only use AI for complex analysis (minimal tokens)
  async analyzeCustomScenario(input: RiskAssessmentInput): Promise<Analysis> {
    // Prepare minimal context
    const prompt = this.buildEfficientPrompt(input);

    // Use smaller model for simple tasks
    const model = this.isComplexScenario(input) ? 'gpt-4' : 'gpt-3.5-turbo';

    return await this.llmGateway.analyze(prompt, model);
  }
}
```

#### 2. Intelligent Caching Strategy

**Cache Levels:**
```typescript
// Level 1: Static templates (Infinite cache)
const RISK_MATRIX_TEMPLATE = { /* ... */ };
const COMPLIANCE_REQUIREMENTS = { /* ... */ };

// Level 2: Common queries (24 hour cache)
redis.set('controls:electrical', controls, 'EX', 86400);

// Level 3: User-specific (1 hour cache)
redis.set(`user:${userId}:recent_assessments`, data, 'EX', 3600);

// Level 4: Session cache (request scope)
const sessionCache = new Map<string, any>();
```

#### 3. Smart Prompt Engineering

**Token Reduction Techniques:**

```typescript
// ❌ WASTEFUL - 500+ tokens
const wastePrompt = `
You are a health and safety expert. Please analyze this workplace scenario...
[Full context dump of everything]
Please provide detailed recommendations...
`;

// ✅ EFFICIENT - 50 tokens
const efficientPrompt = `
Analyze hazard: ${hazardType}
Severity: ${severity}/5, Likelihood: ${likelihood}/5
Existing controls: ${controls.join(', ')}
Additional controls needed?
Format: JSON array of strings.
`;
```

**Structured Outputs** (70% fewer tokens):
```typescript
// Use function calling / structured outputs
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }],
  functions: [{
    name: "provide_controls",
    parameters: {
      type: "object",
      properties: {
        controls: { type: "array", items: { type: "string" } },
        priority: { type: "string", enum: ["low", "medium", "high"] }
      }
    }
  }],
  function_call: { name: "provide_controls" }
});
```

#### 4. Agent Service Architecture (Railway)

**Recommended Railway Setup:**

```python
# railway/services/agent-service/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import redis
import openai
from typing import Optional

app = FastAPI()

# Redis for caching (Railway Redis addon)
cache = redis.from_url(os.getenv('REDIS_URL'))

# Supabase for data persistence
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

class AgentRequest(BaseModel):
    agent_id: str
    user_id: str
    company_id: str
    input_data: dict
    use_cache: bool = True

@app.post("/agent/execute")
async def execute_agent(request: AgentRequest):
    # 1. Check cache first (0 tokens)
    if request.use_cache:
        cache_key = f"agent:{request.agent_id}:{hash(str(request.input_data))}"
        cached = cache.get(cache_key)
        if cached:
            return {"source": "cache", "result": json.loads(cached)}

    # 2. Validate with code (0 tokens)
    validator = get_validator(request.agent_id)
    if not validator.is_valid(request.input_data):
        raise HTTPException(400, "Invalid input")

    # 3. Process with deterministic logic (0 tokens)
    processor = get_processor(request.agent_id)
    code_result = processor.process(request.input_data)

    # 4. Only use LLM if needed (minimal tokens)
    if processor.needs_ai_analysis(code_result):
        ai_result = await call_llm_efficiently(
            request.agent_id,
            code_result,
            request.input_data
        )
        final_result = processor.merge_results(code_result, ai_result)
    else:
        final_result = code_result

    # 5. Cache for future requests
    cache.setex(cache_key, 3600, json.dumps(final_result))

    # 6. Store in Supabase for history
    supabase.table('agent_executions').insert({
        'agent_id': request.agent_id,
        'user_id': request.user_id,
        'company_id': request.company_id,
        'result': final_result,
        'tokens_used': final_result.get('tokens', 0)
    }).execute()

    return {"source": "computed", "result": final_result}

async def call_llm_efficiently(agent_id: str, context: dict, input_data: dict):
    """Minimize tokens with smart prompting"""

    # Use smallest model that works
    model = "gpt-3.5-turbo"  # or "claude-3-haiku"

    # Compress context
    compressed_context = compress_context(context)

    # Structured prompt
    prompt = f"""Task: {agent_id}
Input: {json.dumps(input_data)}
Context: {compressed_context}
Output: JSON only"""

    response = await openai.ChatCompletion.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,  # More deterministic = better caching
        max_tokens=500,   # Limit response
    )

    return response.choices[0].message.content
```

### Railway Service Structure

```
railway/
├── services/
│   ├── agent-orchestrator/     # Main agent service (Python/FastAPI)
│   │   ├── agents/
│   │   │   ├── base.py        # Base agent class
│   │   │   ├── risk_assessment.py
│   │   │   ├── incident_report.py
│   │   │   └── ...
│   │   ├── processors/        # Code-based processors (80%)
│   │   ├── llm/               # AI gateway (20%)
│   │   ├── cache/             # Redis caching layer
│   │   └── main.py
│   │
│   ├── redis/                 # Redis addon (Railway)
│   │
│   └── worker/                # Background jobs (optional)
│       └── main.py            # Long-running tasks
│
├── railway.json               # Railway config
└── requirements.txt
```

### Infrastructure Requirements

**Required Services:**

1. **Vercel** (Frontend - Next.js)
   - Auto-scaling
   - Edge functions
   - Built-in CDN
   - Free tier: Good for start

2. **Supabase** (Database + Auth)
   - PostgreSQL database
   - Authentication & RLS
   - Real-time subscriptions
   - Storage for files/documents
   - Free tier: 500MB database, 2GB bandwidth

3. **Railway** (AI Agent Services)
   - Python/Node.js services
   - Redis addon (caching)
   - Auto-scaling
   - Environment variables
   - Cost: ~$5-20/month to start

4. **Upstash Redis** (Alternative to Railway Redis)
   - Global edge caching
   - Serverless pricing
   - Better for distributed caching
   - Free tier: 10k requests/day

### Cost Optimization Strategy

**Monthly Cost Breakdown (Estimated):**

```
Infrastructure:
- Vercel: $0 (free tier) → $20 (pro)
- Supabase: $0 (free) → $25 (pro)
- Railway: $5 (hobby) → $20-50 (scaling)
- Redis: $0 (Railway addon) or Upstash free tier

AI Costs (Token Usage):
With 80/20 approach:

Scenario 1: 1,000 agent requests/month
- Without optimization: ~5M tokens = $10-20
- With 80/20 strategy: ~1M tokens = $2-4 ✅

Scenario 2: 10,000 agent requests/month
- Without optimization: ~50M tokens = $100-200
- With 80/20 strategy: ~10M tokens = $20-40 ✅

Scenario 3: 100,000 agent requests/month
- Without optimization: ~500M tokens = $1,000-2,000
- With 80/20 strategy: ~20M tokens = $40-80 ✅ (thanks to caching)

Total Monthly Cost (10k requests): $50-100
```

### Token Tracking & Monitoring

```typescript
// Track token usage per agent, company, user
interface TokenMetrics {
  agent_id: string;
  company_id: string;
  user_id: string;
  tokens_input: number;
  tokens_output: number;
  cache_hit: boolean;
  cost_usd: number;
  timestamp: Date;
}

// Alert when costs spike
async function monitorTokenUsage(companyId: string) {
  const usage = await supabase
    .from('token_metrics')
    .select('*')
    .eq('company_id', companyId)
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000));

  const totalCost = usage.reduce((sum, m) => sum + m.cost_usd, 0);

  if (totalCost > DAILY_THRESHOLD) {
    await alertAdmins(companyId, totalCost);
  }
}
```

### Environment Setup

**.env.local (Next.js)**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Railway AI Service
RAILWAY_API_URL=https://your-service.railway.app
RAILWAY_API_KEY=your-api-key

# Redis (Upstash or Railway)
REDIS_URL=redis://...

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

**railway.json**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Best Practices Summary

**Maximize Efficiency:**
1. ✅ Use code for deterministic logic (validation, calculations, formatting)
2. ✅ Cache aggressively (Redis for common queries)
3. ✅ Use smallest model that works (GPT-3.5 vs GPT-4)
4. ✅ Structured outputs (function calling, JSON mode)
5. ✅ Compress prompts (minimal context)
6. ✅ Batch operations when possible
7. ✅ Monitor token usage per company
8. ✅ Set spending limits and alerts

**Avoid:**
1. ❌ Sending full context to LLM every time
2. ❌ Using AI for tasks code can handle
3. ❌ Ignoring caching opportunities
4. ❌ Verbose prompts and responses
5. ❌ Using large models for simple tasks
6. ❌ Not monitoring costs per customer

---

## Support & Questions

When implementing features, always refer to this guide. If standards conflict with business requirements, discuss with team before proceeding.

**Remember**: Code quality, security, and scalability are non-negotiable. Build it right the first time.
