const asyncHandler = require('express-async-handler')
const Chat = require('../models/chatModel')
const User = require('../models/userModel')

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body

    if (!userId) {
        res.status(400)
        throw new Error('UserId param not sent with request')
    }

    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [{ users: { $elemMatch: { $eq: userId } } }, { users: { $elemMatch: { $eq: req.user._id } } }],
    })
        .populate('users', '-password')
        .populate('latestMessage')

    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: 'name avatar email',
    })

    if (isChat.length > 0) {
        res.send(isChat[0])
    } else {
        const chatData = {
            chatName: 'sender',
            isGroupChat: false,
            users: [userId, req.user._id],
        }

        try {
            const createdChat = await Chat.create(chatData)
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password')
            res.status(200).json(fullChat)
        } catch (error) {
            res.status(400)
            throw new Error(error.message)
        }
    }
})

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate('users', '-password')
            .populate('latestMessage')
            .populate('groupAdmin', '-password')
            .sort({ updatedAt: -1 })
            .exec()
            .then(async (results) => {
                results = await User.populate(results, {
                    path: 'latestMessage.sender',
                    select: 'name avatar email',
                })
                res.json(results)
            })
            .catch((error) => {
                res.status(400)
                throw new Error(error.message)
            })
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.chatName) {
        return res.status(400).send({ message: 'Please Fill all the feilds' })
    }

    let users = JSON.parse(req.body.users)

    if (users.length < 2) {
        return res.status(400).send('More than 2 users are required to form a group chat')
    }

    users.push(req.user._id)

    try {
        const chatData = {
            chatName: req.body.chatName,
            isGroupChat: true,
            users,
            groupAdmin: req.user._id,
        }

        const groupChat = await Chat.create(chatData)

        const fullGroupChat = await Chat.findOne({ _id: groupChat })
            .populate('users', '-password')
            .populate('groupAdmin', '-password')

        res.status(200).json(fullGroupChat)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName,
        },
        { new: true },
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password')

    if (!updatedChat) {
        res.status(404)
        throw new Error('Chat Not Found')
    } else {
        res.json(updatedChat)
    }
})

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId, isAdminRole = false } = req.body

    // check if the requester is admin
    if (isAdminRole) {
        const isAdmin = await Chat.findOne({
            _id: chatId,
            $and: [{ groupAdmin: { $eq: req.user._id } }],
        })

        if (!isAdmin) {
            return res.status(400).send({ message: 'Only admin can add member to group' })
        }
    }

    // check if member is exist
    const isExist = await Chat.findOne({
        _id: chatId,
        $and: [{ users: { $elemMatch: { $eq: userId } } }],
    })

    if (isExist) {
        return res.status(400).send({ message: 'User is already in the group' })
    }

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        { new: true },
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password')

    if (!added) {
        res.status(404)
        throw new Error('Chat Not Found')
    } else {
        res.json(added)
    }
})

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId, isAdminRole = false } = req.body

    // check if the requester is admin

    if (isAdminRole) {
        const isAdmin = await Chat.findOne({
            _id: chatId,
            $and: [{ groupAdmin: { $eq: req.user._id } }],
        })

        if (!isAdmin) {
            return res.status(400).send({ message: 'Only admin can remove member from group' })
        }
    }

    // check if member is exist
    const isExist = await Chat.findOne({
        _id: chatId,
        $and: [{ users: { $elemMatch: { $eq: userId } } }],
    })

    if (!isExist) {
        return res.status(400).send({ message: 'User is not in the group' })
    }

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        { new: true },
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password')

    if (!removed) {
        res.status(404)
        throw new Error('Chat Not Found')
    } else {
        res.json(removed)
    }
})

module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup }
