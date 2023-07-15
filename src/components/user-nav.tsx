import { Component } from "solid-js";

import { trpc } from "~/lib/trpc";

export const UserNav: Component = () => {
  const user = trpc.users.user.useQuery();

  return null;

  // return (
  //   <DropdownMenu>
  //     <DropdownMenuTrigger>
  //       <div class="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
  //         <p class="flex h-full w-full items-center justify-center rounded-full bg-muted">
  //           {user.data?.name?.at(0)}
  //         </p>
  //       </div>
  //     </DropdownMenuTrigger>

  //     <DropdownMenuPortal>
  //       <DropdownMenuContent class="w-56">
  //         <DropdownMenuItem>
  //           <DropdownMenuLabel class="font-normal">
  //             <div class="flex flex-col space-y-1">
  //               <p class="text-sm font-medium leading-none">
  //                 {user.data?.name ?? "..."}
  //               </p>
  //               <p class="text-xs leading-none text-muted-foreground">
  //                 {user.data?.email ?? "..."}
  //               </p>
  //             </div>
  //           </DropdownMenuLabel>
  //         </DropdownMenuItem>

  //         <DropdownMenuSeparator />

  //         <DropdownMenuGroup>
  //           <DropdownMenuItem disabled>
  //             Profile
  //             <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
  //           </DropdownMenuItem>
  //         </DropdownMenuGroup>

  //         <DropdownMenuSeparator />

  //         <DropdownMenuItem>
  //           Log out
  //           <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
  //         </DropdownMenuItem>
  //       </DropdownMenuContent>
  //     </DropdownMenuPortal>
  //   </DropdownMenu>
  // );
};
