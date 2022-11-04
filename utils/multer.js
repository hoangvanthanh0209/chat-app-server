const multer = require('multer')
const path = require('path')

const upload = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname)
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            cb(new Error('Not support'), false)
            return
        }
        cb(null, true)
    },
})

module.exports = upload
