const express = require('express');
const router = express.Router({ mergeParams: true });
// 使用router會預設參數是單獨的，這樣會找不到下面需要的id((req.params.id)，
// 所以要加 mergeParams: true ，讓參數是合併的就找的到了
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// 匯入模型Campground、Review
const Campground = require('../models/campground');
const Review = require('../models/review');

const reviews = require('../controllers/reviews');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;