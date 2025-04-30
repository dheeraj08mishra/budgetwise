import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../utils/redux/userSlice";
import { auth } from "../utils/firebase";
import { signOut } from "firebase/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const user = useSelector((store) => store.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutUser = async () => {
    if (user) {
      try {
        await signOut(auth); // Firebase logout
        dispatch(logout()); // Redux logout
        navigate("/"); // Redirect to home
      } catch (err) {
        console.error("Error signing out:", err);
      }
    } else {
      navigate("/"); // Optional: take to login page instead of "/"
    }
  };
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <h1 className="text-2xl font-bold">Finance Tracker</h1>
      <nav className="flex space-x-4">
        <Link to="/" className="hover:text-cyan-400">
          Home
        </Link>
        <Link to="/transactions" className="hover:text-cyan-400">
          Transactions
        </Link>
        <Link to="/budget" className="hover:text-cyan-400">
          Budget
        </Link>
      </nav>

      <div className="flex items-center space-x-4">
        <button onClick={logoutUser} className="bg-cyan-900 px-4 py-2 rounded">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
