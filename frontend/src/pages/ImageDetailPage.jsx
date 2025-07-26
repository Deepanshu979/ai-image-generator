import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Toast from '../components/ui/toast';
import { ArrowLeft, Download, Pencil, Film, Edit3, RefreshCw } from 'lucide-react';

const ImageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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

      // Create FormData for image-to-image generation
      const formData = new FormData();
      formData.append('image', file);
      formData.append('prompt', image.prompt || 'Enhance this image');

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

      // Update the current image with the new one (stay on same page)
      setImage(data.image);
      
      // Update the URL to reflect the new image ID
      navigate(`/image/${data.image._id}`, { replace: true });
      
      setError('New image generated successfully!');
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
    <div className="relative flex min-h-screen flex-col bg-[#101923] overflow-x-hidden" style={{ fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
      <Navbar />
      <Toast message={error} show={showToast} onClose={() => setShowToast(false)} type={error.includes('successfully') ? 'success' : 'error'} />
      <div className="flex flex-col items-center py-4 sm:py-6 md:py-8 px-2 sm:px-4">
        <div className="w-full max-w-2xl flex flex-col gap-4 sm:gap-6">
          {/* Back Button */}
          <Button variant="ghost" className="self-start mb-2 text-white text-sm sm:text-base" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" /> Back
          </Button>
          {/* Image Card */}
          <Card className="rounded-2xl shadow-lg overflow-hidden w-full">
            {isGenerating ? (
              <div className="flex min-h-[480px] items-center justify-center bg-[#222]">
                <svg className="animate-spin w-10 h-10 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              </div>
            ) : (
              <img
                src={image?.imageUrl}
                alt={image?.prompt || 'Generated image'}
                className="w-full object-contain max-h-[480px] bg-[#222]"
              />
            )}
          </Card>
          {/* Prompt with Edit and Generate Icons */}
          <div className="bg-[#1b2127] rounded-xl p-3 sm:p-4 shadow border border-[#283039] w-full">
            <div className="text-[#9cabba] text-xs sm:text-sm font-semibold mb-1">Prompt</div>
            {isEditingPrompt ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="w-full p-2 bg-[#283039] text-white rounded border border-[#3a4750] focus:outline-none focus:border-[#0c7ff2] resize-none text-sm sm:text-base"
                  rows={3}
                  placeholder="Enter your prompt..."
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-[#0c7ff2] text-white text-xs sm:text-sm"
                    onClick={handleSavePrompt}
                  >
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-white border-[#3a4750] text-xs sm:text-sm"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="text-white text-sm sm:text-base flex-1">{image?.prompt}</div>
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={handleEditPrompt}
                    className="p-1.5 sm:p-2 text-[#9cabba] hover:text-white hover:bg-[#283039] rounded-lg transition-colors"
                    title="Edit prompt"
                  >
                    <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={handleGenerateNewImage}
                    disabled={isGenerating}
                    className="p-1.5 sm:p-2 text-[#9cabba] hover:text-white hover:bg-[#283039] rounded-lg transition-colors disabled:opacity-50"
                    title="Generate new image using current image"
                  >
                    {isGenerating ? (
                      <svg className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Model Info */}
          <div className="bg-[#1b2127] rounded-xl p-3 sm:p-4 shadow border border-[#283039] flex flex-wrap gap-4 sm:gap-8 justify-between items-center w-full">
            <div>
              <div className="text-[#9cabba] text-xs font-semibold">Model</div>
              <div className="text-white font-bold text-sm sm:text-base">{image?.model}</div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between w-full">
            <Button
              className="flex-1 bg-[#0c7ff2] text-white flex items-center justify-center gap-2 text-sm sm:text-base"
              onClick={() => {
                const promptPart = (image.prompt || 'image').replace(/\s+/g, '-').substring(0, 10);
                const datePart = image.createdAt ? new Date(image.createdAt).toISOString().split('T')[0] : '';
                const filename = `${promptPart}-${datePart}-${image._id}.jpg`;
                handleDownload(image.imageUrl, filename);
              }}
              disabled={downloading}
            >
              {downloading ? (
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : <Download className="w-4 h-4 sm:w-5 sm:h-5" />}
              Download
            </Button>
            <Button className="flex-1 bg-[#a259ff] text-white flex items-center justify-center gap-2 text-sm sm:text-base" variant="secondary">
              <Film className="w-4 h-4 sm:w-5 sm:h-5" /> Create Video
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailPage; 