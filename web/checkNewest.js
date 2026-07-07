import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "airpatch-b750a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(5));
  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`${doc.id} => status: ${data.status} aiStatus: ${data.aiStatus} createdAt: ${data.createdAt?.toDate()}`);
  });
}

run();
