const express = require('express');
const timeSheetApi = express.Router({ mergeParams: true });
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);
// set timesheetId as params
timeSheetApi.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const value = { $timesheetId: timesheetId };
  db.get(sql, value, (err, timesheet) => {
    if (err) {
      console.log('in params');
      return next(err);
    } else if (timesheet) {
      req.timesheet = timesheet;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});
// get a timesheet for specific employee
timeSheetApi.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Timesheet WHERE employee_id = $employeeId';
  const value = { $employeeId: req.params.employeeId };
  db.all(sql, value, (err, timesheets) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ timesheets: timesheets });
    }
  });
});
// Create a new timesheet for employee
timeSheetApi.post('/', (req, res, next) => {
  const findEmployee = `SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`;
  db.get(findEmployee, (err, employee) => {
    if (err) {
      next(err);
    } else if (employee !== null) {
      const sql =
        'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)';
      const hours = req.body.timesheet.hours;
      const rate = req.body.timesheet.rate;
      const date = req.body.timesheet.date;
      const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId,
      };
      db.run(sql, values, function (err) {
        if (err) {
          res.sendStatus(400);
          return next(err);
        } else if (!hours || !rate || !date) {
          return res.sendStatus(400);
        } else {
          db.get(
            `SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
            function (err, timesheet) {
              if (err) {
                next(err);
              } else {
                res.status(201).json({ timesheet: timesheet });
              }
            }
          );
        }
      });
    }
  });
});
// update existing timesheet
timeSheetApi.put('/:timesheetId', (req, res, next) => {
  const sql = `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE Timesheet.id = $timesheetId`;
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $timesheetId: req.params.timesheetId,
  };
  db.run(sql, values, (err) => {
    if (err) {
      res.sendStatus(400);
      next(err);
    } else if (!hours || !rate || !date) {
      return res.sendStatus(400);
    } else {
      db.get(
        `SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
        (err, timesheet) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json({ timesheet: timesheet });
          }
        }
      );
    }
  });
});
// Delete the timesheet
timeSheetApi.delete('/:timesheetId', (req, res, next) => {
  const sql = `DELETE FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`;
  db.run(sql, (err) => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});
module.exports = timeSheetApi;
