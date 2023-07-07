import { Match, Switch, type VoidComponent } from "solid-js";

import { userQuery } from "rpc/queries";

const Home: VoidComponent = () => {
  const user = userQuery();

  return (
    <>
      <section class="container">
        <Switch fallback={<div>Loading...</div>}>
          <Match when={user.isLoading}>
            <div>Loading...</div>
          </Match>

          <Match when={user.data}>
            <pre>
              <code>{JSON.stringify(user.data, null, 2)}</code>
            </pre>
          </Match>
        </Switch>
      </section>
    </>
  );
};

export default Home;
