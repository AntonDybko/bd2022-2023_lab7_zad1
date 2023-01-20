const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config({path: './config.env'});
const port = /*process.env.PORT || */5000;
app.use(cors());
app.use(express.json());
app.use(require('./routes/product'));

const dbo = require('./db/conn');

app.listen(port, ()=>{
    dbo.connectToServer(function(err){
        if(err) console.error(err);
    });
    console.log(`Server is running on ${port}.`);
});

/*
If you have the same error after npm install =>
const utf8Encoder = new TextEncoder();
                    ^
ReferenceError: TextEncoder is not defined

locate this file node_modules/whatwg-url/dist/encoding.js or .../lib/encoding.js

add this line at top const { TextEncoder, TextDecoder } = require("util");
 */