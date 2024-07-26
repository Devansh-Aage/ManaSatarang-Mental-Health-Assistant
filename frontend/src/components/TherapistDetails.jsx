import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { DatePicker, Space } from "antd";
import { TimePicker } from "antd";
import dayjs from "dayjs";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../config/firebase-config";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";

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
    e.preventDefault();
    
    try {
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (!stripe) {
        throw new Error("Stripe has not loaded correctly.");
      }
      
      toast.info("Redirecting to Stripe Payment Gateway");
  
      const response = await fetch(`http://localhost:5000/api/payment/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formstate: formState }),
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
  
      const session = await response.json();
      if (!session.id) {
        throw new Error("No session ID received from the server.");
      }
  
      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
  
      // Assuming Stripe redirect handles appointment creation
      await addDoc(collection(db, "appointments"), {
        therapistId: formState.TherapistId,
        userId: user.uid,
        date: formState.appDate,
        time: formState.time,
        fees: formState.fee,
      });
  
      toast.success("Appointment successfully booked");
      
    } catch (error) {
      console.error("Error during payment or appointment creation:", error);
      toast.error("An error occurred during the payment process.");
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
