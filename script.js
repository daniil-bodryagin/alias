const app = {
	roundDuration: 90,
	remainingTime: 90,
	score: 0,
	words: null,
	currentWordData: null,
	playedWords: [],
	
	async init(){
		const response = await fetch('oxford.json');
		if (response.ok){
			app.words = await response.json();
			app.showStartScreen();
		} else {
			console.log("HTTP Error: " + response.status);
		}
	},
	
	showStartScreen() {
		document.body.innerHTML = '';
		document.body.insertAdjacentHTML('afterbegin', `
			<main>
				<div class="content">
					<p>Are you ready for the next round?</p>
				</div>
				<div class="button-container">
					<button id="start" type="button">Start!</button>
				</div>
			</main>
		`);
		const startButton = document.querySelector('#start');
		startButton.onclick = app.showPlayScreen;
	},
	
	showPlayScreen(){
		document.body.innerHTML = '';
		document.body.insertAdjacentHTML('afterbegin', `
			<main>
				<div class="statusbar">
					<div class="indicator">
						<span>Time: </span>
						<span id="time-indicator">${app.remainingTime}</span>
					</div>
					<div class="indicator">
						<span>Score: </span>
						<span id="score-indicator">${app.score}</span>
					</div>
					<div id="quit-button" class="quit">×</div>
				</div>
				<div id="word-container" class="content"></div>
				<div class="button-container">
					<button id="success" type="button">Next</button>
					<button id="fail" class="fail" type="button">Skip</button>
				</div>
			</main>
		`);
		const timeIndicator = document.querySelector('#time-indicator');
		const scoreIndicator = document.querySelector('#score-indicator');
		const quitButton = document.querySelector('#quit-button');
		const wordContainer = document.querySelector('#word-container');
		const successButton = document.querySelector('#success');
		const failButton = document.querySelector('#fail');
		let finalCallback = () => app.showWord(wordContainer);
		const buttonHandler = (success) => {
			app.logWord(success);
			if (success) app.incrementScore(scoreIndicator);
			finalCallback();
		};
		const changeButtons = () => {
			successButton.innerText = 'Finish';
			finalCallback = app.showFinalScreen;
		}
		successButton.onclick = () => buttonHandler(true);
		failButton.onclick = () => buttonHandler(false);
		const timer = setInterval(() => {app.incrementTimer(changeButtons, timeIndicator, timer)}, 1000);
		quitButton.onclick = () => {
			app.logWord(false);
			clearInterval(timer);
			app.showFinalScreen();
		};
		app.showWord(wordContainer);
	},

	incrementScore(scoreIndicator){
		app.score++;
		scoreIndicator.innerText = app.score;
	},
	
	incrementTimer(changeButtons, timeIndicator, timer){
		app.remainingTime--;
		timeIndicator.innerText = app.remainingTime;
		if (app.remainingTime < 1) {
			clearInterval(timer);
			changeButtons();
		}
	},
	
	logWord(success){
		app.playedWords.push({
			word: app.currentWordData.word,
			success
		});
	},
	
	showWord(root){
		const wordIndex = Math.floor(Math.random() * Object.keys(app.words).length);
		app.currentWordData = app.words[wordIndex];
		
		root.innerHTML = '';
		root.insertAdjacentHTML('beforeend',`
			<p class="word">${app.currentWordData.word}</p>
			<ul id="translations"></ul>
		`);
		const translations = root.querySelector('#translations');
		app.currentWordData.translates.forEach(translation => {
			translations.insertAdjacentHTML('beforeend', `
				<li class="translation">${translation}</li>
			`);
		});
	},
	
	showFinalScreen(){
		document.body.innerHTML= '';
		document.body.insertAdjacentHTML('afterbegin', `
			<main>
				<div class="statusbar">
					<div class="indicator">
						<span>Score: </span>
						<span>${app.score}</span>
					</div>
				</div>
				<div class="content">
					<ul id="played-word-list"></ul>
				</div>
				<div class="button-container">
					<button id="restart" type="button">Restart!</button>
				</div>
			</main>
		`);
		const playedWordList = document.querySelector('#played-word-list');
		const restartButton = document.querySelector('#restart');
		restartButton.onclick = app.showStartScreen;
		app.playedWords.forEach(wordData => {
			playedWordList.insertAdjacentHTML('beforeend', `
				<li class="played-word${wordData.success ? '' : ' fail'}">${wordData.word}</li>
			`);
		});
		app.reset();
	},
	
	reset() {
		app.currentWordData = null;
		app.playedWords.length = 0;
		app.score = 0;
		app.remainingTime = app.roundDuration;
	}	
}

window.onload = app.init;
