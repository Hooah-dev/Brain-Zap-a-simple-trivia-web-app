//EASTER EGG ZAP
function playAudioZap() {
  let trackZap = new Audio("https://trivialapp-043f.restdb.io/media/5f06d804498ad76800073f5a");
  trackZap.play();
  trackZap.volume = 0.2;
}

//CARD CENTRALE
async function getPlayerData() {
  let arrData;
  await axios
    .get('./results/completeLeaderboard')
    .then((response) => (arrData = response.data.payload))
    .then(()=> console.log(arrData))
  console.log("ciao primo")
  centralCardBuilder(arrData)
}

//CARD SX
async function getRankedScores() {
  let arrData;
  await axios
    .get('./results/rankedLeaderboard')
    .then((response) => (arrData = response.data.payload))
    .then(()=> console.log(arrData))
  console.log("ciao primo")
  tableSxBuilder(arrData)
}

//Trova l'ID più alto (ultimo giocatore) e ne mostra le info
function centralCardBuilder(arr) {
  arr_id = arr.map(element => element.ID);
  let num = arr_id.indexOf(Math.max(...arr_id));
  document.getElementsByClassName("card-title")[0].innerText = arr[num].playerName;
  document.getElementsByClassName("card-text")[0].innerText = `Your final score is ${arr[num].results}`;
  document.getElementById("finalScoreTimer").innerText = `Final Time: ${arr[num].gameTime}`;
}

function tableSxBuilder(arr) {
  let stopNumber = arr.length -1
  for (let i=0; i < 10; i++) {
    if ( stopNumber == i) {
      break
    }
    document.getElementById("tableSxBody").innerHTML += 
            `<tr>
              <th scope="row">${i+1}</th>
              <td>${arr[i].playerName}</td>
              <td>${arr[i].results}</td>
              <td>${arr[i].gameTime}</td>
            </tr>`
  }
}

//CHIAMATA FUNZIONI
getPlayerData();
getRankedScores();