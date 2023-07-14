import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import { BsThreeDots } from "solid-icons/bs";
import {
  createEffect,
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

import {
  createOrderItemMutation,
  deleteOrderItemMutation,
  updateOrderItemMutation,
} from "rpc/mutations";
import { searchItemsQuery, showOrderQuery } from "rpc/queries";
import {
  CreateOrderItemSchema,
  createOrderItemSchema,
  updateOrderItemSchema,
  UpdateOrderItemSchema,
} from "rpc/zod-schemas";

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
import { cn } from "~/lib/utils";

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
  const [updatingItem, setUpdatingItem] = createSignal<string | null>(null);

  const searchItems = searchItemsQuery();
  const createOrderItem = createOrderItemMutation();
  const updateOrderItem = updateOrderItemMutation();
  const deleteOrderItem = deleteOrderItemMutation();

  const validItems = createMemo(() => {
    if (!searchItems.data) return [];
    if (!itemQuery.data) return [];

    const itemIDs = itemQuery.data.items.map((item) => item.itemID);
    return searchItems.data.filter((item) => {
      return !itemIDs.includes(item.id);
    });
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
                      value={updatingItem()}
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

                <Match when={!updatingItem()}>
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
