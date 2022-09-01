require('dotenv').config()
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public/'));

mongoose.connect('mongodb+srv://KritN:stoneSmith@cluster0.bq442zz.mongodb.net/TeenBooks', {useNewUrlParser: true});

const bookSchema = new mongoose.Schema({
    title: String,
    author: String, 
    imageUrl: String,
    libraryUrl: String,
    summary: String, 
    categories: [String]
});

const Book = new mongoose.model("Book", bookSchema);
const toBeApproved = new mongoose.model("FutureBook", bookSchema);

app.get('/', (req, res) => {
    Book.find((err, result) => {
        if(!err){
            res.render('index', {books: result});
        }else{
            res.redirect('/');
        }
    })
})

app.post('/search', (req, res) => {

    const title = req.body.bookTitle.toLowerCase().trim()
    let cat = req.body.categories;

    if(cat.length > 0){
        cat = cat.split("+");
        cat.pop();
    }else{
        cat = [];
    }
    if(cat.length > 0){
        Book.find({'categories': { $all: cat}}, (err, results) => {
            if(!err){
                if(title == ""){
                    return res.render('index', {books: results});
                }else{
                    let output = [];
                    for (var i = 0; i < results.length; i++){
                        let str = results[i].title.toLowerCase().trim();
                        if(str.includes(title)){
                            output.push(results[i]);
                        }
                        if(i == results.length-1){
                            return res.render('index', {books: output});
                        }
                    }
                }
                
            }
        })
    }else{
        Book.find((err, results) => {
            if(!err){
                let output = [];
                for (var i = 0; i < results.length; i++){
                    let str = results[i].title.toLowerCase().trim();
                    if(str.includes(title)){
                        output.push(results[i]);
                    }
                    if(i == results.length-1){
                        return res.render('index', {books: output});
                    }
                }
            }else{
                console.log(err);
            }
        });
    }
    

})

app.get('/pin', (req, res) => {
    res.render('pin');
})

app.post('/pin', (req, res) => {
    const isLibrarian = req.body.isLibrarian;
    const pin = req.body.pin;
    console.log(process.env.VOLUNTEER_PIN);
    console.log(pin);
    if(pin == process.env.LIBRARY_PIN && isLibrarian == "true"){
        toBeApproved.find( (err, result) => {
            if(!err){
                res.render('approve', {books: result});
            }
        });
    }else if(pin == process.env.VOLUNTEER_PIN && isLibrarian == "false"){
        res.render('suggest');
    }else{
        res.redirect('/pin');
    }
})

app.post('/suggest', (req, res) => {

    let categories = req.body.categories;

    if(categories.length > 0){
        categories = req.body.categories.split("+");
        categories.pop();
    }else{
        categories = [];
    }
    
    const a = new toBeApproved({
        title: req.body.title,
        author: req.body.author, 
        imageUrl: req.body.imageUrl,
        libraryUrl: req.body.libraryUrl,
        summary: req.body.summary, 
        categories: categories
    });

    Book.find({title: req.body.title, author: req.body.author}, (err, result) => {

        if(!err && result==false){

            toBeApproved.find({title: req.body.title, author: req.body.author}, (errs, results) => {
                if(!errs && results == false){

                    a.save().then(
                        res.render('suggest')
                    );
                }else{
                    res.render('error', {message: "The book " + req.body.title + " by " + req.body.author + " is already waiting to be approved"})
                }
            });
        }else{
            res.render('error', {message: "The book " + req.body.title + "by " + req.body.author + " is already waiting in our database"})
        }
    })
    
})

app.post('/approve', (req, res) => {
    const id = req.body.approved;
    toBeApproved.findOne({_id: id}, (err, results) => {
        if(!err && results){
            const bk = new Book({
                title: results.title,
                author: results.author, 
                imageUrl: results.imageUrl,
                libraryUrl: results.libraryUrl,
                summary: results.summary, 
                categories: results.categories
            })
            bk.save();
            toBeApproved.deleteOne({ _id: id}, function (err){
                if(!err){
                    toBeApproved.find( (err, result) => {
                        if(!err){
                            res.render('approve', {books: result});
                        }
                    });
                }
            });

        }
    })
})

app.post('/remove', (req, res) => {
    const id = req.body.toRemove;
    toBeApproved.deleteOne({ _id: id}, function (err){
        if(!err){
            toBeApproved.find( (err, result) => {
                if(!err){
                    res.render('approve', {books: result});
                }
            });
        }
    });
    
})

let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}
app.listen(port);
