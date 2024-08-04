import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./config/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./config/firebase-config";
import { Modal, Form, Input, Button } from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import CameraCapture from "./components/CameraCapture";

function Profile({ user, userData }) {
  const [form] = Form.useForm();
  const [toggle, setToggle] = useState(userData?.hasBiometric || false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleBiometricChange = async (isChecked) => {
    setToggle(isChecked);
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { hasBiometric: isChecked }, { merge: true });
      } catch (err) {
        console.error("Error updating document:", err);
      }
    }
  };

  return (
    user && (
      <div className="flex flex-col items-center w-[1120px] h-[513px] mx-auto my-20 px-3 py-2  ">
        <div className="flex flex-row items-center justify-between gap-4 bg-slate-200/30 border rounded-lg p-4 border-purple-400 w-full h-full">
          <div className="flex flex-col ml-40">
            <h1 className="text-xl font-bold text-indigo-950 mb-1">Name</h1>
            <h2 className="text-lg text-indigo-950 mb-1">
              {user.displayName || "example"}
            </h2>
            <div className="h-[40px]"></div>
            <h2 className="text-xl font-bold text-indigo-950 mb-1">Email</h2>
            <p className="text-lg text-gray-600">
              {user.email || "example@gmail.com"}
            </p>
            <div className="h-[40px]"></div>
            <h2 className="text-xl font-bold text-indigo-950 mb-1">Points</h2>
            <p className="text-lg text-gray-600">{userData?.points || "0"}</p>
            <h2 className="text-xl mt-10 font-bold text-indigo-950 mb-1">
              Biometric Authorization
            </h2>
            {!userData?.isBiometricRegistered ? (
              <Button onClick={handleOpenModal}>Register</Button>
            ) : (
              <label className="inline-flex items-center me-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={toggle}
                  onChange={(e) => handleBiometricChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            )}
          </div>
          <div className="flex flex-col items-center mb-8 mr-40">
            <div className="relative w-[170px] h-[170px] mb-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300 rounded-full text-gray-600">
                  No Photo
                </div>
              )}
            </div>
          </div>
        </div>
        <Modal
          title="Biometric Auth"
          open={isModalOpen}
          footer={null}
          onCancel={handleCloseModal}
        >
          <p>
            At ManaSatarang, safeguarding your privacy is our utmost priority.
            We employ facial authentication to ensure that only authorized
            individuals can access their personal data. This advanced security
            measure helps maintain the confidentiality of your sensitive
            information, offering you a secure and trustworthy environment to
            support your mental health journey.
          </p>

          <CameraCapture userData={userData} />
        </Modal>
      </div>
    )
  );
}

export default Profile;
