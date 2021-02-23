const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const UserSchema = new Schema({
    name: String,
    userName: String,
    bio: String,
    passwordDigest: String,
    image: String,
    followings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
// methods for login go here
UserSchema.statics.createSecure = (name, userName, bio, password, image, callback) => {
    //genSalt baiscly is a random encryption string  
    bcrypt.genSalt((error, salt) => {
        console.log(salt)
        bcrypt.hash(password, salt, (error, passwordHash) => {
            //now we can create the user record using mongo method
            User.create({ name, userName, bio, passwordDigest: passwordHash, image }, callback);
        })
    })
};
UserSchema.statics.authenticate = (userName, password, callback) => {
    User.findOne({ userName })
        .then((foundUser) => {
            if (!foundUser) {
                callback("Error: no user found", null);
            } else if (foundUser.checkPassword(password)) {
                callback(null, foundUser);
            } else {
                callback("Error: wrong password", null);
            }
            console.log("Authenticate foundUser: ", foundUser);
        })
        .catch((err) => console.log(err));
};
// compare password user enters with hashed password (`passwordDigest`)
UserSchema.methods.checkPassword = function (password) {
    // run hashing algorithm (with salt) on password user enters in order to compare with `passwordDigest`
    console.log("Bcrypt: ", password, this.passwordDigest);
    return bcrypt.compareSync(password, this.passwordDigest);
};
var User = mongoose.model("User", UserSchema);
// export user model
module.exports = User;