import { createBrowserRouter } from "react-router";
import { Home } from "./pages/home";
import { About } from "./pages/about";
import { Properties } from "./pages/properties";
import { Contact } from "./pages/contact";
import { PropertyDetails } from "./pages/property-details";
import { Login } from "./pages/login";
import { CreateAccount } from "./pages/create-account";
import { AdminDashboard } from "./pages/admin/dashboard";
import { AdminProperties } from "./pages/admin/properties";
import { AdminBookings } from "./pages/admin/bookings";
import { AdminCustomers } from "./pages/admin/customers";
import { AdminUsers } from "./pages/admin/users";
import { AdminPayments } from "./pages/admin/admin-payments";
import { AdminReports } from "./pages/admin/admin-reports";
import { AdminSettings } from "./pages/admin/admin-settings";
import { UserDashboard } from "./pages/user/dashboard";
import { UserPayments } from "./pages/user/payments";
import { UserSettings } from "./pages/user/settings";
import { MyBookings } from "./pages/my-bookings";
import { NotFound } from "./pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/about",
    Component: About,
  },
  {
    path: "/properties",
    Component: Properties,
  },
  {
    path: "/contact",
    Component: Contact,
  },
  {
    path: "/property/:id",
    Component: PropertyDetails,
  },
  {
    path: "/my-bookings",
    Component: MyBookings,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/create-account",
    Component: CreateAccount,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/admin/properties",
    Component: AdminProperties,
  },
  {
    path: "/admin/bookings",
    Component: AdminBookings,
  },
  {
    path: "/admin/customers",
    Component: AdminCustomers,
  },
  {
    path: "/admin/users",
    Component: AdminUsers,
  },
  {
    path: "/admin/payments",
    Component: AdminPayments,
  },
  {
    path: "/admin/reports",
    Component: AdminReports,
  },
  {
    path: "/admin/settings",
    Component: AdminSettings,
  },
  {
    path: "/user",
    Component: UserDashboard,
  },
  {
    path: "/user/dashboard",
    Component: UserDashboard,
  },
  {
    path: "/user/payments",
    Component: UserPayments,
  },
  {
    path: "/user/settings",
    Component: UserSettings,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);