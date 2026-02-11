'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, Home, FileText, Settings, User, ChevronRight, Building2, MessageSquare, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

type User = {
  name: string;
  role: string;
};

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

    try {
      const parsed = JSON.parse(storedUser);

      // Validate shape before setting state
      if (parsed?.name && parsed?.role) {
        setUser(parsed);
      } else {
        localStorage.removeItem('user');
      }
    } catch (error) {
      localStorage.removeItem('user');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.mobile-menu') && !target.closest('.mobile-toggle')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-16 items-center justify-between rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-lg shadow-lg px-4 sm:px-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-lg bg-[#b04439] flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <span className="text-xl font-bold">D</span>
            </div>
            <span className="hidden sm:block text-xl font-bold text-gray-900 group-hover:text-[#b04439] transition-colors">
              DreamHome
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#b04439] hover:bg-gray-50 transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              <span>Browse</span>
            </Link>

            {user?.role === "buyer" && (
              <Link 
                href="/requested-properties" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#b04439] hover:bg-gray-50 transition-all duration-200"
              >
                <FileText className="w-4 h-4" />
                <span>My Requests</span>
              </Link>
            )}

            {user?.role === "seller" && (
              <>
                <Link 
                  href="/submit-property" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#b04439] hover:bg-gray-50 transition-all duration-200"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Submit Property</span>
                </Link>
                <Link 
                  href="/manage-inquiries" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#b04439] hover:bg-gray-50 transition-all duration-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Inquiries</span>
                </Link>
                <Link 
                  href="/my-properties" 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#b04439] hover:bg-gray-50 transition-all duration-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>My Properties</span>
                </Link>
              </>
            )}

            {user?.role === "admin" && (
              <Link 
                href="/admin" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[#b04439] hover:bg-gray-50 transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <Link href="/auth/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-700 hover:text-[#b04439] hover:bg-gray-50"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button 
                    size="sm"
                    className="bg-[#b04439] hover:bg-[#8d362e] text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Sign up
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                  title="View Profile"
                >
                  <div className="w-9 h-9 rounded-full bg-[#b04439] text-white flex items-center justify-center font-semibold text-sm shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</div>
                    <div className="text-xs text-gray-500 capitalize leading-tight">{user.role}</div>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-[#b04439] hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden mobile-toggle p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5 text-gray-900" /> : <Menu className="w-5 h-5 text-gray-900" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mobile-menu mt-4 bg-white rounded-2xl border border-gray-200 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-4 space-y-1">
              
              {/* User Profile Section - Mobile */}
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 mb-3 group hover:border-[#b04439]/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-[#b04439] text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:shadow-lg transition-all">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#b04439] transition-colors" />
                </Link>
              )}

              {/* Navigation Links */}
              <Link 
                href="/" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#b04439] transition-all"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Browse Properties</span>
              </Link>

              {user?.role === "buyer" && (
                <Link 
                  href="/requested-properties" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#b04439] transition-all"
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">My Requests</span>
                </Link>
              )}

              {user?.role === "seller" && (
                <>
                  <Link 
                    href="/submit-property" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#b04439] transition-all"
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="font-medium">Submit Property</span>
                  </Link>
                  <Link 
                    href="/manage-inquiries" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#b04439] transition-all"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">Manage Inquiries</span>
                  </Link>
                  <Link 
                    href="/my-properties" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#b04439] transition-all"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">My Properties</span>
                  </Link>
                </>
              )}

              {user?.role === "admin" && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#b04439] transition-all"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Admin Panel</span>
                </Link>
              )}

              {/* Auth Section - Mobile */}
              <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
                {!user ? (
                  <>
                    <Link 
                      href="/auth/login" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center px-4 py-3 rounded-lg bg-[#b04439] text-white font-medium hover:bg-[#8d362e] shadow-md hover:shadow-lg transition-all"
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-[#b04439] hover:bg-red-50 font-medium transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}