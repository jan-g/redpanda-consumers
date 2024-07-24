import fp from "fastify-plugin";

import { RedpandaConsumer } from "../lib/redpanda/client.js";
import { Workflows, Topics } from "../lib/redpanda/types.js";

export default fp(
    async (server, opts) => {
        const consumer = new RedpandaConsumer({
            brokerUrls: ['localhost:19092'],
            topics: [Topics.User],
            groupId: "server-user",
        });

        await consumer.connect();
        const workflows: Workflows<Topics.User> = {
            profile_updated: async (data) => {
                console.log("profile_updated", data);
            },
        };

        await consumer.consume(workflows);
        server.redpanda.consumers.push(consumer);
        console.log("marco-user consumer started!");
    },
    { name: "consumer:user" },
);
