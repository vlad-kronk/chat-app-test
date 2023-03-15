require('dotenv').config();

const express = require('express');
const app = express();
http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const harperSaveMessage = require('./services/harper-save-message');
const harperGetMessages = require('./services/harper-get-messages');
const leaveRoom = require('./utils/leave-room');

app.use(cors()); // use cors middleware

const server = http.createServer(app);

// create an io server and allow for CORS from http://localhost:3000 with GET and POST methods
const io = new Server(server, {
   cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
   },
});


const CHAT_BOT = 'ChatBot';

let chatRoom = ''; // ex: javascript, node,...
let allUsers = []; // array of all users in current chat room

// Listen for when the client connects via socket.io-client
io.on('connection', (socket) => {
   console.log(`User connected ${socket.id}`);

   socket.on('join_room', (data) => {
      // extrapolate data object into individual variables
      const { username, room } = data;
      // join a user to a socket room
      socket.join(room);
      console.log(`${username} has joined the the ${room} chat`)

      let __createdtime__ = Date.now();

      // all clients in the room BESIDES the user's will recieve this message
      socket.to(room).emit('receive_message', {
         message: `${username} has joined the chat room`,
         username: CHAT_BOT,
         __createdtime__,
      });

      // only the current user's client recieves this message
      socket.emit('receive_message', {
         message: `Welcome ${username}`,
         username: CHAT_BOT,
         __createdtime__,
      });

      chatRoom = room;
      allUsers.push({ id: socket.id, username, room });
      chatRoomUsers = allUsers.filter((user) => user.room === room);
      socket.to(room).emit('chatroom_users', chatRoomUsers);
      socket.emit('chatroom_users', chatRoomUsers);

      // get last 100 messages from database, then
      harperGetMessages(room)
         .then((last100Messages) => {
            // tell the user's client to display said messages
            socket.emit('last_100_messages', last100Messages);
         })
         .catch((err) => console.log(err));
   });

   socket.on('send_message', (data) => {
      // extrapolate data object into individual variables
      const { message, username, room, __createdtime__ } = data;
      // all clients in room, including sender, recieve the message
      io.in(room).emit('receive_message', data);
      // save message in database
      harperSaveMessage(message, username, room, __createdtime__)
         .then((response) => console.log(response))
         .catch((err) => console.log(err));
   });

   socket.on('leave_room', (data) => {
      // extrapolate data object into individual variables
      const { username, room } = data;
      // remove socket instance from current room
      socket.leave(room);

      const __createdtime__ = Date.now();

      // remove user of socket instance from the chatroom user list
      allUsers = leaveRoom(socket.id, allUsers);
      // tell client to refresh chatroom user list with updated data
      socket.to(room).emit('chatroom_users', allUsers);
      // all clients in the chatroom recieve a message that the user has left
      socket.to(room).emit('receive_message', {
         username: CHAT_BOT,
         message: `${username} has left the chat`,
         __createdtime__,
      });

      console.log(`${username} has left the ${room} chat`);
   });

   socket.on('disconnect', () => {
      console.log('User disconnected from the chat');
      const user = allUsers.find((user) => user.id == socket.id);
      // ?. operator saves us from a runtime error if object property does not exist
      // if the user doesnt have a username property, expression will return undefined
      if (user?.username) {
         // removes user from allUsers list
         allUsers = leaveRoom(socket.id, allUsers);
         // refresh client userlist for current chatroom
         socket.to(chatRoom).emit('chatRoom_users', allUsers);
         // all clients in chatroom recieve a message that the user has disconnected
         socket.to(chatRoom).emit('recieve_message', {
            message: `${user.username} has disconnected.`,
         });
      }
   });
});

server.listen(4000, () => 'Server is running on port 3000');