const admin = require('firebase-admin');
admin.initializeApp({ projectId: "airpatch-b750a" });
try {
  console.log("Bucket name:", admin.storage().bucket().name);
} catch (e) {
  console.error("Error:", e.message);
}
