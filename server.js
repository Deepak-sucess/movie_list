const express = require("express")
const bodyParser = require('body-parser')

var app = express()


var mysql = require('mysql');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static('public'));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root12345",
    database: "movies"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});


app.get("/fetch_movies", function (request, response) {

    con.query("select ms.id id,ms.name movie_name,GROUP_CONCAT(mg.name) genre  from movies.map_movie_genres mmg inner join movies.master_genres mg on mmg.genres_id =mg.id inner join movies.movie_store ms on ms.id=mmg.movie_id  group by mmg.movie_id", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        response.send(result)
    });
})


app.get("/fetch_movies_by_id", function (request, response) {

    let id = request.query.id
    console.log("asss",id);
    con.query("select ms.id ,ms.name ,GROUP_CONCAT(mg.name) genre,ms.details,ms.reviews,DATE_FORMAT(ms.release_date,'%Y-%m-%d') release_date  from movies.map_movie_genres mmg inner join movies.master_genres mg on mmg.genres_id =mg.id inner join movies.movie_store ms on ms.id=mmg.movie_id where mmg.movie_id="+id +" group by mmg.movie_id", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        response.send(result)
    });
})



app.get("/search_movie", function (request, response) {

    let genre = request.query.genre
    // console.log("asss",id);
    con.query(`select ms.id ID,ms.name Movie_Name,GROUP_CONCAT(mg.name) Genre  from movies.map_movie_genres mmg inner join movies.master_genres mg on mmg.genres_id =mg.id inner join movies.movie_store ms on ms.id=mmg.movie_id where mg.name like ${genre} group by mmg.movie_id ORDER by ms.release_date desc`, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        response.send(result)
    });
})


app.post("/vote", function (request, response) {

    let vote = request.body.vote;
    let movie_id=request.body.movie_id
    console.log("asss",request.body);
    con.query(`update movies.movie_store set vote='${vote}' where id=${movie_id}`, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        response.send({
            "message":"Movies vote is updated"
        })
    });
})


app.get("/fetch_top_10_movies", function (request, response) {

    con.query(`select ms.id ID,ms.name Movie_Name,GROUP_CONCAT(mg.name) Genre,vote Vote  from movies.map_movie_genres mmg 
    inner join movies.master_genres mg 
    on mmg.genres_id =mg.id
    inner join movies.movie_store ms 
    on ms.id=mmg.movie_id  
    where ms.vote ='up'
    group by mmg.movie_id 
    limit 10 `, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        response.send(result)
    });
})



app.listen(3001, function () {
    console.log("Started application on port %d", 10000)
});