import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "airpatch-b750a",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const hSnap = await getDocs(collection(db, 'hotspots'));
  console.log("Hotspots:");
  hSnap.forEach(d => console.log(d.id, d.data()));

  const rSnap = await getDocs(collection(db, 'reports'));
  console.log("Reports:");
  rSnap.forEach(d => console.log(d.id, d.data()));
}
run();
