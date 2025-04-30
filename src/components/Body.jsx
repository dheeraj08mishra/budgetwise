import React from "react";
import Layout from "./Layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthObserver from "./AuthObserver";
import MainContainer from "./MainContainer";
import AddTransaction from "./AddTransaction";
import Budget from "./Budget";
import BudgetForm from "./BudgetForm";

const Body = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <MainContainer />,
        },

        {
          path: "transactions",
          element: <AddTransaction />,
        },
        {
          path: "budget",
          element: <BudgetForm />,
        },
      ],
    },
  ]);
  return (
    <div className="flex flex-col">
      <AuthObserver>
        <RouterProvider router={router} />
      </AuthObserver>
    </div>
  );
};

export default Body;
