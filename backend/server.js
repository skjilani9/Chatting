const express = require('express');
const dotenv = require('dotenv')
const database = require("./database")
const user = require("./routes/userroute")
const chat = require('./routes/chatroute')
const message = require("./routes/messageroute")
const { errorHandler, notFound } = require("./middleware/errormiddle")
const cors = require('cors')



dotenv.config({ path: "backend/config.env" })
database();
const app = express();
app.use(cors({
    origin:true,
    credentials:true
}))
app.use(express.json());

app.use("/api/v1", user)
app.use('/api/v1', chat)
app.use("/api/v1", message)


app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3333

const server = app.listen(port, () => {
    console.log(`server is running on ${port}`);
})


const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: true,
        // credentials: true,
    },
});

io.on("connection", (socket) => {
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    })
    socket.on("join chat", (room) => {
        socket.join(room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});