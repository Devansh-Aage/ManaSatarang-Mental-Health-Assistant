import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { DatePicker, Space } from "antd";
import { TimePicker } from "antd";
import dayjs from "dayjs";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase-config";
// import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";

const TherapistDetails = () => {
  const location = useLocation();
  const { name, degree, experience, specialty, imgPath, fees } =
    location.state || {};
  const [user, loading, error] = useAuthState(auth);

  const format = "HH:mm";

  const [formState, setFormState] = useState({
    userId: user?.uid,
    TherapistId: "oQyoMJNC6oZ3gh2Xxv8LIZTgfuw2",
    appDate: "",
    time: "",
    fee: fees,
  });

  useEffect(() => {
    setFormState((prevState) => ({ ...prevState, userId: user?.uid }));
  }, [user]);

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
      console.log("Fees: ", fees);  // Ensure this prints the correct fee

      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      toast.info("Redirecting to Stripe Payment Gateway");
      const body = {
        formstate: formState,
      };

      const headers = {
        "Content-Type": "application/json",
      };

      const response = await fetch(`http://localhost:5000/api/payment/checkout`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      const session = await response.json();
      console.log("Session: ", session);  // Ensure session is received correctly

      const result = stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error((await result).error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="container mx-auto p-4">
        {user ? (
          <>
            <div className="border rounded-lg flex flex-col items-center gap-4 p-4">
              <img
                src={imgPath}
                alt=""
                className="w-[20%] h-[20%] aspect-square"
              />
              <div>{name}</div>
              <div>{degree}</div>
              <div>{experience}</div>
              <div>{specialty}</div>
              <div>&#x20b9;{fees}</div>
            </div>
            <form action="">
              <DatePicker
                name="appDate"
                value={formState.appDate ? dayjs(formState.appDate) : null}
                onChange={handleDateChange}
              />
              <TimePicker
                name="time"
                value={formState.time ? dayjs(formState.time, format) : null}
                format={format}
                onChange={handleTimeChange}
              />
              <button onClick={payment}>Pay</button>
            </form>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default TherapistDetails;
