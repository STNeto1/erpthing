import { A } from "@solidjs/router";
import { Component, For, JSX } from "solid-js";

import { cn } from "~/lib/utils";

const links = [
  {
    title: "Dashboard",
    href: "/",
  },
] as const;

export const MainNav: Component<JSX.HTMLAttributes<HTMLElement>> = (props) => {
  return (
    <nav
      {...props}
      class={cn(
        "flex items-center space-x-4 lg:space-x-6",
        props.class,
        props.classList,
      )}
    >
      <For each={links}>
        {({ title, href }) => (
          <A
            href={href}
            class="text-sm font-medium transition-colors hover:text-primary"
          >
            {title}
          </A>
        )}
      </For>
    </nav>
  );
};
