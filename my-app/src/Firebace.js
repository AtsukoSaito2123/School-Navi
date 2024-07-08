
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { EmailAuthProvider, getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBvCwm76kvFYRoFq48jcXePyJRSdhlKnYQ",
    authDomain: "school-navi-eeef2.firebaseapp.com",
    projectId: "school-navi-eeef2",
    storageBucket: "school-navi-eeef2.appspot.com",
    messagingSenderId: "768874966647",
    appId: "1:768874966647:web:71a9bb0540335c367c2072",
    measurementId: "G-L0PKMP5FKD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const emailProvider = new EmailAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { analytics, auth, provider, emailProvider, db, storage };