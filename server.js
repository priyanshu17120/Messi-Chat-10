const express = require('express');
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomusers } = require('./utils/users')

const app = express();
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')))
const botname = 'PkChat'
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        socket.emit('message', formatMessage(botname, 'Welcome To Pk Chat'))


        socket.broadcast.to(user.room).emit('message', formatMessage(botname, `${user.username} has joined the chat`));

        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomusers(user.room)
        })

    })
    socket.on('chatmessage', (msg) => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if (user) {

            io.to(user.room).emit('message', formatMessage(botname, `${user.username} user has left the chat`))

            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getRoomusers(user.room)
            })
        }
    })
})

const port = 3000 || process.env.PORT;



server.listen(port, () => {
    console.log(`Server Running On: http://localhost:${port}`);
});