import { Component, JSX } from "solid-js";

import { cn } from "~/lib/utils";

export const Table: Component<JSX.HTMLAttributes<HTMLTableElement>> = (
  props,
) => {
  return (
    <div class="w-full overflow-auto">
      <table
        {...props}
        class={cn(
          "caption-bottom w-full text-sm",
          props.class,
          props.classList,
        )}
      />
    </div>
  );
};

export const TableHeader: Component<
  JSX.HTMLAttributes<HTMLTableSectionElement>
> = (props) => {
  return (
    <thead
      {...props}
      class={cn("[&_tr]:border-b", props.class, props.classList)}
    />
  );
};

export const TableBody: Component<
  JSX.HTMLAttributes<HTMLTableSectionElement>
> = (props) => {
  return (
    <tbody
      {...props}
      class={cn("[&_tr:last-child]:border-0", props.class, props.classList)}
    />
  );
};

export const TableFooter: Component<
  JSX.HTMLAttributes<HTMLTableSectionElement>
> = (props) => {
  return (
    <tfoot
      {...props}
      class={cn(
        "bg-primary font-medium text-primary-foreground",
        props.class,
        props.classList,
      )}
    />
  );
};

export const TableRow: Component<JSX.HTMLAttributes<HTMLTableRowElement>> = (
  props,
) => {
  return (
    <tr
      {...props}
      class={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        props.class,
        props.classList,
      )}
    />
  );
};

export const TableHead: Component<JSX.HTMLAttributes<HTMLTableCellElement>> = (
  props,
) => {
  return (
    <th
      {...props}
      class={cn(
        "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        props.class,
        props.classList,
      )}
    />
  );
};

export const TableCell: Component<JSX.HTMLAttributes<HTMLTableCellElement>> = (
  props,
) => {
  return (
    <td
      {...props}
      class={cn(
        "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        props.class,
        props.classList,
      )}
    />
  );
};

export const TableCaption: Component<JSX.HTMLAttributes<HTMLElement>> = (
  props,
) => {
  return (
    <caption
      {...props}
      class={cn(
        "mt-4 text-sm text-muted-foreground",
        props.class,
        props.classList,
      )}
    />
  );
};
