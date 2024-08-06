import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate('config/firebase-config.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

# Therapists' data
therapists = [
    {"name": "Dr. Shalini Singh", "specialization": "Clinical Psychologist", "email": "shalini.singh@example.com", "bio": "Dr. Shalini Singh has over 15 years of experience in clinical psychology, specializing in anxiety and depression.", "location": "Mumbai, Maharashtra", "fees": 1500},
    {"name": "Dr. Rajesh Kumar", "specialization": "Psychiatrist", "email": "rajesh.kumar@example.com", "bio": "Dr. Rajesh Kumar is a renowned psychiatrist with 20 years of experience in treating mood disorders.", "location": "Delhi", "fees": 2000},
    {"name": "Dr. Anjali Mehta", "specialization": "Counseling Psychologist", "email": "anjali.mehta@example.com", "bio": "Dr. Anjali Mehta specializes in family and relationship counseling with over 10 years of experience.", "location": "Bangalore, Karnataka", "fees": 1200},
    {"name": "Dr. Rakesh Sharma", "specialization": "Clinical Psychologist", "email": "rakesh.sharma@example.com", "bio": "Dr. Rakesh Sharma focuses on cognitive behavioral therapy for anxiety and OCD.", "location": "Chennai, Tamil Nadu", "fees": 1800},
    {"name": "Dr. Priya Menon", "specialization": "Child Psychologist", "email": "priya.menon@example.com", "bio": "Dr. Priya Menon has a decade of experience working with children with behavioral issues.", "location": "Hyderabad, Telangana", "fees": 1500},
    {"name": "Dr. Amit Patel", "specialization": "Psychiatrist", "email": "amit.patel@example.com", "bio": "Dr. Amit Patel is an expert in treating schizophrenia and bipolar disorder with 18 years of experience.", "location": "Pune, Maharashtra", "fees": 2200},
    {"name": "Dr. Neha Gupta", "specialization": "Clinical Psychologist", "email": "neha.gupta@example.com", "bio": "Dr. Neha Gupta specializes in trauma and PTSD counseling.", "location": "Kolkata, West Bengal", "fees": 1700},
    {"name": "Dr. Sanjay Verma", "specialization": "Counseling Psychologist", "email": "sanjay.verma@example.com", "bio": "Dr. Sanjay Verma focuses on stress management and life coaching.", "location": "Ahmedabad, Gujarat", "fees": 1400},
    {"name": "Dr. Kavita Desai", "specialization": "Child and Adolescent Psychologist", "email": "kavita.desai@example.com", "bio": "Dr. Kavita Desai has expertise in dealing with ADHD and learning disabilities.", "location": "Jaipur, Rajasthan", "fees": 1600},
    {"name": "Dr. Vikram Singh", "specialization": "Psychiatrist", "email": "vikram.singh@example.com", "bio": "Dr. Vikram Singh is known for his work in addiction therapy.", "location": "Lucknow, Uttar Pradesh", "fees": 2000},
    {"name": "Dr. Reena Shah", "specialization": "Clinical Psychologist", "email": "reena.shah@example.com", "bio": "Dr. Reena Shah focuses on marital counseling and has 12 years of experience.", "location": "Chandigarh", "fees": 1300},
    {"name": "Dr. Manish Jain", "specialization": "Psychiatrist", "email": "manish.jain@example.com", "bio": "Dr. Manish Jain specializes in neuropsychiatry with a focus on dementia.", "location": "Bhopal, Madhya Pradesh", "fees": 2100},
    {"name": "Dr. Swati Deshmukh", "specialization": "Counseling Psychologist", "email": "swati.deshmukh@example.com", "bio": "Dr. Swati Deshmukh has a focus on grief counseling and life transitions.", "location": "Nagpur, Maharashtra", "fees": 1500},
    {"name": "Dr. Abhishek Rao", "specialization": "Clinical Psychologist", "email": "abhishek.rao@example.com", "bio": "Dr. Abhishek Rao is an expert in cognitive behavioral therapy for phobias.", "location": "Kochi, Kerala", "fees": 1800},
    {"name": "Dr. Meena Arora", "specialization": "Psychiatrist", "email": "meena.arora@example.com", "bio": "Dr. Meena Arora specializes in women's mental health and postpartum depression.", "location": "Indore, Madhya Pradesh", "fees": 2000}
]

# Adding data to Firestore
for therapist in therapists:
    doc_ref = db.collection('therapists').add(therapist)
    print(f'Added therapist with ID: {doc_ref[1].id}')
