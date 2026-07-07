import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "airpatch-b750a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Fetching hotspots...");
  const hotspotsSnap = await getDocs(collection(db, "hotspots"));
  let deletedCount = 0;

  for (const d of hotspotsSnap.docs) {
    const data = d.data();
    // Dummy hotspots were seeded with reportIds like ['dummy1', 'dummy2'] etc
    const hasDummyReport = data.reportIds && data.reportIds.some(id => id.startsWith('dummy'));
    
    if (hasDummyReport) {
      console.log(`Deleting dummy hotspot ${d.id}...`);
      await deleteDoc(d.ref);
      deletedCount++;
    }
  }

  console.log(`Deleted ${deletedCount} dummy hotspots.`);
}

run();
