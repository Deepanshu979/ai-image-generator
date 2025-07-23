import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Toast from '../components/ui/toast';
import { ArrowLeft, Download, Pencil, Film } from 'lucide-react';

const ImageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111418] text-white">
        <span className="text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#101923] overflow-x-hidden" style={{ fontFamily: 'Spline Sans, Noto Sans, sans-serif' }}>
      <Navbar />
      <Toast message={error} show={showToast} onClose={() => setShowToast(false)} type="error" />
      <div className="flex flex-col items-center py-8 px-2">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {/* Back Button */}
          <Button variant="ghost" className="self-start mb-2 text-white" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-5 w-5 text-white" /> Back
          </Button>
          {/* Image Card */}
          <Card className="rounded-2xl shadow-lg overflow-hidden w-full">
            <img
              src={image?.imageUrl}
              alt={image?.prompt || 'Generated image'}
              className="w-full object-contain max-h-[480px] bg-[#222]"
            />
          </Card>
          {/* Prompt */}
          <div className="bg-[#1b2127] rounded-xl p-4 shadow border border-[#283039] w-full">
            <div className="text-[#9cabba] text-sm font-semibold mb-1">Prompt</div>
            <div className="text-white text-base">{image?.prompt}</div>
          </div>
          {/* Model Info */}
          <div className="bg-[#1b2127] rounded-xl p-4 shadow border border-[#283039] flex flex-wrap gap-8 justify-between items-center w-full">
            <div>
              <div className="text-[#9cabba] text-xs font-semibold">Model</div>
              <div className="text-white font-bold">{image?.model}</div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-4 justify-between flex-wrap w-full">
            <Button
              className="flex-1 bg-[#0c7ff2] text-white flex items-center justify-center gap-2"
              onClick={() => {
                const promptPart = (image.prompt || 'image').replace(/\s+/g, '-').substring(0, 10);
                const datePart = image.createdAt ? new Date(image.createdAt).toISOString().split('T')[0] : '';
                const filename = `${promptPart}-${datePart}-${image._id}.jpg`;
                handleDownload(image.imageUrl, filename);
              }}
              disabled={downloading}
            >
              {downloading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : <Download className="w-5 h-5" />}
              Download
            </Button>
            <Button className="flex-1 bg-[#a259ff] text-white flex items-center justify-center gap-2" variant="secondary">
              <Pencil className="w-5 h-5" /> Edit Image
            </Button>
            <Button className="flex-1 bg-[#283039] text-white flex items-center justify-center gap-2" variant="secondary">
              <Pencil className="w-5 h-5" /> Edit Prompt
            </Button>
            <Button className="flex-1 bg-[#a259ff] text-white flex items-center justify-center gap-2" variant="secondary">
              <Film className="w-5 h-5" /> Create Video
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailPage; 