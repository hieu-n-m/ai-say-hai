const getEmailTemplate = (request) => {
    return `
        Hi ${request.user.name},

        Your request for ${request.type} has been ${request.status}.

        Details:
        - Start Date: ${request.startDate}
        - End Date: ${request.endDate}
        - Reason: ${request.reason}

        Thank you,
        Request Management System
    `;
};

module.exports = getEmailTemplate;
