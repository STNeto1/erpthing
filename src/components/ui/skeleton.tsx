import { JSX, VoidComponent } from "solid-js";

import { cn } from "~/lib/utils";

export const Skeleton: VoidComponent<JSX.HTMLAttributes<HTMLDivElement>> = (
  props,
) => {
  return (
    <div
      {...props}
      class={cn(
        "animate-pulse rounded-md bg-primary/10",
        props.class,
        props.classList,
      )}
    />
  );
};
