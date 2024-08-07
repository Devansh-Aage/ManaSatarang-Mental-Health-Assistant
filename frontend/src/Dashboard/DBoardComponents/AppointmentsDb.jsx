import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../config/firebase-config";
import { useNavigate } from "react-router-dom";
import { chatHrefConstructor, translateText } from "../../utils";
import { Card, Skeleton } from "antd";

const AppointmentsDb = ({ user, lang }) => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staticText, setstaticText] = useState([
    "Upcoming Appointments",
    "View all Appointments",
  ]);
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

          const sortedAppointments = mergedAppointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
          });

          if (sortedAppointments.length > 0) {
            setAppointment(sortedAppointments[0]);
          } else {
            setAppointment(null); // Handle case with no appointments
          }
        } catch (error) {
          console.error("Error fetching appointments:", error);
        } finally {
          setLoading(false); // Ensure loading state is stopped
        }
      }
    };

    getAppointments();
  }, [user]);

  useEffect(() => {
    const translatePage=async()=>{
      const translatedPage = await Promise.all(
        staticText.map(async (t) => {
          const translatedMsg = await translateText(t, lang);
          return translatedMsg;
        })
      );
      setstaticText(translatedPage)
    }
    translatePage()
  }, [lang])
  

  const handleViewAllClick = () => {
    router("/appointments");
  };

  return (
    <div className="bg-white border rounded-xl p-4 flex flex-col items-center justify-center row-span-2 md:row-span-3">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        {staticText[0]}
      </h2>
      <div className="flex items-center justify-center flex-wrap gap-5 mx-2 mt-5 w-full">
        {loading ? (
          <Skeleton height={120} width={300} className="mb-4" count={1} />
        ) : appointment ? (
          <AppointmentItem appointment={appointment} router={router} />
        ) : (
          <div>You have no appointments</div>
        )}
      </div>
      <div
        className="mt-4 text-gray-600 cursor-pointer text-sm hover:underline"
        onClick={handleViewAllClick}
      >
        {appointment && staticText[1]}
      </div>
    </div>
  );
};

const AppointmentItem = ({ appointment, router }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
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

  return (
    <div className="mb-4">
      {loading ? (
        <Skeleton height={120} width={300} className="mb-4" count={1} />
      ) : (
        <Card
          title={patient && patient.name}
          bordered={false}
          style={{ width: 300 }}
          className="hover:border hover:border-purple-600 border-transparent"
        >
          <p>Date: {appointment.date}</p>
          <p className="mb-2">Time: {appointment.time}</p>
          <div
            onClick={handleChatClick}
            className="cursor-pointer bg-purple-900 hover:bg-purple-800 px-4 py-2 text-white rounded-lg"
          >
            Chat
          </div>
        </Card>
      )}
    </div>
  );
};

export default AppointmentsDb;
