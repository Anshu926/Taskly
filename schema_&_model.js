const mongoose = require('mongoose');

// Define the schema for the 'grand_copy' collection
const GrandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number },
    createdAt: { type: Date, default: Date.now },
    image: { type: String }, // Store the path to the image file
    todos: [
        {
            task: { type: String, required: true },
            completed: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Make sure "User" refers to the correct User model
    },
    city: { type: String, required: true }, // City of the user
    country: { type: String, required: true }, // Country of the user
});

// Create and export the model
module.exports = mongoose.model('Grand', GrandSchema);
