import {
  createForm,
  reset,
  setValue,
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { typographyVariants } from "~/components/ui/typography";
import {
  CreateTagSchema,
  createTagSchema,
  UpdateTagSchema,
} from "~/server/api/zod-schemas";

const TagsIndexPage: VoidComponent = () => {
  const [isUpdating, setIsUpdating] = createSignal(false);

  const searchTags = searchTagsQuery();

  const createTag = createTagMutation();
  const updateTag = updateTagMutation();
  const deleteTag = deleteTagMutation();

  const [createTagForm, Create$] = createForm<CreateTagSchema>({
    validate: zodForm(createTagSchema),
  });
  const handleCreateSubmit: SubmitHandler<CreateTagSchema> = async (data) => {
    await createTag.mutateAsync(data);
    searchTags.refetch();
    reset(createTagForm, "name");
  };

  const [updateTagForm, Update$] = createForm<UpdateTagSchema>({
    validate: zodForm(createTagSchema),
  });
  const handleUpdateSubmit: SubmitHandler<UpdateTagSchema> = async (data) => {
    await updateTag.mutateAsync(data);
    searchTags.refetch();

    reset(updateTagForm, "name");
    setIsUpdating(false);
  };
  const handleStartUpdate = (id: string) => {
    const tag = searchTags.data?.find((t) => t.id === id);
    if (!tag) return;

    setIsUpdating(true);
    setValue(updateTagForm, "id", tag.id);
    setValue(updateTagForm, "name", tag.name);
  };

  const handleDelete = async (id: string) => {
    deleteTag.mutateAsync({ id });
    searchTags.refetch();
  };

  return (
    <section class="container flex max-w-4xl flex-col gap-8 py-10">
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
        <TableCaption>A list of the recent tags.</TableCaption>
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
        <Separator orientation={"horizontal"} />

        <div class="mx-auto flex w-full flex-col justify-center space-y-6">
          <h4 class={typographyVariants({ variant: "h4" })}>
            Update existing tag
          </h4>

          <Update$.Form
            onSubmit={handleUpdateSubmit}
            class="flex w-full flex-col items-end gap-4"
          >
            <Update$.Field name="id">
              {(field, props) => (
                <FormItem class="hidden">
                  <FormLabel>ID</FormLabel>
                  <Input
                    id="id"
                    type="text"
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
            </Update$.Field>

            <Update$.Field name="name">
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
            </Update$.Field>

            <Button type="submit" class="w-40" disabled={updateTag.isPending}>
              Submit
            </Button>
          </Update$.Form>
        </div>
      </Show>

      <Separator orientation={"horizontal"} />

      <div class="mx-auto flex w-full flex-col justify-center space-y-6">
        <h4 class={typographyVariants({ variant: "h4" })}>Create new tag</h4>

        <Create$.Form
          onSubmit={handleCreateSubmit}
          class="flex w-full flex-col items-end gap-4"
        >
          <Create$.Field name="name">
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
          </Create$.Field>

          <Button type="submit" class="w-40" disabled={createTag.isPending}>
            Submit
          </Button>
        </Create$.Form>
      </div>
    </section>
  );
};

export default TagsIndexPage;
