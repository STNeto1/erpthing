import {
  createForm,
  reset,
  SubmitHandler,
  zodForm,
} from "@modular-forms/solid";
import { BsThreeDots } from "solid-icons/bs";
import { createSignal, For, Show, type VoidComponent } from "solid-js";
import { useNavigate } from "solid-start";

import {
  createItemMutation,
  deleteItemMutation,
  updateItemMutation,
} from "rpc/mutations";
import { searchItemsQuery, searchTagsQuery } from "rpc/queries";
import {
  CreateItemSchema,
  createItemSchema,
  UpdateItemSchema,
  updateTagSchema,
} from "rpc/zod-schemas";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { checkboxStyles } from "~/components/ui/checkbox";
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
import { Label } from "~/components/ui/label";
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
import { DItem, DItemsToTags, DUser } from "~/db/schema";

const CreateItemForm: VoidComponent<{ onCompleted: () => void }> = (props) => {
  const createItem = createItemMutation();
  const searchTags = searchTagsQuery();

  const [createTagForm, { Field, Form }] = createForm<CreateItemSchema>({
    validate: zodForm(createItemSchema),
    initialValues: {
      name: "",
      description: "",
      stock: 0,
      price: 0,
      tags: [],
    },
  });
  const handleCreateSubmit: SubmitHandler<CreateItemSchema> = async (data) => {
    await createItem.mutateAsync(data);

    reset(createTagForm, "name");
    reset(createTagForm, "description");
    reset(createTagForm, "stock");
    reset(createTagForm, "price");
    reset(createTagForm, "tags");

    props.onCompleted();
  };

  return (
    <div class="mx-auto flex w-full flex-col justify-center space-y-6">
      <h4 class={typographyVariants({ variant: "h4" })}>Create new item</h4>
      <Form
        onSubmit={handleCreateSubmit}
        class="flex w-full flex-col items-end gap-4"
      >
        <Field name="name">
          {(field, props) => (
            <FormItem class="w-full">
              <FormLabel>Name</FormLabel>
              <Input
                id="name"
                type="text"
                placeholder="Item 1"
                required
                {...props}
                value={field.value ?? ""}
                class="w-full"
              />
              <Show when={field?.error}>
                {(msg) => <FormMessage>{msg()}</FormMessage>}
              </Show>
            </FormItem>
          )}
        </Field>

        <Field name="description">
          {(field, props) => (
            <FormItem class="w-full">
              <FormLabel>Description</FormLabel>
              <Input
                id="description"
                type="text"
                placeholder="Some description"
                required
                {...props}
                value={field.value ?? ""}
                class="w-full"
              />
              <Show when={field?.error}>
                {(msg) => <FormMessage>{msg()}</FormMessage>}
              </Show>
            </FormItem>
          )}
        </Field>

        <Field name="stock" type="number">
          {(field, props) => (
            <FormItem class="w-full">
              <FormLabel>Stock</FormLabel>
              <Input
                id="stock"
                type="number"
                placeholder="Some description"
                required
                {...props}
                value={field.value ?? 0}
                class="w-full"
              />
              <Show when={field?.error}>
                {(msg) => <FormMessage>{msg()}</FormMessage>}
              </Show>
            </FormItem>
          )}
        </Field>

        <Field name="price" type="number">
          {(field, props) => (
            <FormItem class="w-full">
              <FormLabel>Price</FormLabel>
              <Input
                id="price"
                type="number"
                placeholder="Item price"
                min={0}
                step={0.01}
                required
                {...props}
                value={field.value ?? 0}
                class="w-full"
              />
              <Show when={field?.error}>
                {(msg) => <FormMessage>{msg()}</FormMessage>}
              </Show>
            </FormItem>
          )}
        </Field>

        <Field name="tags" type="string[]">
          {(field, props) => (
            <FormItem class="w-full">
              <FormLabel>Tags</FormLabel>
              <div class="grid grid-cols-4 gap-4 pt-1">
                <For each={searchTags.data ?? []}>
                  {(tag) => (
                    <div class="flex items-center gap-2">
                      <input
                        id={tag.id}
                        type="checkbox"
                        checked={field.value?.includes(tag.id)}
                        value={tag.id}
                        {...props}
                        class={checkboxStyles}
                      />
                      <Label>{tag.name}</Label>
                    </div>
                  )}
                </For>
              </div>

              <Show when={field?.error}>
                {(msg) => <FormMessage>{msg()}</FormMessage>}
              </Show>
            </FormItem>
          )}
        </Field>

        <Button type="submit" class="w-40" disabled={createItem.isPending}>
          Submit
        </Button>
      </Form>
    </div>
  );
};

type UpdateItem = DItem & { user: DUser; tags: DItemsToTags[] };

const UpdateItemForm: VoidComponent<{
  data: UpdateItem;
  onCompleted: () => void;
}> = (props) => {
  const updateItem = updateItemMutation();
  const searchTags = searchTagsQuery();

  const [_, { Form, Field }] = createForm<UpdateItemSchema>({
    validate: zodForm(updateTagSchema),
    initialValues: {
      id: props.data.id,
      name: props.data.name,
      description: props.data.description,
      stock: props.data.stock,
      price: props.data.price,
      tags: props.data.tags.map((t) => t.tagID).filter(Boolean) as string[],
    },
  });
  const handleUpdateSubmit: SubmitHandler<UpdateItemSchema> = async (data) => {
    await updateItem.mutateAsync(data);

    props.onCompleted();
  };

  return (
    <div class="mx-auto flex w-full flex-col justify-center space-y-6">
      <h4 class={typographyVariants({ variant: "h4" })}>Update existing tag</h4>

      <Form
        onSubmit={handleUpdateSubmit}
        class="flex w-full flex-col items-end gap-4"
      >
        <Field name="id">
          {(field, props) => (
            <FormItem class="hidden ">
              <Input
                id="id"
                type="text"
                required
                {...props}
                value={field.value ?? ""}
                class="w-full"
              />
            </FormItem>
          )}
        </Field>

        <Field name="name">
          {(field, props) => (
            <FormItem class="w-full">
              <FormLabel>Name</FormLabel>
              <Input
                id="name"
                type="text"
                placeholder="Tag 1"
                required
                {...props}
                value={field.value ?? ""}
                class="w-full"
              />
              <Show when={field?.error}>
                {(msg) => <FormMessage>{msg()}</FormMessage>}
              </Show>
            </FormItem>
          )}
        </Field>

        <Field name="description">
          {(field, props) => (
            <FormItem class="w-full">
              <FormLabel>Description</FormLabel>
              <Input
                id="description"
                type="text"
                placeholder="Some description"
                required
                {...props}
                value={field.value ?? ""}
                class="w-full"
              />
              <Show when={field?.error}>
                {(msg) => <FormMessage>{msg()}</FormMessage>}
              </Show>
            </FormItem>
          )}
        </Field>

        <Field name="stock" type="number">
          {(field, props) => (
            <FormItem class="w-full">
              <FormLabel>Stock</FormLabel>
              <Input
                id="stock"
                type="number"
                placeholder="Some description"
                required
                {...props}
                value={field.value ?? 0}
                class="w-full"
              />
              <Show when={field?.error}>
                {(msg) => <FormMessage>{msg()}</FormMessage>}
              </Show>
            </FormItem>
          )}
        </Field>

        <Field name="price" type="number">
          {(field, props) => (
            <FormItem class="w-full">
              <FormLabel>Price</FormLabel>
              <Input
                id="price"
                type="number"
                placeholder="Item price"
                min={0}
                step={0.01}
                required
                {...props}
                value={field.value ?? 0}
                class="w-full"
              />
              <Show when={field?.error}>
                {(msg) => <FormMessage>{msg()}</FormMessage>}
              </Show>
            </FormItem>
          )}
        </Field>

        <Field name="tags" type="string[]">
          {(field, props) => (
            <FormItem class="w-full">
              <FormLabel>Tags</FormLabel>
              <div class="grid grid-cols-4 gap-4 pt-1">
                <For each={searchTags.data ?? []}>
                  {(tag) => (
                    <div class="flex items-center gap-2">
                      <input
                        id={tag.id}
                        type="checkbox"
                        checked={field.value?.includes(tag.id)}
                        value={tag.id}
                        {...props}
                        class={checkboxStyles}
                      />
                      <Label>{tag.name}</Label>
                    </div>
                  )}
                </For>
              </div>

              <Show when={field?.error}>
                {(msg) => <FormMessage>{msg()}</FormMessage>}
              </Show>
            </FormItem>
          )}
        </Field>

        <Button type="submit" class="w-40" disabled={updateItem.isPending}>
          Submit
        </Button>
      </Form>
    </div>
  );
};

const ItemsIndexPage: VoidComponent = () => {
  const navigate = useNavigate();

  const [isUpdating, setIsUpdating] = createSignal<UpdateItem | null>(null);

  const searchItems = searchItemsQuery();
  const deleteItem = deleteItemMutation();

  const handleStartUpdate = (id: string) => {
    const elem = searchItems.data?.find((t) => t.id === id);
    if (!elem) return;

    setIsUpdating(elem);
  };

  const handleDelete = async (id: string) => {
    deleteItem.mutateAsync({ id });
    searchItems.refetch();
  };

  return (
    <section class="container flex max-w-7xl flex-col gap-8 py-10">
      <Show when={!!isUpdating()}>
        {(_) => (
          <>
            <Separator orientation={"horizontal"} />

            <UpdateItemForm
              data={isUpdating()!}
              onCompleted={() => {
                setIsUpdating(null);
                searchItems.refetch();
              }}
            />
          </>
        )}
      </Show>

      <Show when={!isUpdating()}>
        {(_) => (
          <>
            <Separator orientation={"horizontal"} />
            <CreateItemForm onCompleted={() => searchItems.refetch()} />
          </>
        )}
      </Show>

      <Separator orientation={"horizontal"} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>

            <TableHead>User</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>

            <TableHead class="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <For each={searchItems?.data ?? []}>
            {(elem) => (
              <TableRow>
                <TableCell class="w-[20%] font-medium">{elem.name}</TableCell>
                <TableCell class="w-[30%] font-medium">
                  {elem.description}
                </TableCell>

                <TableCell class="w-[12.5%] font-medium">
                  {elem.user.name}
                </TableCell>
                <TableCell class="w-[7.5%] font-medium">{elem.price}</TableCell>
                <TableCell class="w-[7.5%] font-medium">{elem.stock}</TableCell>
                <TableCell class="w-[5%] font-medium">
                  <DropdownMenu>
                    <DropdownMenuTrigger class="flex items-center ">
                      <BsThreeDots class="h-5 w-5" />
                    </DropdownMenuTrigger>

                    <DropdownMenuPortal>
                      <DropdownMenuContent class="w-40">
                        <DropdownMenuItem
                          class="py-0"
                          onSelect={() => navigate(`/items/${elem.id}`)}
                        >
                          <DropdownMenuLabel>Access</DropdownMenuLabel>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          class="py-0"
                          onSelect={() => handleStartUpdate(elem.id)}
                          disabled={deleteItem.isPending}
                        >
                          <DropdownMenuLabel>Edit</DropdownMenuLabel>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          class="py-0"
                          onSelect={() => handleDelete(elem.id)}
                          disabled={deleteItem.isPending}
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
      <Show when={deleteItem.error}>
        {(err) => (
          <Alert variant="destructive" class="w-full">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{err().message}</AlertDescription>
          </Alert>
        )}
      </Show>
    </section>
  );
};

export default ItemsIndexPage;
