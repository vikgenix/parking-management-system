import * as React from "react";
import {
  Outlet,
  createRootRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { isAuthenticated } from "../lib/auth";

import "../styles.css";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>

      {/* Development Tooling */}
      <TanStackDevtools
        config={{ position: "bottom-right" }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}

/** Guards all routes except /login — redirects to /login if no token. */
function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isPublicPage = currentPath === "/login" || currentPath === "/signup";

  React.useEffect(() => {
    if (!isPublicPage && !isAuthenticated()) {
      navigate({ to: "/login" });
    }
  }, [currentPath, isPublicPage, navigate]);

  // Public pages (login/signup): render without shell
  if (isPublicPage) return <>{children}</>;

  // Unauthenticated on protected routes: render nothing while redirecting
  if (!isAuthenticated()) return null;

  // Authenticated: render full shell
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
