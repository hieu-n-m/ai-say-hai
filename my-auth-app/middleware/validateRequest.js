const { check, validationResult } = require('express-validator');

const validateRequest = [
    check('type', 'Type is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = validateRequest;
