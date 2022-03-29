const router = require('express').Router();

const { signup, login, logout, forgotPassword_classic, passwordReset_classic, forgotPassword_6digitOtp, passwordReset_6digitOtp } = require('../controllers/userController');
const { isLoggedIn } = require('../middlewares/auth');

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/password/forgot').post(forgotPassword_classic)
router.route('/password/reset/:id').post(passwordReset_classic)
router.route('/password/forgot/otp').post(forgotPassword_6digitOtp)
router.route('/password/reset/otp/:otp').post(passwordReset_6digitOtp)
router.route('/isLoggedin').get(isLoggedIn)

module.exports = router;