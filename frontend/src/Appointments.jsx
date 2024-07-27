import { collection, getDocs, query, where } from "firebase/firestore";
import { React, useEffect,useState } from "react";
import { db } from "./config/firebase-config";
import { useNavigate } from "react-router-dom";
import { chatHrefConstructor } from "./utils";

const Appointments = ({ user }) => {
  const [appointments, setAppointment] = useState([]);
  const router=useNavigate();
  const getAppointments = async () => {
    if (user) {
      const appointmentRef = collection(db, "appointments");

      // Query for therapistId
      const q1 = query(appointmentRef, where("therapistId", "==", user.uid));
      const appointmentSnapshot1 = await getDocs(q1);

      // Query for userId
      const q2 = query(appointmentRef, where("userId", "==", user.uid));
      const appointmentSnapshot2 = await getDocs(q2);

      // Combine the results
      const appointments1 = appointmentSnapshot1.docs.map((doc) => doc.data());
      const appointments2 = appointmentSnapshot2.docs.map((doc) => doc.data());

      // Combine and remove duplicates (if any)
      const appointments = [...appointments1, ...appointments2];
      //   const uniqueAppointments = Array.from(new Set(appointments.map(a => a.id))).map(id => {
      //     return appointments.find(a => a.id === id);
      //   });

      console.log(appointments);
      setAppointment(appointments);
    }
  };

 

  useEffect(() => {
    getAppointments();
  }, [user]);

  return (
    <>
      Appointments
      {appointments &&
        appointments.map((a) => (
          <div className="mb-4">
            <div>Date:{a.date}</div>
            <div>Time:{a.time}</div>
            <div onClick={()=> router(`/chat/${chatHrefConstructor(a.therapistId,a.userId)}`)} className="px-4 py-2 bg-blue-600 text-white">Chat</div>
          </div>
        ))}
    </>
  );
};

export default Appointments;
