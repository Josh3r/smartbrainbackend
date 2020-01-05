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

app.listen(process.env.PORT || 3000,()=>{
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
    db('users').returning('*')
    .then(users=>{
        res.json("Running fine!");
        //console.log("Does this work?:");
        //console.log(users);
        //res.json(users); , PS: It works ;)
    })
    //console.log(":)");
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
  const {email,password} = req.body; //Destructure!
  db('login').returning('email','hash')
  //.select('email','hash')
  //.from('login')
  .where({email:email,})
  .then(data=>{
      const correctPassword = bcrypt.compareSync(password,data[0].hash);
      console.log(data);
      if (correctPassword){
        db('users').returning('*').where({email:email})
        .then(userReturned=>{
            res.json(userReturned[0])
        })
      }else{
          res.status(400).json('Wrong password and/or email :<');
      }
  })
    });

// Register endpoint:

app.post('/register',(req,res)=>{
    const {email,name, password} = req.body; // Destructuring
    const hash = bcrypt.hashSync(password);
    db.transaction(trx=>{
        trx('login').insert({
            hash:hash,
            email:email
        })
        .returning('email') // Return values of email column
        .then(loginEmail=>{
            return trx('users')
            .insert({
                email: loginEmail[0], // Recall, since we return an array, we use [0] to get just what we want
                name: name,
                joined: new Date()
            })
            .returning('*') // Selecting all values of the 
            .then(user=>{
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {
        res.status(400).json("Unable to register you :<");
    })
})
//NOTE: ALWAYS need to send a res


// profile/:id endpoint 

app.get('/profile/:id',(req,res)=>{
    const {id} = req.params;
    db.select('*').from('users').where({id:id})
    .then(user=>{
        console.log(user);
        if (user.length){ // If user array is not empty
            res.json(user)[0];
        }else{
            res.status(400).json('User not found >:(');
        }
    })
})

// image endpoint

app.put('/image',(req,res)=>{
    const {id} = req.body;
    db('users').where('id','=',id)
    .increment('entries',1)
    .returning('entries')
    .then(entries=>{
        res.json(entries[0]);
    })
    .catch(error=>{
        res.status(400).json('Error! >:(');
    })
})