const WebSocket = require('ws');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const {json} = require("express");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const wss = new WebSocket.Server({ noServer: true });
const sockets = new Map();
const server = http.createServer(app);
const roomExpiryTime = 10 * 60 * 1000; //10 minutes
const maxRooms = 10; //5 minutes

app.use((req, res, next) => {
    const allowedOrigins = [process.env.DNS_FRONT];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header("Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, chave, token, segredo, steamid");
    next();
});

app.use(json());
app.use(express.urlencoded({extended: true}));
app.options('*', function (req, res) {
    res.sendStatus(200);
});

app.post('/create-room', (req, res) => {
    if(sockets.size < maxRooms) {
        const code = generateRandomCode();
        sockets.set(code, {
            clients: new Map(),
            stories: [],
            currentStory: -1,
            mediaVotos: 0,
            started: false,
            reveled: false,
            voteMap: new Map(),
            lastActivity: new Date()
        });
        res.json({code});
    } else {
        res.status(400).send({message: 'Maximum number of rooms reached.'});
    }
});

function handleConnection(ws, req, code) {
    if (!sockets.has(code)) {
        ws.send(JSON.stringify({ error: 'Invalid code' }));
        ws.close();
        return;
    }

    const socketState = sockets.get(code);

    ws.on('message', (message) => {
        updateRoomActivity(code);
        const data = JSON.parse(message);
        if (data.type === 'nickname') {
            // Assign nickname to the client
            socketState.clients.set(ws, data.nickname);
            console.log(`Room ${code}: Client connected with nickname: ${data.nickname}`);
            sendToClient(ws, JSON.stringify({ type: 'nickname', nickname: data.nickname, voteAverage: socketState.mediaVotos, text: `Welcome, ${data.nickname}!`, started: socketState.started, reveled: socketState.reveled, currentStory: socketState.currentStory, stories: socketState.stories, votes: Array.from(socketState.voteMap, ([nickname, vote]) => ({nickname, vote}))}))
            sendToAllClients(socketState, JSON.stringify({ roomExpiryTime: roomExpiryTime, type: 'welcome', text: `${data.nickname} joined into the room.`, participants: Array.from(socketState.clients.values())}));
        } else if (data.type === 'message') {
            const nickname = socketState.clients.get(ws);
            const text = `${nickname}: ${data.text}`;
            console.log(`Room ${code}: ${text}`);
            sendToAllClients(socketState, JSON.stringify({ roomExpiryTime: roomExpiryTime, type: 'message', text }));
        }  else if (data.type === 'event') {
            const nickname = socketState.clients.get(ws);
            const nomeEvento = data.name;
            const valorEvento = data.value;

            if(nomeEvento === "vote") {
                const text = `${nickname} votou.`;
                socketState.voteMap.set(nickname, valorEvento);
                sendToAllClients(socketState, JSON.stringify({ roomExpiryTime: roomExpiryTime, type: 'vote', text: text, nickname: nickname }));
                console.log(`Room ${code}: ${text}`);
            }

            if(nomeEvento === "revel") {
                socketState.reveled = true;
                socketState.started = false;
                if(socketState.voteMap.size > 0 ) {
                    socketState.mediaVotos = 0;
                    socketState.voteMap.forEach((value, key, map) => {
                        socketState.mediaVotos += value;
                    });
                    socketState.mediaVotos /= socketState.voteMap.size;
                    socketState.mediaVotos = round(socketState.mediaVotos, 1);
                    const text = `${nickname} revealed the votes.`;
                    sendToAllClients(socketState, JSON.stringify({roomExpiryTime: roomExpiryTime, type: 'revel', text: text, average: socketState.mediaVotos, votes: Array.from(socketState.voteMap, ([nickname, vote]) => ({nickname, vote}))}));
                    console.log(`Room ${code}: ${text}`);
                } else {
                    const text = `No one has voted yet.`;
                    sendToClient(ws, JSON.stringify({type: 'message', text}));
                }
            }

            if(nomeEvento === "start") {
                socketState.reveled = false;
                socketState.reveled = false;
                socketState.started = true;
                socketState.voteMap.clear();
                const text = `${nickname} started voting.`;
                sendToAllClients(socketState, JSON.stringify({ roomExpiryTime: roomExpiryTime, type: 'start', text }));
                console.log(`Room ${code}: ${text}`);
            }

            if(nomeEvento === "post-story") {
                socketState.reveled = false;
                socketState.started = false;
                socketState.stories.push(valorEvento);
                const text = `Story '${valorEvento}' added.`;
                sendToClient(ws, JSON.stringify({type: 'message', text}));
                sendToAllClients(socketState, JSON.stringify({ roomExpiryTime: roomExpiryTime, type: 'post-story', text: `${nickname} added a new story.`, stories: socketState.stories }));
                console.log(`Room ${code}: ${nickname} added a new story.`);
            }

            if(nomeEvento === "remove-story") {
                socketState.reveled = false;
                socketState.started = false;
                const text = `Story '${socketState.stories[valorEvento]}' removed.`;
                socketState.currentStory = -1;
                socketState.stories.splice(valorEvento, 1);
                sendToClient(ws, JSON.stringify({type: 'message', text}));
                sendToAllClients(socketState, JSON.stringify({ roomExpiryTime: roomExpiryTime, type: 'remove-story', index: valorEvento, text: `${nickname} removed a story.`, stories: socketState.stories }));
                console.log(`Room ${code}: ${nickname} removed a story.`);
            }

            if(nomeEvento === "change-moderator") {
                socketState.clients = moveValueKeyToFront(socketState.clients, getValueByIndex(socketState.clients, valorEvento));
                const text = `Moderator changed to  '${Array.from(socketState.clients.values())[0]}'.`;
                sendToAllClients(socketState, JSON.stringify({ roomExpiryTime: roomExpiryTime, type: 'change-moderator', index: valorEvento, text: text, participants: Array.from(socketState.clients.values()) }));
                console.log(`Room ${code}: ${text}`);
            }

            if(nomeEvento === "next-story") {
                socketState.reveled = false;
                socketState.started = false;
                if(socketState.currentStory + 1 <= socketState.stories.length - 1) {
                    socketState.currentStory += 1;
                    const text = `História atual: '${socketState.stories[socketState.currentStory]}'.`;
                    sendToClient(ws, JSON.stringify({type: 'message', text}));
                    sendToAllClients(socketState, JSON.stringify({ roomExpiryTime: roomExpiryTime, type: 'current-story', index: socketState.currentStory, text: `${nickname} moved to next story.`}));
                    console.log(`Room ${code}: ${nickname} moved to next story.`);
                } else {
                    const text = `There is no next story.`;
                    sendToClient(ws, JSON.stringify({type: 'message', text}));
                }
            }

            if(nomeEvento === "back-story") {
                socketState.reveled = false;
                socketState.started = false;
                if(socketState.currentStory - 1 >= 0) {
                    socketState.currentStory -= 1;
                    const text = `História atual: '${socketState.stories[socketState.currentStory]}'.`;
                    sendToClient(ws, JSON.stringify({type: 'message', text}));
                    sendToAllClients(socketState, JSON.stringify({ roomExpiryTime: roomExpiryTime, type: 'current-story', index: socketState.currentStory, text: `${nickname} moved to previous story.`}));
                    console.log(`Room ${code}: ${nickname} moved to previous story.`);
                } else {
                    const text = `Não há uma história anterior.`;
                    sendToClient(ws, JSON.stringify({type: 'message', text}));
                }
            }

            if(nomeEvento === "clear") {
                socketState.reveled = false;
                socketState.started = false;
                socketState.average = 0;
                socketState.voteMap.clear();
                const text = `${nickname} reset the votes.`;
                sendToAllClients(socketState, JSON.stringify({ roomExpiryTime: roomExpiryTime, type: 'clear', text }));
                console.log(`Room ${code}: ${nickname} reset the votes.`);
            }

        }
    });

    ws.on('close', () => {
        let moderatorExit = false;
        if(getIndexByKey(socketState.clients, ws) === 0) {
            moderatorExit = true;
        }

        const nickname = socketState.clients.get(ws);
        socketState.clients.delete(ws);

        if(socketState.clients.size > 0) {
            sendToAllClients(socketState, JSON.stringify({
                type: 'disconnect',
                text: `${nickname} leave the room.`,
                participants: Array.from(socketState.clients.values())
            }));
            if (moderatorExit) {
                const text = `Moderator changed to  '${Array.from(socketState.clients.values())[0]}'.`;
                sendToAllClients(socketState, JSON.stringify({
                    type: 'message',
                    text: text
                }));
            }
        } else {
            sockets.delete(code);
            console.log(`Room ${code} removed due to inactivity.`);
        }
        console.log(`Room ${code}: Client disconnected: ${nickname}`);
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error: ${error}`);
    });
}

server.on('upgrade', (request, socket, head) => {
    const pathname = request.url.split('/').filter(Boolean);
    if (pathname[0] === 'connect' && pathname[1]) {
        const code = pathname[1];
        if (sockets.has(code)) {
            wss.handleUpgrade(request, socket, head, (ws) => {
                handleConnection(ws, request, code);
            });
        } else {
            socket.destroy();
        }
    } else {
        socket.destroy();
    }
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


function sendToClient(ws, message) {
    ws.send(message);
}

function sendToAllClients(socketState, message) {
    socketState.clients.forEach((_, client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function generateRandomCode() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 5; i++) {
        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        codigo += caracteres.charAt(indiceAleatorio);
    }
    return codigo;
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function getIndexByKey(map, keyToFind) {
    const entries = Array.from(map.entries());
    for (let i = 0; i < entries.length; i++) {
        if (entries[i][0] === keyToFind) {
            return i;
        }
    }
    throw new Error(`Key "${keyToFind}" not found in the map.`);
}

function getValueByIndex(map, index) {
    const entries = Array.from(map.entries());
    if (index < 0 || index >= entries.length) {
        throw new Error(`Index ${index} is out of bounds.`);
    }
    return entries[index][1]; // Retorna o valor na posição especificada
}

function moveValueKeyToFront(map, valueToMove) {
    let keyToMove;
    for (const [key, value] of map) {
        if (value === valueToMove) {
            keyToMove = key;
            break;
        }
    }

    if (keyToMove === undefined) {
        throw new Error(`Value "${valueToMove}" not found in the map.`);
    }

    const newMap = new Map();
    newMap.set(keyToMove, valueToMove);

    for (const [key, value] of map) {
        if (key !== keyToMove) {
            newMap.set(key, value);
        }
    }

    return newMap;
}

function updateRoomActivity(code) {
    const room = sockets.get(code);
    if(room !== undefined) {
        room.lastActivity = new Date();
    }
}

function cleanUpExpiredRooms() {
    console.log(`Inactive room removal routine running.`);
    const now = Date.now();
    for (const code of sockets.keys()) {
        const room = sockets.get(code);
        if (room !== undefined && now - room.lastActivity > roomExpiryTime) {
            for (const ws of room.clients.keys()) {
                ws.close();
            }
            sockets.delete(code);
        }
    }
}

setInterval(cleanUpExpiredRooms, 5 * 60 * 1000);
