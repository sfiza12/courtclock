import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, AlertTriangle, Search, BarChart2, Scale, LogOut } from 'lucide-react';

const Sidebar = ({ alertCount = 0 }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('courtclock_token');
    localStorage.removeItem('courtclock_user');
    navigate('/login');
  };

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Priority Queue', path: '/queue', icon: ListOrdered },
    { 
      name: '436A Alerts', 
      path: '/alerts', 
      icon: AlertTriangle,
      badge: alertCount > 0 ? alertCount : null
    },
    { name: 'Case Search', path: '/search', icon: Search },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  ];

  return (
    <div className="w-60 h-full bg-[#0F172A] flex flex-col flex-shrink-0 text-white shadow-xl z-20 relative">
      {/* Top Header */}
      <div className="pt-8 px-6 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white shrink-0">
            <Scale size={20} />
          </div>
          <div>
            <div className="font-semibold text-[17px] leading-tight">CourtClock</div>
            <div className="text-slate-400 text-[11px] mt-0.5">District & Sessions Court</div>
          </div>
        </div>
      </div>
      
      <div className="mx-6 border-b border-slate-800"></div>

      {/* Nav Links */}
      <nav className="flex-1 mt-8 px-3 flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) => 
              `flex items-center px-3 py-2.5 rounded-r-md transition-all duration-150 group ` +
              (isActive 
                ? 'text-white bg-slate-800 border-l-[3px] border-[#2563EB]' 
                : 'text-slate-400 border-l-[3px] border-transparent hover:text-slate-200 hover:bg-slate-800/50')
            }
          >
            {({ isActive }) => (
              <div className="flex items-center w-full relative">
                <div className="transition-transform duration-150 group-hover:translate-x-[2px] flex items-center w-full">
                  <link.icon size={18} className={`mr-3 ${isActive ? 'text-[#2563EB]' : 'text-slate-500'}`} />
                  <span className="text-[14px] font-medium">{link.name}</span>
                </div>
                {link.badge && (
                  <span className="absolute right-0 bg-[#DC2626] text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile */}
      <div className="mt-auto px-6 pb-7">
        <div className="border-t border-slate-800 pt-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300 shrink-0 border border-slate-600">
              JS
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-[13px] font-medium text-white truncate">Hon. Justice</div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate">Presiding Judge</div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
