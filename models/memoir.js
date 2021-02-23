const mongoose = require('mongoose');



const memoirSchema = new mongoose.Schema({
    text: String,
    image: [{ type: String }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    visible: Boolean,
}, { timestamps: true })

const Memoir = mongoose.model('memoir', memoirSchema)

module.exports = Memoir
