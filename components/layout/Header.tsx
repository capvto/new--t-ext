'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Edit3, Notebook, Settings, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const links = [
  { href: '/', label: 'Write', icon: Edit3 },
  { href: '/archive', label: 'Notes', icon: Notebook },
  { href: '/settings', label: 'Settings', icon: Settings }
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="text-topbar">
      <Link href="/" className="font-ui text-base font-bold text-[var(--color-text)] relative z-10">
        (t)ext
      </Link>
      <nav className="flex items-center h-full">
        {links.map((link) => {
          const Icon = link.icon;
          const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              // We remove the static "active" class and apply the text color dynamically
              className={`nav-link relative ${active ? '!text-[var(--color-text)]' : ''}`}
              aria-label={link.label}
              title={link.label}
            >
              {active && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-x-0 top-0 bottom-[-2px] bg-[var(--color-nav-active-bg)] border-b-2 border-[var(--color-primary-c)] z-0"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 35,
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-[8px]">
                <Icon size={18} strokeWidth={1.5} />
                <span className="hidden sm:inline">{link.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
