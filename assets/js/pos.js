import { auth, db } from "./firebase.js";

import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const logoutBtn = document.getElementById("logoutBtn");

const sendOrderBtn = document.getElementById("sendOrder");

const nextQueue = document.getElementById("nextQueue");

let orderType = "dine_in";

const buttons = document.querySelectorAll(".order-btn");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // reset semua
    buttons.forEach((b) => b.classList.remove("active"));

    // aktifkan yang dipilih
    btn.classList.add("active");

    // simpan value
    orderType = btn.dataset.type;
  });
});

/* ======================
   LOGOUT
====================== */

logoutBtn.addEventListener("click", async () => {
  const result = await Swal.fire({
    title: "Logout?",
    text: "Sesi login akan diakhiri",
    icon: "warning",

    showCancelButton: true,

    confirmButtonText: "Ya, Logout",
    cancelButtonText: "Batal",

    reverseButtons: true,
  });

  if (result.isConfirmed) {
    await signOut(auth);

    window.location.href = "index.html";
  }
});

/* ======================
   DATE TODAY
====================== */

function getTodayDate() {
  return new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Jakarta",
  });
}

/* ======================
   LOAD NEXT QUEUE
====================== */

async function loadNextQueue() {
  try {
    const todayDate = getTodayDate();

    const q = query(
      collection(db, "orders"),
      where("queueDate", "==", todayDate),
      orderBy("queueNumber", "desc"),
      limit(1),
    );

    const snapshot = await getDocs(q);

    let nextNumber = 1;

    if (!snapshot.empty) {
      const lastOrder = snapshot.docs[0].data();

      nextNumber = lastOrder.queueNumber + 1;
    }

    nextQueue.innerText = `#${nextNumber}`;
  } catch (error) {
    console.error(error);

    nextQueue.innerText = "#?";
  }
}

/* ======================
   SUBMIT ORDER
====================== */

sendOrderBtn.addEventListener("click", async () => {
  const customerName = document.getElementById("customerName").value.trim();

  //   const orderType = document.getElementById("orderType").value;

  const orderText = document.getElementById("orderText").value.trim();

  // VALIDASI
  if (!customerName || !orderText) {
    document.activeElement.blur();
    Swal.fire({
      icon: "warning",
      title: "Oops...",
      text: "Data pesanan belum lengkap",
    });

    return;
  }

  try {
    // disable button
    sendOrderBtn.disabled = true;

    sendOrderBtn.innerHTML = "Membuat Pesanan...";

    const todayDate = getTodayDate();

    /* ======================
       CEK ACTIVE ORDER
    ====================== */

    const activeQuery = query(
      collection(db, "orders"),
      where("status", "==", "active"),
      where("queueDate", "==", todayDate),
    );

    const activeSnap = await getDocs(activeQuery);

    let status = "active";

    let startedAt = null;

    if (!activeSnap.empty) {
      status = "pending";
    } else {
      startedAt = serverTimestamp();
    }

    /* ======================
       HITUNG QUEUE HARI INI
    ====================== */

    const todayQuery = query(
      collection(db, "orders"),
      where("queueDate", "==", todayDate),
    );

    const todaySnap = await getDocs(todayQuery);

    const queueNumber = todaySnap.size + 1;

    /* ======================
       SAVE FIRESTORE
    ====================== */

    await addDoc(collection(db, "orders"), {
      queueNumber,
      queueDate: todayDate,

      customerName,
      orderText,
      orderType,

      status,

      createdAt: serverTimestamp(),

      startedAt,

      completedAt: null,
    });

    /* ======================
       SUCCESS
    ====================== */
    document.activeElement.blur();
    await Swal.fire({
      icon: "success",
      title: "Order berhasil dikirim",
      timer: 1500,
      showConfirmButton: false,
    });

    // reset form
    document.getElementById("customerName").value = "";

    document.getElementById("orderText").value = "";

    // focus kembali
    document.getElementById("customerName").focus();

    // update preview queue
    // nextQueue.innerText = `#${queueNumber + 1}`;
    await loadNextQueue();
  } catch (error) {
    console.error(error);
    document.activeElement.blur();
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Terjadi kesalahan",
    });
  } finally {
    sendOrderBtn.disabled = false;

    sendOrderBtn.innerHTML = "Kirim Order";
  }
});
loadNextQueue();
