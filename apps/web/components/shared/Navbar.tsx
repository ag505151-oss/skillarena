'use client';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Bell, Moon, Sun, Menu, X, ChevronDown, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#534AB7]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span>SkillArena</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {session ? (
            <>
              <Link href="/dashboard" className="hover:text-[#534AB7] transition-colors">Dashboard</Link>
              <Link href="/tests" className="hover:text-[#534AB7] transition-colors">Tests</Link>
              <Link href="/hackathons" className="hover:text-[#534AB7] transition-colors">Hackathons</Link>
              <Link href="/interviews" className="hover:text-[#534AB7] transition-colors">Interviews</Link>
            </>
          ) : (
            <>
              <Link href="/#features" className="hover:text-[#534AB7] transition-colors">Features</Link>
              <Link href="/pricing" className="hover:text-[#534AB7] transition-colors">Pricing</Link>
              <Link href="/blog" className="hover:text-[#534AB7] transition-colors">Blog</Link>
            </>
          )}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {mounted ? (theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Moon className="h-4 w-4" />}
          </button>

          {session ? (
            <>
              <Link href="/notifications" className="relative rounded-lg p-2 hover:bg-accent transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#E24B4A]" />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#534AB7] text-white text-xs font-bold">
                    {initials}
                  </div>
                  <ChevronDown className="h-3 w-3" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border bg-card shadow-lg py-1 z-50">
                    {[
                      { label: 'Profile',  href: '/profile' },
                      { label: 'Settings', href: '/settings' },
                      { label: 'Billing',  href: '/billing' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="my-1 border-t" />
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button variant="purple" size="sm" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
          {session ? (
            <>
              {['/dashboard', '/tests', '/hackathons', '/interviews'].map((href) => (
                <Link key={href} href={href} className="block py-2 text-sm font-medium capitalize" onClick={() => setMobileOpen(false)}>
                  {href.replace('/', '')}
                </Link>
              ))}
              <button onClick={() => signOut({ callbackUrl: '/' })} className="block py-2 text-sm text-destructive">Log out</button>
            </>
          ) : (
            <>
              <Link href="/pricing" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Pricing</Link>
              <Link href="/login" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Log in</Link>
              <Button variant="purple" size="sm" asChild className="w-full">
                <Link href="/signup" onClick={() => setMobileOpen(false)}>Get started</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
