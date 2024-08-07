import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./config/firebase-config";
import { useNavigate } from "react-router-dom";
import { chatHrefConstructor } from "./utils";

const Appointments = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const router = useNavigate();

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

  return (
    <div className="mx-10 my-2 mt-10">
      <h1 className="font-extrabold text-3xl text-indigo-950">Your Appointments</h1>
      
      <div className="mt-5 w-full overflow-x-auto rounded-lg">
        {appointments.length > 0 ? (
          <table className="min-w-full bg-white border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="py-2 px-4 text-left text-gray-600">Patient</th>
                <th className="py-2 px-4 text-left text-gray-600">Date</th>
                <th className="py-2 px-4 text-left text-gray-600">Time</th>
                <th className="py-2 px-4 text-left text-gray-600">Therapist</th>
                <th className="py-2 px-4 text-left text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, index) => (
                <AppointmentRow key={index} appointment={a} router={router} />
              ))}
            </tbody>
          </table>
        ) : (
          <div>You have no appointments</div>
        )}
      </div>
    </div>
  );
};

const AppointmentRow = ({ appointment, router }) => {
  const [patient, setPatient] = useState(null);
  const [therapist, setTherapist] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      const patientRef = collection(db, "users");
      const q = query(patientRef, where("uid", "==", appointment.userId));

      try {
        const patientSnapshot = await getDocs(q);
        if (!patientSnapshot.empty) {
          const patientData = patientSnapshot.docs[0].data();
          setPatient(patientData);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    const fetchTherapistData = async () => {
      const therapistRef = doc(db, "users", appointment.therapistId);

      try {
        const therapistDoc = await getDoc(therapistRef);
        if (therapistDoc.exists()) {
          setTherapist(therapistDoc.data());
        }
      } catch (error) {
        console.error("Error fetching therapist data:", error);
      }
    };

    fetchPatientData();
    fetchTherapistData();
  }, [appointment]);

  const handleChatClick = () => {
    const chatHref = chatHrefConstructor(
      appointment.therapistId,
      appointment.userId
    );
    router(`/chat/${chatHref}`);
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-2 px-4 text-gray-800">{patient?.name || "Loading..."}</td>
      <td className="py-2 px-4 text-gray-800">{appointment.date}</td>
      <td className="py-2 px-4 text-gray-800">{appointment.time}</td>
      <td className="py-2 px-4 text-gray-800">{therapist?.name || "Loading..."}</td>
      <td className="py-2 px-4">
        <button
          onClick={handleChatClick}
          className="bg-purple-900 hover:bg-purple-800 text-white px-4 py-2 rounded-lg"
        >
          Chat
        </button>
      </td>
    </tr>
  );
};

export default Appointments;
