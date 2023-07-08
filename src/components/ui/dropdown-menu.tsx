import * as KCore from "@kobalte/core";
import { AiOutlineCheck } from "solid-icons/ai";
import { BiRegularRadioCircle } from "solid-icons/bi";
import { FaSolidChevronRight } from "solid-icons/fa";
import { Component, JSX } from "solid-js";

import { cn } from "~/lib/utils";

export const DropdownMenu = KCore.DropdownMenu.Root;

export const DropdownMenuTrigger = KCore.DropdownMenu.Trigger;

export const DropdownMenuGroup = KCore.DropdownMenu.Group;

export const DropdownMenuPortal = KCore.DropdownMenu.Portal;

export const DropdownMenuSub = KCore.DropdownMenu.Sub;

export const DropdownMenuRadioGroup = KCore.DropdownMenu.RadioGroup;

export const DropdownMenuSubTrigger: Component<
  KCore.DropdownMenu.DropdownMenuSubTriggerProps & { inset?: boolean }
> = (props) => {
  return (
    <KCore.DropdownMenu.SubTrigger
      {...props}
      class={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
        props.inset && "pl-8",
        props.class,
        props.classList,
      )}
    >
      {props.children}
      <FaSolidChevronRight class="ml-auto h-4 w-4" />
    </KCore.DropdownMenu.SubTrigger>
  );
};

export const DropdownMenuSubContent: Component<
  KCore.DropdownMenu.DropdownMenuSubContentProps
> = (props) => {
  return (
    <KCore.DropdownMenu.SubContent
      {...props}
      class={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        props.class,
        props.classList,
      )}
    >
      {props.children}
    </KCore.DropdownMenu.SubContent>
  );
};

export const DropdownMenuContent: Component<
  KCore.DropdownMenu.DropdownMenuContentProps
> = (props) => {
  return (
    <KCore.DropdownMenu.Portal>
      <KCore.DropdownMenu.Content
        {...props}
        class={cn(
          "z-50 min-w-[6rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          props.class,
          props.classList,
        )}
      />
    </KCore.DropdownMenu.Portal>
  );
};

export const DropdownMenuItem: Component<
  KCore.DropdownMenu.DropdownMenuItemProps & { inset?: boolean }
> = (props) => {
  return (
    <KCore.DropdownMenu.Item
      {...props}
      class={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-4 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        props.class,
        props.classList,
      )}
    />
  );
};

export const DropdownMenuCheckboxItem: Component<
  KCore.DropdownMenu.DropdownMenuCheckboxItemProps
> = (props) => {
  return (
    <KCore.DropdownMenu.CheckboxItem
      {...props}
      class={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        props.class,
        props.classList,
      )}
    >
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <KCore.DropdownMenu.ItemIndicator>
          <AiOutlineCheck class="h-4 w-4" />
        </KCore.DropdownMenu.ItemIndicator>
      </span>
      {props.children}
    </KCore.DropdownMenu.CheckboxItem>
  );
};

export const DropdownMenuRadioItem: Component<
  KCore.DropdownMenu.DropdownMenuRadioItemProps
> = (props) => {
  return (
    <KCore.DropdownMenu.RadioItem
      {...props}
      class={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        props.class,
        props.classList,
      )}
    >
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <KCore.DropdownMenu.ItemIndicator>
          <BiRegularRadioCircle class="h-2 w-2 fill-current" />
        </KCore.DropdownMenu.ItemIndicator>
      </span>
    </KCore.DropdownMenu.RadioItem>
  );
};

export const DropdownMenuLabel: Component<
  KCore.DropdownMenu.DropdownMenuItemProps & { inset?: boolean }
> = (props) => {
  return (
    <KCore.DropdownMenu.ItemLabel
      {...props}
      class={cn("py-1.5 text-sm font-semibold", props.class, props.classList)}
    />
  );
};

export const DropdownMenuSeparator: Component<
  KCore.DropdownMenu.DropdownMenuSeparatorProps
> = (props) => {
  return (
    <KCore.DropdownMenu.Separator
      {...props}
      class={cn("-mx-1 my-1 h-px bg-muted", props.class, props.classList)}
    />
  );
};

export const DropdownMenuShortcut: Component<
  JSX.HTMLAttributes<HTMLSpanElement>
> = (props) => {
  return (
    <span
      {...props}
      class={cn(
        "ml-auto text-xs tracking-widest opacity-60",
        props.class,
        props.classList,
      )}
    />
  );
};
