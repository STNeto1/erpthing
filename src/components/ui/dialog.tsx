import { Dialog as DialogPrimitive } from "@kobalte/core";
import { VsClose } from "solid-icons/vs";
import { Component, JSX } from "solid-js";

import { cn } from "~/lib/utils";

export const Dialog = DialogPrimitive.Root;

export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogPortal: Component<DialogPrimitive.DialogPortalProps> = (
  props,
) => <DialogPrimitive.Portal {...props} />;

export const DialogOverlay: Component<DialogPrimitive.DialogOverlayProps> = (
  props,
) => (
  <DialogPrimitive.Overlay
    {...props}
    class={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      props.class,
      props.classList,
    )}
  />
);

export const DialogContent: Component<DialogPrimitive.DialogContentProps> = (
  props,
) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      {...props}
      class={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full",
        props.class,
        props.classList,
      )}
    >
      {props.children}
      <DialogPrimitive.CloseButton class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <VsClose class="h-4 w-4" color="#fff" />
        <span class="sr-only">Close</span>
      </DialogPrimitive.CloseButton>
    </DialogPrimitive.Content>
  </DialogPortal>
);

export const DialogHeader: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props,
) => (
  <div
    {...props}
    class={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      props.class,
      props.classList,
    )}
  />
);

export const DialogFooter: Component<JSX.HTMLAttributes<HTMLDivElement>> = (
  props,
) => (
  <div
    {...props}
    class={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      props.class,
      props.classList,
    )}
  />
);

export const DialogTitle: Component<DialogPrimitive.DialogTitleProps> = (
  props,
) => (
  <DialogPrimitive.Title
    {...props}
    class={cn(
      "text-lg font-semibold leading-none tracking-tight",
      props.class,
      props.classList,
    )}
  />
);

export const DialogDescription: Component<
  DialogPrimitive.DialogDescriptionProps
> = (props) => (
  <DialogPrimitive.Description
    {...props}
    class={cn("text-sm text-muted-foreground", props.class, props.classList)}
  />
);
