const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const mongo_url = process.env.MONGO_URL ;

const connectDB = async () => {
    try {
        // Removed useNewUrlParser and useUnifiedTopology
        await mongoose.connect("mongodb+srv://TM_sotware_owner:2005@cluster0.6hhoa.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0");
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1); // Exit the process with failure
    }
};

module.exports = connectDB;
