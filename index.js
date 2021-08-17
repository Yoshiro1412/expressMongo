// Get credentials
const { user, password } = require('./credentials.json')

// Mongo client
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${user}:${password}@cluster0.ebqv8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

// Express
const express = require('express');
const app = express();
const port = 3000;

app.get('/:name',async (req,res)=>{
    const movie = await getMovie(req.params.name);
    res.send(movie);
})

app.get('/movies/:duration', async (req,res)=>{
    const list_of_movies = await getMovies(parseInt(req.params.duration));
    res.send(list_of_movies);
})

app.listen(port, ()=>{
    console.log(`Server listening at http://localhost:${port}`)
})

// querys
async function getMovie(name){
    try{
        await client.connect();
        const database = client.db('sample_mflix');
        const movies = database.collection('movies');

        // Query
        const query = { title: name };
        const options = {
            sort: {"imbd.rating": -1},
            projection: { _id:0, title:1, poster:1 }
        }
        const movie = await movies.findOne(query,options);

        return movie;
    }finally{
        await client.close();
    }
}

async function getMovies(max_duration){
    try{
        await client.connect();
        const db = client.db('sample_mflix');
        const movies = db.collection('movies');

        const query = { runtime: { $lt: max_duration } };
        const options = {
            sort: { title:1 }, // Title A-Z ascending
            projection: { _id:0, title:1, poster:1 }
        };

        const list_of_movies = await movies.find(query,options).toArray();
        return list_of_movies;
    }finally{
        await client.close();
    }
}