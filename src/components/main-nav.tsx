import { A } from "@solidjs/router";
import { Component, For, JSX } from "solid-js";
import { useLocation } from "solid-start";

import { cn } from "~/lib/utils";

const links = [
  {
    title: "Dashboard",
    href: "/",
  },
  {
    title: "Tags",
    href: "/tags",
  },
  {
    title: "Items",
    href: "/items",
  },
] as const;

export const MainNav: Component<JSX.HTMLAttributes<HTMLElement>> = (props) => {
  const location = useLocation();

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
            classList={{
              "opacity-50": !location.pathname.startsWith(href),
            }}
          >
            {title}
          </A>
        )}
      </For>
    </nav>
  );
};
