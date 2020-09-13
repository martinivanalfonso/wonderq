const Redis = require("./redis");
const { v4: uuidv4 } = require('uuid');
const MAX_UINT = 4294967295; //  pow(2,32)
/*
	Parameters for WonderQ:
	* `host` (String):  The Redis server
	* `port` (Number):  The Redis port
	* `name` (String):  The Queue Name
	* `visibilityTimeOut` (Number) *optional (Default: 86400 (24hs)): The visibility timeout for the queue in seconds
*/

class WonderQ {
    constructor(options) {
        this.queueName = this._buildQueueName(options.name);
        this.proccesingQueueName = this._buildQueueName(options.name) + "_proccessing"
        this.vt = options.visibilityTimeOut || 86400
        this.redis = Redis.createClient(options.port, options.host);
    }

    _buildQueueName(name) {
        return "_bearer_:" + name;
    }

    // Selects a specific Redis database, default: 0
    select(value, callback) {
        if(!this.redis) return callback(new Error("Redis has been disconnected."));

        this.redis.select(value,callback);
    }

    // Pushes job to Work Queue
    push(value, callback) {
        if(!this.redis) return callback(new Error("Redis has been disconnected."));

        const valueJSON = JSON.stringify({
            id: uuidv4(), // -> '6c84fb90-12c4-11e1-840d-7b25c5ee775a' 
            value,
            timestamp: Date.now() 
        })

        this.redis.lpush([ this.queueName, valueJSON ], (err) => callback(err, valueJSON));
    }

    // Moves Job from Work Queue to Processing Queue and returns it
    get(callback) {
        if(!this.redis) return callback(new Error("Redis has been disconnected."));

        this.redis.rpoplpush(this.queueName, this.proccesingQueueName, (err, value) => callback(err, value));
    }
    
    // Deletes Job from Processing Queue 
    jobDone(value, callback) {
        if(!this.redis) return callback(new Error("Redis has been disconnected."));

        const { id } = JSON.parse(value)
        this.redis.lrem(this.proccesingQueueName, 1, value, (err) => callback(err, id ));
    }

    // Moves Job from Proccesing Queue back to Work Queue
    requeue(value, callback) {
        if(!this.redis) return callback(new Error("Redis has been disconnected."));

        this.redis.lpush([ this.queueName, value ], callback);
        this.redis.lrem(this.queueName, this.proccesingQueueName, (err, job) => callback(err, job));
    }

    // Calls requeue() if a expired job is found
    checkExpiredJobs(callback) {
        if(!this.redis) return callback(new Error("Redis has been disconnected."));

        try {
            const job = this.redis.lrange(this.proccesingQueueName, 0, 0)
            if (!job) return callback(new Error("Proccesing Queue empty."));
            const { timestamp } = JSON.parse(job)
    
            const timeSpentInQueue = Date.now() - timestamp
    
            if (timeSpentInQueue > this.vt) {
                this.requeue(job, callback)
            } else {
                callback(null)
            }
            
        } catch (err) {
            console.log(err)
            callback(new Error("Failed to check Proccesing Queue."))
        }
    }

    // Removes a specific amount of elements from the Work Queue
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

    // Returns current length of Work Queue
    length(callback) {
        if(!this.redis) return callback(new Error("Redis has been disconnected."));
        this.redis.llen([ this.queueName ], callback);
    }

    // Releases Redis instance
    destroy() {
        Redis.releaseClient(this.redis);
        this.redis = undefined;
    }

    // Deletes Processing Queue
    deleteQueue(callback) {
        this.redis.del([ this.proccesingQueueName ], callback);
    }
}

module.exports = WonderQ;

