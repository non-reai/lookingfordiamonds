import http from 'http'
import { Server } from 'socket.io'

const httpServer = http.createServer((req, res)=>{
    res.write("open")
    res.end()
})
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket)=>{
    console.log('connection: ', socket.id)

    let currentRoom

    socket.on('join_room', (roomId) => {
        console.log(socket.id,"connected to",roomId)
        socket.join(roomId)
        currentRoom = roomId
        io.to(roomId).emit('player_connect', socket.id)
        io.in(roomId).fetchSockets().then((players)=>{
            players.forEach(player => {
                if (player.id == socket.id) {
                    return
                }
                socket.emit('player_connect', player.id)
            })
        })
        
    })

    socket.on('set_dream', (playerId)=>{
        io.to(currentRoom).emit('set_dream', playerId)
    })

    socket.on('movement', position => {
        io.to(currentRoom).emit('movement', position)
    })

    socket.on('collect_diamond', (diamondName) => {
        io.to(currentRoom).emit('collect_diamond', diamondName)
    })

    socket.on('player_died', (playerName) => {
        io.to(currentRoom).emit('player_died', playerName)
    })

    socket.on('start_game', ()=>{
        io.to(currentRoom).emit('start_game', true)
    })

    socket.on('end_game', (playersWon)=>{
        io.to(currentRoom).emit('end_game', playersWon)
    })

    socket.on('disconnect', ()=>{
        io.to(currentRoom).emit('player_disconnect', socket.id)
    })
})

httpServer.listen(1234, ()=>{
    console.log('listen on 1234')
})