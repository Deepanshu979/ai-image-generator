import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Avatar } from '../components/ui/avatar';
import logo from '../assets/visionary-logo.png';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = Boolean(localStorage.getItem('token'));
  const [activeNav, setActiveNav] = React.useState(location.pathname);
  const [navAnimating, setNavAnimating] = React.useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [username, setUsername] = useState('');
  const dropdownRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch username from backend if authenticated
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.user && data.user.username) {
          setUsername(data.user.username);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchProfile();
  }, [isAuthenticated]);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      localStorage.removeItem('token');
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  const handleNavClick = (path) => {
    setNavAnimating(path);
    setTimeout(() => {
      setActiveNav(path);
      setNavAnimating('');
      navigate(path);
    }, 250); // 250ms animation
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#2c3135] px-4 md:px-10 py-1">
      <div className="flex items-center gap-1 text-white cursor-pointer" onClick={() => navigate('/')}> 
        <div className="w-14 h-14 flex items-center justify-center">
          <img src={logo} alt="Visionary AI Logo" width={56} height={56} style={{ display: 'block' }} />
        </div>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Visionary AI</h2>
      </div>
      {/* Desktop Nav Links */}
      <div className="flex-1 justify-end gap-8 hidden md:flex">
        <div className="flex items-center gap-9">
          <span
            className={`text-white text-sm font-medium leading-normal cursor-pointer transition-all duration-250 ${activeNav === '/' ? 'font-bold' : ''} ${navAnimating === '/' ? 'scale-110 text-blue-400' : ''}`}
            onClick={() => handleNavClick('/')}
          >Home</span>
          <span
            className={`text-white text-sm font-medium leading-normal cursor-pointer transition-all duration-250 ${activeNav === '/features' ? 'font-bold' : ''} ${navAnimating === '/features' ? 'scale-110 text-blue-400' : ''}`}
            onClick={() => handleNavClick('/features')}
          >Features</span>
          <span
            className={`text-white text-sm font-medium leading-normal cursor-pointer transition-all duration-250 ${activeNav === '/pricing' ? 'font-bold' : ''} ${navAnimating === '/pricing' ? 'scale-110 text-blue-400' : ''}`}
            onClick={() => handleNavClick('/pricing')}
          >Pricing</span>
          <span
            className={`text-white text-sm font-medium leading-normal cursor-pointer transition-all duration-250 ${activeNav === '/contact' ? 'font-bold' : ''} ${navAnimating === '/contact' ? 'scale-110 text-blue-400' : ''}`}
            onClick={() => handleNavClick('/contact')}
          >Contact</span>
        </div>
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <div
              className="cursor-pointer"
              onClick={() => setShowDropdown((v) => !v)}
              tabIndex={0}
            >
              <Avatar username={username} size={40} />
            </div>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-[#22272b] rounded-lg shadow-lg z-50 border border-[#2c3135] flex flex-col p-0">
                <button
                  className="block w-full text-left px-4 py-2 text-white hover:bg-[#283039] rounded-t-lg"
                  onMouseDown={() => {
                    setShowDropdown(false);
                    navigate('/profile');
                  }}
                >
                  Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-white hover:bg-[#283039]"
                  onMouseDown={() => {
                    setShowDropdown(false);
                    navigate('/liked');
                  }}
                >
                  Liked Photos
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-white hover:bg-[#283039] rounded-b-lg"
                  onMouseDown={handleAuthAction}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <div
              className="cursor-pointer"
              onClick={() => setShowDropdown((v) => !v)}
              tabIndex={0}
            >
              <Avatar username={null} size={40} />
            </div>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-[#22272b] rounded-lg shadow-lg z-50 border border-[#2c3135] flex flex-col p-0">
                <button
                  className="block w-full text-left px-4 py-2 text-white hover:bg-[#283039] rounded-t-lg"
                  onMouseDown={() => {
                    setShowDropdown(false);
                    navigate('/profile');
                  }}
                >
                  Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-white hover:bg-[#283039] rounded-b-lg"
                  onMouseDown={() => {
                    setShowDropdown(false);
                    navigate('/login');
                  }}
                >
                  Log in
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Mobile Hamburger */}
      <button
        className="md:hidden text-white p-2 focus:outline-none"
        onClick={() => setMobileMenuOpen((v) => !v)}
        aria-label="Open menu"
      >
        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex flex-col items-end md:hidden">
          <div className="w-64 bg-[#181f2a] h-full shadow-lg p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <span className="text-white text-lg font-semibold cursor-pointer" onClick={() => handleNavClick('/')}>Home</span>
              <span className="text-white text-lg font-semibold cursor-pointer" onClick={() => handleNavClick('/features')}>Features</span>
              <span className="text-white text-lg font-semibold cursor-pointer" onClick={() => handleNavClick('/pricing')}>Pricing</span>
              <span className="text-white text-lg font-semibold cursor-pointer" onClick={() => handleNavClick('/contact')}>Contact</span>
            </div>
            <div className="border-t border-[#2c3135] pt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    className="w-full text-left px-4 py-2 text-white hover:bg-[#283039] rounded-lg"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/profile');
                    }}
                  >
                    Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-white hover:bg-[#283039] rounded-lg"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleAuthAction();
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="w-full text-left px-4 py-2 text-white hover:bg-[#283039] rounded-lg"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/profile');
                    }}
                  >
                    Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-white hover:bg-[#283039] rounded-lg"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    Log in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar; 