import React from 'react';
import Navbar from '../layouts/Navbar';
import { Sparkles, Image as ImageIcon, Upload, Timer, ShieldCheck, Layers, SlidersHorizontal, Share2, Wand2, Gauge, Heart, Quote } from 'lucide-react';

const FeatureItem = ({ Icon, title, desc }) => (
  <div className="group relative overflow-hidden rounded-2xl bg-[#121b25] border border-[#223042] p-6 transition-all duration-300 hover:border-[#2d3e53] hover:shadow-[0_8px_30px_rgba(12,127,242,0.15)]">
    <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#0c7ff2]/10 blur-2xl transition-transform duration-300 group-hover:translate-x-3 group-hover:-translate-y-2" />
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0c7ff2]/30 to-[#61dafb]/20 text-[#9dd0ff] flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="text-white text-base font-semibold mt-3">{title}</h3>
    <p className="text-[#9cabba] text-sm leading-relaxed mt-1">{desc}</p>
  </div>
);

const Stat = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl bg-[#121b25] border border-[#223042] p-6 min-w-[160px]">
    <div className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#84c1ff] text-3xl font-extrabold">{value}</div>
    <div className="text-[#9cabba] text-xs mt-1 uppercase tracking-wide">{label}</div>
  </div>
);

const FAQItem = ({ q, a }) => (
  <div className="rounded-2xl bg-[#121b25] border border-[#223042] p-5">
    <div className="text-white font-semibold mb-2">{q}</div>
    <div className="text-[#9cabba] text-sm leading-relaxed">{a}</div>
  </div>
);

const Testimonial = ({ text, name, role }) => (
  <div className="relative rounded-2xl bg-[#121b25] border border-[#223042] p-6">
    <Quote className="absolute -top-3 -left-3 w-6 h-6 text-[#0c7ff2]/60" />
    <p className="text-[#c6d3df] text-sm leading-relaxed">“{text}”</p>
    <div className="mt-4 text-white text-sm font-semibold">{name}</div>
    <div className="text-[#9cabba] text-xs">{role}</div>
  </div>
);

const FeaturesPage = () => (
  <div className="relative flex min-h-screen flex-col bg-[#101923] overflow-x-hidden" style={{ fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
    {/* Decorative Backgrounds */}
    <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#0c7ff2]/10 blur-3xl" />
    <div className="pointer-events-none absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-[#61dafb]/10 blur-3xl" />

    <Navbar />

    {/* Hero */}
    <section className="px-6 md:px-12 lg:px-40 pt-14 md:pt-20 pb-10">
      <div className="max-w-5xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#223042] bg-[#121b25] px-4 py-2 text-[#9cabba] text-xs mb-5 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-[#84c1ff]" />
          <span>Powerful AI generation, delightful results</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-[#9cc9ff]">Create stunning visuals</span>
          <span className="text-white"> in seconds with AI</span>
        </h1>
        <p className="text-[#9cabba] text-base md:text-lg mt-4 max-w-2xl">
          Turn your ideas into production‑ready images. Start from a text prompt or transform an existing photo — fast, flexible, beautiful.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <a href="/generate" className="inline-flex items-center gap-2 bg-[#0c7ff2] hover:bg-[#0a6fd8] text-white font-semibold px-5 py-3 rounded-xl transition-colors shadow-[0_10px_30px_rgba(12,127,242,0.25)]">
            <Wand2 className="w-4 h-4" />
            Start Generating
          </a>
          <a href="/pricing" className="inline-flex items-center gap-2 bg-[#121b25] border border-[#223042] hover:border-[#2d3e53] text-white font-semibold px-5 py-3 rounded-xl transition-colors">
            <Gauge className="w-4 h-4" />
            See Plans
          </a>
        </div>
      </div>
    </section>

    {/* Feature Grid */}
    <section className="px-6 md:px-12 lg:px-40 pb-4 md:pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FeatureItem Icon={ImageIcon} title="Text‑to‑Image" desc="Describe your vision and let AI generate high‑quality images in seconds." />
        <FeatureItem Icon={Upload} title="Image‑to‑Image" desc="Start from a photo and transform it with styles, prompts, and controls." />
        <FeatureItem Icon={Layers} title="Version History" desc="Branch, compare, and revisit your creative explorations with image versions." />
        <FeatureItem Icon={SlidersHorizontal} title="Smart Controls" desc="Tune size, model, style and more with presets designed for great results." />
        <FeatureItem Icon={Timer} title="Fast & Reliable" desc="Optimized pipeline with CDN delivery for smooth, snappy experiences." />
        <FeatureItem Icon={ShieldCheck} title="Privacy First" desc="Your content stays yours. Private by default with granular sharing." />
      </div>
    </section>

    {/* Showcase strip */}
    <section className="px-6 md:px-12 lg:px-40 py-8">
      <div className="rounded-2xl border border-[#223042] bg-gradient-to-br from-[#0c7ff2]/10 via-transparent to-transparent p-6">
        <div className="text-white font-semibold mb-4">Made with Visionary AI</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop', alt: 'Abstract neon' },
            { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=800&auto=format&fit=crop', alt: 'Dreamy landscape' },
            { src: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?q=80&w=800&auto=format&fit=crop', alt: 'Futuristic city' },
            { src: 'https://images.unsplash.com/photo-1500530855697-067b8c3c3d4a?q=80&w=800&auto=format&fit=crop', alt: 'Cosmic art' },
            { src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop', alt: 'Surreal portrait' },
            { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop', alt: 'Vivid textures' }
          ].map((img, i) => (
            <div key={i} className="group relative overflow-hidden rounded-xl border border-[#223042] bg-[#121b25]">
              <div className="aspect-[4/3] w-full">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/visionary-${i}/800/600`; }}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Workflow */}
    <section className="px-6 md:px-12 lg:px-40 py-10">
      <div className="rounded-2xl bg-[#0a131c] border border-[#223042] p-6 md:p-10">
        <h2 className="text-white text-2xl md:text-3xl font-bold mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-[#121b25] border border-[#223042] p-5">
            <div className="text-[#9cabba] text-xs mb-2">Step 1</div>
            <div className="text-white font-semibold mb-1">Enter a prompt or upload</div>
            <div className="text-[#9cabba] text-sm">Give a short description or add a starting image to guide the model.</div>
          </div>
          <div className="rounded-xl bg-[#121b25] border border-[#223042] p-5">
            <div className="text-[#9cabba] text-xs mb-2">Step 2</div>
            <div className="text-white font-semibold mb-1">Pick a model and style</div>
            <div className="text-[#9cabba] text-sm">Choose from Stable Diffusion, Flux, and more — optimized defaults included.</div>
          </div>
          <div className="rounded-xl bg-[#121b25] border border-[#223042] p-5">
            <div className="text-[#9cabba] text-xs mb-2">Step 3</div>
            <div className="text-white font-semibold mb-1">Generate & refine</div>
            <div className="text-[#9cabba] text-sm">Create multiple variations, like your favorites, and download or share.</div>
          </div>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="px-6 md:px-12 lg:px-40 py-6">
      <div className="flex flex-wrap gap-3">
        <Stat value="50k+" label="Images Generated" />
        <Stat value="< 5s" label="Avg. Gen Time" />
        <Stat value="99.9%" label="Uptime" />
        <Stat value="4.9/5" label="User Rating" />
      </div>
    </section>

    {/* Sharing */}
    <section className="px-6 md:px-12 lg:px-40 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        <div className="rounded-2xl bg-[#121b25] border border-[#223042] p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="w-5 h-5 text-[#84c1ff]" />
            <h3 className="text-white text-xl font-semibold">Share anywhere</h3>
          </div>
          <p className="text-[#9cabba] text-sm leading-relaxed">
            Share downloads to your device or use native sharing on supported devices. Your creations are easy to showcase.
          </p>
        </div>
        <div className="rounded-2xl bg-[#121b25] border border-[#223042] p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-[#ff8892]" />
            <h3 className="text-white text-xl font-semibold">Like & curate</h3>
          </div>
          <p className="text-[#9cabba] text-sm leading-relaxed">
            Save your favorites with a tap and revisit them anytime from your Liked Photos.
          </p>
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="px-6 md:px-12 lg:px-40 py-10">
      <h2 className="text-white text-2xl md:text-3xl font-bold mb-6">Loved by creators</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Testimonial text="Visionary AI has completely leveled up our marketing visuals. It's fast and the quality is shocking." name="Sophia Bennett" role="Art Director" />
        <Testimonial text="My team went from ideas to assets in minutes. The controls make it easy to get what we want." name="Ethan Carter" role="Product Designer" />
        <Testimonial text="I use it daily for moodboards and concept art. The versioning is a game changer." name="Maya Patel" role="Independent Creator" />
      </div>
    </section>

    {/* CTA */}
    <section className="px-6 md:px-12 lg:px-40 pb-14 md:pb-20">
      <div className="relative overflow-hidden rounded-2xl border border-[#223042] p-8 md:p-12">
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#0c7ff2]/20 blur-2xl" />
        <h3 className="text-white text-2xl md:text-3xl font-extrabold">Ready to build something beautiful?</h3>
        <p className="text-[#9cabba] mt-2 max-w-2xl">Jump into the studio and generate your first image now. It’s fast, fun, and free to try.</p>
        <div className="flex gap-3 mt-6">
          <a href="/generate" className="inline-flex items-center gap-2 bg-[#0c7ff2] hover:bg-[#0a6fd8] text-white font-semibold px-5 py-3 rounded-xl transition-colors shadow-[0_10px_30px_rgba(12,127,242,0.25)]">
            <Wand2 className="w-4 h-4" />
            Generate now
          </a>
          <a href="/pricing" className="inline-flex items-center gap-2 bg-[#121b25] border border-[#223042] hover:border-[#2d3e53] text-white font-semibold px-5 py-3 rounded-xl transition-colors">
            <Gauge className="w-4 h-4" />
            View pricing
          </a>
        </div>
      </div>
    </section>
  </div>
);

export default FeaturesPage; 