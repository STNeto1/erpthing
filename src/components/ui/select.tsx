import { Select as KSelect } from "@kobalte/core";
import { AiOutlineCheck } from "solid-icons/ai";
import { FaSolidChevronDown } from "solid-icons/fa";
import { Component } from "solid-js";

import { cn } from "~/lib/utils";

export const Select = KSelect.Root;

export const SelectValue = KSelect.Value;

export const SelectTrigger: Component<KSelect.SelectTriggerProps> = (props) => (
  <KSelect.Trigger
    {...props}
    class={cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      props.class,
      props.classList,
    )}
  >
    {props.children}
    <KSelect.Icon>
      <FaSolidChevronDown class="h-4 w-4 opacity-50" />
    </KSelect.Icon>
  </KSelect.Trigger>
);

export const SelectContent: Component<KSelect.SelectContentProps> = (props) => (
  <KSelect.Portal>
    <KSelect.Content
      class={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        props.class,
        props.classList,
      )}
      {...props}
    >
      <KSelect.Listbox />
    </KSelect.Content>
  </KSelect.Portal>
);

export const SelectLabel: Component<KSelect.SelectLabelProps> = (props) => (
  <KSelect.Label
    class={cn(
      "px-2 py-1.5 text-sm font-semibold",
      props.class,
      props.classList,
    )}
    {...props}
  />
);

export const SelectItem: Component<KSelect.SelectItemProps> = (props) => (
  <KSelect.Item
    class={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      props.class,
      props.classList,
    )}
    {...props}
  >
    <span class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <KSelect.ItemIndicator>
        <AiOutlineCheck class="h-4 w-4" />
      </KSelect.ItemIndicator>
    </span>

    <KSelect.ItemLabel>{props.children}</KSelect.ItemLabel>
  </KSelect.Item>
);

// export const SelectSeparator: Component<unknown> = (props) => (
//   <KSelect.Separator
//     ref={ref}
//     class={cn("-mx-1 my-1 h-px bg-muted", className)}
//     {...props}
//   />
// )
