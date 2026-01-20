import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import TradeModal from './TradeModal';
import LiveChat from './LiveChat';
import NotificationListener from './NotificationListener';
import { 
  LayoutDashboard, 
  Activity, 
  History, 
  LineChart, 
  LogOut, 
  Copy,
  Trophy,
  Menu, 
  X,
  Settings,
  User,
  AlertCircle,
  Archive,
  Calendar,
  LifeBuoy,
  Target,
  BookOpen
} from 'lucide-react';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useSocket();
  const [systemAlert, setSystemAlert] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('trade_closed', (data) => {
      // Play notification sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio play failed (interaction required)', e));
    });
    
    socket.on('system_alert', (data) => {
      setSystemAlert(data);
    });

    return () => {
      socket.off('trade_closed');
      socket.off('system_alert');
    };
  }, [socket]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/trades', label: 'Open Trades', icon: Activity },
    { path: '/history', label: 'Trade History', icon: History },
    { path: '/archived', label: 'Archive', icon: Archive },
    { path: '/equity', label: 'Equity Curve', icon: LineChart },
    { path: '/copy-trading', label: 'Copy Trading', icon: Copy },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/reports/daily', label: 'Daily Reports', icon: Calendar },
    { path: '/strategy', label: 'Strategy', icon: Target },
    { path: '/journal', label: 'Journal', icon: BookOpen },
    { path: '/support', label: 'Support', icon: LifeBuoy },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h1 className="text-xl font-bold text-emerald-600 dark:text-emerald-500">IRCAMONEY</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500 dark:text-slate-400">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3 px-4 py-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-500 font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate text-slate-900 dark:text-white">{user?.username}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 truncate">Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">IRCAMONEY</h1>
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 dark:text-slate-400">
            <Menu size={24} />
          </button>
        </header>

        {/* System Alert Banner */}
        {systemAlert && (
          <div className={`p-4 ${systemAlert.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-blue-500/10 border-blue-500/50 text-blue-500'} border-b border-slate-200 dark:border-slate-800 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span className="font-medium">{systemAlert.message}</span>
            </div>
            <button onClick={() => setSystemAlert(null)} className="hover:opacity-75"><X size={18} /></button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Global Components */}
      <TradeModal />
      <LiveChat />
      <NotificationListener />
    </div>
  );
}