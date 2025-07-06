import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import validator from "validator";
import { toast } from "react-hot-toast";
import { updateProfile, logout } from "../utils/redux/profileSlice";
import { BASE_URL } from "../utils/constants";
import { removeAllTransactions } from "../utils/redux/transactionSlice";
import { resetSalary } from "../utils/redux/budgetSlice";

const COOLDOWN_PERIOD = 2000;

const Login = () => {
  const [signUp, setSignUp] = useState(true);
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleSignup = () => {
    if (loading || cooldown) return;
    setSignUp(!signUp);
  };

  const startCooldown = () => {
    setCooldown(true);
    setTimeout(() => setCooldown(false), COOLDOWN_PERIOD);
  };
  const errorWithCooldown = (msg) => {
    toast.error(msg);
    setLoading(false);
    startCooldown();
  };

  const handleUserAuth = async () => {
    if (loading || cooldown) return;
    setLoading(true);

    if (!validator.isEmail(emailInput)) {
      errorWithCooldown("Please enter a valid email.");
      return;
    }
    if (!passwordInput) {
      errorWithCooldown("Password cannot be empty.");
      return;
    }

    if (signUp) {
      if (
        !validator.isStrongPassword(passwordInput, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
      ) {
        errorWithCooldown(
          "Password must have at least 8 characters, including uppercase, lowercase, a number, and a symbol."
        );
        return;
      }

      if (!firstNameInput || !lastNameInput || !phoneInput) {
        errorWithCooldown("All fields are required.");
        return;
      }

      if (
        !validator.isAlpha(firstNameInput) ||
        !validator.isAlpha(lastNameInput)
      ) {
        errorWithCooldown("Names must contain only letters.");
        return;
      }

      if (
        !validator.isMobilePhone(phoneInput, "any", { strictMode: false }) ||
        !validator.isLength(phoneInput, { min: 10, max: 10 })
      ) {
        errorWithCooldown("Invalid phone number.");
        return;
      }
    }

    const payload = {
      firstName: firstNameInput,
      lastName: lastNameInput,
      email: emailInput,
      password: passwordInput,
      phoneNumber: phoneInput,
    };
    if (
      !validator.isStrongPassword(passwordInput, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      errorWithCooldown("Invalid Password ");
      return;
    }

    try {
      const url = signUp ? BASE_URL + "/signup" : BASE_URL + "/login";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          signUp
            ? payload
            : { email: payload.email, password: payload.password }
        ),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        dispatch(logout());
        dispatch(removeAllTransactions());
        dispatch(resetSalary());
        dispatch(updateProfile(data.user));
        navigate("/");
        setLoading(false);
      } else {
        toast.error(data.message || "Authentication failed.");
        setLoading(false);
        startCooldown();
      }
    } catch (err) {
      console.error("Auth Error:", err);
      toast.error("Something went wrong.");
      setLoading(false);
      startCooldown();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      <fieldset className="fieldset w-full max-w-sm bg-base-200 p-6 rounded-xl shadow-lg">
        <legend className="text-xl font-semibold">
          {signUp ? "Create Account" : "Login"}
        </legend>

        {signUp && (
          <>
            <label className="label">First Name</label>
            <input
              type="text"
              className="input input-bordered input-neutral  rounded-lg mb-2"
              value={firstNameInput}
              onChange={(e) => setFirstNameInput(e.target.value)}
              placeholder="John"
              disabled={loading || cooldown}
            />
            <label className="label">Last Name</label>
            <input
              type="text"
              className="input input-bordered input-neutral rounded-lg mb-2"
              value={lastNameInput}
              onChange={(e) => setLastNameInput(e.target.value)}
              placeholder="Doe"
              disabled={loading || cooldown}
            />
            <label className="label">Phone Number</label>
            <input
              type="tel"
              className="input input-bordered input-neutral  rounded-lg mb-2"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              maxLength={10}
              placeholder="1234567890"
              disabled={loading || cooldown}
            />
          </>
        )}

        <label className="label">Email</label>
        <input
          type="email"
          className="input input-bordered input-neutral rounded-lg mb-2"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="email@example.com"
          disabled={loading || cooldown}
        />

        <label className="label">Password</label>
        <input
          type="password"
          className="input input-bordered input-neutral rounded-lg mb-4"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="••••••••"
          disabled={loading || cooldown}
        />

        <button
          className="btn btn-primary w-full mb-2 rounded-4xl"
          onClick={handleUserAuth}
          disabled={loading || cooldown}
        >
          {loading || cooldown
            ? "Please wait..."
            : signUp
            ? "Sign Up"
            : "Sign In"}
        </button>

        <p className="text-sm text-center text-gray-500">
          {signUp ? "Already have an account?" : "New user?"}
          <span
            onClick={toggleSignup}
            className="text-primary ml-2  cursor-pointer hover:underline"
            style={{
              pointerEvents: loading || cooldown ? "none" : "auto",
              opacity: loading || cooldown ? 0.5 : 1,
            }}
          >
            {signUp ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </fieldset>
    </div>
  );
};

export default Login;
