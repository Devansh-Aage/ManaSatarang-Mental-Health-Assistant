import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../config/firebase-config";

function CurrentTherapist({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [therapistData, settherapistData] = useState(null);

  useEffect(() => {
    const getAppointments = async () => {
      if (user) {
        const appointmentRef = collection(db, "appointments");

        // Query for appointments where either therapistId or userId matches user.uid
        const q1 = query(appointmentRef, where("therapistId", "==", user.uid));
        const q2 = query(appointmentRef, where("userId", "==", user.uid));

        try {
          const [appointmentSnapshot1, appointmentSnapshot2] =
            await Promise.all([getDocs(q1), getDocs(q2)]);

          const appointments1 = appointmentSnapshot1.docs.map((doc) =>
            doc.data()
          );
          const appointments2 = appointmentSnapshot2.docs.map((doc) =>
            doc.data()
          );

          const mergedAppointments = [...appointments1, ...appointments2];
          setAppointments(mergedAppointments);
        } catch (error) {
          console.error("Error fetching appointments:", error);
        }
      }
    };

    getAppointments();
  }, [user]);

  const getTherapist = async () => {
    if (appointments) {
      try {
        const userDocRef = doc(db, "users", appointments[0].therapistId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          settherapistData(userDoc.data());
        } else {
          console.log("No such document!");
        }
      } catch (err) {
        console.error("Error getting document:", err);
      }
    }
  };
  useEffect(() => {
    getTherapist();
  }, [appointments]);

  return (
    <div className="bg-white border rounded-xl p-4 flex flex-col items-center justify-center row-span-2">
      {user ? (
        <>
          <h2 className="text-lg text-black mb-7">Current Therapist</h2>
          <img
            src={therapistData?.photoURL || "default_therapist_icon.png"}
            alt="Therapist Icon"
            width={90}
            height={90}
            className="mb-4 rounded-full"
          />
          <p className="text-gray-700 text-md">{therapistData?.displayName}</p>
          <p className="text-gray-400 text-sm">{therapistData?.email}</p>
        </>
      ) : (
        <p className="text-gray-500 text-sm mb-4">Loading...</p>
      )}
    </div>
  );
}

export default CurrentTherapist;
