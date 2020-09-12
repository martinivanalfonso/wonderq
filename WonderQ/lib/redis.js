const redis = require("redis");

/**
 * create client
 * @return {Client} a redis client
 */
exports.createClient = function(...args) {
    const client = redis.createClient(...args);
    client.on("error", err => {
        console.error("Error occured connecting to Redis: " + err.message);
    });
    return client;
};

/**
 * release client
 *
 * @param {Redis} client redis client
 */
exports.releaseClient = client => {
    client.quit();
};

