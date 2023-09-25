// Start
let startBtn = document.querySelector(".start-btn");
let quizHolder = document.querySelector(".quiz");
startBtn.addEventListener("click", function () {
	startBtn.classList.add("off");
	quizHolder.classList.remove("hide");
	stopFilter();
	getQuestions();
	loadQuestion();
	resetTimer();
});
// Start

// Questions
let curQuestion = 0;
let questions;
let chosenQuestions;
let shuffeledQuestions = [];

let categoryHolder = document.getElementById("category");
let questionHolder = document.querySelector(".question");
let choicesHolders = document.querySelectorAll(".choices li");

/* get Questions from "api" */
fetch("./quiz questions.json")
	.then((data) => data.json())
	.then((data) => {
		questions = data;
	});

function getQuestions() {
	let categories = getCategories();

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

filter.addEventListener("click", toggleFilter);

function toggleFilter(e) {
	if (this !== e.target.closest("div")) return;

	filterMenu.classList.toggle("active");
}
function getCategories() {
	let categories = [];

	for (const label of Array.from(filterMenu.children)) {
		if (label.firstElementChild.checked) {
			categories.push(label.textContent.trim());
		}
	}

	return categories;
}
function stopFilter() {
	filter.removeEventListener("click", toggleFilter);
	filterMenu.classList.remove("active");
}
// Filter

// choices
let choices = document.querySelector(".choices");

choices.addEventListener("click", function (e) {
	let choice = e.target;

	if (e.target.tagName !== "LI") return;

	if (choice.classList.contains("chosen")) {
		choice.classList.remove("chosen");
		activeNext(false);
		return;
	}

	for (const c of Array.from(choices.children)) {
		c.classList.remove("chosen");
	}

	choice.classList.add("chosen");

	activeNext(true);
});

function clearChoices() {
	for (let i = 0; i < 4; i++) {
		if (choicesHolders[i].classList.contains("chosen")) {
			choicesHolders[i].classList.remove("chosen");
			return i;
		}
	}
	activeNext(false);
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

next.addEventListener("click", function () {
	if (!this.classList.contains("active")) return;

	answers.push(clearChoices());
	nextHundler();
});

function nextHundler() {
	if (curQuestion === 9) {
		submitAnswers();
	} else {
		updateQuestion();
	}
	activeNext(false);
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

	let score = 0;
	let notes = [];

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
}
function addNote(i, answer) {
	let choices = ["A.", "B.", "C.", "D."];

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
			nextHundler();
		}
	}, 1000);
}
// Time
