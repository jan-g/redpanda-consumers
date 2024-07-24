import Fastify from "fastify";
import autoLoad from "@fastify/autoload";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({
    logger: true,
});

fastify.register(autoLoad, {
    dir: join(__dirname, 'plugins'),
    ignoreFilter: (path) => path.endsWith('test.js') || path.endsWith('test.ts'),
});

fastify.register(autoLoad, {
    dir: join(__dirname, 'consumers'),
    ignoreFilter: (path) => path.endsWith('test.js') || path.endsWith('test.ts'),
});


fastify.get("/", async (request, reply) => {
    return { hello: "world" };
});

/**
 * Run the server!
 */
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
