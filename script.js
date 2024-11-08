/// <reference lib="dom" />
"use strict";
/**
 * @typedef {"easy" | "medium" | "hard"} Difficulty
 * @typedef {{
 *  name: string;
 *  image: HTMLImageElement;
 *  valid: boolean;
 * }} ComponentData
 */

/**
 * @type {Difficulty[]}
 */
const DIFFICULTIES = ["easy", "medium", "hard"];

const ELEMENTS = {
    /** @type {HTMLDivElement} */
    mainMenu: document.getElementById('main-menu'),
    
    /** @type {HTMLDivElement} */
    gameMenu: document.getElementById('game-menu'),

    /** @type {HTMLDivElement} */
    resultsMenu: document.getElementById('results-menu'),
    
    /** @type {HTMLImageElement} */
    gameImage: document.getElementById('game-component'),

    /** @type {HTMLSpanElement} */
    gameTimer: document.getElementById('game-timer'),

    /** @type {HTMLSpanElement} */
    curRound: document.getElementById('cur-round'),

    /** @type {HTMLSpanElement} */
    lastRound: document.getElementById('last-round'),

    /** @type {HTMLButtonElement[]} */
    choices: Array.from(document.querySelectorAll('#game-control-easy > button')),

    /** @type {HTMLDataListElement} */
    autocomplete: document.getElementById('game-autocomplete'),

    /** @type {HTMLInputElement} */
    mediumInput: document.getElementById('medium-textbox'),

    /** @type {HTMLInputElement} */
    hardInput: document.getElementById('hard-textbox'),

    /** @type {HTMLSpanElement} */
    resultRounds: document.getElementById('result-rounds'),

    /** @type {HTMLSpanElement} */
    resultTime: document.getElementById('result-time'),

    /** @type {HTMLSpanElement} */
    resultRate: document.getElementById('result-rate'),

    /** @type {HTMLButtonElement} */
    resultReturn: document.getElementById('result-return'),
};


/**
 * A list of Windows Forms components.
 * @type {ComponentData[]}
 */
const COMPONENT_LIST = [];

function initComponents() {
    const list = [
        "Button",
        "CheckBox",
        "CheckedListBox",
        "ComboBox",
        "DataGridView",
        "DateTimePicker",
        "HScrollBar",
        "Label",
        "LinkLabel",
        "ListBox",
        "ListView",
        "MaskedTextBox",
        "MonthCalendar",
        "NotifyIcon",
        "NumericUpDown",
        "PictureBox",
        "PrintPreviewControl",
        "ProgressBar",
        "RadioButton",
        "RichTextBox",
        "Splitter",
        "StatusStrip",
        "TabControl",
        "TextBox",
        "TrackBar",
        "TreeView",
        "VScrollBar",
    ];

    for(const componentName of list) {
        /** @type {ComponentData} */
        const component = {
            name: componentName,
            image: new Image(),
            valid: true
        };

        component.image.src = `/img/components/${componentName}.png`;
        component.image.addEventListener('error', () => {
            console.warn(`Image of component '${component.name}' errored, deleting.`);
            const myIndex = COMPONENT_LIST.findIndex(c => c.name === component.name);
            COMPONENT_LIST[myIndex].valid = false;
        });

        COMPONENT_LIST.push(component);
    }
}

/** @returns {ComponentData} */
function getRandomComponent() {
    const filtered_list =
        COMPONENT_LIST.filter(c => c.valid);
    const component = filtered_list[Math.floor(Math.random() * filtered_list.length)];

    return component;
}

let correctComponent = getRandomComponent();
let startTimestamp = performance.now();
/** The game time in milliseconds */
let gameTime = NaN;
let timerRunning = false;
let round = -1;
const ROUNDS = 25;

/** @param {number} ms */
function formatTime(ms) {
    const seconds = ms / 1000;
    const minutes = Math.floor(seconds / 60);
    
    const secondsStr = (seconds % 60).toFixed(3).padStart(6, '0');
    const minutesStr = minutes.toFixed(0);

    return `${minutesStr}:${secondsStr}`;
}

function updateTimer() {
    const timestamp = performance.now();
    const time = timestamp - startTimestamp;
    
    if(timerRunning) {
        gameTime = time;
        ELEMENTS.gameTimer.textContent = formatTime(time);
    }

    requestAnimationFrame(updateTimer);
}

/**
 * Performs a Fisher-Yates shuffle on the array and returns the modified array.
 * @template T
 * @param {T[]} arr
 * @returns {T[]} - The shuffled array.
 */
function shuffleArray(arr) {
    const a = arr.slice();
    
    for(let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[j], a[i]] = [a[i], a[j]];
    }

    return a;
}

function setChoiceButtons() {
    const incorrectComponents = shuffleArray(
        COMPONENT_LIST
            .filter(c => c.name !== correctComponent.name)
    );
    
    const correctIndex = Math.floor(Math.random() * ELEMENTS.choices.length);

    for(let i = 0; i < ELEMENTS.choices.length; i++) {
        const choice = ELEMENTS.choices[i];
        const component = (i === correctIndex) ?
            correctComponent :
            incorrectComponents[i];

        if(!component) {
            choice.style.display = 'none';
            choice.disabled = true;
            continue;
        } else {
            choice.style.display = 'block';
            choice.disabled = false;
        }
        
        choice.textContent = component.name;
    }
}

function nextRound() {
    round++;

    if(round > ROUNDS) {
        endGame();
        return;
    }

    correctComponent = getRandomComponent();
    ELEMENTS.gameImage.src = correctComponent.image.src;
    ELEMENTS.curRound.textContent = round.toFixed(0);
    ELEMENTS.lastRound.textContent = ROUNDS.toFixed(0);
    setChoiceButtons();
}

/** @param {Difficulty} difficulty */
function startGame(difficulty) {
    DIFFICULTIES.forEach(level => {
        document.getElementById('game-control-' + level)
            .classList.toggle('hide', level !== difficulty);
    });

    goToMenu('game-menu');

    startTimestamp = performance.now();
    timerRunning = true;
    round = 0;
    nextRound();
}

function endGame() {
    timerRunning = false;

    ELEMENTS.resultRounds.textContent = ROUNDS.toFixed(0);
    ELEMENTS.resultTime.textContent = formatTime(gameTime);

    const secsPerRound = gameTime / ROUNDS / 1000;
    ELEMENTS.resultRate.textContent = secsPerRound.toFixed(3);

    goToMenu('results-menu');
}

/** @param {string} id */
function goToMenu(id) {
    Array.from(document.getElementsByClassName('menu'))
        .forEach(el => el.classList.toggle('hide', el.id !== id));
}

function init() {
    initComponents();

    Array.from(document.getElementsByClassName('delete-on-init'))
        .forEach(el => el.remove());

    document.getElementById('start-e')
        .addEventListener('click', () => startGame('easy'));

    document.getElementById('start-m')
        .addEventListener('click', () => startGame('medium'));

    document.getElementById('start-h')
        .addEventListener('click', () => startGame('hard'));

    [ELEMENTS.mediumInput, ELEMENTS.hardInput]
        .forEach(el => el.addEventListener("input", _ => {
            if(el.value.toLowerCase().trim() === correctComponent.name.toLowerCase()) {
                el.value = '';
                nextRound();
            }
        }));
    
    ELEMENTS.choices.forEach(
        el => el.addEventListener('click', () => {
            if(el.textContent === correctComponent.name) {
                nextRound();
            } else {
                ELEMENTS.choices.forEach(el => {
                    el.disabled = true;
                    setTimeout(() => {
                        el.disabled = false;
                    }, 2500);
                });
            }
        })
    );
    
    COMPONENT_LIST.forEach(c => {
        const option = document.createElement('option');
        option.value = c.name;
        ELEMENTS.autocomplete.appendChild(option);
    });

    ELEMENTS.resultReturn.addEventListener('click', () => {
        goToMenu('main-menu');
    })
    
    updateTimer();
}

try {
    init();
} catch(e) {
    console.error(e);
    alert('An error occurred while initializing the game. Check the console for more information.');
}