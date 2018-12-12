const mongoose = require('mongoose');
const config = require('../config/general');

const {Schema} = mongoose;

const MediasSchema = new Schema({
    url: {type: String, unique: true},
    created_at: {type: Date, default: Date.now},
    picked_at: {type: Date},
    downloaded_at: {type: Date},
    sent_at: {type: Date},
    title: {type: String},
    author: {type: String},
    genre: {type: String},
    year: {type: Number}
});

MediasSchema.post('save', (error, media, next) => {
    if (error.name === 'MongoError' && error.code === 11000) {
        return next(new Error('Media already exists'));
    }

    next(error);
});

mongoose.model('Medias', MediasSchema);
