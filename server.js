const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const cors = require('cors')

const connectDB = require('./config/db')
const userRoute = require('./routes/userRoute')
const chatRoute = require('./routes/chatRoute')
const messageRoute = require('./routes/messageRoute')
const { notFound, errorHandler } = require('./middlewares/errorMiddleware')

dotenv.config()

connectDB()

const app = express()

app.get('/', (req, res) => {
    res.send('API is running')
})

app.use(bodyParser.json({ limit: '30mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }))
app.use(cors())

app.use('/api/user', userRoute)
app.use('/api/chat', chatRoute)
app.use('/api/message', messageRoute)

// Error Handling middlewares
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
