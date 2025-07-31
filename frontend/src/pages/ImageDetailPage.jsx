import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Toast from '../components/ui/toast';
import { ArrowLeft, Download, Heart, Share, MoreHorizontal, Edit3, RefreshCw } from 'lucide-react';

const ImageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [historyImages, setHistoryImages] = useState([]);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageVersions, setImageVersions] = useState([]);

  useEffect(() => {
    const fetchImage = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/images/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (!res.ok || !data.image) throw new Error(data.error || 'Image not found');
        setImage(data.image);
        setEditedPrompt(data.image.prompt || '');
      } catch (err) {
        setError(err.message);
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  }, [id]);

  // Fetch image versions (proper versioning system)
  useEffect(() => {
    const fetchImageVersions = async () => {
      if (!image) return;
      
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/images/${id}/versions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          // Filter out the current image and sort by version number
          const filteredVersions = data.versions
            .filter(version => version._id !== id)
            .sort((a, b) => b.versionInfo.versionNumber - a.versionInfo.versionNumber);
          setImageVersions(filteredVersions);
        } else {
          console.error('Failed to fetch versions:', res.status);
        }
      } catch (err) {
        console.error('Failed to fetch image versions:', err);
      }
    };
    fetchImageVersions();
  }, [id, image]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleDownload = async (url, filename = 'image.jpg') => {
    setDownloading(true);
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
      setDownloading(false);
    }
  };

  const handleEditPrompt = () => {
    setIsEditingPrompt(true);
  };

  const handleSavePrompt = async () => {
    if (!editedPrompt.trim() || editedPrompt === image.prompt) {
      setIsEditingPrompt(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/images/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ prompt: editedPrompt }),
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
          throw new Error(data.error || 'You do not have permission to edit this image.');
        } else {
          throw new Error(data.error || 'Failed to update prompt.');
        }
      }

      setImage({ ...image, prompt: editedPrompt });
      setIsEditingPrompt(false);
      setError('Prompt updated successfully!');
      setShowToast(true);
    } catch (err) {
      setError(err.message);
      setShowToast(true);
    }
  };

  const handleCancelEdit = () => {
    setEditedPrompt(image.prompt || '');
    setIsEditingPrompt(false);
  };

  const handleGenerateNewImage = async () => {
    if (!image) return;
    
    setIsGenerating(true);
    try {
      // First, download the current image to get it as a file
      const response = await fetch(image.imageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const file = new File([blob], 'current-image.jpg', { type: 'image/jpeg' });

      // Create FormData for version creation
      const formData = new FormData();
      formData.append('image', file);
      formData.append('prompt', image.prompt || 'Enhance this image');

      // Use the proper versioning endpoint
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/images/${id}/versions`, {
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
          throw new Error(data.error || 'Insufficient credits. Please purchase more credits to continue.');
        } else if (res.status === 400) {
          throw new Error(data.error || 'Invalid request. Please check your input.');
        } else {
          throw new Error(data.error || 'Failed to generate image. Please try again.');
        }
      }

      // Update the current image with the new version
      setImage(data.image);
      
      // Update the URL to reflect the new image ID
      navigate(`/image/${data.image._id}`, { replace: true });
      
      setError(`Version ${data.versionNumber} created successfully!`);
      setShowToast(true);
    } catch (err) {
      setError(err.message);
      setShowToast(true);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101923] text-white">
        <span className="text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#101923] dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <Navbar />
      <Toast message={error} show={showToast} onClose={() => setShowToast(false)} type={error.includes('successfully') ? 'success' : 'error'} />
      
      <div className="layout-container flex h-full grow flex-col">
        {/* Breadcrumb */}
        <div className="flex flex-wrap gap-2 p-4">
          <Link to="/generate" className="text-[#9badc0] text-base font-medium leading-normal hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-[#9badc0] text-base font-medium leading-normal">/</span>
          <span className="text-white text-base font-medium leading-normal">Image</span>
        </div>

        {/* Main Content */}
        <div className="flex w-full grow bg-[#101923] p-6 gap-6 justify-center">
          {/* Left Column - Image and Details */}
          <div className="flex flex-col flex-1 max-w-4xl">
            {/* Image Display */}
            <div className="max-w-3xl max-h-[28rem] rounded-xl overflow-hidden mb-8 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-[#3a4750] shadow-2xl">
              <div className="relative group h-full">
                {isGenerating ? (
                  <div className="flex items-center justify-center bg-[#101923] p-12 h-full">
                    <div className="text-center">
                      <svg className="animate-spin h-12 w-12 text-blue-400 mx-auto mb-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <p className="text-[#9badc0] text-sm">Generating new version...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center items-center p-6 h-full">
                      <img
                        src={image?.imageUrl}
                        alt={image?.prompt || 'Generated image'}
                        className="w-full h-full object-contain rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-[1.02] cursor-zoom-in"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onClick={() => {
                          // Open image in new tab for full view
                          window.open(image?.imageUrl, '_blank');
                        }}
                      />
                    </div>
                    
                    {/* Image overlay with info */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
                        <div className="flex items-center gap-2">
                          <span>Click to view full size</span>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zM9 21l-2.3-2.3-2.87 2.89-1.42-1.42L5.3 17.3 3 15v6h6zM21 15l-2.3 2.3-2.89-2.87-1.42 1.42L17.3 18.7 15 21h6v-6z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Image metadata overlay */}
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
                        <div className="flex items-center gap-2">
                          <span>Generated with {image?.model}</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="hidden items-center justify-center text-[#9badc0] p-12"
                      style={{ display: 'none' }}
                    >
                      <div className="text-center">
                        <div className="text-6xl mb-4">🖼️</div>
                        <p className="text-lg font-medium mb-2">Image unavailable</p>
                        <p className="text-sm text-[#7a8a9a]">The image could not be loaded</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] text-left pb-3 pt-5">
              {image?.title || 'Generated Image'}
            </h1>

            {/* Description */}
            <p className="text-white text-base font-normal leading-normal pb-3 pt-1">
              {image?.description || image?.prompt || 'AI generated image'}
            </p>

            {/* Prompt Section */}
            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">Prompt</h3>
            <div className="pb-3 pt-1">
              {isEditingPrompt ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="w-full p-3 bg-[#283039] text-white rounded-lg border border-[#3a4750] focus:outline-none focus:border-[#0c7ff2] resize-none text-sm"
                    rows={3}
                    placeholder="Enter your prompt..."
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-[#0c7ff2] text-white text-sm"
                      onClick={handleSavePrompt}
                    >
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-white border-[#3a4750] text-sm"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <p className="text-white text-base font-normal leading-normal flex-1">
                    {image?.prompt || 'No prompt available'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditPrompt}
                      className="p-2 text-[#9badc0] hover:text-white hover:bg-[#283039] rounded-lg transition-colors"
                      title="Edit prompt"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleGenerateNewImage}
                      disabled={isGenerating}
                      className="p-2 text-[#9badc0] hover:text-white hover:bg-[#283039] rounded-lg transition-colors disabled:opacity-50"
                      title="Generate new image using current image"
                    >
                      {isGenerating ? (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Section */}
            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">Settings</h3>
            <div className="grid grid-cols-[20%_1fr] gap-x-6">
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#3b4c5e] py-5">
                <p className="text-[#9badc0] text-sm font-normal leading-normal">Model</p>
                <p className="text-white text-sm font-normal leading-normal">{image?.model || 'Unknown'}</p>
              </div>
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#3b4c5e] py-5">
                <p className="text-[#9badc0] text-sm font-normal leading-normal">Created</p>
                <p className="text-white text-sm font-normal leading-normal">
                  {image?.createdAt ? new Date(image.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#3b4c5e] py-5">
                <p className="text-[#9badc0] text-sm font-normal leading-normal">Status</p>
                <p className="text-white text-sm font-normal leading-normal">{image?.status || 'Completed'}</p>
              </div>
              {image?.settings && Object.keys(image.settings).length > 0 && (
                Object.entries(image.settings).map(([key, value]) => (
                  <div key={key} className="col-span-2 grid grid-cols-subgrid border-t border-t-[#3b4c5e] py-5">
                    <p className="text-[#9badc0] text-sm font-normal leading-normal capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-white text-sm font-normal leading-normal">{String(value)}</p>
                  </div>
                ))
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 py-2">
              <div className="flex items-center justify-center gap-2 px-3 py-2">
                <div className="text-[#9badc0]">
                  <Heart className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 px-3 py-2">
                <div 
                  className="text-[#9badc0] cursor-pointer hover:text-white transition-colors"
                  onClick={() => {
                    const promptPart = (image.prompt || 'image').replace(/\s+/g, '-').substring(0, 10);
                    const datePart = image.createdAt ? new Date(image.createdAt).toISOString().split('T')[0] : '';
                    const filename = `${promptPart}-${datePart}-${image._id}.jpg`;
                    handleDownload(image.imageUrl, filename);
                  }}
                >
                  <Download className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 px-3 py-2">
                <div className="text-[#9badc0]">
                  <Share className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 px-3 py-2">
                <div className="text-[#9badc0]">
                  <MoreHorizontal className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Remix Button */}
            <div className="flex py-3 justify-start">
              <Button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#d2e2f3] text-[#14191f] text-sm font-bold leading-normal tracking-[0.015em]"
                onClick={() => navigate('/generate')}
              >
                <span className="truncate">Remix</span>
              </Button>
            </div>
          </div>

          {/* Right Column - Version History */}
          <div className="flex flex-col w-[280px]">
            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">Version History</h3>
            <p className="text-[#9badc0] text-sm pb-4">Previous versions of this image</p>
            <div className="grid grid-cols-2 gap-3">
              {imageVersions.length > 0 ? (
                imageVersions.map((versionImage, index) => (
                  <div key={versionImage._id} className="flex flex-col gap-2">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity border-2 border-transparent hover:border-[#0c7ff2] relative"
                      style={{ backgroundImage: `url(${versionImage.imageUrl})` }}
                      onClick={() => navigate(`/image/${versionImage._id}`)}
                      title={`Version ${versionImage.versionInfo.versionNumber}: ${versionImage.prompt?.substring(0, 30)}...`}
                    >
                      <div className="absolute top-1 right-1 bg-[#0c7ff2] text-white text-xs px-1 py-0.5 rounded">
                        v{versionImage.versionInfo.versionNumber}
                      </div>
                    </div>
                    <p className="text-[#9badc0] text-xs truncate">
                      {versionImage.prompt?.substring(0, 25)}...
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 flex justify-center items-center h-40">
                  <div className="text-center">
                    <div className="text-[#9badc0] text-2xl mb-2">🔄</div>
                    <p className="text-[#9badc0] text-sm">No previous versions</p>
                    <p className="text-[#9badc0] text-xs mt-1">Edit this image to create versions</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailPage; 