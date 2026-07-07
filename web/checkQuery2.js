import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "airpatch-b750a",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const id = "6jx2TfXuaUPkGiSepL8q";
  try {
    const hotspotSnap = await getDoc(doc(db, 'hotspots', id));
    if (!hotspotSnap.exists()) {
      console.error("HOTSPOT NOT FOUND");
      return;
    }
    console.log("Hotspot exists:", hotspotSnap.data().category);
    
    const reportsQuery = query(collection(db, 'reports'), where('hotspotId', '==', id));
    const reportsSnap = await getDocs(reportsQuery);
    console.log("Reports found:", reportsSnap.docs.length);

    const resQuery = query(collection(db, 'resolutions'), where('hotspotId', '==', id));
    const resSnap = await getDocs(resQuery);
    console.log("Resolutions found:", resSnap.docs.length);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
run();
