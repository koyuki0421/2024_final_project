const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
    // 因版本不支持，所以mark掉
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        // 如果 cities 數組包含 1000 個元素，索引範圍應該是 0 到 999，所以後面不用+1
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '66c45a6f311924a8c45b4bca', // koyuki的id
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // 把參數descriptors跟places給sample這個函數
            // image: `https://picsum.photos/400?random=${Math.random()}`,
            // 400 是圖片的寬度、表每次都可以得到不同的圖片(https://unsplash.com/collections/483251/in-the-woods)
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [  // 經度要先再緯度
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/drldzfy40/image/upload/v1724750674/YelpCamp/ajx03aefwrmim0b8xcfz.jpg',
                    filename: 'YelpCamp/qmplxdetti2xt4ejejhh'
                }
            ]
        });     

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