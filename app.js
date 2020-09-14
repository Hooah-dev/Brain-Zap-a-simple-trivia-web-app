const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const port = 4001

const bodyParser = require('body-parser');

const axios = require('axios')

const cors = require('cors');

// MIDDLEWARES
app.use(cors());
app.use(bodyParser.json());
const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connected to Mongo-DB'))
  .catch((err) => console.error(err));

app.use(express.static('public'));

// API ROUTES
app.get('/', (req, res) => {
  res.redirect('/index')
})

app.get('/index', (req, res) => {
  res.status(200).sendFile(__dirname + '/public/views/index.html')
})

app.get('/index/:apiUrl', async (req, res) => {

  let apiUrl = req.params.apiUrl

  try {
    const fetchQuestionData = await axios.get(apiUrl)
    if (fetchQuestionData.data.response_code >= 1) {
      const errorMessages = {
        1: "Could not return results. The API doesn't have enough questions for your query",
        2: "Contains an invalid parameter. Arguements passed in aren't valid.",
        3: "Session Token does not exist.",
        4: "Session Token has returned all possible questions for the specified query. Resetting the Token is necessary."
      }
      res.status(200).json({ success: false, message: errorMessages[fetchQuestionData.data.response_code] })
      return
    }
    res.status(200).json({ success: true, message: "Questions retrieved correctly", payload: fetchQuestionData.data.results })
  } catch {(err) => res.status(400).json({succes:false, message: err });}
})

app.post('/index', async (req, res) => {
  console.log(req.body)
  let playerData = req.body
  axios.post('https://trivialapp-043f.restdb.io/rest/punteggio-giocatori', playerData, 
  { headers: 
    { "x-apikey": "5f046bd8a529a1752c476e5d",
     "content-type": "application/json",
      "cache-control": "no-cache" 
    } 
  })
    .catch(function (error) {
      console.log(error);
    });
})

app.get('/results', (req, res) => {
  res.status(200).sendFile(__dirname + '/public/views/results.html')
})

app.get('/results/completeLeaderboard', (req, res) => {
  let playersData;
  axios
    .get('https://trivialapp-043f.restdb.io/rest/punteggio-giocatori', 
    { headers: 
      { "x-apikey": "5f046bd8a529a1752c476e5d",
       "content-type": "application/json", 
       "cache-control": "no-cache" 
      } 
    })
    .then((response) => (playersData = response.data))
    .then(() => res.status(200).json({ success: true, message: "succesfully retrieved Players Data", payload: playersData }))
    .catch((err) => res.status(400).json({ success: false, message: err}))
})

app.get('/results/rankedLeaderboard', (req, res) => {
  let rankedPlayersData;
  axios
    .get('https://trivialapp-043f.restdb.io/rest/punteggio-giocatori?q={%22ranked%22:true}&h={%22$orderby%22:%20{%22results%22:%20-1}}', { headers: { "x-apikey": "5f046bd8a529a1752c476e5d", "content-type": "application/json", "cache-control": "no-cache" } })
    .then((response) => (rankedPlayersData = response.data))
    .then(() => res.status(200).json({ success: true, message: "succesfully retrieved Players Data", payload: rankedPlayersData }))
    .catch((err) => res.status(400).json({ success: false, message: err}))
})

app.listen(port, () => console.log(`app listening on port ${port}`));