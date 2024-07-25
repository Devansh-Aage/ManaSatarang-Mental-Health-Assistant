import React from "react";
import TherapistCard from "./components/TherapistCard";

const therapists = [
  {
    name: "Dr. Emily Johnson",
    degree: "Ph.D. in Clinical Psychology",
    experience: "10 years",
    specialty: "Cognitive Behavioral Therapy (CBT)",
    imgPath: "/female1.jpg",
    fees: 1500, // Example fee calculation based on experience and specialty
  },
  {
    name: "Dr. Michael Smith",
    degree: "Psy.D. in Clinical Psychology",
    experience: "8 years",
    specialty: "Trauma and PTSD",
    imgPath: "/male1.jpg",
    fees: 1400, // Example fee calculation based on experience and specialty
  },
  {
    name: "Dr. Sarah Brown",
    degree: "M.S. in Counseling Psychology",
    experience: "6 years",
    specialty: "Anxiety and Depression",
    imgPath: "/female2.jpg",
    fees: 1300, // Example fee calculation based on experience and specialty
  },
  {
    uid: "oQyoMJNC6oZ3gh2Xxv8LIZTgfuw2",
    name: "Dr. David Miller",
    degree: "Ph.D. in Counseling Psychology",
    experience: "12 years",
    specialty: "Family and Couples Therapy",
    imgPath: "/male2.jpg",
    fees: 1600, // Example fee calculation based on experience and specialty
  },
  {
    name: "Dr. Laura Wilson",
    degree: "M.A. in Clinical Mental Health Counseling",
    experience: "5 years",
    specialty: "Mindfulness and Stress Management",
    imgPath: "/female3.jpg",
    fees: 1300, // Example fee calculation based on experience and specialty
  },
];

const Therapists = () => {
  return (
    <div className="flex items-center justify-around gap-4">
      {therapists.map((therapists) => (
        <TherapistCard {...therapists} />
      ))}
    </div>
  );
};

export default Therapists;
