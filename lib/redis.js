import redis from "redis";
import promise from "bluebird";
import env from "node-env-file";

env("./.env");

const REDIS_PORT = process.env.PORT || 6379;

promise.promisifyAll(redis.RedisClient.prototype);
promise.promisifyAll(redis.Multi.prototype);

export let client = () => {
    return new Promise((resolve, reject) => {
        let connector = redis.createClient(REDIS_PORT);

        connector.on("error", e => {
            reject("Redis Connection failed" + e);
        });

        connector.on("connect", () => {
            resolve(connector);
        });
    });
};
