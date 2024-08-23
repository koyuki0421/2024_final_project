const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const Campground = require('../models/campground');

// 同一個路徑的可以寫成router.route('同樣路徑')，再去.get.post等
// 注意要連結東西的話就不用放分號(;)
router.route('/')
    .get(catchAsync(campgrounds.index)) //模型名字campgrounds+自訂名稱index 
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))



module.exports = router;