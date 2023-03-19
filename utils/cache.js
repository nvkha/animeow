const redis = require('redis');

let redisClient = redis.createClient();
redisClient.on("error", (error) => console.error(`Error Redis: ${error}`));
redisClient.connect().then(() => console.log('Redis connected...'));

module.exports = redisClient;