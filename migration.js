const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

// Create tables if they don't exist'
db.serialize(function () {
  db.run(
    `CREATE TABLE IF NOT EXISTS Employee (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    wage INTEGER NOT NULL,
    is_current_employee INTEGER DEFAULT 1
    );`,
    (err) => {
      if (err) {
        throw new Error(err);
      }
    }
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS Timesheet (
        id INTEGER PRIMARY KEY,
        hours INTEGER NOT NULL,
        rate INTEGER NOT NULL,
        date INTEGER NOT NULL,
        employee_id INTEGER NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES Employee (id));`,
    (err) => {
      if (err) {
        throw new Error(err);
      }
    }
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS Menu (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL);`,

    (err) => {
      if (err) {
        throw new Error(err);
      }
    }
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS MenuItem (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL, 
    description TEXT, 
    inventory INTEGER NOT NULL, 
    price INTEGER NOT NULL, 
    menu_id INTEGER NOT NULL,
    FOREIGN KEY (menu_id) REFERENCES Menu (id));`,
    (err) => {
      if (err) {
        throw new Error(err);
      }
    }
  );
  db.close();
});

module.exports = db;
