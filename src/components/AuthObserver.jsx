import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../utils/redux/profileSlice";
import { useEffect } from "react";
import { BASE_URL } from "../utils/constants";

const AuthObserver = ({ children }) => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((store) => store.profile.currentUser);

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const res = await fetch(BASE_URL + "/me", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          dispatch(updateProfile(data.user)); // restore into Redux
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
