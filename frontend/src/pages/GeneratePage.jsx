import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../layouts/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Toast from '../components/ui/toast';
import { Download, Eye, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const initialImages = [];

const GeneratePage = () => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [images, setImages] = useState(initialImages); // now array of objects
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(false);
  const loaderTimeout = useRef(null);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/images/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.images) {
          setImages(data.images); // store full objects
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (loading) {
      setShowLoader(true);
    } else {
      // Ensure loader is visible for at least 500ms
      if (loaderTimeout.current) clearTimeout(loaderTimeout.current);
      loaderTimeout.current = setTimeout(() => {
        setShowLoader(false);
      }, 2000);
    }
    return () => {
      if (loaderTimeout.current) clearTimeout(loaderTimeout.current);
    };
  }, [loading]);

  // Handle image file selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Unified generate handler
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      let newImage = null;
      if (imageFile) {
        // Image-to-Image
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('prompt', prompt);
        // Optionally add guidance, speed_mode, title, description, etc.
        // formData.append('guidance', '2.5');
        // formData.append('speed_mode', 'Real Time');
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/images/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate image');
        newImage = data.image;
        setImageFile(null);
        setImagePreview(null);
      } else {
        // Text-to-Image
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
        newImage = data.images[0];
      }
      setImages([newImage, ...images]);
      setPrompt('');
    } catch (err) {
      setError(err.message);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Download handler (unchanged)
  const handleDownload = async (url, filename = 'image.jpg', id) => {
    setDownloadingId(id);
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      alert('Failed to download image.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#101923] overflow-x-hidden" style={{ fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
      <Navbar />
      <Toast message={error} show={showToast} onClose={() => setShowToast(false)} type="error" />
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-white tracking-light text-[32px] font-bold leading-tight">
                  {imageFile ? 'Image-to-Image Generation' : 'Text-to-Image Generation'}
                </p>
                <p className="text-[#9cabba] text-sm font-normal leading-normal">
                  {imageFile
                    ? 'Upload an image and enter a prompt to generate a new image using AI.'
                    : 'Enter a prompt to generate a new image using AI.'}
                </p>
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
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <span className="text-white text-sm mb-2">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#283039] file:text-white hover:file:bg-[#314c68]"
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 rounded-xl max-h-40 object-contain border border-[#314c68]" />
                )}
              </label>
            </div>
            <div className="flex justify-stretch">
              <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
                <Button
                  className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#0c7ff2] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  <span className="truncate">{loading ? 'Generating...' : 'Generate'}</span>
                </Button>
              </div>
            </div>
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Generated Images</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 p-4 min-h-[240px]">
              {showLoader && images.length === 0 ? (
                <div className="col-span-full flex justify-center items-center h-40">
                  <svg className="animate-spin h-10 w-10 text-blue-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              ) : (
                images.map((imgObj, idx) => (
                  <Card
                    key={imgObj._id || idx}
                    className="relative flex flex-col gap-3 w-[220px] h-[220px] cursor-pointer group transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-2xl"
                    onClick={() => navigate(`/image/${imgObj._id}`)}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={imgObj.imageUrl}
                        alt={`Generated ${idx}`}
                        className="object-cover w-full h-full rounded-xl"
                      />
                    </div>
                    <div
                      className="absolute bottom-2 right-2 flex gap-2 z-10 items-center"
                      onClick={e => e.stopPropagation()}
                    >
                      <span className="relative">
                        <Download
                          className={`w-5 h-5 text-white hover:text-blue-400 cursor-pointer ${downloadingId === imgObj._id ? 'opacity-50 pointer-events-none' : ''}`}
                          onClick={() => {
                            const promptPart = (imgObj.prompt || 'image').replace(/\s+/g, '-').substring(0, 10);
                            const datePart = imgObj.createdAt ? new Date(imgObj.createdAt).toISOString().split('T')[0] : '';
                            const filename = `${promptPart}-${datePart}-${imgObj._id}.jpg`;
                            handleDownload(imgObj.imageUrl, filename, imgObj._id);
                          }}
                        />
                        {downloadingId === imgObj._id && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 text-blue-400" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                          </span>
                        )}
                      </span>
                      <Link to={`/image/${imgObj._id}`} onClick={e => e.stopPropagation()}>
                        <Eye className="w-5 h-5 text-white hover:text-blue-400 cursor-pointer" />
                      </Link>
                    </div>
                  </Card>
                ))
              )}
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