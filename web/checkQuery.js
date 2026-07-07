import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "airpatch-b750a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const reportsQuery = query(
      collection(db, 'reports'),
      where('hotspotId', '==', 'dummyId'),
      orderBy('createdAt', 'desc')
    );
    await getDocs(reportsQuery);
    console.log("Query succeeded!");
  } catch (err) {
    console.error("Query failed:", err.message);
  }
}

run();
