const EventEmitter = require('events');
class RequestEventEmitter extends EventEmitter {}
const requestEventEmitter = new RequestEventEmitter();
const sendEmailNotification = require('../utils/sendEmailNotification');
const sendWebSocketNotification = require('../utils/sendWebSocketNotification');
const User = require('../models/User');


requestEventEmitter.on('statusChange', async (request) => {
    try {
        const user = await User.findById(request.user);
        if (user) {
            const subject = `Request Status Update: ${request.type}`;
            const text = `Your request for ${request.type} has been ${request.status}.`;
            sendEmailNotification(user.email, subject, text);
        }
    } catch (err) {
        console.error('Error sending email notification:', err.message);
    }
});

requestEventEmitter.on('statusChange', (request) => {
    const message = {
        type: 'statusChange',
        requestId: request._id,
        status: request.status,
        message: `Your request for ${request.type} has been ${request.status}.`
    };
    sendWebSocketNotification(message);
});

requestEventEmitter.on('statusChange', async (request) => {
    try {
        const user = await User.findById(request.user);
        if (user) {
            const emailSubject = `Request Status Update: ${request.type}`;
            const emailText = `Your request for ${request.type} has been ${request.status}.`;
            sendEmailNotification(user.email, emailSubject, emailText);

            const webSocketMessage = {
                type: 'statusChange',
                requestId: request._id,
                status: request.status,
                message: `Your request for ${request.type} has been ${request.status}.`
            };
            sendWebSocketNotification(webSocketMessage);
        }
    } catch (err) {
        console.error('Error sending notifications:', err.message);
    }
});

module.exports = requestEventEmitter;