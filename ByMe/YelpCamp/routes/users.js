const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo,passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login) 
    // failureFlash: true：如果身份驗證失敗，會使用 req.flash() 來顯示錯誤消息
    // failureRedirect: '/login'：如果身份驗證失敗，用戶會被重定向到 /login 頁面
router.get('/logout', users.logout)

module.exports = router;