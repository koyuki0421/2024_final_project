const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        // 如果 cities 數組包含 1000 個元素，索引範圍應該是 0 到 999，所以後面不用+1
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
            // 把參數descriptors跟places給sample這個函數
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
// 首先調用 seedDB 函數，該函數返回一個 Promise
// 當 seedDB 函數完成並成功解析 Promise 時，
// 將執行 then 內的回調函數來關閉與 MongoDB 的連接。
// 目的是釋放資源並避免不必要的連接占用。