import { auth } from "./firebase.js";

import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { requireRole } from "./auth-guard.js";

await requireRole(["admin"]);

/* ======================
   AUTH GUARD
====================== */

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

/* ======================
   LOGOUT
====================== */

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {
  const result = await Swal.fire({
    title: "Logout?",
    text: "Sesi login akan diakhiri",
    icon: "warning",

    showCancelButton: true,

    confirmButtonText: "Ya, Logout",
    cancelButtonText: "Batal",
  });

  if (!result.isConfirmed) return;

  await signOut(auth);

  window.location.href = "index.html";
});
