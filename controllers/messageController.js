const asyncHandler = require('express-async-handler')
const Chat = require('../models/chatModel')
const Message = require('../models/messageModel')
const User = require('../models/userModel')

//@description     Get all Messages
//@route           GET /api/message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate('sender', 'name avatar email')
            .populate('chat')
        res.json(messages)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

//@description     Create New Message
//@route           POST /api/message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body

    if (!content || !chatId) {
        return res.status(400).send({ message: 'Invalid data passed into request' })
    }

    const messageData = {
        sender: req.user._id,
        content,
        chat: chatId,
    }

    try {
        let message = await Message.create(messageData)

        message = await message.populate('sender', '-password')
        message = await message.populate('chat')
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name avatar email',
        })

        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message,
        })

        res.status(200).json(message)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

module.exports = { allMessages, sendMessage }
