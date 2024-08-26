const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

// https://cloudinary.com/documentation/image_transformations
// 在upload/後面加上w_300/就能改變圖片大小
// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };  // 要打這個才可以讓虛擬schema成功執行並加上下面的opts

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'], // 定義了 type 欄位只能是 'Point'
            // enum 提供了一種簡單的方法來限制欄位的值，使得資料更加可靠和一致。
            required: true
        },
        coordinates: {  // ex經緯度 = [-122.3301, 47.6038]
            type: [Number],
            required: true
        }
    },
    popupText: String, //自己加的
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

// 因mapbox會自動找尋properties裡面的資料，所以要設一個虛擬的schema(不用實際放入campground的schema裡)，把campground的資料放進去
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`  //substring截斷，讓字最多只有20個字元

});


// https://mongoosejs.com/docs/api/model.html#Model.findByIdAndDelete()
// 因為app.js中刪露營地時用的是findByIdAndDelete()，而他的文件中間件的函數是findOneAndDelete()
// 這是一個Mongoose 文件中間件:當露營地被刪除時，相關的留言也要被刪除
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);