import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
        <path d="M48,64a8,8,0,0,1,8-8H72V40a8,8,0,0,1,16,0V56h16a8,8,0,0,1,0,16H88V88a8,8,0,0,1-16,0V72H56A8,8,0,0,1,48,64ZM184,192h-8v-8a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Zm56-48H224V128a8,8,0,0,0-16,0v16H192a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V160h16a8,8,0,0,0,0-16ZM219.31,80,80,219.31a16,16,0,0,1-22.62,0L36.68,198.63a16,16,0,0,1,0-22.63L176,36.69a16,16,0,0,1,22.63,0l20.68,20.68A16,16,0,0,1,219.31,80Zm-54.63,32L144,91.31l-96,96L68.68,208ZM208,68.69,187.31,48l-32,32L176,100.69Z"></path>
      </svg>
    ),
    title: 'Text-to-Image Generation',
    desc: 'Describe your vision in words, and our AI will generate a unique image based on your prompt.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
        <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,172l52-52,80,80H40Zm176,28H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z"></path>
      </svg>
    ),
    title: 'Image-to-Image Transformation',
    desc: 'Upload an existing image and transform it into something new with text prompts or style filters.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
        <path d="M216,104H102.09L210,75.51a8,8,0,0,0,5.68-9.84l-8.16-30a15.93,15.93,0,0,0-19.42-11.13L35.81,64.74a15.75,15.75,0,0,0-9.7,7.4,15.51,15.51,0,0,0-1.55,12L32,111.56c0,.14,0,.29,0,.44v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V112A8,8,0,0,0,216,104ZM192.16,40l6,22.07-22.62,6L147.42,51.83Zm-66.69,17.6,28.12,16.24-36.94,9.75L88.53,67.37Zm-79.4,44.62-6-22.08,26.5-7L94.69,89.4ZM208,200H48V120H208v80Z"></path>
      </svg>
    ),
    title: 'Video & Animation Creation',
    desc: 'Turn your generated images into captivating videos and animations with various effects and transitions.'
  }
];

const examples = [
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXdNH41il6TdE-N-msJg49-YHBjy-IO4bGpTNG-cCfvfzL8X3OK8gt8GbnS9MNC__QSsobNpCzDP9vFteM47hvBlSRst28yT9fApAb1iX_PUgAMeLi0ZATguzKDlVepiJBqHpgiPftZvV3TOd3mrDGGh7JpIplNZMD6HamHXRWJY2xjTwLiNlzamzLUK4U0XNBg9IBmlmA60Z73U0fKA30hNBJi1YwcdE9ikqXqmitRW1VlybPku1KAPA_1CnzWf8urlmp-acuztf2',
    title: 'Abstract Art',
    desc: "Generated from the prompt: 'Abstract art with vibrant colors and dynamic shapes'"
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3IihTP2lOMJUQlBEBLrRd86wUblnjgGvnJSDgBeG1bPH51qrhsF5pPGAdFwqvgug9741zMR1WhQ1Lfe_tIXTUcjIvYGEBJkJn7m3NZZh2qdZ8wV2x3BqomsotTfmbcig3Zxp-7f8lkIkc5yokXKE8vmkUxxQHpVOK4KfNSB4KOIx2yWmbAkd9taQAgrHsuRXRRgnGtavZr9X_NubKAhCF-jUnNAOkdenb3lEGGDWSuwu9qIH0urksCm1xGv28T8knXkILkwY6205l',
    title: 'Fantasy Landscape',
    desc: "Generated from the prompt: 'A breathtaking fantasy landscape with towering mountains and a mystical forest'"
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB83cGKtFxF71T-wcoIN-cM6t8tnbAiNNt5LI7-Pa_5ngZG8N4PLtZuvkpB4ElerE8UMcnph_zSmzCFLwffcWd7_MWKXC_ci52h0e6apbNHApUeYsp2ZAjoPS2FDkTJfo0kXh8c8KJ76Cc_wWuqcegvljhv1Scv43KRx7B7xXd4EuBWRwHEzNYsgb4WD7GHPFwYUtdgThPkQxVw0Ec3mYCfR7MnISHlSALHZdWty_GhKFgrDNnXL0t-GRRTLPaX52uyMcWXBI84dMn',
    title: 'Photorealistic Portrait',
    desc: "Generated from the prompt: 'A photorealistic portrait of a woman with a serene expression'"
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAunGPEqFHSBmOR3MPYj4usLSjD97NMpBsosDSljI2nHbLEVv_jHzSJ1Xu_wsYR5rkTxoLFNQmbtVXVkqoF5Y4LD3unDnTCFh6K6h8d6cJlKMZq3ADSeeq-gVfF0-6fXYkJwBBvS24heaWDx098ST7Ywqm3VyQdGSTIrAzPZ_8aLgPzUZdZQss27XcT-9jLMKW3eLs-9nnjfx5C2Fr59-UZTDUbt-L1k9sM8CPQF7v53624eEU-dT4JPY2xOTNhgBhhGOtooFqCIxA5',
    title: 'Geometric Abstraction',
    desc: "Generated from the prompt: 'Abstract art featuring geometric shapes and a minimalist color palette'"
  }
];

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartGenerating = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/generate');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#111418] dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#283039] px-10 py-3">
          <div className="flex items-center gap-4 text-white">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">VisualForge</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-white text-sm font-medium leading-normal" href="#">Features</a>
              <a className="text-white text-sm font-medium leading-normal" href="#">Pricing</a>
              <a className="text-white text-sm font-medium leading-normal" href="#">Examples</a>
              <a className="text-white text-sm font-medium leading-normal" href="#">Help</a>
            </div>
            <Button onClick={handleStartGenerating} className="min-w-[84px] max-w-[480px] h-10 px-4 bg-[#0c7ff2] text-white text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Start Generating</span>
            </Button>
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div>
              <div>
                <div className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-4 rounded-xl" style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(https://lh3.googleusercontent.com/aida-public/AB6AXuBGarxKXlG9-yb6jbrwVsSy-PDPn6CQ6nHIPpHEn6LbytVBlavQ6ztzRna-a3cJzmiqvyJq7Nmg4ytGFMQHoshMkmLKmjC5ZTE8PdCPe7qbwne1BaZy-V_2iHPe6XL6Onr-jGQEJqyWcSE2igRggR708Oiv50gUIolm0ZDXMQvFMUKu-6lQwjswtICAk-DxPFzMcpFS6v1TYCUp_Xr4FUJqdc8cc6ju3tyTX2hKqH5j7BlzRzlPAWvDw-B5rtpRv7bQLVoieST6aPpl)' }}>
                  <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Unleash Your Creativity with VisualForge</h1>
                    <h2 className="text-white text-sm font-normal leading-normal">Transform your ideas into stunning visuals with our AI-powered image and video generation tools. Create unique art, animations, and more, all from simple text prompts or uploaded images.</h2>
                  </div>
                  <Button onClick={handleStartGenerating} className="min-w-[84px] max-w-[480px] h-10 px-4 bg-[#0c7ff2] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                    <span className="truncate">Start Generating</span>
                  </Button>
                </div>
              </div>
            </div>
            <Separator className="my-8 bg-[#283039]" />
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Key Features</h2>
            <div className="flex flex-col gap-10 px-4 py-10">
              <div className="flex flex-col gap-4">
                <h1 className="text-white tracking-light text-[32px] font-bold leading-tight max-w-[720px]">Generate Images and Videos with Ease</h1>
                <p className="text-white text-base font-normal leading-normal max-w-[720px]">VisualForge offers a range of powerful features to bring your visions to life.</p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(258px,1fr))] gap-6 p-0">
                {features.map((feature, idx) => (
                  <Card key={idx} className="flex flex-1 flex-col gap-3 bg-[#1b2127] border-[#3b4754] p-4">
                    <CardHeader className="p-0 pb-2 flex flex-row items-center gap-3">
                      <div className="text-white">{feature.icon}</div>
                      <CardTitle className="text-base font-bold leading-tight text-white m-0 p-0">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <CardDescription className="text-[#9cabba] text-sm font-normal leading-normal m-0 p-0">{feature.desc}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <Separator className="my-8 bg-[#283039]" />
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Examples</h2>
            <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-stretch p-4 gap-6">
                {examples.map((ex, idx) => (
                  <Card key={idx} className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 bg-[#1b2127] border-[#3b4754]">
                    <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl flex flex-col" style={{ backgroundImage: `url(${ex.img})` }}></div>
                    <CardContent className="p-4">
                      <CardTitle className="text-base font-medium leading-normal text-white m-0 p-0">{ex.title}</CardTitle>
                      <CardDescription className="text-[#9cabba] text-sm font-normal leading-normal m-0 p-0">{ex.desc}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <Separator className="my-8 bg-[#283039]" />
            <div>
              <div className="flex flex-col justify-end gap-6 px-4 py-10">
                <div className="flex flex-col gap-2 text-center">
                  <h1 className="text-white tracking-light text-[32px] font-bold leading-tight max-w-[720px]">Ready to Create?</h1>
                </div>
                <div className="flex flex-1 justify-center">
                  <div className="flex justify-center">
                    <Button onClick={handleStartGenerating} className="min-w-[84px] max-w-[480px] h-10 px-4 bg-[#0c7ff2] text-white text-sm font-bold leading-normal tracking-[0.015em] grow">
                      <span className="truncate">Start Generating</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="flex justify-center">
          <div className="flex max-w-[960px] flex-1 flex-col">
            <footer className="flex flex-col gap-6 px-5 py-10 text-center">
              <div className="flex flex-wrap items-center justify-center gap-6">
                <a className="text-[#9cabba] text-base font-normal leading-normal min-w-40" href="#">Terms of Service</a>
                <a className="text-[#9cabba] text-base font-normal leading-normal min-w-40" href="#">Privacy Policy</a>
                <a className="text-[#9cabba] text-base font-normal leading-normal min-w-40" href="#">Contact Us</a>
              </div>
              <p className="text-[#9cabba] text-base font-normal leading-normal">© 2024 VisualForge. All rights reserved.</p>
            </footer>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage; 