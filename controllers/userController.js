const aasyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const { uploadImage } = require('../utils/cloudinary')
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken')

const register = aasyncHandler(async (req, res) => {
    const { name, email, password } = req.body
    const avatar = req.file
    let image

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please Enter all the Feilds' })
    }

    const isExsit = await User.findOne({ email })

    if (isExsit) {
        return res.status(400).json({ message: 'User already exists' })
    }

    if (avatar) {
        const path = avatar.path
        image = await uploadImage(path)
    }

    const createdUser = await User.create({
        name,
        avatar: image?.secure_url,
        avatarCloudinaryId: image?.public_id,
        email,
        password,
    })

    if (!createdUser) {
        return res.status(401).json({ message: 'User not found' })
    }

    return res.status(201).json({
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        avatar: createdUser.avatar,
        token: generateAccessToken(createdUser._id),
        refreshToken: generateRefreshToken(createdUser._id),
    })
})

const login = aasyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'Please Enter all the Feilds' })
    }

    const user = await User.findOne({ email })

    if (!user) {
        return res.status(400).json({ message: 'User not exists' })
    }

    if (user && (await user.matchPassword(password))) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            token: generateAccessToken(user._id),
            refreshToken: generateRefreshToken(user._id),
        })
    } else {
        res.status(401)
        throw new Error('Invalid Email or Password')
    }
})

const getAllUsers = aasyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
              $or: [
                  { name: { $regex: req.query.search, $options: 'i' } },
                  { email: { $regex: req.query.search, $options: 'i' } },
              ],
          }
        : {}

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
    res.send(users)
})

module.exports = { register, login, getAllUsers }
