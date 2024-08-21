const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

// 確認是否有登入login的中間件 = isLoggedIn
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // .isAuthenticated是一種方法，檢查是否有登入
        req.session.returnTo = req.originalUrl;
        // 把登入前所在頁面的url記起來給session
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

// 讓使用者登入後自動導向原本的頁面的中間件 = storeReturnTo
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
        // locals僅在當前的請求-響應週期中存在，可在當前請求的路由處理程序或中間件中可用
        // 也因僅存在於當前請求中，因此不需要顯式刪除。當響應發送後，res.locals 會自動被丟棄
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    // 這個campgroundSchema.validate要驗證這個req.body
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
