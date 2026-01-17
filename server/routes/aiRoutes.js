// const express = require('express');
// const router = express.Router();
// const aiController = require('../controllers/aiController');

// router.get('/diagnosis/:deviceId', aiController.getDiagnosis);

// module.exports = router;

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.get('/diagnosis/:deviceId', aiController.getDiagnosis);

module.exports = router;