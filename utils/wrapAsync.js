// wrapAsync is a utility function that takes a function and returns a new function that catches any errors and forwards them to the next middleware function. This way, we can avoid using try-catch blocks in our route handlers.
const wrapAsync = (fn) => {
    return function (req, res, next) {
        fn(req, res, next).catch(next);
    };
}

module.exports = wrapAsync;