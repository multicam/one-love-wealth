/**
 * Error codes for different failure types
 */
export declare enum ErrorCode {
    NETWORK_ERROR = "NETWORK_ERROR",
    RATE_LIMITED = "RATE_LIMITED",
    INVALID_RESPONSE = "INVALID_RESPONSE",
    TIMEOUT = "TIMEOUT",
    NOT_FOUND = "NOT_FOUND",
    AUTH_FAILED = "AUTH_FAILED"
}
/**
 * Custom error class with context
 */
export declare class DataLayerError extends Error {
    readonly code: ErrorCode;
    readonly provider: string;
    readonly cause?: Error;
    constructor(message: string, code: ErrorCode, provider: string, cause?: Error);
}
/**
 * Recovery configuration per-request
 */
export interface ErrorRecoveryConfig {
    /** Default: true - return mock data on error */
    fallbackToMock?: boolean;
    /** Default: false - return expired cache on error */
    fallbackToStaleCache?: boolean;
    /** Default: false - throw instead of fallback */
    throwOnError?: boolean;
    /** Default: 0 - number of retries before fallback */
    retryCount?: number;
    /** Default: 1000 - delay between retries in ms */
    retryDelayMs?: number;
    /** Default: 30000 - request timeout in ms */
    timeoutMs?: number;
}
/**
 * Default error recovery settings
 */
export declare const DEFAULT_ERROR_RECOVERY: Required<ErrorRecoveryConfig>;
//# sourceMappingURL=errors.d.ts.map