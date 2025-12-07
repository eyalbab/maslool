import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import dotenv from "dotenv";

const fastify = Fastify({
    logger: true,
});

async function registerPlugins() {
    await fastify.register(cors, {
        origin: true,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    });

    await fastify.register(cookie, {
        // optional: secret: "super-secret-cookie-key",
    });
}

async function registerRoutes() {
    
}

async function start() {
    await registerPlugins();
    await registerRoutes();

    try {
        await fastify.listen({ port: 3000, host: "0.0.0.0" });
        fastify.log.info(`Server listening on http://localhost:3000`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();