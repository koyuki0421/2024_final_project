const express = require('express');
const router = express.Router({ mergeParams: true });
// 使用router會預設參數是單獨的，這樣會找不到下面需要的id((req.params.id)，
// 所以要加 mergeParams: true ，讓參數是合併的就找的到了

// 匯入模型Campground、Review
const Campground = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

// 這是一個中間件Middleware，
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // $pull 是 MongoDB 的一個操作符，它的作用是從一個array中移除符合條件的元素。
    await Review.findByIdAndDelete(reviewId);
    // 刪除 Review array中 ID 為 reviewId 的評論。
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;