const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
const cors = require('cors');
app.use(cors());
const morgan = require('morgan');
app.use(morgan('dev'));
const errorhandler = require('errorhandler');
app.use(errorhandler());
app.use(express.json());

// Routes
const employeesApi = require('./api/employees');
app.use('/api/employees', employeesApi);
const menusApi = require('./api/menus');
app.use('/api/menus', menusApi);
// Server start
app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});

module.exports = app;
