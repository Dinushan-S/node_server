const express = require("express");
const app = express();
const http = require("http").Server(app);
const cors = require("cors");
const PORT = 4000;
const socketIO = require("socket.io")(http, {
    cors: {
        // origin: "http://localhost:3000",
        // origin: "http://localhost:19006",
        origin: "http://192.168.1.2:19000",

    },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const generateID = () => Math.random().toString(36).substring(2, 10);
let chatRooms = [];


// let chatRooms = [
//     👇🏻 Here is the data structure of each chatroom
//     {
//      id: generateID(),
//      name: "Novu Hangouts",
//      messages: [
//          {
//              id: generateID(),
//              text: "Hello guys, welcome!",
//              time: "07:50",
//              user: "Tomer",
//          },
//          {
//              id: generateID(),
//              text: "Hi Tomer, thank you! 😇",
//              time: "08:50",
//              user: "David",
//          },
//      ],
//     },
// ];

// Add this before the app.get() block
socketIO.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on("createRoom", (name) => {
        socket.join(name);
        chatRooms.unshift({ id: generateID(), name, messages: [] });
        socket.emit("roomsList", chatRooms);
    });

    socket.on("findRoom", (id) => {
        let result = chatRooms.filter((room) => room.id == id);
        // console.log(chatRooms);
        socket.emit("foundRoom", result[0].messages);
        // console.log("Messages Form", result[0].messages);
    });

    socket.on("newMessage", (data) => {
        const { room_id, message, user, timestamp } = data;
        let result = chatRooms.filter((room) => room.id == room_id);
        const newMessage = {
            id: generateID(),
            text: message,
            user,
            time: `${timestamp.hour}:${timestamp.mins}`,
        };
        console.log("New Message", newMessage);
        socket.to(result[0].name).emit("roomMessage", newMessage);
        result[0].messages.push(newMessage);

        socket.emit("roomsList", chatRooms);
        socket.emit("foundRoom", result[0].messages);
    });
    socket.on("disconnect", () => {
        socket.disconnect();
        console.log("🔥: A user disconnected");
    });
});


app.get("/api", (req, res) => {
    res.set('Access-Control-Allow-Origin', 'http://192.168.1.2:19000');
    res.json({ chatRooms });
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});