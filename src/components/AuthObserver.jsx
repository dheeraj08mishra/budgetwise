import { useDispatch, useSelector } from "react-redux";
import { updateProfile, logout } from "../utils/redux/profileSlice";
import { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { removeAllTransactions } from "../utils/redux/transactionSlice";
import { resetSalary } from "../utils/redux/budgetSlice";

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
          dispatch(logout());
          dispatch(removeAllTransactions()); // clear previous transactions
          dispatch(updateProfile(data.user)); // restore into Redux
          dispatch(resetSalary());
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
