// Start
let startBtn = document.querySelector(".start-btn");
let quizHolder = document.querySelector(".quiz");
startBtn.addEventListener("click", function () {
	startBtn.classList.add("off");
	initializeGame();
});
// Start

// Questions
let curQuestion = 0;
let questions;
let chosenQuestions;
let shuffeledQuestions = [];

let categoryHolder = document.getElementById("category");
let questionHolder = document.querySelector(".question");
let choicesHolders = document.querySelectorAll(".choices li .choice");

/* get Questions from "api" */
fetch("./quiz questions.json")
	.then((data) => data.json())
	.then((data) => {
		questions = data;
		startBtn.classList.remove("off");
		getCategories();
		setCategories();
	})
	.catch(() => {
		let popup = document.createElement("span");
		popup.className = "popup";
		popup.textContent = "Failed To Load Questions !!!";
		quizHolder.appendChild(popup);
	});

function getQuestions() {
	let categories = getChosenCategories();

	let groups = questions.filter((e) => categories.includes(e["category"]));

	let cqas = [];

	for (const category of groups) {
		for (const qna of category["q&a"]) {
			cqas.push([category["category"], ...qna]);
		}
	}

	chosenQuestions = [];

	for (let i = 0; i < 10; i++) {
		let random = cqas.splice(Math.floor(Math.random() * cqas.length), 1);
		chosenQuestions.push(random[0]);
	}
}
function loadQuestion() {
	let question = chosenQuestions[curQuestion];
	categoryHolder.textContent = question[0];
	questionHolder.textContent = question[1];
	let answers = Array.from(question[2]);
	let shuffeledAnswers = [];

	for (let i = 0; i < 4; i++) {
		shuffeledAnswers.push(
			answers.splice(Math.floor(Math.random() * answers.length), 1)[0]
		);
	}
	shuffeledQuestions.push(shuffeledAnswers);
	for (let i = 0; i < 4; i++) {
		choicesHolders[i].textContent = shuffeledAnswers[i];
	}
}
function updateQuestion() {
	curQuestion++;
	loadQuestion();
	nextProgress();
	resetTimer();
}
// Questions

// Filter
let filter = document.querySelector(".filter");
let filterMenu = document.querySelector(".filter-menu");
let categories = [];

filter.addEventListener("click", toggleFilter);

function toggleFilter(e) {
	if (this !== e.target.closest("div")) return;

	filterMenu.classList.toggle("active");
}
function getCategories() {
	for (const cat of questions) {
		categories.push(cat["category"]);
	}
}
function setCategories() {
	for (let i = 0; i < categories.length; i++) {
		let id = "op" + i;

		let label = document.createElement("label");
		label.className = "option";
		label.htmlFor = id;

		let input = document.createElement("input");
		input.type = "checkbox";
		input.id = id;
		input.name = "filter";
		input.checked = "true";

		label.appendChild(input);
		label.append(categories[i]);
		filterMenu.appendChild(label);
	}
}
function getChosenCategories() {
	let chosenCategories = [];

	for (const label of Array.from(filterMenu.children)) {
		if (label.firstElementChild.checked) {
			chosenCategories.push(label.textContent.trim());
		}
	}

	return chosenCategories;
}
// Filter

// choices
let choicesHolder = document.querySelector(".choices");
let choices = document.querySelectorAll(".choices li");

choicesHolder.addEventListener("click", function (e) {
	let choice = e.target.closest("li");

	if (choice === null) return;

	if (choice.classList.contains("chosen")) {
		choice.classList.remove("chosen");
		activeNext(false);
		return;
	}

	for (const c of Array.from(choices)) {
		c.classList.remove("chosen");
	}

	choice.classList.add("chosen");

	activeNext(true);
});
function clearChoices() {
	for (let i = 0; i < 4; i++) {
		if (choices[i].classList.contains("chosen")) {
			choices[i].classList.remove("chosen");
			return i;
		}
	}
}
// choices

// Progress
let progressPoints = document.querySelectorAll(".progress li");

initializeProgress();

function initializeProgress() {
	progressPoints[0].className = "current";
	for (let i = 1; i < progressPoints.length; i++) {
		progressPoints[i].className = "";
	}
}

function nextProgress() {
	progressPoints[curQuestion].className = "current";
	progressPoints[curQuestion - 1].className = "passed";
}
// Progress

// Next
let next = document.querySelector(".next");

function activeNext(isActive) {
	if (isActive) {
		next.classList.add("active");
	} else {
		next.classList.remove("active");
	}
}

next.addEventListener("click", nextHundler);

function nextHundler() {
	if (!next.classList.contains("active")) return;
	answers.push(clearChoices());
	nextQuestion();
}
function nextQuestion() {
	if (curQuestion === 9) {
		submitAnswers();
	} else {
		updateQuestion();
		activeNext(false);
	}
}
// Next

// Result
let answers = [];
let resultHolder = document.querySelector(".result");
let scoreHolder = document.getElementById("score");
let notesHolder = document.getElementById("notes");

function submitAnswers() {
	// stop the timer
	clearInterval(timerId);
	timer.textContent = "??";

	// activate filter
	filter.addEventListener("click", toggleFilter);

	categoryHolder.textContent = "???";

	let score = 0;

	for (let i = 0; i < 10; i++) {
		if (
			answers[i] === -1 ||
			shuffeledQuestions[i][answers[i]] !== chosenQuestions[i][2][0]
		) {
			addNote(i, answers[i]);
		} else {
			score++;
		}
	}

	scoreHolder.textContent = score;
	resultHolder.classList.remove("off");
	quizHolder.classList.add("hide");

	next.textContent = "Reset";
	next.removeEventListener("click", nextHundler);
	next.addEventListener("click", resetHundler);
}
function addNote(i, answer) {
	let choices = ["A-", "B-", "C-", "D-"];

	let wrongAnswer = document.createElement("div");
	wrongAnswer.className = "wrong-answer";

	let wrongQuestion = document.createElement("div");
	wrongQuestion.className = "wrong-question";
	wrongQuestion.textContent = chosenQuestions[i][1];

	wrongAnswer.appendChild(wrongQuestion);
	notesHolder.appendChild(wrongAnswer);

	let answersHolder = document.createElement("div");
	answersHolder.className = "answers";

	let mistake = document.createElement("div");
	mistake.className = "wrong";
	if (answer === -1) {
		mistake.textContent = "Timed Out";
	} else {
		mistake.textContent = `${choices[answer]} ${shuffeledQuestions[i][answer]}`;
	}
	answersHolder.appendChild(mistake);

	let rightAnswer = document.createElement("div");
	rightAnswer.className = "right";
	let rAIndex = shuffeledQuestions[i].indexOf(chosenQuestions[i][2][0]);
	rightAnswer.textContent = `${choices[rAIndex]} ${shuffeledQuestions[i][rAIndex]}`;
	answersHolder.appendChild(rightAnswer);

	wrongAnswer.appendChild(answersHolder);
	notesHolder.appendChild(wrongAnswer);
}
// Result

// Time
let timer = document.querySelector(".time .number");
let timerId;

function resetTimer() {
	clearInterval(timerId);
	timer.textContent = "10";

	timerId = setInterval(() => {
		timer.textContent--;
		if (timer.textContent === "0") {
			answers.push(-1);
			clearChoices();
			nextQuestion();
		}
	}, 1000);
}
// Time

// Reset
function initializeGame() {
	curQuestion = 0;
	initializeProgress();

	quizHolder.classList.remove("hide");

	// stop Filter
	filter.removeEventListener("click", toggleFilter);
	filterMenu.classList.remove("active");

	answers = [];
	shuffeledQuestions = [];
	notesHolder.innerHTML = "";

	getQuestions();
	loadQuestion();
	resetTimer();
	next.textContent = "Next >";
	resultHolder.classList.add("off");
}
function resetHundler() {
	next.addEventListener("click", nextHundler);
	next.removeEventListener("click", resetHundler);
	initializeGame();
}
// Reset
