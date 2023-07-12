import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import { BsThreeDots } from "solid-icons/bs";
import {
  Accessor,
  createEffect,
  createSignal,
  For,
  Show,
  type VoidComponent,
} from "solid-js";
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
  updateItemSchema,
  UpdateItemSchema,
} from "rpc/zod-schemas";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
import { cn } from "~/lib/utils";

const CreateItemForm: VoidComponent<{
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
}> = (props) => {
  const createItem = createItemMutation();
  const searchTags = searchTagsQuery();

  const [selectedTags, setSelectedTags] = createSignal<string[]>([]);
  const handleCheckboxChange = (tag: string) => {
    if (selectedTags().includes(tag)) {
      setSelectedTags(selectedTags().filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags(), tag]);
    }
  };

  const { form, errors, reset } = createForm<CreateItemSchema>({
    extend: validator({ schema: createItemSchema }),
    onSubmit: async (data) => {
      await createItem.mutateAsync(data);

      reset();
      setSelectedTags([]);
      props.setOpen(false);
    },
  });

  return (
    <Dialog open={props.open()} onOpenChange={(v) => props.setOpen(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new item</DialogTitle>
        </DialogHeader>

        <form ref={form} class="flex w-full flex-col items-end gap-4">
          <FormItem class="w-full">
            <FormLabel>Name</FormLabel>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Item 1"
              required
              class="w-full"
            />
            <Show when={errors().name}>
              {(msg) => <FormMessage>{msg().join(", ")}</FormMessage>}
            </Show>
          </FormItem>

          <FormItem class="w-full">
            <FormLabel>Description</FormLabel>
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Some description"
              required
              class="w-full"
            />
            <Show when={errors().description}>
              {(msg) => <FormMessage>{msg().join(", ")}</FormMessage>}
            </Show>
          </FormItem>

          <FormItem class="w-full">
            <FormLabel>Stock</FormLabel>
            <Input
              id="stock"
              name="stock"
              type="number"
              placeholder="Some description"
              required
              class="w-full"
            />
            <Show when={errors().stock}>
              {(msg) => <FormMessage>{msg().join(", ")}</FormMessage>}
            </Show>
          </FormItem>

          <FormItem class="w-full">
            <FormLabel>Price</FormLabel>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="Item price"
              min={0}
              step={0.01}
              required
              class="w-full"
            />
            <Show when={errors().price}>
              {(msg) => <FormMessage>{msg().join(", ")}</FormMessage>}
            </Show>
          </FormItem>

          <FormItem class="w-full">
            <FormLabel>Tags</FormLabel>
            <div class="grid grid-cols-3 gap-4 pt-1">
              <For each={searchTags.data ?? []}>
                {(tag) => (
                  <div class="flex items-center gap-2">
                    <input
                      id={tag.id}
                      name="tags"
                      type="checkbox"
                      checked={selectedTags().includes(tag.id)}
                      onChange={() => handleCheckboxChange(tag.id)}
                      value={tag.id}
                    />
                    <Label>{tag.name}</Label>
                  </div>
                )}
              </For>
            </div>

            <Show when={errors().tags}>
              {(msg) => <FormMessage>{msg().join(", ")}</FormMessage>}
            </Show>
          </FormItem>

          <Button
            type="submit"
            class="mt-10 w-40"
            disabled={createItem.isPending}
          >
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

type UpdateItem = DItem & { user: DUser; tags: DItemsToTags[] };

const UpdateItemForm: VoidComponent<{
  data: UpdateItem;
  onCompleted: () => void;
}> = (props) => {
  const updateItem = updateItemMutation();
  const searchTags = searchTagsQuery();

  const [selectedTags, setSelectedTags] = createSignal<string[]>([]);
  const handleCheckboxChange = (tag: string) => {
    if (selectedTags().includes(tag)) {
      setSelectedTags(selectedTags().filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags(), tag]);
    }
  };

  const { form, errors, reset } = createForm<UpdateItemSchema>({
    initialValues: {
      id: props.data.id,
      name: props.data.name,
      description: props.data.description,
      stock: props.data.stock,
      price: props.data.price,
      tags: props.data.tags.map((t) => t.tagID).filter(Boolean) as string[],
    },
    extend: validator({ schema: updateItemSchema }),
    onSubmit: async (data) => {
      await updateItem.mutateAsync(data);

      reset();
      props.onCompleted();
    },
  });

  return (
    <Dialog open={!!props.data} onOpenChange={() => props.onCompleted()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update - {props.data.name}</DialogTitle>
        </DialogHeader>

        <form ref={form} class="flex w-full flex-col items-end gap-4">
          <FormItem class="w-full">
            <FormLabel>Name</FormLabel>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Tag 1"
              required
              class="w-full"
            />
            <Show when={errors().name}>
              {(msg) => <FormMessage>{msg().join(", ")}</FormMessage>}
            </Show>
          </FormItem>

          <FormItem class="w-full">
            <FormLabel>Description</FormLabel>
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Some description"
              required
              class="w-full"
            />
            <Show when={errors().description}>
              {(msg) => <FormMessage>{msg().join(", ")}</FormMessage>}
            </Show>
          </FormItem>

          <FormItem class="w-full">
            <FormLabel>Stock</FormLabel>
            <Input
              id="stock"
              name="stock"
              type="number"
              placeholder="Some description"
              required
              class="w-full"
            />
            <Show when={errors().stock}>
              {(msg) => <FormMessage>{msg().join(", ")}</FormMessage>}
            </Show>
          </FormItem>

          <FormItem class="w-full">
            <FormLabel>Price</FormLabel>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="Item price"
              min={0}
              step={0.01}
              required
              class="w-full"
            />
            <Show when={errors().price}>
              {(msg) => <FormMessage>{msg().join(", ")}</FormMessage>}
            </Show>
          </FormItem>

          <FormItem class="w-full">
            <FormLabel>Tags</FormLabel>
            <div class="grid grid-cols-3 gap-4 pt-1">
              <For each={searchTags.data ?? []}>
                {(tag) => (
                  <div class="flex items-center gap-2">
                    <input
                      id={tag.id}
                      name="tags"
                      type="checkbox"
                      checked={selectedTags().includes(tag.id)}
                      onChange={() => handleCheckboxChange(tag.id)}
                      value={tag.id}
                    />
                    <Label>{tag.name}</Label>
                  </div>
                )}
              </For>
            </div>

            <Show when={errors().tags}>
              {(msg) => <FormMessage>{msg().join(", ")}</FormMessage>}
            </Show>
          </FormItem>

          <Button type="submit" class="w-40" disabled={updateItem.isPending}>
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ItemsIndexPage: VoidComponent = () => {
  const navigate = useNavigate();

  const [openCreate, setOpenCreate] = createSignal(false);
  const [isUpdating, setIsUpdating] = createSignal<UpdateItem | null>(null);

  const searchItems = searchItemsQuery();
  const deleteItem = deleteItemMutation();

  const handleStartUpdate = (id: string) => {
    const elem = searchItems.data?.find((t) => t.id === id);
    if (!elem) return;

    setIsUpdating(elem);
  };

  const handleDelete = async (id: string) => {
    await deleteItem.mutateAsync({ id });
    searchItems.refetch();
  };

  createEffect(() => {
    if (!openCreate()) {
      searchItems.refetch();
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
          Items
        </h1>

        <Button
          variant={"outline"}
          disabled={openCreate()}
          onClick={() => setOpenCreate(true)}
        >
          Create
        </Button>
        <CreateItemForm open={openCreate} setOpen={setOpenCreate} />
      </div>

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

      <Show when={!!isUpdating()}>
        {(_) => (
          <UpdateItemForm
            data={isUpdating()!}
            onCompleted={() => {
              setIsUpdating(null);
              searchItems.refetch();
            }}
          />
        )}
      </Show>
    </section>
  );
};

export default ItemsIndexPage;
