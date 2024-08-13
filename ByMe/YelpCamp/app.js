const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true); // 預防在git上有警告訊息跳出來
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
// 匯入模型Campground
const Review = require('./models/review');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
    // useCreateIndex: true,
    // 因為跳出錯訊息所以用掉:connection error: MongoParseError: option usecreateindex is not supported
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true })); // 解析post出來的東西
app.use(methodOverride('_method'));

// 這是一個中間件Middleware，
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    // 這個campgroundSchema.validate要驗證這個req.body
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
});
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// 在路徑與(req,res,next)中間插入自訂的中間件，以驗證發布的東西不可為空值且類別正確
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))

// 在路徑與(req,res,next)中間插入自訂的中間件，以驗證修改的東西不可為空值且類別正確
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // 展開運算符 ... 將 req.body.campground 的所有屬性展開並傳遞給 findByIdAndUpdate。
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // $pull 是 MongoDB 的一個操作符，它的作用是從一個array中移除符合條件的元素。
    await Review.findByIdAndDelete(reviewId);
    // 刪除 Review array中 ID 為 reviewId 的評論。
    res.redirect(`/campgrounds/${id}`);
}))

// .all表對每一個請求、*表對每一個路徑，放最後面是前面沒有一個配對到的才會到這裡來
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// '全局錯誤處理'最終error的把關
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    // 如果不是error訊息，就把error訊息用Oh No, Something Went Wrong!
    res.status(statusCode).render('error', { err })
})


app.listen(3000, () => {
    console.log('Serving on port 3000')
})