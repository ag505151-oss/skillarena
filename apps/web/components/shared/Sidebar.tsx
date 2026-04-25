import Link from 'next/link';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/admin', label: 'Admin' },
];

export function Sidebar(): JSX.Element {
  return (
    <aside className="w-64 border-r p-4">
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
