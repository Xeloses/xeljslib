/**
 * Errors/Exceptions.
 * @module xeljslib/classes/exceptions
 */

/**
 * Base error/exception class.
 *
 * @class XelException
 * @extends {Error}
 */
class XelException extends Error
{
    /**
     * @constructor
     *
     * @param {string} message
     * @memberof XelException
     */
    constructor(message)
    {
        super(message);
        this.name = this.constructor.name;
    }
}

/**
 * XelApp exception.
 *
 * @class XelAppError
 * @extends {XelException}
 */
class XelAppError extends XelException {}

/**
 * XelWebApp exception.
 *
 * @class XelWebAppError
 * @extends {XelAppError}
 */
class XelWebAppError extends XelAppError {}

/**
 * XelWebAppStorage exception.
 *
 * @class XelWebAppStorageError
 * @extends {XelException}
 */
class XelWebAppStorageError extends XelException {}

export default XelException;
export {
    XelAppError,
    XelWebAppError,
    XelWebAppStorageError
}
