const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.CAR_USER}:${process.env.CAR_PASSWORD}@cluster0.hscpvor.mongodb.net/?retryWrites=true&w=majority`;

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

        const serviceCollection = client.db('carDoctor').collection('services');
        const bookingCollection = client.db('carDoctor').collection('booking');

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1 }
            }

            const result = await serviceCollection.findOne(query, options);
            res.send(result)
        })

        // bookings
        app.get('/bookings', async (req, res) => {
            //console.log(req.query);
            // http://localhost:5000/bookings?email=aklima@gmail.com&sort=1
            // res: { email: 'aklima@gmail.com', sort: '1' }

            //console.log(req.query.email);
            // http://localhost:5000/bookings?email=aklima@gmail.com&sort=1
            //res: aklima@gmail.com
            // above line for check

            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email };
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
            // http://localhost:5000/bookings (all booking find without query)
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            // console.log(booking)
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        // Update
        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedBooking = req.body;
            console.log(req.body)
            const updateDoc = {
                $set: {
                    status: updatedBooking.status
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // Delete
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
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



app.get('/', (req, res) => {
    res.send(`<h2>Car server is running</h2>`)
})


app.listen(port, () => {
    console.log(`Car server is running ${port}`)
})
