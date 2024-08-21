const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
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