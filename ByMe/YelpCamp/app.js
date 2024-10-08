// 用來在開發環境中載入環境變數，有development（開發環境）或production（生產環境）
// "development"：開發環境，用於本地開發和測試。
// "production"：生產環境，用於上線後的應用，面向最終用戶。
// 若次開發環境的話，會載入 dotenv 模組並執行它的 config() 方法
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true); // 預防在git上有警告訊息跳出來
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require("connect-mongo")(session);  //儲存session的地方
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');  // 清理請求中的資料，防止惡意使用者試圖通過傳遞 MongoDB 操作符（如 $ 或 .）來進行 NoSQL 資料庫注入攻擊。

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';  // 部屬的時候用
// const dbUrl = process.env.DB_URL;  // 部屬的時候用
// const dbUrl = 'mongodb://localhost:27017/yelp-camp';

// 設定router
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// 連線mongoosDB = yelp-camp
mongoose.connect(dbUrl, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
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

app.use(mongoSanitize({
    replaceWith: '_'   // 將 $ 或 . 替換成 _。這樣可以避免惡意資料庫操作，確保應用的安全性
}))

// const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoStore({  //使用mongo來儲存session資訊
    url: dbUrl,
    touchAfter: 24 * 60 * 60, //24小時*分鐘*秒，touchAfter表在請求期間session沒有被修改，則不會強制保存會話。
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

// 設定session要給cookie的資料並存儲在 cookie 中，
const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    // 用來signsession ID 的密鑰，確保session的安全性，防止session被篡改。
    resave: false,
    // 在請求期間session沒有被修改，則不會強制保存會話。
    saveUninitialized: true,
    // 設置為 true 意味著即使session未被修改，也會將其存儲。這通常用於在訪客追蹤或分析等情況下。
    cookie: {
        httpOnly: true,
        // 設定安全性:就算使用者造訪有缺陷的網站，cookie也不會將資料洩漏給此網站
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        // 算一周後的日期:.now()是毫秒+一分鐘有1000毫秒*一分鐘有60秒...
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/drldzfy40/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!要是自己的cloudinary name
                "https://images.unsplash.com/",
                "https://cdn-icons-png.flaticon.com/", // 自己加的
                "https://plus.unsplash.com/",  // 自己加的
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
// 用來初始化 Passport 中間件。它是設置 Passport 在 Express 應用中進行身份驗證的第一步。
// 這個中間件將 Passport 與你的應用綁定，使得後續的身份驗證過程可以運行。
app.use(passport.session());
// 用來讓 Passport 處理基於會話的身份驗證。它依賴於 express-session 中間件
// 可以跨多個請求保持用戶的登錄狀態。
passport.use(new LocalStrategy(User.authenticate()));
// User是模型名稱、.authenticate()是自動添加的靜態函數
passport.serializeUser(User.serializeUser());
// .serializeUser表序列化，意思是在session中儲存user
passport.deserializeUser(User.deserializeUser());
// .deserializeUser就是反序列化，意思再把user退出session

// 設定通用flash中間件、local表可讓所有ejs模板中訪問
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // 有權利去訪問當前user
    // req.user:是由 Passport.js 添加到請求對象 (req) 中的屬性，表示當前已經驗證的用戶。
    // 將包含該用戶的詳細信息（如用戶名、ID 等）；未通過身份驗證，則該屬性為 undefined
    res.locals.success = req.flash('success');
    // 將 req.flash('success') 的值存儲在 res.locals 對象中，
    // 再傳遞給模板引擎（如 EJS、Pug 等）以便在渲染的頁面中顯示
    res.locals.error = req.flash('error');
    next();    
})

// 加router
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

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


// app.listen(3000, () => {
//     console.log('Serving on port 3000')
// })

// 部屬的時候用
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})