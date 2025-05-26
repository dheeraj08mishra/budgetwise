import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../utils/redux/userSlice";
import { useEffect } from "react";

const AuthObserver = ({ children }) => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((store) => store.user.currentUser);

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const res = await fetch("http://localhost:3000/me", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          dispatch(login(data.user)); // restore into Redux
        }
      } catch (err) {
        console.error("Error restoring user:", err);
      }
    };

    if (!isLoggedIn) {
      restoreUser();
    }
  }, [isLoggedIn, dispatch]);

  return children;
};
export default AuthObserver;
