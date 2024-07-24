# redpanda consumers issue

It takes awhile to reconnect to existing consumer group.

1. start Redpanda instance

```sh
docker-compose up -d
```

2. Start Server

```sh
cd server && pnpm start
```

3. Initial connection should work.

4. Exit the process with Ctrl^c

5. Immediately restart the server and get timeout error. After waiting a moment then restarting works fine. Number of consumers registered is relevant.
   For example, one consumer and starting immediately will work, but once you have four consumers like the example above, you will run into timeout errors.
