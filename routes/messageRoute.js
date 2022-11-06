const express = require('express')
const { allMessages, sendMessage } = require('../controllers/messageController')
const { protect } = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/:chatId', protect, allMessages)
router.post('/', protect, sendMessage)

module.exports = router
