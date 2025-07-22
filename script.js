const app = {
	roundDuration: 90,
	remainingTime: 90,
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
		document.body.innerHTML= '';
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
		document.body.innerHTML= '';
		document.body.insertAdjacentHTML('afterbegin', `
			<main>
				<div class="statusbar">
					<div class="timer">
						<span>Time: </span>
						<span id="time-indicator">${app.remainingTime}</span>
					</div>
				</div>
				<div id="word-container" class="content"></div>
				<div class="button-container">
					<button id="success" type="button">Next</button>
					<button id="fail" class="fail" type="button">Skip</button>
				</div>
			</main>
		`);
		const timeIndicator = document.querySelector('#time-indicator');
		const wordContainer = document.querySelector('#word-container');
		const successButton = document.querySelector('#success');
		const failButton = document.querySelector('#fail');
		successButton.onclick = () => {
			app.logWord(true);
			app.showWord(wordContainer);
		};
		failButton.onclick = () => {
			app.logWord(false);
			app.showWord(wordContainer);
		};
		const timer = setInterval(() => {app.incrementTimer(successButton, failButton, timeIndicator, timer)}, 1000);
		app.showWord(wordContainer);
	},
	
	incrementTimer(successButton, failButton, timeIndicator, timer){
		app.remainingTime--;
		timeIndicator.innerText = app.remainingTime;
		if (app.remainingTime < 1) {
			clearInterval(timer);
			app.changeButtons(successButton, failButton);
		}
	},
	
	changeButtons(successButton, failButton){
		successButton.innerText = 'Finish';
		successButton.onclick = () => {
			app.logWord(true);
			app.showFinalScreen();
		};
		failButton.onclick = () => {
			app.logWord(false);
			app.showFinalScreen();
		};
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
		app.remainingTime = app.roundDuration;
	}	
}

window.onload = app.init;
