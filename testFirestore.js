const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
require("dotenv").config(); // Load environment variables

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addTestEntry() {
  try {
    const docRef = await addDoc(collection(db, "time_entries"), {
      activity: "Testing from Node.js",
      startTime: "10:00",
      date: new Date().toISOString().split("T")[0],
    });
    console.log("✅ Test entry added with ID:", docRef.id);
  } catch (error) {
    console.error("❌ Error adding test entry:", error);
  }
}

addTestEntry();

