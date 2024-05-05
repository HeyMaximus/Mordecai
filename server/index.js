require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db');
const morgan = require('morgan');
const router = require('./routes');

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use('/api', router);

app.listen(process.env.SERVER_PORT || 3000);
console.log(`Node server listening on Port: ${process.env.SERVER_PORT}.`);