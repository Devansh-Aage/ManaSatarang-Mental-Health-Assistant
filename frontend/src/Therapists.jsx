import React, { useState, useEffect, useMemo } from "react";
import TherapistCard from "./components/TherapistCard";
import axios from "axios";
import { translateText } from "./utils";
import { db } from "./config/firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";

const Therapists = ({ lang, user, userData }) => {
  const [staticText, setStaticText] = useState([
    "Meet Our Therapists",
    "Our team of highly qualified therapists is here to support your mental health journey. Explore our range of specialized programs and find the right fit for you.",
    "About Mental Therapy",
    "Mental therapy is an effective way to address a variety of psychological and emotional issues. Our therapists use evidence-based techniques to help you manage stress, overcome challenges, and improve your overall well-being. Whether you are dealing with anxiety, depression, or other mental health concerns, we offer personalized support to meet your needs.",
    "Our experienced therapists provide a range of services to support your mental health. From individual therapy sessions to group workshops, we offer comprehensive support tailored to your specific needs. Our team is committed to creating a safe and supportive environment where you can explore your feelings, set goals, and work towards a healthier, happier you.",
    "Therapists We Provide",
    "Recommended Therapists",
  ]);
  const [therapists, settherapists] = useState([]);
  const [recommendTherapist, setrecommendTherapist] = useState([]);
  const [recTherapistData, setrecTherapistData] = useState([]);

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
      } catch (error) {
        console.error("Error fetching recommended therapists:", error);
      }
    };

    fetchTherapists();
    fetchRecommendTherapist();
  }, [user?.uid]);

  useEffect(() => {
    const translateStaticText = async () => {
      const translatedTextArray = await Promise.all(
        staticText.map((text) => translateText(text, lang))
      );
      setStaticText(translatedTextArray);
    };

    translateStaticText();
  }, [lang]);

  const cachedEmails = useMemo(() => recommendTherapist, [recommendTherapist]);

  const getRecTherapist = async () => {
    const therapistDetails = [];
    try {
      for (let email of cachedEmails) {
        const therapistQuery = query(
          collection(db, "therapists"),
          where("email", "==", email)
        );
        const therapistSnapshot = await getDocs(therapistQuery);
        therapistSnapshot.forEach((doc) => {
          therapistDetails.push({ id: doc.id, ...doc.data() });
        });
      }
    } catch (error) {
      console.error("Error fetching recommended therapists' details:", error);
      toast.error("Error fetching recommended therapists' details");
    }
    setrecTherapistData(therapistDetails);
  };

  // useMemo hook to cache the recommended therapist data
  useMemo(() => {
    if (cachedEmails.length > 0) {
      getRecTherapist();
    }
  }, [cachedEmails]);

  

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

      {/* Therapist Cards */}
      <h2 className="font-extrabold text-2xl text-indigo-950 mb-5">
        {staticText[5]}
      </h2>
      <div className="flex flex-wrap gap-5 justify-center">
        {therapists.map((therapist, index) => (
          <TherapistCard
            key={index}
            {...therapist}
            userData={userData}
            lang={lang}
          />
        ))}
      </div>

      <h2 className="font-extrabold text-3xl text-indigo-950 mb-3">
        {staticText[6]}
      </h2>
      <div className="flex flex-wrap gap-5 justify-center">
        {recTherapistData.length>0 ?
        recTherapistData.map((therapist, index) => (
          <TherapistCard
            key={index}
            {...therapist}
            userData={userData}
            lang={lang}
          />
         
        )):
        <Skeleton width={250} height={300} count={5} inline borderRadius={12}  className=" mr-2"  />
        }
      </div>
    </div>
  );
};

export default Therapists;
