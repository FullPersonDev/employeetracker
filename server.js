const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const PORT = process.env.PORT || 3001;
const app = express();

//Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Connect to the database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'ninja1234',
        database: 'mycompany_db'
    },
    console.log('Connected to the mycompany_db database')
);

//Function to Prompt the user on what action they want to take
function promptUser() {
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit'
        ]
    }).then(answer => {
        switch (answer.action) {
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            case 'Exit':
                db.end();
                break;
            default:
                console.log(`Invalid action: ${answer.action}`);
                promptUser();
        }
    });
}

//Definition of operation functions:

//Function to view all departments
function viewDepartments() {
    db.query('SELECT * FROM departments', function (err, results) {
        if (err) throw err;
        console.table(results);
        promptUser();
    });
}

//Function to view all roles
function viewRoles() {
    const query = `
        SELECT roles.id, roles.title, roles.salary, departments.title AS department
        FROM roles
        INNER JOIN departments ON roles.departments_id = departments.id
        `;
    db.query(query, function (err, results) {
        if (err) throw err;
        console.table(results);
        promptUser();
    });
}

//Function to view all employees
function viewEmployees() {
    const query = `
        SELECT employees.id, employees.firstname, employees.lastname,
        roles.title AS role, departments.title AS department,
        roles.salary, CONCAT(manager.firstname, ' ', manager.lastname) AS manager
        FROM employees
        LEFT JOIN roles ON employees.roles_id = roles.id
        LEFT JOIN departments ON roles.departments_id = departments.id
        LEFT JOIN employees AS manager ON employees.manager_id = manager.id
        `;
    db.query(query, function (err, results) {
        if (err) throw err;
        console.table(results);
        promptUser();
    });
}

//Start the Prompt
promptUser();


//Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});