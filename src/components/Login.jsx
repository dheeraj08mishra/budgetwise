import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import validator from "validator";
import { toast } from "react-hot-toast";
import { updateProfile } from "../utils/redux/profileSlice";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [signUp, setSignUp] = useState(true);
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleSignup = () => setSignUp(!signUp);

  const handleUserAuth = async () => {
    if (!validator.isEmail(emailInput)) {
      toast.error("Please enter a valid email.");
      return;
    }

    if (
      !validator.isStrongPassword(passwordInput, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      toast.error(
        "Weak password. Include uppercase, lowercase, numbers, and symbols."
      );
      return;
    }

    if (signUp) {
      if (!firstNameInput || !lastNameInput || !phoneInput) {
        toast.error("All fields are required.");
        return;
      }

      if (
        !validator.isAlpha(firstNameInput) ||
        !validator.isAlpha(lastNameInput)
      ) {
        toast.error("Names must contain only letters.");
        return;
      }

      if (
        !validator.isMobilePhone(phoneInput, "any", { strictMode: false }) ||
        !validator.isLength(phoneInput, { min: 10, max: 10 })
      ) {
        toast.error("Invalid phone number.");
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
        dispatch(updateProfile(data.user));
        navigate("/");
      } else {
        toast.error(data.message || "Authentication failed.");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      toast.error("Something went wrong.");
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
            />
            <label className="label">Last Name</label>
            <input
              type="text"
              className="input input-bordered input-neutral rounded-lg mb-2"
              value={lastNameInput}
              onChange={(e) => setLastNameInput(e.target.value)}
              placeholder="Doe"
            />
            <label className="label">Phone Number</label>
            <input
              type="tel"
              className="input input-bordered input-neutral  rounded-lg mb-2"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              maxLength={10}
              placeholder="1234567890"
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
        />

        <label className="label">Password</label>
        <input
          type="password"
          className="input input-bordered input-neutral rounded-lg mb-4"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="••••••••"
        />

        <button
          className="btn btn-primary w-full mb-2 rounded-4xl"
          onClick={handleUserAuth}
        >
          {signUp ? "Sign Up" : "Sign In"}
        </button>

        <p className="text-sm text-center text-gray-500">
          {signUp ? "Already have an account?" : "New user?"}
          <span
            onClick={toggleSignup}
            className="text-primary ml-2  cursor-pointer hover:underline"
          >
            {signUp ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </fieldset>
    </div>
  );
};

export default Login;
