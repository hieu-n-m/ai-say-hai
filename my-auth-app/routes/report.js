const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const { getRequestCountByType, getAverageApprovalTime, getSLACompliance } = require('../controllers/reportController');

// Define routes for different report types
router.get('/request-count-by-type', auth, getRequestCountByType);
router.get('/average-approval-time', getAverageApprovalTime);
router.get('/sla-compliance', getSLACompliance);

module.exports = router;
