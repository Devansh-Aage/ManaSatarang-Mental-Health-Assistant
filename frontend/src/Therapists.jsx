import React from 'react'

const therapists = [
    {
      name: "Dr. Emily Johnson",
      degree: "Ph.D. in Clinical Psychology",
      experience: "10 years",
      specialty: "Cognitive Behavioral Therapy (CBT)",
      imgPath:"/female1.jpg"
    },
    {
      name: "Dr. Michael Smith",
      degree: "Psy.D. in Clinical Psychology",
      experience: "8 years",
      specialty: "Trauma and PTSD",
      imgPath:"/male1.jpg"
    },
    {
      name: "Dr. Sarah Brown",
      degree: "M.S. in Counseling Psychology",
      experience: "6 years",
      specialty: "Anxiety and Depression",
      imgPath:"/female2.jpg"
    },
    {
      name: "Dr. David Miller",
      degree: "Ph.D. in Counseling Psychology",
      experience: "12 years",
      specialty: "Family and Couples Therapy",
      imgPath:"/male2.jpg"
    },
    {
      name: "Dr. Laura Wilson",
      degree: "M.A. in Clinical Mental Health Counseling",
      experience: "5 years",
      specialty: "Mindfulness and Stress Management",
      imgPath:"/female1.jpg"
    }
  ];

  
const Therapists = () => {
  return (
    <div>
      {
        therapists.map((therapists)=>(
            <div>

            </div>
        ))
      }
    </div>
  )
}

export default Therapists
