const express = require('express');
const menusApi = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

// Get all menus
menusApi.get('/', (req, res, next) => {
  const sql = `SELECT * FROM Menu`;
  db.all(sql, (err, menus) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ menus: menus });
    }
  });
});
// Set a param to be able to use menuId
menusApi.param('menuId', (req, res, next, menuId) => {
  const sql = `SELECT * FROM Menu WHERE Menu.id = ${menuId}`;
  db.get(sql, (err, menu) => {
    if (err) {
      next(err);
    } else if (!menu) {
      res.sendStatus(404);
    } else {
      req.menu = menu;
      next();
    }
  });
});
// Get a specific menu
menusApi.get('/:menuId', (req, res, next) => {
  res.json({ menu: req.menu });
});
// Import menuItems and use route
const menuItemsApi = require('./menu_items');
menusApi.use('/:menuId/menu-items', menuItemsApi);
// Create a new menu
menusApi.post('/', (req, res, next) => {
  const sql = 'INSERT INTO Menu (title) VALUES ($title)';
  const title = req.body.menu.title;
  const values = { $title: title };
  db.run(sql, values, function (err) {
    if (err) {
      res.sendStatus(400);
      next(err);
    } else if (!title) {
      res.sendStatus(400);
    } else {
      db.get(
        `SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
        (err, menu) => {
          if (err) {
            next(err);
          } else {
            res.status(201).json({ menu: menu });
          }
        }
      );
    }
  });
});
// Update menu
menusApi.put('/:menuId', (req, res, next) => {
  const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
  const title = req.body.menu.title;
  const values = { $title: title, $menuId: req.params.menuId };
  db.run(sql, values, (err) => {
    if (err) {
      res.sendStatus(400);
      next(err);
    } else {
      db.get(
        `SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
        (err, menu) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json({ menu: menu });
          }
        }
      );
    }
  });
});
// Delete menu from database if menu does not have existing menu-items
menusApi.delete('/:menuId', (req, res, next) => {
  const getMenuItems =
    'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
  const value = { $menuId: req.params.menuId };
  db.all(getMenuItems, value, (err, menus) => {
    if (err) {
      res.sendStatus(404);
      next(err);
    } else if (menus.length > 0) {
      res.sendStatus(400);
    } else {
      const sql = `DELETE FROM Menu WHERE Menu.id = ${req.params.menuId}`;
      db.run(sql, (err) => {
        if (err) {
          next(err);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});
module.exports = menusApi;
