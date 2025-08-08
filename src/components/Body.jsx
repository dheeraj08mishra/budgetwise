import Layout from "./Layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthObserver from "./AuthObserver";
import MainContainer from "./MainContainer";
import AddTransaction from "./AddTransaction";
import Profile from "./Profile";
import History from "./History";
import RecurringTransaction from "./RecurringTransaction";
import Goal from "./Goal";

const Body = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <MainContainer />,
        },

        {
          path: "transactions",
          element: <AddTransaction />,
        },
        {
          path: "profile",
          element: <Profile />,
        },
        {
          path: "history",
          element: <History />,
        },
        {
          path: "recurring",
          element: <RecurringTransaction />,
        },
        {
          path: "goals",
          element: <Goal />,
        },
      ],
    },
  ]);
  return (
    <div className="min-h-screen bg-base-200  ">
      <AuthObserver>
        <RouterProvider router={router} />
      </AuthObserver>
    </div>
  );
};

export default Body;
