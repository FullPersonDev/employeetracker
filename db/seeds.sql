USE mycompany_db;

-- Inserting departments --
INSERT INTO departments (title)
VALUES
    ('Engineering'),
    ('Human Resources'),
    ('Marketing'),
    ('Sales');

-- Inserting roles --
INSERT INTO roles (title, salary, departments_id)
VALUES
    ('Software Engineer', 90000.00, 1),
    ('HR Manager', 75000.00, 2),
    ('Marketing Coordinator', 60000.00, 3),
    ('Sales Representative', 55000.00, 4),
    ('IT Director', 200000.00, 1);

-- Inserting employees --
INSERT INTO employees (firstname, lastname, roles_id, manager_id)
VALUES
    ('Leo', 'Messi', 5, NULL),
    ('Jane', 'Smith', 1, 1),
    ('Emily', 'Johnson', 1, 1),
    ('Mike', 'Brown', 2, NULL),
    ('Sara', 'Davis', 2, 4),
    ('Alex', 'Wilson', 3, NULL),
    ('Eva', 'Martinez', 3, 6),
    ('Sam', 'Lee', 4, NULL);
