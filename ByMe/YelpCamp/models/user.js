const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true  // 這並不會驗證，只是一個指引index
    }
});

UserSchema.plugin(passportLocalMongoose);
// 這將會給我的UserSchema一個獨一的username、hash、salt欄位，
// 所以我的UserSchema才沒有username和password的欄位 

module.exports = mongoose.model('User', UserSchema);