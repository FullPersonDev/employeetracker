const inquirer = require('inquirer');
const mysql = require('mysql2');
const table = require('console.table');
const express = require('express');

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

//Function to add a department
function addDepartment() {
    inquirer.prompt({
        name: 'departmentName',
        type: 'input',
        message: 'What is the name of the department you want to add?'
    }).then(answer => {
        db.query('INSERT INTO departments SET ?', {title: answer.departmentName}, function (err, result) {
            if (err) throw err;
            console.log('Department added successfully!');
            promptUser();
        });
    });
}

//Function to add a role
function addRole() {
    db.query('SELECT * FROM departments', function (err, departments) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: 'What is the title of the role?'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What is the salary of the role?',
                validate: value => !isNaN(value) || 'Please enter a valid number!'
            },
            {
                name: 'department',
                type: 'list',
                choices: departments.map(department => ({name: department.title, value: department.id})),
                message: 'Which department does this role belong to?'
            }
        ]).then(answers => {
            db.query('INSERT INTO roles SET ?',
            {
                title: answers.title,
                salary: answers.salary,
                departments_id: answers.department
            }, function (err, result) {
                if (err) throw err;
                console.log('Role added successfully!');
                promptUser();
            });
        });
    });
}

//Function to add an employee
function addEmployee() {
    db.query('SELECT * FROM roles', function (err, roles) {
        if (err) throw err;
        db.query('SELECT * FROM employees', function (err, employees){
            if (err) throw err;
            inquirer.prompt([
                {
                    name: 'firstName',
                    type: 'input',
                    message: 'What is the employee first name?'
                },
                {
                    name: 'lastName',
                    type: 'input',
                    message: 'What is the employee last name?'
                },
                {
                    name: 'role',
                    type: 'list',
                    choices: roles.map(role => ({ name: role.title, value: role.id})),
                    message: 'What is the employee role?'
                },
                {
                    name: 'manager',
                    type: 'list',
                    choices: [{ name: 'None', value: null}].concat(employees.map(employee => ({ name: employee.firstname + ' ' + employee.lastname, value: employee.id }))),
                    message: 'Who is the employee manager?'
                }
            ]).then(answers => {
                db.query('INSERT INTO employees SET ?',
                {
                    firstname: answers.firstName,
                    lastname: answers.lastName,
                    roles_id: answers.role,
                    manager_id: answers.manager
                }, function (err, result) {
                    if (err) throw err;
                    console.log('Employee added successfully!');
                    promptUser();
                });
            });
        });
    });
}

//Function to update an employee role
function updateEmployeeRole() {
    db.query('SELECT * FROM employees', function (err, employees) {
        if (err) throw err;
        db.query('SELECT * FROM roles', function (err, roles) {
            if (err) throw err;
            inquirer.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    choices: employees.map(emp => ({ name: emp.firstname + ' ' + emp.lastname, value: emp.id })),
                    message: 'Which employee do you want to update?'
                },
                {
                    name: 'role',
                    type: 'list',
                    choices: roles.map(role => ({ name: role.title, value: role.id })),
                    message: 'What is the new role?'
                }
            ]).then(answers => {
                db.query('UPDATE employees SET roles_id = ? WHERE id = ?',
                [answers.role, answers.employee], function (err, result) {
                    if (err) throw err;
                    console.log('Employee role updated successfully!');
                    promptUser();
                });
            });
        });
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