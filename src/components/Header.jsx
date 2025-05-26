import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../utils/redux/userSlice";
import { toast } from "react-hot-toast";

const Header = () => {
  const user = useSelector((store) => store.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutUser = async () => {
    if (user) {
      try {
        const response = await fetch("http://localhost:3000/logout", {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) {
          toast.error("Failed to log out. Please try again.");
          return;
        }
        const data = await response.json();
        toast.success(data.message);
        dispatch(logout());
        navigate("/");
      } catch (err) {
        console.error("Error signing out:", err);
      }
    } else {
      navigate("/");
    }
  };

  return (
    <>
      {/* <header className="bg-gray-800 text-white p-4"> */}
      <div className="navbar bg-gray-800  shadow-sm p-4">
        <div className="flex-1">
          <a className="btn btn-ghost text-3xl">Finance Tracker</a>
        </div>
        <div className="flex gap-2">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="Tailwind CSS Navbar component"
                  src={
                    "https://s3.amazonaws.com/37assets/svn/765-default-avatar.png"
                  }
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link to="/" className="justify-between">
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className="justify-between">
                  <span>Profile</span>
                  <span className="badge badge-primary">New</span>
                </Link>
              </li>

              <li>
                <Link to="/transactions">
                  <span>Add Transaction</span>
                </Link>
              </li>
              <li>
                <Link to="/history">
                  <span>History</span>
                </Link>
              </li>

              <li>
                <span onClick={logoutUser} className="text-red-600">
                  Logout
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* </header> */}
    </>
  );
};

export default Header;
