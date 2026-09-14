import { lockSeat, releaseSeat, releaseAllForSocket } from './seatLocks.js'

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('showtime:join', (showtimeId) => {
      socket.join(`showtime:${showtimeId}`)
    })

    socket.on('showtime:leave', (showtimeId) => {
      socket.leave(`showtime:${showtimeId}`)
    })

    socket.on('seat:select', ({ showtimeId, seatId }) => {
      const ok = lockSeat({ showtimeId, seatId, socket, io })
      if (ok) {
        io.to(`showtime:${showtimeId}`).emit('seat:locked', { seatId, socketId: socket.id })
      } else {
        socket.emit('seat:select:rejected', { seatId })
      }
    })

    socket.on('seat:deselect', ({ showtimeId, seatId }) => {
      const ok = releaseSeat({ showtimeId, seatId, socketId: socket.id })
      if (ok) {
        io.to(`showtime:${showtimeId}`).emit('seat:released', { seatId })
      }
    })

    socket.on('disconnect', () => {
      const released = releaseAllForSocket(socket.id)
      released.forEach(({ showtimeId, seatId }) => {
        io.to(`showtime:${showtimeId}`).emit('seat:released', { seatId })
      })
    })
  })
}
