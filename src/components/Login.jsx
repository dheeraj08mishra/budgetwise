import React, { useRef, useState } from "react";
import { checkValidation } from "../utils/Validate";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [signUp, setSignUp] = useState(true);
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const toggleSignup = () => {
    setSignUp(!signUp);
  };

  const handleUserAuth = async () => {
    const validationInfo = checkValidation(
      emailRef.current.value,
      passwordRef.current.value,
      signUp ? usernameRef.current.value : null
    );

    if (validationInfo) {
      console.log(validationInfo);
      return;
    }

    try {
      if (signUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          emailRef.current.value,
          passwordRef.current.value
        );

        await updateProfile(userCredential.user, {
          displayName: usernameRef.current.value,
        });

        // after successful signup
        navigate("/");

        console.log("Signed up & profile updated");
      } else {
        await signInWithEmailAndPassword(
          auth,
          emailRef.current.value,
          passwordRef.current.value
        );

        console.log("Logged in");
        navigate("/");
      }

      // redirect after login/signup
    } catch (error) {
      console.log("Auth Error:", error.code, error.message);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-90"></div>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="relative bg-black bg-opacity-80 p-10 rounded-lg text-white flex flex-col items-center z-10 w-96 max-w-full mx-auto"
      >
        {signUp && (
          <input
            type="text"
            placeholder="Username"
            ref={usernameRef}
            className="w-full p-3 mb-4 rounded bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          ref={emailRef}
          className="w-full p-3 mb-4 rounded bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          ref={passwordRef}
          className="w-full p-3 mb-4 rounded bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none"
        />
        <button
          type="submit"
          onClick={handleUserAuth}
          className="w-full bg-red-600 p-3 rounded font-bold hover:bg-red-700 transition cursor-pointer"
        >
          {signUp ? "Sign Up" : "Login"}
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
      </form>
    </div>
  );
};

export default Login;
