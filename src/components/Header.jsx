import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../utils/redux/userSlice";
import { auth } from "../utils/firebase";
import { signOut } from "firebase/auth";
import { Menu, X } from "lucide-react"; // optional: install lucide-react for icons

const Header = () => {
  const user = useSelector((store) => store.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logoutUser = async () => {
    if (user) {
      try {
        await signOut(auth);
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
    <header className="bg-gray-800 text-white p-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">Finance Tracker</h1>

        {/* Hamburger icon for mobile */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-4">
          <Link to="/">
            <button className="bg-cyan-900 px-4 py-2 rounded hover:bg-cyan-700">
              Home
            </button>
          </Link>
          <Link to="/transactions">
            <button className="bg-cyan-900 px-4 py-2 rounded hover:bg-cyan-700">
              Add Transaction
            </button>
          </Link>
        </nav>

        {/* Desktop logout */}
        <div className="hidden md:flex">
          <button
            onClick={logoutUser}
            className="bg-cyan-900 px-4 py-2 rounded hover:bg-cyan-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 space-y-4 text-center">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <button className="bg-cyan-900 px-4 py-2 rounded w-full">
              Home
            </button>
          </Link>
          <Link to="/transactions" onClick={() => setMenuOpen(false)}>
            <button className="bg-cyan-900 px-4 py-2 rounded w-full">
              Add Transaction
            </button>
          </Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              logoutUser();
            }}
            className="bg-cyan-900 px-4 py-2 rounded w-full"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
