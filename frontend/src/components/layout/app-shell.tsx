import Link from "next/link";
import { ReactNode } from "react";

type NavigationItem = {
  label: string;
  href: string;
  isActive?: boolean;
};

const navigation: NavigationItem[] = [
  { label: "Overview", href: "/", isActive: true },
  { label: "Client Intake", href: "/#intake" },
  { label: "Document Workspace", href: "/#workspace" },
  { label: "Reviews", href: "/#reviews" },
];

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="bg-surface text-ink flex min-h-screen flex-col">
      <header className="border-soft/80 bg-panel-strong/90 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent grid h-9 w-9 place-items-center rounded-lg font-semibold text-white">
              H
            </div>
            <div>
              <p className="text-ink-muted text-sm font-semibold tracking-[0.3em] uppercase">
                HNC Legal
              </p>
              <p className="text-ink text-lg font-semibold">AI Operations Console</p>
            </div>
          </div>
          <nav className="hidden items-center gap-2 sm:flex">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  item.isActive ? "bg-accent text-white shadow-sm" : "text-ink-muted hover:bg-panel"
                }`}
                aria-current={item.isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10 sm:py-12">
        {children}
      </main>

      <footer className="border-soft/70 text-ink-muted mx-auto w-full max-w-6xl border-t px-6 py-6 text-sm">
        <p>Prototype build for HNC Law Firm — confidential and for review only.</p>
      </footer>
    </div>
  );
}
