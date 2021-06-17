const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
var fileupload = require('express-fileupload');
var admin = require('firebase-admin');
const ObjectID = require('mongodb').ObjectID;
const fse = require('fs-extra');

var admin = require('firebase-admin');

var serviceAccount = require('./atomosph-firebase-adminsdk-7mmq0-be97cbdd0b.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('Images'));
app.use(fileupload());




const uri =
  'mongodb+srv://blackcoffer:Password123@cluster0.zdqse.mongodb.net/Atom?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const innovationCollection = client.db('Atom').collection('innovation');
  // Real all innovation from server
  app.get('/innovations', (req, res) => {
      innovationCollection.find({}).toArray((err, documents) => {
        res.send(documents);
      });
    console.log('ace');
  });

  // Insert into Database
  app.post('/insertInnovation/:uid', (req, res) => {
    
    const idToken = req.params.uid
    if (idToken !== undefined) {
   
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const uid = decodedToken.uid;
          console.log({ uid });
          const profileImage = req.files.image;
          const profileImageName = req.files.image.name;
          const userInfo = req.body;
          const filePath = `${__dirname}/image/${profileImageName}`;
          profileImage.mv(filePath, (err) => {
            if (err) {
              console.log(err);
              return res
                .status(500)
                .send({ msg: 'failed to update profile image' });
            }
            const newImage = fse.readFileSync(filePath);
            const encode = newImage.toString('base64');
            var imageForDB = {
              imgB: Buffer(encode, 'base64'),
            };
            innovationCollection
              .insertOne({ userInfo, imageForDB })
              .then((result) => {
                fse.remove(filePath);
                res.send(result);
              });
          });
        })
        .catch((error) => {
          // Handle error
        });
    }
  });

  //update

  app.patch('/updateInnovation/:uid', (req, res) => {
    const id = ObjectID(req.params.uid);
    const Bearer = req.headers.authorization;
    innovationCollection
      .updateOne(
        { _id: id },
        {
          $set: {
            'userInfo.headLine': req.body.headLine,
            'userInfo.description': req.body.description,
          },
        }
      )
      .then((result) => {
        res.send(result);
        console.log(result);
      });
  });

  //Delete item
  app.delete('/DeleteInnovation/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    innovationCollection.deleteOne({ _id: id }).then((result) => {
      res.send(result);
    });
  });
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port);
