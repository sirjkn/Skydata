import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Home } from "./pages/home";
import { PropertyDetails } from "./pages/property-details";
import { Login } from "./pages/login";
import { Signup } from "./pages/signup";
import { AdminDashboard } from "./pages/admin-dashboard";
import { Settings } from "./pages/settings";
import { CustomPage } from "./pages/custom-page";
import { MenuPagesManager } from "./pages/menu-pages-manager";
import { ActivityLog } from "./pages/activity-log";
import { NotFound } from "./pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "property/:id",
        Component: PropertyDetails,
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "signup",
        Component: Signup,
      },
      {
        path: "admin/dashboard",
        Component: AdminDashboard,
      },
      {
        path: "admin/settings",
        Component: Settings,
      },
      {
        path: "settings",
        Component: Settings,
      },
      {
        path: "admin/menu-pages",
        Component: MenuPagesManager,
      },
      {
        path: "admin/activity-log",
        Component: ActivityLog,
      },
      {
        path: "page/:slug",
        Component: CustomPage,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);