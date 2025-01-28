const mongoose = require('mongoose');
const connectDB = require('./connect_db'); // Import the connectDB function
const User = require('./schema_&_model'); // Import the User model from db_schema.js

// Connect to MongoDB
connectDB();

let users = [
    {
        name: 'Alice',
        email: 'alice@example.com',
        age: 25,
        image: 'https://media.istockphoto.com/id/518307930/photo/cheerful-woman-using-laptop-and-eating-lollipop-in-cafe.jpg?s=612x612&w=0&k=20&c=s5NluaiHmMuAhsvNuyyS3_jrUwInOm4Ac4_BR3JFbWs=',
        owner: '6766593134cb07d13f5eb3f6', // Add owner field directly
        todos: [{ task: 'I am Alice' }]
    },
    {
        name: 'Bob',
        email: 'bob@example.com',
        age: 30,
        image: 'https://media.istockphoto.com/id/1497180546/photo/serious-face-and-professional-black-man-senior-executive-and-businessman-looking-at-city.jpg?s=612x612&w=0&k=20&c=mUHvX5QVDgKCQYjtHZCMiUe2qNDu88zkSodMSCxd128=',
        owner: '6766595e34cb07d13f5eb40d', // Add owner field directly
        todos: [{ task: 'I am Bob' }]
    },
    {
        name: 'Charlie',
        email: 'charlie@example.com',
        age: 35,
        image: 'https://thumbs.dreamstime.com/b/close-up-photo-beautiful-her-foxy-lady-hands-arms-raised-side-not-interested-facial-expression-notebook-coffee-cup-close-up-153970536.jpg',
        owner: '6766593134cb07d13f5eb3f6', // Add owner field directly
        todos: [{ task: 'I am Charlie' }]
    },
    {
        name: 'David',
        email: 'david@example.com',
        age: 40,
        image: 'https://media.istockphoto.com/id/1473259911/video/portrait-corporate-and-man-in-office-happy-smile-and-proud-while-working-in-reception-with.jpg?s=640x640&k=20&c=AKA_wdHKt37PPWXgApanX4HDPnfy59kchxF-8bmWrjI=',
        owner: '6766599d34cb07d13f5eb423', // Add owner field directly
        todos: [{ task: 'I am David' }]
    },
    {
        name: 'Eva',
        email: 'eva@example.com',
        age: 28,
        image: 'https://media.istockphoto.com/id/2058319417/photo/face-business-and-woman-with-arms-crossed-smile-and-career-with-teamwork-meeting-or-planning.jpg?s=612x612&w=0&k=20&c=IwafinWO1ryhwrdA3fB4wU0AtwjT7CGOliNrQijNh3A=',
        owner: '6766593134cb07d13f5eb3f6', // Add owner field directly
        todos: [{ task: 'I am Eva' }]
    },
    {
        name: 'Lucas',
        email: 'lucas@example.com',
        age: 26,
        image: 'https://img.freepik.com/free-photo/beautiful-bearded-man-everyday-clothes-looks-camera_146671-15101.jpg',
        owner: '6766595e34cb07d13f5eb40d', // Add owner field directly
        todos: [{ task: 'I am Lucas' }]
    },
    {
        name: 'Luci',
        email: 'luci@example.com',
        age: 28,
        image: 'https://media.istockphoto.com/id/2148975617/photo/woman-jumping-high-after-successful-job-interview.jpg?s=612x612&w=0&k=20&c=puWecKm9APpx7QYJmjHEySQVZM38wRDEQQvSZaCeL30=',
        owner: '6766593134cb07d13f5eb3f6', // Add owner field directly
        todos: [{ task: 'I am Luci' }]
    },
];


// Insert the dummy data into the User collection
const insertDummyData = async () => {
    try {
        await User.insertMany(users);
        console.log('Dummy data inserted successfully');
        mongoose.connection.close(); // Close the connection after insertion
    } catch (err) {
        console.error('Error inserting dummy data:', err.message);
    }
};

// Insert the data
insertDummyData();
