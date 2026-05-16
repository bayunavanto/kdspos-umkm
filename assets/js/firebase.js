import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD05mUwAv-IM504OtUTj6cvz59QBk8T9ps",
  authDomain: "kdspos-umkm.firebaseapp.com",
  projectId: "kdspos-umkm",
  storageBucket: "kdspos-umkm.firebasestorage.app",
  messagingSenderId: "232326606429",
  appId: "1:232326606429:web:d12c86689feb83b06a67b4",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export { auth, db };
