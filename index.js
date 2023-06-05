const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//Middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.znibnea.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const taskDB = client.db('tasks-db').collection('tasks')

        app.get('/', (req, res) => {
            res.send('The server is running')
        })

        app.post('/add-task', async (req, res) => {
            const newTask = req.body;
            console.log(newTask);
            const result = await taskDB.insertOne(newTask)
            res.send(result)
        })

        app.get('/tasks', async (req, res) => {
            const result = await taskDB.find().toArray()
            res.send(result)
        })
        app.patch('/status-update/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: req.body.text,
                },
            };
            const result = await taskDB.updateOne(filter, updateDoc)
            res.send(result)
        })
        app.patch('/update-task/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            console.log(req.body);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    ...req.body,
                },
            };
            const result = await taskDB.updateOne(filter, updateDoc)
            res.send(result)
        })
        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await taskDB.deleteOne(query)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`The server is running on ${port} port`);
})