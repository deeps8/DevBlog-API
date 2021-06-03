// all requires epress,mongoose,cors,path
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const env_var = require('./config');

const app = express();

// Route section imports
const userRoute = require('./api/routes/userOP');
const topicRoute = require('./api/routes/topicsOP');
const postRoute = require('./api/routes/postsOP');
const seriesRoute = require('./api/routes/seriesOP');
const commRoute = require('./api/routes/commentsOP');

// initializing the port
const port = process.env.PORT || 3000;

// database connection using mongoose
mongoose.connect(`mongodb+srv://${env_var.db_user}:${env_var.db_password}@fitnessoverseer.ghdr4.mongodb.net/${env_var.db_name}?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
);

// check for databse connection
mongoose.connection.on('connected',()=>{
    console.log('MongoDB is Connected.');
});

// check for connection error
mongoose.connection.off('error',(error)=>{
    console.log('MongoDB not connected.',error);
});

mongoose.set('useFindAndModify',false);

// use of urlencoded ,cors and limit to data req,res
app.use(express.urlencoded({limit:'50mb',extended:true}));
app.use(express.json({limit:'50mb'}));
app.use(cors());


// set all the access settings
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-headers","Origin, X-Requested-Width, Content-type, Accept, Authorization");
    if(req.method === 'OPTIONS'){
        res.header("Access-Control-Allow-Methods","PUT, PATCH, GET, DELETE, POST");
        return res.status(200).json({});
    }
    next();
});

// use all the routes
app.use('/user',userRoute);
app.use('/topic',topicRoute);
app.use('/post',postRoute);
app.use('/series',seriesRoute);
app.use('/like-comment',commRoute);

// api redirect index.html 
// app.use(express.static(path.join(__dirname,'public')));

// app.get('*',(req,res)=>{ 
//     res.sendFile(path.join(__dirname,'public/index.html'));
// });

app.use((req,res,next)=>{
    res.status(404);
    return res.json({ 
        message:"Not found in routes"
    });
});

app.use((err,req,res,next)=>{
    res.status(err.status || 500);
    res.json({
        error:{
            message: err.message
        }
    });
});

app.listen(3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

module.exports = app;
