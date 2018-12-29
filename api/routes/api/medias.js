const mongoose = require('mongoose');
const router = require('express').Router();
const log = require('debug')('app:medias');
const auth = require('../auth');
const Youtube = require('../../modules/youtube');

const Medias = mongoose.model('Medias');

class MediaUtils {
    static error(res, error) {
        return res.status(422).json({
            errors: error
        });
    }
}

router.post('/add', auth.required, async (req, res, next) => {
    const {body: {media}} = req;

    if (!media.url) {
        return MediaUtils.error(res, {url: 'is required'});
    }

    const meta = await Youtube.get_meta(media.url);
    log('META: %o', meta);

    try {
        const item = await Medias.findOne({url: media.url});
        log('ITEM: %o', item);
        if (item) {
            return res.json({
                media: item,
                meta
            });
        }
    } catch (error) {
        log('ITEM ERROR: %o', error);
        next(error);
    }

    try {
        const newMedia = new Medias(media);
        const savedMedia = await newMedia.save();
        return res.json({
            media: savedMedia,
            meta
        });
    } catch (error) {
        log('SAVE ERROR:', error);
        next(error);
    }
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
