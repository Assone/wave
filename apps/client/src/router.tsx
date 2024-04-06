import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from "@tanstack/react-router";
import App from "./App";

const rootRoute = createRootRoute({
  component: App,
});

export const HomeRoute = createRoute({
  path: "/",
  getParentRoute: () => rootRoute,
  component: lazyRouteComponent(() => import("./views/HomeView")),
});

export const RoomRoute = createRoute({
  path: "/room/$id",
  getParentRoute: () => rootRoute,
  component: lazyRouteComponent(() => import("./views/RoomView")),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      autoClose: search.autoClose as boolean,
    };
  },
});

const routeTree = rootRoute.addChildren([HomeRoute, RoomRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
