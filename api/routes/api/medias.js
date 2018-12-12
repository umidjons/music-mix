const mongoose = require('mongoose');
const router = require('express').Router();
const auth = require('../auth');

const Medias = mongoose.model('Medias');

class MediaUtils {
    static error(res, error) {
        return res.status(422).json({
            errors: error
        });
    }
}

router.post('/add', auth.required, (req, res, next) => {
    const {body: {media}} = req;

    if (!media.url) {
        return MediaUtils.error(res, {url: 'is required'});
    }

    const newMedia = new Medias(media);
    return newMedia.save()
        .then(() => res.json({media: newMedia}))
        .catch(next);
});

router.post('/get_all', auth.required, (req, res, next) => {
    const {body: {filter, skip, limit, sort}} = req;

    const query = Medias.find(filter);

    if (skip) {
        query.skip(skip);
    }

    if (limit) {
        query.limit(limit);
    }

    query.sort(sort || {created_at: -1});

    return query.exec()
        .then(items => res.json({items}))
        .catch(next);
});

module.exports = router;
