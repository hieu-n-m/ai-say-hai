const getWebSocketMessage = (request) => {
    return {
        type: 'statusChange',
        requestId: request._id,
        status: request.status,
        message: `Your request for ${request.type} has been ${request.status}.`
    };
};

module.exports = getWebSocketMessage;
