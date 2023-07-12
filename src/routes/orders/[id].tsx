import { JSX, Show, type VoidComponent } from "solid-js";
import { useParams } from "solid-start";

import { searchItemsQuery, showOrderQuery } from "rpc/queries";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
import { typographyVariants } from "~/components/ui/typography";
import { cn } from "~/lib/utils";
import { createOrderItemMutation } from "~/server/api/mutations";

const Elem: VoidComponent<
  JSX.HTMLAttributes<HTMLDivElement> & {
    label: string;
    value: JSX.Element;
  }
> = (props) => {
  return (
    <Show when={props.value} fallback={<></>}>
      <div {...props} class={cn("flex flex-col", props.class, props.classList)}>
        <h3 class={typographyVariants({ variant: "large" })}>{props.label}</h3>
        {props.value}
      </div>
    </Show>
  );
};

const ShowOrderPage: VoidComponent = () => {
  const params = useParams();
  const itemQuery = showOrderQuery({
    id: params.id,
  });

  const searchItems = searchItemsQuery();
  const createMutation = createOrderItemMutation();

  return (
    <section class="container max-w-6xl">
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
              <Elem
                label="description"
                value={item().description}
                class="col-span-3"
              />
              <Elem
                label="Total"
                value={item().total.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              />
              <Elem label="User" value={item().user?.name} />
              <Elem label="Status" value={item().status} />
              <Elem label="Created" value={item().createdAt} />
            </div>

            <Separator orientation="horizontal" />

            <div class="pt-4">
              <h4
                class={cn(
                  typographyVariants({
                    variant: "large",
                  }),
                )}
              >
                Create new item
              </h4>
            </div>
          </>
        )}
      </Show>
    </section>
  );
};

export default ShowOrderPage;
