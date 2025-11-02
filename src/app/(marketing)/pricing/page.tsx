import { Button, Card, CardContent, CardHeader } from '@/components/ui';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Safety Copilot
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your team. All plans include AI-powered safety agents.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Trial */}
            <PricingCard
              name="Trial"
              price={0}
              period="14 days"
              description="Perfect for trying out Safety Copilot"
              features={[
                'Up to 5 users',
                '3 AI safety agents',
                '100K tokens per month',
                'Email support',
                'Basic analytics',
              ]}
              cta="Start Free Trial"
              ctaLink="/signup"
            />

            {/* Basic */}
            <PricingCard
              name="Basic"
              price={49}
              period="per month"
              description="For small teams getting started"
              features={[
                'Up to 10 users',
                '5 AI safety agents',
                '500K tokens per month',
                'Email & chat support',
                'Advanced analytics',
                'Custom branding',
              ]}
              cta="Get Started"
              ctaLink="/signup"
            />

            {/* Professional */}
            <PricingCard
              name="Professional"
              price={199}
              period="per month"
              description="For growing safety programs"
              features={[
                'Up to 50 users',
                '15 AI safety agents',
                '2M tokens per month',
                'Priority support',
                'Advanced analytics',
                'Custom integrations',
                'API access',
                'Dedicated account manager',
              ]}
              cta="Get Started"
              ctaLink="/signup"
              highlighted
            />

            {/* Enterprise */}
            <Card className="md:col-span-3 max-w-2xl mx-auto">
              <CardHeader
                title="Enterprise"
                subtitle="Custom solutions for large organizations"
              />
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <ul className="space-y-3">
                    <Feature>Unlimited users</Feature>
                    <Feature>Unlimited AI agents</Feature>
                    <Feature>Unlimited tokens</Feature>
                    <Feature>24/7 premium support</Feature>
                    <Feature>Custom AI agent development</Feature>
                  </ul>
                  <ul className="space-y-3">
                    <Feature>On-premise deployment option</Feature>
                    <Feature>Advanced security & compliance</Feature>
                    <Feature>SLA guarantees</Feature>
                    <Feature>Training & onboarding</Feature>
                    <Feature>Custom pricing</Feature>
                  </ul>
                </div>
                <div className="mt-8 text-center">
                  <Link href="/contact">
                    <Button size="lg">Contact Sales</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <FAQ
                question="What happens after my trial ends?"
                answer="Your trial automatically converts to the Basic plan unless you choose a different plan or cancel. You won't be charged without confirmation."
              />
              <FAQ
                question="Can I upgrade or downgrade my plan?"
                answer="Yes, you can change your plan at any time. Changes take effect immediately, and billing is prorated."
              />
              <FAQ
                question="What are tokens?"
                answer="Tokens are units of AI processing. Each AI agent request uses tokens based on the complexity of the task. Most tasks use between 100-1000 tokens."
              />
              <FAQ
                question="Do you offer refunds?"
                answer="We offer a 30-day money-back guarantee on annual plans. Monthly plans are non-refundable but can be cancelled at any time."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PricingCardProps {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  ctaLink,
  highlighted = false,
}: PricingCardProps) {
  return (
    <Card className={highlighted ? 'ring-2 ring-blue-600 relative' : ''}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}
      <CardHeader title={name} subtitle={description} />
      <CardContent>
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-gray-900">${price}</span>
            <span className="ml-2 text-gray-600">/{period}</span>
          </div>
        </div>
        <ul className="space-y-3 mb-8">
          {features.map((feature) => (
            <Feature key={feature}>{feature}</Feature>
          ))}
        </ul>
        <Link href={ctaLink}>
          <Button fullWidth variant={highlighted ? 'primary' : 'secondary'}>
            {cta}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start">
      <svg
        className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-gray-700">{children}</span>
    </li>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold text-gray-900 mb-2">{question}</h3>
        <p className="text-gray-600">{answer}</p>
      </CardContent>
    </Card>
  );
}
