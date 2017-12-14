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
	else { bamazonCustomer.startApplication() };
});

//Object containing all functions for bamazon customer application
var bamazonCustomer = {

	//Starts the application by first showing the products
	startApplication: function() {
		this.customerOptions();
	},

	//Prompts the customer 2 different options to choose from.
	customerOptions: function() {
		console.log("");
		//Prompts customer by using inquirer
		inquirer.prompt([
		{
			type: "list",
			message: "Choose an option.",
			choices: ["View Products", "Exit Application"],
			name: "option"
		}
		]).then(function(answer) {
			//Depending on what option the customer chose, a function will be called
			switch(answer.option) {
				//Shows available products
				case "View Products":
					that.viewProducts();
					break;
				//Ends the connection to the database and the application
				case "Exit Application":
					connection.end();
			};
		});
	},

	//Shows id, name, and price of all products
	viewProducts: function() {
		//Gets all products from products table from bamazon database
		var query = connection.query("SELECT item_id AS 'Item ID', product_name AS 'Product Name', CONCAT('$', price) AS 'Price' FROM products", function(err, res) {
			if(err) { throw err }
			else {
				//Shows all products details by using cli-table2 package
				var productsHeaders = Object.keys(res[0]);
				var table = new Table({head:productsHeaders, style:{head:['yellow', 'bold']}, colWidths:[15,30,15], wordWrap: true});
				for(var i = 0; i < res.length; i++) {
					table.push(Object.values(res[i]));
				};
				console.log("\n" + table.toString());
			};
			//Prompt the customer of what product they want after the products are shown
			that.customerBuyProductPrompt();
		});
	},

	//Prompts customer which product they want to buy and how many they want
	customerBuyProductPrompt: function() {
		console.log("");
		//Prompts customer by using inquirer
		inquirer.prompt([
		{
			type: "input",
			message: "Which product would you like to buy? (Enter Item ID)",
			name: "id"
		},
		{
			type: "input",
			message: "How many units of the product would you like to buy?",
			name: "quantity"
		}
		])
		.then(function(answer) {
			console.log("");
			answer.quantity = parseFloat((answer.quantity).trim());
			//Checks if the customer entered less than 1 unit, prompt again if true
			if(answer.quantity < 1) {
				console.log("Please purchase at least 1 unit.");
				that.customerBuyProductPrompt();
			}
			//Checks if the customer entered non-whole numbers for units, prompt again if true
			else if(answer.quantity % 1 !== 0) {
				console.log("Please enter only whole numbers for the number of units.");
				that.customerBuyProductPrompt();
			}
			else {
				//Check the store for the product after the customer has finished answering the prompt
				that.checkStore((answer.id).trim(), answer.quantity);
			};
		});
	},

	//Checks the store for the product id and if there is enough stock of that product
	checkStore: function(id, quantity) {
		//Gets specific product details from database depending on id
		var query = connection.query("SELECT * FROM products WHERE ?", [{ item_id: id }], function(err, res) {
			if(err) { throw err }
			else {
				//Checks if the product id that was entered by the customer is not valid, prompt again if true
				if(res.length < 1) {
					console.log("Please enter a valid Item ID.");
					that.customerBuyProductPrompt();
				}
				//Checks if there is any stock of the product left
				else if(parseFloat(res[0].stock_quantity) === 0) {
					console.log("Sorry! No more of this product is in stock!");
					//Prompts customer if they want to buy another product
					that.buyAgainPrompt();
				}
				//Checks if there is enough stock of the product left compared to the amount the customer wants
				else if(parseFloat(res[0].stock_quantity) < quantity) {
					console.log("Sorry! There is not enough of this product left for how much you want!");
					//Prompts customer if they want to buy another product
					that.buyAgainPrompt();
				}
				else {
					//Gets stock quantity left and total cost of products purchased
					var quantityLeft = parseFloat(res[0].stock_quantity) - quantity;
					var totalCost = (parseFloat(res[0].price) * quantity).toFixed(2);
					var productSales = parseFloat(res[0].product_sales);
					//Calculates products sales
					productSales = (productSales + parseFloat(totalCost)).toFixed(2);
					var name = res[0].product_name;
					//Update the product in bamazon database
					that.updateProduct(id, quantityLeft, name, quantity, totalCost, productSales);
				};
			};
		});
	},

	//Updates product in bamazon database
	updateProduct: function(id, quantityLeft, name, quantity, totalCost, productSales) {
		//Updates product's stock and product sales in bamazon database
		var query = connection.query(
			"UPDATE products SET ? WHERE ?",
			[
				{
					stock_quantity: quantityLeft,
					product_sales: productSales
				},
				{
					item_id: id
				}
			],
			function(err, res) {
				if(err) { throw err }
				else {
					//After updating the product successfully, show receipt
					console.log("Your product order has succussfully went through!\nReceipt:\n   Product Name: " + name + "\n   Quantity: " + quantity + "\n   Total Cost: $" + totalCost);
					//Ask customer if they would like to by another product
					that.buyAgainPrompt();
				};
			}
		);
	},

	//Prompts customer if they would like to buy another product
	buyAgainPrompt: function() {
		console.log("");
		//Prompt customer by using inquirer
		inquirer.prompt([
		{
			type: "list",
			message: "Would you like to buy another product?",
			choices: ["Yes", "No"],
			name: "again"
		}
		])
		.then(function(answer) {
			if(answer.again === "Yes") {
				//If the customer entered "Yes", the products will be shown and the customer can buy another product
				that.viewProducts();
			}
			else {
				//If the customer entered "No", the connection to the database and the application will end
				connection.end();
			};
		});
	},

};

//This is used for referencing of 'this' in bamazonCustomer object
var that = bamazonCustomer;