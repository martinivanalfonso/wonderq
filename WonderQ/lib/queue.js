const Redis = require("./redis");
const MAX_UINT = 4294967295; //  pow(2,32)

/*
	Paramenters for WonderQ:
	* `host` (String):  The Redis server
	* `port` (Number):  The Redis port
	* `name` (String):  The Queue Name
	* `visibilityTimeOut` (Number) *optional (Default: 86400 (24hs)): The visibility timeout for the queue in seconds
*/

class WonderQ {
    constructor(options) {
        this.queueName = this._buildQueueName(options.name);
        this.vt = options.visibilityTimeOut || 86400
        this.redis = Redis.createClient(options.port, options.host);
    }

    _buildQueueName(name) {
        return "_bearer_:" + name;
    }

    select(value, callback) {
        if(!this.redis) {
            return callback(new Error("Redis has been disconnected."));
        }
        console.log( this.vt)
        console.log( this.queueName)
        this.redis.select(value,callback);
    }

    push(value, callback) {
        if(!this.redis) {
            return callback(new Error("Redis has been disconnected."));
        }

        this.redis.rpush([ this.queueName, value ], callback);
    }

    get(amount, callback) {
        if(typeof amount === "function") {
            callback = amount;
            amount = 1;
        }
        if(amount === -1) {
            amount = MAX_UINT;
        }

        this.redis.lrange([ this.queueName, 0, amount - 1 ], (err, messages) => callback(err, messages));
    }

    removeAmount(amount, callback) {
        if(!this.redis) return callback(new Error("Redis has been disconnected."));

        if(typeof amount === "function") {
            callback = amount;
            amount = 1;
        }
        if(amount === -1) {
            amount = MAX_UINT;
        }

        this.redis.ltrim([ this.queueName, amount, "-1" ], callback);
    }

    length(callback) {
        if(!this.redis) return callback(new Error("Redis has been disconnected."));
        this.redis.llen([ this.queueName ], callback);
    }

    destroy() {
        Redis.releaseClient(this.redis);
        this.redis = undefined;
    }

    deleteQueue(callback) {
        this.redis.del([ this.queueName ], callback);
    }
}

module.exports = WonderQ;

