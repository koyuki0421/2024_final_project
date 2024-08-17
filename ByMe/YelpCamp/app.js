const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true); // 預防在git上有警告訊息跳出來
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

// 設定router
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

// 連線mongoosDB = yelp-camp
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // 因為跳出錯訊息所以用掉:connection error: MongoParseError: option usecreateindex is not supported
    // useFindAndModify: false
    // 我下載的monggose不支援這個
});

// 監控mongoosDB連接的狀態
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

app.use(express.static(path.join(__dirname, 'public')))

// 設定session要給cookie的資料並存儲在 cookie 中，
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    // 用來signsession ID 的密鑰，確保session的安全性，防止session被篡改。。
    resave: false,
    // 在請求期間session沒有被修改，則不會強制保存會話。
    saveUninitialized: true,
    // 設置為 true 意味著即使session未被修改，也會將其存儲。這通常用於在訪客追蹤或分析等情況下。
    cookie: {
        httpOnly: true,
        // 設定安全性:就算使用者造訪有缺陷的網站，cookieu也不會將資料洩漏給此網站
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        // 算一周後的日期:.now()是毫秒+一分鐘有1000毫秒*一分鐘有60秒...
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

// 設定通用flash中間件
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    // 將 req.flash('success') 的值存儲在 res.locals 對象中，
    // 再傳遞給模板引擎（如 EJS、Pug 等）以便在渲染的頁面中顯示
    res.locals.error = req.flash('error');
    next();
    
})

// 加router
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)


app.get('/', (req, res) => {
    res.render('home')
});

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