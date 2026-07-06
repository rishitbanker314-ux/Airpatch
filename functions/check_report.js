const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
async function run() {
  const doc = await db.collection('reports').doc('Qi570wi5AKbb3Zv2jZu3').get();
  console.log(JSON.stringify(doc.data(), null, 2));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
