'use strict';

const Sequelize = require('sequelize');

const {DATABASE_URL, SEQUELIZE_OPTIONS} = require('../config.js');

console.log(`Connecting to database at ${DATABASE_URL}`);
const sequelize = new Sequelize(DATABASE_URL, SEQUELIZE_OPTIONS);

module.exports = {
    sequelize
};
