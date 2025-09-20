
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDouk8K96WeuEStUGiN6yT38xt8gmOUuTI",
  authDomain: "nextstep-c6b0d.firebaseapp.com",
  projectId: "nextstep-c6b0d",
  storageBucket: "nextstep-c6b0d.firebasestorage.app",
  messagingSenderId: "256508184546",
  appId: "1:256508184546:web:c6eaa9e722f94a26e35bbb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);