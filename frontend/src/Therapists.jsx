import React, { useState, useEffect } from "react";
import TherapistCard from "./components/TherapistCard";
import axios from "axios";
import { translateText } from "./utils";
import { db } from "./config/firebase-config";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";


const Therapists = ({ lang, user,userData }) => {
  const [staticText, setStaticText] = useState([
    "Meet Our Therapists",
    "Our team of highly qualified therapists is here to support your mental health journey. Explore our range of specialized programs and find the right fit for you.",
    "About Mental Therapy",
    "Mental therapy is an effective way to address a variety of psychological and emotional issues. Our therapists use evidence-based techniques to help you manage stress, overcome challenges, and improve your overall well-being. Whether you are dealing with anxiety, depression, or other mental health concerns, we offer personalized support to meet your needs.",
    "Our experienced therapists provide a range of services to support your mental health. From individual therapy sessions to group workshops, we offer comprehensive support tailored to your specific needs. Our team is committed to creating a safe and supportive environment where you can explore your feelings, set goals, and work towards a healthier, happier you.",
    "Therapists We Provide",
  ]);
  const [therapists, settherapists] = useState([]);
  const [recommendTherapist, setrecommendTherapist] = useState([]);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const therapistCollection = await getDocs(collection(db, "therapists"));
        const therapistList = therapistCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        settherapists(therapistList);
      } catch (error) {
        console.error("Error fetching therapists:", error);
      }
    };

    const fetchRecommendTherapist = async () => {
      try {
        const res = await axios.post("http://localhost:5050/recommend", {
          uid: user?.uid,
        });
        if (!res.data) {
          toast.error("Some Error Occured");
        }
        setrecommendTherapist(res.data);
        console.log(res.data);
      } catch (error) {}
    };
    fetchRecommendTherapist();

    fetchTherapists();
  }, []);

  useEffect(() => {
    const translateStaticText = async () => {
      const translatedTextArray = await Promise.all(
        staticText.map((text) => translateText(text, lang))
      );
      setStaticText(translatedTextArray);
    };

    translateStaticText();
  }, [lang]);
  console.log(recommendTherapist);

  exampleemails=['abc@gmail.com','abc@gmail.com','abc@gmail.com','abc@gmail.com','abc@gmail.com']

  // const getRecTherapist=async()=>{
  //   recommendTherapist.map(())
  //   const tcoll= await getDocs(db,'therapists',)
  // }

  return (
    <div className="relative w-full px-20 pb-10 pt-12 h-screen overflow-y-auto">
      <div className="flex flex-col items-center mb-10">
        <h2 className="font-extrabold text-3xl text-indigo-950 mb-3">
          {staticText[0]}
        </h2>
        <p className="font-semibold text-lg text-purple-400 mb-10 px-28 text-center">
          {staticText[1]}
        </p>
      </div>
      {/* Information Boxes */}
      {/* <div className="flex flex-col items-center gap-6 mb-10">
        <div className="w-full max-w-4xl p-6 bg-indigo-950 text-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">{staticText[2]}</h2>
          <p className="text-lg">{staticText[3]}</p>
        </div>
        <div className="w-full max-w-4xl p-6 bg-purple-400 text-white rounded-lg shadow-md mb-5">
          <h2 className="text-2xl font-bold mb-4">{staticText[4]}</h2>
        </div>
      </div> */}

      {/* Therapist Cards */}
      <h2 className="font-extrabold text-2xl text-indigo-950 mb-5">
        {staticText[5]}
      </h2>
      <div className="flex flex-wrap gap-5 justify-center">
        {therapists.map((therapist, index) => (
          <TherapistCard key={index} {...therapist} userData={userData} lang={lang} />
        ))}
      </div>
      <div>{recommendTherapist}</div>
    </div>
  );
};

export default Therapists;
