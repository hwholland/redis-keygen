/**
 * Class for handling interaction with the redis database.
 *
 * @class      redis
 * @param      {string}   redisHost      The redis host
 * @param      {string}   redisPort      The redis port
 * @param      {integer}  redisInstance  The database instance
 */
function redis(redisHost, redisPort, redisInstance) {
    this.raven = require('raven');
    this.raven.config('https://ea5f40d074f34d0d9f741c3c66376b85@sentry.io/1222900').install();
    this.client = require('redis').createClient({
        host: redisHost,
        port: redisPort
    });
    this.host = redisHost;
    this.port = redisPort;
    this.instance = redisInstance;
    try {
        this.connect(this.instance);
    } catch (e) {
        this.raven.captureException(e);
    }

}

/**
 * Establishes a connection with the database and selects the database instance to be used.
 * 
 * @method      redis#connect
 * @param       {integer}  instance  The database instance (0-9)
 */
redis.prototype.connect = function(instance) {
    this.client.select(instance, function(error, response) {
        if (error) {
            this.raven.captureMessage(error);
            return error;
        }
    });

    this.client.on("error", function(error) {
        if (error) {
            this.raven.captureMessage(error);
        }
    });
};

/**
 * Subscribes to a pub/sub channel
 *
 * @param      {string}    channel   The channel to subscribe
 * @param      {Function}  callback  The callback function to call when a message is published to the specified channel
 */
redis.prototype.subscribe = function(channel, callback) {
    try {
        this.client.on("pmessage", callback);
        this.client.psubscribe(channel);
    } catch (e) {
        this.raven.captureException(e);
    }
};

/**
 * Publishes an object to a specified channel - only used for testing purposes.
 * Unnecessary method (abstraction for the sake of abstraction) and only
 * included here rather than directly calling the publish method for the purpose
 * of code management and consolidating all redis related functions into this
 * file.
 *
 * @param      {string}  channel  The channel to notify
 * @param      {object}  data     The object to broadcast as the message content
 */
redis.prototype.publish = function(channel, data) {
    this.client.publish(channel, data);
};

redis.prototype.save = function(string) {
    var that = this;
    this.client.incr(string, function(error, response) {
        if (error) {
            that.raven.captureMessage(error);
            console.log("error");
        } else {
            that.client.quit();
        }
    });
};

redis.prototype.quit = function() {
    this.client.quit();
};

module.exports = redis;