import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import { For, JSX, Show, type VoidComponent } from "solid-js";
import { useParams } from "solid-start";

import { searchItemsQuery, showOrderQuery } from "rpc/queries";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
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
import { createOrderItemMutation } from "~/server/api/mutations";
import {
  CreateOrderItemSchema,
  createOrderItemSchema,
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
  const itemQuery = showOrderQuery({
    id: params.id,
  });

  const searchItems = searchItemsQuery();
  const createMutation = createOrderItemMutation();

  const { form, errors, isSubmitting, reset, setData } =
    createForm<CreateOrderItemSchema>({
      initialValues: {
        itemID: "",
        quantity: 1,
        orderID: params.id,
      },
      extend: validator({ schema: createOrderItemSchema }),
      onSubmit: async (data) => {
        await createMutation.mutateAsync(data);
        reset();
        itemQuery.refetch();
        // props.setOpen(false);
      },
    });

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>

                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>

                    {/* <TableHead class="text-right"></TableHead> */}
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
                      </TableRow>
                    )}
                  </For>
                </TableBody>
              </Table>

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
                        searchItems.data
                          ?.map((item) => item.id)
                          .filter(Boolean) as string[]
                      }
                      placeholder="Select an item"
                      itemComponent={(props) => (
                        <SelectItem item={props.item}>
                          {
                            searchItems.data?.find(
                              (item) => item.id === props.item.rawValue,
                            )?.description
                          }
                        </SelectItem>
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue<string>>
                          {(state) =>
                            searchItems.data?.find(
                              (item) => item.id === state.selectedOption(),
                            )?.description
                          }
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent />
                    </Select>
                    <Show when={errors().itemID}>
                      {(msg) => <FormMessage>{msg().join(", ")}</FormMessage>}
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
                      {(msg) => <FormMessage>{msg().join(", ")}</FormMessage>}
                    </Show>
                  </FormItem>
                </div>
                <Button type="submit" class="w-40">
                  Add item
                </Button>
              </form>
            </div>
          </>
        )}
      </Show>
    </section>
  );
};

export default ShowOrderPage;
