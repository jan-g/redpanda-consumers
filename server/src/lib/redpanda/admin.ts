import { Kafka } from "kafkajs";
import { Topics } from "./types.js";
const redpanda = new Kafka({
    brokers: ["localhost:19092"],
});
const admin = redpanda.admin();
export async function createTopic(partitions?: number, replicas?: number) {
    console.log("Connecting to admin...");
    await admin.connect();
    const existingTopics = await admin.listTopics();
    for (const topic of Object.values(Topics)) {
        if (!existingTopics.includes(topic)) {
            await admin.createTopics({
                topics: [
                    {
                        topic: topic,
                        numPartitions: partitions ? partitions : 1,
                        replicationFactor: replicas ? replicas : -1,
                    },
                ],
            });
        }
    }
    await admin.disconnect();
}
