import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../layouts/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Toast from '../components/ui/toast';
import { Download, Eye, Heart, Share } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const LikedPhotosPage = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [imagesPerPage] = useState(20);
  const navigate = useNavigate();
  const loaderTimeout = useRef(null);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    const fetchImages = async () => {
      setIsFetching(true);
      setFetchError('');
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/images/liked?page=${currentPage}&limit=${imagesPerPage}` , {
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
        console.error('Fetch liked images error:', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchImages();
  }, [currentPage, imagesPerPage]);

  const handleRetryFetch = () => {
    setCurrentPage(1);
    const fetchImages = async () => {
      setIsFetching(true);
      setFetchError('');
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/images/liked?page=1&limit=${imagesPerPage}` , {
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
        console.error('Retry fetch liked images error:', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchImages();
  };

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
                <p className="text-white tracking-light text-[32px] font-bold leading-tight">Liked Photos❤️</p>
                <p className="text-[#9cabba] text-sm font-normal leading-normal">Browse photos you have liked.</p>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 p-4 min-h-[240px]">
              {isFetching ? (
                <div className="col-span-full flex justify-center items-center h-40">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-10 w-10 text-blue-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <p className="text-[#9cabba] text-sm">Loading your liked images...</p>
                  </div>
                </div>
              ) : fetchError ? (
                <div className="col-span-full flex justify-center items-center h-40">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="text-red-4 00 text-4xl">⚠️</div>
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
                    <div className="text-white text-lg font-semibold">No Liked Images</div>
                    <p className="text-[#9cabba] text-sm">Like some images to see them here!</p>
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
                        alt={`Liked ${idx}`}
                        className="object-cover w-full h-full rounded-xl"
                        onError={(e) => {
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
                        <Heart
                          className={`w-5 h-5 cursor-pointer transition-colors ${
                            imgObj.likes?.includes(localStorage.getItem('userId')) 
                              ? 'text-red-500 fill-current' 
                              : 'text-white hover:text-blue-400'
                          }`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const res = await fetch(`${process.env.REACT_APP_API_URL}/api/images/${imgObj._id}/like`, {
                                method: 'POST',
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                                },
                              });
                              if (res.ok) {
                                const data = await res.json();
                                setImages(prevImages => {
                                  const updated = prevImages.map(img => 
                                    img._id === imgObj._id 
                                      ? { 
                                          ...img, 
                                          likes: data.isLiked 
                                            ? [...(img.likes || []), localStorage.getItem('userId')]
                                            : (img.likes || []).filter(id => id !== localStorage.getItem('userId'))
                                        }
                                      : img
                                  );
                                  // If unliked, remove from list on this page
                                  if (!data.isLiked) {
                                    return updated.filter(img => img._id !== imgObj._id);
                                  }
                                  return updated;
                                });
                              }
                            } catch (error) {
                              console.error('Failed to like/unlike image:', error);
                            }
                          }}
                        />
                      </span>

                      <span className="relative">
                        <Share
                          className="w-5 h-5 text-white hover:text-blue-400 cursor-pointer transition-colors"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const response = await fetch(imgObj.imageUrl);
                              const blob = await response.blob();
                              const promptPart = (imgObj.prompt || 'image').replace(/\s+/g, '-').substring(0, 10);
                              const datePart = imgObj.createdAt ? new Date(imgObj.createdAt).toISOString().split('T')[0] : '';
                              const filename = `${promptPart}-${datePart}-${imgObj._id}.jpg`;
                              const file = new File([blob], filename, { type: blob.type });
                              const shareData = {
                                title: imgObj.title || 'AI Generated Image',
                                text: imgObj.prompt || 'Check out this amazing AI-generated image!',
                                files: [file]
                              };
                              if (navigator.share && navigator.canShare(shareData)) {
                                await navigator.share(shareData);
                              } else {
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);
                                alert('Image downloaded! You can now share it from your device.');
                              }
                            } catch (error) {
                              console.error('Failed to share image:', error);
                              try {
                                const a = document.createElement('a');
                                a.href = imgObj.imageUrl;
                                a.download = `image-${imgObj._id}.jpg`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                alert('Image downloaded! You can now share it from your device.');
                              } catch (downloadError) {
                                console.error('Failed to download image:', downloadError);
                                alert('Failed to share image. Please try downloading it manually.');
                              }
                            }
                          }}
                        />
                      </span>

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
                              <path className="opacity-75" fill="currentColor" d="M4 12a 8 8 0 018-8v8z" />
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-[#283039]">
                <div className="text-[#9cabba] text-sm">
                  Showing {((currentPage - 1) * imagesPerPage) + 1} to {Math.min(currentPage * imagesPerPage, totalImages)} of {totalImages} images
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#283039] text-white hover:bg-[#314c68] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                  </button>
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
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="text-[#9cabba] px-2">...</span>
                    )}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#283039] text-[#9cabba] hover:bg-[#314c68] hover:text-white transition-colors"
                      >
                        {totalPages}
                      </button>
                    )}
                  </div>
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

export default LikedPhotosPage; 