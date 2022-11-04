const express = require('express')
const { register, login, getAllUsers } = require('../controllers/userController')
const upload = require('../utils/multer')
const { protect } = require('../middlewares/authMiddleware')

const router = express.Router()

router.post('/register', upload.single('avatar'), register)
router.post('/login', login)
router.get('/', protect, getAllUsers)

module.exports = router
