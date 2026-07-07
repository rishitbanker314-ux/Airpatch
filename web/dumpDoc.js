import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "airpatch-b750a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snapshot = await getDoc(doc(db, "reports", "B1tYsuee88uZoY11qQeA"));
  console.log(JSON.stringify(snapshot.data(), null, 2));
}

run();
