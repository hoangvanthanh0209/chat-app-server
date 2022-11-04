const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1y',
    })
}

module.exports = { generateAccessToken, generateRefreshToken }
