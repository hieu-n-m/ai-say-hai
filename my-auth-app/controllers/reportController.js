const Request = require('../models/Request');

// Get request count by type with filtering and sorting
exports.getRequestCountByType = async (req, res) => {
    if (req.user.role !== 'administrator') {
        return res.status(403).json({ msg: 'Access denied. Administrator role required.' });
    }
    
    const { startDate, endDate, department } = req.query;
    const match = {};

    if (startDate && endDate) {
        match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (department) {
        match.department = department;
    }

    try {
        const requestCount = await Request.aggregate([
            { $match: match },
            { $group: { _id: "$type", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json(requestCount);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get average approval time with filtering and sorting
exports.getAverageApprovalTime = async (req, res) => {
    if (req.user.role !== 'administrator') {
        return res.status(403).json({ msg: 'Access denied. Administrator role required.' });
    }

    const { startDate, endDate, department } = req.query;
    const match = { status: 'approved' };

    if (startDate && endDate) {
        match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (department) {
        match.department = department;
    }

    try {
        const averageApprovalTime = await Request.aggregate([
            { $match: match },
            { $project: { approvalTime: { $subtract: ["$updatedAt", "$createdAt"] } } },
            { $group: { _id: null, avgApprovalTime: { $avg: "$approvalTime" } } }
        ]);
        res.json(averageApprovalTime);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get SLA compliance with filtering and sorting
exports.getSLACompliance = async (req, res) => {
    if (req.user.role !== 'administrator') {
        return res.status(403).json({ msg: 'Access denied. Administrator role required.' });
    }

    const { startDate, endDate, department } = req.query;
    const match = { status: 'approved' };

    if (startDate && endDate) {
        match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (department) {
        match.department = department;
    }

    try {
        const slaCompliance = await Request.aggregate([
            { $match: match },
            { $project: { slaMet: { $lte: [{ $subtract: ["$updatedAt", "$createdAt"] }, 86400000] } } }, // 86400000 ms = 1 day
            { $group: { _id: null, complianceRate: { $avg: "$slaMet" } } }
        ]);
        res.json(slaCompliance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
