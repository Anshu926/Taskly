const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const mongo_url = process.env.MONGO_URL ;

const connectDB = async () => {
    try {
        // Removed useNewUrlParser and useUnifiedTopology
        await mongoose.connect("mongodb://127.0.0.1:27017/Task_Mnager");
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1); // Exit the process with failure
    }
};

module.exports = connectDB;
