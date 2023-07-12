import {
  createForm,
  reset,
  SubmitHandler,
  zodForm,
} from "@modular-forms/solid";
import { A } from "@solidjs/router";
import {
  Accessor,
  createEffect,
  createSignal,
  For,
  Show,
  type VoidComponent,
} from "solid-js";

import { createOrderMutation } from "rpc/mutations";
import { searchOrdersQuery } from "rpc/queries";
import { CreateOrderSchema, createOrderSchema } from "rpc/zod-schemas";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { typographyVariants } from "~/components/ui/typography";
import { cn } from "~/lib/utils";

const CreateOrder: VoidComponent<{
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
}> = (props) => {
  const createOrder = createOrderMutation();

  const [createOrderForm, { Field, Form }] = createForm<CreateOrderSchema>({
    validate: zodForm(createOrderSchema),
  });
  const handleCreateSubmit: SubmitHandler<CreateOrderSchema> = async (data) => {
    await createOrder.mutateAsync(data);
    reset(createOrderForm, "description");
    props.setOpen(false);
  };

  return (
    <Dialog open={props.open()} onOpenChange={(v) => props.setOpen(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new order</DialogTitle>
        </DialogHeader>

        <Form
          onSubmit={handleCreateSubmit}
          class="flex w-full flex-col items-end gap-4"
        >
          <Field name="description">
            {(field, props) => (
              <FormItem class="w-full">
                <FormLabel>Description</FormLabel>
                <Input
                  id="description"
                  type="text"
                  placeholder="Order 1"
                  required
                  {...props}
                  value={field.value ?? ""}
                  class="w-full"
                />
                <Show when={field.error}>
                  {(msg) => <FormMessage>{msg()}</FormMessage>}
                </Show>
              </FormItem>
            )}
          </Field>

          <Button type="submit" class="" disabled={createOrder.isPending}>
            Submit
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const OrdersIndexPage: VoidComponent = () => {
  const [openCreate, setOpenCreate] = createSignal(false);
  const searchOrders = searchOrdersQuery();

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
