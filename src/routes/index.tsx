import { A } from "@solidjs/router";
import { SolidApexCharts } from "solid-apexcharts";
import { BsBox, BsCurrencyDollar } from "solid-icons/bs";
import {
  createEffect,
  createSignal,
  For,
  Suspense,
  type VoidComponent,
} from "solid-js";

import { MainNav } from "~/components/main-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { UserNav } from "~/components/user-nav";
import { trpc } from "~/lib/trpc";

const CardGrid: VoidComponent = () => {
  const metadataQuery = trpc.orders.metadata.useQuery(undefined, () => ({}));

  return (
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0">
          <CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
          <BsCurrencyDollar class="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton class="h-12 w-full" />}>
            <div class="text-2xl font-bold">
              {metadataQuery.data?.total.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0">
          <CardTitle class="text-sm font-medium">Sales (Last 7 days)</CardTitle>
          <BsCurrencyDollar class="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton class="h-12 w-full" />}>
            <div class="text-2xl font-bold">
              {metadataQuery.data?.last7DaysTotal.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 ">
          <CardTitle class="text-sm font-medium">Orders</CardTitle>
          <BsBox class="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton class="h-12 w-full" />}>
            <div class="text-2xl font-bold">{metadataQuery?.data?.orders}</div>
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 ">
          <CardTitle class="text-sm font-medium">Items</CardTitle>
          <BsBox class="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton class="h-12 w-full" />}>
            <div class="text-2xl font-bold">{metadataQuery?.data?.items}</div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

const Recent: VoidComponent = () => {
  const latestOrdersData = trpc.orders.latestOrders.useQuery();

  return (
    <Card class="col-span-3">
      <Suspense fallback={<Skeleton class="h-full w-full" />}>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            {`You made ${latestOrdersData?.data?.count} orders this month`}
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-2">
          <For each={latestOrdersData?.data?.latestOrders}>
            {(order) => (
              <A href={`/orders/${order.id}`}>
                <div class="space-y-8 rounded px-2 py-1 hover:bg-primary-foreground">
                  <div class="flex items-center">
                    <div class="space-y-1">
                      <p class="text-sm font-medium leading-none">
                        {order.description}
                      </p>
                      <p class="text-sm text-muted-foreground">
                        {[order.user?.name, order.status, order.createdAt].join(
                          " - ",
                        )}
                      </p>
                    </div>
                    <div class="ml-auto font-medium">
                      {order.total.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </div>
                  </div>
                </div>
              </A>
            )}
          </For>
        </CardContent>
      </Suspense>
    </Card>
  );
};

const Overview: VoidComponent = () => {
  const overviewQuery = trpc.orders.overview.useQuery();

  return (
    <Card class="col-span-4">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <Suspense fallback={<Skeleton class="h-full w-full" />}>
        <CardContent class="h-full w-full">
          <SolidApexCharts
            width="100%"
            type="bar"
            options={{
              chart: {
                id: "overview",
              },
              xaxis: {
                categories: Object.keys(overviewQuery?.data ?? {}),
              },
              colors: ["#F44336", "#E91E63", "#9C27B0"],
            }}
            series={[
              {
                name: "series-1",
                data: Object.values(overviewQuery?.data ?? {}),
              },
            ]}
          />
        </CardContent>
      </Suspense>
    </Card>
  );
};

const Home: VoidComponent = () => {
  return (
    <main class="min-h-screen">
      <div class="border-b">
        <div class="flex h-16 items-center px-4">
          <MainNav class="mx-6" />
          <div class="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>

      <section class="container flex flex-col gap-8 pt-10">
        <CardGrid />

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Suspense fallback={<Skeleton class="w-full" />}>
            <Overview />
          </Suspense>

          <Suspense fallback={<Skeleton class="w-full" />}>
            <Recent />
          </Suspense>
        </div>
      </section>
    </main>
  );
};

export default Home;
