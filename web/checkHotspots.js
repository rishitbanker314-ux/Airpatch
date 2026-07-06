import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "rishitbanker314-2030s-projects",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const querySnapshot = await getDocs(collection(db, "hotspots"));
  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data().center);
  });
}

run();
