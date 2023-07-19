import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import { BsThreeDots } from "solid-icons/bs";
import {
  createMemo,
  createSignal,
  For,
  JSX,
  Match,
  Show,
  Switch,
  type VoidComponent,
} from "solid-js";
import { useParams } from "solid-start";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { typographyVariants } from "~/components/ui/typography";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import {
  createOrderItemSchema,
  CreateOrderItemSchema,
  updateOrderItemSchema,
  UpdateOrderItemSchema,
} from "~/server/api/zod-schemas";

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
  const itemQuery = trpc.orders.showOrder.useQuery(() => ({
    id: params.id,
  }));
  const [updatingItem, setUpdatingItem] = createSignal<string | null>(null);

  const searchItems = trpc.items.searchItems.useQuery(() => ({}));

  const markOrderAsPaid = trpc.orders.updateOrderAsPaid.useMutation();
  const markOrderAsCancelled = trpc.orders.updateOrderAsCancelled.useMutation();
  const markOrderAsCompleted = trpc.orders.updateOrderAsCompleted.useMutation();

  const createOrderItem = trpc.orders.createOrderItem.useMutation();
  const updateOrderItem = trpc.orders.updateOrderItem.useMutation();
  const deleteOrderItem = trpc.orders.deleteOrderItem.useMutation();

  const validItems = createMemo(() => {
    if (!searchItems.data) return [];
    if (!itemQuery.data) return [];

    const itemIDs = itemQuery.data.items.map((item) => item.itemID);
    return searchItems.data.filter((item) => {
      return !itemIDs.includes(item.id);
    });
  });
  const showAdd = createMemo(() => {
    if (!validItems().length) return false;

    return true;
  });

  const updateMeta = createForm<UpdateOrderItemSchema>({
    initialValues: {},
    extend: validator({ schema: updateOrderItemSchema }),
    onSubmit: async (data) => {
      await updateOrderItem.mutateAsync(data);
      itemQuery.refetch();
      setUpdatingItem(null);
    },
  });
  const handleStartUpdate = (itemID: string | null) => {
    if (!itemID) return;

    const orderItem = itemQuery.data?.items.find(
      (item) => item.itemID === itemID,
    );
    if (!orderItem) return;

    updateMeta.setData("orderID", orderItem.orderID!);
    updateMeta.setData("itemID", itemID);
    updateMeta.setData("quantity", orderItem.quantity);

    setUpdatingItem(itemID);
  };

  const { form, errors, isSubmitting, reset, setData } =
    createForm<CreateOrderItemSchema>({
      initialValues: {
        itemID: "",
        quantity: 1,
        orderID: params.id,
      },
      extend: validator({ schema: createOrderItemSchema }),
      onSubmit: async (data) => {
        await createOrderItem.mutateAsync(data);
        reset();
        itemQuery.refetch();
      },
    });

  const handleDeleteItem = async (itemID: string | null) => {
    if (!itemID) return;

    await deleteOrderItem.mutateAsync({
      itemID,
      orderID: params.id,
    });
    itemQuery.refetch();
  };

  const isUpdatingStatus = createMemo(() => {
    return (
      markOrderAsPaid.isPending ||
      markOrderAsCancelled.isPending ||
      markOrderAsCompleted.isPending
    );
  });
  const handleUpdateStatus = async (
    orderID: string | null,
    status: "paid" | "cancelled" | "completed",
  ) => {
    if (!orderID) return;

    if (status === "paid") {
      await markOrderAsPaid.mutateAsync({
        orderID,
      });
    }

    if (status === "completed") {
      await markOrderAsCompleted.mutateAsync({
        orderID,
      });
    }

    if (status === "cancelled") {
      await markOrderAsCancelled.mutateAsync({
        orderID,
      });
    }

    itemQuery.refetch();
  };

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
              <Elem
                label="Options"
                value={
                  <div class="flex items-center gap-2 pt-1">
                    <Button
                      class={"h-6"}
                      disabled={
                        item().status !== "pending" || isUpdatingStatus()
                      }
                      variant={"secondary"}
                      onClick={() => handleUpdateStatus(item().id, "paid")}
                    >
                      Pay
                    </Button>
                    <Button
                      class={"h-6"}
                      disabled={item().status !== "paid" || isUpdatingStatus()}
                      variant={"secondary"}
                      onClick={() => handleUpdateStatus(item().id, "completed")}
                    >
                      Complete
                    </Button>
                    <Button
                      class={"h-6"}
                      disabled={
                        item().status !== "pending" || isUpdatingStatus()
                      }
                      variant={"secondary"}
                      onClick={() => handleUpdateStatus(item().id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  </div>
                }
              />
            </div>

            <Show
              when={
                markOrderAsPaid.error ||
                markOrderAsCancelled.error ||
                markOrderAsCompleted.error
              }
            >
              {(err) => (
                <Alert variant="destructive">
                  <AlertTitle>Error updating status</AlertTitle>
                  <AlertDescription>{err().message}</AlertDescription>
                </Alert>
              )}
            </Show>

            <Separator orientation="horizontal" />

            <div class="pt-4">
              <h4
                class={cn(
                  typographyVariants({
                    variant: "lead",
                  }),
                  "text-lg",
                )}
              >
                Items
              </h4>

              <Show when={deleteOrderItem.error || createOrderItem.error}>
                {(err) => (
                  <Alert variant="destructive" class="my-10">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{err().message}</AlertDescription>
                  </Alert>
                )}
              </Show>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>

                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>

                    <TableHead class="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <For each={itemQuery?.data?.items ?? []}>
                    {(elem) => (
                      <TableRow>
                        <TableCell class="w-[20%] font-medium">
                          {elem.item?.name}
                        </TableCell>
                        <TableCell class="w-[30%] font-medium">
                          {elem.item?.description}
                        </TableCell>

                        <TableCell class="w-[7.5%] font-medium">
                          {elem.quantity}
                        </TableCell>

                        <TableCell class="w-[7.5%] font-medium">
                          {elem.item?.price}
                        </TableCell>

                        <TableCell class="w-[5%] font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger class="flex items-center ">
                              <BsThreeDots class="h-5 w-5" />
                            </DropdownMenuTrigger>

                            <DropdownMenuPortal>
                              <DropdownMenuContent class="w-40">
                                <DropdownMenuItem
                                  class="py-0"
                                  onSelect={() =>
                                    handleStartUpdate(elem.itemID)
                                  }
                                >
                                  <DropdownMenuLabel>Update</DropdownMenuLabel>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  class="py-0"
                                  onSelect={() => handleDeleteItem(elem.itemID)}
                                >
                                  <DropdownMenuLabel>Delete</DropdownMenuLabel>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenuPortal>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )}
                  </For>
                </TableBody>
              </Table>

              <Switch>
                <Match when={updatingItem()}>
                  <h4
                    class={cn(
                      typographyVariants({
                        variant: "lead",
                      }),
                      "pt-10 text-lg",
                    )}
                  >
                    Updating item
                  </h4>

                  <form
                    ref={updateMeta.form}
                    class="flex flex-col items-end gap-4"
                  >
                    <Input
                      id="itemID"
                      name="itemID"
                      type="text"
                      placeholder="Item"
                      required
                      class="hidden"
                      value={updatingItem() ?? ""}
                    />

                    <Input
                      id="orderID"
                      name="orderID"
                      type="text"
                      placeholder="Item"
                      required
                      class="hidden"
                      value={params.id}
                    />

                    <div class="flex w-full items-center gap-2">
                      <FormItem class="w-full">
                        <FormLabel>Item</FormLabel>
                        <Input
                          type="text"
                          placeholder="Item"
                          required
                          class="w-full"
                          value={
                            searchItems.data?.find(
                              (f) => f.id === updatingItem(),
                            )?.name
                          }
                          readOnly
                        />
                        <Show when={updateMeta.errors().itemID}>
                          {(msg) => (
                            <FormMessage>{msg().join(", ")}</FormMessage>
                          )}
                        </Show>
                      </FormItem>

                      <FormItem class="w-full">
                        <FormLabel>Quantity</FormLabel>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          placeholder="Qty"
                          step={1}
                          min={1}
                          value={
                            itemQuery.data?.items.find(
                              (f) => f.itemID === updatingItem(),
                            )?.quantity ?? 10
                          }
                          required
                          class="w-full"
                          disabled={isSubmitting()}
                        />
                        <Show when={updateMeta.errors().quantity}>
                          {(msg) => (
                            <FormMessage>{msg().join(", ")}</FormMessage>
                          )}
                        </Show>
                      </FormItem>
                    </div>

                    <div class="flex items-center gap-4">
                      <Button
                        type="button"
                        class="w-40"
                        variant={"outline"}
                        onClick={() => setUpdatingItem(null)}
                      >
                        Reset
                      </Button>
                      <Button type="submit" class="w-40">
                        Update item
                      </Button>
                    </div>
                  </form>
                </Match>

                <Match when={!updatingItem() && !showAdd()}>
                  <Alert variant="default" class="mt-10">
                    <AlertTitle>Alert</AlertTitle>
                    <AlertDescription>No items to add</AlertDescription>
                  </Alert>
                </Match>

                <Match
                  when={
                    !updatingItem() &&
                    showAdd() &&
                    itemQuery.data?.status === "pending"
                  }
                >
                  <h4
                    class={cn(
                      typographyVariants({
                        variant: "lead",
                      }),
                      "pt-10 text-lg",
                    )}
                  >
                    Create new item
                  </h4>

                  <form ref={form} class="flex flex-col items-end gap-4">
                    <div class="flex w-full items-center gap-2">
                      <FormItem class="w-full">
                        <FormLabel>Item</FormLabel>
                        <Select
                          id="itemID"
                          name="itemID"
                          required
                          onChange={(val) => setData("itemID", val)}
                          options={
                            validItems()
                              .map((item) => item.id)
                              .filter(Boolean) as string[]
                          }
                          placeholder="Select an item"
                          itemComponent={(props) => (
                            <SelectItem item={props.item}>
                              {
                                validItems().find(
                                  (item) => item.id === props.item.key,
                                )?.name
                              }
                            </SelectItem>
                          )}
                        >
                          <SelectTrigger>
                            <SelectValue<string>>
                              {(state) =>
                                validItems().find(
                                  (item) => item.id === state.selectedOption(),
                                )?.name
                              }
                            </SelectValue>
                          </SelectTrigger>

                          <SelectContent />
                        </Select>
                        <Show when={errors().itemID}>
                          {(msg) => (
                            <FormMessage>{msg().join(", ")}</FormMessage>
                          )}
                        </Show>
                      </FormItem>

                      <FormItem class="w-full">
                        <FormLabel>Quantity</FormLabel>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          placeholder="Qty"
                          step={1}
                          min={1}
                          required
                          class="w-full"
                          disabled={isSubmitting()}
                        />
                        <Show when={errors().quantity}>
                          {(msg) => (
                            <FormMessage>{msg().join(", ")}</FormMessage>
                          )}
                        </Show>
                      </FormItem>
                    </div>
                    <Button type="submit" class="w-40">
                      Add item
                    </Button>
                  </form>
                </Match>
              </Switch>
            </div>
          </>
        )}
      </Show>
    </section>
  );
};

export default ShowOrderPage;
