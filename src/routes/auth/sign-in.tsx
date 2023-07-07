import { A } from "@solidjs/router";
import { LuciaError } from "lucia";
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
import { cn } from "~/lib/utils";
import { zodAction } from "~/lib/zod-action";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const SignInPage: VoidComponent = () => {
  const [signIn, { Form }] = createServerAction$(
    async (formData: FormData, { request }) => {
      const actionResult = zodAction(signInSchema, formData);

      if (!actionResult.success) {
        throw new FormError("Invalid input", {
          fields: actionResult.fields,
          fieldErrors: actionResult.fieldErrors,
        });
      }

      try {
        const user = await auth.useKey(
          "email",
          actionResult.data.email,
          actionResult.data.password,
        );
        const session = await auth.createSession({
          userId: user.userId,
          attributes: {},
        });

        const headers = new Headers();
        const sessionCookie = auth.createSessionCookie(session);
        headers.set("Set-Cookie", sessionCookie.serialize());

        return redirect("/", { headers });
      } catch (error) {
        console.log({ error });
        const errorMessage =
          error instanceof LuciaError &&
          (error.message === "AUTH_INVALID_KEY_ID" ||
            error.message === "AUTH_INVALID_PASSWORD")
            ? "Invalid credentials"
            : "An unknown error occurred";

        throw new FormError(errorMessage, {
          fields: actionResult.data,
          fieldErrors: {},
        });
      }
    },
  );

  return (
    <div class="container flex h-screen w-screen flex-col items-center justify-center">
      <A
        href="/"
        class={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8",
        )}
      >
        <>Back</>
      </A>
      <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div class="flex flex-col space-y-2 text-center">
          <h1 class="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p class="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>

        {!!signIn?.error?.formError && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{signIn?.error?.formError}</AlertDescription>
          </Alert>
        )}

        <div class={cn("grid gap-6")}>
          <Form class="w-full space-y-4">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@doe.com"
              />
              <Show when={signIn?.error?.fieldErrors?.email}>
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
              <Show when={signIn?.error?.fieldErrors?.password}>
                {(msg) => <FormMessage>{msg()}</FormMessage>}
              </Show>
            </FormItem>

            <Button type="submit" class="w-full" disabled={signIn.pending}>
              Submit
            </Button>
          </Form>
        </div>

        <p class="px-8 text-center text-sm text-muted-foreground">
          <A
            href="/auth/sign-up"
            class="hover:text-brand underline underline-offset-4"
          >
            Don&apos;t have an account? Sign Up
          </A>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
