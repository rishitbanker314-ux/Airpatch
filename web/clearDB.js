import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "airpatch-b750a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Deleting all hotspots...");
  const hotspotsSnap = await getDocs(collection(db, "hotspots"));
  for (const d of hotspotsSnap.docs) {
    await deleteDoc(d.ref);
  }

  console.log("Deleting all reports...");
  const reportsSnap = await getDocs(collection(db, "reports"));
  for (const d of reportsSnap.docs) {
    await deleteDoc(d.ref);
  }

  console.log("Database cleared successfully!");
}

run();
