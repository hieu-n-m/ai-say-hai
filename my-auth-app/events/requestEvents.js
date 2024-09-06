const EventEmitter = require('events');
class RequestEventEmitter extends EventEmitter {}
const requestEventEmitter = new RequestEventEmitter();
const sendEmailNotification = require('../utils/sendEmailNotification');
const sendWebSocketNotification = require('../utils/sendWebSocketNotification');
const User = require('../models/User');

// Event listener for status changes
requestEventEmitter.on('statusChange', async (request) => {
    console.log("check 3333")
    try {
        const user = await User.findById(request.user);
        if (user) {
            const emailSubject = `Request Status Update: ${request.type}`;
            const emailText = `Your request for ${request.type} has been ${request.status}.`;
            // sendEmailNotification(user.email, emailSubject, emailText);

            const webSocketMessage = {
                type: 'statusChange',
                requestId: request._id,
                status: request.status,
                message: `Your request for ${request.type} has been ${request.status}.`
            };
            console.log("check1111")
            sendWebSocketNotification(webSocketMessage);
        }
    } catch (err) {
        console.error('Error sending notifications:', err.message);
    }
});

module.exports = requestEventEmitter;
