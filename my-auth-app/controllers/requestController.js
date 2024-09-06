const requestEventEmitter = require('../events/requestEvents');
const Request = require('../models/Request');
const { validationResult } = require('express-validator');

exports.submitRequest = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { type, startDate, endDate, reason, department } = req.body;

    try {
        // Additional custom validations
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ msg: 'Start date must be before end date' });
        }

        // File attachment validation (assuming file is sent as 'attachment')
        if (req.file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (req.file.size > maxSize) {
                return res.status(400).json({ msg: 'File size exceeds 10MB limit' });
            }

            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(req.file.mimetype)) {
                return res.status(400).json({ msg: 'Invalid file type. Only PDF and Word documents are allowed' });
            }
        }

        // Create new request
        const newRequest = new Request({
            user: req.user.id,
            type,
            startDate,
            endDate,
            reason,
            department,
            attachment: req.file ? req.file.path : null
        });

        // Save request to database
        const savedRequest = await newRequest.save();

        res.json({ msg: 'Request submitted successfully', request: savedRequest });
    } catch (err) {
        console.error('Request submission error:', err.message);
        res.status(500).send('Server error');
    }
};

exports.getUserRequests = async (req, res) => {
    try {
        const { type, status } = req.query;
        let query = req.user.role == 'manager' ? {} : { user: req.user.id };

        if (type) {
            query.type = type;
        }
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const requests = await Request.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalRequests = await Request.countDocuments(query);

        res.json({
            totalRequests,
            totalPages: Math.ceil(totalRequests / limit),
            currentPage: parseInt(page),
            requests
        });
    } catch (err) {
        console.error('Error fetching user requests:', err.message);
        res.status(500).send('Server error');
    }
};

exports.getRequestStatus = async (req, res) => {
    try {
        const requests = await Request.find({ user: req.user.id })
            .select('type status createdAt')
            .sort({ createdAt: -1 });

        const statusCounts = requests.reduce((acc, request) => {
            acc[request.status] = (acc[request.status] || 0) + 1;
            return acc;
        }, {});

        const response = {
            totalRequests: requests.length,
            statusCounts,
            requests: requests.map(request => ({
                id: request._id,
                type: request.type,
                status: request.status,
                createdAt: request.createdAt
            }))
        };

        res.json(response);
    } catch (err) {
        console.error('Error fetching request status:', err.message);
        res.status(500).send('Server error');
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        // Ensure the user is a manager
        if (req.user.role !== 'manager') {
            return res.status(403).json({ msg: 'Access denied. Manager role required.' });
        }

        // Fetch pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch pending requests with pagination
        const pendingRequests = await Request.find({ status: 'pending' })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalRequests = await Request.countDocuments({ status: 'pending' });

        const formattedRequests = pendingRequests.map(request => ({
            id: request._id,
            employeeName: request.user.name,
            employeeEmail: request.user.email,
            type: request.type,
            startDate: request.startDate,
            endDate: request.endDate,
            reason: request.reason,
            department: request.department,
            createdAt: request.createdAt
        }));

        res.json({
            totalRequests,
            totalPages: Math.ceil(totalRequests / limit),
            currentPage: page,
            requests: formattedRequests
        });
    } catch (err) {
        console.error('Error fetching pending requests:', err.message);
        res.status(500).send('Server error');
    }
};

exports.approveRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ msg: 'Request has already been processed' });
        }

        request.status = 'approved';
        await request.save();

        // Log the action
        console.log(`Request ${request._id} approved by manager ${req.user.id}`);

        // Emit event for status change
        requestEventEmitter.emit('statusChange', request);

        res.json({ msg: 'Request approved successfully', request });
    } catch (err) {
        console.error('Error approving request:', err.message);
        res.status(500).send('Server error');
    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ msg: 'Request has already been processed' });
        }

        request.status = 'rejected';
        request.rejectionReason = req.body.reason;
        await request.save();

        // Log the action
        console.log(`Request ${request._id} rejected by manager ${req.user.id}`);

        // Emit event for status change
        requestEventEmitter.emit('statusChange', request);

        res.json({ msg: 'Request rejected successfully', request });
    } catch (err) {
        console.error('Error rejecting request:', err.message);
        res.status(500).send('Server error');
    }
};
