import { type VoidComponent } from "solid-js";
import { Outlet } from "solid-start";

import { MainNav } from "~/components/main-nav";
import { UserNav } from "~/components/user-nav";

const TagsLayout: VoidComponent = () => {
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

      <Outlet />
    </main>
  );
};

export default TagsLayout;
