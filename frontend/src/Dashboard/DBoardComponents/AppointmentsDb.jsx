import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../config/firebase-config";
import { useNavigate } from "react-router-dom";
import { chatHrefConstructor } from "../../utils";
import { Card } from "antd";

const AppointmentsDb = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const router = useNavigate();

  useEffect(() => {
    const getAppointments = async () => {
      if (user) {
        const appointmentRef = collection(db, "appointments");

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
    <div className="bg-white border rounded-xl p-4 flex flex-col items-center justify-center  1 md: 2 row-span-1 md:row-span-2">
      <div className="flex items-center justify-center flex-wrap gap-5 mx-2 mt-5 w-full">
        {appointments.length > 0 ? (
          appointments.map((appointment, index) => (
            <AppointmentItem key={index} appointment={appointment} router={router} />
          ))
        ) : (
          <div>You have no appointments</div>
        )}
      </div>
    </div>
  );
};

const AppointmentItem = ({ appointment, router }) => {
  const [patient, setPatient] = useState(null);

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

    fetchPatientData();
  }, [appointment.userId]);

  const handleChatClick = () => {
    const chatHref = chatHrefConstructor(
      appointment.therapistId,
      appointment.userId
    );
    router(`/chat/${chatHref}`);
  };

  // const formattedDate = moment(appointment.date).format("ddd, Do MMM");

  return (
    <div className="mb-4">
      <Card
        title={patient && patient.name}
        bordered={false}
        style={{ width: 300 }}
        className="hover:border hover:border-purple-600 border-transparent"
      >
        <p className="font-semibold text-gray-600">{formattedDate}</p>
        <p>Date: {appointment.date}</p>
        <p>Time: {appointment.time}</p>
        <div
          onClick={handleChatClick}
          className="cursor-pointer bg-purple-900 hover:bg-purple-800 px-4 py-2 text-white rounded-lg"
        >
          Chat
        </div>
      </Card>
    </div>
  );
};

export default AppointmentsDb;
