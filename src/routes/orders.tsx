import { VoidComponent } from "solid-js";
import { ErrorBoundary, Outlet } from "solid-start";

import { MainNav } from "~/components/main-nav";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { UserNav } from "~/components/user-nav";

const OrdersLayout: VoidComponent = () => {
  return (
    <main class="min-h-screen">
      <div class="border-b">
        <div class="flex h-16 items-center px-4">
          <MainNav class="mx-6" />
          <div class="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>

      <ErrorBoundary
        fallback={(err: Error) => (
          <div class="container py-10">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{err.message}</AlertDescription>
            </Alert>
          </div>
        )}
      >
        <Outlet />
      </ErrorBoundary>
    </main>
  );
};

export default OrdersLayout;
