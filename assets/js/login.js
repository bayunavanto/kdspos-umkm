import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ======================
   ELEMENT
====================== */

const loginBtn = document.getElementById("loginBtn");

const loadingScreen = document.getElementById("loadingScreen");

const loginSection = document.getElementById("loginSection");

/* ======================
   REDIRECT BASED ROLE
====================== */

async function redirectByRole(user) {
  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (!userDoc.exists()) {
    throw new Error("Role user tidak ditemukan");
  }

  const userData = userDoc.data();

  const role = userData.role;

  /* ======================
     ROLE REDIRECT
  ====================== */

  if (role === "admin") {
    window.location.href = "dashboard.html";
  } else if (role === "cashier") {
    window.location.href = "pos.html";
  } else if (role === "kitchen") {
    window.location.href = "kds.html";
  } else {
    throw new Error("Role tidak valid");
  }
}

/* ======================
   AUTH CHECK
====================== */

onAuthStateChanged(auth, async (user) => {
  // SUDAH LOGIN
  if (user) {
    try {
      await redirectByRole(user);
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.message,
      });
    }

    return;
  }

  // BELUM LOGIN
  loadingScreen.classList.add("d-none");

  loginSection.classList.remove("d-none");
});

/* ======================
   LOGIN
====================== */

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;

  const password = document.getElementById("password").value;

  /* VALIDASI */

  if (!email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Oops...",
      text: "Email dan password wajib diisi",
    });

    return;
  }

  /* LOADING */

  loginBtn.disabled = true;

  loginBtn.innerHTML = "Loading...";

  try {
    await signInWithEmailAndPassword(auth, email, password);

    // redirect otomatis lewat onAuthStateChanged
  } catch (error) {
    let message = "Terjadi kesalahan";

    if (error.code === "auth/invalid-credential") {
      message = "Email atau password salah";
    }

    Swal.fire({
      icon: "error",
      title: "Login Gagal",
      text: message,
    });
  } finally {
    loginBtn.disabled = false;

    loginBtn.innerHTML = "Login";
  }
});
