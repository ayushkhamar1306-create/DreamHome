'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { 
  Loader2, AlertCircle, CheckCircle, Clock, XCircle, 
  Search, Filter, Eye, Download, FileCheck, MapPin,
  Home, User, Mail, Phone, Calendar, DollarSign, Maximize2,
  Users, ShoppingCart, Store, MessageSquare, LogOut, BarChart3,
  TrendingUp, Activity, Briefcase, FileText, Shield
} from 'lucide-react';
import { Lock } from 'lucide-react';

interface Property {
  _id: string;
  propertyType: string;
  bhk: string;
  sqft: number;
  city: string;
  address: string;
  facilities: string[];
  propertyFor: string;
  price: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  propertyImages: string[];
  propertyProof: string;
  charges: number;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  createdAt: string;
}

interface Inquiry {
  _id: string;
  property: {
    _id: string;
    propertyType: string;
    bhk: string;
    city: string;
    price: number;
    propertyImages: string[];
  };
  buyer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  fullName: string;
  email: string;
  phone: string;
  profession: string;
  identityProof: string;
  status: 'pending' | 'accepted' | 'declined';
  declineReason?: string;
  sellerPhone?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  totalAdmins: number;
  totalProperties: number;
  pendingProperties: number;
  approvedProperties: number;
  rejectedProperties: number;
  totalInquiries: number;
  pendingInquiries: number;
  acceptedInquiries: number;
  declinedInquiries: number;
}

type ViewMode = 'properties' | 'buyers' | 'sellers' | 'inquiries';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [buyers, setBuyers] = useState<UserData[]>([]);
  const [filteredBuyers, setFilteredBuyers] = useState<UserData[]>([]);
  const [sellers, setSellers] = useState<UserData[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<UserData[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('properties');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      const response = await api.get('/admin/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setIsAuthenticated(true);
        loadDashboardData();
      } else {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await api.post('/admin/login', {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        setIsAuthenticated(true);
        loadDashboardData();
      } else {
        setLoginError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      setEmail('');
      setPassword('');
      setProperties([]);
      setBuyers([]);
      setSellers([]);
      setInquiries([]);
      setStats(null);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const [propertiesRes, statsRes, usersRes, inquiriesRes] = await Promise.all([
        api.get('/admin/properties', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/admin/statistics', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get('/admin/inquiries', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (propertiesRes.data.success) {
        setProperties(propertiesRes.data.properties);
        setFilteredProperties(propertiesRes.data.properties);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (usersRes.data.success) {
        const allUsers = usersRes.data.users;
        const buyersList = allUsers.filter((u: UserData) => u.role === 'buyer');
        const sellersList = allUsers.filter((u: UserData) => u.role === 'seller');
        setBuyers(buyersList);
        setFilteredBuyers(buyersList);
        setSellers(sellersList);
        setFilteredSellers(sellersList);
      }

      if (inquiriesRes.data.success) {
        setInquiries(inquiriesRes.data.inquiries);
        setFilteredInquiries(inquiriesRes.data.inquiries);
      }
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters for properties
  useEffect(() => {
    let filtered = properties;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.ownerName.toLowerCase().includes(query) ||
        p.ownerEmail.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.propertyType.toLowerCase().includes(query) ||
        p.bhk.toLowerCase().includes(query)
      );
    }

    setFilteredProperties(filtered);
  }, [statusFilter, searchQuery, properties]);

  // Apply filters for buyers
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = buyers.filter(b => 
        b.name.toLowerCase().includes(query) ||
        b.email.toLowerCase().includes(query) ||
        b.phone.includes(query)
      );
      setFilteredBuyers(filtered);
    } else {
      setFilteredBuyers(buyers);
    }
  }, [searchQuery, buyers]);

  // Apply filters for sellers
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = sellers.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.phone.includes(query)
      );
      setFilteredSellers(filtered);
    } else {
      setFilteredSellers(sellers);
    }
  }, [searchQuery, sellers]);

  // Apply filters for inquiries
  useEffect(() => {
    let filtered = inquiries;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i => 
        i.fullName.toLowerCase().includes(query) ||
        i.email.toLowerCase().includes(query) ||
        i.buyer.name.toLowerCase().includes(query) ||
        i.seller.name.toLowerCase().includes(query) ||
        i.property.city.toLowerCase().includes(query)
      );
    }

    setFilteredInquiries(filtered);
  }, [statusFilter, searchQuery, inquiries]);

  // Reset filters when changing view mode
  useEffect(() => {
    setStatusFilter('all');
    setSearchQuery('');
  }, [viewMode]);

  const handleApprove = async (property: Property) => {
    if (!window.confirm(`Approve property for ${property.ownerName}?`)) return;

    setProcessingId(property._id);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.put(`/admin/properties/${property._id}`, 
        { status: 'approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await loadDashboardData();
        setIsModalOpen(false);
        alert('Property approved successfully!');
      }
    } catch (err: any) {
      console.error('Error approving property:', err);
      alert(err.response?.data?.message || 'Failed to approve property');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (property: Property) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason || !reason.trim()) {
      alert('Rejection reason is required');
      return;
    }

    setProcessingId(property._id);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.put(`/admin/properties/${property._id}`,
        { status: 'rejected', rejectionReason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await loadDashboardData();
        setIsModalOpen(false);
        alert('Property rejected successfully');
      }
    } catch (err: any) {
      console.error('Error rejecting property:', err);
      alert(err.response?.data?.message || 'Failed to reject property');
    } finally {
      setProcessingId(null);
    }
  };

  const openPropertyModal = (property: Property) => {
    setSelectedProperty(property);
    setSelectedUser(null);
    setSelectedInquiry(null);
    setIsModalOpen(true);
  };

  const openUserModal = (user: UserData) => {
    setSelectedUser(user);
    setSelectedProperty(null);
    setSelectedInquiry(null);
    setIsModalOpen(true);
  };

  const openInquiryModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setSelectedProperty(null);
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            {status === 'approved' ? 'Approved' : 'Accepted'}
          </span>
        );
      case 'rejected':
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            {status === 'rejected' ? 'Rejected' : 'Declined'}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  // Loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 border border-neutral-200 dark:border-neutral-800">
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Admin Login
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Sign in to access the admin dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{loginError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold hover:from-blue-700 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const propertyStats = {
    total: properties.length,
    pending: properties.filter(p => p.status === 'pending').length,
    approved: properties.filter(p => p.status === 'approved').length,
    rejected: properties.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header with Logout */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Comprehensive platform management</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Overall Statistics */}
        {stats && (
          <>
            <h2 className="text-xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">Platform Statistics</h2>
            
            {/* User Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Users</span>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</div>
              </div>

              <div 
                className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setViewMode('buyers')}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Buyers</span>
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalBuyers}</div>
                <p className="text-xs text-neutral-500 mt-1">Click to view all</p>
              </div>

              <div 
                className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setViewMode('sellers')}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Sellers</span>
                  <Store className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalSellers}</div>
                <p className="text-xs text-neutral-500 mt-1">Click to view all</p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Admins</span>
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalAdmins}</div>
              </div>
            </div>

            {/* Inquiry Stats */}
            <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">Inquiries Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div 
                className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-200 dark:border-violet-800/30 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setViewMode('inquiries')}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-violet-700 dark:text-violet-400">Total Inquiries</span>
                  <MessageSquare className="w-5 h-5 text-violet-600" />
                </div>
                <div className="text-3xl font-bold text-violet-900 dark:text-violet-100">{stats.totalInquiries}</div>
                <p className="text-xs text-violet-600 mt-1">Click to view all</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Pending</span>
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">{stats.pendingInquiries}</div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Accepted</span>
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats.acceptedInquiries}</div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20 border border-rose-200 dark:border-rose-800/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-rose-700 dark:text-rose-400">Declined</span>
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div className="text-3xl font-bold text-rose-900 dark:text-rose-100">{stats.declinedInquiries}</div>
              </div>
            </div>
          </>
        )}

        {/* View Mode Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setViewMode('properties')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'properties'
                ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg'
                : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-blue-300'
            }`}
          >
            <Home className="w-4 h-4 inline mr-2" />
            Properties ({properties.length})
          </button>
          
          <button
            onClick={() => setViewMode('buyers')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'buyers'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-green-300'
            }`}
          >
            <ShoppingCart className="w-4 h-4 inline mr-2" />
            Buyers ({buyers.length})
          </button>
          
          <button
            onClick={() => setViewMode('sellers')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'sellers'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-purple-300'
            }`}
          >
            <Store className="w-4 h-4 inline mr-2" />
            Sellers ({sellers.length})
          </button>
          
          <button
            onClick={() => setViewMode('inquiries')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'inquiries'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-violet-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Inquiries ({inquiries.length})
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder={
                  viewMode === 'properties' ? "Search by owner, email, city, or property type..." :
                  viewMode === 'buyers' || viewMode === 'sellers' ? "Search by name, email, or phone..." :
                  "Search by name, email, buyer, seller, or city..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter (for properties and inquiries) */}
            {(viewMode === 'properties' || viewMode === 'inquiries') && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer min-w-[160px]"
                >
                  <option value="all">All Status</option>
                  {viewMode === 'properties' ? (
                    <>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </>
                  ) : (
                    <>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="declined">Declined</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            Showing <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {viewMode === 'properties' ? filteredProperties.length :
               viewMode === 'buyers' ? filteredBuyers.length :
               viewMode === 'sellers' ? filteredSellers.length :
               filteredInquiries.length}
            </span> of {
              viewMode === 'properties' ? properties.length :
              viewMode === 'buyers' ? buyers.length :
              viewMode === 'sellers' ? sellers.length :
              inquiries.length
            } {viewMode}
          </div>
        </div>

        {/* Properties View */}
        {viewMode === 'properties' && (
          filteredProperties.length > 0 ? (
            <div className="space-y-4">
              {filteredProperties.map((property) => (
                <div
                  key={property._id}
                  className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Property Image */}
                    <div className="w-full lg:w-48 h-48 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                      {property.propertyImages && property.propertyImages.length > 0 ? (
                        <img
                          src={property.propertyImages[0]}
                          alt={property.propertyType}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
                        </div>
                      )}
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 space-y-4">
                      
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 capitalize mb-1">
                            {property.bhk} {property.propertyType}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <MapPin className="w-4 h-4" />
                            <span>{property.city}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ₹{property.price.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-neutral-500 capitalize">For {property.propertyFor}</div>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="text-sm">
                          <div className="text-neutral-500 dark:text-neutral-400">Owner</div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">{property.ownerName}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 dark:text-neutral-400">Area</div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">{property.sqft} sq.ft</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 dark:text-neutral-400">Charges</div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">₹{property.charges}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 dark:text-neutral-400">Submitted</div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {new Date(property.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(property.status)}
                          {property.status === 'rejected' && property.rejectionReason && (
                            <span className="text-xs text-rose-600 dark:text-rose-400 italic">
                              "{property.rejectionReason}"
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openPropertyModal(property)}
                            className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>

                          {property.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(property)}
                                disabled={processingId === property._id}
                                className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === property._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Approve
                              </button>

                              <button
                                onClick={() => handleReject(property)}
                                disabled={processingId === property._id}
                                className="px-4 py-2 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === property._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700">
              <AlertCircle className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">No properties found</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                Try adjusting your filters or search query
              </p>
            </div>
          )
        )}

        {/* Buyers View */}
        {viewMode === 'buyers' && (
          filteredBuyers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBuyers.map((buyer) => (
                <div
                  key={buyer._id}
                  className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                        {buyer.name}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 font-medium">
                        Buyer
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-700 dark:text-neutral-300">{buyer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-700 dark:text-neutral-300">{buyer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-700 dark:text-neutral-300">
                        Joined {new Date(buyer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openUserModal(buyer)}
                    className="w-full mt-4 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700">
              <AlertCircle className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">No buyers found</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                Try adjusting your search query
              </p>
            </div>
          )
        )}

        {/* Sellers View */}
        {viewMode === 'sellers' && (
          filteredSellers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSellers.map((seller) => (
                <div
                  key={seller._id}
                  className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                        {seller.name}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 font-medium">
                        Seller
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-700 dark:text-neutral-300">{seller.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-700 dark:text-neutral-300">{seller.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-700 dark:text-neutral-300">
                        Joined {new Date(seller.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openUserModal(seller)}
                    className="w-full mt-4 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700">
              <AlertCircle className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">No sellers found</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                Try adjusting your search query
              </p>
            </div>
          )
        )}

        {/* Inquiries View */}
        {viewMode === 'inquiries' && (
          filteredInquiries.length > 0 ? (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry) => (
                <div
                  key={inquiry._id}
                  className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Property Thumbnail */}
                    <div className="w-full lg:w-32 h-32 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                      {inquiry.property.propertyImages && inquiry.property.propertyImages.length > 0 ? (
                        <img
                          src={inquiry.property.propertyImages[0]}
                          alt={inquiry.property.propertyType}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-neutral-300 dark:text-neutral-700" />
                        </div>
                      )}
                    </div>

                    {/* Inquiry Details */}
                    <div className="flex-1 space-y-4">
                      
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                            {inquiry.fullName}
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Inquiring about {inquiry.property.bhk} {inquiry.property.propertyType} in {inquiry.property.city}
                          </p>
                        </div>
                        {getStatusBadge(inquiry.status)}
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Buyer</div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">{inquiry.buyer.name}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">{inquiry.buyer.email}</div>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Seller</div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">{inquiry.seller.name}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">{inquiry.seller.email}</div>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Profession</div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">{inquiry.profession}</div>
                        </div>
                      </div>

                      {/* Contact & Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-neutral-500" />
                            <span className="text-neutral-700 dark:text-neutral-300">{inquiry.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-neutral-500" />
                            <span className="text-neutral-700 dark:text-neutral-300">
                              {new Date(inquiry.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => openInquiryModal(inquiry)}
                          className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Full Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700">
              <AlertCircle className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">No inquiries found</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                Try adjusting your filters or search query
              </p>
            </div>
          )
        )}
      </div>

      {/* Modals */}
      {isModalOpen && selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={() => setIsModalOpen(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          processing={processingId === selectedProperty._id}
        />
      )}

      {isModalOpen && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isModalOpen && selectedInquiry && (
        <InquiryDetailsModal
          inquiry={selectedInquiry}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

// Property Details Modal
function PropertyDetailsModal({ 
  property, 
  onClose, 
  onApprove, 
  onReject,
  processing 
}: { 
  property: Property; 
  onClose: () => void;
  onApprove: (property: Property) => void;
  onReject: (property: Property) => void;
  processing: boolean;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = property.propertyImages || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Property Details</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <XCircle className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="relative h-80 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={images[currentImageIndex]}
                  alt={`Property image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-blue-500 ring-2 ring-blue-500/30'
                        : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-300'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Property Type</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">{property.propertyType}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">BHK</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">{property.bhk}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Area</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">{property.sqft} sq.ft</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Price</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">₹{property.price.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">City</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">{property.city}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Listing Type</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">{property.propertyFor}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Full Address</div>
            <div className="text-neutral-900 dark:text-neutral-100">{property.address}</div>
          </div>

          {property.facilities && property.facilities.length > 0 && (
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">Amenities</div>
              <div className="flex flex-wrap gap-2">
                {property.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
            <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">Owner Information</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-neutral-700 dark:text-neutral-300">{property.ownerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-neutral-700 dark:text-neutral-300">{property.ownerEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-neutral-700 dark:text-neutral-300">{property.ownerPhone}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Charges</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">₹{property.charges}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Payment Method</div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 uppercase">{property.paymentMethod}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {property.propertyProof && (
              <a
                href={property.propertyProof}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-800 dark:bg-neutral-700 text-white font-medium hover:bg-neutral-900 dark:hover:bg-neutral-600 transition-colors"
              >
                <FileCheck className="w-4 h-4" />
                View Property Proof
              </a>
            )}
            {property.receiptUrl && (
              <a
                href={property.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </a>
            )}
          </div>

          {property.status === 'rejected' && property.rejectionReason && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30">
              <div className="text-sm font-semibold text-rose-900 dark:text-rose-100 mb-2">Rejection Reason</div>
              <div className="text-sm text-rose-700 dark:text-rose-300">{property.rejectionReason}</div>
            </div>
          )}

          {property.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => onApprove(property)}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                Approve Property
              </button>
              <button
                onClick={() => onReject(property)}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                Reject Property
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// User Details Modal
function UserDetailsModal({ 
  user, 
  onClose 
}: { 
  user: UserData; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-2xl w-full">
        
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">User Details</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <XCircle className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              user.role === 'buyer' 
                ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                : 'bg-gradient-to-br from-purple-500 to-pink-500'
            }`}>
              {user.role === 'buyer' ? (
                <ShoppingCart className="w-10 h-10 text-white" />
              ) : (
                <Store className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{user.name}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                user.role === 'buyer'
                  ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
              }`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">User ID</div>
              <div className="font-mono text-sm text-neutral-900 dark:text-neutral-100">{user._id}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Email</div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-900 dark:text-neutral-100">{user.email}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Phone</div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-900 dark:text-neutral-100">{user.phone}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Registration Date</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-900 dark:text-neutral-100">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inquiry Details Modal
function InquiryDetailsModal({ 
  inquiry, 
  onClose 
}: { 
  inquiry: Inquiry; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Inquiry Details</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <XCircle className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                Inquiry from {inquiry.fullName}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Submitted on {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {inquiry.status === 'accepted' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Accepted
                </span>
              )}
              {inquiry.status === 'declined' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                  <XCircle className="w-3.5 h-3.5" />
                  Declined
                </span>
              )}
              {inquiry.status === 'pending' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  Pending
                </span>
              )}
            </div>
          </div>

          {/* Property Information */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
            <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">Property Details</div>
            <div className="flex gap-4">
              {inquiry.property.propertyImages && inquiry.property.propertyImages.length > 0 && (
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                  <img
                    src={inquiry.property.propertyImages[0]}
                    alt={inquiry.property.propertyType}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {inquiry.property.bhk} {inquiry.property.propertyType}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {inquiry.property.city}
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ₹{inquiry.property.price.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30">
            <div className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">Buyer Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-green-700 dark:text-green-400 mb-1">Name</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{inquiry.buyer.name}</div>
              </div>
              <div>
                <div className="text-xs text-green-700 dark:text-green-400 mb-1">User ID</div>
                <div className="font-mono text-xs text-neutral-900 dark:text-neutral-100">{inquiry.buyer._id}</div>
              </div>
              <div>
                <div className="text-xs text-green-700 dark:text-green-400 mb-1">Email</div>
                <div className="text-sm text-neutral-900 dark:text-neutral-100">{inquiry.buyer.email}</div>
              </div>
              <div>
                <div className="text-xs text-green-700 dark:text-green-400 mb-1">Phone</div>
                <div className="text-sm text-neutral-900 dark:text-neutral-100">{inquiry.buyer.phone}</div>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/30">
            <div className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3">Seller Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-purple-700 dark:text-purple-400 mb-1">Name</div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">{inquiry.seller.name}</div>
              </div>
              <div>
                <div className="text-xs text-purple-700 dark:text-purple-400 mb-1">User ID</div>
                <div className="font-mono text-xs text-neutral-900 dark:text-neutral-100">{inquiry.seller._id}</div>
              </div>
              <div>
                <div className="text-xs text-purple-700 dark:text-purple-400 mb-1">Email</div>
                <div className="text-sm text-neutral-900 dark:text-neutral-100">{inquiry.seller.email}</div>
              </div>
              <div>
                <div className="text-xs text-purple-700 dark:text-purple-400 mb-1">Phone</div>
                <div className="text-sm text-neutral-900 dark:text-neutral-100">{inquiry.seller.phone}</div>
              </div>
            </div>
          </div>

          {/* Inquiry Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Contact Email</div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">{inquiry.email}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Contact Phone</div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">{inquiry.phone}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Profession</div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">{inquiry.profession}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Inquiry ID</div>
              <div className="font-mono text-xs text-neutral-900 dark:text-neutral-100">{inquiry._id}</div>
            </div>
          </div>

          {/* Identity Proof */}
          {inquiry.identityProof && (
            <a
              href={inquiry.identityProof}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-800 dark:bg-neutral-700 text-white font-medium hover:bg-neutral-900 dark:hover:bg-neutral-600 transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              View Identity Proof
            </a>
          )}

          {/* Decline Reason */}
          {inquiry.status === 'declined' && inquiry.declineReason && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30">
              <div className="text-sm font-semibold text-rose-900 dark:text-rose-100 mb-2">Decline Reason</div>
              <div className="text-sm text-rose-700 dark:text-rose-300">{inquiry.declineReason}</div>
            </div>
          )}

          {/* Seller Contact (if accepted) */}
          {inquiry.status === 'accepted' && inquiry.sellerPhone && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
              <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Seller Contact Shared</div>
              <div className="text-sm text-emerald-700 dark:text-emerald-300">
                Seller's phone: {inquiry.sellerPhone}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}