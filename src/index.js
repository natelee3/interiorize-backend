'use strict';

const functions = require('@google-cloud/functions-framework');

const cors = require('cors');

const express = require('express');
const app = express();

app.use(cors());
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const rootController = require('./routes/index');
const itemController = require('./routes/items');
const orderController = require('./routes/orders');
const userController = require('./routes/users');
const quizController = require('./routes/quizzes');

app.use('/', rootController);
app.use('/items', itemController);
app.use('/orders', orderController);
app.use('/users', userController);
app.use('/quizzes', quizController);

exports.api = functions.http('api', app);