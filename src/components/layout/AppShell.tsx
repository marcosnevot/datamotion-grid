import type { ReactNode } from "react";

type AppShellProps = {
  header: ReactNode;
  footer: ReactNode;
  sidePanel?: ReactNode;
  children: ReactNode;
};

export function AppShell({ header, footer, sidePanel, children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        {header}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto px-4 py-4">
          {children}
        </main>

        {sidePanel && (
          <aside className="hidden xl:block w-80 border-l border-slate-800 bg-slate-950/80 backdrop-blur-md">
            {sidePanel}
          </aside>
        )}
      </div>

      <footer className="border-t border-slate-800 bg-slate-950/80 backdrop-blur">
        {footer}
      </footer>
    </div>
  );
}
