const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { submitRequest, getUserRequests, getRequestStatus, getPendingRequests, approveRequest, rejectRequest } = require('../controllers/requestController');
const auth = require('../middleware/auth');
const managerAuth = require('../middleware/managerAuth');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/', [
    auth,
    upload.single('attachment'),
    [
        check('type').isIn(['leave', 'travel', 'expense']).withMessage('Invalid request type'),
        check('startDate').isISO8601().toDate().withMessage('Invalid start date'),
        check('endDate').isISO8601().toDate().withMessage('Invalid end date'),
        check('reason').notEmpty().withMessage('Reason is required'),
    ]
], submitRequest);

router.get('/', auth, getUserRequests);

router.get('/status/:id', auth, getRequestStatus);

router.get('/pending', [auth, managerAuth], getPendingRequests);

router.patch('/approve/:id/', [auth, managerAuth], approveRequest);

router.patch('/reject/:id/', [auth, managerAuth], rejectRequest);

module.exports = router;
