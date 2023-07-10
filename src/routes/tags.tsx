import {
  createForm,
  reset,
  SubmitHandler,
  zodForm,
} from "@modular-forms/solid";
import { BsThreeDots } from "solid-icons/bs";
import { createSignal, For, Show, type VoidComponent } from "solid-js";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
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
import { UserNav } from "~/components/user-nav";
import { DTag } from "~/db/schema";

const CreateTagForm: VoidComponent<{ onCompleted: () => void }> = (props) => {
  const createTag = createTagMutation();

  const [createTagForm, { Field, Form }] = createForm<CreateTagSchema>({
    validate: zodForm(createTagSchema),
  });
  const handleCreateSubmit: SubmitHandler<CreateTagSchema> = async (data) => {
    await createTag.mutateAsync(data);
    reset(createTagForm, "name");

    props.onCompleted();
  };

  return (
    <div class="mx-auto flex w-full flex-col justify-center space-y-6">
      <h4 class={typographyVariants({ variant: "h4" })}>Create new tag</h4>
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
                placeholder="Tag 1"
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

        <Button type="submit" class="w-40" disabled={createTag.isPending}>
          Submit
        </Button>
      </Form>
    </div>
  );
};

const UpdateTagForm: VoidComponent<{
  data: DTag;
  onCompleted: () => void;
}> = (props) => {
  const updateTag = updateTagMutation();

  const [updateTagForm, { Form, Field }] = createForm<UpdateTagSchema>({
    validate: zodForm(createTagSchema),
    initialValues: {
      id: props.data.id,
      name: props.data.name,
    },
  });
  const handleUpdateSubmit: SubmitHandler<UpdateTagSchema> = async (data) => {
    await updateTag.mutateAsync(data);
    reset(updateTagForm, "name");

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
              <Show when={field.error}>
                {(msg) => <FormMessage>{msg()}</FormMessage>}
              </Show>
            </FormItem>
          )}
        </Field>

        <Button type="submit" class="w-40" disabled={updateTag.isPending}>
          Submit
        </Button>
      </Form>
    </div>
  );
};

const TagsLayout: VoidComponent = () => {
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
            <>
              <Separator orientation={"horizontal"} />

              <UpdateTagForm
                data={tag()}
                onCompleted={() => {
                  setIsUpdating(null);
                  searchTags.refetch();
                }}
              />
            </>
          )}
        </Show>

        <Separator orientation={"horizontal"} />

        <CreateTagForm onCompleted={() => searchTags.refetch()} />
      </section>
    </main>
  );
};

export default TagsLayout;
