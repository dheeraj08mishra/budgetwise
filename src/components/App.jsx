import { lazy, Suspense } from "react";
import { Provider, useSelector } from "react-redux";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Link,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import appStore from "../utils/redux/appStore";
import AuthObserver from "./AuthObserver";
import AppShell from "./AppShell";
import { Spinner, Card, EmptyState } from "./ui";
import { Compass } from "lucide-react";

// Each page is its own chunk: charts only download where they're used
const Login = lazy(() => import("../pages/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Transactions = lazy(() => import("../pages/Transactions"));
const AddTransaction = lazy(() => import("../pages/AddTransaction"));
const Recurring = lazy(() => import("../pages/Recurring"));
const Goals = lazy(() => import("../pages/Goals"));
const Insights = lazy(() => import("../pages/Insights"));
const Profile = lazy(() => import("../pages/Profile"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));

const page = (Component) => (
  <Suspense fallback={<Spinner />}>
    <Component />
  </Suspense>
);

const NotFound = () => (
  <Card>
    <EmptyState
      icon={Compass}
      title="Page not found"
      text="That page doesn't exist."
      action={
        <Link to="/" className="btn btn-primary btn-sm">
          Go to dashboard
        </Link>
      }
    />
  </Card>
);

// Signed-out visitors see the login page at any URL
function Gate() {
  const user = useSelector((s) => s.profile.currentUser);
  return user ? <AppShell /> : page(Login);
}

const router = createBrowserRouter([
  // Public: reached from the login page or the reset email while signed out
  { path: "/forgot-password", element: page(ForgotPassword) },
  { path: "/reset-password", element: page(ResetPassword) },
  {
    path: "/",
    element: <Gate />,
    children: [
      { index: true, element: page(Dashboard) },
      { path: "transactions", element: page(Transactions) },
      { path: "history", element: <Navigate to="/transactions" replace /> },
      { path: "add", element: page(AddTransaction) },
      { path: "recurring", element: page(Recurring) },
      { path: "goals", element: page(Goals) },
      { path: "insights", element: page(Insights) },
      { path: "profile", element: page(Profile) },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => (
  <Provider store={appStore}>
    <Toaster
      position="top-center"
      toastOptions={{
        className:
          "!bg-base-100 !text-base-content !border !border-base-300 !shadow-lg !rounded-xl !text-sm",
      }}
    />
    <AuthObserver>
      <RouterProvider router={router} />
    </AuthObserver>
  </Provider>
);

export default App;
