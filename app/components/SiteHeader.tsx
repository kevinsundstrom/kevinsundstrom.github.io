import MobileNav from './MobileNav';

// Shared site header — `active` is the pathname of the current page.
export default function SiteHeader({ active = '/' }: { active?: string }) {
  const cls = (href: string) => (href === active ? 'active' : undefined);

  return (
    <header>
      <a href="/" className="wordmark">Kevin Sundstrom</a>
      <nav>
        <a href="/" className={cls('/')}>Home</a>
        <a href="/changelog" className={cls('/changelog')}>Changelog</a>
        <a href="/mdinterface" className={cls('/mdinterface')}>mdinterface</a>
        <a href="/grocery" className={cls('/grocery')}>Grocery</a>
        <a href="https://synapse.kevinsundstrom.com">Synapse ↗</a>
        <a href="mailto:kevsundstrom@gmail.com">Contact</a>
      </nav>
      <MobileNav active={active} />
    </header>
  );
}
