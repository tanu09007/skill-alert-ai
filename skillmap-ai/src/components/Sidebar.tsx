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
        <div className="streak">🔥 12 day streak</div>
        <div className="user-info">You • Nexes AI</div>
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
