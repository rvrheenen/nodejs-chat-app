// imports
const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require('socket.io')
const Filter = require("bad-words")

const { generateMessage, generateLocationMessage} = require("./utils/messages")
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getRooms
} = require("./utils/users")

const ADMIN = "admin"

// app setup
const app = express()
const server = http.createServer(app)
const io = socketio().listen(server)

const port = process.env.PORT
const publicDirectoryPath = path.join(__dirname, "..", "public")

app.use(express.static(publicDirectoryPath))

app.get("/rooms", (req, res) => {
    res.send({rooms: getRooms()})
})


// socket events
io.on("connection", (socket) => {
    socket.on("joinRoom", (options, callback) => {
        var {error, user} = addUser({id: socket.id, ...options})
        if (error) return callback(error)

        socket.join(user.room)

        socket.emit("message", generateMessage(ADMIN, "Welcome!"))
        socket.broadcast.to(user.room).emit("message", generateMessage(user.username, `${user.username} has joined!`))
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })


    socket.on("sendMessage", (message, callback) => {
        // var filter = new Filter()
        
        // if (filter.isProfane(message)) {
        //     return callback("Profanity is not allowed!")
        // }
        var user = getUser(socket.id)
        if (!user) return callback({error: "something went wrong"})

        io.to(user.room).emit("message", generateMessage(user.username, message))
        callback()
    })


    socket.on("sendLocation", (coords, callback) => {
        var user = getUser(socket.id)
        if (!user) return callback({error: "something went wrong"})

        io.emit("locationMessage", generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })


    socket.on("disconnect", () => {
        var user  = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit("message", generateMessage(ADMIN, `${user.username} has left.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

// start listening
server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})