const BaseJoi = require('joi');
// https://www.npmjs.com/package/sanitize-html
const sanitizeHtml = require('sanitize-html');

// joi的進階寫法，保持joi的功能並增加清理HTML的功能(安全性保護)
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

// 因為有一個input是(joi)，所以require('joi')稱BaseJoi，
// 但下面因為接續用Joi.object，所以再把BaseJoi改稱為Joi。
const Joi = BaseJoi.extend(extension)

// 進階寫法:在字串屬性後面加上.escapeHTML()
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        // title:類型、必須的
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

// https://joi.dev/api/?v=17.13.3

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})