const Request = require('../models/Request');

exports.submitRequest = async (req, res) => {
    const { type, description } = req.body;

    if (!type || !description) {
        return res.status(400).json({ msg: 'Missing type or description' });
    }

    try {
        const newRequest = new Request({
            user: req.user.id,
            type,
            description
        });

        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const requests = await Request.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.updateRequestStatus = async (req, res) => {
    const { requestId, status } = req.body;

    if (!requestId || !status) {
        return res.status(400).json({ msg: 'Missing requestId or status' });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status' });
    }

    try {
        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }
        
        // Check if the user is the request owner or has a manager role
        if (request.user.toString() !== req.user.id && req.user.role !== 'manager') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        request.status = status;
        await request.save();

        res.json(request);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const pendingRequests = await Request.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(pendingRequests);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};
