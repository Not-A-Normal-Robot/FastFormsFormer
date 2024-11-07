/// <reference lib="dom" />
"use strict";
/** @typedef {"easy" | "medium" | "hard"} Difficulty */
/**
 * @type {Difficulty[]}
 */
const DIFFICULTIES = ["easy", "medium", "hard"];

const ELEMENTS = {
    /** @type {HTMLDivElement} */
    mainMenu: document.getElementById('main-menu'),
    
    /** @type {HTMLDivElement} */
    gameMenu: document.getElementById('game-menu'),
    
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
};

/**
 * @typedef {{
 *  name: string;
 *  image: HTMLImageElement;
 * }} ComponentData
 */

/**
 * A list of Windows Forms components.
 * @type {ComponentData[]}
 */
const COMPONENT_LIST = [];

function initComponents() {
    const list = [
        "Button",
        "CheckBox",
        "ComboBox",
        "DataGridView",
        "DateTimePicker",
        "Label",
        "ListBox",
        "ListView",
        "PictureBox",
        "ProgressBar",
        "RadioButton",
        "RichTextBox",
        "TextBox",
        "TreeView"
    ];

    for(const componentName of list) {
        /** @type {ComponentData} */
        const component = {
            name: componentName,
            image: new Image()
        };

        component.image.src = `/img/components/${componentName}.png`;
        component.image.addEventListener('error', () => {
            console.warn(`Image of component '${component.name}' errored, deleting.`);
            const myIndex = COMPONENT_LIST.findIndex(c => c.name === component.name);
            COMPONENT_LIST.splice(myIndex, 1);
        });

        COMPONENT_LIST.push(component);
    }
}

/** @returns {ComponentData} */
function getRandomComponent() {
    console.debug(COMPONENT_LIST);
    const component = COMPONENT_LIST[Math.floor(Math.random() * COMPONENT_LIST.length)];

    console.debug(`Component picked: `, component); // DEBUG
    return component;
}

let correctComponent = getRandomComponent();
let startTimestamp = performance.now();
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
    const timeStr = formatTime(time);
    
    if(timerRunning) {
        gameTime = time;
        ELEMENTS.gameTimer.textContent = timeStr;
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
    const newArr = arr.slice();
    
    for(let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[j], a[i]] = [a[i], a[j]];
    }

    return newArr;
}

function setChoiceButtons() {
    const incorrectComponents = shuffleArray(
        COMPONENT_LIST
            .filter(c => c.name !== correctComponent.name)
    );
    
    const correctIndex = Math.floor(Math.random() * ELEMENTS.choices.length);

    for(let i = 0; i < ELEMENTS.choices.length; i++) {
        const choice = ELEMENTS.choices[i];

        if(i > incorrectComponents.length) {
            choice.style.display = 'none';
            choice.disabled = true;
        }

        const component = (i === correctIndex) ? correctComponent : incorrectComponents[i];
        
        choice.textContent = component.name;
        choice.addEventListener('click', () => {
            if(component === correctComponent) {
                nextRound();
            }
        });
    }
}

function nextRound() {
    round++;

    if(round >= ROUNDS) {
        endGame();
        return;
    }

    correctComponent = getRandomComponent();
    ELEMENTS.gameImage.src = correctComponent.image.src;
    ELEMENTS.curRound.textContent = round.toFixed(0);
    ELEMENTS.lastRound.textContent = ROUNDS.toFixed(0);
    round++;
}

/** @param {Difficulty} difficulty */
function startGame(difficulty) {
    DIFFICULTIES.forEach(level => {
        const displayStyle = (level === difficulty) ? 'block' : 'none';
        document.getElementById('game-control-' + level).style.display = displayStyle;
    });

    ELEMENTS.mainMenu.style.display = 'none';
    ELEMENTS.gameMenu.style.display = 'block';

    startTimestamp = performance.now();
    timerRunning = true;
    round = 0;
    nextRound();
}

function endGame() {
    timerRunning = false;

    // TODO: display ending time
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
    
    updateTimer();
}

try {
    init();
} catch(e) {
    console.error(e);
    alert('An error occurred while initializing the game. Check the console for more information.');
}