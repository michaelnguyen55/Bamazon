//For using mysql package
var mysql = require("mysql");
//For using inquirer package
var inquirer = require("inquirer");
//For using cli-table2 package
var Table = require('cli-table2');

//Creates connection to bamazon database
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "mysql1995",
	database: "bamazon"
});

//Connects to bamazon database, Starts application if successful
connection.connect(function(err) {
	if(err) { throw err }
	else { bamazonManager.startApplication() };
});

//Object containing all functions for bamazon manager application
var bamazonManager = {

	//Starts the application by first showing the manager's options
	startApplication: function() {
		this.managerOptions();
	},

	//Prompts the manager 4 different options to choose from.
	managerOptions: function() {
		console.log("");
		//Prompts manager by using inquirer
		inquirer.prompt([
		{
			type: "list",
			message: "Choose an option.",
			choices: ["View Products for Sale", "View Low Inventory", "View Departments", "Add to Inventory", "Add New Product", "Exit Application"],
			name: "option"
		}
		]).then(function(answer) {
			//Depending on what option the manager chose, a function will be called
			switch(answer.option) {
				//Shows all products for sale
				case "View Products for Sale":
					that.viewProducts();
					break;
				//Shows manager all products with a stock quantity less than 5
				case "View Low Inventory":
					that.viewLowInventory();
					break;
				//Shows manager all departments
				case "View Departments":
					that.viewDepartments();
					break;
				//Prompts manager to add more stock for a product
				case "Add to Inventory":
					that.addToInventory();
					break;
				//Prompts manager to add a new product
				case "Add New Product":
					that.addNewProductPrompt();
					break;
				//Ends the connection to the database and the application
				case "Exit Application":
					connection.end();
			};
		});
	},

	//Shows id, name, price, and stock quantity of all products
	viewProducts: function() {
		//Gets all products from products table from bamazon database
		var query = connection.query("SELECT item_id AS 'Item ID', product_name AS 'Product Name', department_name AS 'Department', CONCAT('$', price) AS 'Price', stock_quantity AS 'Stock Quantity' FROM products", function(err, res) {
			if(err) { throw err }
			else {
				//Shows all products details by using cli-table2 package
				var productsHeaders = Object.keys(res[0]);
				var table = new Table({head:productsHeaders, style:{head:['yellow', 'bold']}, colWidths:[15,20,20,15,15], wordWrap: true});
				for(var i = 0; i < res.length; i++) {
					table.push(Object.values(res[i]));
				};
				console.log("\n" + table.toString());
			};
			//Prompts the manager's options again
			that.managerOptions();
		});
	},

	//Shows id, name, price, and stock quantity of all products with a stock quantity lower than 5
	viewLowInventory: function() {
		//Gets all products from products table from bamazon database
		var query = connection.query("SELECT item_id AS 'Item ID', product_name AS 'Product Name', department_name AS 'Department', CONCAT('$', price) AS 'Price', stock_quantity AS 'Stock Quantity' FROM products WHERE stock_quantity < 5", function(err, res) {
			if(err) { throw err }
			else {
				//Shows all products', with a stock lower than 5, details by using cli-table2 package
				var productsHeaders = Object.keys(res[0]);
				var table = new Table({head:productsHeaders, style:{head:['yellow', 'bold']}, colWidths:[15,20,20,15,15], wordWrap: true});
				for(var i = 0; i < res.length; i++) {
					table.push(Object.values(res[i]));
				};
				console.log("\n" + table.toString());
			};
			//Prompts the manager's options again
			that.managerOptions();
		});
	},

	//Shows id and name of all departments in bamazon database
	viewDepartments: function() {
		//Gets all departments from table from bamazon database
		var query = connection.query("SELECT department_id AS 'Department ID', department_name AS 'Department Name' FROM departments", function(err, res) {
			if(err) { throw err }
			else {
				//Gets each department and shows their details by using cli-table2 package
				var departmentHeaders = Object.keys(res[0]);
				var table = new Table({head:departmentHeaders, style:{head:['yellow', 'bold']}, colWidths:[15,20], wordWrap: true});
				for(var i = 0; i < res.length; i++) {
					table.push(Object.values(res[i]));
				};
				console.log("\n" + table.toString());
			};
			//Prompts the manager's options again
			that.managerOptions();
		});
	},

	//Prompts the manager to add more stock to a product
	addToInventory: function() {
		console.log("");
		//Prompts manager using inquirer
		inquirer.prompt([
		{
			type: "input",
			message: "Which product would you like to add more stock to? (Enter Item ID)",
			name: "id"
		},
		{
			type: "input",
			message: "How many units of the product would you like to add?",
			name: "quantity"
		}
		]).then(function(answer) {
			console.log("");
			answer.quantity = parseFloat(answer.quantity);
			//Checks if the manager entered less than 1 unit, prompt again if true
			if(answer.quantity < 1) {
				console.log("Please add at least 1 unit.");
				that.addToInventory();
			}
			//Checks if the manager entered non-whole numbers for units, prompt again if true
			else if(answer.quantity % 1 !== 0) {
				console.log("Please enter only whole numbers for the number of units.");
				that.addToInventory();
			}
			else {
				//Updates the product in the bamazon database
				that.updateProduct(answer.id, answer.quantity);
			};
		});
	},

	//Updates product in bamazon database
	updateProduct: function(id, quantity) {
		//Get product details from bamazon database
		var query = connection.query("SELECT * FROM products WHERE ?", [{ item_id: id }],
			function(err, selectRes) {
				//Checks if manager entered an invalid item ID, prompt manager again if true
				if(selectRes.length < 1) {
					console.log("Please enter a valid Item ID.");
					that.addToInventory();
				}
				else if(err) { throw err }
				else {

					//Updates product's stock in bamazon database
					var query = connection.query(
						"UPDATE products SET stock_quantity = stock_quantity + " + quantity + " WHERE ?", [{ item_id: id }],
						function(err, updateRes) {
							if(err) { throw err }
							else {
								console.log("You have successfully updated the product!");
								//After updating the product successfully, show updated results of the product using cli-table2 package
								var productsHeaders = ["Item ID", "Product Name", "Old Stock Quantity", "New Stock Quantity"];
								var table = new Table({head:productsHeaders, style:{head:['yellow', 'bold']}, colWidths:[15,20,15,15], wordWrap: true});
								table.push([id, selectRes[0].product_name, selectRes[0].stock_quantity, selectRes[0].stock_quantity + quantity])
								console.log("\n" + table.toString());
								//Prompts the manager's options again
								that.managerOptions();
							};
						}
					);
					
				};
			}
		);
	},

	//Prompts the manager to add a new product into the bamazon database
	addNewProductPrompt: function() {
		console.log("");
		//Prompts manager using inquirer
		inquirer.prompt([
		{
			type: "input",
			message: "Enter the product's name",
			name: "name"
		},
		{
			type: "input",
			message: "Enter the department's name",
			name: "department"
		},
		{
			type: "input",
			message: "Enter the price of the product",
			name: "price"
		},
		{
			type: "input",
			message: "Enter the stock quantity",
			name: "quantity"
		},
		]).then(function(answer) {
			//Variables references for faster calling
			var name = (answer.name).trim();
			var department = (answer.department).trim();
			var price = parseFloat(answer.price);
			var quantity = parseFloat(answer.quantity);

			//The number of decimals after price is used for checking if they are greater than 2
			var priceDecimals = 0;
			//Returns number of decimals after a number
			var countDecimals = function (value) {
    			if(Math.floor(value) === value) return 0;
    			return value.toString().split(".")[1].length || 0; 
			};
			if(isNaN(price) === false) {
				//Sets priceDecimals to the number of decimals after price
				priceDecimals = countDecimals(price);
			};

			//If any of the cases are true, the manager will be prompted again
			if(name.length === 0 || isNaN(department) === false || department.length === 0 || isNaN(price) || price < 0 || priceDecimals > 2 || quantity % 1 !== 0 || quantity < 0) {
				console.log("");
				//Checks if manager entered anything for the product name
				if(name.length === 0) {
					console.log("Please enter a product name.");
				};
				//Checks if manager entered a department name that is not a number or anything for the department name
				if(isNaN(department) === false || department.length === 0) {
					console.log("Please enter a valid department name.")
				};
				//Checks if manager entered a number for price or price is less than 0 or price has more than 2 decimal places
				if(isNaN(price) || price < 0 || priceDecimals > 2) {
					console.log("Please enter a valid number with less than 2 decimal places for price.")
				};
				//Checks if manager entered a whole number or quantity is less than 0
				if(quantity % 1 !== 0 || quantity < 0) {
					console.log("Please enter only whole numbers greater than 0 for the number of units.");
				};
				//Prompts manager again
				that.addNewProductPrompt();
			}
			else {
				//If none of the above cases were true, the department name will be checked if it exists
				that.checkDepartment(name, department, price.toFixed(2), quantity);
			};
		});
	},

	//Checks if a department name exists in the bamazon database
	checkDepartment: function(name, department, price, quantity) {
		//Gets details of all departments in database
		var query = connection.query("SELECT * FROM departments", function(err, res) {
			if(err) { throw err }
			else {
				var departmentExists = false;
				//Goes through each department to check if a department has the same name as the new department
				for(var i = 0; i < res.length; i++) {
					if(res[i].department_name === department) {
						departmentExists = true;
					};
				};
				if(departmentExists === true) {
					//Product will be created in the bamazon database
					that.createProduct(name, department, price, quantity);
				}
				else {
					console.log("\nA department with that name does not exist. Please enter another.");
					//Prompts again if department name doesn't exist
					that.addNewProductPrompt();
				};
			};
		});
	},

	//Creates a product in the bamazon database
	createProduct: function(name, department, price, quantity) {
		//Inserts product into database
		var query = connection.query(
		    "INSERT INTO products SET ?",
		    {
		    	product_name: name,
		    	department_name: department,
		    	price: price,
		    	stock_quantity: quantity
		    },
		    function(err, res) {
		    	if(err) { throw err }
		    	else {
		    		console.log("\nYou have successfully created a new product!");
		    		//After creating the new product successfully, show product details
					var productsHeaders = ["Product Name", "Department", "Price", "Stock Quantity"];
					var table = new Table({head:productsHeaders, style:{head:['yellow', 'bold']}, colWidths:[20,20,15,15], wordWrap: true});
					table.push([name, department, "$" + price, quantity])
					console.log("\n" + table.toString());
		    		//Prompts the manager's options again
		    		that.managerOptions();
		    	};
		    }
		);
	}

};

//This is used for referencing of 'this' in bamazonManager object
var that = bamazonManager;