import { auth } from "./firebase.js";

import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const loadingScreen = document.getElementById("loadingScreen");

const loginSection = document.getElementById("loginSection");

// cek auth
onAuthStateChanged(auth, (user) => {
  // sudah login
  if (user) {
    window.location.href = "pos.html";
  }

  // belum login
  else {
    loadingScreen.classList.add("d-none");

    loginSection.classList.remove("d-none");
  }
});

// cek apakah sudah login
// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     window.location.href = "pos.html";
//   }
// });

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;

  const password = document.getElementById("password").value;

  // VALIDASI
  if (!email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Oops...",
      text: "Email dan password wajib diisi",
    });

    return;
  }

  // LOADING
  loginBtn.disabled = true;

  loginBtn.innerHTML = `
    Loading...
  `;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    // SUCCESS
    // await Swal.fire({
    //   icon: "success",
    //   title: "Login Berhasil",
    //   text: "Selamat datang 👋",
    //   timer: 1500,
    //   showConfirmButton: false,
    // });

    window.location.href = "pos.html";
  } catch (error) {
    let message = "Terjadi kesalahan";

    // ERROR FIREBASE
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

    loginBtn.innerHTML = `
      Login
    `;
  }
});
