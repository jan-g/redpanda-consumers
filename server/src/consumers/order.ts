import fp from "fastify-plugin";

import { RedpandaConsumer } from "../lib/redpanda/client.js";
import { Topics, Workflows, Events } from "../lib/redpanda/types.js";

export default fp(
    async (server, opts) => {
        const consumer = new RedpandaConsumer({
            brokerUrls: ["localhost:19092"],
            topics: [Topics.Order],
            groupId: "marco-order",
        });

        await consumer.connect();

        const workflows: Workflows<Topics.Order> = {
            order_expired: async (data) => { },
            order_refunded: async (data) => { },
            order_fulfilled: async (data) => { },
        };
        await consumer.consume(workflows);
        server.redpanda.consumers.push(consumer);
        console.log("marco-order consumer started!");
    },
    { name: "consumer:order" },
);
