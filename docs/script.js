document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const racesContainer = document.getElementById('races-container');
    const addRaceBtn = document.getElementById('add-race-btn');
    const copyJsonBtn = document.getElementById('copy-json-btn');
    const resetBtn = document.getElementById('reset-btn');
    const totalScoreContainer = document.getElementById('total-score-details-container');

    // --- State ---
    let raceCounter = 0;
    const LOCAL_STORAGE_KEY = 'lohScoreboardState';

    // --- Core Functions ---

    function calculateScore(rank) {
        if (rank === 1) return 100;
        if (rank === 2) return 60;
        if (rank === 3) return 40;
        if (rank === 4) return 30;
        if (rank === 5) return 20;
        if (rank >= 6 && rank <= 12) return 10;
        return 0;
    }

    function performCalculationAndSave() {
        const aggregatedScores = {};

        document.querySelectorAll('.race-wrapper').forEach(raceWrapper => {
            const allRanksInRace = [];
            const rankElementsInRace = []; // To store references to radio button labels for highlighting

            // Clear previous errors for this race
            raceWrapper.querySelectorAll('.tie-error-message').forEach(el => el.textContent = '');
            raceWrapper.querySelectorAll('.rank-radio-buttons label').forEach(label => {
                label.classList.remove('error-rank');
            });

            const trainerSections = raceWrapper.querySelectorAll('.trainer-section');
            const trainerRankData = new Map(); // Map to store ranks selected by each trainer

            trainerSections.forEach(trainerSection => {
                const trainerNameInput = trainerSection.querySelector('.trainer-name-input');
                const trainerName = trainerNameInput.value.trim();
                
                let raceScore = 0;
                const currentTrainerRanks = []; // Ranks selected by the current trainer
                trainerSection.querySelectorAll('.uma-rank-group').forEach((group, index) => {
                    const selectedRadio = group.querySelector('input[type="radio"]:checked');
                    if (selectedRadio) {
                        const rank = parseInt(selectedRadio.value);
                        allRanksInRace.push(rank);
                        currentTrainerRanks.push(rank);
                        rankElementsInRace.push({
                            rank: rank,
                            label: group.querySelector(`label[for="${selectedRadio.id}"]`),
                            trainerSection: trainerSection // Store reference to trainer section
                        });
                        raceScore += calculateScore(rank);
                    }
                });
                trainerRankData.set(trainerSection, currentTrainerRanks); // Store trainer's ranks

                trainerSection.querySelector('.race-score').textContent = raceScore;

                if (trainerName) {
                    aggregatedScores[trainerName] = (aggregatedScores[trainerName] || 0) + raceScore;
                }
            });

            // Check for ties across all Uma Musume in the current race
            const seenRanks = new Set();
            const tiedRanks = new Set();
            allRanksInRace.forEach(rank => {
                if (seenRanks.has(rank)) {
                    tiedRanks.add(rank);
                }
                seenRanks.add(rank);
            });

            if (tiedRanks.size > 0) {
                // Highlight tied ranks
                rankElementsInRace.forEach(item => {
                    if (tiedRanks.has(item.rank)) {
                        item.label.classList.add('error-rank');
                    }
                });

                // Display error message only for affected trainers
                trainerSections.forEach(trainerSection => {
                    const trainerRanks = trainerRankData.get(trainerSection);
                    const hasTieForTrainer = trainerRanks.some(rank => tiedRanks.has(rank));
                    if (hasTieForTrainer) {
                        trainerSection.querySelector('.tie-error-message').textContent = '同着入力エラー！';
                    }
                });
            }
        });

        updateTotalScores(aggregatedScores);
        saveState();
    }

    // --- UI Update Functions ---

    function updateTotalScores(scores) {
        totalScoreContainer.innerHTML = '';
        const sortedTrainers = Object.entries(scores).sort(([, a], [, b]) => b - a);

        if (sortedTrainers.length === 0) {
            totalScoreContainer.innerHTML = '<p>トレーナー名を入力して着順を選択してください</p>';
            return;
        }

        sortedTrainers.forEach(([name, score], index) => {
            const scoreEntry = document.createElement('div');
            scoreEntry.classList.add('score-entry');
            scoreEntry.innerHTML = `
                <span class="rank">${index + 1}.</span>
                <span class="trainer-name">${name}</span>
                <span class="trainer-score">${score}点</span>
            `;
            totalScoreContainer.appendChild(scoreEntry);
        });
    }

    // --- DOM Creation Functions ---

    function createRaceElement(raceNum) {
        const raceDiv = document.createElement('div');
        raceDiv.classList.add('race-wrapper');
        raceDiv.dataset.raceNum = raceNum;
        raceDiv.innerHTML = `
            <div class="race-number">${raceNum}R</div>
            <div class="race-container">
                <div class="trainer-section" data-trainer-id="1">
                    <div class="trainer-header">
                        <input type="text" class="trainer-name-input" placeholder="トレーナー名">
                        <p>スコア: <span class="race-score">0</span>点 <span class="tie-error-message" style="color: red; font-size: 0.8em;"></span></p>
                    </div>
                    <div class="uma-ranks-container"></div>
                </div>
                <div class="trainer-section" data-trainer-id="2">
                    <div class="trainer-header">
                        <input type="text" class="trainer-name-input" placeholder="トレーナー名">
                        <p>スコア: <span class="race-score">0</span>点 <span class="tie-error-message" style="color: red; font-size: 0.8em;"></span></p>
                    </div>
                    <div class="uma-ranks-container"></div>
                </div>
            </div>
        `;
        raceDiv.querySelectorAll('.trainer-name-input').forEach(input => {
            input.addEventListener('input', performCalculationAndSave);
        });
        return raceDiv;
    }

    function createUmaInputs(raceNum, trainerNum, container) {
        for (let i = 1; i <= 3; i++) {
            const group = document.createElement('div');
            group.classList.add('uma-rank-group');
            group.innerHTML = `<label>ウマ娘${i}:</label>`;
            
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.classList.add('uma-name');
            nameInput.placeholder = 'ウマ娘名';
            nameInput.addEventListener('input', saveState);
            group.appendChild(nameInput);

            const rankContainer = document.createElement('div');
            rankContainer.classList.add('rank-radio-buttons');
            for (let rank = 1; rank <= 12; rank++) {
                const radioId = `r${raceNum}t${trainerNum}u${i}r${rank}`;
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.id = radioId;
                radio.name = `race${raceNum}trainer${trainerNum}Uma${i}`;
                radio.value = rank;
                radio.addEventListener('change', performCalculationAndSave);
                rankContainer.appendChild(radio);

                const radioLabel = document.createElement('label');
                radioLabel.htmlFor = radioId;
                radioLabel.textContent = rank;
                rankContainer.appendChild(radioLabel);
            }
            group.appendChild(rankContainer);
            container.appendChild(group);
        }
    }

    function addRace() {
        raceCounter++;
        const raceEl = createRaceElement(raceCounter);
        racesContainer.appendChild(raceEl);

        const [t1Container, t2Container] = raceEl.querySelectorAll('.uma-ranks-container');
        createUmaInputs(raceCounter, 1, t1Container);
        createUmaInputs(raceCounter, 2, t2Container);
        
        performCalculationAndSave();
    }

    // --- State Management ---

    function getStateAsObject() {
        const races = [];
        document.querySelectorAll('.race-wrapper').forEach(raceWrapper => {
            const raceData = { trainers: [] };
            raceWrapper.querySelectorAll('.trainer-section').forEach(trainerSection => {
                const trainerData = { uma: [] };
                trainerData.name = trainerSection.querySelector('.trainer-name-input').value;
                trainerSection.querySelectorAll('.uma-rank-group').forEach(group => {
                    const umaName = group.querySelector('.uma-name').value;
                    const checkedRank = group.querySelector('input[type="radio"]:checked');
                    trainerData.uma.push({
                        name: umaName,
                        rank: checkedRank ? parseInt(checkedRank.value) : null
                    });
                });
                raceData.trainers.push(trainerData);
            });
            races.push(raceData);
        });
        return { races };
    }

    function saveState() {
        const state = getStateAsObject();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }

    function loadState(state) {
        racesContainer.innerHTML = '';
        raceCounter = 0;
        state.races.forEach(() => {
            raceCounter++;
            const raceEl = createRaceElement(raceCounter);
            racesContainer.appendChild(raceEl);
            const [t1Container, t2Container] = raceEl.querySelectorAll('.uma-ranks-container');
            createUmaInputs(raceCounter, 1, t1Container);
            createUmaInputs(raceCounter, 2, t2Container);
        });

        document.querySelectorAll('.race-wrapper').forEach((raceWrapper, raceIndex) => {
            const raceData = state.races[raceIndex];
            raceWrapper.querySelectorAll('.trainer-section').forEach((trainerSection, trainerIndex) => {
                const trainerData = raceData.trainers[trainerIndex];
                trainerSection.querySelector('.trainer-name-input').value = trainerData.name;
                trainerSection.querySelectorAll('.uma-rank-group').forEach((group, umaIndex) => {
                    const umaData = trainerData.uma[umaIndex];
                    group.querySelector('.uma-name').value = umaData.name;
                    if (umaData.rank) {
                        const rankRadio = group.querySelector(`input[value="${umaData.rank}"]`);
                        if (rankRadio) rankRadio.checked = true;
                    }
                });
            });
        });
        performCalculationAndSave();
    }

    function loadStateFromLocalStorage() {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
            try {
                loadState(JSON.parse(savedState));
            } catch (e) {
                console.error("Failed to parse or load state:", e);
                addRace(); // Start fresh if state is corrupted
            }
        } else {
            addRace();
        }
    }

    // --- Event Handlers ---

    function copyStateToClipboard() {
        const state = getStateAsObject();
        const jsonString = JSON.stringify(state, null, 2); // Pretty print JSON
        navigator.clipboard.writeText(jsonString).then(() => {
            const originalText = copyJsonBtn.textContent;
            copyJsonBtn.textContent = 'Copied!';
            setTimeout(() => { copyJsonBtn.textContent = originalText; }, 2000);
        }).catch(err => {
            console.error('Failed to copy JSON', err);
            alert('JSONのコピーに失敗しました。');
        });
    }

    function resetState() {
        if (window.confirm('すべての入力データをリセットして初期状態に戻します。よろしいですか？')) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            location.reload();
        }
    }

    // --- Initialization ---
    addRaceBtn.addEventListener('click', addRace);
    copyJsonBtn.addEventListener('click', copyStateToClipboard);
    resetBtn.addEventListener('click', resetState);

    loadStateFromLocalStorage();
});