import React, { useEffect } from "react";
import Layout from "./Layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthObserver from "./AuthObserver";
import MainContainer from "./MainContainer";
import AddTransaction from "./AddTransaction";
import Profile from "./Profile";
import History from "./History";
import { useDispatch, useSelector } from "react-redux";
import {
  addTransaction,
  setTotalTransactions,
} from "../utils/redux/transactionSlice";
import { setSalary } from "../utils/redux/budgetSlice";

const Body = () => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user.currentUser);

  useEffect(() => {
    fetchTransaction();
  }, [user]);

  const fetchTransaction = async () => {
    try {
      if (user) {
        const response = await fetch(
          "http://localhost:3000/user/transactions",
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          dispatch(addTransaction(data.data.transactions));
          dispatch(
            setTotalTransactions(data.data.pagination.totalTransactions)
          );

          data.data.transactions.forEach((transaction) => {
            if (transaction.type === "income") {
              dispatch(setSalary(transaction.amount));
            }
          });
        } else {
          console.log("Failed to fetch transactions");
        }
      }
    } catch (error) {
      console.log("Error fetching transactions:", error);
    }
  };

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
