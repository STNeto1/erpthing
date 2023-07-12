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

import {
  createTagMutation,
  deleteTagMutation,
  updateTagMutation,
} from "rpc/mutations";
import { searchTagsQuery } from "rpc/queries";
import {
  CreateTagSchema,
  createTagSchema,
  UpdateTagSchema,
} from "rpc/zod-schemas";

import { MainNav } from "~/components/main-nav";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { typographyVariants } from "~/components/ui/typography";
import { UserNav } from "~/components/user-nav";
import { DTag } from "~/db/schema";
import { cn } from "~/lib/utils";

const CreateTagForm: VoidComponent<{
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
}> = (props) => {
  const createTag = createTagMutation();

  const { form, errors, isSubmitting, reset } = createForm<CreateTagSchema>({
    extend: validator({ schema: createTagSchema }),
    onSubmit: async (data) => {
      await createTag.mutateAsync(data);

      reset();
      props.setOpen(false);
    },
  });

  return (
    <Dialog open={props.open()} onOpenChange={(v) => props.setOpen(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new tag</DialogTitle>
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
              disabled={createTag.isPending || isSubmitting()}
            />
            <Show when={errors().name}>
              {(msg) => <FormMessage>{msg().join(", ")}</FormMessage>}
            </Show>
          </FormItem>

          <Button
            type="submit"
            disabled={createTag.isPending || isSubmitting()}
          >
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const UpdateTagForm: VoidComponent<{
  data: DTag;
  close: () => void;
}> = (props) => {
  const updateTag = updateTagMutation();

  const { form, errors, reset } = createForm<UpdateTagSchema>({
    initialValues: {
      id: props.data.id,
      name: props.data.name,
    },
    extend: validator({ schema: createTagSchema }),
    onSubmit: async (data) => {
      await updateTag.mutateAsync(data);

      reset();
      props.close();
    },
  });

  return (
    <Dialog open={!!props.data} onOpenChange={() => props.close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update tag - {props.data.name}</DialogTitle>
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

          <Button type="submit" class="w-40" disabled={updateTag.isPending}>
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const TagsLayout: VoidComponent = () => {
  const [openCreate, setOpenCreate] = createSignal(false);
  const [isUpdating, setIsUpdating] = createSignal<DTag | null>(null);

  const searchTags = searchTagsQuery();
  const deleteTag = deleteTagMutation();

  const handleStartUpdate = (id: string) => {
    const tag = searchTags.data?.find((t) => t.id === id);
    if (!tag) return;

    setIsUpdating(tag);
  };

  const handleDelete = async (id: string) => {
    deleteTag.mutateAsync({ id });
    searchTags.refetch();
  };

  createEffect(() => {
    if (!openCreate()) {
      searchTags.refetch();
    }
  });

  return (
    <main class="min-h-screen">
      <div class="border-b">
        <div class="flex h-16 items-center px-4">
          <MainNav class="mx-6" />
          <div class="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>

      <section class="container flex max-w-5xl flex-col gap-8 py-10">
        <div class="flex items-center justify-between">
          <h1
            class={cn(
              typographyVariants({
                variant: "h2",
              }),
            )}
          >
            Tags
          </h1>

          <Button
            variant={"outline"}
            disabled={openCreate()}
            onClick={() => setOpenCreate(true)}
          >
            Create Tag
          </Button>
          <CreateTagForm open={openCreate} setOpen={setOpenCreate} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead class="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <For each={searchTags?.data ?? []}>
              {(tag) => (
                <TableRow>
                  <TableCell class="w-3/4 font-medium">{tag.name}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger class="flex items-center ">
                        <BsThreeDots class="h-5 w-5" />
                      </DropdownMenuTrigger>

                      <DropdownMenuPortal>
                        <DropdownMenuContent class="w-40">
                          <DropdownMenuItem
                            class="py-0"
                            onSelect={() => handleStartUpdate(tag.id)}
                            disabled={deleteTag.isPending}
                          >
                            <DropdownMenuLabel>Edit</DropdownMenuLabel>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            class="py-0"
                            onSelect={() => handleDelete(tag.id)}
                            disabled={deleteTag.isPending}
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
        <Show when={deleteTag.error}>
          {(err) => (
            <Alert variant="destructive" class="w-full">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{err().message}</AlertDescription>
            </Alert>
          )}
        </Show>

        <Show when={isUpdating()}>
          {(tag) => (
            <UpdateTagForm
              data={tag()}
              close={() => {
                setIsUpdating(null);
                searchTags.refetch();
              }}
            />
          )}
        </Show>
      </section>
    </main>
  );
};

export default TagsLayout;
