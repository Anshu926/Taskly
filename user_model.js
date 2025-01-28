const mongoose = require('mongoose'); 
// Import mongoose to work with MongoDB.

const passportLocalMongoose = require('passport-local-mongoose'); 
// Import passport-local-mongoose to simplify user authentication setup.

// Define a new schema for the user model.
const userSchema = new mongoose.Schema({
  email: {
    type: String,        // The email field is a string.
    required: true,      // The email field is required.
    unique: true,        // The email must be unique (no duplicate emails allowed).
  },
});

// Add the passport-local-mongoose plugin to the schema.
userSchema.plugin(passportLocalMongoose);
/* 
  - This plugin adds methods to the schema to handle password hashing, salting, 
    and authentication logic.
  - It also adds a 'username' field by default, which we will use for logging in 
    (you can configure it to use the 'email' field instead if desired).
*/

// Export the model for use in other files.
module.exports = mongoose.model('User', userSchema);
/* 
  - The model is named 'User' and is linked to the 'users' collection in MongoDB.
  - This model can now be used to create, retrieve, update, and delete user data 
    as well as handle authentication logic.
*/
