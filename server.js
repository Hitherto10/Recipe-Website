// Require necessary modules
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

// Create a new instance of the express application
const app = express();

// Use body-parser middleware to parse incoming JSON request bodies
app.use(bodyParser.json());

// Use body-parser middleware to parse incoming URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));


//Create a connection object with the user details
const con = mysql.createConnection({
    host: "localhost",
    user: "kene",
    password: "3504",
    database: "recipe_website"
});

con.connect(
    //This function is called when the connection is attempted
    function(err) {
        if (err) throw err;//Check for errors

       // Output successful Connection
        console.log("Server Connected Successfully!");
    }
);


// Define a route to fetch data from your table
app.get('/recipes/', (req, res) => {
    const category = req.query.category; // Get the category parameter from the request query
    let query = 'SELECT * FROM recipes';

    if (category) {
        // Modify the SQL query to filter by category if a category parameter is present
        query += ` WHERE category = '${category}'`;
    }
    con.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data: ', err);
            res.status(500).send('Error fetching data');
        } else {
            res.send(results);
        }
    });
});


app.get('/recipes/:recipe_id', (req, res) => {
    const recipeId = req.params.recipe_id;

    // Define a SQL query to retrieve a specific recipe
    // and its related recipe ingredients and instructions from the database
    const query = `
        SELECT recipes.*, recipe_ingredients.*, instructions.*
        FROM recipes
                 JOIN recipe_ingredients ON recipes.recipe_id = recipe_ingredients.recipe_id
                 JOIN instructions ON recipes.recipe_id = instructions.recipe_id
        WHERE recipes.recipe_id = ${recipeId}
    `;

    // Execute the query and retrieve the recipe data
    con.query(query, (err, results) => {
        if (err) {
            // Handle errors if there is a problem fetching the data
            console.error('Error fetching data: ', err);
            res.status(500).send('Error fetching data');
        } else {

            // Create an object to store the recipe data
            const recipe = {
                id: results[0].recipe_id,
                title: results[0].title,
                description: results[0].description,
                image_url: results[0].image_url,
                time_to_make: results[0].time_to_make,
                user_id: results[0].user_id,
                category: results[0].category,
                ingredients: [],
                instructions: []
            };

            // Use Maps to store unique ingredients and instructions based on their respective IDs
            const ingredientMap = new Map();
            const instructionMap = new Map();

            // Iterate over the results and add unique ingredients and instructions to the recipe object
            results.forEach(result => {
                const ingredientId = result.ingredient_id;
                const instructionId = result.instruction_id;

                // Use a Map to store unique ingredients based on ingredient_id
                if (!ingredientMap.has(ingredientId)) {
                    const ingredient = {
                        ingredient_id: result.ingredient_id,
                        name: result.name,
                        amount: result.amount
                    };
                    recipe.ingredients.push(ingredient);
                    ingredientMap.set(ingredientId, ingredient);
                }

                // Use a Map to store unique instructions based on instruction_id
                if (!instructionMap.has(instructionId)) {
                    const instruction = {
                        instruction_id: result.instruction_id,
                        description: result.description,
                        step_number: result.step_number
                    };
                    recipe.instructions.push(instruction);
                    instructionMap.set(instructionId, instruction);
                }
            });

            // Send the recipe object as a response
            res.send(recipe);
        }
    });
});


app.post("/submitUserData", (req, res) => {
    // Get the user data from the request body
    const userData = req.body;

    // Insert the user data into the MySQL "users" table
    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    con.query(query, [userData.name, userData.email, userData.password], (error, results) => {
        if (error) {
            console.error("Error:", error);
            res.status(500).json({ error: error});
        } else {
            const user = userData.email;
            console.log("User data saved to MySQL:", userData.email);
            res.status(200).json({ message: "Login successful", user });
        }
    });
});


// Handle a POST request to log in a user
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Verify the user's login credentials by querying the database
    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
    con.query(query, [email, password], (error, results) => {
        if (error) {
            console.error("Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        } else if (results.length === 0) {
            // If the user's credentials are invalid, return a 401 Unauthorized status code
            res.status(401).json({ error: "Invalid login credentials" });
        } else {

            // If the user's credentials are valid, return a 200 status code along with the user object
            const user = results[0];
            res.status(200).json({ message: "Login successful", user });

        }
    });

});


// Serve static files from the "public" directory
app.use(express.static('public'));


// Handle GET requests for the root URL ("/") by sending the "index.html" file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/HTML/index.html');
});


// Handle a post request to add a recipe to the database
app.post('/addRecipe', (req, res) => {
    const { title, description, time_to_make, category, user_email, ingredients, instructions } = req.body;

    // insert new recipe into the database
    const recipeSql = 'INSERT INTO recipes SET ?';
    const recipeValues = { title, description, time_to_make, category, user_email };
    con.query(recipeSql, recipeValues, (err, recipeResult) => {
        if (err) throw err;

        const recipeId = recipeResult.insertId;

        // Map the ingredients array to an array of arrays, where each inner array contains the recipe ID,
        // ingredient name, and ingredient amount
        const ingredientValues = ingredients.map(ingredient => [recipeId, ingredient.name, ingredient.amount]);
        const placeholders = ingredientValues.map(() => '(?, ?, ?)').join(', ');

        // Flatten the ingredientValues array into a single array of values to be passed into the SQL query
        const values = ingredientValues.flat();

        const sql = `INSERT INTO recipe_ingredients (recipe_id, name, amount) VALUES ${placeholders}`;
        const instructionSql = 'INSERT INTO instructions (step_number, description, recipe_id) VALUES ?';
        const instructionValues = [instructions.map(instruction => [instruction.step_number, instruction.description, recipeId])];

        con.query(sql, values, (error, results, fields) => {
            if (error) {
                console.error(error);
                res.status(500).json({ message: 'An error occurred while adding ingredients.' });
                return;
            }
            con.query(instructionSql, instructionValues, (error, results, fields) => {
                if (error) {
                    console.error(error);
                    res.status(500).json({ message: 'An error occurred while adding instructions.' });
                    return;
                }
                res.status(201).json({ message: 'Ingredients and instructions added successfully.' });
            });
        });
    });
});

// Start the server and listen for incoming requests on port 8080
app.listen(8080, () => {
    console.log('Server started on port 8080');
});
