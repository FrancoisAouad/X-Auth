import redis from 'redis';

const client = redis.createClient({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
});

client.on('connect', () => {
    console.log('Client connected to Redis.');
});

client.on('ready', () => {
    console.log('Client Ready to use.');
});

client.on('error', (err: any) => {
    console.log(err.message);
});

client.on('end', () => {
    console.log('Client disconnected from redis');
});

process.on('SIGINT', () => {
    client.quit();
});

export default client;
