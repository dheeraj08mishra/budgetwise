import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { login } from "../utils/redux/userSlice";

const Profile = () => {
  const user = useSelector((store) => store.user.currentUser);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [photo, setPhoto] = useState(user?.photo || "");
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "");
  const dispatch = useDispatch();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <span className="loading loading-dots loading-xs"></span>
        <span className="loading loading-dots loading-sm"></span>
        <span className="loading loading-dots loading-md"></span>
        <span className="loading loading-dots loading-lg"></span>
        <span className="loading loading-dots loading-xl"></span>
      </div>
    );
  }

  const updateUserProfile = async () => {
    if (!firstName || !lastName || !phone || !photo || !age) {
      toast.error(
        "Please provide data in First Name, Last Name, Phone, Photo, age."
      );
      return;
    }

    const payload = {
      firstName,
      lastName,
      phoneNumber: phone,
      photo,
      age,
      gender: gender ? gender.toLowerCase() : "male",
      email: user.email, // Assuming email is not editable
    };
    const response = await fetch("http://localhost:3000/user/profile/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    const data = await response.json();
    console.log("Update Profile Response:", data);
    if (response.ok) {
      toast.success(data.message);
      dispatch(login(data.user)); // Update user in Redux store
    } else {
      toast.error(data.message || "Failed to update profile");
    }
    console.log("Profile updated successfully");
  };

  return (
    <div className="flex flex-row m-4">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Update Profile</legend>

        <label className="label">First Name</label>
        <input
          type="text"
          className="input input-neutral rounded-2xl"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <label className="label">Last Name</label>
        <input
          type="text"
          className="input input-neutral rounded-2xl"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <label className="label">Email</label>
        <input
          type="email"
          value={user?.email || ""}
          disabled
          className="input input-neutral rounded-2xl"
        />
        <label className="label">Age</label>
        <input
          type="number"
          className="input input-neutral rounded-2xl"
          placeholder="Age"
          value={age}
          max={100}
          min={0}
          onChange={(e) => setAge(e.target.value)}
        />
        <label className="label">
          <span className="label-text">Gender</span>
        </label>
        <select
          className="select rounded-xl select-bordered w-full select-neutral outline-none"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option disabled value="">
            Select Gender
          </option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <label className="label">Phone</label>
        <input
          type="tel"
          className="input input-neutral rounded-2xl"
          placeholder="Phone"
          maxLength={10}
          pattern="[0-9]{10}"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <label className="label">Photo</label>
        <input
          type="url"
          className="input input-neutral rounded-2xl"
          placeholder="Photo URL"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
        />

        <button
          onClick={updateUserProfile}
          className="btn btn-secondary rounded-4xl mt-4"
        >
          Update Profile
        </button>
      </fieldset>

      <div className="hero bg-base-200 min-h-1/2 w-1/2 m-4">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <img
            src={photo || "https://via.placeholder.com/150"}
            alt="User Profile"
            className="max-w-sm rounded-lg shadow-2xl"
          />
          <div>
            <h1 className="text-5xl font-bold">{user?.fullName}</h1>
            <p className="py-6 flex flex-col gap-2">
              <span className="text-2xl">Email:{user?.email || ""}</span>
              <span className="text-2xl">Phone: {phone}</span>
              <span className="text-2xl">Age: {age}</span>
              <span className="text-2xl">Gender:{gender}</span>
            </p>
            <Link to="/">
              <button className="btn btn-secondary">Dashboard</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
