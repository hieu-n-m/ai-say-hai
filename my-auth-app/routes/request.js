const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const managerAuth = require('../middleware/managerAuth');

router.post('/submit', auth, validateRequest, requestController.submitRequest);
router.get('/all', auth, requestController.getRequests);
router.put('/status', auth, requestController.updateRequestStatus);
router.get('/pending', auth, managerAuth, requestController.getPendingRequests);
router.patch('/approve', auth, requestController.updateRequestStatus);
router.patch('/reject', auth, requestController.updateRequestStatus);

module.exports = router;
