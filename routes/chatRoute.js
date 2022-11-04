const express = require('express')
const {
    accessChat,
    fetchChats,
    createGroupChat,
    removeFromGroup,
    addToGroup,
    renameGroup,
} = require('../controllers/chatController')
const { protect } = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/', protect, fetchChats)
router.post('/', protect, accessChat)
router.post('/group', protect, createGroupChat)
router.put('/rename', protect, renameGroup)
router.put('/groupadd', protect, addToGroup)
router.put('/groupremove', protect, removeFromGroup)

module.exports = router
