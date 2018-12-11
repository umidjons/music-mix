const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');

const Users = mongoose.model('Users');

// new user route
router.post('/new', auth.optional, (req, res, next) => {
    const {body: {user}} = req;

    if (!user.email) {
        return res.status(422).json({
            errors: {
                email: 'is required'
            }
        });
    }

    if (!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required'
            }
        });
    }

    const finalUser = new Users(user);
    finalUser.setPassword(user.password);
    return finalUser.save()
        .then(() => res.json({user: finalUser.toAuthJSON()}));
});

// login route
router.post('/login', auth.optional, (req, res, next) => {
    const {body: {user}} = req;

    if (!user.email) {
        return res.status(422).json({
            errors: {
                email: 'is required'
            }
        });
    }

    if (!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required'
            }
        });
    }

    return passport.authenticate('local', {session: false}, (err, passportUser, info) => {
        if (err) {
            return next(err);
        }

        if (passportUser) {
            const user = passportUser;
            user.token = passportUser.generateJWT();

            return res.json({user: user.toAuthJSON()});
        }

        return res.status(401).json(info);
    })(req, res, next);
});

// current user route
router.get('/current', auth.required, (req, res, next) => {
    const {payload: {id}} = req;

    return Users.findById(id).
        then(user => {
            if (!user) {
                return res.sendStatus(400);
            }

            return res.json({user: user.toAuthJSON()});
        });
});

// logout router
router.get('/logout', auth.optional, (req, res, next) => {
    req.logout();
    res.json({success: true});
});

module.exports = router;
