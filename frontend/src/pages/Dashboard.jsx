import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatWindow from '../features/chat/ChatWindow';
import TaskBoard from '../features/tasks/TaskBoard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');

  useEffect(() => {
    // 1. Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (!user) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 font-bold text-xl tracking-wider border-b border-slate-700">
          TeamOS 🚀
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('chats')}
            className={`w-full text-left p-2 rounded hover:bg-slate-800 ${activeTab === 'chats' ? 'bg-indigo-600' : ''}`}
          >
            💬 Chats
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`w-full text-left p-2 rounded hover:bg-slate-800 ${activeTab === 'tasks' ? 'bg-indigo-600' : ''}`}
          >
            📝 Tasks
          </button>
          <button className="w-full text-left p-2 rounded hover:bg-slate-800 text-slate-400 cursor-not-allowed">
            📂 Docs (Coming Soon)
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="mb-4 text-sm text-slate-400">
            Logged in as: <span className="text-white font-bold">{user.username}</span>
          </div>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm w-full text-left">
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 h-full overflow-hidden">
        {/* Render Chat if active */}
        {activeTab === 'chats' && (
          <div className="h-full">
            <ChatWindow currentUser={user} />
          </div>
        )}

        {/* Render Tasks if active */}
        {activeTab === 'tasks' && (
          <div className="h-full">
            <TaskBoard currentUser={user} />
          </div>
        )}
      </main>
    </div>
  );
}
