import { cva } from "class-variance-authority";
import { Component, JSX } from "solid-js";

import { cn } from "~/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

type LabelProps = JSX.InputHTMLAttributes<HTMLLabelElement>;

export const Label: Component<LabelProps> = (props) => {
  return (
    <label
      {...props}
      class={cn(labelVariants(), props.class, props.classList)}
    />
  );
};
