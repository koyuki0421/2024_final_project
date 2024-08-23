const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}
// router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
//     const campground = await Campground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     review.author = req.user._id;
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();
//     req.flash('success', 'Created new review!');
//     res.redirect(`/campgrounds/${campground._id}`);
// }))

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // $pull 是 MongoDB 的一個操作符，它的作用是從一個array中移除符合條件的元素。
    await Review.findByIdAndDelete(reviewId);
    // 刪除 Review aray中 ID 為 reviewId 的評論。
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}
// router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
//     const { id, reviewId } = req.params;
//     await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     req.flash('success', 'Successfully deleted review')
//     res.redirect(`/campgrounds/${id}`);
// }))
