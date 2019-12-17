const { request: cowl } = require("cowl");
const fetch = require("./fetch.js");
const { merge } = require("./merge.js");

const SEP_PATH_POSIX = "__PATH_SEPARATOR_POSIX__";
const SEP_PATH_WINDOWS = "__PATH_SEPARATOR_WINDOWS__";

/**
 * Encode a path for use with WebDAV servers
 * @param {String} path The path to encode
 * @returns {String} The encoded path (separators protected)
 */
function encodePath(path) {
    const replaced = path.replace(/\//g, SEP_PATH_POSIX).replace(/\\\\/g, SEP_PATH_WINDOWS);
    const formatted = encodeURIComponent(replaced);
    return formatted
        .split(SEP_PATH_WINDOWS)
        .join("\\\\")
        .split(SEP_PATH_POSIX)
        .join("/");
}

/**
 * @typedef {Object} UserOptions
 * @property {Object=} httpAgent - HTTP agent instance
 * @property {Object=} httpsAgent - HTTPS agent instance
 * @property {Object=} headers - Set additional request headers
 * @property {Boolean=} withCredentials - Set whether or not credentials should
 *  be included with the request. Defaults to value used by axios.
 */

/**
 * Process request options before being passed to Axios
 * @param {RequestOptions} requestOptions The request options object
 * @param {UserOptions} methodOptions Provided options (external)
 */
function prepareRequestOptions(requestOptions, methodOptions) {
    if (methodOptions.httpAgent) {
        requestOptions.nodeJsOptions = requestOptions.nodeJsOptions || {};
        requestOptions.nodeJsOptions.httpAgent = methodOptions.httpAgent;
    }
    if (methodOptions.httpsAgent) {
        requestOptions.nodeJsOptions = requestOptions.nodeJsOptions || {};
        requestOptions.nodeJsOptions.httpsAgent = methodOptions.httpsAgent;
    }
    if (methodOptions.headers && typeof methodOptions.headers === "object") {
        requestOptions.headers = merge(requestOptions.headers || {}, methodOptions.headers);
    }
    if (typeof methodOptions.withCredentials === "boolean") {
        requestOptions.withCredentials = methodOptions.withCredentials;
    }
    if (methodOptions.maxContentLength) {
        requestOptions.maxContentLength = methodOptions.maxContentLength;
    }
    if (methodOptions.onUploadProgress && typeof methodOptions.onUploadProgress === "function") {
        requestOptions.onUploadProgress = methodOptions.onUploadProgress;
    }
    if (methodOptions._digest) {
        requestOptions._digest = methodOptions._digest;
        requestOptions.validateStatus = status => (status >= 200 && status < 300) || status == 401;
    }
}

/**
 * @typedef {Object} RequestOptions
 * @property {String} url - The URL to request
 * @property {String} method - The method to use (eg. "POST")
 * @property {Object=} headers - Headers to set on the request
 * @property {Object=} httpAgent - A HTTP agent instance
 * @property {Object=} httpsAgent - A HTTPS agent interface
 * @property {Object|String|*=} body - Body data for the request
 */

function request(requestOptions) {
    return cowl(requestOptions);
}

module.exports = {
    cowl,
    encodePath,
    prepareRequestOptions,
    request
};
