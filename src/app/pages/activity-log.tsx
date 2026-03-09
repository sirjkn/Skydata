import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Activity,
  User,
  Calendar,
  Clock,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Trash2,
  Home,
  Users,
  CreditCard,
  FileText,
  Settings,
  TrendingUp,
  Menu,
  X,
  Info
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { getCurrentUser } from '../lib/auth';
import { CustomModal } from '../components/custom-modal';
import { fetchActivityLogs, deleteActivityLogs } from '../../lib/supabaseData';

// App version - keep consistent across all modules
const APP_VERSION = '3.0';

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}

export function ActivityLog() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  
  // Modal State
  const [modalState, setModalState] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'confirm' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Check authentication
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Load activity logs from Supabase
  useEffect(() => {
    const loadActivityLogs = async () => {
      if (!navigator.onLine) {
        console.warn('No internet connection. Cannot load activity logs.');
        return;
      }

      try {
        const logsData = await fetchActivityLogs(1000); // Fetch up to 1000 logs
        const formattedLogs = logsData.map((log: any) => ({
          id: log.activity_id?.toString() || '',
          user: log.user_name || 'System',
          action: log.activity || '',
          details: log.activity_type || '',
          timestamp: log.created_at || new Date().toISOString()
        }));
        setActivityLogs(formattedLogs);
      } catch (error) {
        console.error('Error loading activity logs from Supabase:', error);
        showModal('error', 'Load Error', 'Failed to load activity logs. Please check your connection.');
      }
    };

    loadActivityLogs();
  }, []);

  const showModal = (
    type: 'success' | 'error' | 'confirm' | 'info',
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setModalState({
      show: true,
      type,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, show: false }));
  };

  // Get unique users and actions for filters
  const uniqueUsers = ['all', ...Array.from(new Set(activityLogs.map(log => log.user)))];
  const uniqueActions = ['all', ...Array.from(new Set(activityLogs.map(log => log.action)))];

  // Filter logs
  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = filterUser === 'all' || log.user === filterUser;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    
    return matchesSearch && matchesUser && matchesAction;
  });

  // Clear all logs from Supabase
  const handleClearLogs = () => {
    if (!navigator.onLine) {
      showModal('error', 'No Connection', 'Cannot clear logs while offline. Please check your internet connection.');
      return;
    }

    showModal(
      'confirm',
      'Clear Activity Logs',
      'Are you sure you want to clear all activity logs from the cloud database? This action cannot be undone.',
      async () => {
        try {
          await deleteActivityLogs();
          setActivityLogs([]);
          closeModal();
          showModal('success', 'Logs Cleared', 'All activity logs have been cleared successfully from the cloud.');
        } catch (error) {
          console.error('Error clearing activity logs:', error);
          showModal('error', 'Clear Error', 'Failed to clear activity logs. Please try again.');
        }
      },
      'Clear All',
      'Cancel'
    );
  };

  // Export logs
  const handleExportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showModal('success', 'Logs Exported', 'Activity logs have been exported successfully.');
  };

  // Format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get action color
  const getActionColor = (action: string) => {
    if (action.includes('Delete') || action.includes('Cancel')) return 'text-red-600 bg-red-50';
    if (action.includes('Update') || action.includes('Edit')) return 'text-orange-600 bg-orange-50';
    if (action.includes('Create') || action.includes('Add')) return 'text-green-600 bg-green-50';
    if (action.includes('Payment')) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Menu items - same as admin dashboard
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp, active: true },
    { id: 'properties', label: 'Properties', icon: Home, active: true },
    { id: 'bookings', label: 'Bookings', icon: Calendar, active: true },
    { id: 'customers', label: 'Customers', icon: Users, active: true },
    { id: 'payments', label: 'Payments', icon: CreditCard, active: true },
    { id: 'menu-pages', label: 'Menu Pages', icon: FileText, active: true },
    { id: 'activity-log', label: 'Activity Log', icon: Activity, active: true },
    { id: 'settings', label: 'Settings', icon: Settings, active: true }
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex">
      {/* Sidebar */}
      <aside className={`bg-[#36454F] border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="sticky top-0 h-screen flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-600">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-between text-white hover:text-[#6B7F39] transition"
            >
              {sidebarOpen ? (
                <>
                  <span className="font-semibold">Menu</span>
                  <X className="w-5 h-5" />
                </>
              ) : (
                <Menu className="w-5 h-5 mx-auto" />
              )}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'activity-log';
              const isClickable = item.active;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isClickable) {
                      if (item.id === 'settings') {
                        navigate('/admin/settings');
                      } else if (item.id === 'activity-log') {
                        // Already on this page
                      } else {
                        navigate('/admin/dashboard');
                      }
                    }
                  }}
                  disabled={!isClickable}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                    isActive
                      ? 'bg-[#6B7F39] text-white'
                      : isClickable
                      ? 'text-white hover:bg-[#2a3440]'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${sidebarOpen ? '' : 'mx-auto'}`} />
                  {sidebarOpen && (
                    <div className="flex items-center justify-between flex-1">
                      <span className="font-medium">{item.label}</span>
                      {!item.active && (
                        <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                          Soon
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Version Info at Bottom */}
          <div className="p-4 border-t border-gray-600">
            {sidebarOpen ? (
              <div className="bg-gradient-to-br from-[#2a3640] to-[#1f2a33] rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Info className="w-3 h-3 text-white/70" />
                  <p className="text-xs text-white/70 font-medium">Version</p>
                </div>
                <p className="text-xl font-bold text-white">{APP_VERSION}</p>
                <p className="text-xs text-white/50 mt-1">Skyway Suites</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-white/70 font-bold">{APP_VERSION}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#36454F] flex items-center gap-2">
                  <Activity className="w-7 h-7" />
                  Activity Log
                </h1>
                <p className="text-sm text-gray-500 mt-1">Monitor system activities and changes</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-[#36454F]">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Logs</p>
                  <p className="text-3xl font-bold mt-1">{activityLogs.length}</p>
                </div>
                <Activity className="w-12 h-12 opacity-50" />
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Filtered Results</p>
                  <p className="text-3xl font-bold mt-1">{filteredLogs.length}</p>
                </div>
                <Filter className="w-12 h-12 opacity-50" />
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Unique Users</p>
                  <p className="text-3xl font-bold mt-1">{uniqueUsers.length - 1}</p>
                </div>
                <User className="w-12 h-12 opacity-50" />
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Action Types</p>
                  <p className="text-3xl font-bold mt-1">{uniqueActions.length - 1}</p>
                </div>
                <Activity className="w-12 h-12 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  Search Logs
                </label>
                <Input
                  type="text"
                  placeholder="Search by action, details, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Filter by User
                </label>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6B7F39] focus:border-transparent"
                >
                  {uniqueUsers.map(user => (
                    <option key={user} value={user}>
                      {user === 'all' ? 'All Users' : user}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Filter by Action
                </label>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6B7F39] focus:border-transparent"
                >
                  {uniqueActions.map(action => (
                    <option key={action} value={action}>
                      {action === 'all' ? 'All Actions' : action}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
              <Button
                onClick={handleExportLogs}
                className="bg-[#6B7F39] hover:bg-[#5a6930]"
                disabled={filteredLogs.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
              <Button
                onClick={handleClearLogs}
                variant="destructive"
                disabled={activityLogs.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Logs
              </Button>
            </div>
          </Card>

          {/* Activity Logs Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              {filteredLogs.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#6B7F39] text-white flex items-center justify-center font-semibold text-sm">
                              {log.user.charAt(0).toUpperCase()}
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-900">
                              {log.user}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{log.details}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(log.timestamp)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            {formatTime(log.timestamp)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No Activity Logs Found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchTerm || filterUser !== 'all' || filterAction !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Activity logs will appear here as actions are performed.'}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </main>

        {/* Custom Modal */}
        <CustomModal
          isOpen={modalState.show}
          onClose={closeModal}
          type={modalState.type}
          title={modalState.title}
          message={modalState.message}
          onConfirm={modalState.onConfirm}
          confirmText={modalState.confirmText}
          cancelText={modalState.cancelText}
        />
      </div>
    </div>
  );
}