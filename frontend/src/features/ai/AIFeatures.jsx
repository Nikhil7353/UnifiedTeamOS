import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  FileText, 
  Mail, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  BarChart3,
  Settings,
  Play,
  Download,
  RefreshCw,
  Lightbulb,
  Target,
  Activity
} from 'lucide-react';

export default function AIFeatures() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    {
      id: 'summary',
      name: 'Smart Summaries',
      icon: FileText,
      description: 'AI-powered summaries of conversations, documents, and meetings',
      status: 'active',
      usage: '234 summaries this week'
    },
    {
      id: 'email',
      name: 'Email Assistant',
      icon: Mail,
      description: 'Draft and optimize emails with AI assistance',
      status: 'active',
      usage: '89 emails assisted'
    },
    {
      id: 'chat',
      name: 'Chat Intelligence',
      icon: MessageSquare,
      description: 'Smart replies, sentiment analysis, and conversation insights',
      status: 'active',
      usage: '1,247 messages analyzed'
    },
    {
      id: 'insights',
      name: 'Analytics & Insights',
      icon: TrendingUp,
      description: 'Team productivity patterns and communication insights',
      status: 'beta',
      usage: '12 reports generated'
    }
  ];

  const recentActivity = [
    { id: 1, type: 'summary', title: 'Q4 Planning Meeting Summary', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'email', title: 'Client Proposal Draft', time: '4 hours ago', status: 'completed' },
    { id: 3, type: 'chat', title: 'Team Chat Analysis', time: '1 day ago', status: 'completed' },
    { id: 4, type: 'insights', title: 'Weekly Productivity Report', time: '2 days ago', status: 'completed' }
  ];

  const handleFeatureAction = (featureId, action) => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      console.log(`Action ${action} on feature ${featureId}`);
    }, 2000);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">AI Actions Today</p>
              <p className="text-2xl font-bold">47</p>
            </div>
            <Activity className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Time Saved</p>
              <p className="text-2xl font-bold">3.2h</p>
            </div>
            <Clock className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Accuracy Rate</p>
              <p className="text-2xl font-bold">94%</p>
            </div>
            <Target className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Active Features</p>
              <p className="text-2xl font-bold">4</p>
            </div>
            <Zap className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    feature.status === 'active' 
                      ? 'bg-blue-100 dark:bg-blue-900' 
                      : 'bg-yellow-100 dark:bg-yellow-900'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      feature.status === 'active'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{feature.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      feature.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {feature.status}
                    </span>
                  </div>
                </div>
                <Settings className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{feature.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">{feature.usage}</p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFeatureAction(feature.id, 'configure')}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleFeatureAction(feature.id, 'run')}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Run
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent AI Activity
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'completed' 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-yellow-100 dark:bg-yellow-900'
                  }`}>
                    {activity.type === 'summary' && <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />}
                    {activity.type === 'email' && <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />}
                    {activity.type === 'chat' && <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />}
                    {activity.type === 'insights' && <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {activity.status === 'completed' && (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                        View
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">AI Configuration</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Auto-summarize meetings</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Automatically generate summaries after meetings</p>
            </div>
            <button className="bg-blue-500 relative inline-flex h-6 w-11 items-center rounded-full">
              <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Smart email suggestions</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get AI-powered email suggestions</p>
            </div>
            <button className="bg-blue-500 relative inline-flex h-6 w-11 items-center rounded-full">
              <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Conversation insights</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Analyze chat patterns and sentiment</p>
            </div>
            <button className="bg-gray-300 relative inline-flex h-6 w-11 items-center rounded-full">
              <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Model Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Model
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>GPT-4 (Recommended)</option>
              <option>GPT-3.5 Turbo</option>
              <option>Claude 3</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Response Length
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Concise</option>
              <option>Balanced</option>
              <option>Detailed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Features</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Intelligent workspace assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
}
