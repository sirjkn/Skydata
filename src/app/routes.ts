// Skyway Suites - Application Routes Configuration
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Home } from "./pages/home";
import { AllProperties } from "./pages/all-properties";
import { PropertyDetails } from "./pages/property-details";
import { Login } from "./pages/login";
import { Signup } from "./pages/signup";
import { Setup } from "./pages/setup";
import { AdminDashboard } from "./pages/admin-dashboard";
import { Settings } from "./pages/settings";
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
        path: "properties",
        Component: AllProperties,
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
        path: "setup",
        Component: Setup,
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
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);