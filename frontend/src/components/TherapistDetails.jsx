import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../config/firebase-config";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import "antd/dist/reset.css"; // Ensure Ant Design styles are imported

const TherapistDetails = () => {
  const location = useLocation();
  const { name, email, bio, specialization, profile, fees, offLocation, exp } =
    location.state || {};
  const [feesState, setFeesState] = useState(fees);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState(null);

  const getUserFromDB = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.log("No such document!");
        }
      } catch (err) {
        console.error("Error getting document:", err);
      }
    }
  };

  // useEffect(() => {
  //   if (userData?.points >= 200 & ) {
  //     setFeesState((prev) => prev - 200);
  //     setIsDiscountApplied(true);
  //   }
  // }, [userData]);

  const handleToggleDiscount = () => {
    if (isDiscountApplied) {
      setFeesState(feesState + 200);
      setIsDiscountApplied(false);
    } else {
      setFeesState(feesState - 200);
      setIsDiscountApplied(true);
    }
  };

  const format = "HH:mm";
  const [formState, setFormState] = useState({
    userId: user?.uid,
    TherapistId: "oQyoMJNC6oZ3gh2Xxv8LIZTgfuw2",
    appDate: "",
    time: "",
    fee: feesState,
  });

  useEffect(() => {
    setFormState((prevState) => ({ ...prevState, userId: user?.uid }));
    getUserFromDB();
  }, [user]);

  console.log(userData);

  const handleDateChange = (date, dateString) => {
    setFormState({ ...formState, appDate: dateString });
    console.log(dateString);
  };

  const handleTimeChange = (time, timeString) => {
    setFormState({ ...formState, time: timeString });
    console.log(timeString);
  };

  const payment = async (e) => {
    try {
      e.preventDefault();
      console.log("Form State: ", formState);
      console.log("Fees: ", feesState);
      const mycollection = collection(db, "appointments");

      const myDocumentData = {
        therapistId: formState.TherapistId,
        userId: user.uid,
        date: formState.appDate,
        time: formState.time,
        fees: formState.fee,
      };
      await addDoc(mycollection, myDocumentData);
      console.log("db,", myDocumentData);

      const stripe = await loadStripe(
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      );
      if (!stripe) {
        throw new Error("Stripe has not loaded correctly.");
      }

      toast.info("Redirecting to Stripe Payment Gateway");

      const response = await fetch(
        `http://localhost:5001/api/payment/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formstate: formState }),
        }
      );

      const session = await response.json();
      if (!session.id) {
        throw new Error("No session ID received from the server.");
      }

      const result = await stripe.redirectToCheckout({ sessionId: session.id });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Appointment successfully booked");
    } catch (error) {
      console.error("Error during payment or appointment creation:", error);
      toast.error("An error occurred during the payment process.");
    }
  };

  return (
    <div className="mx-20 mt-10 p-6 bg-white/20 backdrop-blur-md rounded-lg shadow-lg">
      {user ? (
        <>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-indigo-950 mb-4">
              Therapist Details
            </h1>
          </div>
          <div className="flex flex-row items-center bg-white shadow-lg rounded-lg p-6 mb-6">
            <img
              src={profile}
              alt={name}
              className="w-60 h-48 object-cover rounded-lg mb-4 md:mb-0 mr-10"
            />
            <div className="ml-4 flex flex-col">
              <h2 className="text-2xl font-extrabold text-indigo-950 mb-2">
                {name}
              </h2>
              <p className="text-lg text-gray-600">{bio}</p>
              <p className="text-lg text-gray-600">Experience: {exp}</p>
              <p className="text-lg text-gray-700">Location: {offLocation}</p>
              <p className="text-lg text-gray-700">
                Specialization: {specialization}
              </p>
              <p className="text-lg font-semibold text-green-600 mt-2">
                <span className={isDiscountApplied ? "line-through" : ""}>
                  &#x20b9;{feesState} per Session
                </span>{" "}
                {isDiscountApplied && (
                  <span className="text-red-600">
                    &#x20b9;{feesState} per Session (Discount Applied)
                  </span>
                )}
              </p>
              {userData?.points >= 200 && (
                <button
                  onClick={handleToggleDiscount}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {isDiscountApplied ? "Remove Discount" : "Apply Discount"}
                </button>
              )}
            </div>
          </div>

          <form className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold text-indigo-950 mb-4">
              Book a Session
            </h3>
            <div className="mb-4">
              <DatePicker
                name="appDate"
                value={formState.appDate ? dayjs(formState.appDate) : null}
                onChange={handleDateChange}
                className="w-full"
                placeholder="Select Appointment Date"
              />
            </div>
            <div className="mb-4">
              <TimePicker
                name="time"
                value={formState.time ? dayjs(formState.time, format) : null}
                format={format}
                onChange={handleTimeChange}
                className="w-full"
                placeholder="Select Appointment Time"
              />
            </div>
            <button
              onClick={payment}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Pay
            </button>
          </form>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default TherapistDetails;
