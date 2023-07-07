import { Component, JSX } from "solid-js";

import { cn } from "~/lib/utils";

export const FormItem: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props,
) => {
  return (
    <div {...props} class={cn("space-y-2", props.class, props.classList)} />
  );
};

export const FormLabel: Component<
  JSX.HTMLAttributes<HTMLLabelElement> & { error?: boolean }
> = (props) => {
  return (
    <label
      {...props}
      class={cn(
        props.error && "text-destructive",
        props.class,
        props.classList,
      )}
    />
  );
};

export const FormDescription: Component<
  JSX.HTMLAttributes<HTMLParagraphElement>
> = (props) => {
  return (
    <p
      {...props}
      class={cn(
        "text-[0.8rem] text-muted-foreground",
        props.class,
        props.classList,
      )}
    />
  );
};

export const FormMessage: Component<
  JSX.HTMLAttributes<HTMLParagraphElement>
> = (props) => {
  return (
    <p
      {...props}
      class={cn(
        "text-[0.8rem] font-medium text-destructive",
        props.class,
        props.classList,
      )}
    >
      {props.children}
    </p>
  );
};
