const express = require('express');
const router = express.Router();
const Memoir = require('../models/memoir.js');
const User = require('../models/user');


function checkSignIn(req, res, next) {
    // if the user is logged in, just go into the router with the netxt() keyword
    if (req.session.currentUser) {
      next();
    } else {
      const err = new Error("You are not logged in!");
      next(err);
    }
}
  
//Show one memoir
router.get('/memoir/:id',checkSignIn, (req, res) => {
    let id = req.params.id;
    
    Memoir.findById(id)
        .populate("user")
        .then(memoir => {
            res.render("showMemoir", { memoir, userId: req.session.userId });
        })
        .catch(err => console.log(err))

});

//edit mem
router.get('/editMemoir/:id',checkSignIn, (req, res) => {
    let id = req.params.id
    
    Memoir.findById(id)
        .then(memoir => {
            res.render('editMemoir', { memoir })
        }).catch(err => console.log(err))
})

//update mem 
router.put('/memoir/edit/:id', (req, res) => {
    
    // res.send("data")
    let id = req.params.id
    let updateMemoir = {
        text: req.body.memoir,
        image: [req.body.image1, req.body.image2, req.body.image3, req.body.image4],
        visible: req.body.visible

    }
    Memoir.findByIdAndUpdate(id, updateMemoir)
        .then((memoir) => {
            
            res.redirect('/profile')
        }).catch(err => console.log(err))
})

// delete mem
router.delete('/memoir/delete/:id', (req, res) => {
    let id = req.params.id
    Memoir.findByIdAndDelete(id)
        .then(() => {
            res.redirect('/profile')
        }).catch(err => console.log(err))
})


//new mem
router.get('/newMemoir',checkSignIn, (req, res) => {
    res.render('newMemoir')
})


router.post("/newMemoir", (req, res) => {
    const memoir = req.body.memoir
    const image = [req.body.image1, req.body.image2, req.body.image3, req.body.image4]
    const visible = req.body.visible
    Memoir.create({ text: memoir, image: image, user: req.session.userId, visible: visible })
    console.log("memoir", memoir)
    console.log("image", image)
    res.redirect('/home')

})

router.use(['/newMemoir','/editMemoir','/editMemoir/:id'],  (err, req, res, next) => {
    console.log(err);
    res.redirect("/login");
});

//export
module.exports = router
