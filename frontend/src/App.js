import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  BookOpen, Upload, Download, Users, BarChart3, LogOut, Menu, X, 
  ChevronRight, Search, Filter, FileText, Video, File, Archive,
  CheckCircle, Clock, XCircle, Plus, Eye, Edit, Trash2, 
  Calendar, MapPin, UserCheck, TrendingUp, Award, Shield,
  Home, Settings, Bell, ChevronDown, Globe, Layers
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '/api';

// Auth Context
const AuthContext = createContext(null);

const useAuth = () => useContext(AuthContext);

// API Helper
const api = {
  token: localStorage.getItem('token'),
  
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
  
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
  },
  
  async uploadFile(endpoint, formData) {
    const headers = {
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }
    
    return response.json();
  }
};

// Components
const Navbar = ({ user, onLogout, onMenuClick }) => (
  <nav className="bg-white shadow-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center space-x-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-ms-blue to-levelup-green rounded-lg flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <span className="text-xl font-bold text-levelup-dark">Skilling in a Box</span>
              <span className="text-xs text-gray-500 block">Powered by LevelUp</span>
            </div>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Welcome,</span>
              <span className="font-semibold text-levelup-dark">{user.full_name}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                user.role === 'content_admin' ? 'bg-blue-100 text-blue-700' :
                user.role === 'ms_stakeholder' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
            <button onClick={onLogout} className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors">
              <LogOut size={20} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  </nav>
);

const Sidebar = ({ user, activeView, setActiveView, isOpen, onClose }) => {
  const menuItems = {
    training_partner: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'courses', label: 'Browse Courses', icon: BookOpen },
      { id: 'my-access', label: 'My Access Requests', icon: Shield },
      { id: 'my-executions', label: 'My Executions', icon: Calendar },
    ],
    content_admin: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'courses', label: 'Browse Courses', icon: BookOpen },
      { id: 'manage-courses', label: 'Manage Courses', icon: Layers },
      { id: 'upload', label: 'Upload Content', icon: Upload },
    ],
    ms_stakeholder: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'courses', label: 'Browse Courses', icon: BookOpen },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'access-requests', label: 'Access Requests', icon: Shield },
      { id: 'executions', label: 'All Executions', icon: Calendar },
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'courses', label: 'Browse Courses', icon: BookOpen },
      { id: 'manage-courses', label: 'Manage Courses', icon: Layers },
      { id: 'upload', label: 'Upload Content', icon: Upload },
      { id: 'users', label: 'User Management', icon: Users },
      { id: 'access-requests', label: 'Access Requests', icon: Shield },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'executions', label: 'All Executions', icon: Calendar },
    ]
  };

  const items = menuItems[user?.role] || menuItems.training_partner;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:transform-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b lg:hidden">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 float-right">
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); onClose(); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeView === item.id 
                    ? 'bg-ms-blue text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '', password: '', full_name: '', organization: '', role: 'training_partner'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;
      
      const response = await api.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      api.setToken(response.access_token);
      onLogin(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-ms-blue to-levelup-green rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-levelup-dark">Skilling in a Box</h1>
          <p className="text-gray-500 mt-2">Course Content Repository</p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md font-medium transition-all ${
              isLogin ? 'bg-white shadow text-ms-blue' : 'text-gray-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md font-medium transition-all ${
              !isLogin ? 'bg-white shadow text-ms-blue' : 'text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="your@email.com"
              data-testid="email-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="input-field"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              data-testid="password-input"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="John Doe"
                  data-testid="fullname-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.organization}
                  onChange={(e) => setFormData({...formData, organization: e.target.value})}
                  placeholder="Your Company"
                  data-testid="organization-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="input-field"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  data-testid="role-select"
                >
                  <option value="training_partner">Training Partner</option>
                  <option value="content_admin">Content Admin</option>
                  <option value="ms_stakeholder">Microsoft Stakeholder</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="submit-button"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sponsored by Microsoft
        </p>
      </div>
    </div>
  );
};

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (['admin', 'ms_stakeholder'].includes(user.role)) {
          const data = await api.request('/analytics/overview');
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.role]);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl shadow-md p-6 card-hover">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
        <Icon className="text-white" size={24} />
      </div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-3xl font-bold text-levelup-dark mt-1">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-levelup-dark">Welcome back, {user.full_name}!</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your training content.</p>
      </div>

      {['admin', 'ms_stakeholder'].includes(user.role) && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={BookOpen} label="Total Courses" value={stats.total_courses} color="bg-ms-blue" />
          <StatCard icon={Users} label="Training Partners" value={stats.total_partners} color="bg-levelup-green" />
          <StatCard icon={Download} label="Total Downloads" value={stats.total_downloads} color="bg-purple-500" />
          <StatCard icon={Calendar} label="Executions" value={stats.total_executions} color="bg-orange-500" />
          <StatCard icon={UserCheck} label="Trained Learners" value={stats.total_trained_learners} color="bg-pink-500" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-levelup-dark mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {user.role === 'training_partner' && (
              <>
                <QuickActionButton icon={BookOpen} label="Browse Available Courses" />
                <QuickActionButton icon={Calendar} label="Schedule a Course Execution" />
                <QuickActionButton icon={UserCheck} label="Submit Attendance Data" />
              </>
            )}
            {['admin', 'content_admin'].includes(user.role) && (
              <>
                <QuickActionButton icon={Upload} label="Upload New Course Content" />
                <QuickActionButton icon={Layers} label="Manage Existing Courses" />
                <QuickActionButton icon={Shield} label="Review Access Requests" />
              </>
            )}
            {user.role === 'ms_stakeholder' && (
              <>
                <QuickActionButton icon={BarChart3} label="View Analytics Dashboard" />
                <QuickActionButton icon={Shield} label="Approve Access Requests" />
                <QuickActionButton icon={TrendingUp} label="Download Reports" />
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-levelup-dark mb-4">Content Categories</h2>
          <div className="space-y-4">
            <CategoryCard 
              title="GPS Solution Areas" 
              description="Technical and sales content organized by Microsoft solution areas"
              icon={Globe}
              color="bg-ms-blue"
            />
            <CategoryCard 
              title="Event-based Content" 
              description="Content packages for AI Tour, Hackathons, and special events"
              icon={Calendar}
              color="bg-levelup-green"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickActionButton = ({ icon: Icon, label }) => (
  <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left">
    <Icon className="text-ms-blue" size={20} />
    <span className="text-gray-700">{label}</span>
    <ChevronRight className="ml-auto text-gray-400" size={16} />
  </button>
);

const CategoryCard = ({ title, description, icon: Icon, color }) => (
  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon className="text-white" size={20} />
    </div>
    <div>
      <h3 className="font-semibold text-levelup-dark">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  </div>
);

const CourseBrowser = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '', solution_area: '', level: '', course_type: '', search: ''
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [accessRequests, setAccessRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, metaData] = await Promise.all([
          api.request('/courses'),
          api.request('/metadata')
        ]);
        setCourses(coursesData.courses);
        setMetadata(metaData);
        
        if (user.role === 'training_partner') {
          const requests = await api.request('/access-requests');
          setAccessRequests(requests);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const data = await api.request(`/courses?${params}`);
      setCourses(data.courses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const hasAccess = (courseId) => {
    if (['admin', 'content_admin', 'ms_stakeholder'].includes(user.role)) return true;
    return accessRequests.some(r => r.course_id === courseId && r.status === 'approved');
  };

  const hasPendingRequest = (courseId) => {
    return accessRequests.some(r => r.course_id === courseId && r.status === 'pending');
  };

  const FilterDropdown = ({ label, options, value, onChange }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-ms-blue focus:border-transparent"
      >
        <option value="">{label}</option>
        {options?.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-levelup-dark">Course Content Library</h1>
        <p className="text-gray-500 mt-1">Browse and access training materials</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ms-blue focus:border-transparent"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              data-testid="search-input"
            />
          </div>
          <FilterDropdown 
            label="Category" 
            options={metadata?.content_categories} 
            value={filters.category}
            onChange={(v) => setFilters({...filters, category: v})}
          />
          <FilterDropdown 
            label="Solution Area" 
            options={metadata?.solution_areas} 
            value={filters.solution_area}
            onChange={(v) => setFilters({...filters, solution_area: v})}
          />
          <FilterDropdown 
            label="Level" 
            options={metadata?.levels} 
            value={filters.level}
            onChange={(v) => setFilters({...filters, level: v})}
          />
          <FilterDropdown 
            label="Course Type" 
            options={metadata?.course_types} 
            value={filters.course_type}
            onChange={(v) => setFilters({...filters, course_type: v})}
          />
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-ms-blue border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              hasAccess={hasAccess(course.id)}
              hasPending={hasPendingRequest(course.id)}
              onView={() => setSelectedCourse(course)}
              userRole={user.role}
            />
          ))}
        </div>
      )}

      {selectedCourse && (
        <CourseDetailModal 
          course={selectedCourse} 
          onClose={() => setSelectedCourse(null)}
          hasAccess={hasAccess(selectedCourse.id)}
          hasPending={hasPendingRequest(selectedCourse.id)}
          user={user}
          onAccessRequested={(req) => setAccessRequests([...accessRequests, req])}
        />
      )}
    </div>
  );
};

const CourseCard = ({ course, hasAccess, hasPending, onView, userRole }) => {
  const levelColors = {
    'Beginner': 'bg-green-100 text-green-700',
    'Intermediate': 'bg-yellow-100 text-yellow-700',
    'Advanced': 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover" data-testid={`course-card-${course.id}`}>
      <div className="h-2 bg-gradient-to-r from-ms-blue to-levelup-green"></div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelColors[course.level] || 'bg-gray-100 text-gray-700'}`}>
            {course.level}
          </span>
          {hasAccess && <CheckCircle className="text-green-500" size={20} />}
          {hasPending && <Clock className="text-yellow-500" size={20} />}
        </div>
        
        <h3 className="font-semibold text-levelup-dark mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{course.solution_area}</span>
          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">{course.course_type}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center"><Clock size={14} className="mr-1" />{course.duration}</span>
          <span className="flex items-center"><FileText size={14} className="mr-1" />{course.files?.length || 0} files</span>
        </div>
        
        <button 
          onClick={onView}
          className="w-full btn-primary text-sm py-2"
          data-testid={`view-course-${course.id}`}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const CourseDetailModal = ({ course, onClose, hasAccess, hasPending, user, onAccessRequested }) => {
  const [reason, setReason] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const requestAccess = async () => {
    if (!reason.trim()) return;
    setRequesting(true);
    try {
      const result = await api.request('/access-requests', {
        method: 'POST',
        body: JSON.stringify({ course_id: course.id, reason })
      });
      onAccessRequested({ ...result, course_id: course.id, status: 'pending' });
      alert('Access request submitted successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setRequesting(false);
    }
  };

  const downloadFile = async (fileId, fileName) => {
    setDownloading(fileId);
    try {
      const result = await api.request(`/courses/${course.id}/files/${fileId}/download`);
      window.open(result.download_url, '_blank');
    } catch (err) {
      alert(err.message);
    } finally {
      setDownloading(null);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('Video')) return Video;
    if (fileType.includes('ZIP')) return Archive;
    return FileText;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-ms-blue to-levelup-green"></div>
        
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-levelup-dark">{course.title}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{course.solution_area}</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">{course.course_type}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">{course.level}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <InfoItem label="Duration" value={course.duration} />
            <InfoItem label="Language" value={course.language} />
            <InfoItem label="Target Role" value={course.target_role} />
            <InfoItem label="Target Audience" value={course.target_audience} />
            <InfoItem label="Hands-on Lab" value={course.hands_on_lab ? 'Yes' : 'No'} />
            <InfoItem label="Certification" value={course.certification_course ? 'Yes' : 'No'} />
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-levelup-dark mb-2">Description</h3>
            <p className="text-gray-600">{course.description}</p>
          </div>

          {/* Files Section */}
          <div className="mb-6">
            <h3 className="font-semibold text-levelup-dark mb-3">Course Files ({course.files?.length || 0})</h3>
            {course.files?.length > 0 ? (
              <div className="space-y-2">
                {course.files.map(file => {
                  const FileIcon = getFileIcon(file.file_type);
                  return (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileIcon className="text-ms-blue" size={20} />
                        <div>
                          <p className="font-medium text-sm">{file.original_name}</p>
                          <p className="text-xs text-gray-500">{file.file_type}</p>
                        </div>
                      </div>
                      {hasAccess && (
                        <button 
                          onClick={() => downloadFile(file.id, file.original_name)}
                          disabled={downloading === file.id}
                          className="flex items-center space-x-1 px-3 py-1 bg-ms-blue text-white rounded-lg text-sm hover:bg-ms-dark-blue disabled:opacity-50"
                          data-testid={`download-file-${file.id}`}
                        >
                          <Download size={14} />
                          <span>{downloading === file.id ? 'Loading...' : 'Download'}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No files uploaded yet.</p>
            )}
          </div>

          {/* Access Request Section */}
          {user.role === 'training_partner' && !hasAccess && !hasPending && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Request Access</h3>
              <p className="text-sm text-yellow-700 mb-3">
                You need approval to download content from this course. Please provide a reason for your request.
              </p>
              <textarea
                className="w-full input-field mb-3"
                rows={3}
                placeholder="Explain why you need access to this content..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                data-testid="access-reason-input"
              />
              <button 
                onClick={requestAccess}
                disabled={requesting || !reason.trim()}
                className="btn-primary disabled:opacity-50"
                data-testid="request-access-button"
              >
                {requesting ? 'Submitting...' : 'Request Access'}
              </button>
            </div>
          )}

          {hasPending && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="text-blue-500" size={20} />
                <span className="font-medium text-blue-800">Access request pending approval</span>
              </div>
            </div>
          )}

          {hasAccess && user.role === 'training_partner' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="font-medium text-green-800">You have access to download this content</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-700">{value}</p>
  </div>
);

const ContentUpload = ({ user }) => {
  const [metadata, setMetadata] = useState(null);
  const [courses, setCourses] = useState([]);
  const [mode, setMode] = useState('new'); // 'new' or 'existing'
  const [selectedCourse, setSelectedCourse] = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', solution_area: '', solution_play: '',
    course_type: '', level: '', language: '', target_role: '', target_audience: '',
    duration: '', certification_course: false, hands_on_lab: false, multilingual_audio: false
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meta, coursesData] = await Promise.all([
          api.request('/metadata'),
          api.request('/courses')
        ]);
        setMetadata(meta);
        setCourses(coursesData.courses);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => [...prev.filter(f => f.type !== fileType), { file, type: fileType }]);
    }
  };

  const removeFile = (fileType) => {
    setFiles(prev => prev.filter(f => f.type !== fileType));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let courseId = selectedCourse;

      if (mode === 'new') {
        const result = await api.request('/courses', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        courseId = result.id;
      }

      // Upload files
      for (const fileItem of files) {
        setUploadProgress(prev => ({ ...prev, [fileItem.type]: 'uploading' }));
        
        const formDataUpload = new FormData();
        formDataUpload.append('file', fileItem.file);
        formDataUpload.append('file_type', fileItem.type);
        
        await api.uploadFile(`/courses/${courseId}/files`, formDataUpload);
        setUploadProgress(prev => ({ ...prev, [fileItem.type]: 'done' }));
      }

      alert('Content uploaded successfully!');
      setFormData({
        title: '', description: '', category: '', solution_area: '', solution_play: '',
        course_type: '', level: '', language: '', target_role: '', target_audience: '',
        duration: '', certification_course: false, hands_on_lab: false, multilingual_audio: false
      });
      setFiles([]);
      setUploadProgress({});
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const FormField = ({ label, name, type = 'text', options, required = false }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'select' ? (
        <select
          className="input-field"
          value={formData[name]}
          onChange={(e) => setFormData({...formData, [name]: e.target.value})}
          required={required}
          data-testid={`${name}-select`}
        >
          <option value="">Select {label}</option>
          {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          className="input-field"
          rows={4}
          value={formData[name]}
          onChange={(e) => setFormData({...formData, [name]: e.target.value})}
          required={required}
          data-testid={`${name}-textarea`}
        />
      ) : type === 'checkbox' ? (
        <input
          type="checkbox"
          className="w-5 h-5 rounded border-gray-300 text-ms-blue focus:ring-ms-blue"
          checked={formData[name]}
          onChange={(e) => setFormData({...formData, [name]: e.target.checked})}
          data-testid={`${name}-checkbox`}
        />
      ) : (
        <input
          type={type}
          className="input-field"
          value={formData[name]}
          onChange={(e) => setFormData({...formData, [name]: e.target.value})}
          required={required}
          data-testid={`${name}-input`}
        />
      )}
    </div>
  );

  const FileUploadField = ({ fileType }) => {
    const existingFile = files.find(f => f.type === fileType);
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">{fileType}</p>
        {existingFile ? (
          <div className="flex items-center justify-between bg-gray-50 rounded p-2">
            <span className="text-sm text-gray-600 truncate">{existingFile.file.name}</span>
            <div className="flex items-center space-x-2">
              {uploadProgress[fileType] === 'uploading' && (
                <div className="animate-spin w-4 h-4 border-2 border-ms-blue border-t-transparent rounded-full"></div>
              )}
              {uploadProgress[fileType] === 'done' && (
                <CheckCircle className="text-green-500" size={16} />
              )}
              <button onClick={() => removeFile(fileType)} className="text-red-500 hover:text-red-700">
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center cursor-pointer">
            <Upload className="text-gray-400" size={24} />
            <span className="text-sm text-gray-500 mt-1">Click to upload</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileChange(e, fileType)}
              data-testid={`file-upload-${fileType.replace(/[^a-zA-Z]/g, '-').toLowerCase()}`}
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-levelup-dark">Upload Course Content</h1>
        <p className="text-gray-500 mt-1">Add new courses or upload files to existing courses</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Mode Selection */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setMode('new')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              mode === 'new' ? 'bg-ms-blue text-white' : 'bg-gray-100 text-gray-700'
            }`}
            data-testid="mode-new"
          >
            Create New Course
          </button>
          <button
            onClick={() => setMode('existing')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              mode === 'existing' ? 'bg-ms-blue text-white' : 'bg-gray-100 text-gray-700'
            }`}
            data-testid="mode-existing"
          >
            Add to Existing Course
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'existing' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
              <select
                className="input-field"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
                data-testid="select-existing-course"
              >
                <option value="">Select a course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Course Title" name="title" required />
                <FormField label="Duration" name="duration" placeholder="e.g., 4.5 Hours" required />
              </div>
              
              <FormField label="Description" name="description" type="textarea" required />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Category" name="category" type="select" options={metadata?.content_categories} required />
                <FormField label="Solution Area" name="solution_area" type="select" options={metadata?.solution_areas} required />
                <FormField label="Solution Play" name="solution_play" type="select" options={metadata?.solution_plays} />
                <FormField label="Course Type" name="course_type" type="select" options={metadata?.course_types} required />
                <FormField label="Level" name="level" type="select" options={metadata?.levels} required />
                <FormField label="Language" name="language" type="select" options={metadata?.languages} required />
                <FormField label="Target Role" name="target_role" type="select" options={metadata?.roles} required />
              </div>
              
              <FormField label="Target Audience" name="target_audience" type="textarea" required />
              
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center space-x-2">
                  <FormField label="" name="certification_course" type="checkbox" />
                  <span className="text-sm text-gray-700">Certification Course</span>
                </label>
                <label className="flex items-center space-x-2">
                  <FormField label="" name="hands_on_lab" type="checkbox" />
                  <span className="text-sm text-gray-700">Includes Hands-on Lab</span>
                </label>
                <label className="flex items-center space-x-2">
                  <FormField label="" name="multilingual_audio" type="checkbox" />
                  <span className="text-sm text-gray-700">Multi-lingual Audio</span>
                </label>
              </div>
            </>
          )}

          {/* File Uploads */}
          <div>
            <h3 className="text-lg font-semibold text-levelup-dark mb-4">Course Content Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metadata?.file_types?.map(ft => (
                <FileUploadField key={ft} fileType={ft} />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || (mode === 'existing' && !selectedCourse)}
            className="btn-primary w-full disabled:opacity-50"
            data-testid="submit-upload"
          >
            {uploading ? 'Uploading...' : (mode === 'new' ? 'Create Course & Upload Files' : 'Upload Files')}
          </button>
        </form>
      </div>
    </div>
  );
};

const AccessRequestsManagement = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.request(`/access-requests?status=${filter}`);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRequest = async (requestId, status, notes = '') => {
    try {
      await api.request(`/access-requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, admin_notes: notes })
      });
      fetchRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-levelup-dark">Access Requests</h1>
        <p className="text-gray-500 mt-1">Review and manage training partner access requests</p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b flex space-x-2">
          {['pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                filter === status ? 'bg-ms-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              data-testid={`filter-${status}`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-ms-blue border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No {filter} requests found.
          </div>
        ) : (
          <div className="divide-y">
            {requests.map(request => (
              <div key={request.id} className="p-4" data-testid={`request-${request.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-levelup-dark">{request.user_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Organization:</strong> {request.organization}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Course:</strong> {request.course_title}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Reason:</strong> {request.reason}
                    </p>
                    <p className="text-xs text-gray-400">
                      Requested on {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {request.status === 'pending' && ['admin', 'ms_stakeholder'].includes(user.role) && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateRequest(request.id, 'approved')}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        data-testid={`approve-${request.id}`}
                      >
                        <CheckCircle size={16} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => updateRequest(request.id, 'rejected')}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        data-testid={`reject-${request.id}`}
                      >
                        <XCircle size={16} />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = roleFilter ? `?role=${roleFilter}` : '';
      const data = await api.request(`/users${params}`);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId) => {
    try {
      await api.request(`/users/${userId}/approve`, { method: 'PUT' });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      await api.request(`/users/${userId}/role?role=${newRole}`, { method: 'PUT' });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    content_admin: 'bg-blue-100 text-blue-700',
    training_partner: 'bg-gray-100 text-gray-700',
    ms_stakeholder: 'bg-green-100 text-green-700'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-levelup-dark">User Management</h1>
        <p className="text-gray-500 mt-1">Manage users, roles, and approvals</p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <select
            className="input-field max-w-xs"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            data-testid="role-filter"
          >
            <option value="">All Roles</option>
            <option value="training_partner">Training Partners</option>
            <option value="content_admin">Content Admins</option>
            <option value="ms_stakeholder">Microsoft Stakeholders</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-ms-blue border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Organization</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                  <tr key={u.id} data-testid={`user-row-${u.id}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-levelup-dark">{u.full_name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.organization}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        className={`px-2 py-1 rounded text-sm ${roleColors[u.role]}`}
                        data-testid={`role-select-${u.id}`}
                      >
                        <option value="training_partner">Training Partner</option>
                        <option value="content_admin">Content Admin</option>
                        <option value="ms_stakeholder">MS Stakeholder</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_approved ? (
                        <span className="flex items-center text-green-600 text-sm">
                          <CheckCircle size={16} className="mr-1" /> Approved
                        </span>
                      ) : (
                        <span className="flex items-center text-yellow-600 text-sm">
                          <Clock size={16} className="mr-1" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!u.is_approved && (
                        <button
                          onClick={() => approveUser(u.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          data-testid={`approve-user-${u.id}`}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const ExecutionsManagement = ({ user }) => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(null);

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      const data = await api.request('/executions');
      setExecutions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-levelup-dark">
            {user.role === 'training_partner' ? 'My Executions' : 'All Executions'}
          </h1>
          <p className="text-gray-500 mt-1">Course delivery schedules and attendance tracking</p>
        </div>
        {user.role === 'training_partner' && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="btn-primary flex items-center space-x-2"
            data-testid="schedule-execution-button"
          >
            <Plus size={20} />
            <span>Schedule Execution</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-ms-blue border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : executions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No executions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Expected</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actual</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  {user.role === 'training_partner' && (
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {executions.map(exe => (
                  <tr key={exe.id} data-testid={`execution-row-${exe.id}`}>
                    <td className="px-4 py-3 font-medium">{exe.course_title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(exe.execution_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{exe.location}</td>
                    <td className="px-4 py-3 text-gray-600">{exe.expected_attendees}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {exe.actual_attendees || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[exe.status]}`}>
                        {exe.status}
                      </span>
                    </td>
                    {user.role === 'training_partner' && (
                      <td className="px-4 py-3">
                        {!exe.attendance_submitted && exe.status === 'scheduled' && (
                          <button
                            onClick={() => setShowAttendanceModal(exe)}
                            className="px-3 py-1 bg-ms-blue text-white rounded text-sm hover:bg-ms-dark-blue"
                            data-testid={`submit-attendance-${exe.id}`}
                          >
                            Submit Attendance
                          </button>
                        )}
                        {exe.attendance_submitted && (
                          <span className="text-green-600 text-sm flex items-center">
                            <CheckCircle size={14} className="mr-1" /> Submitted
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showScheduleModal && (
        <ScheduleExecutionModal
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => { setShowScheduleModal(false); fetchExecutions(); }}
        />
      )}

      {showAttendanceModal && (
        <AttendanceModal
          execution={showAttendanceModal}
          onClose={() => setShowAttendanceModal(null)}
          onSuccess={() => { setShowAttendanceModal(null); fetchExecutions(); }}
        />
      )}
    </div>
  );
};

const ScheduleExecutionModal = ({ onClose, onSuccess }) => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    course_id: '', execution_date: '', location: '', expected_attendees: '', notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchApprovedCourses = async () => {
      try {
        const requests = await api.request('/access-requests?status=approved');
        const courseIds = [...new Set(requests.map(r => r.course_id))];
        const allCourses = await api.request('/courses');
        setCourses(allCourses.courses.filter(c => courseIds.includes(c.id)));
      } catch (err) {
        console.error(err);
      }
    };
    fetchApprovedCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.request('/executions', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          expected_attendees: parseInt(formData.expected_attendees),
          execution_date: new Date(formData.execution_date).toISOString()
        })
      });
      onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-levelup-dark">Schedule Course Execution</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              className="input-field"
              value={formData.course_id}
              onChange={(e) => setFormData({...formData, course_id: e.target.value})}
              required
              data-testid="schedule-course-select"
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Execution Date</label>
            <input
              type="datetime-local"
              className="input-field"
              value={formData.execution_date}
              onChange={(e) => setFormData({...formData, execution_date: e.target.value})}
              required
              data-testid="schedule-date-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              className="input-field"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="City, Country or Virtual"
              required
              data-testid="schedule-location-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Attendees</label>
            <input
              type="number"
              className="input-field"
              value={formData.expected_attendees}
              onChange={(e) => setFormData({...formData, expected_attendees: e.target.value})}
              min="1"
              required
              data-testid="schedule-attendees-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              className="input-field"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              data-testid="schedule-notes-input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-50"
            data-testid="schedule-submit-button"
          >
            {submitting ? 'Scheduling...' : 'Schedule Execution'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AttendanceModal = ({ execution, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    actual_attendees: '', completion_rate: '', feedback_summary: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.request(`/executions/${execution.id}/attendance`, {
        method: 'POST',
        body: JSON.stringify({
          execution_id: execution.id,
          actual_attendees: parseInt(formData.actual_attendees),
          completion_rate: parseFloat(formData.completion_rate),
          feedback_summary: formData.feedback_summary
        })
      });
      onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-levelup-dark">Submit Attendance Data</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="font-medium text-levelup-dark">{execution.course_title}</p>
          <p className="text-sm text-gray-500">
            {new Date(execution.execution_date).toLocaleDateString()} - {execution.location}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actual Attendees</label>
            <input
              type="number"
              className="input-field"
              value={formData.actual_attendees}
              onChange={(e) => setFormData({...formData, actual_attendees: e.target.value})}
              min="0"
              required
              data-testid="attendance-actual-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Completion Rate (%)</label>
            <input
              type="number"
              className="input-field"
              value={formData.completion_rate}
              onChange={(e) => setFormData({...formData, completion_rate: e.target.value})}
              min="0"
              max="100"
              step="0.1"
              required
              data-testid="attendance-rate-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Summary</label>
            <textarea
              className="input-field"
              rows={3}
              value={formData.feedback_summary}
              onChange={(e) => setFormData({...formData, feedback_summary: e.target.value})}
              placeholder="Brief summary of learner feedback"
              data-testid="attendance-feedback-input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-50"
            data-testid="attendance-submit-button"
          >
            {submitting ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [downloadData, setDownloadData] = useState(null);
  const [learnerData, setLearnerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [overviewRes, downloadsRes, learnersRes] = await Promise.all([
          api.request('/analytics/overview'),
          api.request('/analytics/downloads'),
          api.request('/analytics/learners')
        ]);
        setOverview(overviewRes);
        setDownloadData(downloadsRes);
        setLearnerData(learnersRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-ms-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-levelup-dark">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">Insights on content usage and learner engagement</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={BookOpen} label="Total Courses" value={overview?.total_courses || 0} color="bg-ms-blue" />
        <StatCard icon={Users} label="Training Partners" value={overview?.total_partners || 0} color="bg-levelup-green" />
        <StatCard icon={Download} label="Total Downloads" value={overview?.total_downloads || 0} color="bg-purple-500" />
        <StatCard icon={Calendar} label="Executions" value={overview?.total_executions || 0} color="bg-orange-500" />
        <StatCard icon={UserCheck} label="Trained Learners" value={overview?.total_trained_learners || 0} color="bg-pink-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Downloaded Courses */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-levelup-dark mb-4">Top Downloaded Courses</h2>
          <div className="space-y-3">
            {downloadData?.top_courses?.map((course, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 bg-ms-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-gray-700 truncate max-w-[200px]">{course.course_title}</span>
                </div>
                <span className="text-ms-blue font-semibold">{course.count}</span>
              </div>
            ))}
            {(!downloadData?.top_courses || downloadData.top_courses.length === 0) && (
              <p className="text-gray-500 text-center py-4">No download data yet</p>
            )}
          </div>
        </div>

        {/* Learners by Organization */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-levelup-dark mb-4">Learners by Organization</h2>
          <div className="space-y-3">
            {learnerData?.by_organization?.slice(0, 5).map((org, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700">{org._id}</p>
                  <p className="text-sm text-gray-500">
                    {org.total_executions} executions | {(org.avg_completion_rate || 0).toFixed(1)}% completion
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-levelup-green">{org.total_learners}</p>
                  <p className="text-xs text-gray-500">learners</p>
                </div>
              </div>
            ))}
            {(!learnerData?.by_organization || learnerData.by_organization.length === 0) && (
              <p className="text-gray-500 text-center py-4">No learner data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Learners by Course */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-levelup-dark mb-4">Top Courses by Trained Learners</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Executions</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trained Learners</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {learnerData?.by_course?.map((course, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 font-medium">{course.course_title}</td>
                  <td className="px-4 py-3 text-gray-600">{course.total_executions}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-levelup-green">{course.total_learners}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!learnerData?.by_course || learnerData.by_course.length === 0) && (
            <p className="text-gray-500 text-center py-4">No course learner data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-md p-6 card-hover">
    <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
      <Icon className="text-white" size={24} />
    </div>
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-3xl font-bold text-levelup-dark mt-1">{value}</p>
  </div>
);

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await api.request('/courses');
      setCourses(data.courses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.request(`/courses/${courseId}`, { method: 'DELETE' });
      fetchCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-levelup-dark">Manage Courses</h1>
        <p className="text-gray-500 mt-1">View and manage all course content</p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-ms-blue border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No courses found. Start by uploading content.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Solution Area</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Files</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {courses.map(course => (
                  <tr key={course.id} data-testid={`manage-course-${course.id}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-levelup-dark">{course.title}</p>
                      <p className="text-sm text-gray-500">{course.level} - {course.duration}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{course.category}</td>
                    <td className="px-4 py-3 text-gray-600">{course.solution_area}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {course.files?.length || 0} files
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                          data-testid={`delete-course-${course.id}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        api.setToken(token);
        try {
          const userData = await api.request('/auth/me');
          setUser(userData);
        } catch (err) {
          api.setToken(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    api.setToken(null);
    setUser(null);
    setActiveView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'courses':
        return <CourseBrowser user={user} />;
      case 'upload':
        return <ContentUpload user={user} />;
      case 'manage-courses':
        return <ManageCourses />;
      case 'access-requests':
      case 'my-access':
        return <AccessRequestsManagement user={user} />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <Analytics />;
      case 'executions':
      case 'my-executions':
        return <ExecutionsManagement user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={handleLogout} onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex">
          <Sidebar 
            user={user} 
            activeView={activeView} 
            setActiveView={setActiveView}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-64px)]">
            {renderView()}
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
