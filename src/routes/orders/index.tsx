import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import { A } from "@solidjs/router";
import {
  Accessor,
  createEffect,
  createSignal,
  For,
  Show,
  type VoidComponent,
} from "solid-js";
import { createStore } from "solid-js/store";

import { createOrderMutation } from "rpc/mutations";
import { searchOrdersQuery, searchUsersQuery } from "rpc/queries";
import {
  CreateOrderSchema,
  createTagSchema,
  SearchOrdersSchema,
} from "rpc/zod-schemas";

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
import { cn } from "~/lib/utils";

const CreateOrder: VoidComponent<{
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
}> = (props) => {
  const createOrder = createOrderMutation();

  const { form, errors, reset } = createForm<CreateOrderSchema>({
    extend: validator({ schema: createTagSchema }),
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

  const usersQuery = searchUsersQuery();
  const searchOrders = searchOrdersQuery(
    () => searchStore,
    () => ({
      suspense: true,
    }),
  );

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
            value={searchStore.user}
            onChange={(val) => setSearchStore("user", val)}
            options={
              (usersQuery?.data ?? [])
                .map((item) => item.id)
                .filter(Boolean) as string[]
            }
            placeholder="Select an user"
            itemComponent={(props) => (
              <SelectItem item={props.item}>
                {
                  (usersQuery?.data ?? []).find(
                    (item) => item.id === props.item.key,
                  )?.name
                }
              </SelectItem>
            )}
          >
            <SelectTrigger>
              <SelectValue<string>>
                {(state) =>
                  (usersQuery?.data ?? []).find(
                    (item) => item.id === state.selectedOption(),
                  )?.name
                }
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
        </TableBody>
      </Table>
    </section>
  );
};

export default OrdersIndexPage;
