/**
 * Error codes for different failure types
 */
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    ErrorCode["INVALID_RESPONSE"] = "INVALID_RESPONSE";
    ErrorCode["TIMEOUT"] = "TIMEOUT";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["AUTH_FAILED"] = "AUTH_FAILED";
})(ErrorCode || (ErrorCode = {}));
/**
 * Custom error class with context
 */
export class DataLayerError extends Error {
    code;
    provider;
    cause;
    constructor(message, code, provider, cause) {
        super(message);
        this.name = 'DataLayerError';
        this.code = code;
        this.provider = provider;
        this.cause = cause;
    }
}
/**
 * Default error recovery settings
 */
export const DEFAULT_ERROR_RECOVERY = {
    fallbackToMock: true,
    fallbackToStaleCache: false,
    throwOnError: false,
    retryCount: 0,
    retryDelayMs: 1000,
    timeoutMs: 30000,
};
