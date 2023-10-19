import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDsWrY5YzTJe3e-x6TcrPc_jdsDOLJOR4U",
  authDomain: "twitter-clone-b99d6.firebaseapp.com",
  projectId: "twitter-clone-b99d6",
  storageBucket: "twitter-clone-b99d6.appspot.com",
  messagingSenderId: "783604362717",
  appId: "1:783604362717:web:87d5ca2554851faee3da34",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage();

export const db = getFirestore();
