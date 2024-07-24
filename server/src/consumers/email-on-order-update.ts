import fp from "fastify-plugin";
import { RedpandaConsumer } from "../lib/redpanda/client.js";
import { Topics, Workflows } from "../lib/redpanda/types.js";

export default fp(
    async (server, opts) => {
        const consumer = new RedpandaConsumer({
            brokerUrls: ["localhost:19092"],
            topics: [Topics.Order],
            groupId: "marco-email-on-order-update",
        });

        await consumer.connect();

        const workflows: Workflows<Topics.Order> = {
            order_expired: async (data) => { },
            order_refunded: async (data) => { },
            order_fulfilled: async (data) => {
                console.log("email on order update");
            },
        };
        await consumer.consume(workflows);
        server.redpanda.consumers.push(consumer);
        server.log.info("marco-email-on-order-update consumer started!");
    },
    { name: "consumer:email-on-order-update" },
);
