import { Component, JSX } from "solid-js";

import { cn } from "~/lib/utils";

export const Card: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => (
  <div
    {...props}
    class={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      props.class,
      props.classList,
    )}
  />
);

export const CardHeader: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props,
) => (
  <div
    {...props}
    class={cn("flex flex-col space-y-1.5 p-6", props.class, props.classList)}
  />
);

export const CardTitle: Component<JSX.HTMLAttributes<HTMLHeadingElement>> = (
  props,
) => (
  <h3
    {...props}
    class={cn(
      "font-semibold leading-none tracking-tight",
      props.class,
      props.classList,
    )}
  />
);

export const CardDescription: Component<
  JSX.HTMLAttributes<HTMLParagraphElement>
> = (props) => (
  <p
    {...props}
    class={cn("text-sm text-muted-foreground", props.class, props.classList)}
  />
);

export const CardContent: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props,
) => <div {...props} class={cn("p-6 pt-0", props.class, props.classList)} />;

export const CardFooter: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props,
) => (
  <div
    {...props}
    class={cn(" flex items-center p-6 pt-0", props.class, props.classList)}
  />
);
