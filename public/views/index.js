let currentQuestion = 0;
let questionData = {}; //raccoglitore di variabili e dati vari
let currentPoints = 0;
let playerName;
let gameTime;
let ranked = false;
let sound = true;

//EASTER EGG ZAP
function playAudioZap() {
  let trackZap = new Audio('../resources/sounds/zap.wav');
  trackZap.play();
  trackZap.volume = 0.2;
}

//SUONI GIUSTO/SBAGLIATO sulle riposte, chiamata ad ogni "checkAnswerAndContinue".
function correctSound() {
  if (sound) {
    let cSound = new Audio('../resources/sounds/game-sound-correct.wav');
    cSound.play()
    cSound.volume = 0.2;
  }
}

function wrongSound() {
  if (sound) {
    let wSound = new Audio('../resources/sounds/game-sound-wrong.mp3');
    wSound.play()
    wSound.volume = 0.3;
  }
}

//COLONNA SONORA
let track = new Audio;
function playAudio() {
  if (sound) {
    track = new Audio('../resources/sounds/game-startgame.ogg');
    track.play();
    track.volume = .2;
  }
  setTimeout(() => {
    track = new Audio('../resources/sounds/game-soundtrack.ogg');
    track.volume = .2;
    track.loop = true;
    if (sound) {
      track.play();
    }
  }, 3000);
}

//CONTROLLI AUDIO
function audioControls() {
  if (sound) {
    track.pause();
    sound = false;
    document.getElementById("audioIcon").classList.replace('audioIconOn', 'audioIconOff');
  } else {
    track.play();
    sound = true;
    document.getElementById("audioIcon").classList.replace('audioIconOff', 'audioIconOn');
  }
}

// Controlla se è presente il cookie con il nome del giocatore
function getNameFromCookies() {
  if (Cookies.get("player") === undefined) {
    document.getElementById("inputNameWrapper").classList.toggle('d-none');
    console.log("Non ho i cookies");
  } else {
    playerName = Cookies.get("player");
    displayPlayerName(playerName);
    console.log("Ho i cookies")
  }
}

//Controllo input nome del giocatore
function controlInputName() {
  let input = document.getElementById("inputName").value;
  if (Cookies.get("player") === undefined) {
    if (!input.replace(/\s/g, '').length) {
      alert('not a valid name, replaced with anonymous');
      playerName = "Anonymous";
    } else {
      playerName = input;
    }
  }
}

// CRONOMETRO
let currentTime;
let startCounter;
let idTimeout;
function formatTime(s) {
  return (
    Math.floor((s % 3600) / 60) +
    ":" +
    Math.floor((s % 3600) % 60)
  );
}
function upDateTime() {
  var dif = Date.now() - startCounter;
  dif = Math.round(dif / 1000);
  currentTime = formatTime(dif);
  timer.innerText = currentTime;
  gameTime = JSON.stringify(currentTime);
  idTimeout = setTimeout(upDateTime, 1000);
}
function startChronometer() {
  startCounter = Date.now();
  upDateTime();
}

//Funzione di toggle di alcuni componenti dell'UI
function toggleUi() {
  document.getElementById("optionSelection").classList.toggle('d-none');
  document.getElementById("radiaWrapper").classList.toggle('d-none');
  document.getElementById("buttonWrapper").classList.toggle('d-none');
  document.getElementById("buttonWrapper").classList.toggle('d-flex');
}

//Costructor HTML che richiede lista categoria/id all'API e forma le relative opzioni dentro al form con id "category"
function getCategoryOptions() {
  let categoryArr;
  axios
    .get("https://opentdb.com/api_category.php")
    .then((response) => (categoryArr = response.data.trivia_categories))
    .then(() => console.log(categoryArr))
    .then(() => buildCategoryOptions(categoryArr));
}

function buildCategoryOptions(dataArr) {
  let data = document.getElementById("category");
  data.innerHTML = `<option value="">Any Category</option>`;

  for (let i = 0; i < dataArr.length; i++) {
    data.innerHTML += `<option value=${dataArr[i].id}>${dataArr[i].name}</option>`;
  }
}

//Composizione dell'URL e chiamata all'API con le opzioni come query parameters
function urlComposer() {
  let questionsNbrValue = document.getElementById("questionsNbr").value;
  let categoryValue = document.getElementById("category").value;
  let difficultyValue = document.getElementById("difficulty").value;
  let questionsTypeValue = document.getElementById("questionsType").value;
  let composedUrl = `https://opentdb.com/api.php?amount=${questionsNbrValue}&category=${categoryValue}&difficulty=${difficultyValue}&type=${questionsTypeValue}`;
  let encodedComposedUrl = encodeURIComponent(composedUrl)
  console.log(encodedComposedUrl)
  fetchApiQuestions(encodedComposedUrl);
}

//Chiamata all'API con ricezione delle domande
function fetchApiQuestions(encodedUrl) {
  axios.get(`http://localhost:4001/index/${encodedUrl}`).then((response) => {
    console.log("Questo è response di fetchApiQuestions")
    console.log(response)
    if (response.data.success === false) {
      alert(response.data.message)
      return
    }
    questionData.questions = response.data.payload;
    console.log(response)
    renderQuestions()
  });
}

//Render sul DOM delle domande e trigger di varie funzionalità
function renderQuestions() {
  questionBuilder(questionData.questions);
  if (ranked == false) {
    toggleUi()
  }
  createRecapList();
  playAudio();
  startChronometer();
}

//Creazione della tabella di riepilogo in funzione del n° di domande
function createRecapList() {
  currentQuestion = 0;
  document.getElementById("recapList").innerHTML = ""; //svuota il Div ogni iterazione
  let recapList = document.createElement("ul");
  recapList.setAttribute(
    "class",
    "list-group list-group-horizontal justify-content-center p-4"
  );
  recapList.style = "flex-wrap: wrap";
  for (let i = 0; i < questionData.questions.length; i++) {
    recapList.innerHTML += `<li class="list-group-item">${i + 1}</li>`;
  }
  document.getElementById("recapList").appendChild(recapList);
}

//Creazione dei Radio contententi le risposte
function questionBuilder(questionArr) {
  questionData.questionText = questionArr[currentQuestion].question;
  questionData.correctAnswer = questionArr[currentQuestion].correct_answer;
  questionData.wrongAnswers = questionArr[currentQuestion].incorrect_answers;
  console.log("questionBuilder sta andando");
  let possibleAnswers = questionData.wrongAnswers.concat(
    questionData.correctAnswer
  );
  shuffle(possibleAnswers);

  document.getElementById("question").innerHTML = questionData.questionText;

  let container = document.getElementById("radiaContainer");
  container.innerHTML = "";
  for (let i = 0; i < possibleAnswers.length; i++) {
    container.innerHTML += `
  <div class="form-check">
  <input type="radio" id="answer${i}" class="radioInput" name="triviaAnswers"   value="${possibleAnswers[i]}">
  <label for="answer${i}" id="answer${i}label">${possibleAnswers[i]}</label>
  </div>`;
  }
}

//Funzione di shuffle per nascondere risposta giusta (sempre la prima dall'array dell'API)
function shuffle(arra1) {
  let ctr = arra1.length;
  let temp;
  let index;

  while (ctr > 0) {
    index = Math.floor(Math.random() * ctr);
    ctr--;
    temp = arra1[ctr];
    arra1[ctr] = arra1[index];
    arra1[index] = temp;
  }
  return arra1;
}

// Cerca il Radio(risposta) selezionato e ne prende il valore
function getRadioVal() {
  let selectedRadioValue;
  let radiosArr = document.getElementsByClassName("radioInput");

  for (let i = 0; i < radiosArr.length; i++) {
    if (radiosArr[i].checked) {
      console.log("getRadioVal sta lavorando");
      selectedRadioValue = document.getElementById(`answer${i}label`).innerText;
      break;
    }
  }
  return selectedRadioValue; // returna il valore del radio "checked" o undefined nel caso non lo fosse nessuno
}

//Se risposta giusta aumenta punteggio di 2, altrimenti -1. Cambia colore tabella riepilogo. Aumenta contatore domanda e carica nuova domanda. Se domande esaurite finisce gioco.
function checkAnswerAndContinue(inputString) {
  let selectedRecapListCell = document
    .getElementById("recapList")
    .getElementsByTagName("ul")[0]
    .getElementsByTagName("li")[currentQuestion];

  if (inputString == questionData.correctAnswer) {
    currentPoints += 2;
    correctSound();
    selectedRecapListCell.setAttribute("style", "background-color: #43BC77;");
  } else if (inputString == "skip") {
    selectedRecapListCell.setAttribute("style", "background-color: #ffef5a;");
  } else {
    currentPoints--;
    wrongSound();
    selectedRecapListCell.setAttribute("style", "background-color: #ff3333;");
  }

  if (currentQuestion == questionData.questions.length - 1) {
    alert(
      `domande finite con punteggio ${currentPoints}. Necessario redirect a pagina esterna o costruzione di elemento html nuovo ${gameTime}`
    );
    Cookies.set("player", playerName)
    postPlayerData(playerName, currentPoints, ranked, gameTime);
    /* window.location.href = `https://trivialapp-043f.restdb.io/views/results` */

  } else {
    currentQuestion++;
    questionBuilder(questionData.questions);
    console.log(currentPoints);
  }
}

//Chiamata POST al backend a fine partita
function postPlayerData(playerName, score, ranked, gameTime) {
  axios({
    method: 'post',
    url: 'http://localhost:4001/index',
    data: {
      "playerName": playerName,
      "results": score,
      "ranked": ranked,
      "gameTime": gameTime
    }
  });
  window.location.href = `/results`
}

//FUNZIONE BENVENUTO
function displayPlayerName(name) {
  document.getElementById("loggedPlayer").innerHTML = `<h4>Logged in as: ${name}</h4>`;
}

//Event Listener BOTTONI-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|

//Bottone Controllo Audio
document.getElementById("audioControls").addEventListener("click", () => audioControls());

//Bottone conferma risposta
document.getElementById("confirm").addEventListener("click", () => {
  checkAnswerAndContinue(getRadioVal());
});

//Bottone Get Started
document
  .getElementById("urlComposer")
  .addEventListener("click", () => {
    urlComposer()
  });

//Bottone salta domanda
document.getElementById("skip").addEventListener("click", () => {
  checkAnswerAndContinue("skip");
});

//Bottone invio nome
document.getElementById("confirmName").addEventListener("click", () => {
  document.getElementById("formName").classList.toggle('d-none');
  document.getElementById("formName").classList.toggle('d-flex');
  document.getElementById("optionSelection").classList.toggle('d-none');
  controlInputName()
  console.log(playerName)
  displayPlayerName(playerName);
});

//Bottone invio nome Ranked
document.getElementById("confirmNameRanked").addEventListener("click", () => {
  document.getElementById("formName").classList.toggle('d-none');
  document.getElementById("formName").classList.toggle('d-flex');
  document.getElementById("radiaWrapper").classList.toggle('d-none');
  document.getElementById("buttonWrapper").classList.toggle('d-none');
  document.getElementById("buttonWrapper").classList.toggle('d-flex');
  controlInputName()
  ranked = true;
  let composedUrl = `https://opentdb.com/api.php?amount=10&difficulty=hard`;
  let encodedComposedUrl = encodeURIComponent(composedUrl)
  fetchApiQuestions(encodedComposedUrl);
  displayPlayerName(playerName);
})

//Chiamata delle funzioni a caricamento pagina
getCategoryOptions();
getNameFromCookies();