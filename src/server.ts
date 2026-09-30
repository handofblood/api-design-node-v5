import express from 'express';
import authRoutes from './routes/authRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
import habitRoutes from './routes/habitRoutes.ts'
import logger from './middleware/logger.ts'
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { isTest } from '../env.ts';
import {errorHandler}from './middleware/errors.ts'

const app = express()

app.use(logger)
app.use(cors())
app.use(helmet())
app.use(morgan('dev', {
  skip: ()=> isTest(),
}))
app.use(express.json())

app.get('/healthy', (req,res) => {

    res.json('<button>ok</button>').status(200)
    res.end()

})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/habits', habitRoutes)


app.use('/api/*splat', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  })
})

app.use(errorHandler)

export default app