const express = require("express");
const http = require("http");
const {WebSocketServer} = require("ws");

const app = express();
const server= http.createServer(app);
const wss = new WebSocketServer({server});

const clients = new Map();

wss.on("connection", (ws) =>{
    const id = crypto.randomUUID();
    clients.set(id,ws);
    ws.send(JSON.stringify({type : "init", id}));

    ws.on("message", (data)=>{
        const state = JSON.parse(data);
        for (const [cid, client] of clients) {
            if (cid !==id && client.readyState ===1)
                client.send(JSON.stringify(state));
        }
    });

    ws.on("close", () => clients.delete(id));
});

server.listen(3000,'0.0.0.0', () => console.log("Server on port 3000"));