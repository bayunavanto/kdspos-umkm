import { db, auth } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { requireRole } from "./auth-guard.js";
await requireRole(["kitchen"]);

/* ======================
   UTIL
====================== */

function getTodayDate() {
  return new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Jakarta",
  });
}

function formatOrderType(type) {
  if (type === "dine_in") return "Makan Ditempat";
  if (type === "take_away") return "Dibungkus";
  return type;
}

/* ======================
   STATE GLOBAL
====================== */

let activeOrder = null;
let activeOrderId = null;
let queue = [];

let isProcessing = false;

/* ======================
   INIT GUARD (LOGIN CHECK)
====================== */

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  initKDS();
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
   INIT KDS SYSTEM
====================== */

function initKDS() {
  const activeOrderEl = document.getElementById("activeOrder");
  const queueListEl = document.getElementById("queueList");

  const todayDate = getTodayDate();

  const q = query(
    collection(db, "orders"),
    where("queueDate", "==", todayDate),
    where("status", "in", ["active", "pending"]),
    orderBy("queueNumber", "asc"),
  );

  onSnapshot(q, (snapshot) => {
    activeOrder = null;
    queue = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (data.status === "active") {
        activeOrder = { id: docSnap.id, ...data };
        activeOrderId = docSnap.id;
      } else {
        queue.push({ id: docSnap.id, ...data });
      }
    });

    renderUI(activeOrder, queue);
  });

  /* ======================
     DONE BUTTON
  ====================== */

  document.addEventListener("click", async (e) => {
    if (e.target.id !== "doneBtn") return;

    if (isProcessing) return;
    if (!activeOrderId) return;

    isProcessing = true;

    try {
      const result = await Swal.fire({
        title: "Selesaikan order ini?",
        text: "Order akan dipindahkan ke completed",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Selesai",
        cancelButtonText: "Batal",
      });

      if (!result.isConfirmed) {
        isProcessing = false;
        return;
      }

      /* COMPLETE ACTIVE */
      await updateDoc(doc(db, "orders", activeOrderId), {
        status: "completed",
        completedAt: serverTimestamp(),
      });

      /* NEXT QUEUE → ACTIVE */
      if (queue.length > 0) {
        const next = queue[0];

        await updateDoc(doc(db, "orders", next.id), {
          status: "active",
          startedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("DONE ERROR:", err);
    } finally {
      isProcessing = false;
    }
  });

  /* ======================
     RENDER UI
  ====================== */

  function renderUI(activeOrder, queue) {
    const activeOrderEl = document.getElementById("activeOrder");
    const queueListEl = document.getElementById("queueList");

    /* ACTIVE */
    if (activeOrder) {
      activeOrderEl.innerHTML = `
        <div class="active-order">

          <div class="d-flex justify-content-between align-items-center mb-2">

            <div class="fs-1 fw-bold text-primary">
              #${activeOrder.queueNumber}
            </div>

            <div class="badge bg-primary fs-6">
              ${formatOrderType(activeOrder.orderType)}
            </div>

          </div>

          <hr />

          <div class="d-flex gap-3">

            <div style="width: 35%;">
              <div class="customer-name">
                ${activeOrder.customerName.toUpperCase()}
              </div>
            </div>

            <div style="width: 65%;">
              <div class="order-text fs-5">
                ${activeOrder.orderText}
              </div>
            </div>

          </div>

          <hr />

          <button id="doneBtn" class="btn btn-success w-100 mt-2">
            SELESAIKAN ORDER
          </button>

        </div>
      `;
    } else {
      activeOrderEl.innerHTML = `<p class="text-muted">Tidak ada order aktif</p>`;
    }

    /* QUEUE */
    queueListEl.innerHTML = "";

    queue.forEach((item) => {
      queueListEl.innerHTML += `
        <div class="queue-item">
          <div class="queue-number">#${item.queueNumber}</div>
          <div class="fw-bold">
            ${item.customerName.toUpperCase()}
          </div>
        </div>
      `;
    });
  }
}
