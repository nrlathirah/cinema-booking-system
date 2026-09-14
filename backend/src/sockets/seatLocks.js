const locks = new Map()
const HOLD_MS = 2 * 60 * 1000

function key(showtimeId, seatId) {
  return `${showtimeId}:${seatId}`
}

export function lockSeat({ showtimeId, seatId, socket, io }) {
  const k = key(showtimeId, seatId)
  const existing = locks.get(k)
  if (existing && existing.socketId !== socket.id) {
    return false
  }

  if (existing) clearTimeout(existing.timeoutId)

  const timeoutId = setTimeout(() => {
    locks.delete(k)
    io.to(`showtime:${showtimeId}`).emit('seat:released', { seatId })
  }, HOLD_MS)

  locks.set(k, { socketId: socket.id, timeoutId })
  return true
}

export function releaseSeat({ showtimeId, seatId, socketId }) {
  const k = key(showtimeId, seatId)
  const existing = locks.get(k)
  if (!existing || existing.socketId !== socketId) return false

  clearTimeout(existing.timeoutId)
  locks.delete(k)
  return true
}

export function releaseAllForSocket(socketId) {
  const released = []
  for (const [k, v] of locks.entries()) {
    if (v.socketId === socketId) {
      clearTimeout(v.timeoutId)
      locks.delete(k)
      const [showtimeId, seatId] = k.split(':')
      released.push({ showtimeId, seatId })
    }
  }
  return released
}

export function clearSeatLock(showtimeId, seatId) {
  const k = key(showtimeId, seatId)
  const existing = locks.get(k)
  if (existing) {
    clearTimeout(existing.timeoutId)
    locks.delete(k)
  }
}
