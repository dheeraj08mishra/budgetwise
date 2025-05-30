import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { updateProfile } from "../utils/redux/profileSlice";
import { BASE_URL } from "../utils/constants";

const Profile = () => {
  const user = useSelector((store) => store.profile.currentUser);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [photo, setPhoto] = useState(user?.photo || "");
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "");
  const dispatch = useDispatch();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2 bg-base-100">
        <span className="loading loading-dots loading-xs" />
        <span className="loading loading-dots loading-sm" />
        <span className="loading loading-dots loading-md" />
        <span className="loading loading-dots loading-lg" />
        <span className="loading loading-dots loading-xl" />
      </div>
    );
  }

  const updateUserProfile = async () => {
    if (!firstName || !lastName || !phone || !photo) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      firstName,
      lastName,
      phoneNumber: phone,
      photo,
      age,
      gender: gender ? gender.toLowerCase() : "male",
      email: user.email,
    };

    try {
      const response = await fetch(BASE_URL + "/user/profile/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        dispatch(updateProfile(data.user));
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full gap-0 lg:gap-6 p-4 lg:p-8 bg-base-100 min-h-screen">
      <div className="card bg-base-300 rounded-box flex-1 flex items-center justify-center shadow-xl p-4">
        <fieldset className="fieldset border-base-200 text-lg border-2 rounded-box w-full max-w-lg p-6 space-y-2">
          <legend className="fieldset-legend font-bold text-xl mb-2">
            Update Profile
          </legend>

          <label className="label">First Name</label>
          <input
            type="text"
            className="input input-bordered input-neutral w-full rounded-2xl"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <label className="label">Last Name</label>
          <input
            type="text"
            className="input input-bordered input-neutral w-full rounded-2xl"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <label className="label">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="input input-bordered input-neutral w-full rounded-2xl"
          />
          {/* <label className="label">Age</label>
          <input
            type="number"
            className="input input-bordered input-neutral w-full rounded-2xl"
            placeholder="Age"
            value={age}
            max={100}
            min={0}
            onChange={(e) => setAge(e.target.value)}
          /> */}
          <label className="label">
            <span className="label-text">Gender</span>
          </label>
          <select
            className="select select-bordered select-neutral w-full rounded-xl outline-none"
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
            className="input input-bordered input-neutral w-full rounded-2xl"
            placeholder="Phone"
            maxLength={10}
            pattern="[0-9]{10}"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <label className="label">Photo</label>
          <input
            type="url"
            className="input input-bordered input-neutral w-full rounded-2xl"
            placeholder="Photo URL"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
          />

          <button
            onClick={updateUserProfile}
            className="btn btn-secondary w-1/2 rounded-3xl mt-4 mx-auto"
          >
            Update
          </button>
        </fieldset>
      </div>
      <div className="hidden lg:flex divider divider-horizontal mx-6"></div>
      <div className="card bg-base-300 shadow-md flex-1 flex items-center justify-center rounded-box p-6">
        <div className="card bg-base-100 shadow-lg w-full max-w-sm mx-auto">
          <figure className="px-6 pt-6">
            <img
              className="rounded-xl w-40 h-40 object-cover shadow"
              src={photo || "https://via.placeholder.com/150"}
              alt="User Profile"
            />
          </figure>
          <div className="card-body items-center text-center">
            <h2 className="card-title text-xl font-bold">
              {user?.fullName || `${firstName} ${lastName}`}
            </h2>
            <div className="py-4 text-base w-full max-w-xs">
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <span className="font-semibold text-right">Email:</span>
                <span className="truncate">{user?.email}</span>
                <span className="font-semibold text-right">Phone:</span>
                <span>{phone}</span>
                {/* <span className="font-semibold text-right">Age:</span> */}
                {/* <span>{age}</span> */}
                <span className="font-semibold text-right">Gender:</span>
                <span className="capitalize">{gender}</span>
              </div>
            </div>
            <Link to="/">
              <button className="btn btn-primary rounded-3xl">
                Go to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
