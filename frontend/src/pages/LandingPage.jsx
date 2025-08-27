import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256">
        <path d="M48,64a8,8,0,0,1,8-8H72V40a8,8,0,0,1,16,0V56h16a8,8,0,0,1,0,16H88V88a8,8,0,0,1-16,0V72H56A8,8,0,0,1,48,64ZM184,192h-8v-8a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Zm56-48H224V128a8,8,0,0,0-16,0v16H192a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V160h16a8,8,0,0,0,0-16ZM219.31,80,80,219.31a16,16,0,0,1-22.62,0L36.68,198.63a16,16,0,0,1,0-22.63L176,36.69a16,16,0,0,1,22.63,0l20.68,20.68A16,16,0,0,1,219.31,80Zm-54.63,32L144,91.31l-96,96L68.68,208ZM208,68.69,187.31,48l-32,32L176,100.69Z" />
      </svg>
    ),
    title: 'AI Image Generation',
    desc: 'Turn your text prompts into unique, high-quality images.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256">
        <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,172l52-52,80,80H40Zm176,28H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z" />
      </svg>
    ),
    title: 'Image to Image Generation',
    desc: 'Transform one image into another with AI style transfer.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256">
        <path d="M164.44,105.34l-48-32A8,8,0,0,0,104,80v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,129.05V95l25.58,17ZM216,40H40A16,16,0,0,0,24,56V168a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,128H40V56H216V168Zm16,40a8,8,0,0,1-8,8H32a8,8,0,0,1,0-16H224A8,8,0,0,1,232,208Z" />
      </svg>
    ),
    title: 'Video/Animation Generation',
    desc: 'Create short videos or animations from your ideas in seconds.'
  }
];

const howItWorks = [
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbDvtZ42Tj6nw7TEEY3GAfN1V7Ve57P3CLv1he__ZKvvmp6XszwwppVWZUDdzOq22_sTeO6v_LDQFmyKC9SsulL_zXGnjPc7S6srLfB_uhtsfo5rIWX5rAUqxdu4Sqf2tP9ycBPbdRLfmxww9YRdYRyapcRjHhqTut6qDxfRF59Vo_ThbrmCUrVLdRqF8dDeDK1HR9kbWGmP8iDHFYNCYmuYz15ZqZgy9DSYdF-LSOhENrmJR1fhgaMBDcSdVT2UsZ18HvjUIlBmii',
    title: 'Describe Your Vision',
    desc: 'Enter a text prompt describing the image or video you want to create.'
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQWsXPADKpbsoPWgZJ2BXLcislGLMEeJJ-cbZ5CaLMSGvXzMfcUImr2vm1jllqEwd2HwACWeTBzNZb780k8Fj4KwkVAPpTOYgZ3XLizLDITmzv5uozb6CIF0sm9qkgX3e_gmnA2kE_-BHbYnVgH1cR6r_HqAPk_MZWCeKUyScE-UiwrpLtieUj6FKuT3r9xWeSo_HroGKWZRLpaIGVmQhgglIoGnmUKV4IeOiXUjuBQvdtWmjE3rL_8bWKqpU6ZXrH4b4tvrgMLLfj',
    title: 'Generate and Refine',
    desc: 'Let our AI work its magic. Refine your results with additional prompts.'
  }
];

const gallery = [
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8h4H61vSxuc1aalBntDbVFJGvlhD7hLGgYBvvgL7GEb6MaUBEqQljbzg93DXF88wDxjeb0EEWGenhSqGz5PvGZ62wbPC_KfM-u6ZQuMWcEpqLCKh4lvpeJJp-QjIWeuFckG1BCa9vH_K7vLKqZXj-r3jAkWRvr0_QQiv5oL0endHmfukaSjpnvfhYaRGuy0_7VQdjf2iJea21-PGhpm7NkPsdW3CJrMT5aoAjiau8uB3LCElwJJ_74abHexAXXqBi7vWmSktbrtfT',
    title: "Cyberpunk Cityscape",
    desc: "A bustling metropolis of the future, rendered in stunning detail."
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwLSM3z4IvpnSEo_bvHgk8Tu3Q10hW2qEUETQsqfne3krI2uZU6j662-g2RrYBH2uZMW8T4_x5UCVA1pV5bJsefl08sZMrg6Olcz3FvDBG-_a66t7AXyOWqL-V-SscRrs89AOHp9J9ZUtEIwQN2mH_suLPCT7evYICmwopiDL9ePQz31WlFGfM9yZsWpIy0pKD1LoRRmO1sZIcW_Hrdif6J8foRUOkFN84YhJK5lpp_ZA5QQqnoWoNnfMeXpDZi86ojM9LU9aGSyhZ',
    title: "Dragon's Lair",
    desc: "A hidden sanctuary where dragons roam free, bathed in ethereal light."
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYOA6LQZr06Np09_ezyEIlw-eo7DObW0XNV72XjDSttZkmx4tdsWmvyxPOOY9UgF7LR_tWOw0kTqbRns0i6rmNMHYVCZBLWKrReFsSVknflRjNtHkAqDjElwdkepAm8t4gAvQyR7y1GBptgZX1Ff5kdIe1t4BimsJdICHWqVd-_5V-0TzPfpNTrlac_Yoe9Z2BVpqK4hRJEUUCUSjk7zBIu2psIlEAkQdA9DfrPn2l3m9DmIfECCG0g_uDJFK0rgHQI7hBTGPiSDMN',
    title: "Chromatic Dreamscape",
    desc: "An explosion of color and form, pushing the boundaries of abstract art."
  },
  {
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    title: "Sunset Overdrive",
    desc: "A vibrant sunset over rolling hills, painted by AI."
  },
  {
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    title: "Forest Dream",
    desc: "A mystical forest scene generated from a single prompt."
  }
];

const testimonials = [
  {
    img: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'Sophia Bennett',
    text: 'Visionary AI has completely transformed my creative process. The results are consistently impressive, and the interface is a joy to use.'
  },
  {
    img: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'Ethan Carter',
    text: 'While the video generation is still evolving, the image quality is outstanding. I\'m excited to see what the future holds.'
  },
  {
    img: 'https://randomuser.me/api/portraits/women/65.jpg',
    name: 'Olivia Davis',
    text: 'I\'ve tried other AI art tools, but Visionary AI stands out for its versatility and ease of use. It\'s a game-changer for artists and creators.'
  },
  {
    img: 'https://randomuser.me/api/portraits/men/45.jpg',
    name: 'Liam Smith',
    text: 'The gallery feature is so inspiring! I love seeing what others have created and sharing my own work.'
  },
  {
    img: 'https://randomuser.me/api/portraits/women/68.jpg',
    name: 'Ava Johnson',
    text: 'The interface is intuitive and the results are amazing. Highly recommended for anyone interested in AI art.'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const galleryRef = useRef(null);
  const testimonialsRef = useRef(null);

  const useCarouselAutoScroll = (ref, cardCount, cardWidth) => {
    const isPaused = useRef(false);
    useEffect(() => {
      const container = ref.current;
      if (!container) return;
      let frame;
      let start;
      function animate(ts) {
        if (!start) start = ts;
        if (!isPaused.current) {
          const elapsed = ts - start;
          const speed = 0.12; // px/ms
          const totalWidth = cardCount * cardWidth;
          let nextScroll = (elapsed * speed) % totalWidth;
          container.scrollLeft = nextScroll;
          // If we've scrolled past the first set, jump back
          if (nextScroll >= totalWidth) {
            container.scrollLeft = 0;
            start = ts;
          }
        }
        frame = requestAnimationFrame(animate);
      }
      frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    }, [ref, cardCount, cardWidth]);
    // Pause on hover
    useEffect(() => {
      const container = ref.current;
      if (!container) return;
      const onMouseEnter = () => { isPaused.current = true; };
      const onMouseLeave = () => { isPaused.current = false; };
      container.addEventListener('mouseenter', onMouseEnter);
      container.addEventListener('mouseleave', onMouseLeave);
      return () => {
        container.removeEventListener('mouseenter', onMouseEnter);
        container.removeEventListener('mouseleave', onMouseLeave);
      };
    }, [ref]);
  };

  const GALLERY_CARD_WIDTH = 440; // px, adjust to match min-w-[420px] + gap
  const TESTIMONIAL_CARD_WIDTH = 360; // px, adjust to match min-w-[340px] + gap

  // Remove useCarouselAutoScroll for galleryRef, only use for testimonialsRef
  useCarouselAutoScroll(testimonialsRef, testimonials.length, TESTIMONIAL_CARD_WIDTH);

  // Arrow click handlers for gallery
  const scrollGalleryBy = (dir) => {
    const container = galleryRef.current;
    if (!container) return;
    const scrollAmount = dir === 'left' ? -GALLERY_CARD_WIDTH : GALLERY_CARD_WIDTH;
    container.scrollTo({
      left: container.scrollLeft + scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="bg-[#101923] min-h-screen flex flex-col relative overflow-x-hidden" style={{ fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#0c7ff2]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-[#61dafb]/10 blur-3xl" />
      <Navbar />
      {/* Hero Section */}
      <section className="px-2 sm:px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-3 md:py-5">
        <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
          {/* Hero */}
          <div className="w-full flex flex-col gap-4 md:gap-8 items-center justify-center min-h-[320px] md:min-h-[480px] bg-cover bg-center bg-no-repeat rounded-xl p-2 md:p-4" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80')` }}>
            <div className="flex flex-col gap-2 text-center w-full max-w-2xl mx-auto">
              <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                Unleash Your Creativity with Visionary AI
              </h1>
              <h2 className="text-white text-xs sm:text-sm md:text-base font-normal leading-normal">
                Generate stunning images and videos with the power of artificial intelligence. Transform your ideas into visual masterpieces in seconds.
              </h2>
            </div>
            <Button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 md:h-12 px-4 md:px-5 bg-[#3490f3] text-white text-xs sm:text-sm md:text-base font-bold leading-normal tracking-[0.015em]"
              onClick={() => navigate('/generate')}
            >
              <span className="truncate">Start Creating</span>
            </Button>
          </div>

          {/* Features Section */}
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Explore the Possibility</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 px-2 md:px-4 py-6 md:py-10">
            {features.map((f, i) => (
              <div
                key={i}
                className="cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
                tabIndex={0}
                onClick={() => navigate('/generate')}
              >
                <Card className="flex flex-col items-center gap-3 bg-[#182634] border-[#314c68] p-10 shadow-xl min-h-[260px]">
                  <CardHeader className="items-center">
                    <div className="text-blue-400 mb-2">{f.icon}</div>
                    <CardTitle className="text-blue-400 text-xl mb-1 text-center">{f.title}</CardTitle>
                    <CardDescription className="text-[#90accb] text-base text-center">{f.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>

          {/* How It Works Section */}
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">How It Works</h2>
          <div className="grid grid-cols-[32px_1fr] md:grid-cols-[40px_1fr] gap-x-2 px-2 md:px-4">
            {howItWorks.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1 pt-3">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 border-2 border-[#314c68]"
                    style={{ backgroundImage: `url('${step.img}')` }}
                  ></div>
                  {i < howItWorks.length - 1 && <div className="w-[1.5px] bg-[#314c68] h-2 grow"></div>}
                </div>
                <div className="flex flex-1 flex-col py-3">
                  <p className="text-white text-lg font-semibold leading-normal">{step.title}</p>
                  <p className="text-[#90accb] text-base font-normal leading-normal">{step.desc}</p>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Demo & Gallery Section */}
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Demo & Gallery</h2>
          <div className="relative w-full min-w-0 overflow-x-hidden">
            {/* Left Arrow */}
            <button
              aria-label="Scroll left"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-[#182634]/80 hover:bg-[#223549] text-white rounded-full p-2 shadow transition-all duration-200"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => scrollGalleryBy('left')}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M15.5 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div
              ref={galleryRef}
              className="flex items-stretch gap-4 md:gap-8 p-2 md:p-4 overflow-x-auto scroll-smooth hide-scrollbar snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth' }}
            >
              {[...gallery, ...gallery].map((item, i) => (
                <div
                  key={i}
                  className="min-w-[260px] sm:min-w-[340px] md:min-w-[420px] max-w-[480px] cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 snap-center"
                  tabIndex={0}
                >
                  <Card className="flex h-full flex-1 flex-col gap-4 rounded-2xl bg-[#1a2330] shadow-2xl border-2 border-[#314c68]">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex flex-col min-h-[220px]"
                      style={{ backgroundImage: `url('${item.img}')` }}
                    ></div>
                    <CardContent className="px-4 pb-4">
                      <p className="text-white text-xl font-semibold leading-normal mb-1">{item.title}</p>
                      <p className="text-[#90accb] text-base font-normal leading-normal">{item.desc}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            {/* Right Arrow */}
            <button
              aria-label="Scroll right"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[#182634]/80 hover:bg-[#223549] text-white rounded-full p-2 shadow transition-all duration-200"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => scrollGalleryBy('right')}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M8.5 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* Testimonials Section */}
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Testimonials</h2>
          <div className="relative w-full min-w-0 overflow-x-hidden">
            {/* Fade overlays for smooth edge effect */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10" style={{background: 'linear-gradient(90deg, #101923 80%, transparent)'}} />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10" style={{background: 'linear-gradient(-90deg, #101923 80%, transparent)'}} />
            <div
              ref={testimonialsRef}
              className="flex items-stretch gap-4 md:gap-8 p-2 md:p-4 overflow-x-auto scroll-smooth hide-scrollbar snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth' }}
            >
              {[...testimonials, ...testimonials].map((item, i) => (
                <div
                  key={i}
                  className="min-w-[220px] sm:min-w-[280px] md:min-w-[340px] max-w-[400px] cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 snap-center"
                  tabIndex={0}
                >
                  <Card className="flex h-full flex-1 flex-col gap-4 rounded-2xl bg-[#1a2330] shadow-2xl border-2 border-[#314c68] items-center p-6">
                    <div
                      className="w-20 h-20 bg-center bg-no-repeat bg-cover rounded-full border-2 border-[#3490f3] mb-2"
                      style={{ backgroundImage: `url('${item.img}')` }}
                    ></div>
                    <CardContent className="px-2 pb-2 flex flex-col items-center">
                      <p className="text-white text-lg font-semibold leading-normal mb-1 text-center">{item.name}</p>
                      <p className="text-[#90accb] text-base font-normal leading-normal text-center">{item.text}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="flex flex-col justify-center items-center gap-4 md:gap-6 px-2 md:px-4 py-6 md:py-10">
            <h1 className="text-white tracking-light text-[32px] font-bold leading-tight text-center max-w-[720px]">
              Ready to Bring Your Ideas to Life?
            </h1>
            <Button
              className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#3490f3] text-white text-lg font-bold leading-normal tracking-[0.015em]"
              onClick={() => navigate('/generate')}
            >
              <span className="truncate">Get Started</span>
            </Button>
          </div>

          {/* Footer */}
          <footer className="flex flex-col gap-4 md:gap-6 px-2 md:px-5 py-6 md:py-10 text-center">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a className="text-[#90accb] text-base font-normal leading-normal min-w-40" href="#">Terms of Service</a>
              <a className="text-[#90accb] text-base font-normal leading-normal min-w-40" href="#">Privacy Policy</a>
              <a className="text-[#90accb] text-base font-normal leading-normal min-w-40" href="#">Contact Us</a>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#">
                <span className="text-[#90accb]">Twitter</span>
              </a>
              <a href="#">
                <span className="text-[#90accb]">Instagram</span>
              </a>
              <a href="#">
                <span className="text-[#90accb]">Facebook</span>
              </a>
            </div>
            <p className="text-[#90accb] text-base font-normal leading-normal">@2023 Visionary AI. All rights reserved.</p>
          </footer>
        </div>
      </section>
      <style>{`
  .hide-scrollbar {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome/Safari/Webkit */
  }
`}</style>
    </div>
  );
};

export default LandingPage; 