const cloudinary = require('cloudinary').v2
const moment = require('moment')
const dotenv = require('dotenv')

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUND_NAME,
    api_key: process.env.CLOUND_API_KEY,
    api_secret: process.env.CLOUND_API_SECRET,
})

const uploadImage = async (path) => {
    const time = moment(Date.now()).format('DD-MM-YYYY-HH:mm:ss')
    const name = `avt-${time}`
    const options = {
        public_id: `chat-app/avatar/${name}`,
    }
    return await cloudinary.uploader.upload(path, options)
}

const deleteImage = async (cloudinaryId) => {
    await cloudinary.uploader.destroy(cloudinaryId)
}

module.exports = { uploadImage, deleteImage }
