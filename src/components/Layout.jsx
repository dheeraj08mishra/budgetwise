import React from "react";
import Login from "./Login";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./Header";

const Layout = () => {
  const isLoggedIn = useSelector((store) => store.user.currentUser);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col">
        <Login />
      </div>
    );
  }
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default Layout;
