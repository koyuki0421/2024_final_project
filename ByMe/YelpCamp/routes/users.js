const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        // User是模型名字、.register是可以讓密碼加上hash、salt的方法
        req.login(registeredUser, err => {
        // 這邊的.login是一個方法，讓新登入完成的user也自動的login完成 
        // 而不是新登入完成之後要新增修改時，被跳到login的頁面
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
})

// 使用了 local 策略，表示應用會用本地驗證策略來驗證用戶的憑據（通常是用戶名和密碼）
// failureFlash: true：如果身份驗證失敗，會使用 req.flash() 來顯示錯誤消息
// failureRedirect: '/login'：如果身份驗證失敗，用戶會被重定向到 /login 頁面
router.post('/login', storeReturnTo,passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    // 當post login後，去returnTo原本所在頁面的url，否則就去/campgrounds
    delete req.session.returnTo;
    // 這邊delete session而不是locals是因為只存在當前需求中，當用過後會自動刪除
    res.redirect(redirectUrl);
})


router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
            // 這邊的next(err)是會跑app.js中'全局錯誤處理'最終error的把關的那段程式碼
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}); 

module.exports = router;