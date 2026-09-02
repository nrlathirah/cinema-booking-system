import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import healthRoutes from './routes/health.js'
import { registerSocketHandlers } from './sockets/index.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' },
})

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

app.use('/api', healthRoutes)

registerSocketHandlers(io)

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log(`SeatFlow API listening on port ${PORT}`)
})
