import fp from "fastify-plugin";

import { RedpandaConsumer } from "../lib/redpanda/client.js";
import { Topics, Workflows } from "../lib/redpanda/types.js";

export default fp(
    async (server, opts) => {
        const consumer = new RedpandaConsumer({
            brokerUrls: ["localhost:19092"],
            topics: [Topics.Notification],
            groupId: "marco-notification",
        });

        await consumer.connect();
        const workflows: Workflows<Topics.Notification> = {
            notification_sent: async (data) => { },
        };

        await consumer.consume(workflows);
        server.redpanda.consumers.push(consumer);
        console.log("marco-notification consumer started!");
    },
    { name: "consumer:notification" },
);
