const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.post('/save', logController.saveLog);
router.get('/history/:deviceId', logController.getHistory);
router.get('/stats/:deviceId', logController.getStats);
router.post('/register-token', logController.registerToken);
router.get('/list-devices', logController.getDevices);

module.exports = router;