const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');

const app = express();
const port = 5005;

app.use(cors());
app.use(express.json());

//user : myDbUser1
//pass: wq5xpsBaKWvhczVY

const uri = "mongodb+srv://myDbUser1:wq5xpsBaKWvhczVY@cluster0.wvayw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("productsCluster");
        const productsCollection = database.collection("products");
        //get api
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })
        //get api for single product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.send(product);
        })
        //post api
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            console.log('got the products', req.body);
            console.log('add products', result);
            res.json(result);
        })
        //update api
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedProduct.name,
                    price: updatedProduct.price,
                    quantity: updatedProduct.quantity,
                },
            };
            const result = await productsCollection.updateOne(filter, updateDoc, options);
            console.log('updating product', req);
            res.json(result);
        })
        //delete api 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })

    } finally {
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    console.log('hitting api')
    res.send('Welcome to practice crud mongodb')
})

app.listen(port, () => {
    console.log('running server', port)
})