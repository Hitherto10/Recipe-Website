// Get the "signUp" and "signIn" buttons and the container element by their  IDs
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

// Add a click event listener to the signUp button that adds the "right-panel-active" class
signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

// Add a click event listener to the signIn button that removes the "right-panel-active" class
signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});


// Create Function that simulates page Changes
function changePage() {
    $(document).ready(function() {

        // Add a click event listener to all links within elements with class "navLinks"
        $('.navLinks a').click(function(e) {

            // Get the value of the "href" attribute of the clicked link
            const target = $(this).attr('href');

            // Show the element with the matching ID and hide all other elements with class "page"
            $(target).show().siblings('.page').hide();
        });
    });
}
changePage();


const recipesList = document.getElementById('recipes'); //Get recipes Container


// Retrieve elements with class "recipe-nav-link" and add a click event listener to each
document.querySelectorAll('.recipe-nav-link').forEach(link => {
    link.addEventListener('click', event => {

        // Prevent the default link behavior
        event.preventDefault();

        // Get the category name from the text content of the clicked element
        const category = event.target.textContent;

        // Fetch recipe data from the server
        fetch('/recipes')
            .then(response => response.json())
            .then(data => {

                // Store the original data in a new variable
                let filteredData = data;


                // If the category is not "All Recipes", filter the data by category
                if (category !== 'All Recipes') {
                    if(category !== 'My Recipes'){
                        filteredData = data.filter(recipe => recipe.category === category);
                    }
                    else {
                        // filter the data based on the currently logged-in user
                        filteredData = data.filter(recipe => recipe.user_email === sessionStorage.getItem('loggedInUser').replace(/^"(.+(?="$))"$/, '$1'));
                    }
                }

                // Clear the current recipe list
                recipesList.innerHTML = '';

                // Loop through the filtered data and create a recipe card for each recipe
                filteredData.forEach(recipe => {
                    const recipeCard = `
                    <div class="recipe-card ${recipe.category}" id="recipe-card">
                        <div class="recipe-image">
                            <a id="recipe-${recipe.recipe_id}" onclick="showRecipeDetails(${recipe.recipe_id})">
                              <img id="myImage" class="recipe-image-url" src="${recipe.image_url || '../ASSETS/pexels-cottonbro-studio-3338672.jpg'}" alt="recipeImg">
                            </a>
                        </div>
                        <div class="recipe-details">
                            <div class="recipe-type">
                                <i class="ri-price-tag-fill"></i>
                                <span>${recipe.category}</span>
                                <i class="ri-map-pin-time-fill"></i>
                                <span>${recipe.time_to_make} min</span>
                            </div>
                            <h2 class="recipe-title">${recipe.title}</h2>
                        </div>
                    </div>
              `;
                    // Display the recipe card in the recipe list
                    recipesList.insertAdjacentHTML('beforeend', recipeCard);
                });
            })
            .catch(error => console.error(error)); // Log any errors to the console
    });
});


// Function to display all recipes from server
function displayRecipes(){
    fetch('/recipes')

        // Fetch recipe data from the server
        .then(response => response.json())
        .then(data => {
            // Loop through the data and create a recipe card for each recipe
            data.forEach(recipe => {
                const recipeCard = `
                  <div class="recipe-card" id="recipe-card">

                            <div class="recipe-image" >
                                <a id="recipe-${recipe.recipe_id}" onclick="showRecipeDetails(${recipe.recipe_id})">
                                <img id="myImage" class="recipe-image-url" src="${recipe.image_url || '../ASSETS/pexels-cottonbro-studio-3338672.jpg'}" alt="recipeImg">
                                </a>
                            </div>
                            <div class="recipe-details">
                                <div class="recipe-type">
                                    <i class="ri-price-tag-fill"></i>
                                    <span>${recipe.category}</span>
                                    <i class="ri-map-pin-time-fill"></i>
                                    <span>${recipe.time_to_make} min</span>
                                </div>
                                <h2 class="recipe-title">${recipe.title}</h2>
                                </div> 
                            </div>
                  </div>
                  `;

                // Append the recipe cards containing all recipes to the recipes list to be displayed
                recipesList.insertAdjacentHTML('beforeend', recipeCard);

            });
        })
        // Throw error in case of error from server
        .catch(error => console.error(error));

}
displayRecipes();


// function to display details of a recipe when selected
function showRecipeDetails(recipeId) {
    $('#recipeDetails').show().siblings('.page').hide(); // open page


    // Fetch the recipe data for the specified recipe ID
    fetch(`/recipes/${recipeId}`)
        .then(response => response.json())
        .then(recipe => {

            // Create the HTML for the recipe details section
            const recipeDetails = `
            <h6>${recipe.title}</h6>
            <div class="recipe-dets">
                <i style="font-size: 13px;" class="ri-price-tag-fill"><span>&nbsp;${recipe.category}</span></i>
                <i style="font-size: 13px;" class="ri-map-pin-time-fill"><span>&nbsp;${recipe.time_to_make} mins</span></i>
            </div>
            <p>${recipe.description}</p>
        `;

            // Update the recipe details container with the recipe details HTML
            const recipeDetailsContainer = document.getElementById('recipesSingle');
            recipeDetailsContainer.innerHTML = recipeDetails;

            // Call functions to Display the recipe image, ingredients, instructions, and description
            displayRecipeImage(recipe.image_url);
            displayRecipeIngredients(recipe.ingredients);
            displayRecipeInstructions(recipe.instructions);
            displayRecipeDescription(recipe.description);

        })
        .catch(error => console.error(error)); // Log any errors to the console
}


// Create function to set style effects for the recipe image
function displayRecipeImage(imageUrl) {

    // if the image retrieved from database is null, set value to a default neutral image
    if (imageUrl === null){
        document.getElementById('recipeImageBox').style.backgroundImage = "url('../ASSETS/pexels-cottonbro-studio-3338672.jpg')";
    }
    else{
        document.getElementById('recipeImageBox').style.background = `url('${imageUrl}')`;
    }

    // set background effects for image
    document.getElementById('recipeImageBox').style.backgroundSize = `cover`;
    document.getElementById('recipeImageBox').style.backgroundPosition = `center`;
}


// Display the recipe ingredients in a list
function displayRecipeIngredients(ingredients) {
    // Get the ingredient list container and clear any existing content
    const ingredientList = document.querySelector('#ingredients');
    ingredientList.innerHTML = '';

    // Loop through each ingredient and create a list item for it
    ingredients.forEach(ingredient => {
        const listItem = document.createElement('li');
        listItem.innerText = `${ingredient.amount} ${ingredient.name}`;
        ingredientList.appendChild(listItem);
    });
}


// Display the recipe instructions in a list
function displayRecipeInstructions(instructions) {
    // Get the instruction list container and clear any existing content
    const instructionsList = document.querySelector('#directionList');
    instructionsList.innerHTML = '';

    // Loop through each instruction and create a list item for it
    instructions.forEach(instruction => {
        const listItem = document.createElement('li');
        listItem.innerText = `${instruction.description} `;
        instructionsList.appendChild(listItem);
    });
}


// Display the recipe description in the recipe details page
function displayRecipeDescription(description) {
    const recipeText = document.getElementById('Description');
    recipeText.innerHTML = `<p>${description}</p>`;
}


// Submit user data to the server
function submitUserData() {
    // Get the values of the user inputs
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (name !== '' || email !== '' || password !== ''){
        // Create an object with the user data
        const userData = {
            name,
            email,
            password,
        };

        // Send a POST request to the server with the user data
        fetch("/submitUserData", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),

        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === 'Login successful') {

                    // Store the user data in session storage
                    sessionStorage.setItem("loggedInUser", JSON.stringify(data.user));
                    alert("Logged In successfully");

                    // Go to home page upon successful login
                    $('#homePage').show().siblings('.page').hide();

                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

}


// Create function to validate user login
function verifyLoginRequest(){
    // Get the email and password values from the login form
    const email = document.getElementById("user_email").value;
    const password = document.getElementById("user_password").value;

    // Create an object with the email and password values
    const userData = { email, password };

    // Send a POST request to the "/login" endpoint with the user data
    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.message === 'Login successful') {

                // Store the user data in session storage
                sessionStorage.setItem("loggedInUser", JSON.stringify(data.user.email));
                alert("Logged In successfully");

                // Go to home page upon successful login
                $('#homePage').show().siblings('.page').hide();

            } else {
                alert("Invalid login credentials");
            }

        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Invalid login credentials");
        });
}


// create a function that logs out the user
function logoutUser(){
    // Clear session storage where current logged-in user is stored
    sessionStorage.clear()

    // Go to login page
    $('#registerPage').show().siblings('.page').hide();
}

// get add recipe form element
const addRecipeForm = document.querySelector('#addRecipeForm');

// add event listener to the form submission
addRecipeForm.addEventListener('submit', (event) => {
    event.preventDefault(); // prevent the form from submitting

    // get input values from the form
    const title = document.querySelector('#titleInput').value;
    const description = document.querySelector('#descriptionInput').value;
    const timeToMake = document.querySelector('#timeToMakeInput').value;
    const category = document.querySelector('#categoryInput').value;
    const email = sessionStorage.getItem('loggedInUser').replace(/^"(.+(?="$))"$/, '$1');
    const ingredients = getIngredientsFromForm();
    const instructions = getInstructionsFromForm();

    // create a new recipe object to send to the server
    const newRecipe = {
        title,
        description,
        time_to_make: timeToMake,
        category,
        user_email: email,
        ingredients,
        instructions
    };

    // send a POST request to the server to add the recipe to the database
    fetch('/addRecipe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRecipe)
    })
        .then(response => response.json())
        .then(data => {
            // display success message and redirect to the recipe page
            alert('Recipe added successfully!');
            $('#recipePage').show().siblings('.page').hide();
        })
        .catch(error => console.error(error));
});

// function to get the ingredient inputs from the form and return an array of objects
function addIngredientRow() {
    // Get a reference to the container element for the ingredient inputs
    const ingredientInputsContainer = document.getElementById('ingredientInputsContainer');
    const nextIngredientId = ingredientInputsContainer.children.length + 1;

    // Create a new div element to hold the ingredient inputs and set its ID attribute to the next ingredient ID
    const newIngredient = document.createElement('div');
    newIngredient.dataset.ingredientId = nextIngredientId;

    // Create a label element for the ingredient name input and set its text content
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Name:';
    newIngredient.appendChild(nameLabel);

    // Create an input element for the ingredient name and set its type, class, and name attributes
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'nameInput';
    nameInput.name = 'ingredient_name[]'; // [] to create an array of values
    newIngredient.appendChild(nameInput);

    const amountLabel = document.createElement('label');
    amountLabel.textContent = 'Amount:';
    newIngredient.appendChild(amountLabel);

    const amountInput = document.createElement('input');
    amountInput.type = 'text';
    amountInput.className = 'amountInput';
    amountInput.name = 'ingredient_amount[]'; // [] to create an array of values
    newIngredient.appendChild(amountInput);

    // Append the new ingredient div element to the container element for the ingredient inputs
    ingredientInputsContainer.appendChild(newIngredient);
}


// function retrieves the ingredient data from the form inputs and returns an array of ingredient objects
function getIngredientsFromForm() {
    // Get all the input elements for the ingredient names and amounts
    const ingredientInputs = document.querySelectorAll('.nameInput, .amountInput');
    const ingredients = [];

    // Loop through each input element and extract the ingredient name and amount from it
    ingredientInputs.forEach((input, index) => {

        // Determine the index of the current ingredient object in the ingredients array based on the current input index
        const ingredientIndex = Math.floor(index / 2);
        // If the current ingredient object doesn't exist in the ingredients array yet, create a new one
        if (!ingredients[ingredientIndex]) {
            ingredients[ingredientIndex] = {
                name: '',
                amount: ''
            };
        }

        // Assign the input value to the appropriate property of the current ingredient object based on its class
        if (input.classList.contains('nameInput')) {
            ingredients[ingredientIndex].name = input.value;
        } else if (input.classList.contains('amountInput')) {
            ingredients[ingredientIndex].amount = input.value;
        }
    });

    return ingredients;
}


document.getElementById('addIngredientButton').addEventListener('click', addIngredientRow);

// function to get the instruction inputs from the form and return an array of objects
function getInstructionsFromForm() {
    const instructionInputs = document.querySelectorAll('.instructionInput');
    const instructions = [];

    // Loop through each input element and extract the step number and description from i
    instructionInputs.forEach(input => {
        const instruction = {
            step_number: input.dataset.stepNumber,
            description: input.querySelector('.descriptionInput').value
        };
        instructions.push(instruction);
    });
    return instructions;
}
