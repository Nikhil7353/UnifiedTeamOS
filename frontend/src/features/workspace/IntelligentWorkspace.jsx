import { useState, useEffect, useMemo } from 'react';
import { Brain, TrendingUp, CheckSquare, MessageCircle, Calendar, Target, Sparkles, Loader2 } from 'lucide-react';
import TaskBoard from '../tasks/TaskBoard';
import ChatWindow from '../chat/ChatWindow';
import { getAllTasks } from '../../services/taskService';
import api from '../../services/api';

export default function IntelligentWorkspace({
  user,
  channels = [],
  activeChannel,
  onOpenTasks,
  onOpenChat,
  setActiveChannel,
}) {
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentChannel = activeChannel || channels[0] || null;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [taskData, msgData] = await Promise.all([
          getAllTasks(),
          currentChannel ? api.get(`/chat/channels/${currentChannel.id}/messages`) : Promise.resolve({ data: [] }),
        ]);
        setTasks(taskData || []);
        setMessages(msgData.data || []);
      } catch (e) {
        console.error('Failed to load workspace data', e);
      } finally {
        setLoading(false);
      }
    };
    load();
    // only rerun when channel changes
  }, [currentChannel]);

  const insights = useMemo(() => {
    const totalTasks = tasks.length;
    const completedToday = tasks.filter((t) => t.status === 'DONE').length;
    const messagesToday = messages.length;
    const activeProjects = Math.max(1, Math.ceil(totalTasks / 5));
    return { totalTasks, completedToday, messagesToday, activeProjects };
  }, [tasks, messages]);

  const recentActivity = useMemo(() => {
    const taskEvents = tasks.slice(-3).map((t) => ({
      id: `task-${t.id}`,
      type: 'task',
      message: `Task "${t.title}" ${t.status === 'DONE' ? 'completed' : 'updated'}`,
      time: 'recent',
      user: t.assignedUser?.username || 'Unassigned',
    }));
    const msgEvents = messages.slice(-3).map((m) => ({
      id: `msg-${m.id}`,
      type: 'message',
      message: m.content,
      time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: m.sender?.username || 'Member',
    }));
    return [...taskEvents, ...msgEvents].slice(0, 6);
  }, [tasks, messages]);

  const aiInsights = [
    "Tasks done today: " + insights.completedToday,
    "Messages in this channel: " + insights.messagesToday,
    "Focus projects active: " + insights.activeProjects,
    "Tip: Convert messages to tasks to keep work flowing",
  ];

  return (
    <div className="h-full flex flex-col p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow ring-1 ring-black/5 dark:ring-white/10">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-secondary-900 dark:text-white tracking-tight">
              Intelligent Workspace
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400">
              AI-powered insights and unified team collaboration
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card p-5 hover:shadow-medium transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{insights.totalTasks}</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Total Tasks</p>
              </div>
            </div>
          </div>

          <div className="card p-5 hover:shadow-medium transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-100 dark:bg-success-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{insights.completedToday}</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Completed Today</p>
              </div>
            </div>
          </div>

          <div className="card p-5 hover:shadow-medium transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-700 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{insights.messagesToday}</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Messages Today</p>
              </div>
            </div>
          </div>

          <div className="card p-5 hover:shadow-medium transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/30 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{insights.activeProjects}</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Active Projects</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks Overview */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white tracking-tight">Tasks</h2>
              <div className="flex gap-2">
                {onOpenTasks && (
                  <button className="btn-ghost text-sm" onClick={onOpenTasks}>
                    Open board
                  </button>
                )}
              </div>
            </div>
            <TaskBoard currentUser={user} />
          </div>
        </div>

        {/* Right Column - AI Insights & Chat */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent-500" />
              <h3 className="text-lg font-bold text-secondary-900 dark:text-white tracking-tight">AI Insights</h3>
            </div>

            <div className="space-y-3">
              {aiInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-accent-50 dark:bg-accent-900/10 rounded-xl border border-accent-200 dark:border-accent-800">
                  <Brain className="w-4 h-4 text-accent-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-secondary-700 dark:text-secondary-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-bold text-secondary-900 dark:text-white tracking-tight">Recent Activity</h3>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'task' ? 'bg-primary-100 text-primary-600' :
                    activity.type === 'message' ? 'bg-secondary-100 text-secondary-600' :
                    'bg-accent-100 text-accent-600'
                  }`}>
                    {activity.type === 'task' && <CheckSquare className="w-4 h-4" />}
                    {activity.type === 'message' && <MessageCircle className="w-4 h-4" />}
                    {activity.type === 'ai' && <Brain className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary-900 dark:text-white font-medium">
                      {activity.message}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Chat */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-secondary-500" />
                <h3 className="text-lg font-bold text-secondary-900 dark:text-white tracking-tight">Quick Chat</h3>
              </div>
              <div className="flex items-center gap-2">
                {setActiveChannel && (
                  <select
                    className="h-10 w-56 px-3 pr-8 text-sm bg-secondary-50/80 dark:bg-secondary-700/70 border border-secondary-200 dark:border-secondary-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    value={currentChannel?.id || ''}
                    onChange={(e) => {
                      const selected = channels.find((c) => c.id === Number(e.target.value));
                      if (selected) setActiveChannel(selected);
                    }}
                  >
                    {channels.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="h-64 border border-secondary-200 dark:border-secondary-700 rounded-2xl overflow-hidden bg-white/60 dark:bg-secondary-800/40">
              {currentChannel ? (
                <ChatWindow currentUser={user} activeChannel={currentChannel} />
              ) : (
                <div className="h-full flex items-center justify-center text-secondary-500 dark:text-secondary-400 text-sm">
                  Create or select a channel to start chatting.
                </div>
              )}
            </div>
            {onOpenChat && (
              <button className="btn-ghost text-sm mt-3" onClick={onOpenChat}>
                Open full chat
              </button>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/60 dark:bg-black/30 backdrop-blur-sm pointer-events-none">
          <div className="card flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
            <span className="text-sm text-secondary-700 dark:text-secondary-200">Loading workspace…</span>
          </div>
        </div>
      )}
    </div>
  );
}
