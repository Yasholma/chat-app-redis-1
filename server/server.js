import express from "express";
import bodyParser from "body-parser";
import socket from "socket.io";
import path from "path";
import env from "node-env-file";
import { client } from "./../lib/redis";

import * as routes from "./routes";

env(".env");

const PORT = process.env.APP_PORT;

const app = express();

app.set("views", path.join(__dirname, "../public/views"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "../public/assets")));
app.use(bodyParser.urlencoded({ extended: true }));

client().then(
    res => {
        app.get("/", routes.home);
        app.get("/chat/:username", routes.chatRoom);
        app.get("/messages", routes.messages);
        app.get("/users", routes.users);
        app.post("/user", routes.createUser);
        app.delete("/user", routes.deleteUser);
        app.post("/message", routes.createMessage);

        const server = app.listen(PORT, () => {
            console.log("Server Started");
        });

        const io = socket.listen(server);

        io.on("connection", socket => {
            res.subscribe("chatMessages");
            res.subscribe("activeUsers");

            res.on("message", (channel, message) => {
                if (channel === "chatMessages") {
                    socket.emit("message", JSON.parse(message));
                } else {
                    socket.emit("users", JSON.parse(message));
                }
            });
        });
    },
    err => {
        console.log("Redis connection failed: " + err);
    },
);
