'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename); // Get the basename of the current module
const env = process.env.NODE_ENV || 'development'; // Get the environment variable 'NODE_ENV', defaults to 'development'
const config = require(__dirname + '/../config/config.json')[env]; // Get the database configuration for the current environment
const db = {}; // Initialize an empty object to store the models

let sequelize; // Declare a variable to store the Sequelize instance
if (config.use_env_variable) { // Check if the database configuration uses an environment variable
  sequelize = new Sequelize(process.env[config.use_env_variable], config); // Create a Sequelize instance using the environment variable
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config); // Create a Sequelize instance using the database configuration
}

// Load all models in this directory, except for this file, test files, and hidden files
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && // Exclude hidden files
      file !== basename && // Exclude this file
      file.slice(-3) === '.js' && // Only include JavaScript files
      file.indexOf('.test.js') === -1 // Exclude test files
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes); // Load the model and pass the Sequelize instance and DataTypes
    db[model.name] = model; // Add the model to the db object
  });

// Call the 'associate' method on each model, if it exists
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize; // Add the Sequelize instance to the db object
db.Sequelize = Sequelize; // Add the Sequelize constructor to the db object

module.exports = db; // Export the db object, which contains all the models and the Sequelize instance
