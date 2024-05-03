require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../client/dist')));

app.listen(process.env.PORT || 3000);
console.log(`Node server listening on Port: ${process.env.PORT}.`);