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
	else { bamazonSupervisor.startApplication() };
});

//Object containing all functions for bamazon supervisor application
var bamazonSupervisor = {

	//Starts the application by first showing the supervisor's options
	startApplication: function() {
		this.supervisorOptions();
	},

	//Prompts the supervisor 2 different options to choose from.
	supervisorOptions: function() {
		console.log("");
		//Prompts supervisor by using inquirer
		inquirer.prompt([
		{
			type: "list",
			message: "Choose an option.",
			choices: ["View Product Sales by Department", "Create New Department", "Exit Application"],
			name: "option"
		}
		]).then(function(answer) {
			//Depending on what option the supervisor chose, a function will be called
			switch(answer.option) {
				//Shows departments table from bamazon database
				case "View Product Sales by Department":
					that.viewDepartments();
					break;
				//Prompts supervisor to create a department
				case "Create New Department":
					that.createNewDepartmentPrompt();
					break;
				//Ends the connection to the database and the application
				case "Exit Application":
					connection.end();
			};
		});
	},

	//Shows id, name, over head costs, and total profits of all departments
	viewDepartments: function() {
		//Gets all departments from table from bamazon database
		var query = connection.query("SELECT department_id AS 'Department ID', departments.department_name AS 'Department', " +
			"CONCAT('$', over_head_costs) AS 'Over Head Costs', CONCAT('$', COALESCE(SUM(product_sales),0)) AS 'Product Sales', " +
			"CONCAT('$', COALESCE((SUM(product_sales) - over_head_costs),0)) AS 'Total Profit' FROM departments " +
			"LEFT JOIN products ON departments.department_name = products.department_name " +
			"GROUP BY departments.department_name ORDER BY (SUM(product_sales) - over_head_costs) DESC", function(err, res) {
			if(err) { throw err }
			else {
				//Shows department table by using cli-table2 package
				var departmentHeaders = Object.keys(res[0]);
				var table = new Table({head:departmentHeaders, style:{head:['yellow', 'bold']}, colWidths:[15,20,15,15,15], wordWrap: true});
				for(var i = 0; i < res.length; i++) {
					table.push(Object.values(res[i]));
				};
				console.log("\n" + table.toString());
			};
			//Prompts the supervisor's options again
			that.supervisorOptions();
		});
	},

	//Prompts the supervisor to add a new department into the bamazon database
	createNewDepartmentPrompt: function() {
		console.log("");
		//Prompts supervisor using inquirer
		inquirer.prompt([
		{
			type: "input",
			message: "Enter the department's name",
			name: "department"
		}
		]).then(function(answer) {
			var department = (answer.department).trim();
			//Checks if supervisor entered anything, prompt again if entered nothing
			if(department.length === 0) {
				console.log("Please enter a department name.")
				that.createNewDepartmentPrompt();
			}
			//Checks if entered department name is a number, prompt again if true
			else if(isNaN(department) === false) {
				console.log("Please enter a name that is not just a number.");
				that.createNewDepartmentPrompt();
			}
			else {
				//Checks if department name already exists in the bamazon database
				that.checkDepartment(department);
			};
		});
	},

	//Checks if a department name already exists in the bamazon database
	checkDepartment: function(department) {
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
				//If a department name already exists, prompt again
				if(departmentExists === true) {
					console.log("\nA department with this name already exists! Enter another name.");
					that.createNewDepartmentPrompt();
				}
				else {
					//Creates new department in bamazon database
					that.createDepartment(department);
				};
			};
		});
	},

	//Creates a new department in the bamazon database
	createDepartment: function(department) {
		//Inserts department into database
		var query = connection.query(
		    "INSERT INTO departments SET ?",
		    {
		    	department_name: department,
		    },
		    function(err, res) {
		    	if(err) { throw err }
		    	else {
		    		//After creating the new department successfully, show department details
		    		console.log("\nYou have successfully created a new department!\nDepartment Name: " + department);
		    		//Prompts the supervisor's options again
		    		that.supervisorOptions();
		    	};
		    }
		);
	}

};

//This is used for referencing of 'this' in bamazonSupervisor object
var that = bamazonSupervisor;