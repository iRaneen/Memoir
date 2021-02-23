const express = require('express');
const router = express.Router()

const User = require('../models/user.js');
const Memoir = require('../models/memoir.js');
const validator = require("express-validator")


function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function checkSignIn(req, res, next) {
    // if the user is logged in, just go into the router with the netxt() keyword
    if (req.session.currentUser) {
        next();
    } else {
        const err = new Error("You are not logged in!");
        next(err);
    }
}


// the view of signup page 
router.get('/signUp', (req, res) => {
    res.render('signUp')
})
// post for signUp
router.post(
    "/signUp",
    validator.body("password").isLength({ min: 8 }),
    (req, res) => {
        const validatorErrors = validator.validationResult(req);
        if (!validatorErrors.isEmpty())
            return res.status(500).send("validation Errors, password is less than 8")
        User.createSecure(req.body.name, req.body.username, req.body.bio, req.body.password, req.body.image, (err, newUser) => {

            req.session.userId = newUser._id
            req.session.currentUser = newUser

            res.redirect("/login")
        })
    });

// the view of login page 
router.get('/login', (req, res) => {

    res.render('login')

})
// post for logIn
router.post("/login", (req, res) => {
    console.log("Login email, password", req.body.username, req.body.password);
    // Authenitcate User
    User.authenticate(req.body.username, req.body.password, (err, foundUser) => {
        if (err) {
            console.log("Authenitcate error", err)
            res.status(500).send(err)
        } else {
            req.session.userId = foundUser._id
            req.session.currentUser = foundUser
            console.log("log", req.session.userId)

            res.redirect("/home")
        }
    });

});

router.get('/updateProfile', (req, res) => {
    User.findById(req.session.userId)
    .populate('followers')
    .populate("followings")
    .then(user => {
        res.render('editProfile',{user})
    }).catch(err => console.log(err))
    

})

router.put("/updateProfile", (req, res) => {

        User.findByIdAndUpdate({_id:req.session.userId},{ "$set":{name:req.body.name, bio:req.body.bio,image:req.body.image}}).then(updated=>{
            res.redirect("/profile")
        }).catch(err=>{console.log(err)})
    });


// the view of home page 
router.get('/home', (req, res) => {
    User.findById(req.session.userId)
        .populate('followers')
        .populate("following")
        .then(user => {
            Memoir.find().populate('user')
                .then(memoirs => {
                    if (req.session.userId) {
                        let found = false;
                        const userMemoirs = memoirs.filter(memoir => memoir.user._id == req.session.userId);
                        var randomMemoIndex = random(0, userMemoirs.length -1) 
                        if(userMemoirs.length>0) {
                            randomMemo = userMemoirs[randomMemoIndex];
                            found=true;
                            
                        }

                        if (found == false) {
                            //user don't have any memo yet
                            randomMemo = null;
                        }

                        res.render('home', { user, memoirs, randomMemo })

                    }

                    else res.render('home', { user, memoirs })
                }).catch(err => console.log(err))

        }).catch(err => console.log(err));

})

//logout
router.get("/logout", (req, res) => {
    req.session.currentUser = null;
    req.session.userId = null;
    res.redirect("/home");
});

// profile view
router.get('/profile', checkSignIn, (req, res) => {
    User.findById(req.session.userId)
        .populate('followers')
        .populate("followings")
        .then(user => {
            Memoir.find().populate('user')
                .then(memoirs => {

                    res.render('profile', { user, memoirs })
                }).catch(err => console.log(err))

        }).catch(err => console.log(err));
})
// search results view
router.get('/search', checkSignIn, (req, res) => {
    users = req.session.search;
    Memoir.find().then(memoirs => {
        User.findById(req.session.userId).then(currentUser => {
            res.render('searchResults', { currentUser, users, memoirs })
        }).catch(err => console.log(err))

    }).catch(err => console.log(err))

})


router.post("/search", (req, res) => {
    let search = req.body.search;

    // Authenitcate User
    User.find({ $or: [{ userName: search }, { name: search }] }).then(users => {
        req.session.search = users;
        res.redirect('/search')
    }).catch(err => console.log(err));

});
// followers view
router.get('/followers', checkSignIn, (req, res) => {

    User.findById(req.session.userId)
        .populate('followers')
        .populate("followings")
        .then(user => {
            Memoir.find().populate('user')
                .then(memoirs => {
                    res.render('followers', { user, memoirs })
                }).catch(err => console.log(err))

        }).catch(err => console.log(err));

})
// following view
router.get('/following', checkSignIn, (req, res) => {
    User.findById(req.session.userId)
        .populate('followers')
        .populate("followings")
        .then(user => {
            Memoir.find().populate('user')
                .then(memoirs => {
                    res.render('following', { user, memoirs })
                }).catch(err => console.log(err))

        }).catch(err => console.log(err));

})

router.post('/user/follow/:idToFollow', (req, res) => {
    const idToFollow = req.params.idToFollow;
    User.findByIdAndUpdate(req.session.userId, { $push: { followings: idToFollow } }).then(user => {
        User.findByIdAndUpdate(idToFollow, { $push: { followers: req.session.userId } }).then(user => {

        }).catch(err => console.log(err))
        res.redirect('/following')

    }).catch(err => console.log(err))
})

router.post('/user/unfollow/:idToUnfollow', (req, res) => {

    const idToUnfollow = req.params.idToUnfollow;

    User.findByIdAndUpdate(req.session.userId, { $pull: { followings: idToUnfollow } })
        .then(user => {
            User.findByIdAndUpdate(idToUnfollow, { $pull: { followers: req.session.userId } })
                .then(user => {

                }).catch(err => console.log(err))
            res.redirect('/following')

        }).catch(err => console.log(err))
})


router.use(['/profile', '/search', '/following', '/followers'], (err, req, res, next) => {
    console.log(err);
    res.redirect("/login");
});
//export
module.exports = router

