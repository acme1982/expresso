const express = require('express');
const menuItemsApi = express.Router({ mergeParams: true });
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || './database.sqlite'
);

// Get all existing menu items
menuItemsApi.get('/', (req, res, next) => {
  const sql = `SELECT * FROM MenuItem WHERE menu_id = $menuId`;
  const value = {
    $menuId: req.params.menuId,
  };
  db.all(sql, value, (err, menuItems) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ menuItems: menuItems });
    }
  });
});
// have access to menuitemId across application
menuItemsApi.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = `SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId`;
  const value = {
    $menuItemId: menuItemId,
  };
  db.get(sql, value, (err, menuItem) => {
    if (err) {
      next(err);
    } else if (!menuItem) {
      console.log('in params err');
      res.sendStatus(404);
    } else {
      req.menuItem = menuItem;
      next();
    }
  });
});
// Create a new menu item
menuItemsApi.post('/', (req, res, next) => {
  const sql =
    'INSERT INTO MenuItem (name, description, inventory, price, menu_id)' +
    ' VALUES ($name, $description, $inventory, $price, $menuId)';
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: menuId,
  };
  db.run(sql, values, function (err) {
    if (err) {
      res.sendStatus(400);
      return next(err);
    } else if (!name || !description || !inventory || !price) {
      return res.sendStatus(400);
    } else {
      db.get(
        `SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
        function (err, menuItem) {
          if (err) {
            next(err);
          } else {
            res.status(201).json({ menuItem: menuItem });
          }
        }
      );
    }
  });
});
// Update existing menu item
menuItemsApi.put('/:menuItemId', (req, res, next) => {
  const sql =
    'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE MenuItem.id = $menuItemId';
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuItemId: req.params.menuItemId,
  };
  db.run(sql, values, (err) => {
    if (err) {
      res.sendStatus(400);
      next(err);
    } else if (!name || !description || !inventory || !price) {
      return res.sendStatus(400);
    } else
      db.get(
        `SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
        (err, menuItem) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json({ menuItem: menuItem });
          }
        }
      );
  });
});
// Delete existing menu item
menuItemsApi.delete('/:menuItemId', (req, res, next) => {
  const sql = `DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`;
  db.run(sql, (err) => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menuItemsApi;
