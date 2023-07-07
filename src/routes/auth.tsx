import { type VoidComponent } from "solid-js";
import { Outlet } from "solid-start";

const AuthLayout: VoidComponent = () => {
  return (
    <main class="min-h-screen">
      <Outlet />
    </main>
  );
};

export default AuthLayout;
