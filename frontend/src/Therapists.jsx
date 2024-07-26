import React from "react";
import { useNavigate } from "react-router-dom";
import TherapistCard from "./components/TherapistCard";

const therapists = [
  {
    name: "Dr. Emily Johnson",
    degree: "Ph.D. in Clinical Psychology",
    experience: "10 years",
    specialty: "Cognitive Behavioral Therapy (CBT)",
    imgPath: "/female3.jpg",
    fees: 1500,
  },
  {
    name: "Dr. Michael Smith",
    degree: "Psy.D. in Clinical Psychology",
    experience: "8 years",
    specialty: "Trauma and PTSD",
    imgPath: "/male1.jpg",
    fees: 1400,
  },
  {
    name: "Dr. Sarah Brown",
    degree: "M.S. in Counseling Psychology",
    experience: "6 years",
    specialty: "Anxiety and Depression",
    imgPath: "/female2.jpg",
    fees: 1300,
  },
  {
    uid: "oQyoMJNC6oZ3gh2Xxv8LIZTgfuw2",
    name: "Dr. David Miller",
    degree: "Ph.D. in Counseling Psychology",
    experience: "12 years",
    specialty: "Family and Couples Therapy",
    imgPath: "/male2.jpg",
    fees: 1600,
  },
];

const Therapists = () => {
  const navigate = useNavigate();

  const toDetails = (therapist) => {
    navigate('/therapistDetails', {
      state: { ...therapist }
    });
  };

  return (
    <div className="relative mx-20 my-10 mt-12 pb-20">
       <div className="flex flex-col items-center mb-10">
        <h2 className="font-extrabold text-3xl text-indigo-950 mb-3">Meet Our Therapists</h2>
        <p className="font-semibold text-lg text-orange-400 mb-10 text-center">
          Our team of highly qualified therapists is here to support your mental health journey. Explore our range of specialized programs and find the right fit for you.
        </p>
      </div>
      {/* Information Boxes */}
      <div className="flex flex-col items-center gap-6 mb-10">
        <div className="w-full max-w-4xl p-6 bg-indigo-950 text-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">About Mental Therapy</h2>
          <p className="text-lg">
            Mental therapy is an effective way to address a variety of psychological and emotional issues. Our therapists use evidence-based techniques to help you manage stress, overcome challenges, and improve your overall well-being. Whether you're dealing with anxiety, depression, or other mental health concerns, we offer personalized support to meet your needs.
          </p>
        </div>
        <div className="w-full max-w-4xl p-6 bg-orange-400 text-white rounded-lg shadow-md mb-5">
          <h2 className="text-2xl font-bold mb-4">How Our Therapists Can Help</h2>
          <p className="text-lg">
            Our experienced therapists provide a range of services to support your mental health. From individual therapy sessions to group workshops, we offer comprehensive support tailored to your specific needs. Our team is committed to creating a safe and supportive environment where you can explore your feelings, set goals, and work towards a healthier, happier you.
          </p>
        </div>
      </div>

      {/* Therapist Cards */}
      <h2 className="font-extrabold text-2xl text-indigo-950 mb-5">Therapists We Provide</h2>
      <div className="flex flex-wrap gap-5 justify-center">
        {therapists.map((therapist, index) => (
            <TherapistCard {...therapist} />
        ))}
      </div>
    </div>
  );
};

export default Therapists;
