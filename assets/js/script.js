/**
 * ASTRO VOID
 * @auteur : Olivier Châteauvert
 */

// Variables globales
const sTitre = "ASTRO VOID";
const touches = {};

let indexTitre = 0;
let bEnJeu = false;
let bPersonnageDeplace = false;
let iRotAsteroide = 0;
let aAsteroides = [];
let bGameOver = false;
let iScore = 0;
let iBestScore = localStorage.getItem("bestScore") || 0;
let dernierTemps = performance.now();

// Objet représentant le personnage
const oPersonnage = {
  srcImage: "assets/img/player/image-spaceship.png",
  posX: 75,
  posY: 0,
  rot: 0,
  largeur: 75,
  hauteur: 90,
  multiplicateurVitesse: 0,
};

// Objet représentant l'arrière-plan
const oArrierePlan = {
  posX: 0,
  multiplicateurVitesse: 4,
};

// Sélection des éléments HTML
const oTitreHTML = document.querySelector("#titre");
const oLogoHTML = document.querySelector("#image-logo");
const oSectionMenuHTML = document.querySelector("#menu");
const oSliderSensitivityHTML = document.querySelector(".slider");
const oTextSensitivityHTML = document.querySelector("#sensitivity-text");
const oSectionJeuHTML = document.querySelector("#jeu");
const oSectionTouchesHTML = document.querySelector("#controls");
const oSectionGameoverHTML = document.querySelector("#gameover");
const oCanvasHTML = document.querySelector("#canvas");
const oContexteHTML = oCanvasHTML.getContext("2d");
const oCurrentScoreHTML = document.querySelector(".currentscore");
const oCurrentSpeedHTML = document.querySelector(".currentspeed");
const oScoreGameoverHTML = document.querySelector("#gameoverscore");
const oBestScoreHTML = document.querySelector("#bestscore");

// Médias
const oAudioMusique = new Audio("assets/audio/background_music.mp3");
const oAudioExplosion = new Audio("assets/audio/dead.wav");
const oAudioGameover = new Audio("assets/audio/gameover.wav");
const oImageArrierePlan = new Image();
oImageArrierePlan.src = "assets/img/background/sky_background.svg";
const oImagePersonnage = new Image();
oImagePersonnage.src = oPersonnage.srcImage;

// Fonctions

// - Initialisation
function initialisation() {
  oPersonnage.multiplicateurVitesse = oSliderSensitivityHTML.value * 3;
  oTextSensitivityHTML.textContent = `Sensibilité: ${oSliderSensitivityHTML.value}`;
  oSliderSensitivityHTML.addEventListener("input", () => {
    oPersonnage.multiplicateurVitesse = oSliderSensitivityHTML.value * 3;
    oTextSensitivityHTML.textContent = `Sensibilité: ${oSliderSensitivityHTML.value}`;
    const oAudioType = new Audio("assets/audio/type.wav");
    oAudioType.play();
  });
  oBestScoreHTML.textContent = `Meilleur score: ${iBestScore} points`;
  gameLoop();
}

// - Boucle principale du jeu
function gameLoop() {
  const tempsActuel = performance.now();
  const deltaTime = (tempsActuel - dernierTemps) / 1000;
  dernierTemps = tempsActuel;

  if (!bEnJeu) {
    animationMenu();
  } else {
    detecterCollisionAsteroide();
    gererInput(deltaTime);
    mettreAJourCanvas(deltaTime);
    updateValeurs();

    oArrierePlan.multiplicateurVitesse += 0.3 * deltaTime;
  }

  requestAnimationFrame(gameLoop);
}

// - Animation du menu principal
function animationMenu() {
  iRotAsteroide += 0.5;
  oLogoHTML.style.transform = `rotate(${iRotAsteroide}deg)`;
}

//Bouton Start
function boutonStart() {
  boutonStart = function () {};
  afficherTitre();
}

// - Affichage progressif du titre
function afficherTitre() {
  if (indexTitre < sTitre.length) {
    oLogoHTML.classList.add("invisible");
    oTitreHTML.textContent += sTitre[indexTitre];
    indexTitre++;
    const oAudioType = new Audio("assets/audio/type.wav");
    oAudioType.play();
    setTimeout(afficherTitre, 130);
  } else {
    oSectionMenuHTML.classList.add("invisible");
    demarrerJeu();
  }
}

// - Ouvrir section touches
function openTouches() {
  const oAudioType = new Audio("assets/audio/type.wav");
  oAudioType.play();
  oSectionMenuHTML.classList.add("invisible");
  oSectionTouchesHTML.classList.remove("invisible");
}

// - Fermer section touches
function closeTouches() {
  const oAudioType = new Audio("assets/audio/type.wav");
  oAudioType.play();
  oSectionTouchesHTML.classList.add("invisible");
  oSectionMenuHTML.classList.remove("invisible");
}

// - Effacer le canvas
function effacerCanvas() {
  oContexteHTML.clearRect(0, 0, oCanvasHTML.width, oCanvasHTML.height);
}

// - Mise à jour du canvas
function mettreAJourCanvas(deltaTime) {
  oCanvasHTML.width = oSectionJeuHTML.clientWidth;
  oCanvasHTML.height = oSectionJeuHTML.clientHeight - 70;

  effacerCanvas();

  dessinerArrierePlan(deltaTime);

  dessinerPersonnage();
  dessinerEnnemi(deltaTime);
}

// - Dessiner le personnage avec rotation
function dessinerPersonnage() {
  if (bGameOver == false) {
    const centreX = oPersonnage.posX + oPersonnage.largeur / 2;
    const centreY = oPersonnage.posY + oPersonnage.hauteur / 2;

    oContexteHTML.save();

    oContexteHTML.translate(centreX, centreY);

    oContexteHTML.rotate((oPersonnage.rot * Math.PI) / 180);

    oContexteHTML.drawImage(
      oImagePersonnage,
      -oPersonnage.largeur / 2,
      -oPersonnage.hauteur / 2,
      oPersonnage.largeur,
      oPersonnage.hauteur
    );

    oContexteHTML.restore();
  }
}

// - Mise à jour des valeurs du UI
function updateValeurs() {
  let iSpeed = Math.floor(oArrierePlan.multiplicateurVitesse / 2);
  oCurrentSpeedHTML.textContent = `Vitesse≈ ${iSpeed} KM/s`;
}

// - Gérer les entrées clavier
function gererInput(deltaTime) {
  const vitesse = oPersonnage.multiplicateurVitesse * deltaTime * 100;
  if (touches["ArrowUp"] || touches["w"]) {
    oPersonnage.posY = Math.max(oPersonnage.posY - vitesse, 0);
    oPersonnage.rot = -10;
    bPersonnageDeplace = true;
  }
  if (touches["ArrowDown"] || touches["s"]) {
    oPersonnage.posY = Math.min(
      oPersonnage.posY + vitesse,
      oSectionJeuHTML.clientHeight - 70 - oPersonnage.hauteur
    );
    oPersonnage.rot = 10;
    bPersonnageDeplace = true;
  }
}

// - Obtenir une valeur random entre deux nombres
function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

// - Système du spawn astéroïdes
function spawnEnnemi() {
  creerEnnemi();
  setTimeout(spawnEnnemi, randomInRange(500, 900));
}

// - Créer astéroïdes
function creerEnnemi() {
  let oAsteroideImage = new Image();
  oAsteroideImage.src = "assets/img/asteroide/image-asteroide.svg";

  let facteurTaille = Math.random() * (1 - 0.5) + 0.5;
  let tailleMax = 80;
  let tailleAsteroide = tailleMax * facteurTaille;

  let spawnY = randomInRange(
    tailleAsteroide / 2,
    oSectionJeuHTML.clientHeight - tailleAsteroide - 70
  );
  let spawnX = oSectionJeuHTML.clientWidth;

  const oAsteroide = {
    image: oAsteroideImage,
    posX: spawnX,
    posY: spawnY,
    largeur: tailleAsteroide,
    hauteur: tailleAsteroide,
    rotation: Math.random() * 360,
    vitesseRotation: Math.random() + 0.5,
  };
  aAsteroides.push(oAsteroide);
}

// - Dessiner arriere plan
function dessinerArrierePlan(deltaTime) {

  oArrierePlan.posX -= oArrierePlan.multiplicateurVitesse * deltaTime * 150;

  if (oArrierePlan.posX <= -oCanvasHTML.width) {
    oArrierePlan.posX = 0;
  }

  oContexteHTML.drawImage(
    oImageArrierePlan,
    oArrierePlan.posX,
    0,
    oCanvasHTML.width,
    oCanvasHTML.height
  );
  oContexteHTML.drawImage(
    oImageArrierePlan,
    oArrierePlan.posX + oCanvasHTML.width,
    0,
    oCanvasHTML.width,
    oCanvasHTML.height
  );
}

// - Dessiner les astéroïdes avec rotation
function dessinerEnnemi(deltaTime) {
  for (let i = 0; i < aAsteroides.length; i++) {
    let oCurrentAsteroide = aAsteroides[i];

    oContexteHTML.save();
    oContexteHTML.translate(
      oCurrentAsteroide.posX + oCurrentAsteroide.largeur / 2,
      oCurrentAsteroide.posY + oCurrentAsteroide.hauteur / 2
    );
    if (!bGameOver) {
      oContexteHTML.rotate((oCurrentAsteroide.rotation * Math.PI) / 180);
    }

    oContexteHTML.drawImage(
      oCurrentAsteroide.image,
      -oCurrentAsteroide.largeur / 2,
      -oCurrentAsteroide.hauteur / 2,
      oCurrentAsteroide.largeur,
      oCurrentAsteroide.hauteur
    );
    oContexteHTML.restore();

    oCurrentAsteroide.posX -=
      oArrierePlan.multiplicateurVitesse * deltaTime * 100;

    if (oCurrentAsteroide.posX < -oCurrentAsteroide.largeur) {
      aAsteroides.splice(i, 1);
      i--;
      iScore += 10;
      oCurrentScoreHTML.textContent = `Score: ${iScore} points`;
    }

    oCurrentAsteroide.rotation += oCurrentAsteroide.vitesseRotation;
    if (oCurrentAsteroide.rotation >= 360) {
      oCurrentAsteroide.rotation -= 360;
    }
  }
}

// - Detecter les collisions

function detecterCollision(personnage, ennemi) {
  if (
    oPersonnage.posX < ennemi.posX + ennemi.largeur &&
    oPersonnage.posX + oPersonnage.largeur > ennemi.posX &&
    oPersonnage.posY < ennemi.posY + ennemi.hauteur &&
    oPersonnage.posY + oPersonnage.hauteur > ennemi.posY
  ) {
    return true;
  } else {
    return false;
  }
}

function detecterCollisionAsteroide() {
  for (let i = 0; i < aAsteroides.length; i++) {
    if (detecterCollision(oPersonnage, aAsteroides[i]) == true) {
      finPartie();
      break;
    }
  }
}

// - Fin Partie
function finPartie() {
  finPartie = function () {};
  bGameOver = true;
  oScoreGameoverHTML.textContent = `Score: ${iScore} points`;
  oArrierePlan.multiplicateurVitesse = 0;
  oAudioMusique.pause();
  oAudioExplosion.play();
  if (iScore > iBestScore) {
    iBestScore = iScore;
    localStorage.setItem("bestScore", iBestScore);
  }
  setTimeout(function () {
    oSectionJeuHTML.classList.add("invisible");
    oTitreHTML.classList.add("invisible");
    oSectionGameoverHTML.classList.remove("invisible");
    oAudioGameover.play();
  }, 1000);
}

//Retour menu
function continuerMenu() {
  continuerMenu = function () {};
  const oAudioType = new Audio("assets/audio/type.wav");
  oAudioType.play();
  setTimeout(function () {
    location.reload();
  }, 100);
}

// - Démarrer la partie
function demarrerJeu() {
  oSectionJeuHTML.classList.remove("invisible");
  window.addEventListener("resize", mettreAJourCanvas);

  oAudioMusique.loop = true;
  oAudioMusique.play();

  window.addEventListener("keydown", (event) => {
    touches[event.key] = true;
  });

  window.addEventListener("keyup", (event) => {
    touches[event.key] = false;
    oPersonnage.rot = 0;
  });

  oPersonnage.posY = oSectionJeuHTML.clientHeight / 2 - oPersonnage.hauteur / 2;
  bEnJeu = true;
  spawnEnnemi();
}

// Exécution du code à la fin du chargement de la page
window.addEventListener("load", initialisation);
