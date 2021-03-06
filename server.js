// server.js

const express = require('express');
const SocketServer = require('ws').Server;
const uuidv1 = require('uuid/v1');
const WebSocket = require('ws');


// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  connectionObj = { type: 'connectCount' };
  connectionObj.num = wss.clients.size;
  connectionObj = JSON.stringify(connectionObj)
  wss.broadcast(connectionObj);
  ws.on('message', function incoming(data) {
    let msgObj = JSON.parse(data)
    msgObj.uuid = uuidv1();
    if(msgObj.username !== msgObj.newName && msgObj.newName !== ''){
      msgObj.type = 'notification';
    } else {
      msgObj.type = 'regular';
    }
    msgObj = JSON.stringify(msgObj);
    // Broadcast to everyone else.
    wss.broadcast = function broadcast(data) {
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    };
    wss.broadcast(msgObj);
  });
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    connectionObj.num = wss.clients.size;
    wss.broadcast(connectionObj);
  });
});