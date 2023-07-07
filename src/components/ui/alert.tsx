import { cva, type VariantProps } from "class-variance-authority";
import { Component, JSX } from "solid-js";

import { cn } from "~/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&:has(svg)]:pl-11 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Alert: Component<
  JSX.ButtonHTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
> = (props) => {
  return (
    <div
      role="alert"
      {...props}
      class={cn(
        alertVariants({ variant: props.variant }),
        props.class,
        props.classList,
      )}
    />
  );
};
export const AlertTitle: Component<JSX.HTMLAttributes<HTMLHeadingElement>> = (
  props,
) => {
  return (
    <h5
      {...props}
      class={cn(
        "mb-1 font-medium leading-none tracking-tight",
        props.class,
        props.classList,
      )}
    />
  );
};

export const AlertDescription: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props,
) => {
  return (
    <div
      {...props}
      class={cn("text-sm [&_p]:leading-relaxed", props.class, props.classList)}
    />
  );
};
