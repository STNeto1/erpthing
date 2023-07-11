import { For, JSX, Show, type VoidComponent } from "solid-js";
import { useParams } from "solid-start";

import { showItemQuery } from "rpc/queries";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { typographyVariants } from "~/components/ui/typography";

const Elem: VoidComponent<{
  label: string;
  value: JSX.Element;
}> = (props) => {
  return (
    <Show when={props.value} fallback={<></>}>
      <div class="flex flex-col">
        <h3 class={typographyVariants({ variant: "large" })}>{props.label}</h3>
        {props.value}
      </div>
    </Show>
  );
};

const ShowItemPage: VoidComponent = () => {
  const params = useParams();
  const itemQuery = showItemQuery({
    id: params.id,
  });

  return (
    <section class="container">
      <Show when={itemQuery.isLoading}>Loading...</Show>

      <Show when={itemQuery.error}>
        {(err) => (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{err().message}</AlertDescription>
          </Alert>
        )}
      </Show>

      <Show when={itemQuery?.data}>
        {(item) => (
          <>
            <div class="grid grid-cols-4 gap-y-10 py-10">
              <Elem label="Name" value={item().name} />
              <Elem label="Description" value={item().description} />
              <Elem
                label="Price"
                value={item().price.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              />
              <Elem label="Stock" value={item().stock.toString()} />
              <Elem label="User" value={item().user?.name} />

              <Elem
                label="Tags"
                value={
                  <>
                    <div class="flex items-center gap-1">
                      <For each={item().tags}>
                        {(tag) => (
                          <Badge variant={"secondary"}>{tag?.tag?.name}</Badge>
                        )}
                      </For>
                    </div>
                  </>
                }
              />
            </div>
          </>
        )}
      </Show>
    </section>
  );
};

export default ShowItemPage;
