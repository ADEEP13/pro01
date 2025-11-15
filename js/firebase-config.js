import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCotUyLpRTNxZx-s_kAWoq5k4B_yt28jsc",
  authDomain: "svit-ise-proj.firebaseapp.com",
  projectId: "svit-ise-proj",
  storageBucket: "svit-ise-proj.firebasestorage.app",
  messagingSenderId: "781166034018",
  appId: "1:781166034018:web:0c273de9aef9b0df18253b",
  measurementId: "G-Z3NTWCL6C6"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
