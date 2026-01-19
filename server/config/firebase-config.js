// const admin = require('firebase-admin');
// const serviceAccount = require("../serviceAccountKey.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// const db = admin.firestore();
// module.exports = db;

const admin = require('firebase-admin');
const path = require('path');

// Docker will look for this file in the /app directory
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();
module.exports = db;