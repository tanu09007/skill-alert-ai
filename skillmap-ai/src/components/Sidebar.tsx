'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  LayoutDashboard,
  Play,
  ClipboardList,
  TrendingUp,
  Briefcase,
  Wrench,
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
        <div className="streak">🔥 7 day streak</div>
        <div className="user-info">You • Nexes AI</div>
      </div>
    </aside>
  );
}
