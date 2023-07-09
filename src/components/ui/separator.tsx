import * as KCore from "@kobalte/core";
import { Component } from "solid-js";

import { cn } from "~/lib/utils";

export const Separator: Component<KCore.Separator.SeparatorRootProps> = (
  props,
) => {
  return (
    <KCore.Separator.Root
      {...props}
      class={cn(
        "shrink-0 bg-border",
        props.orientation === "horizontal"
          ? "h-[1px] w-full"
          : "h-full w-[1px]",
        props.class,
        props.classList,
      )}
    />
  );
};
