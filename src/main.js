// ========= World variables =======
const CSS_HIDE_CONTENT = 'js-unable';
const VALID_FILE_EXTENSION = 'txt';
const MIN_NUMBER_ELEMENTS = 8;
const PATTERN_CHECKING_STRING = /[a-z-A-Z\s\-]+[:]{1}[а-я-А-Я\s]*$/;
const MAX_NUMBER_ELEMENTS_INVOLVED = 4;
const SINGLE_ELEMENT_DICTIONARY = 1;
const SUCCESS_PICTOGRAM = 'images/success.png';
const FAIL_PICTOGRAM = 'images/fail.png';
const DEFAULT_IMAGE = 'images/default.png';
const ERROR_IMAGE = 'images/error.png';
const CORRECT_IMAGE = 'images/correctly.png';
let is_dictionary_created = false;
let file = null;
let dictionary = null;

// ========= Boxes ===========
const sectionSettings = document.getElementById('settings');
const sectionTraining = document.getElementById('training');
const sectionHome = document.getElementById('home');
const boxWarning = document.getElementById('warning');
const boxFileName = document.getElementById('fileName');
const boxWordQuestion = document.getElementById('wordQuestion');

// ========= Buttons =========
const btnTraining = document.getElementById('btnTraining');
const btnSettings = document.getElementById('btnSettings');
const btnHomes = document.getElementsByClassName('button-home');
const btnDeleteDict = document.getElementById('btnDeleteDict');
const btnCreatedDict = document.getElementById('btnCreatedDict');
const btnFile = document.getElementById('file');
const btnAnswers = document.getElementsByClassName('button-answer');

// ====== Decoration ======
const pictureResult = document.getElementById('pictureResult');
const pictureReaction = document.getElementById('pictureReaction');
const countSuccess = document.getElementById('countSuccess');
const countFailure = document.getElementById('countFailure');

// ========= Handlers =========
document.addEventListener('DOMContentLoaded', initialState);

btnSettings.addEventListener('click', () => {
    sectionHome.classList.add(CSS_HIDE_CONTENT);
    sectionSettings.classList.remove(CSS_HIDE_CONTENT);
});

for (const btnHome of btnHomes) {
    btnHome.addEventListener('click', () => {
        sectionHome.classList.remove(CSS_HIDE_CONTENT);
        for (const section of [sectionSettings, sectionTraining]) {
            section.classList.add(CSS_HIDE_CONTENT);
        }
    });
}

btnFile.addEventListener('change', () => {
    const candidateFile = btnFile.files[0];
    const fileExtension = candidateFile.name.split('.')[1];
    boxFileName.innerText = candidateFile.name;
    if (fileExtension === VALID_FILE_EXTENSION) {
        file = candidateFile;
        btnCreatedDict.disabled = false;
        boxWarning.classList.add(CSS_HIDE_CONTENT);
    } else {
        fileErrorWarning('Не тот тип файла!');
    }
});

btnCreatedDict.addEventListener('click', async () => {
    const readData = await readingFile(file);
    const validationStatus = dataValidation(readData);
    if (!validationStatus) {
        fileErrorWarning('Файл содержит ошибки!');
    } else {
        if (!is_dictionary_created) {
            dictionary = createDictionaryWords(readData);
            if (dictionary.size > 0) is_dictionary_created = true;
        }

        if (is_dictionary_created && btnCreatedDict.dataset.create) {
            addDictionaryWords(readData);
        }

        if (is_dictionary_created) {
            btnCreatedDict.innerText = 'Добавить в словарь';
            btnCreatedDict.dataset.create = true;
            btnCreatedDict.disabled = true;
            btnDeleteDict.disabled = false;
            boxFileName.innerText = 'Выберите файл';
            sectionHome.classList.remove(CSS_HIDE_CONTENT);
            sectionSettings.classList.add(CSS_HIDE_CONTENT);
            btnTraining.disabled = false;
            helpClearFile(btnFile);
        }
    }
});

btnDeleteDict.addEventListener('click', () => {
    dictionary = null;
    is_dictionary_created = false;
    btnDeleteDict.disabled = true;
    btnCreatedDict.innerText = 'Создать словарь';
    delete btnCreatedDict.dataset.create;
    btnTraining.disabled = true;
    helpClearFile(btnFile);
});

btnTraining.addEventListener('click', () => {
    pictureResult.src = '';
    pictureReaction.src = DEFAULT_IMAGE;
    sectionTraining.classList.remove(CSS_HIDE_CONTENT);
    sectionHome.classList.add(CSS_HIDE_CONTENT);
    startingTrainingProcess(dictionary);
});

for (const btnAnswer of btnAnswers) {
    btnAnswer.addEventListener('click', () => {
        const key = boxWordQuestion.dataset.key;
        const answer = btnAnswer.innerText;

        if (key === window.btoa(answer.toUpperCase())) {
            pictureResult.src = SUCCESS_PICTOGRAM;
            pictureReaction.src = CORRECT_IMAGE;
            answerCounting(countSuccess);
            startingTrainingProcess(dictionary);
        } else {
            pictureResult.src = FAIL_PICTOGRAM;
            pictureReaction.src = ERROR_IMAGE;
            answerCounting(countFailure);
        }
    });
}

// ======== Utilities functions =========
function initialState() {
    sectionSettings.classList.add(CSS_HIDE_CONTENT);
    sectionTraining.classList.add(CSS_HIDE_CONTENT);
    boxWarning.classList.add(CSS_HIDE_CONTENT);
    btnTraining.disabled = true;
    boxFileName.innerText = 'Выберите файл';

    if (!is_dictionary_created) {
        btnDeleteDict.disabled = true;
        btnCreatedDict.innerText = 'Создать словарь';
    }

    if (file === null) {
        btnCreatedDict.disabled = true;
    }
}

function readingFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            const readData = reader.result.split('\n').filter((item) => item.length > 0);
            resolve(readData);
        };
    });
}

function dataValidation(data) {
    if (data.length < MIN_NUMBER_ELEMENTS) return false;

    for (const item of data) {
        if (PATTERN_CHECKING_STRING.test(item)) continue;
        return false;
    }

    return true;
}

function fileErrorWarning(text) {
    boxWarning.classList.remove(CSS_HIDE_CONTENT);
    boxWarning.innerText = text;
    btnCreatedDict.disabled = true;
}

function createDictionaryWords(data) {
    const dictionary = new Map();

    data.map((item) => {
        const [key, value] = item.split(':');
        dictionary.set(key.trim(), value.trim());
    });

    return dictionary;
}

function addDictionaryWords(data) {
    const internalDictionary = createDictionaryWords(data);
    for (const item of internalDictionary) {
        const [key, value] = item;
        dictionary.set(key, value);
    }
}

function helpClearFile(fileList) {
    const dataTransfer = new DataTransfer();
    fileList.files = dataTransfer.files;
}

function startingTrainingProcess(dictionary) {
    const favoritePartDictionary = takeDictionaryRandomElements(dictionary, MAX_NUMBER_ELEMENTS_INVOLVED);
    const favoriteItem = takeDictionaryRandomElements(favoritePartDictionary, SINGLE_ELEMENT_DICTIONARY);
    assignWordsButtons(favoritePartDictionary, btnAnswers);
    assignWordQuestion(favoriteItem, boxWordQuestion);
}

function takeDictionaryRandomElements(dictionary, limit) {
    const workingDictionary = Array.from(dictionary);
    const stackSelectedIndexes = [];
    const selectedDictionaryItems = new Map();

    while (stackSelectedIndexes.length < limit) {
        const index = Math.floor(Math.random() * (workingDictionary.length - 0) + 0);
        if (stackSelectedIndexes.find((item) => item === index) === undefined) {
            stackSelectedIndexes.push(index);
            const [key, value] = workingDictionary[index];
            selectedDictionaryItems.set(key, value);
        }
    }

    return selectedDictionaryItems;
}

function assignWordsButtons(partDictionary, setButtons) {
    const workingDictionary = Array.from(partDictionary);

    for (let i = 0; i < workingDictionary.length; i++) {
        setButtons[i].innerText = workingDictionary[i][0];
    }
}

function assignWordQuestion(item, boxText) {
    const workingItemDictionary = Array.from(item);
    const [key, value] = workingItemDictionary[0];
    boxText.innerText = value;
    boxText.dataset.key = window.btoa(key.toUpperCase());
}

function answerCounting(boxOutput) {
    const oldValue = boxOutput.innerText;
    boxOutput.innerText = Number(oldValue) + 1;
}
