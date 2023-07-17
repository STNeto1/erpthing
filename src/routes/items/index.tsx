import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import { BsThreeDots } from "solid-icons/bs";
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
import { useNavigate } from "solid-start";

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
import { DItem, DItemsToTags, DUser } from "~/db/schema";
import { trpc } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import {
  createItemSchema,
  CreateItemSchema,
  SearchItemsSchema,
  updateItemSchema,
  UpdateItemSchema,
} from "~/server/api/zod-schemas";

const CreateItemForm: VoidComponent<{
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
}> = (props) => {
  const context = trpc.useContext();

  const createItem = trpc.items.createItem.useMutation();
  const searchTags = trpc.tags.searchTags.useQuery();

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
      context.items.invalidate();
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
  const context = trpc.useContext();

  const updateItem = trpc.items.updateItem.useMutation();
  const searchTags = trpc.tags.searchTags.useQuery();

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
      context.items.invalidate();
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

  const [searchStore, setSearchStore] = createStore<SearchItemsSchema>({
    description: undefined,
    user: undefined,
  });

  const usersQuery = trpc.users.searchUsers.useQuery();
  const searchItems = trpc.items.searchItems.useQuery(() => ({
    description: searchStore.description,
    user: searchStore.user,
  }));

  const deleteItem = trpc.items.deleteItem.useMutation();

  const handleStartUpdate = (id: string) => {
    const elem = searchItems.data?.find((t) => t.id === id);
    if (!elem) return;

    setIsUpdating(elem);
  };

  const handleDelete = async (id: string) => {
    await deleteItem.mutateAsync({ id });
    searchItems.refetch();
  };

  const usersMemo = createMemo(() => {
    const map = new Map<string, string>();

    if (!usersQuery.data) return map;

    usersQuery.data.forEach((user) => {
      map.set(user.id, user.name);
    });

    return map;
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
              placeholder="Item 1"
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
          </div>
        </div>
      </Suspense>

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
          <Suspense fallback={<p>Loading items...</p>}>
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
                  <TableCell class="w-[7.5%] font-medium">
                    {elem.price}
                  </TableCell>
                  <TableCell class="w-[7.5%] font-medium">
                    {elem.stock}
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
          </Suspense>
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
