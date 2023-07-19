import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import { A } from "@solidjs/router";
import {
  Accessor,
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
  Suspense,
  type VoidComponent,
} from "solid-js";
import { createStore } from "solid-js/store";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { typographyVariants } from "~/components/ui/typography";
import { orders } from "~/db/schema";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import {
  createOrderSchema,
  CreateOrderSchema,
  createTagSchema,
  SearchOrdersSchema,
} from "~/server/api/zod-schemas";

const CreateOrder: VoidComponent<{
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
}> = (props) => {
  const createOrder = trpc.orders.createOrder.useMutation();

  const { form, errors, reset } = createForm<CreateOrderSchema>({
    extend: validator({ schema: createOrderSchema }),
    onSubmit: async (data) => {
      await createOrder.mutateAsync(data);

      reset();
      props.setOpen(false);
    },
  });

  return (
    <Dialog open={props.open()} onOpenChange={(v) => props.setOpen(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new order</DialogTitle>
        </DialogHeader>

        <form ref={form} class="flex w-full flex-col items-end gap-4">
          <FormItem class="w-full">
            <FormLabel>Description</FormLabel>
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Order 1"
              required
              class="w-full"
            />
            <Show when={errors().description}>
              {(msg) => <FormMessage>{msg().join(", ")}</FormMessage>}
            </Show>
          </FormItem>

          <Button type="submit" class="" disabled={createOrder.isPending}>
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const OrdersIndexPage: VoidComponent = () => {
  const [openCreate, setOpenCreate] = createSignal(false);

  const [searchStore, setSearchStore] = createStore<SearchOrdersSchema>({
    description: undefined,
    user: undefined,
    status: undefined,
  });

  const usersQuery = trpc.users.searchUsers.useQuery();
  const searchOrders = trpc.orders.searchOrders.useQuery(() => searchStore);

  const usersMemo = createMemo(() => {
    const map = new Map<string, string>();

    if (!usersQuery.data) return map;

    usersQuery.data.forEach((user) => {
      map.set(user.id, user.name);
    });

    return map;
  });

  createEffect(() => {
    if (!openCreate()) {
      searchOrders.refetch();
    }
  });

  return (
    <section class="container flex max-w-7xl flex-col gap-8 py-10">
      <div class="flex items-center justify-between">
        <h1
          class={cn(
            typographyVariants({
              variant: "h2",
            }),
          )}
        >
          Orders
        </h1>

        <Button
          variant={"outline"}
          disabled={openCreate()}
          onClick={() => setOpenCreate(true)}
        >
          Create Order
        </Button>
        <CreateOrder open={openCreate} setOpen={setOpenCreate} />
      </div>

      <Suspense fallback={<p>Loading search...</p>}>
        <div class="flex flex-col gap-2">
          <h4
            class={cn(
              typographyVariants({
                variant: "small",
              }),
            )}
          >
            Search
          </h4>
          <div class="flex gap-2">
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Order 1"
              class="w-full"
              value={searchStore.description}
              onInput={(e) => setSearchStore("description", e.target.value)}
            />

            <Select
              class="w-full"
              // value={searchStore.user}
              // onChange={(val) => setSearchStore("user", val)}
              options={Array.from(usersMemo().keys())}
              placeholder="Select an user"
              itemComponent={(props) => (
                <SelectItem item={props.item}>
                  {usersMemo().get(props.item.key)}
                </SelectItem>
              )}
            >
              <SelectTrigger>
                <SelectValue<string>>
                  {(state) => usersMemo().get(state.selectedOption())}
                </SelectValue>
              </SelectTrigger>

              <SelectContent />
            </Select>

            <Select
              class="w-full"
              value={searchStore.status}
              onChange={(val) => setSearchStore("status", val)}
              options={orders.status.enumValues}
              placeholder="Select an item"
              itemComponent={(props) => (
                <SelectItem item={props.item}>{props.item.key}</SelectItem>
              )}
            >
              <SelectTrigger>
                <SelectValue<string>>
                  {(state) => state.selectedOption()}
                </SelectValue>
              </SelectTrigger>

              <SelectContent />
            </Select>
          </div>
        </div>
      </Suspense>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <Suspense>
            <For each={searchOrders?.data ?? []}>
              {(elem) => (
                <TableRow>
                  <TableCell class="w-[20%] font-medium">
                    {elem.description}
                  </TableCell>
                  <TableCell class="w-[20%]">{elem.user?.name}</TableCell>
                  <TableCell class="">
                    {elem.total.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </TableCell>
                  <TableCell class="">{elem.status}</TableCell>
                  <TableCell class="">{elem.createdAt}</TableCell>
                  <TableCell class="">
                    <A href={`/orders/${elem.id}`}>View</A>
                  </TableCell>
                </TableRow>
              )}
            </For>
          </Suspense>
        </TableBody>
      </Table>
    </section>
  );
};

export default OrdersIndexPage;
