import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import { createTopic } from "../lib/redpanda/admin.js";
import {
    RedpandaProducerFactory,
    RedpandaConsumer,
} from "../lib/redpanda/client.js";
import { Topics } from "../lib/redpanda/types.js";

declare module "fastify" {
    interface FastifyInstance {
        redpanda: {
            producer: RedpandaProducerFactory;
            consumers: RedpandaConsumer<Topics>[];
        };
    }
}

export default fp(
    async (server: FastifyInstance, opts: FastifyPluginOptions) => {
        console.log("Connecting to Redpanda...");

        // create topic
        await createTopic();
        console.log("Topics created!");

        const producer = new RedpandaProducerFactory("localhost:19092");

        await producer.start().catch(console.error);

        server.decorate("redpanda", {
            producer,
            consumers: [],
        });

        const errorTypes = ["unhandledRejection", "uncaughtException"];
        const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];
        errorTypes.forEach((type) => {
            process.on(type, async (e) => {
                try {
                    console.log("Closing Redpanda connections...");
                    console.log("num of consumers: ", server.redpanda.consumers.length);
                    const batch = [
                        server.redpanda.producer.disconnect(),
                        ...server.redpanda.consumers.map(async (consumer) => {
                            return consumer.disconnect();
                        }),
                    ];

                    await Promise.allSettled(batch);
                    process.exit(0);
                } catch (_) {
                    process.exit(1);
                }
            });
        });

        signalTraps.forEach((type) => {
            process.on(type, async () => {
                try {
                    console.log("Closing Redpanda connections...");
                    console.log("num of consumers: ", server.redpanda.consumers.length);
                    const batch = [
                        server.redpanda.producer.disconnect(),
                        ...server.redpanda.consumers.map(async (consumer) => {
                            return consumer.disconnect();
                        }),
                    ];

                    await Promise.allSettled(batch);
                    console.log("Redpanda connections closed!");
                } catch (err) {
                    console.error(err);
                } finally {
                    process.exit(0);
                }
            });
        });
        server.log.info("Redpanda plugin registered!");
    },
    { name: "redpanda" },
);
