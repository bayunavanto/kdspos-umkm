import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ======================
   ROLE GUARD
====================== */

export function requireRole(allowedRoles = []) {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      /* BELUM LOGIN */
      if (!user) {
        window.location.href = "index.html";
        return reject();
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        /* USER DOC TIDAK ADA */
        if (!userDoc.exists()) {
          await signOut(auth);

          window.location.href = "index.html";

          return reject();
        }

        const userData = userDoc.data();

        const role = userData.role;

        /* ADMIN BYPASS */
        if (role === "admin") {
          return resolve(userData);
        }

        /* ROLE CHECK */
        if (!allowedRoles.includes(role)) {
          await Swal.fire({
            icon: "error",
            title: "Akses Ditolak",
            text: "Kamu tidak punya akses ke halaman ini",
          });

          window.location.href = "index.html";

          return reject();
        }

        /* ROLE VALID */
        resolve(userData);
      } catch (err) {
        console.error(err);

        window.location.href = "index.html";

        reject(err);
      }
    });
  });
}
