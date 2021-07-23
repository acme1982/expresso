const express = require('express');
const employeesApi = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);
// Bind employee to req.body
employeesApi.param('employeeId', (req, res, next, employeeId) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const values = { $employeeId: employeeId };
  db.get(sql, values, (err, employee) => {
    if (err) {
      next(err);
    } else if (!employee) {
      return res.sendStatus(404);
    } else {
      req.employee = employee;
      next();
    }
  });
});
// Get a single employee
employeesApi.get('/:employeeId', (req, res, next) => {
  res.json({ employee: req.employee });
});
// Get all employees that is_current_employee = 1
employeesApi.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Employee WHERE is_current_employee = 1';
  db.all(sql, (err, employees) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ employees: employees });
    }
  });
});

// import timesheets and set it to /:employeeId path
const timeSheetsApi = require('./timesheets');
employeesApi.use('/:employeeId/timesheets', timeSheetsApi);
// Create new employee return 201 when done.
employeesApi.post('/', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;

  const sql = `INSERT INTO Employee (name, position, wage, is_current_employee) VALUES (
      $name, $position, $wage, $isCurrentEmployee);`;
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: 1,
  };
  db.run(sql, values, function (err) {
    if (err) {
      res.sendStatus(400);
      return next(err);
    } else if (!name || !position || !wage) {
      res.sendStatus(400);
    }
    db.get(
      `SELECT * FROM Employee WHERE id = ${this.lastID}`,
      function (err, employee) {
        if (err) {
          next(err);
        } else {
          res.status(201).json({ employee: employee });
        }
      }
    );
  });
});

// Update employees path: /:employeeId
employeesApi.put('/:employeeId', (req, res, next) => {
  const sql =
    'UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE Employee.id = $employeeId';
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const isCurrentEmployee = req.body.employee.isCurrentEmployee;
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $employeeId: req.params.employeeId,
  };
  db.run(sql, values, (err) => {
    if (err) {
      res.sendStatus(400);
      return next(err);
    } else if (!name || !position || !wage) {
      res.sendStatus(400);
    } else {
      db.get(
        `SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (err, employee) => {
          if (err) {
            return next(err);
          } else {
            res.status(200).json({ employee: employee });
          }
        }
      );
    }
  });
});
// Delete employee... change its employment status to is_current_employee = 0
employeesApi.delete('/:employeeId', (req, res, next) => {
  const sql = `UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = ${req.params.employeeId} `;
  db.run(sql, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(
        `SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (err, employee) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json({ employee: employee });
          }
        }
      );
    }
  });
});

module.exports = employeesApi;
