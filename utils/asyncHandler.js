// async controllerlardagi xatolarni Express xato ishlovchisiga uzatadi (Express 4 va 5 da ishlaydi).
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
