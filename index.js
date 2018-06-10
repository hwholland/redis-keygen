/**
 * @module          search-pusher
 * @description 	micro-service application that creates a Redis hash from a JSON
 *               	object, based on updates published to a Redis sub/pub channel
 * @type        	{Function}
 */
var argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const redis = require('./redis');

var redisHost = argv.redisHost;
var redisPort = argv.redisPort;
var redisInstance = argv.redisInstance;
var redisChannel = 'increment:string:*';
var redisClient = new redis(redisHost, redisPort, redisInstance);

/**
 * The sender is required to publish to a channel which follows a specific
 * naming convention to indicate (1) triggering this service, and (2) the key
 * location in Redis to store the hash
 *
 * @function   fnCallback
 * @param      {string}  pattern  The pattern string
 * @param      {string}  channel  The channel name
 * @param      {object}  message  The JSON object to save
 * 
 * @example
 * var channel = 'create:object:company:1';
 * var pattern = 'create:object:';
 * // The above values would yeild the following result
 * hashKey = 'company:1'
 */
function fnCallback(pattern, channel, message) {
	pattern = pattern.substring(0, pattern.length - 1);
	var listKey = channel.replace(pattern, '');
	var tempClient = new redis(redisHost, redisPort, redisInstance);
	tempClient.save(listKey);
}

redisClient.subscribe(redisChannel, fnCallback);