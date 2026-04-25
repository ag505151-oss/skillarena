import Link from 'next/link';
import { Zap } from 'lucide-react';

const NAV_LINKS: { section: string; items: { label: string; href: string }[] }[] = [
  {
    section: 'Product',
    items: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Blog', href: '/blog' },
      { label: 'Docs', href: '/docs' },
    ],
  },
  {
    section: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Twitter', href: 'https://twitter.com' },
    ],
  },
  {
    section: 'Legal',
    items: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-background py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#534AB7]">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              SkillArena
            </Link>
            <p className="text-sm text-muted-foreground">The arena where engineers get hired.</p>
          </div>
          {NAV_LINKS.map((group) => (
            <div key={group.section}>
              <h4 className="mb-3 text-sm font-semibold">{group.section}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          © 2025 SkillArena. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
