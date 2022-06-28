const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags:'a'})

app.use(morgan('combined', {stream:accessLogStream}));

let topMovies = [
    {
    title:'Harry Potter and the Sorcerer\'s Stone'
},
{
    title:'Harry Potter and the Chamber of Secrets'
},
{
    title:'Harry Potter and the Prisoner of Azkaban'
},
{
    title:'Harry Potter and the Goblet of Fire'
},
{
    title:'Harry Potter and the Order of the Phoenix'
},
{
    title:'Harry Potter and the Half-Blood Prince'
},
{
    title:'Harry Potter and the Deathly Hallows – Part 1'
},
{
    title:'Harry Potter and the Deathly Hallows – Part 2'
},
{
    title:'Green Book'
},
{
    title:'The Untouchables'
}
]

app.get('/movies',(req,res) =>{
    res.json(topMovies);
});

app.get('/',(req,res) => {
    res.send('Welcome to my app!');
})

app.get('/documentation', (req,res) => {
    res.sendFile('public/documentation.html', {root: __dirname});
});

app.use(express.static('public'));

app.use((err,req,res,next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})

app.listen(8080,() => {
    console.log('Your app is listening on port 8080.');
})
