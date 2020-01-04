const express  = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex') // We use knex to connect to our DB and write sql queries.

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'josher',
      database : 'smartbraindb'
    }
  });

(db.select('*').from('users')).then(data => {
    console.log(data);
})


const app = express();

app.listen(3000,()=>{
    console.log('running!');
})
app.use(cors());
// Parsing json so we can understand json req
app.use(express.json()) // We use app.use() middleware


/* 
'/' -> res  = this is working
'/signin' -> POST = success/fail
'/register' -> POST = return newly createduser object
'/profile/:userid' -> GET = return user //Note optional userid param
'/image' -> PUT = return updated user object
*/

// Index endpoint
app.get('/',(req,res)=>{
    res.send(database.users);
    console.log(":)");
})

// Sign In endpoint:

// Temp database, remember to comment out
const database = {
    users: [
        {
            id: '123',
            name: 'Josher',
            email: 'jyeoyi@gmail.com',
            password: 'Mahalo',
            entries: 0,
            joined: new Date()
        },
        {
            id: '21',
            name: 'ZhaoYi', 
            email: 'tesh@yahoo.com.sg',
            password: 'barmitzvah',
            entries: 21,
            joined: new Date()
        }
    ],
    login: [
        {
            id: '987',
            hash: '',
            email: 'mwod@gmail.com'
        }
    ]
}





app.post('/signin',(req,res)=>{
   // res.json('signing in');//Equivalent to res.send() but using JSON
   console.log(req.body.toString());
   // Load hash from your password DB.
   /*
    bcrypt.compare("password", "$2a$10$N1fTm55IwPUTWasCVvaaSuQ9ya.e3ChN63b4UKm9F5CitSMExwRsS", function(err, res) {
        console.log("It is:"+res)
    });
    bcrypt.compare("notpassword", "$2a$10$N1fTm55IwPUTWasCVvaaSuQ9ya.e3ChN63b4UKm9F5CitSMExwRsS", function(err, res) {
        console.log("It is"+res);
    });  */
    let thisUser = null;
    database.users.forEach((user)=>{
        console.log(user);
        if(req.body.email === user.email && 
            req.body.password === user.password){
                thisUser = res.json(user);
                //Return is used to stop from sending multiple res
        }
    })
        if(thisUser!==null){
            return res.json(thisUser);
        }else{
            return res.status(400).json('Sorry, please try again');
        }
    });

// Register endpoint:

app.post('/register',(req,res)=>{
    const {password} = req.body.password; // Destructuring
    const user = {
        id: req.body.id,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        entries: 0,
        joined: new Date()
    }
    try{
        bcrypt.hash(password, null, null, function(err, hash) {
            console.log(hash);
            database.users.push(user);
            console.log(database.users);
        });
    } catch(err){
        res.status(400).json("Error!");
    }
    res.json(database.users[database.users.length-1]);
//NOTE: ALWAYS need to send a res
})

// profile/:id endpoint 

app.get('/profile/:id',(req,res)=>{
    const {id} = req.params;
    database.users.forEach((user)=>{
        if(id === user.id){
            res.json(user);
        }
    })
    res.json("User not found :(");
})

// image endpoint

app.put('/image',(req,res)=>{
    const {id} = req.body;
    let userFound = false;
    database.users.forEach((user)=>{
        if(user.id===id){
            user.entries++;
            userFound = user;
        }})
    if(userFound===false){
        console.log(req.body);
        res.json("There was an error :<");
    }else{
        res.json(userFound.entries);
    }
})