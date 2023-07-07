import { A } from "@solidjs/router";
import { User } from "lucia";
import { Show, type VoidComponent } from "solid-js";
import { FormError } from "solid-start";
import { createServerAction$, redirect } from "solid-start/server";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button, buttonVariants } from "~/components/ui/button";
import { FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { auth } from "~/auth/lucia.server";
import { checkEmailInUsage } from "~/db/core";
import { cn } from "~/lib/utils";
import { zodAction } from "~/lib/zod-action";

const signUpSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

const SignUpPage: VoidComponent = () => {
  const [signUp, { Form }] = createServerAction$(
    async (formData: FormData, { request }) => {
      const actionResult = zodAction(signUpSchema, formData);

      if (!actionResult.success) {
        throw new FormError("Invalid input", {
          fields: actionResult.fields,
          fieldErrors: actionResult.fieldErrors,
        });
      }

      if (await checkEmailInUsage(actionResult.data.email)) {
        throw new FormError("Email already in use", {
          fields: {
            name: actionResult.data.name,
            email: actionResult.data.email,
          },
          fieldErrors: {},
        });
      }

      const user: User = await auth.createUser({
        key: {
          providerId: "email",
          providerUserId: actionResult.data.email,
          password: actionResult.data.password,
        },
        attributes: {
          name: actionResult.data.name,
          email: actionResult.data.email,
        },
      });

      const session = await auth.createSession({
        userId: user.userId,
        attributes: {},
      });

      const headers = new Headers();
      const sessionCookie = auth.createSessionCookie(session);
      headers.set("Set-Cookie", sessionCookie.serialize());

      return redirect("/", { headers });
    },
  );

  return (
    <div class="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <A
        href="/auth/sign-in"
        class={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8",
        )}
      >
        Sign in
      </A>
      <div class="hidden h-full bg-muted lg:block" />
      <div class="lg:p-8">
        <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div class="flex flex-col space-y-2 text-center">
            <h1 class="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p class="text-sm text-muted-foreground">
              Enter your information below to create your account
            </p>
          </div>

          {!!signUp?.error?.formError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{signUp?.error?.formError}</AlertDescription>
            </Alert>
          )}

          <div class={cn("grid gap-6")}>
            <Form class="w-full space-y-4">
              <FormItem>
                <FormLabel>Name</FormLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                />
                <Show when={signUp?.error?.fieldErrors?.name}>
                  {(msg) => <FormMessage>{msg()}</FormMessage>}
                </Show>
              </FormItem>

              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@doe.com"
                />
                <Show when={signUp?.error?.fieldErrors?.email}>
                  {(msg) => <FormMessage>{msg()}</FormMessage>}
                </Show>
              </FormItem>

              <FormItem>
                <Label>Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Your password"
                />
                <Show when={signUp?.error?.fieldErrors?.password}>
                  {(msg) => <FormMessage>{msg()}</FormMessage>}
                </Show>
              </FormItem>

              <Button type="submit" class="w-full" disabled={signUp.pending}>
                Submit
              </Button>
            </Form>
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t" />
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" type="button" disabled>
              Github
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
