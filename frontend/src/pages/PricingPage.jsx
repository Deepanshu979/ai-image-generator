import React from 'react';
import Navbar from '../layouts/Navbar';
import { CheckCircle2, Sparkles, Gauge, Wand2, ShieldCheck, Image as ImageIcon, Upload, Zap, ChevronDown } from 'lucide-react';

const FeatureRow = ({ text }) => (
  <div className="flex items-start gap-3">
    <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#6fd19b]" />
    <span className="text-[#c6d3df] text-sm">{text}</span>
  </div>
);

const PriceCard = ({ name, price, period, cta, highlighted, features, note }) => (
  <div className={`relative flex flex-col rounded-2xl border ${highlighted ? 'border-[#2d3e53] bg-[#0e1a26]' : 'border-[#223042] bg-[#121b25]'} p-6 md:p-8 w-full`}>
    {highlighted && (
      <div className="absolute -top-3 left-6 text-xs bg-[#0c7ff2] text-white px-2 py-1 rounded-md">Best Value</div>
    )}
    <div className="text-white text-lg font-semibold">{name}</div>
    <div className="mt-3 flex items-end gap-1">
      <div className="text-white text-4xl font-extrabold">{price}</div>
      <div className="text-[#9cabba] text-sm">/{period}</div>
    </div>
    {note && <div className="text-[#9cabba] text-xs mt-1">{note}</div>}

    <div className="mt-6 flex flex-col gap-3">
      {features.map((f, i) => <FeatureRow key={i} text={f} />)}
    </div>

    <a href="/register" className={`mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition-colors ${highlighted ? 'bg-[#0c7ff2] hover:bg-[#0a6fd8] text-white shadow-[0_10px_30px_rgba(12,127,242,0.25)]' : 'bg-[#17202a] border border-[#223042] hover:border-[#2d3e53] text-white'}`}>
      <Zap className="w-4 h-4" />
      {cta}
    </a>
  </div>
);

const PricingPage = () => {
  const faqs = [
    {
      q: 'Can I change plans later?',
      a: 'Yes, you can upgrade or downgrade anytime. Changes take effect immediately.'
    },
    {
      q: 'What happens if I hit my limit?',
      a: 'You can purchase additional credits or wait for your monthly reset, based on plan.'
    },
    {
      q: 'Do you offer refunds?',
      a: 'We don’t offer refunds, but you can cancel anytime before the next billing cycle.'
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes — the Starter plan is free and includes enough credits to explore the platform.'
    }
  ];
  const [openFaq, setOpenFaq] = React.useState(0);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#101923] overflow-x-hidden" style={{ fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
      {/* Decorative */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#0c7ff2]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-[#61dafb]/10 blur-3xl" />

      <Navbar />

      {/* Hero */}
      <section className="px-6 md:px-12 lg:px-40 pt-14 md:pt-20 pb-6">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#223042] bg-[#121b25] px-4 py-2 text-[#9cabba] text-xs mb-5">
            <Sparkles className="w-4 h-4 text-[#84c1ff]" />
            <span>Simple pricing for creators</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">Choose a plan, start creating</h1>
          <p className="text-[#9cabba] text-base md:text-lg mt-4">Pay as you grow. Every plan includes secure storage, fast processing, and access to our latest models.</p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="px-6 md:px-12 lg:px-40 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PriceCard
            name="Starter"
            price="$0"
            period="month"
            cta="Get started free"
            highlighted={false}
            note="No credit card required"
            features={[
              '50 image generations/month',
              'Text‑to‑Image (Stable Diffusion)',
              'Basic sizes up to 768px',
              'Community support'
            ]}
          />
          <PriceCard
            name="Creator"
            price="$19"
            period="month"
            cta="Upgrade to Creator"
            highlighted={true}
            features={[
              '1,000 image generations/month',
              'Text‑to‑Image & Image‑to‑Image (Flux)',
              'HD sizes up to 1024px',
              'Version history and favorites',
              'Priority processing'
            ]}
          />
          <PriceCard
            name="Studio"
            price="$49"
            period="month"
            cta="Go Studio"
            highlighted={false}
            features={[
              '5,000 image generations/month',
              'Advanced models + custom styles',
              'Team workspace and roles',
              'SLA & priority support',
              'API access (beta)'
            ]}
          />
        </div>
        <div className="text-[#9cabba] text-xs mt-3">All prices in USD. Cancel anytime.</div>
      </section>

      {/* Comparison highlights */}
      <section className="px-6 md:px-12 lg:px-40 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-[#121b25] border border-[#223042] p-6">
            <div className="flex items-center gap-2 text-white font-semibold mb-2"><ImageIcon className="w-4 h-4 text-[#84c1ff]" /> High‑quality outputs</div>
            <div className="text-[#9cabba] text-sm">Optimized defaults for crisp, vivid results with minimal prompt engineering.</div>
          </div>
          <div className="rounded-2xl bg-[#121b25] border border-[#223042] p-6">
            <div className="flex items-center gap-2 text-white font-semibold mb-2"><Upload className="w-4 h-4 text-[#84c1ff]" /> Flexible inputs</div>
            <div className="text-[#9cabba] text-sm">Start with a prompt or upload an image to guide the generation to your style.</div>
          </div>
          <div className="rounded-2xl bg-[#121b25] border border-[#223042] p-6">
            <div className="flex items-center gap-2 text-white font-semibold mb-2"><ShieldCheck className="w-4 h-4 text-[#84c1ff]" /> Private by default</div>
            <div className="text-[#9cabba] text-sm">Your content stays yours. Control visibility and manage assets easily.</div>
          </div>
        </div>
      </section>

      {/* FAQ - Accordion */}
      <section className="px-6 md:px-12 lg:px-40 py-10">
        <h2 className="text-white text-2xl md:text-3xl font-bold mb-6">Frequently asked questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((item, i) => (
            <div key={i} className="rounded-2xl bg-[#121b25] border border-[#223042]">
              <button
                className="w-full flex items-center justify-between text-left px-5 py-4"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                aria-controls={`faq-panel-${i}`}
              >
                <span className="text-white font-semibold">{item.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#9cabba] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <div
                id={`faq-panel-${i}`}
                className={`px-5 pb-4 text-[#9cabba] text-sm transition-[max-height,opacity] duration-300 overflow-hidden ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 lg:px-40 pb-14 md:pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-[#223042] p-8 md:p-12">
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#0c7ff2]/20 blur-2xl" />
          <h3 className="text-white text-2xl md:text-3xl font-extrabold">Get started today</h3>
          <p className="text-[#9cabba] mt-2 max-w-2xl">Join thousands of creators using Visionary AI to generate stunning images. It’s free to start.</p>
          <div className="flex gap-3 mt-6">
            <a href="/register" className="inline-flex items-center gap-2 bg-[#0c7ff2] hover:bg-[#0a6fd8] text-white font-semibold px-5 py-3 rounded-xl transition-colors shadow-[0_10px_30px_rgba(12,127,242,0.25)]">
              <Wand2 className="w-4 h-4" />
              Create free account
            </a>
            <a href="/generate" className="inline-flex items-center gap-2 bg-[#121b25] border border-[#223042] hover:border-[#2d3e53] text-white font-semibold px-5 py-3 rounded-xl transition-colors">
              <Gauge className="w-4 h-4" />
              Try the studio
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage; 