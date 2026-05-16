import { db } from "./firebase.js";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// TODAY
const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Jakarta",
});

// DATATABLE
const table = $("#historyTable").DataTable({
  responsive: true,

  autoWidth: false,

  pageLength: 10,

  order: [[6, "desc"]],

  columnDefs: [
    {
      responsivePriority: 1,
      targets: [1, 2, 5],
    },

    {
      responsivePriority: 2,
      targets: [6],
    },
  ],
});

// QUERY TODAY ONLY
const q = query(
  collection(db, "orders"),

  where("queueDate", "==", today),

  orderBy("createdAt", "desc"),
);

onSnapshot(q, (snapshot) => {
  table.clear();

  let no = 1;

  snapshot.forEach((doc) => {
    const data = doc.data();

    const createdAt = data.createdAt?.toDate();

    const formattedDate = createdAt
      ? createdAt.toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

    let statusBadge = `
      <span class="badge bg-secondary">
        ${data.status || "-"}
      </span>
    `;

    if (data.status === "waiting") {
      statusBadge = `
        <span class="badge bg-secondary">
          Waiting
        </span>
      `;
    }

    if (data.status === "processing") {
      statusBadge = `
        <span class="badge bg-primary">
          Diproses
        </span>
      `;
    }

    if (data.status === "completed") {
      statusBadge = `
        <span class="badge bg-success">
          Selesai
        </span>
      `;
    }

    if (data.status === "cancelled") {
      statusBadge = `
        <span class="badge bg-danger">
          Batal
        </span>
      `;
    }

    table.row.add([
      no++,
      data.queueNumber || "-",
      data.customerName || "-",

      `
      <div class="order-text">
        ${data.orderText || "-"}
      </div>
      `,

      data.orderType || "-",

      statusBadge,

      formattedDate,
    ]);
  });

  table.draw();
});
