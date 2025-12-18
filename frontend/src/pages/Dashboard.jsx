import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser, isAuthenticated } from '../services/authService';
import api from '../services/api';
import { unifiedSearch } from '../services/searchService';
import ChatWindow from '../features/chat/ChatWindow';
import TaskBoard from '../features/tasks/TaskBoard';
import IntelligentWorkspace from '../features/workspace/IntelligentWorkspace';
import AIFeatures from '../features/ai/AIFeatures';
import EmailIntegration from '../features/email/EmailIntegration';
import SharedDocuments from '../features/docs/SharedDocuments';
import UnifiedInbox from '../features/inbox/UnifiedInbox';
import VoiceRooms from '../features/voice/VoiceRooms';
import VideoCalling from '../features/video/VideoCalling';
import Whiteboard from '../features/whiteboard/Whiteboard';
import ProjectBoards from '../features/boards/ProjectBoards';
import Ticketing from '../features/ticketing/Ticketing';
import WorkflowAutomation from '../features/automation/WorkflowAutomation';
import AdminPanel from '../features/admin/AdminPanel';
import ClientMode from '../features/client/ClientMode';
import SecurityCenter from '../features/security/SecurityCenter';
import OfflineMode from '../features/offline/OfflineMode';
import SettingsHub from '../features/settings/SettingsHub';
import {
  MessageCircle,
  CheckSquare,
  FileText,
  Headphones,
  Video,
  PenTool,
  Columns,
  Ticket,
  Wand2,
  Mail,
  LogOut,
  User,
  Sun,
  Moon,
  Menu,
  X,
  Home,
  Search,
  Bell,
  Plus,
  Users,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap,
  Brain,
  Sparkles,
  Hash,
  Inbox,
  UploadCloud,
  ShieldCheck,
  Briefcase,
  Shield,
  Activity,
  ClipboardList,
  FolderPlus,
  PlayCircle,
  Settings,
  Lock,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('workspace');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState('Just now');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ tasks: [], messages: [], documents: [], emails: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setIsSearching(false);
      setSearchResults({ tasks: [], messages: [], documents: [], emails: [] });
      return;
    }

    setIsSearching(true);
    const t = setTimeout(() => {
      unifiedSearch(q)
        .then((data) => {
          setSearchResults({
            tasks: data?.tasks || [],
            messages: data?.messages || [],
            documents: data?.documents || [],
            emails: data?.emails || [],
          });
        })
        .catch(() => {
          setSearchResults({ tasks: [], messages: [], documents: [], emails: [] });
        })
        .finally(() => setIsSearching(false));
    }, 350);

    return () => clearTimeout(t);
  }, [searchQuery]);

  const hasAnySearchResults = useMemo(() => {
    return (
      (searchResults.tasks || []).length > 0 ||
      (searchResults.messages || []).length > 0 ||
      (searchResults.documents || []).length > 0 ||
      (searchResults.emails || []).length > 0
    );
  }, [searchResults]);

  // Dashboard UI data (mocked for UI polish)
  const overviewStats = [
    { title: 'Open Tasks', value: '18', trend: '+3 this week', icon: ClipboardList, color: 'from-primary-500 to-primary-600' },
    { title: 'Unread Messages', value: '42', trend: '5 new today', icon: Inbox, color: 'from-secondary-500 to-secondary-700' },
    { title: 'Files Shared', value: '12', trend: '2 new uploads', icon: UploadCloud, color: 'from-accent-500 to-accent-600' },
    { title: 'Security', value: 'Healthy', trend: 'RBAC enabled', icon: ShieldCheck, color: 'from-success-500 to-success-600' },
  ];

  const quickActions = [
    { label: 'New Task', icon: CheckSquare, action: () => setActiveTab('tasks') },
    { label: 'New Channel', icon: FolderPlus, action: () => createChannelPrompt() },
    { label: 'Start Standup', icon: PlayCircle, action: () => setActiveTab('chats') },
    { label: 'Run AI Summary', icon: Brain, action: () => setActiveTab('workspace') },
  ];

  const recentActivity = [
    { id: 1, type: 'task', title: 'Homepage layout updated', time: '10m ago', icon: Activity },
    { id: 2, type: 'message', title: 'You were mentioned in #design', time: '35m ago', icon: MessageCircle },
    { id: 3, type: 'file', title: 'Product roadmap.pdf uploaded', time: '1h ago', icon: UploadCloud },
    { id: 4, type: 'security', title: 'RBAC roles updated', time: '3h ago', icon: ShieldCheck },
  ];

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      setUser(getCurrentUser());
      loadChannels();
    }

    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [navigate]);

  const loadChannels = async () => {
    try {
      const response = await api.get('/channels');
      setChannels(response.data);
      // Set first channel as active if available
      if (response.data.length > 0 && !activeChannel) {
        setActiveChannel(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navigationItems = [
    { id: 'workspace', label: 'Workspace', icon: Zap, active: activeTab === 'workspace' },
    { id: 'inbox', label: 'Inbox', icon: Inbox, active: activeTab === 'inbox' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, active: activeTab === 'tasks' },
    { id: 'chats', label: 'Chats', icon: MessageCircle, active: activeTab === 'chats' },
    { id: 'voice', label: 'Voice Rooms', icon: Headphones, active: activeTab === 'voice' },
    { id: 'video', label: 'Video Call', icon: Video, active: activeTab === 'video' },
    { id: 'whiteboard', label: 'Whiteboard', icon: PenTool, active: activeTab === 'whiteboard' },
    { id: 'boards', label: 'Boards', icon: Columns, active: activeTab === 'boards' },
    { id: 'tickets', label: 'Tickets', icon: Ticket, active: activeTab === 'tickets' },
    { id: 'automations', label: 'Automations', icon: Wand2, active: activeTab === 'automations' },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, active: activeTab === 'admin' },
    { id: 'client', label: 'Client Mode', icon: Briefcase, active: activeTab === 'client' },
    { id: 'security', label: 'Security', icon: Shield, active: activeTab === 'security' },
    { id: 'settings', label: 'Settings', icon: Settings, active: activeTab === 'settings' },
    { id: 'email', label: 'Email', icon: Mail, active: activeTab === 'email' },
    { id: 'ai', label: 'AI Features', icon: Brain, active: activeTab === 'ai' },
    { id: 'docs', label: 'Docs', icon: FileText, active: activeTab === 'docs' },
  ];

  const navigationGroups = [
    {
      title: 'Core',
      items: ['workspace', 'inbox', 'tasks', 'chats'],
    },
    {
      title: 'Collaboration',
      items: ['docs', 'email', 'ai', 'voice', 'video', 'whiteboard', 'boards', 'tickets', 'automations', 'client'],
    },
    {
      title: 'Management',
      items: ['security', 'settings', 'admin'],
    },
  ];

  const createChannelPrompt = async () => {
    const name = prompt('Channel name');
    if (!name) return;
    try {
      const res = await api.post('/channels', { name });
      setChannels((prev) => [...prev, res.data]);
      setActiveChannel(res.data);
      setActiveTab('chats');
    } catch (e) {
      console.error('Failed to create channel', e);
      alert('Channel creation failed');
    }
  };

  const handleChannelSelect = (channel) => {
    setActiveChannel(channel);
    setActiveTab('chats'); // Switch to chats tab when selecting a channel
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } flex flex-col shadow-large overflow-hidden`}>

        {/* Header */}
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft ring-1 ring-black/5 dark:ring-white/10">
                <div className="absolute inset-0 rounded-xl bg-white/10" />
                <Users className="relative w-6 h-6 text-white" />
              </div>
              <div className="leading-tight">
                <h1 className="font-display font-bold text-[18px] text-secondary-900 dark:text-white tracking-tight">
                  TeamOS
                </h1>
                <p className="text-secondary-500 dark:text-secondary-400 text-xs">
                  Unified Workspace
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden btn-ghost p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 p-4 space-y-6 overflow-y-auto">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.items
                  .map((id) => navigationItems.find((i) => i.id === id))
                  .filter(Boolean)
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id}>
                        <button
                          onClick={() => {
                            if (!item.disabled) {
                              setActiveTab(item.id);
                              setSidebarOpen(false);
                            }
                          }}
                          disabled={item.disabled}
                          className={`nav-item ${
                            item.active ? 'nav-item-active' : 'nav-item-inactive'
                          } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                          {item.disabled && (
                            <span className="ml-auto text-xs bg-secondary-200 dark:bg-secondary-700 px-2 py-1 rounded-full">
                              Soon
                            </span>
                          )}
                        </button>

                        {item.id === 'chats' && (
                          <div className="mt-2 pl-8">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-[11px] font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                                Channels
                              </div>
                              <div className="flex gap-2">
                                <button
                                  className="btn-ghost p-1"
                                  onClick={createChannelPrompt}
                                  title="Create channel"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  className="btn-ghost text-xs px-2 opacity-50 cursor-not-allowed"
                                  disabled
                                  title="Coming soon"
                                >
                                  Join
                                  <span className="ml-2 text-[10px] bg-secondary-200 dark:bg-secondary-700 px-2 py-0.5 rounded-full">
                                    Soon
                                  </span>
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              {channels.map((channel) => (
                                <button
                                  key={channel.id}
                                  onClick={() => handleChannelSelect(channel)}
                                  className={`w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors ${
                                    activeChannel?.id === channel.id ? 'nav-item-active' : 'nav-item-inactive'
                                  }`}
                                >
                                  <Hash className="w-3.5 h-3.5" />
                                  <span className="font-medium truncate">{channel.name}</span>
                                  {channel.is_private && (
                                    <span
                                      className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-md bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-200"
                                      title="Private"
                                    >
                                      <Lock className="w-3 h-3" />
                                    </span>
                                  )}
                                  {channel.role && (
                                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200">
                                      {channel.role}
                                    </span>
                                  )}
                                </button>
                              ))}

                              {channels.length === 0 && (
                                <div className="text-secondary-500 dark:text-secondary-400 text-sm text-center py-3">
                                  <p className="text-sm">No channels yet</p>
                                  <button className="btn-ghost text-sm mt-1" onClick={createChannelPrompt}>
                                    Create your first channel
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 space-y-4">
          {/* User Info */}
          <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl border border-secondary-200/70 dark:border-secondary-700">
            <div className="flex items-start gap-3">
              <button
                onClick={() => setActiveTab('settings')}
                className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center text-white font-semibold shrink-0"
                title="Open settings"
              >
                {(user.username || 'U').slice(0, 1).toUpperCase()}
              </button>

              <div className="flex-1 min-w-0">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="text-left w-full"
                  title="Open settings"
                >
                  <p className="text-sm font-semibold text-secondary-900 dark:text-white truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                    {user.email}
                  </p>
                </button>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-xl bg-white/70 dark:bg-secondary-800/70 border border-secondary-200 dark:border-secondary-600 hover:bg-white dark:hover:bg-secondary-800 transition-colors"
                    title={darkMode ? 'Light mode' : 'Dark mode'}
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl border border-danger-200/70 dark:border-danger-900/40 bg-danger-50/70 dark:bg-danger-900/10 text-danger-700 dark:text-danger-300 hover:bg-danger-100 dark:hover:bg-danger-900/20 transition-colors"
                    title="Sign out"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>

                  <div className="flex-1" />
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="text-xs px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-700 dark:text-secondary-200 transition-colors"
                    title="Account settings"
                  >
                    Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <OfflineMode
          isOnline={isOnline}
          setIsOnline={setIsOnline}
          drawerOpen={syncDrawerOpen}
          setDrawerOpen={setSyncDrawerOpen}
          lastSyncedAt={lastSyncedAt}
          setLastSyncedAt={setLastSyncedAt}
        />
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-3 py-2.5 bg-white/85 dark:bg-secondary-800/85 backdrop-blur border-b border-secondary-200 dark:border-secondary-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-ghost p-2"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-display font-bold text-lg text-secondary-900 dark:text-white">
            {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Desktop Header with Search */}
        <div className="hidden lg:flex sticky top-0 z-30 items-center justify-between px-6 py-4 bg-white/85 dark:bg-secondary-800/85 backdrop-blur border-b border-secondary-200 dark:border-secondary-700">
          <div>
            <h1 className="font-display font-bold text-2xl text-secondary-900 dark:text-white tracking-tight">
              {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400 text-sm mt-0.5">
              {activeTab === 'overview' && 'Your workspace overview and recent activity'}
              {activeTab === 'workspace' && 'AI-powered project organization and insights'}
              {activeTab === 'inbox' && 'Unified feed across chat, email, tasks, and notifications'}
              {activeTab === 'tasks' && 'Manage and track your team tasks'}
              {activeTab === 'chats' && 'Team communication and messaging'}
              {activeTab === 'voice' && 'Persistent voice rooms with push-to-talk (UI-first)'}
              {activeTab === 'video' && 'Video meetings with participants and controls (UI-first)'}
              {activeTab === 'whiteboard' && 'Shared whiteboard for brainstorming and sketching (UI-first)'}
              {activeTab === 'boards' && 'Kanban and sprint planning boards (UI-first)'}
              {activeTab === 'tickets' && 'Convert messages/emails into tickets and track status (UI-first)'}
              {activeTab === 'automations' && 'Build triggers and actions to automate work (UI-first)'}
              {activeTab === 'admin' && 'Admin panel for users, roles, audit, and org settings (UI-first)'}
              {activeTab === 'client' && 'Isolated client spaces for external communication (UI-first)'}
              {activeTab === 'security' && 'Security policies: E2E, DLP, retention (UI-first)'}
              {activeTab === 'settings' && 'Profile, notifications, appearance, integrations (UI-first)'}
              {activeTab === 'email' && 'Mailbox experience for your messages (UI-first)'}
              {activeTab === 'ai' && 'Summaries, notes, drafting, and insights (UI-first)'}
              {activeTab === 'docs' && 'Shared documents with editor and comments (UI-first)'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search inbox, tasks, messages, docs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => {
                  setTimeout(() => setSearchOpen(false), 150);
                }}
                className="w-[28rem] pl-10 pr-16 py-2 bg-secondary-50/80 dark:bg-secondary-700/70 border border-secondary-200 dark:border-secondary-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder:text-secondary-400 dark:placeholder:text-secondary-400"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-1 text-[11px] text-secondary-500 dark:text-secondary-400">
                <span className="px-2 py-1 rounded-lg border border-secondary-200 dark:border-secondary-600 bg-white/70 dark:bg-secondary-800/60">
                  Ctrl
                </span>
                <span className="px-2 py-1 rounded-lg border border-secondary-200 dark:border-secondary-600 bg-white/70 dark:bg-secondary-800/60">
                  K
                </span>
              </div>

              {searchOpen && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-12 bg-white dark:bg-secondary-800 rounded-2xl shadow-large border border-secondary-200 dark:border-secondary-700 overflow-hidden z-30">
                  <div className="p-3 border-b border-secondary-200 dark:border-secondary-700 text-xs text-secondary-500 dark:text-secondary-400 flex items-center justify-between">
                    <span>{isSearching ? 'Searching…' : hasAnySearchResults ? 'Results' : 'No results'}</span>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded-lg border border-secondary-200 dark:border-secondary-600 bg-secondary-50/80 dark:bg-secondary-700/60 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults({ tasks: [], messages: [], documents: [], emails: [] });
                        setSearchOpen(false);
                      }}
                    >
                      Clear
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {(searchResults.tasks || []).length > 0 && (
                      <Section
                        title="Tasks"
                        items={searchResults.tasks}
                        onPick={(t) => {
                          setActiveTab('tasks');
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        renderLabel={(t) => t.title}
                      />
                    )}

                    {(searchResults.documents || []).length > 0 && (
                      <Section
                        title="Docs"
                        items={searchResults.documents}
                        onPick={() => {
                          setActiveTab('docs');
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        renderLabel={(d) => d.title}
                      />
                    )}

                    {(searchResults.emails || []).length > 0 && (
                      <Section
                        title="Email"
                        items={searchResults.emails}
                        onPick={() => {
                          setActiveTab('email');
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        renderLabel={(m) => m.subject}
                      />
                    )}

                    {(searchResults.messages || []).length > 0 && (
                      <Section
                        title="Messages"
                        items={searchResults.messages}
                        onPick={() => {
                          setActiveTab('chats');
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        renderLabel={(m) => m.content}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-2xl bg-secondary-50/80 dark:bg-secondary-700/70 border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 top-12 w-80 bg-white dark:bg-secondary-800 rounded-2xl shadow-large border border-secondary-200 dark:border-secondary-700 z-20">
                    <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
                      <h3 className="font-bold text-secondary-900 dark:text-white">Notifications</h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {[
                        { id: 1, type: 'task', message: 'Task "Design homepage" was completed', time: '2 min ago', unread: true },
                        { id: 2, type: 'message', message: 'Sarah mentioned you in #general', time: '15 min ago', unread: true },
                        { id: 3, type: 'task', message: 'New task assigned: "Update API docs"', time: '1 hour ago', unread: false },
                        { id: 4, type: 'system', message: 'Welcome to TeamOS! Complete your profile.', time: '2 days ago', unread: false },
                      ].map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-secondary-100 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 cursor-pointer ${
                            notification.unread ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              notification.type === 'task' ? 'bg-primary-100 text-primary-600' :
                              notification.type === 'message' ? 'bg-secondary-100 text-secondary-600' :
                              'bg-accent-100 text-accent-600'
                            }`}>
                              {notification.type === 'task' && <CheckSquare className="w-4 h-4" />}
                              {notification.type === 'message' && <MessageCircle className="w-4 h-4" />}
                              {notification.type === 'system' && <Bell className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-secondary-900 dark:text-white font-medium">
                                {notification.message}
                              </p>
                              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
                      <button className="w-full btn-ghost text-sm">
                        Mark all as read
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          {/* Render Intelligent Workspace if active */}
          {activeTab === 'workspace' && (
            <div className="h-full overflow-y-auto">
              {/* Overview cards */}
              <div className="p-4 lg:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {overviewStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.title} className="card card-hover p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-secondary-500 dark:text-secondary-400">
                            {stat.title}
                          </div>
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white shadow-soft`}>
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-secondary-900 dark:text-white mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-secondary-500 dark:text-secondary-400">
                          {stat.trend}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Quick actions */}
                  <div className="card lg:col-span-2 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        <h3 className="font-semibold text-secondary-900 dark:text-white">Quick actions</h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {quickActions.map((qa) => {
                        const Icon = qa.icon;
                        return (
                          <button
                            key={qa.label}
                            onClick={qa.action}
                            className="card card-hover flex flex-col items-start gap-2 p-4"
                          >
                            <div className="w-9 h-9 rounded-lg bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center text-secondary-700 dark:text-secondary-200">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-secondary-900 dark:text-white">{qa.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent activity */}
                  <div className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-4 h-4 text-primary-500" />
                      <h3 className="font-semibold text-secondary-900 dark:text-white">Recent activity</h3>
                    </div>
                    <div className="space-y-3">
                      {recentActivity.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.id} className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center text-secondary-700 dark:text-secondary-200">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-secondary-500 dark:text-secondary-400">{item.time}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Functional intelligent workspace */}
              <div className="h-full">
                <IntelligentWorkspace
                  user={user}
                  channels={channels}
                  activeChannel={activeChannel}
                  setActiveChannel={setActiveChannel}
                  onOpenTasks={() => setActiveTab('tasks')}
                  onOpenChat={() => setActiveTab('chats')}
                />
              </div>
            </div>
          )}

          {/* Render Tasks if active */}
          {activeTab === 'tasks' && (
            <div className="h-full overflow-y-auto">
              <TaskBoard currentUser={user} />
            </div>
          )}

          {/* Render Unified Inbox if active */}
          {activeTab === 'inbox' && (
            <div className="h-full">
              <UnifiedInbox currentUser={user} onOpenTab={setActiveTab} />
            </div>
          )}

          {/* Render Chat if active */}
          {activeTab === 'chats' && (
            <div className="h-full">
              <ChatWindow currentUser={user} activeChannel={activeChannel} />
            </div>
          )}

          {/* Render Voice Rooms if active */}
          {activeTab === 'voice' && (
            <div className="h-full">
              <VoiceRooms currentUser={user} />
            </div>
          )}

          {/* Render Video Calling if active */}
          {activeTab === 'video' && (
            <div className="h-full">
              <VideoCalling currentUser={user} />
            </div>
          )}

          {/* Render Whiteboard if active */}
          {activeTab === 'whiteboard' && (
            <div className="h-full">
              <Whiteboard currentUser={user} />
            </div>
          )}

          {/* Render Project Boards if active */}
          {activeTab === 'boards' && (
            <div className="h-full">
              <ProjectBoards currentUser={user} />
            </div>
          )}

          {/* Render Ticketing if active */}
          {activeTab === 'tickets' && (
            <div className="h-full">
              <Ticketing currentUser={user} />
            </div>
          )}

          {/* Render Automations if active */}
          {activeTab === 'automations' && (
            <div className="h-full">
              <WorkflowAutomation currentUser={user} />
            </div>
          )}

          {/* Render Admin if active */}
          {activeTab === 'admin' && (
            <div className="h-full">
              <AdminPanel currentUser={user} />
            </div>
          )}

          {/* Render Client Mode if active */}
          {activeTab === 'client' && (
            <div className="h-full">
              <ClientMode currentUser={user} />
            </div>
          )}

          {/* Render Security if active */}
          {activeTab === 'security' && (
            <div className="h-full">
              <SecurityCenter />
            </div>
          )}

          {/* Render Settings if active */}
          {activeTab === 'settings' && (
            <div className="h-full">
              <SettingsHub currentUser={user} />
            </div>
          )}

          {/* Render Email if active */}
          {activeTab === 'email' && (
            <div className="h-full">
              <EmailIntegration />
            </div>
          )}

          {/* Render AI Features if active */}
          {activeTab === 'ai' && (
            <div className="h-full overflow-y-auto">
              <AIFeatures />
            </div>
          )}

          {/* Render Docs */}
          {activeTab === 'docs' && (
            <div className="h-full">
              <SharedDocuments currentUser={user} />
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          <button className="w-14 h-14 bg-gradient-primary rounded-full shadow-large hover:shadow-glow transform hover:scale-110 transition-all duration-200 flex items-center justify-center group">
            <Plus className="w-6 h-6 text-white group-hover:rotate-45 transition-transform duration-200" />
          </button>

          {/* FAB Menu */}
          <div className="absolute bottom-16 right-0 space-y-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={() => setActiveTab('tasks')}
              className="flex items-center gap-3 bg-white dark:bg-secondary-800 shadow-large rounded-xl px-4 py-3 hover:shadow-glow transition-all duration-200 whitespace-nowrap"
            >
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-primary-600" />
              </div>
              <span className="font-medium text-secondary-900 dark:text-white">New Task</span>
            </button>

            <button
              onClick={() => setActiveTab('chats')}
              className="flex items-center gap-3 bg-white dark:bg-secondary-800 shadow-large rounded-xl px-4 py-3 hover:shadow-glow transition-all duration-200 whitespace-nowrap"
            >
              <div className="w-8 h-8 bg-secondary-100 dark:bg-secondary-700 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
              </div>
              <span className="font-medium text-secondary-900 dark:text-white">Send Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
