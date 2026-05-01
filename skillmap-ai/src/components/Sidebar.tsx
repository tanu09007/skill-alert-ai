'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  User,
  LayoutDashboard,
  Play,
  ClipboardList,
  TrendingUp,
  Briefcase,
  Wrench,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/pathway', label: 'Roadmap', icon: TrendingUp },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learning-loop', label: 'Learn Today', icon: Play },
  { href: '/assessment', label: 'Assessment', icon: ClipboardList },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/tools', label: 'Tools', icon: Wrench },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <h2>Nexes</h2>
        <p>SkillAlert AI Intelligence</p>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={isActive ? 'active' : ''}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* New N Logo & User Info moved above the streak */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <span className="text-white font-black text-sm">N</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-(--text-primary)">Nexes AI</span>
            <span className="text-[10px] text-(--text-muted) uppercase tracking-widest font-bold">Pro Member</span>
          </div>
        </div>

        <div className="streak">🔥 12 day streak</div>
        
        <button 
          onClick={handleLogout}
          className="mt-4 w-full flex items-center gap-2 text-[10px] font-black text-rose-500/60 hover:text-rose-500 transition-all uppercase tracking-widest pt-4 border-t border-white/5"
        >
          <LogOut size={12} />
          Logout Session
        </button>
      </div>
    </aside>
  );
}
