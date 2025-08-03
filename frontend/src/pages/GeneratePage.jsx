import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../layouts/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Toast from '../components/ui/toast';
import { Download, Eye, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const initialImages = [];

const GeneratePage = () => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedModel, setSelectedModel] = useState('stable-diffusion');
  const [availableModels, setAvailableModels] = useState([]);
  const [images, setImages] = useState(initialImages); // now array of objects
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(false);
  const loaderTimeout = useRef(null);
  const [fetchError, setFetchError] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [imageVersions, setImageVersions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [imagesPerPage] = useState(20);

  // Helper function to get user-friendly model names
  const getModelDisplayName = (modelKey) => {
    const modelNames = {
      'stable-diffusion': 'Stable Diffusion',
      'flux-schnell': 'Flux Schnell',
      'openai-dall-e-3': 'OpenAI DALL-E 3',
      'midjourney': 'Midjourney',
      'sdxl': 'SDXL (High Quality)'
    };
    return modelNames[modelKey] || modelKey;
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Show toast for fetch errors
  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
      setShowToast(true);
    }
  }, [fetchError]);

  useEffect(() => {
    const fetchImages = async () => {
      setIsFetching(true);
      setFetchError('');
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setIsFetching(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/images/user/${userId}?page=${currentPage}&limit=${imagesPerPage}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        let data;
        try {
          data = await res.json();
        } catch (parseError) {
          if (!res.ok) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error('Invalid response from server.');
          }
        }

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Please log in again to continue.');
          } else if (res.status === 403) {
            throw new Error('You do not have permission to view these images.');
          } else if (res.status === 404) {
            throw new Error('User images not found.');
          } else {
            throw new Error(data.error || 'Failed to fetch images. Please try again.');
          }
        }

        if (data.images) {
          setImages(data.images); // store full objects
          setTotalImages(data.pagination?.total || 0);
          setTotalPages(data.pagination?.pages || 1);
        } else {
          setImages([]); // set empty array if no images
          setTotalImages(0);
          setTotalPages(1);
        }
      } catch (err) {
        setFetchError(err.message);
        console.error('Fetch images error:', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchImages();
  }, [currentPage, imagesPerPage]);

  // Fetch available models
  useEffect(() => {
    // Simplified model definitions
    const textToImageModels = {
      'stable-diffusion': 'Stable Diffusion',
      'flux-dev': 'Flux Dev',
      'flux-schnell': 'Flux Schnell'
    };
    
    const imageToImageModels = {
      'flux': 'Flux'
    };
    
    // Set models based on current mode
    if (imageFile) {
      setAvailableModels(imageToImageModels);
      setSelectedModel('flux'); // Set to flux for image-to-image
    } else {
      setAvailableModels(textToImageModels);
      setSelectedModel('stable-diffusion'); // Set to stable-diffusion for text-to-image
    }
  }, [imageFile]); // Re-run when imageFile changes to switch between modes

  // Retry function for fetching images
  const handleRetryFetch = () => {
    setCurrentPage(1); // Reset to first page when retrying
    const fetchImages = async () => {
      setIsFetching(true);
      setFetchError('');
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setIsFetching(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/images/user/${userId}?page=1&limit=${imagesPerPage}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        let data;
        try {
          data = await res.json();
        } catch (parseError) {
          if (!res.ok) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error('Invalid response from server.');
          }
        }

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Please log in again to continue.');
          } else if (res.status === 403) {
            throw new Error('You do not have permission to view these images.');
          } else if (res.status === 404) {
            throw new Error('User images not found.');
          } else {
            throw new Error(data.error || 'Failed to fetch images. Please try again.');
          }
        }

        if (data.images) {
          setImages(data.images);
          setTotalImages(data.pagination?.total || 0);
          setTotalPages(data.pagination?.pages || 1);
        } else {
          setImages([]);
          setTotalImages(0);
          setTotalPages(1);
        }
      } catch (err) {
        setFetchError(err.message);
        console.error('Retry fetch images error:', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchImages();
  };

  // Pagination navigation functions
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
        
        let data;
        try {
          data = await res.json();
        } catch (parseError) {
          // If response is not JSON, handle as network/server error
          if (!res.ok) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error('Invalid response from server.');
          }
        }
        
        if (!res.ok) {
          // Handle specific error cases
          if (res.status === 401) {
            throw new Error('Please log in again to continue.');
          } else if (res.status === 403) {
            throw new Error(data.error || 'Insufficient credits. Please purchase more credits to continue.');
          } else if (res.status === 400) {
            throw new Error(data.error || 'Invalid request. Please check your input.');
          } else {
            throw new Error(data.error || 'Failed to generate image. Please try again.');
          }
        }
        
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
          body: JSON.stringify({ 
            prompt,
            model: selectedModel
          }),
        });
        
        let data;
        try {
          data = await res.json();
        } catch (parseError) {
          // If response is not JSON, handle as network/server error
          if (!res.ok) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error('Invalid response from server.');
          }
        }
        
        if (!res.ok) {
          // Handle specific error cases
          if (res.status === 401) {
            throw new Error('Please log in again to continue.');
          } else if (res.status === 403) {
            throw new Error(data.error || 'Insufficient credits. Please purchase more credits to continue.');
          } else if (res.status === 400) {
            throw new Error(data.error || 'Invalid request. Please check your input.');
          } else {
            throw new Error(data.error || 'Failed to generate image. Please try again.');
          }
        }
        
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
            {/* Generation Form - Only show on page 1 */}
            {currentPage === 1 && (
              <>
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
                  <div className="flex flex-1 gap-3 px-4 py-3 justify-start items-center flex-nowrap">
                    
                    <Button
                      className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#0c7ff2] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                      onClick={handleGenerate}
                      disabled={loading || !prompt.trim()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      <span className="truncate">{loading ? 'Generating...' : 'Generate'}</span>
                    </Button>

                    {/* Model Selection - Next to generate button */}
                    <Select onValueChange={(value) => setSelectedModel(value)} value={selectedModel} defaultValue={selectedModel} disabled={loading}>
                      <SelectTrigger className="h-10 px-3 rounded-xl bg-[#283039] text-white text-sm border-none focus:outline-none focus:ring-0 min-w-[144px] max-w-[144px] w-[144px] model-dropdown-fixed">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#283039] border-[#3a4750] min-w-[144px]">
                        {Object.entries(availableModels).map(([key, name]) => (
                          <SelectItem key={key} value={key} className="text-white hover:bg-[#314c68] focus:bg-[#314c68]">
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Page Header - Show different content based on page */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-white tracking-light text-[32px] font-bold leading-tight">
                  {currentPage === 1 ? 'Generated Images' : `Your Images - Page ${currentPage}`}
                </p>
                <p className="text-[#9cabba] text-sm font-normal leading-normal">
                  {currentPage === 1 
                    ? 'Browse and manage your AI-generated images.'
                    : `Showing page ${currentPage} of your generated images.`
                  }
                </p>
              </div>
              {/* Generate New Image Button - Only show on pages other than page 1 */}
              {currentPage !== 1 && (
                <div className="flex items-center">
                  <Button
                    onClick={() => setCurrentPage(1)}
                    className="flex items-center gap-2 bg-[#0c7ff2] text-white px-4 py-2 rounded-lg hover:bg-[#0a6fd8] transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Generate New Image
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 p-4 min-h-[240px]">
              {isFetching ? (
                <div className="col-span-full flex justify-center items-center h-40">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-10 w-10 text-blue-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <p className="text-[#9cabba] text-sm">Loading your images...</p>
                  </div>
                </div>
              ) : fetchError ? (
                <div className="col-span-full flex justify-center items-center h-40">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="text-red-400 text-4xl">⚠️</div>
                    <div className="text-white text-lg font-semibold">Failed to Load Images</div>
                    <p className="text-[#9cabba] text-sm max-w-md">{fetchError}</p>
                    <Button
                      onClick={handleRetryFetch}
                      className="bg-[#0c7ff2] text-white px-4 py-2 rounded-lg hover:bg-[#0a6fd8] transition-colors"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : images.length === 0 ? (
                <div className="col-span-full flex justify-center items-center h-40">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="text-[#9cabba] text-4xl">🖼️</div>
                    <div className="text-white text-lg font-semibold">No Images Yet</div>
                    <p className="text-[#9cabba] text-sm">Generate your first image to see it here!</p>
                  </div>
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
                        onError={(e) => {
                          // Handle image load errors
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="hidden w-full h-full items-center justify-center bg-[#283039] rounded-xl"
                        style={{ display: 'none' }}
                      >
                        <div className="text-center">
                          <div className="text-[#9cabba] text-2xl mb-2">🖼️</div>
                          <p className="text-[#9cabba] text-xs">Image unavailable</p>
                        </div>
                      </div>
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
            
            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-[#283039]">
                <div className="text-[#9cabba] text-sm">
                  Showing {((currentPage - 1) * imagesPerPage) + 1} to {Math.min(currentPage * imagesPerPage, totalImages)} of {totalImages} images
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Previous Page Button */}
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#283039] text-white hover:bg-[#314c68] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-[#0c7ff2] text-white'
                              : 'bg-[#283039] text-[#9cabba] hover:bg-[#314c68] hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {/* Show ellipsis if needed */}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="text-[#9cabba] px-2">...</span>
                    )}
                    
                    {/* Show last page if not in current range */}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#283039] text-[#9cabba] hover:bg-[#314c68] hover:text-white transition-colors"
                      >
                        {totalPages}
                      </button>
                    )}
                  </div>
                  
                  {/* Next Page Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#283039] text-white hover:bg-[#314c68] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratePage;