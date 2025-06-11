import React from "react";
import Login from "./Login";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const isLoggedIn = useSelector((store) => store.profile.currentUser);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen  bg-base-100 w-full">
        <Login />
      </div>
    );
  }

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default Layout;
