import * as KCore from "@kobalte/core";
import { Component } from "solid-js";

import { cn } from "~/lib/utils";

export const Tabs = KCore.Tabs.Root;

export const TabsList: Component<KCore.Tabs.TabsListProps> = (props) => {
  return (
    <KCore.Tabs.List
      {...props}
      class={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        props.class,
        props.classList,
      )}
    />
  );
};

export const TabsTrigger: Component<KCore.Tabs.TabsTriggerProps> = (props) => {
  return (
    <KCore.Tabs.Trigger
      {...props}
      class={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
        props.class,
        props.classList,
      )}
    />
  );
};

export const TabsContent: Component<KCore.Tabs.TabsContentProps> = (props) => {
  return (
    <KCore.Tabs.Content
      {...props}
      class={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        props.class,
        props.classList,
      )}
    />
  );
};
