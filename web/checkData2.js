import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, orderBy, query } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "airpatch-b750a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("--- LATEST REPORTS ---");
  const q = query(collection(db, "reports"));
  const reportsSnapshot = await getDocs(q);
  const reports = [];
  reportsSnapshot.forEach((doc) => {
    reports.push({ id: doc.id, ...doc.data() });
  });
  
  reports.sort((a, b) => {
    const tA = a.timestamp ? (a.timestamp.seconds || 0) : 0;
    const tB = b.timestamp ? (b.timestamp.seconds || 0) : 0;
    return tB - tA; // descending
  });

  for(let i=0; i<Math.min(5, reports.length); i++) {
    const r = reports[i];
    console.log(r.id, "=> status:", r.status, "aiStatus:", r.aiStatus, "timestamp:", r.timestamp ? new Date(r.timestamp.seconds * 1000).toISOString() : 'none');
  }
}

run();
