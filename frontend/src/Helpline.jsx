import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Slider from "react-slick";
import { translateText } from "./utils";

const Helpline = ({ lang }) => {
  const [staticText, setStaticText] = useState([
    "Mental Health Helpline Dashboard",
    "Helpline Numbers",
    "Websites for Mental Health Help",
    "Websites for Exercises",
    "Things to Do in Different Mental Health Emergency Situations",

    "If You're Feeling Suicidal",
    "Call a crisis hotline immediately.",
    "Reach out to a friend or family member.",
    "Stay away from harmful substances.",

    "If You're Experiencing a Panic Attack",
    "Find a quiet space and practice deep breathing.",
    "Focus on grounding techniques like 5-4-3-2-1.",
    "Talk to someone you trust about how you're feeling.",

    "If You're in an Abusive Situation",
    "Contact the National Domestic Violence Hotline.",
    "Create a safety plan with trusted friends or family.",
    "Seek professional support from a counselor.",
  ]);

  const helplineNumbers = [
    { name: "Arpita Suicide Prevention Helpline", number: "080-23655557" },
    { name: "Vandrevala Foundation", number: "9999 666 555" },
    { name: "Parivarthan", number: "+91-7676602602" },
  ];

  const mentalHealthWebsites = [
    { name: "Very Well Mind", url: "https://www.verywellmind.com/" },
    { name: "Betterlyf", url: "https://www.betterlyf.com/" },
    { name: "Amaha Health", url: "https://www.amahahealth.com/" },
  ];

  const exerciseWebsites = [
    { name: "Fitness Blender", url: "https://www.fitnessblender.com" },
    { name: "Yoga with Adriene", url: "https://www.yogawithadriene.com" },
    { name: "Workout Trainer", url: "https://www.workouttrainer.com" },
  ];

  const [emergencySituations, setEmergencySituations] = useState([
    {
      title: "If You're Feeling Suicidal",
      actions: [
        "Call a crisis hotline immediately.",
        "Reach out to a friend or family member.",
        "Stay away from harmful substances.",
      ],
    },
    {
      title: "If You're Experiencing a Panic Attack",
      actions: [
        "Find a quiet space and practice deep breathing.",
        "Focus on grounding techniques like 5-4-3-2-1.",
        "Talk to someone you trust about how you're feeling.",
      ],
    },
    {
      title: "If You're in an Abusive Situation",
      actions: [
        "Contact the National Domestic Violence Hotline.",
        "Create a safety plan with trusted friends or family.",
        "Seek professional support from a counselor.",
      ],
    },
  ]);

  useEffect(() => {
    const translateStaticText = async () => {
      try {
        const translatedTextArray = await Promise.all(
          staticText.map((text) => translateText(text, lang))
        );

        setStaticText(translatedTextArray);
      } catch (error) {
        console.error("Error translating text:", error);
      }
    };

    const translateEmergencySituations = async () => {
      try {
        const translatedSituations = await Promise.all(
          emergencySituations.map(async (situation) => {
            const translatedTitle = await translateText(situation.title, lang);
            const translatedActions = await Promise.all(
              situation.actions.map((action) => translateText(action, lang))
            );
            return { title: translatedTitle, actions: translatedActions };
          })
        );
        setEmergencySituations(translatedSituations);
      } catch (error) {
        console.error("Error translating emergency situations:", error);
      }
    };

    translateEmergencySituations();

    translateStaticText();
  }, [lang]);


  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <motion.h1
          className="text-4xl font-bold mb-6 text-center font-serif"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {staticText[0]}
        </motion.h1>
        <p className="text-center text-base italic mb-8 font-serif">
          “You don’t have to control your thoughts. You just have to stop
          letting them control you.” – Dan Millman
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-blue-100 p-4 rounded-lg shadow transition-transform transform hover:scale-105"
            initial={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-2">{staticText[1]}</h2>
            <ul className="list-disc pl-5">
              {helplineNumbers.map((helpline) => (
                <li key={helpline.name} className="mb-1">
                  <span className="font-semibold">{helpline.name}:</span>{" "}
                  {helpline.number}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="bg-green-100 p-4 rounded-lg shadow transition-transform transform hover:scale-105"
            initial={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-2">{staticText[2]}</h2>
            <ul className="list-disc pl-5">
              {mentalHealthWebsites.map((site) => (
                <li key={site.name} className="mb-1">
                  <a href={site.url} className="text-blue-500 hover:underline">
                    {site.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="bg-yellow-100 p-4 rounded-lg shadow transition-transform transform hover:scale-105"
            initial={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-2">{staticText[3]}</h2>
            <ul className="list-disc pl-5">
              {exerciseWebsites.map((site) => (
                <li key={site.name} className="mb-1">
                  <a href={site.url} className="text-blue-500 hover:underline">
                    {site.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          className="bg-red-100 p-4 rounded-lg shadow mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-2">{staticText[4]}</h2>
          <Slider {...settings}>
            {emergencySituations.map((situation) => (
              <div key={situation.title} className="p-4">
                <h3 className="font-semibold">{situation.title}</h3>
                <ul className="list-disc pl-5">
                  {situation.actions.map((action, index) => (
                    <li key={index} className="mb-1">
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Slider>
        </motion.div>
      </div>
    </div>
  );
};

export default Helpline;
