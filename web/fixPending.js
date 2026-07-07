import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "airpatch-b750a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, "reports"), where("status", "==", "pending"));
  const snapshot = await getDocs(q);
  
  for (const d of snapshot.docs) {
    const data = d.data();
    console.log(`Fixing ${d.id}...`);
    
    if (data.aiStatus === 'completed' && data.aiVerification) {
      const isPollution = data.aiVerification.isPollutionEvent;
      await updateDoc(d.ref, {
        status: isPollution ? 'verified' : 'rejected'
      });
      console.log(`  Set status to ${isPollution ? 'verified' : 'rejected'}`);
    } else {
      // If aiStatus is pending or missing verification for more than 10 mins
      await updateDoc(d.ref, {
        status: 'failed',
        aiStatus: 'failed'
      });
      console.log(`  Set status to failed`);
    }
  }
  console.log("Done fixing reports.");
}

run();
