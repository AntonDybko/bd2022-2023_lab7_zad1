const { response } = require('express');
const express = require('express');
const productRoutes = express.Router();
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;


productRoutes.route('/products').get(async function(req, res){
    let db_connect = await dbo.getDb('products');
    let options = {
        sort: {}
    }

    if(req.query.sortByPrice != undefined){
        options.sort.price = req.query.sortByPrice
    }
    if(req.query.sortByAmount != undefined){
        options.sort.amount = req.query.sortByAmount
    }
    if(req.query.sortByUnit != undefined){
        options.sort.unit = req.query.sortByUnit
    }

    let wzorec = {}
    if(req.query.price != undefined){
        wzorec.price = parseInt(req.query.price)
    }
    if(req.query.amount  != undefined){
        wzorec.amount = parseInt(req.query.amount)
    }
    if(req.query.unit  != undefined){
        wzorec.unit = req.query.unit
    }
    console.log(options, wzorec)
    await db_connect.collection('products').find(wzorec, options).toArray(function(err, result){
        if(err) throw err;
        res.json(result)
    });
})



productRoutes.route('/products/:id').get(async function(req, res){
    let db_connect = await dbo.getDb('products');
    let myquery = {_id: ObjectId(req.params.id)};
    await db_connect.collection('products').findOne(myquery, function(err, result){
        if(err) throw err;
        res.json(result)
    });
})

productRoutes.route('/products/add').post(async function(req, responce){
    let db_connect = await dbo.getDb('products');
    let myquery = {name: req.body.name};
    let myobj = {
        name: req.body.name,
        price: req.body.price,
        description :req.body.description,
        amount: req.body.amount,
        unit: req.body.unit,
        //nazwy produktu, ceny, opisu, ilości oraz jednostki miary.
    };
    await db_connect.collection('products').findOne(myquery, async function(err, result){
        if(err){
            throw err;
        }else{
            if (result===null){
                await db_connect.collection('products').insertOne(myobj, function(err, res){
                    console.log('add in progress')
                    if(err) throw err;
                    responce.json(res);
                });
            }else{
                console.log('There is a product with the same name in db')
                responce.json('There is a product with the same name in db')
            }
        }
    });
});

productRoutes.route('/update/:id').put(async function(req, res){
    let db_connect = await dbo.getDb('products');
    let myquery = {_id: ObjectId(req.params.id)};
    let newValues = {
        $set: {
            name: req.body.name,
            price: req.body.price,
            description :req.body.description,
            amount: req.body.amount,
            unit: req.body.unit,
        },
    };
    await db_connect.collection('products').updateOne(myquery, newValues, function(err, responce){
        if (err) throw err;
        console.log('1 document updated successfully!');
        res.json(responce);
    });
});

productRoutes.route('/:id').delete(async function(req, res){
    let db_connect = await dbo.getDb('products');
    let myquery = {_id: ObjectId(req.params.id)};
    await db_connect.collection('products').findOne(myquery, async function(error, resp){
        if(err) throw err;
        if(resp != null){
            await db_connect.collection('products').deleteOne(myquery, function(err, responce){
                if(err) throw err;
                console.log('1 document deleted successfully!');
                res.json(responce);
            })
        }else{
            console.log('There is no such a product')
            responce.json('There is no such a product')
        }
        
    })

})

productRoutes.route('/raport').get(async function(req, responce){
    let db_connect = dbo.getDb('products');
    let pipeline  = [
        { $project: {
            _id : 0,
            name: 1,
            total_price: { $multiply: [
                "$price", "$amount"
            ] }
        } }
    ]
    await db_connect.collection('products').aggregate(pipeline).toArray(function(err, res){
        if(err) throw err;
        responce.json(res);
    })
});

module.exports = productRoutes;