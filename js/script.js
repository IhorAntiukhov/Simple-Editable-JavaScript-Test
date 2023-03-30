"use strict";

const questions = [
    {
        text: "Sample question with one correct answer",
        type: "radio",
        options: ["First option", "Second option", "Third option", "Fourth option"],
        correctOption: 0,
    },
    {
        text: "Sample question with multiple correct answers",
        type: "check",
        options: ["Option #1", "Option #2", "Option #3", "Option #4", "Option #5", "Option #6"],
        correctOption: [1, 4],
    },
    {
        text: "Sample question with input",
        type: "input",
        correctOption: "Your correct answer",
    },
];

let minutes = 5;
let seconds = 0;

const timeLeft = document.querySelector(".time-left");
const timeLeftText = document.querySelector(".time-left__text");
const editTest = document.querySelector(".header__edit");
const mark = document.querySelector(".mark");
const markText = document.querySelector(".mark__text");
const questionElements = document.getElementsByClassName("question");
const testForm = document.test;

let currentQuestion = 0;
let selectedOption = 0;
let selectedOptions = [];
let testFinished = false;
let editTestMode = false;
let leftTime = 0;

let previousOption;
let previousOptionText;

let mistakes = 0;
let mistakeDetected = false;

let addQuestionOptions = [""];
let addQuestionType = "radio";
let addQuestionIndex = 0;

startTest();

function startTest() {
    mistakes = 0;
    mistakeDetected = false
    testForm.innerHTML = "";

    if (questions[0].type != "input") {
        testForm.insertAdjacentHTML("afterBegin", `
        <section class="question">
            <h2 class="question__name">${questions[0].text}</h2>
            <div class="question__options">
                ${getOptions()}
            </div>
            ${getNextButton()}
        </section>
        ${getFinishButton()}
        `);
    } else {
        testForm.insertAdjacentHTML("afterBegin", `
        <section class="question">
            <h2 class="question__name">${questions[0].text}</h2>
            <p><input type="text" name="question0Input" class="question__input" placeholder="Enter your answer ..."></p>
            ${getNextButton()}
        </section>
        ${getFinishButton()}
        `);
    }
}

leftTime = minutes * 60 + seconds + 1;
timer();
let timerId = setInterval(timer, 1000);

function timer() {
    leftTime -= 1;
    let minutesLeft = String(Math.floor(leftTime / 60));
    let secondsLeft = String(Math.floor(leftTime % 60));
    minutesLeft = (minutesLeft.length == 1) ? `0${minutesLeft}` : minutesLeft;
    secondsLeft = (secondsLeft.length == 1) ? `0${secondsLeft}` : secondsLeft;
    timeLeftText.innerHTML = `${minutesLeft}:${secondsLeft}`;
    if (leftTime == 0) {
        if (currentQuestion < questions.length - 1) {
            testForm.insertAdjacentHTML("beforeEnd", `
            <button type="button" id="finishButton" class="button">Finish test</button>
            `);
            const nextButtons = document.querySelectorAll(".question__next");
            nextButtons[nextButtons.length - 1].remove();
        }
        finishTest();
    }
}

testForm.addEventListener("click", function (event) {
    if (!editTestMode) {
        if (!testFinished && questions[currentQuestion].type != "input") {
            for (let i = 0; i < questions[currentQuestion].options.length; i++) {
                if (selectOption(event, i)) break;
            }
        }
    } else {
        mainFor: for (currentQuestion = 0; currentQuestion < questions.length; currentQuestion++) {
            if (questions[currentQuestion].type == "input") continue;
            for (let i = 0; i < questions[currentQuestion].options.length; i++) {
                if (selectOption(event, i)) break mainFor;
            }
        }

        for (let i = 0; i < questions.length; i++) {
            if (event.target.closest(`#question${i}Add`)) {
                addQuestionIndex = i;
                const addQuestionPopup = document.querySelector(".add-question");
                addQuestionPopup.classList.add("add-question__show-animation");
                decorateOption(0);

                addQuestionPopup.addEventListener("click", addQuestionEventListener);
                document.querySelector(".add-question__question-type").addEventListener("change", selectEventListener);
            } else if (event.target.closest(`#question${i}Delete`)) {
                if (questions.length > 1) {
                    if (confirm("Are you sure you want to delete the question?")) {
                        questions.splice(i, 1);
                        rebuildQuestions();
                    }
                } else {
                    alert("You can't delete all questions!");
                }
            }
        }
    }
    if (event.target.closest(`#question${currentQuestion}Next`)) {
        if (selectedOption != 0 || selectedOptions.length > 0 ||
            (questions[currentQuestion].type == "input" && testForm[`question${currentQuestion}Input`].value != "")) {
            currentQuestion++;
            selectedOption = 0;
            selectedOptions = [];
            previousOption = undefined;
            previousOptionText = undefined;
            questionElements[questionElements.length - 1].style.opacity = "0.7";
            if (questions[currentQuestion - 1].type == "input") testForm[`question${currentQuestion - 1}Input`].readOnly = true;

            if (questions[currentQuestion].type != "input") {
                testForm.insertAdjacentHTML("beforeEnd", `
                <section class="question">
                    <h2 class="question__name">${questions[currentQuestion].text}</h2>
                    <div class="question__options">
                        ${getOptions()}
                    </div>
                    ${getNextButton()}
                </section>
                ${getFinishButton()}
                `);
            } else {
                testForm.insertAdjacentHTML("beforeEnd", `
                <section class="question">
                    <h2 class="question__name">${questions[currentQuestion].text}</h2>
                    <p><input type="text" name="question${currentQuestion}Input" class="question__input" placeholder="Enter your answer ..."></p>
                    ${getNextButton()}
                </section>
                ${getFinishButton()}
                `);
            }
            questionElements[currentQuestion].scrollIntoView(true);
        } else {
            alert("Choose an answer!");
        }
    } else if (event.target.closest("#finishButton")) {
        if (!testFinished) {
            if (selectedOption != 0 || selectedOptions.length > 0 || (questions[currentQuestion].type == "input" && testForm[`question${currentQuestion}Input`].value != "")) {
                finishTest();
            } else {
                alert("Choose an answer!");
            }
        } else {
            testFinished = false;
            currentQuestion = 0;
            leftTime = minutes * 60 + seconds + 1;
            timer();
            timerId = setInterval(timer, 1000);

            timeLeft.style.display = null;
            mark.style.display = "none";
            startTest();
        }
    }
});

function selectOption(event, i) {
    if (event.target.closest(`#question${currentQuestion}Option${i}`)) {
        if (questions[currentQuestion].type == "radio") {
            if (!editTestMode) {
                if (previousOption != undefined) {
                    previousOption.classList.remove("question__option_selected");
                    previousOptionText.classList.remove("question__option-text_selected");
                }
            } else {
                for (let k = 0; k < questions[currentQuestion].options.length; k++) {
                    document.querySelector(`#question${currentQuestion}Option${k}`).classList.remove("question__option_selected");
                    document.querySelector(`#question${currentQuestion}OptionText${k}`).classList.remove("question__option-text_selected");
                }
            }

            previousOption = document.querySelector(`#question${currentQuestion}Option${i}`);
            previousOptionText = document.querySelector(`#question${currentQuestion}OptionText${i}`);
            previousOption.classList.add("question__option_selected");
            previousOptionText.classList.add("question__option-text_selected");
            selectedOption = i + 1;

            if (!editTestMode) {
                testForm[`question${currentQuestion}`][i].checked = true;
            } else {
                questions[currentQuestion].correctOption = i;
            }
            return true;
        } else if (questions[currentQuestion].type == "check") {
            const question = document.querySelector(`#question${currentQuestion}Option${i}`);
            const questionLabel = document.querySelector(`#question${currentQuestion}OptionText${i}`);
            question.classList.toggle("question__option_selected");
            questionLabel.classList.toggle("question__option-text_checkbox-selected");

            if (selectedOptions.indexOf(i) == -1) {
                selectedOptions.push(i);
            } else {
                selectedOptions.splice(selectedOptions.indexOf(i), 1);
            }

            if (!editTestMode) {
                testForm[`question${currentQuestion}Checkbox${i}`].checked = !testForm[`question${currentQuestion}Checkbox${i}`].checked;
            } else {
                if (questions[currentQuestion].correctOption.indexOf(i) == -1) {
                    questions[currentQuestion].correctOption.push(i);
                } else {
                    questions[currentQuestion].correctOption.splice(questions[currentQuestion].correctOption.indexOf(i), 1);
                }
            }
            return true;
        }
    }
}

function getOptions() {
    let options = "";
    for (let i = 0; i < questions[currentQuestion].options.length; i++) {
        if (questions[currentQuestion].type == "radio") {
            if (!(editTestMode && questions[currentQuestion].correctOption == i)) {
                options += `
                <div id="question${currentQuestion}Option${i}" class="question__option">
                    <input type="radio" name="question${currentQuestion}" value="${i}" class="question__button">
                    <label for="question${currentQuestion}" id="question${currentQuestion}OptionText${i}" class="question__option-text">${questions[currentQuestion].options[i]}</label>
                </div>
                `;
            } else {
                options += `
                <div id="question${currentQuestion}Option${i}" class="question__option question__option_selected">
                    <input type="radio" name="question${currentQuestion}" value="${i}" class="question__button">
                    <label for="question${currentQuestion}" id="question${currentQuestion}OptionText${i}" class="question__option-text question__option-text_selected">${questions[currentQuestion].options[i]}</label>
                </div>
                `;
            }
        } else if (questions[currentQuestion].type == "check") {
            if (!(editTestMode && questions[currentQuestion].correctOption.indexOf(i) != -1)) {
                options += `
                <div id="question${currentQuestion}Option${i}" class="question__option">
                    <input type="checkbox" name="question${currentQuestion}Checkbox${i}" value="${i}" class="question__button">
                    <label for="question${currentQuestion}Checkbox${i}" id="question${currentQuestion}OptionText${i}" class="question__option-text question__option-text_checkbox">${questions[currentQuestion].options[i]}</label>
                </div>
                `;
            } else {
                options += `
                <div id="question${currentQuestion}Option${i}" class="question__option question__option_selected">
                    <input type="checkbox" name="question${currentQuestion}Checkbox${i}" value="${i}" class="question__button">
                    <label for="question${currentQuestion}Checkbox${i}" id="question${currentQuestion}OptionText${i}" class="question__option-text question__option-text_checkbox question__option-text_checkbox-selected">${questions[currentQuestion].options[i]}</label>
                </div>
                `;
            }
        }
    }
    return options;
}

function finishTest() {
    testFinished = true;
    selectedOption = 0;
    selectedOptions = [];
    clearInterval(timerId);
    timeLeft.style.display = "none";

    for (let i = 0; i < currentQuestion + 1; i++) {
        questionElements[i].style.opacity = "1";
        if (questions[i].type == "radio") {
            document.querySelector(`#question${i}Option${questions[i].correctOption}`).classList.add("question__option_correct");
            if (testForm[`question${i}`][questions[i].correctOption].checked == false) {
                const radioButton = document.querySelector(`input[name="question${i}"]:checked`);
                mistakes++;
                if (radioButton) {
                    radioButton.closest(".question__option").classList.add("question__option_mistake");
                }
            }
        } else if (questions[i].type == "check") {
            mistakeDetected = false;
            for (let k = 0; k < questions[i].options.length; k++) {
                if (testForm[`question${i}Checkbox${k}`].checked && questions[i].correctOption.indexOf(k) != -1) {
                    document.querySelector(`#question${i}Option${k}`).classList.add("question__option_correct");
                } else if (testForm[`question${i}Checkbox${k}`].checked && questions[i].correctOption.indexOf(k) == -1) {
                    if (!mistakeDetected) {
                        mistakes++;
                        mistakeDetected = true;
                    }
                    document.querySelector(`#question${i}Option${k}`).classList.add("question__option_mistake");
                } else if (!testForm[`question${i}Checkbox${k}`].checked && questions[i].correctOption.indexOf(k) != -1) {
                    if (!mistakeDetected) {
                        mistakes++;
                        mistakeDetected = true;
                    }
                    document.querySelector(`#question${i}Option${k}`).classList.add("question__option_correct");
                }
            }
        } else if (questions[i].type == "input") {
            if (questions[i].correctOption.toLowerCase() == String(testForm[`question${i}Input`].value).toLowerCase()) {
                testForm[`question${i}Input`].classList.add("question__input_correct");
            } else {
                mistakes++;
                testForm[`question${i}Input`].classList.add("question__input_mistake");
                testForm[`question${i}Input`].insertAdjacentHTML("afterEnd", `
                    <p class="question__correct-answer">Correct answer: ${questions[i].correctOption}</p>
                    `);
            }
        }
    }
    mark.style.display = "inline-block";
    markText.innerHTML = `${questions.length - (mistakes + (questions.length - (currentQuestion + 1)))} out of ${questions.length}`;
    mark.scrollIntoView(true);
    document.querySelector("#finishButton").innerHTML = "Take the test again";
}

editTest.addEventListener("click", function () {
    if (!editTestMode) {
        editTestMode = true;
        testFinished = false;
        selectedOption = 0;
        selectedOptions = [];
        clearInterval(timerId);
        timeLeft.style.display = "none";
        mark.style.display = "none";
        editTest.innerHTML = '<img src="img/start-test.svg" alt="" class="button-image">';
        rebuildQuestions();
    } else {
        for (let i = 0; i < questions.length; i++) {
            questions[i].text = document.querySelector(`#question${i}InputName`).value;
            if (questions[i].type == "input") {
                questions[i].correctOption = document.querySelector(`#question${i}Input`).value;
            }
        }
        editTestMode = false;
        currentQuestion = 0;
        minutes = +(document.querySelector("#timeMinutes").value);
        seconds = +(document.querySelector("#timeSeconds").value);
        editTest.innerHTML = '<img src="img/edit-test.svg" alt="" class="button-image">';
        timeLeft.style.display = "inline-flex";
        startTest();
        leftTime = minutes * 60 + seconds + 1;
        timer();
        timerId = setInterval(timer, 1000);
    }
});

function addQuestionEventListener(event) {
    for (let i = 0; i < addQuestionOptions.length; i++) {
        if (event.target.closest(`#addQuestion${i}Add`)) {
            for (let i = 0; i < addQuestionOptions.length; i++) {
                addQuestionOptions[i] = document.querySelector(`#addQuestion${i}Input`).value;
            }
            addQuestionOptions.splice(i + 1, 0, "");
            rebuildOptions();
            break;
        } else if (event.target.closest(`#addQuestion${i}Delete`)) {
            if (addQuestionOptions.length > 1) {
                addQuestionOptions.splice(i, 1);
                rebuildOptions();
            } else {
                alert("You cannot delete all answer options!");
            }
            break;
        }
    }
    if (event.target.closest(".add-question__hide") || event.target.closest(".add-question__hide-popup-area")) {
        const addQuestionPopup = document.querySelector(".add-question");
        addQuestionPopup.removeEventListener("click", addQuestionEventListener);
        document.querySelector(".add-question__question-type").removeEventListener("change", selectEventListener);
        addQuestionPopup.classList.remove("add-question__show-animation");
        addQuestionPopup.classList.add("add-question__hide-animation");
        setTimeout(() => {
            addQuestionPopup.classList.remove("add-question__hide-animation");
        }, 1000);
    } else if (event.target.closest("#addQuestionButton")) {
        for (let i = 0; i < addQuestionOptions.length; i++) {
            addQuestionOptions[i] = document.querySelector(`#addQuestion${i}Input`).value;
        }

        const addQuestionPopup = document.querySelector(".add-question");
        addQuestionPopup.removeEventListener("click", addQuestionEventListener);
        document.querySelector(".add-question__question-type").removeEventListener("change", selectEventListener);
        addQuestionPopup.classList.remove("add-question__show-animation");
        addQuestionPopup.classList.add("add-question__hide-animation");
        setTimeout(() => {
            addQuestionPopup.classList.remove("add-question__hide-animation");
            if (addQuestionType == "radio" || addQuestionType == "check") {
                questions.splice(addQuestionIndex + 1, 0, {
                    text: document.querySelector("#addQuestionName").value,
                    type: addQuestionType,
                    options: addQuestionOptions,
                    correctOption: (addQuestionType == "radio") ? 0 : [0],
                });
            } else {
                questions.splice(addQuestionIndex + 1, 0, {
                    text: document.querySelector("#addQuestionName").value,
                    type: addQuestionType,
                    correctOption: document.querySelector("#addQuestionAnswer").value,
                });
            }
            rebuildQuestions();
            addQuestionOptions = [""];
            addQuestionType = "radio";
            document.querySelector(".add-question__question-type").value = "radio";
            document.querySelector(".add-question__options").style.display = "block";
            document.querySelector("#addQuestionAnswer").style.display = "none";
            rebuildOptions();
        }, 1000);
    }
}

function rebuildQuestions() {
    testForm.innerHTML = "";
    testForm.insertAdjacentHTML("beforeEnd", `
        <div class="time">
            <input type="number" id="timeMinutes" class="time__input" value="${minutes}" autocomplete="off">
            <p class="time__colon">:</p>
            <input type="number" id="timeSeconds" class="time__input" value="${seconds}" autocomplete="off">
        </div>
    `);

    for (currentQuestion = 0; currentQuestion < questions.length; currentQuestion++) {
        if (questions[currentQuestion].type != "input") {
            testForm.insertAdjacentHTML("beforeEnd", `
                <section class="question">
                    <input type="text" id="question${currentQuestion}InputName" class="question__name question__name_input" value="${questions[currentQuestion].text}" placeholder="Question title"></input>
                    <div class="question__options">
                        ${getOptions()}
                    </div>
                    <div class="question__edit-buttons">
                        <button type="button" id="question${currentQuestion}Add" class="question__add">
                            <img src="img/add.svg" alt="" class="button-image">
                        </button>
                        <button type="button" id="question${currentQuestion}Delete" class="question__delete">
                            <img src="img/delete.svg" alt="" class="button-image">
                        </button>
                    </div>
                </section>
                `);
        } else {
            testForm.insertAdjacentHTML("beforeEnd", `
                <section class="question">
                    <input type="text" id="question${currentQuestion}InputName" class="question__name question__name_input" value="${questions[currentQuestion].text}" placeholder="Question title"></input>
                    <p><input type="text" name="question${currentQuestion}Input" id="question${currentQuestion}Input" 
                    class="question__input" value="${questions[currentQuestion].correctOption}" placeholder="Correct answer"></p>
                    <div class="question__edit-buttons">
                        <button type="button" id="question${currentQuestion}Add" class="question__add">
                            <img src="img/add.svg" alt="" class="button-image">
                        </button>
                        <button type="button" id="question${currentQuestion}Delete" class="question__delete">
                            <img src="img/delete.svg" alt="" class="button-image">
                        </button>
                    </div>
                </section>
                `);
        }
    }
}

function rebuildOptions() {
    let options = "";
    addQuestionOptions.forEach((value, index) => {
        options += `
        <div id="addQuestion${index}" class="add-question__option">
            <div class="add-question__grid">
                <input type="text" id="addQuestion${index}Input"
                    class="add-question__input add-question__input_option" value="${value}" placeholder="Possible answer" autocomplete="off">
                <button id="addQuestion${index}Add" class="add-question__button">
                    <img src="img/add.svg" alt="" class="button-image">
                </button>
                <button id="addQuestion${index}Delete" class="add-question__button">
                    <img src="img/delete.svg" alt="" class="button-image">
                </button>
            </div>
        </div>
    `
    });
    document.querySelector(".add-question__options").innerHTML = options;
    for (let j = 0; j < addQuestionOptions.length; j++) {
        decorateOption(j);
    }
}

function selectEventListener(event) {
    addQuestionType = event.target.value;
    if (addQuestionType == "input") {
        document.querySelector(".add-question__options").style.display = "none";
        const addQuestionAnswer = document.querySelector("#addQuestionAnswer");
        addQuestionAnswer.style.display = "block";
    } else {
        document.querySelector(".add-question__options").style.display = "block";
        document.querySelector("#addQuestionAnswer").style.display = "none";
    }
}

function decorateOption(i) {
    const addQuestionAdd = document.querySelector(`#addQuestion${i}Add`);
    const addQuestionDelete = document.querySelector(`#addQuestion${i}Delete`);
    addQuestionAdd.style.width = `${addQuestionAdd.getBoundingClientRect().height}px`;
    addQuestionDelete.style.width = `${addQuestionDelete.getBoundingClientRect().height}px`;
}

function getNextButton() {
    return (currentQuestion + 1 < questions.length) ?
        `<button type="button" id="question${currentQuestion}Next" class="question__next">
            <img src="img/next.svg" alt="" class="question__next-image">
        </button>` : "";
}

function getFinishButton() {
    return (currentQuestion + 1 == questions.length) ? `<button type="button" id="finishButton" class="button">Finish test</button>` : "";
}