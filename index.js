const express = require("express");
const app = express();
const port = 3000; 
const path = require("path");
const connect_db = require("./connect_db");
const methodOverride = require("method-override");
const User_Model = require("./schema_&_model");
const User_passport_model = require("./user_model");
const passport = require('passport');
const localStrategy = require('passport-local');
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const GrandSchema = require('./schema_&_model');  
const mongo_url = process.env.MONGO_URL ;
      
// Connection to database 
connect_db();
 
// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));   
app.use(methodOverride("_method"));

  
// Session middleware and Mongostore middleware
app.use(
    session({
        secret: "yourSecretKey",
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: mongo_url,
            crypto: {
                secret:  "yourSecretKey",
            },
            touchAfter: 24 * 3600,
        }),
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        },
    })
);


app.use(flash());

// Middleware to make flash messages accessible globally
app.use((req, res, next) => {
    res.locals.successMessage = req.flash("success")[0];
    res.locals.errorMessage = req.flash("error")[0];
    next();
});

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());


// Configure Passport to use the User model for authentication
passport.use(new localStrategy(User_passport_model.authenticate()));

// Set up session serialization and deserialization
passport.serializeUser(User_passport_model.serializeUser());
passport.deserializeUser(User_passport_model.deserializeUser());

// Routes
// Root Route
app.get("/", (req, res) => {
    res.send("I am a lord who wants to get the feast for web");
});

// Home Route: Display all users
app.get("/home", async (req, res) => {
    try {
        const users = await User_Model.find().populate('owner'); // Ensure the owner field is populated
        res.render("home.ejs", { users, user: req.user });
    } catch (err) {
        console.error("Error fetching users:", err.message);
        res.status(500).send("Error fetching users");
    }
});



// Show user details route
app.get("/show/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_Model.findById(id).populate('owner');

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/home");
        }

        // Check if the logged-in user is the owner of the user
        const isOwner = req.user && req.user._id.equals(user.owner._id);

        // Pass user details, current user, and ownership status to the template
        res.render("show.ejs", { user, currentUser: req.user, isOwner });
    } catch (err) {
        console.error("Error fetching user:", err.message);
        req.flash("error", "Failed to fetch user details.");
        res.redirect("/home");
    }
});



// Show create user form
app.get("/create_user", (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged first to create user !");
        return res.redirect("/login"); // Redirect to the login page if not authenticated
    }
    res.render("create.ejs"); // Render the 'create.ejs' form if authenticated
});


/// Create user route (POST)
app.post("/create_user", async (req, res) => {
    try {
        const { name, email, age, image , city , country } = req.body;

        // Create a new user and set the owner field
        const newUser = new User_Model({
            name,
            email,
            age,
            image,
            owner: req.user._id , // Correctly reference the authenticated user
            city ,
            country ,
        });

        await newUser.save(); // Save the new user to the database
        req.flash("success", "User is created successfully!");
        res.redirect("/home"); // Redirect to home after creation
    } catch (err) {
        console.error("Error creating user:", err.message);
        req.flash("error", "Failed to create user.");
        res.redirect("/home");
    }
});


// Render update form (GET request)
app.get("/update_user/:id", async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.isAuthenticated()) {
            req.flash("error", "You must be logged in first to update user details!");
            return res.redirect("/login"); // Redirect to the login page if not authenticated
        }

        const { id } = req.params;
        const user = await User_Model.findById(id);

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/home");
        }

        // Ownership validation
        if (user.owner.toString() !== req.user._id.toString()) {
            req.flash("error", "You do not have permission to update this user.");
            return res.redirect("/home"); // Redirect if the user is not the owner
        }

        res.render("update.ejs", { user });
    } catch (err) {
        console.error("Error fetching user for update:", err.message);
        req.flash("error", "Failed to fetch user for update.");
        res.redirect("/home");
    }
});



// Update user route (PUT request)
app.put("/update_user/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, age, image , city , country } = req.body;

        // Find the user by ID
        const updatedUser = await User_Model.findById(id);

        // Check if the user exists
        if (!updatedUser) {
            req.flash("error", "User not found.");
            return res.redirect("/home");
        }

        // Check if the current user is the owner
        if (!updatedUser.owner.equals(req.user._id)) {
            req.flash("error", "You are not the author of this user.");
            return res.redirect(`/show/${id}`); // Redirect to the user's page
        }

        // If the current user is the owner, update the user
        updatedUser.name = name;
        updatedUser.email = email;
        updatedUser.age = age;
        updatedUser.image = image;
        updatedUser.city = city ;
        updatedUser.country = country ;

        await updatedUser.save(); // Save the updated user

        req.flash("success", "User updated successfully!");
        res.redirect(`/show/${updatedUser._id}`); // Redirect to the updated user's details page
    } catch (err) {
        console.error("Error updating user:", err.message);
        req.flash("error", "Failed to update user.");
        res.redirect("/home");
    }
});


// Delete user route
app.delete("/delete_user/:id", async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.isAuthenticated()) {
            req.flash("error", "You must be logged in first to delete a user!");
            return res.redirect("/login"); // Redirect to the login page if not authenticated
        }

        const { id } = req.params;

        // Find the user by ID
        const deletedUser = await User_Model.findById(id);

        // Check if the user exists
        if (!deletedUser) {
            req.flash("error", "User not found.");
            return res.redirect("/home");
        }

        // Check if the current user is the owner
        if (!deletedUser.owner.equals(req.user._id)) {
            req.flash("error", "You are not the author of this user. You cannot delete it.");
            return res.redirect(`/show/${id}`); // Redirect to the user's page
        }

        // Delete the user if ownership matches
        await User_Model.findByIdAndDelete(id);

        req.flash("success", "User deleted successfully!");
        res.redirect("/home"); // Redirect to home after deletion
    } catch (err) {
        console.error("Error deleting user:", err.message);
        req.flash("error", "Failed to delete user.");
        res.redirect("/home");
    }
});



//Founder
app.get('/about',async (req,res) => {
    res.render('about.ejs');
});

// TO-DO List Route
app.get('/todo/:id', async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.isAuthenticated()) {
            req.flash("error", "You must be logged in first to access the To-Do list!");
            return res.redirect("/login"); // Redirect to the login page if not authenticated
        }

        const { id } = req.params; // Get user ID from the URL
        const user = await User_Model.findById(id); // Fetch user data from DB

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/home");
        }

        // Check if the logged-in user is the owner of this account
        if (!user.owner.equals(req.user._id)) {
            req.flash("error", "You are not authorized to view this To-Do list.");
            return res.redirect("/home"); // Redirect to the home page if not the owner
        }

        res.render('todo.ejs', { user }); // Pass user data to the EJS template
    } catch (error) {
        console.error("Error fetching To-Do list:", error.message);
        req.flash("error", "Internal server error. Please try again later.");
        res.redirect("/home");
    }
});

app.post('/add_todo/:id', async (req, res) => {
    try {
        const { id } = req.params; // User ID from URL
        const { task } = req.body; // Task from form input

        // Check if the user is authenticated
        if (!req.isAuthenticated()) {
            req.flash("error", "You must be logged in to add tasks!");
            return res.redirect("/login"); // Redirect to login if not authenticated
        }

        // Find the user
        const user = await User_Model.findById(id);
        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/home");
        }

        // Check if the current logged-in user is the owner of this user account
        if (!user.owner.equals(req.user._id)) {
            req.flash("error", "You are not authorized to add tasks for this user.");
            return res.redirect(`/todo/${id}`); // Redirect back to the user's To-Do page
        }

        // Add the new task
        user.todos.push({ task: task, completed: false });
        await user.save(); // Save updated user document
        req.flash("success", "Task is added successfully!");

        // Redirect back to the To-Do list page
        res.redirect(`/todo/${id}`);
    } catch (error) {
        console.error(error);
        req.flash("error", "Internal Server Error");
        res.redirect("/home");
    }
});


// Delete a To-Do
app.post('/delete_todo/:userId/:todoId', async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.isAuthenticated()) {
            req.flash("error", "You must be logged in first to delete tasks!");
            return res.redirect("/login"); // Redirect to the login page if not authenticated
        }

        const { userId, todoId } = req.params;

        // Find the user by ID
        const user = await User_Model.findById(userId);
        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/home");
        }

        // Check if the current user is the owner of the user account
        if (!user.owner.equals(req.user._id)) {
            req.flash("error", "You are not authorized to delete tasks for this user.");
            return res.redirect(`/todo/${userId}`); // Redirect to the To-Do list page
        }

        // Find the specific todo in the user's todos array
        const todoIndex = user.todos.findIndex(todo => todo._id.toString() === todoId);
        if (todoIndex === -1) {
            req.flash("error", "Task not found.");
            return res.redirect(`/todo/${userId}`);
        }

        // Remove the todo from the todos array
        user.todos.splice(todoIndex, 1);

        // Save the updated user document
        await user.save();
        req.flash("success", "Task deleted successfully!");

        // Redirect back to the To-Do list page
        res.redirect(`/todo/${userId}`);
    } catch (error) {
        console.error("Error deleting task:", error.message);
        req.flash("error", "Internal server error. Please try again later.");
        res.redirect("/home");
    }
});


// Update a To-Do
app.post('/update_todo/:userId/:todoId', async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.isAuthenticated()) {
            req.flash("error", "You must be logged in first to update tasks!");
            return res.redirect("/login"); // Redirect to login if not authenticated
        }

        const { userId, todoId } = req.params;  // Extract userId and todoId from the URL
        const { task, completed } = req.body;  // Get updated task and completion status from the form

        // Find the user by ID
        const user = await User_Model.findById(userId);
        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/home");
        }

        // Check if the current logged-in user is the owner of this user account
        if (!user.owner.equals(req.user._id)) {
            req.flash("error", "You are not authorized to update tasks for this user.");
            return res.redirect(`/todo/${userId}`); // Redirect back to the user's To-Do page
        }

        // Find the to-do item by its ID
        const todo = user.todos.id(todoId);
        if (!todo) {
            req.flash("error", "To-Do not found.");
            return res.redirect(`/todo/${userId}`);
        }

        // Update the task and completed status
        todo.task = task || todo.task; // Update task if provided, keep existing value otherwise
        todo.completed = completed === 'on';  // Checkbox returns 'on' if checked, else undefined

        // Save the updated user document
        await user.save();
        req.flash("success", "Task updated successfully!");

        // Redirect back to the To-Do list page for the user
        res.redirect(`/todo/${userId}`);
    } catch (error) {
        console.error("Error updating task:", error.message);
        req.flash("error", "Internal server error. Please try again later.");
        res.redirect("/home");
    }
});


// Signup Routes
app.get('/signup',(req,res) => {
    res.render('signup.ejs');
});

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = new User_passport_model({ username, email });
        await User_passport_model.register(newUser, password); // Register user with hashed password
        req.flash('success', 'Signup successful! Please log in.');
        res.redirect('/login'); // Redirect to login page
    } catch (err) {
        console.error('Error during signup:', err.message);
        req.flash('error', 'Signup failed. Username or email might already be taken.');
        res.redirect('/signup');
    }
});

// Render the Login Page
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

// Handle Login Submission with Custom Flash Message
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash('error', info.message || 'Invalid credentials');
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            req.flash('success', 'Login successful!');
            return res.redirect('/home');
        });
    })(req, res, next);
});

// Log out route
app.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Error logging out:", err);
            req.flash("error", "Logout failed. Please try again.");
            return res.redirect("/home");
        }
        req.flash("success", "Logged out successfully!");
        res.redirect('/home');
    });
});

app.get('/supervisers_info', async (req, res) => {
    try {
        // Fetch all users (supervisors)
        const users = await User_passport_model.find();  
        
        // Fetch all Grand documents and populate the 'owner' field (supervisors)
        const grandData = await GrandSchema.find().populate('owner');  

        // Pass the users and grandData to the EJS view
        res.render('supervised.ejs', { users, grandData });
    } catch (err) {
        console.error("Error fetching data:", err.message);
        req.flash("error", "Failed to fetch users and grand data.");
        res.redirect("/home");
    }
});




// Universal GET route for unmatched routes
app.get("*", (req, res) => {
    res.status(404).render("universal.ejs");
});


// Listen on the port
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
