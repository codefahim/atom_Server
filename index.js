const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
var fileupload = require('express-fileupload');

const ObjectID = require('mongodb').ObjectID;
const fse = require('fs-extra');

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
  app.post('/insertInnovation', (req, res) => {
    const profileImage = req.files.image;
    const profileImageName = req.files.image.name;
    const userInfo = req.body;
    const filePath = `${__dirname}/image/${profileImageName}`;
    profileImage.mv(filePath);
    const newImage = fse.readFileSync(filePath);
    const encode = newImage.toString('base64');

    var imageForDB = {
      imgB: Buffer(encode, 'base64'),
    };
    innovationCollection.insertOne({ userInfo, imageForDB }).then((result) => {
      fse.remove(filePath);
      res.send(result);
    });
    console.log(req.body);
  });
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port);
