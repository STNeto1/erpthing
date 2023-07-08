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
    <section class="container">
      <Switch fallback={<div>Loading...</div>}>
        <Match when={searchTags.isLoading}>
          <div>Loading...</div>
        </Match>

        <Match when={searchTags.data}>
          <ul>
            <For each={searchTags.data}>{(tag) => <li>{tag.name}</li>}</For>
          </ul>
        </Match>
      </Switch>

      <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Form onSubmit={handleSubmit} class="w-full space-y-4">
          <Field name="name">
            {(field, props) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tag 1"
                  {...props}
                  value={field.value ?? ""}
                />
                <Show when={field.error}>
                  {(msg) => <FormMessage>{msg()}</FormMessage>}
                </Show>
              </FormItem>
            )}
          </Field>

          <Button type="submit" class="w-full" disabled={createTag.isPending}>
            Submit
          </Button>
        </Form>
      </div>
    </section>
  );
};

export default TagsIndexPage;
