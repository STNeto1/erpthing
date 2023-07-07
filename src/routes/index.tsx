import { Match, Switch, type VoidComponent } from "solid-js";

import { helloQuery } from "rpc/queries";

const Home: VoidComponent = () => {
  const hello = helloQuery(() => ({
    name: "from pRPC",
  }));

  return (
    <>
      <h1>ERP Thing</h1>

      <Switch fallback={<div>Loading...</div>}>
        <Match when={hello.isLoading}>
          <div>Loading...</div>
        </Match>

        <Match when={hello.data}>
          <p class="text-lg text-gray-400">{hello.data}</p>
        </Match>
      </Switch>
    </>
  );
};

export default Home;
