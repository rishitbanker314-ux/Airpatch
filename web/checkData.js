import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, getDocs, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "airpatch-b750a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("--- LATEST REPORTS ---");
  const reportsQ = query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(3));
  const reportsSnap = await getDocs(reportsQ);
  reportsSnap.forEach(d => {
    const data = d.data();
    console.log(`${d.id} => status: ${data.status}, aiStatus: ${data.aiStatus}, hotspotId: ${data.hotspotId}`);
  });

  console.log("\n--- LATEST HOTSPOTS ---");
  const hotspotsQ = query(collection(db, "hotspots"), orderBy("updatedAt", "desc"), limit(3));
  const hotspotsSnap = await getDocs(hotspotsQ);
  hotspotsSnap.forEach(d => {
    const data = d.data();
    console.log(`${d.id} => status: ${data.status}, activeReportCount: ${data.activeReportCount}, category: ${data.category}, lat: ${data.center?.lat}`);
  });
}

run();
