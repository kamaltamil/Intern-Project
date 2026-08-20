const logger = require("../config/logger");

const sendResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        success: statusCode < 400,
        message,
        ...(data !== null && data),
    });
};

// 2xx - Success
const ok = (res, message, data = null) =>
    sendResponse(res, 200, message, data);

const created = (res, message, data = null) =>
    sendResponse(res, 201, message, data);

// 3xx - Redirection
const notModified = (res, message) =>
    sendResponse(res, 304, message);

// 4xx - Client errors
const badRequest = (res, message) =>
    sendResponse(res, 400, message);

const unauthorized = (res, message) =>
    sendResponse(res, 401, message);

const forbidden = (res, message) =>
    sendResponse(res, 403, message);

const notFound = (res, message) =>
    sendResponse(res, 404, message);

const conflict = (res, message) =>
    sendResponse(res, 409, message);

// 5xx - Server errors
const internalServerError = (res, message) =>
    sendResponse(res, 500, message);

const notImplemented = (res, message) =>
    sendResponse(res, 501, message);

const badGateway = (res, message) =>
    sendResponse(res, 502, message);

const serviceUnavailable = (res, message) =>
    sendResponse(res, 503, message);

module.exports = {
    ok,
    created,
    notModified,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict,
    internalServerError,
    notImplemented,
    badGateway,
    serviceUnavailable,
};