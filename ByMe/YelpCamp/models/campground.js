const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png
const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});


const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
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