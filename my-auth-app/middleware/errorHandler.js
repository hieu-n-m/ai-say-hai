const logger = require('../config/winston');

const errorHandler = (err, req, res, next) => {
    logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${err.stack}`);

    res.status(500).json({
        success: false,
        message: 'Server Error',
        error: err.message
    });
};

module.exports = errorHandler;
