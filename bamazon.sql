CREATE DATABASE IF NOT EXISTS bamazon;

USE bamazon;

CREATE TABLE products(
	item_id INTEGER AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(60) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    product_sales DECIMAL(65,2) DEFAULT 0 NOT NULL,
    PRIMARY KEY (item_id)
);

CREATE TABLE departments(
	department_id INTEGER AUTO_INCREMENT NOT NULL,
    department_name VARCHAR(60) NOT NULL,
    over_head_costs DECIMAL(65,2) DEFAULT 0 NOT NULL,
    PRIMARY KEY (department_id)
);

INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES ('Animal Socks', 'Clothing', 4.65, 300);
INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES ('Nintendo Switch', 'Video Games', 299.99, 5000);
INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES ('Red Hand-Knit Sweater', 'Clothing', 38.52, 10);
INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES ('Forbidden Fruit from the Tree of Forbidden Knowledge of Good and Evil', 'Grocery & Gourmet Food', 99999999.99, 1);
INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES ('The Legend of Zelda: Breath of the Wild', 'Video Games', 59.99, 10000);
INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES ('Connect 4 Game', 'Toys & Games', 12.99, 30000);
INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES ('Play-Doh 10-Pack of Colors', 'Toys & Games', 7.99, 50000);
INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES ('Exploding Kittens Card Game', 'Toys & Games', 19.99, 5000);
INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES ('Women''s Long Scarf', 'Clothing', 12.99, 3000);
INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES ('Oreo Cookies, Family Size', 'Grocery & Gourmet Food', 3.56, 80000);

INSERT INTO departments(department_name, over_head_costs) VALUES ('Clothing', 10);
INSERT INTO departments(department_name, over_head_costs) VALUES ('Video Games', 20);
INSERT INTO departments(department_name, over_head_costs) VALUES ('Grocery & Gourmet Food', 2);
INSERT INTO departments(department_name, over_head_costs) VALUES ('Toys & Games', 5);