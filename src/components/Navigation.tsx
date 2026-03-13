import React from 'react';
import { 
  LayoutGrid, 
  Table as TableIcon, 
  Users, 
  FileText, 
  Settings,
  TrendingUp,
  LogOut,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';

import { UserRole } from '../types';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  theme: 'dark' | 'light';
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick, theme, collapsed }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
        active 
          ? (theme === 'dark' ? 'bg-[#00E676] text-black shadow-[0_0_20px_rgba(0,230,118,0.3)]' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20') 
          : (theme === 'dark' ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100')
      }`}
    >
      <div className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
        {icon}
      </div>
      {!collapsed && (
        <span className={`text-sm font-bold tracking-tight ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
          {label}
        </span>
      )}
      {active && (
        <motion.div 
          layoutId="activeNav"
          className={`absolute left-0 w-1 h-6 rounded-r-full ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
          style={{ left: -4 }}
        />
      )}
    </button>
  );
};

interface NavigationProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  theme: 'dark' | 'light';
  userRole: UserRole;
}

export const Sidebar: React.FC<NavigationProps> = ({ activeModule, setActiveModule, theme, userRole }) => {
  const isManager = userRole === UserRole.MANAGER || userRole === UserRole.DIRECTOR;

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 ${theme === 'dark' ? 'bg-zinc-950 border-white/5' : 'bg-white border-zinc-200'} border-r z-50 hidden lg:flex flex-col p-6`}>
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-white' : 'bg-zinc-900'}`}>
          <TrendingUp className={theme === 'dark' ? 'text-black' : 'text-white'} />
        </div>
        <div>
          <h1 className={`text-xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>FORGE</h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Industrial CRM</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem 
          icon={<LayoutGrid className="w-5 h-5" />} 
          label="Dashboard" 
          active={activeModule === 'dashboard'} 
          onClick={() => setActiveModule('dashboard')} 
          theme={theme} 
        />
        <NavItem 
          icon={<TableIcon className="w-5 h-5" />} 
          label="Forecast" 
          active={activeModule === 'forecast'} 
          onClick={() => setActiveModule('forecast')} 
          theme={theme} 
        />
        <NavItem 
          icon={<DollarSign className="w-5 h-5" />} 
          label="Budget" 
          active={activeModule === 'budget'} 
          onClick={() => setActiveModule('budget')} 
          theme={theme} 
        />
        <NavItem 
          icon={<Users className="w-5 h-5" />} 
          label="Clientes" 
          active={activeModule === 'customers'} 
          onClick={() => setActiveModule('customers')} 
          theme={theme} 
        />
        {isManager && (
          <>
            <NavItem 
              icon={<FileText className="w-5 h-5" />} 
              label="Relatórios" 
              active={activeModule === 'reports'} 
              onClick={() => setActiveModule('reports')} 
              theme={theme} 
            />
            <NavItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Configurações" 
              active={activeModule === 'settings'} 
              onClick={() => setActiveModule('settings')} 
              theme={theme} 
            />
          </>
        )}
      </nav>

      <div className="pt-6 border-t border-white/5">
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all`}>
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-bold">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export const BottomNav: React.FC<NavigationProps> = ({ activeModule, setActiveModule, theme, userRole }) => {
  const isManager = userRole === UserRole.MANAGER || userRole === UserRole.DIRECTOR;

  return (
    <nav className={`fixed bottom-0 left-0 right-0 h-20 ${theme === 'dark' ? 'bg-zinc-950/80 border-white/5' : 'bg-white/80 border-zinc-200'} border-t backdrop-blur-xl z-50 flex lg:hidden items-center justify-around px-4 pb-4`}>
      <button 
        onClick={() => setActiveModule('dashboard')}
        className={`flex flex-col items-center gap-1 ${activeModule === 'dashboard' ? (theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600') : 'text-zinc-500'}`}
      >
        <LayoutGrid className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase">Dash</span>
      </button>
      <button 
        onClick={() => setActiveModule('forecast')}
        className={`flex flex-col items-center gap-1 ${activeModule === 'forecast' ? (theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600') : 'text-zinc-500'}`}
      >
        <TableIcon className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase">Forecast</span>
      </button>
      <button 
        onClick={() => setActiveModule('budget')}
        className={`flex flex-col items-center gap-1 ${activeModule === 'budget' ? (theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600') : 'text-zinc-500'}`}
      >
        <DollarSign className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase">Budget</span>
      </button>
      <button 
        onClick={() => setActiveModule('customers')}
        className={`flex flex-col items-center gap-1 ${activeModule === 'customers' ? (theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600') : 'text-zinc-500'}`}
      >
        <Users className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase">Clientes</span>
      </button>
      {isManager && (
        <button 
          onClick={() => setActiveModule('reports')}
          className={`flex flex-col items-center gap-1 ${activeModule === 'reports' ? (theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600') : 'text-zinc-500'}`}
        >
          <FileText className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Relatórios</span>
        </button>
      )}
    </nav>
  );
};
