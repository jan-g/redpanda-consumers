import {
    Kafka,
    CompressionTypes,
    SASLOptions,
    type Producer,
    type Consumer,
} from "kafkajs";
import { Topics, EventMap, Workflows } from "./types.js";

export class RedpandaProducerFactory {
    private producer: Producer;

    constructor(brokerUrl: string, credentials?: SASLOptions) {
        this.producer = this.createProducer(brokerUrl, credentials);
        console.log("Redpanda producer factory initialized!");
    }

    async start() {
        try {
            await this.producer.connect();
        } catch (err) {
            console.error("Error connecting the producer: ", err);
        }
    }

    async disconnect() {
        try {
            await this.producer.disconnect();
        } catch (err) {
            console.error("Error disconnecting the producer: ", err);
        }
    }

    async sendMessage<T extends keyof EventMap, K extends keyof EventMap[T]>({
        topic,
        key,
        value,
    }: {
        topic: T;
        event: K;
        key: string | null;
        value: EventMap[T][K];
    }) {
        if (!key) {
            await this.producer.send({
                topic,
                compression: CompressionTypes.GZIP,
                messages: [{ value: JSON.stringify(value) }],
            });
        } else {
            await this.producer.send({
                topic,
                compression: CompressionTypes.GZIP,
                messages: [{ key: key, value: JSON.stringify(value) }],
            });
        }
    }

    private createProducer(brokerUrl: string, credentials?: SASLOptions) {
        if (!credentials) {
            return new Kafka({
                brokers: [brokerUrl],
                connectionTimeout: 3000,
            }).producer();
        }
        const kafka = new Kafka({
            brokers: [brokerUrl],
            ssl: {},
            sasl: credentials,
            connectionTimeout: 3000,
        });

        return kafka.producer();
    }
}

type ConsumerConfig<T extends Topics> = {
    brokerUrls: string[];
    groupId: string;
    topics: T[];
    saslOptions?: SASLOptions;
    ssl?: boolean;
};

export class RedpandaConsumer<T extends Topics> {
    private redpanda: Kafka;
    private consumer: Consumer;

    constructor(private config: ConsumerConfig<T>) {
        if (config.ssl && config.saslOptions) {
            this.redpanda = new Kafka({
                brokers: config.brokerUrls,
                ssl: {},
                sasl: config.saslOptions,
                connectionTimeout: 3000,
            });
            this.consumer = this.redpanda.consumer({ groupId: config.groupId });
        } else {
            this.redpanda = new Kafka({
                brokers: config.brokerUrls,
                connectionTimeout: 3000,
            });
            this.consumer = this.redpanda.consumer({ groupId: config.groupId });
        }
    }

    async connect(): Promise<void> {
        try {
            await this.consumer.connect();
            await this.consumer.subscribe({ topics: this.config.topics });
        } catch (err) {
            console.error("Error connecting the consumer: ", err);
        }
    }

    async consume(workflows: Workflows<T>): Promise<void> {
        await this.consumer.run({
            eachMessage: async ({ topic, message }) => {
                try {
                    if (!message.value) return;

                    const parsedValue = JSON.parse(message.value.toString());
                    const eventType = parsedValue.event_type as keyof EventMap[T];

                    if (eventType && eventType in workflows) {
                        await workflows[eventType](parsedValue);
                    }
                } catch (err) {
                    console.error("Error consuming message: ", err);
                }
            },
        });
    }

    async disconnect(): Promise<void> {
        await this.consumer.disconnect();
    }
}
