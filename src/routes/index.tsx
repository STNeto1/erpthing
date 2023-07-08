import { type VoidComponent } from "solid-js";

import { MainNav } from "~/components/main-nav";
import { UserNav } from "~/components/user-nav";
import { userQuery } from "~/server/api/queries";

const Home: VoidComponent = () => {
  const user = userQuery();

  return (
    <>
      <div class="border-b">
        <div class="flex h-16 items-center px-4">
          <MainNav class="mx-6" />
          <div class="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      <section class="container">
        {/* <Switch fallback={<div>Loading...</div>}>
          <Match when={user.isLoading}>
            <div>Loading...</div>
          </Match>

          <Match when={user.data}>
            <pre>
              <code>{JSON.stringify(user.data, null, 2)}</code>
            </pre>
          </Match>
        </Switch> */}
      </section>
    </>
  );
};

export default Home;
