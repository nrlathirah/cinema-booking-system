import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { sequelize } from './models/index.js'
import healthRoutes from './routes/health.js'
import authRoutes from './routes/auth.js'
import showtimeRoutes from './routes/showtimes.js'
import bookingRoutes from './routes/bookings.js'
import { registerSocketHandlers } from './sockets/index.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' },
})

app.set('io', io)

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

app.use('/api', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/showtimes', showtimeRoutes)
app.use('/api/bookings', bookingRoutes)

registerSocketHandlers(io)

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ alter: true })
    console.log('database connected and synced')
  } catch (err) {
    console.error('database connection failed:', err.message)
  }

  httpServer.listen(PORT, () => {
    console.log(`SeatFlow API listening on port ${PORT}`)
  })
}

start()
