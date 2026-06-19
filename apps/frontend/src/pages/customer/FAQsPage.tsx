import { useState } from 'react';

type Category = 'general' | 'subscriptions' | 'transactions';

const FAQS: Record<Category, { q: string; a: string }[]> = {
  general: [
    {
      q: 'What is customer service, and why is it important?',
      a: 'Yes, you can try us for free for 30 days. If you want, we\'ll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.',
    },
    {
      q: 'How can I reach customer service?',
      a: 'You can reach our customer service team through the Issues section of this platform, where you can submit a report and track its progress.',
    },
    {
      q: 'How can I track the status of my customer service request?',
      a: 'Navigate to the Issues section from the sidebar. There you can view all your submitted reports and their current statuses in real time.',
    },
    {
      q: 'Can other info be added to an invoice?',
      a: 'Yes, additional information can be added to your invoice. Please contact our support team with the specific details you would like included.',
    },
    {
      q: 'How does billing work?',
      a: 'Billing is based on your selected subscription plan and billing type (monthly, quarterly, or annually). You will receive an invoice for each billing cycle.',
    },
    {
      q: 'How do I change my account email?',
      a: 'You can update your email address from the Profile page. Click on Edit, update your email field, and save the changes.',
    },
  ],
  subscriptions: [
    {
      q: 'What payment methods are accepted for the subscription?',
      a: 'Yes, you can try us for free for 30 days. If you want, we\'ll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.',
    },
    {
      q: 'How often am I billed for my customer service subscription?',
      a: 'Billing frequency depends on your chosen plan — monthly, quarterly, or annually. You can view and manage your billing preference in the Subscriptions section.',
    },
    {
      q: 'Can I upgrade or downgrade my subscription plan at anytime?',
      a: 'Yes, you can change your subscription plan at any time. Changes take effect at the start of the next billing cycle.',
    },
    {
      q: 'Is there a satisfaction guarantee with the subscription?',
      a: 'We offer a 30-day satisfaction guarantee. If you are not satisfied within the first 30 days, contact support for a full refund.',
    },
    {
      q: 'Are there any discounts available for subscribers?',
      a: 'Yes, we offer discounts for annual subscriptions and for organizations with multiple users. Contact our team for more details.',
    },
    {
      q: 'How do I renew customer service subscription after expiry?',
      a: 'You can renew your subscription from the Subscriptions page. Select the expired subscription and choose to renew or subscribe to a new plan.',
    },
  ],
  transactions: [
    {
      q: 'What payment methods are accepted for transaction-related fees?',
      a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
    },
    {
      q: 'How can I reach customer service for transaction related issues?',
      a: 'For transaction-related issues, submit a report under the Issues section selecting the "Transaction" topic. Our team will respond promptly.',
    },
    {
      q: 'Is there a transaction history available for my records?',
      a: 'Yes, all your payment transactions are available in the Payments section. You can also generate invoices for your records.',
    },
    {
      q: 'What information do I need to complete a transaction?',
      a: 'To complete a transaction you need your service plan details, billing type preference, and a valid payment method on file.',
    },
    {
      q: 'How can initiate a customer service transaction?',
      a: 'You can initiate a transaction by subscribing to a service plan from the Subscriptions section. A payment record is created automatically.',
    },
    {
      q: 'Can I receive assistance with transaction disputes?',
      a: 'Yes, for any disputes related to transactions please submit an Issue report with the topic set to "Transaction" and include all relevant details.',
    },
  ],
};

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'general',       label: 'General'       },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'transactions',  label: 'Transactions'  },
];

export default function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('general');
  const [openIndex, setOpenIndex]           = useState<number | null>(0);

  const faqs = FAQS[activeCategory];

  return (
    <div className="bg-white rounded-2xl border border-border p-8 min-h-full">
      <h1 className="text-3xl font-bold text-text-main mb-2">Have a question?</h1>
      <p className="text-text-muted mb-8">These are some frequently asked questions on the platform.</p>

      <div className="flex gap-12">
        {/* Categories */}
        <div className="flex flex-col gap-2 w-48 flex-shrink-0 pt-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); setOpenIndex(null); }}
              className={`text-left px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeCategory === cat.key
                  ? 'bg-secondary text-primary'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="flex-1 flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all ${
                openIndex === i ? 'border-border bg-secondary' : 'border-transparent'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className={`text-sm font-semibold ${
                  openIndex === i ? 'text-primary' : 'text-text-main'
                }`}>
                  {faq.q}
                </span>
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-4 transition-colors"
                  style={{
                    background: openIndex === i ? 'rgba(101,16,127,0.1)' : 'transparent',
                    border:     '1.5px solid rgba(101,16,127,0.3)',
                    color:      'rgba(101,16,127,1)',
                  }}
                >
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={3}
                    className={`transition-transform duration-200 ${openIndex === i ? 'rotate-45' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>

              {openIndex === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-text-muted leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
