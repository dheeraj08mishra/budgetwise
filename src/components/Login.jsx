import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import validator from "validator";
import { toast } from "react-hot-toast";
import { login } from "../utils/redux/userSlice";

const Login = () => {
  const [signUp, setSignUp] = useState(true);
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [PhoneInput, setPhoneInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleSignup = () => {
    setSignUp(!signUp);
  };

  const handleUserAuth = async () => {
    if (!validator.isEmail(emailInput)) {
      toast.error("Please enter a valid email address.");
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
        "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and symbols."
      );
      return;
    }
    if (signUp) {
      if (signUp && !PhoneInput) {
        toast.error("Please enter your mobile number.");
        return;
      }
      if (signUp && !firstNameInput) {
        toast.error("Please enter your first name.");
        return;
      }
      if (signUp && !lastNameInput) {
        toast.error("Please enter your last name.");
        return;
      }
      if (signUp && !PhoneInput) {
        toast.error("Please enter mobile number.");
        return;
      }
      if (!validator.isEmail(emailInput)) {
        toast.error("Please enter a valid email address.");
        return;
      }

      if (!validator.isAlpha(firstNameInput)) {
        toast.error("First name must contain only letters.");
        return;
      }
      if (!validator.isAlpha(lastNameInput)) {
        toast.error("Last name must contain only letters.");
        return;
      }

      if (!validator.isLength(firstNameInput, { min: 3, max: 20 })) {
        toast.error("First name must be between 1 and 20 characters.");
        return;
      }
      if (!validator.isLength(lastNameInput, { min: 3, max: 20 })) {
        toast.error("Last name must be between 3 and 20 characters.");
        return;
      }

      if (
        PhoneInput &&
        !validator.isMobilePhone(PhoneInput, "any", { strictMode: false })
      ) {
        toast.error("Please enter a valid mobile number.");
        return;
      }
      if (PhoneInput && !validator.isLength(PhoneInput, { min: 10, max: 10 })) {
        toast.error("Mobile number must be exactly 10 digits.");
        return;
      }
    }
    if (!validator.isLength(passwordInput, { min: 8, max: 20 })) {
      toast.error("Password must be between 8 and 20 characters.");
      return;
    }
    if (!validator.isLength(emailInput, { min: 7, max: 50 })) {
      toast.error("Email must be between 7 and 50 characters.");
      return;
    }

    const payload = {
      firstName: firstNameInput,
      lastName: lastNameInput,
      email: emailInput,
      password: passwordInput,
      phoneNumber: PhoneInput,
    };
    console.log(payload);

    try {
      if (signUp) {
        const response = await fetch("http://localhost:3000/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        });

        const data = await response.json();
        console.log("Signup Response:", data);
        if (response.ok) {
          toast.success(data.message);
          navigate("/");
          dispatch(login(data.user));
        } else {
          toast.error("Signup failed. Please try again.");
        }

        console.log("Signed up & profile updated");
      } else {
        const response = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: payload.email,
            password: payload.password,
          }),
          credentials: "include",
        });

        const data = await response.json();
        console.log("Login Response:", data);
        if (response.ok) {
          toast.success(data.message);
          navigate("/");
          dispatch(login(data.user));
        }
      }
    } catch (error) {
      console.log("Auth Error:", error.code, error.message);
    }
  };

  return (
    <>
      <div className="relative w-full h-screen flex items-center justify-center">
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className="fieldset-legend">
            {" "}
            {signUp ? "Sign Up." : "Sign In."}
          </legend>

          {signUp && (
            <>
              <label className="label">First Name</label>
              <input
                type="text"
                placeholder="First Name"
                value={firstNameInput}
                onChange={(e) => setFirstNameInput(e.target.value)}
                className="input input-neutral rounded-2xl p-4"
              />

              <label className="label">Last Name</label>
              <input
                type="text"
                placeholder="Last Name"
                value={lastNameInput}
                onChange={(e) => setLastNameInput(e.target.value)}
                className="input input-neutral rounded-2xl p-4"
              />
              <label className="label">Mobile</label>
              <input
                type="tel"
                value={PhoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                maxLength={10}
                pattern="[0-9]{10}"
                placeholder="1234567890"
                className="input input-neutral rounded-2xl p-4"
              />
            </>
          )}

          <label className="label">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="input input-neutral rounded-2xl p-4"
          />

          <label className="label">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="input input-neutral rounded-2xl p-4"
          />

          <button
            type="submit"
            onClick={handleUserAuth}
            className="btn btn-primary mt-4 w-full rounded-2xl p-4"
          >
            {signUp ? "Sign Up" : "Sign In"}
          </button>
          <p className="text-gray-400 mt-4">
            {signUp ? "Already have an account?" : "New to Platform?"}
            <span
              onClick={toggleSignup}
              className="text-white cursor-pointer hover:underline ml-2"
            >
              {signUp ? "Sign in now." : "Sign up now."}
            </span>
          </p>
        </fieldset>
      </div>
    </>
  );
};

export default Login;
