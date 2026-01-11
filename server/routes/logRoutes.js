const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.post('/save', logController.saveLog);

module.exports = router;
router.get('/history/:deviceId', logController.getHistory);
router.post('/register-token', logController.registerToken);
router.get('/stats/:deviceId', logController.getStats);
router.get('/devices', logController.getDeviceList);