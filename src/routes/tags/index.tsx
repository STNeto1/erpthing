import {
  createForm,
  reset,
  SubmitHandler,
  zodForm,
} from "@modular-forms/solid";
import { For, Match, Show, Switch, type VoidComponent } from "solid-js";

import { createTagMutation } from "rpc/mutations";
import { searchTagsQuery } from "rpc/queries";

import { Button } from "~/components/ui/button";
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
import { CreateTagSchema, createTagSchema } from "~/server/api/zod-schemas";

const TagsIndexPage: VoidComponent = () => {
  const searchTags = searchTagsQuery();
  const createTag = createTagMutation();

  const [createTagForm, { Form, Field }] = createForm<CreateTagSchema>({
    validate: zodForm(createTagSchema),
  });
  const handleSubmit: SubmitHandler<CreateTagSchema> = async (data) => {
    await createTag.mutateAsync(data);
    searchTags.refetch();
    reset(createTagForm, "name");
  };

  return (
    <section class="container flex max-w-4xl flex-col gap-8 py-10">
      <Switch fallback={<div>Loading...</div>}>
        <Match when={searchTags.isLoading}>
          <div>Loading...</div>
        </Match>

        <Match when={searchTags.data}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead class="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <For each={searchTags.data}>
                {(tag) => (
                  <TableRow>
                    <TableCell class="font-medium">{tag.name}</TableCell>
                    <TableCell>X</TableCell>
                  </TableRow>
                )}
              </For>
            </TableBody>
            <TableCaption>A list of the recent tags.</TableCaption>
          </Table>
        </Match>
      </Switch>

      <Separator orientation={"horizontal"} />

      <div class="mx-auto flex w-full flex-col justify-center space-y-6">
        <h4 class={typographyVariants({ variant: "h4" })}>Create new tag</h4>

        <Form onSubmit={handleSubmit} class="flex w-full items-end gap-8">
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
    </section>
  );
};

export default TagsIndexPage;
