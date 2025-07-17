import React, { useState } from 'react';
import Navbar from '../layouts/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const initialImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDCO5YfKRH_bcYAicD2RanCTC9WoLreDZtEOfvwrsHdNJ-K8H_CfudDgg7MgKekopC5D_Y8q8evwxgDp03gorZUhJ9OrtpxIoKP82WbyIl4x0S3owSy4t14UhtE9U7-yFZYcgGNOQ3ORE9x26ZhDxNZjcClE7T6R5ou83vFPq-tI2lWHp7I_pU5t9xkjm66bEQcIsCh4Vpc3VJr30Z5E8gdaqscTqaOBVasgfwdGRlXxmA2Kw2cXj7X0jkfDwOpbgqUEN7oldXvy_Uv",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA9l4Wv8v-GDVoFK7iVpvxSbhc-ef1pvt2iAE3yCBvva79281K5s1FKn43d1fsuNJ9d47U3lLR9tDi6h2QtfzDF46jX8tMvhQqFDcRRzJfcRZiuqtus55ug42B9Hb-zkqRQx9KQXvGFEh6XzfgJ7BsiOBYgKwjD6qxwq6d6JIC64x3YXlq3bUD-_oQZda2ErFOYh8fPEn3V_G-SBSLghk-048me0T25yi_btDmn0XCDzbN1YD5rLGjeHo2MJuKilxWeFaS1GH9cTzv5",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAU-y9VxI0SKxb68BLZk_Wl5EsOC-RjIVSPp-oTj5z-1-hZvNOOB-iyXwZabFfSxLAjUToSdaq4RGsfE0V2Rt71RZgjEIM_XP9q9WsHjP7gMdI2YTFBTBMLp4v2vzy_UA8yBCdM0OC-Vl2zzTuGc77uB12tRE1UjIcxWkImVg8I6D80KW4Ab4ROSxtF3-Yol7aO94xm65mOqKX457oq4NuBVef8CvjZQiU_rnxDrwJ7bbBI23knyWWrV909YNOYST7EEzuRm8yjPudz",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDMWsWFiHDf7Tnlj7nrn_E8rmi75SqCi8LTeRF0YZVAtbKPA4QwVwPeoi-nVd7nAHRXxgL_4u9I78Fc25DRsq6_c6t4ACnZbmJeJWSCmaILOeUyP7FDegGRQJeQ2Z0vidr2cZs8B9eQQ27ocFE_mtthzopkbe1k1kHQrqC6fiNVtIyrDjr2MMjnIcJjy0dsT4n5hts2TvOaXSuqjPSiNrGxwx-apApDY2ifx4DMIfuO_PaeJ0b0rPia7-3-VBVuoonO9iNl2uLT7msd",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAacp7cBbhzqxx7-xrYr1746rH3lMMrja3LH7WfFm5mjbW1u3LULZOUSljvg5okATJ1dyzOTbhSM8CQjbaB2vM0v86lfXsiEX8K_d0x1uEXQzGFQAx324T8K5jfoOGy31lWxG0j0z1aPZMsiQhnU26_gH9OSdAPAkwUmqwiJMug75IXBnWxeLAfzRMFQQYLakJ-z0EPajKaS8v-BUKVrUK8o3xOGTP7Xtq-5gFsIt3xk-m6MaZVipjJQf83uyCJPqKuVRwRsUYtrEvz",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBFyzKDPuJ5E5u-BU2IDu7rO9CELE2LsBTmVbT3ECp35_aHXIxP0fjfgu9YJwM6IjzURPbEbZRbgBzGzj9fSKLa2iBQ2di3rXlQUCKfPDhTrtrTSEwSJrpWxR3ICyjVFVClZnNOF_vdNgPxgjJe1_edrP7ci0EZ6bnPrex3bcu1ZslTLlTJx6rD4IgPh0D2B5vGwDS9gETwKpUnrsgzGumLzEP2OEoFgyWZfKA6ZUodef1rbivXYnRShRQTunjAALPMpEeEpaNQjSuz"
];

const GeneratePage = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/images/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate image');
      // Assume the backend returns { imageUrl: '...' }
      setImages([data.imageUrl, ...images]);
      setPrompt('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#111418] overflow-x-hidden" style={{ fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
      <Navbar />
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-white tracking-light text-[32px] font-bold leading-tight">Generate Images</p>
                <p className="text-[#9cabba] text-sm font-normal leading-normal">Describe the image you want to create, or upload an image to use as a starting point.</p>
              </div>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <input
                  placeholder="Enter a prompt"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#283039] focus:border-none h-14 placeholder:text-[#9cabba] p-4 text-base font-normal leading-normal"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  disabled={loading}
                />
              </label>
            </div>
            <div className="flex justify-stretch">
              <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#283039] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                  disabled={loading}
                >
                  <span className="truncate">Upload Image</span>
                </button>
                <Button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#0c7ff2] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                >
                  <span className="truncate">{loading ? 'Generating...' : 'Generate'}</span>
                </Button>
              </div>
            </div>
            {error && <div className="text-red-400 text-sm text-center pb-2">{error}</div>}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Generated Images</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
              {images.map((img, idx) => (
                <Card key={idx} className="flex flex-col gap-3">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                    style={{ backgroundImage: `url(${img})` }}
                  ></div>
                </Card>
              ))}
            </div>
            {/* Pagination UI (static for now) */}
            <div className="flex items-center justify-center p-4">
              <a href="#" className="flex size-10 items-center justify-center">
                <div className="text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
                  </svg>
                </div>
              </a>
              <a className="text-sm font-bold leading-normal tracking-[0.015em] flex size-10 items-center justify-center text-white rounded-full bg-[#283039]" href="#">1</a>
              <a className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-white rounded-full" href="#">2</a>
              <a className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-white rounded-full" href="#">3</a>
              <span className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-white rounded-full" href="#">...</span>
              <a className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-white rounded-full" href="#">10</a>
              <a href="#" className="flex size-10 items-center justify-center">
                <div className="text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratePage; 