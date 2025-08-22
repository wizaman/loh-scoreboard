document.addEventListener('DOMContentLoaded', () => {
    const racesContainer = document.getElementById('races-container');
    const addRaceBtn = document.getElementById('add-race-btn');
    const totalScoreContainer = document.getElementById('total-score-details-container');
    let raceCounter = 0;

    // スコア計算関数
    function calculateScore(rank) {
        if (rank === 1) return 100;
        if (rank === 2) return 60;
        if (rank === 3) return 40;
        if (rank === 4) return 30;
        if (rank === 5) return 20;
        if (rank >= 6 && rank <= 12) return 10;
        return 0;
    }

    // 総合スコア表示を更新
    function updateTotalScores(scores) {
        totalScoreContainer.innerHTML = ''; // Clear previous scores

        // Sort trainers by score descending
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

    // レース全体のHTMLを生成
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
                        <p>スコア: <span class="race-score">0</span>点</p>
                    </div>
                    <div class="uma-ranks-container"></div>
                </div>
                <div class="trainer-section" data-trainer-id="2">
                    <div class="trainer-header">
                        <input type="text" class="trainer-name-input" placeholder="トレーナー名">
                        <p>スコア: <span class="race-score">0</span>点</p>
                    </div>
                    <div class="uma-ranks-container"></div>
                </div>
            </div>
        `;
        // Add event listeners to trainer name inputs
        raceDiv.querySelectorAll('.trainer-name-input').forEach(input => {
            input.addEventListener('input', performCalculation);
        });
        return raceDiv;
    }

    // ウマ娘の入力欄を生成
    function createUmaInputs(raceNum, trainerNum, container) {
        for (let i = 1; i <= 3; i++) {
            const group = document.createElement('div');
            group.classList.add('uma-rank-group');
            group.innerHTML = `<label>ウマ娘${i}:</label>`;

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.classList.add('uma-name');
            nameInput.placeholder = 'ウマ娘名';
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
                radio.addEventListener('change', performCalculation);

                const radioLabel = document.createElement('label');
                radioLabel.htmlFor = radioId;
                radioLabel.textContent = rank;

                rankContainer.appendChild(radio);
                rankContainer.appendChild(radioLabel);
            }
            group.appendChild(rankContainer);
            container.appendChild(group);
        }
    }

    // 新しいレースを追加する関数
    function addRace() {
        raceCounter++;
        const raceEl = createRaceElement(raceCounter);
        racesContainer.appendChild(raceEl);

        const [trainer1UmaContainer, trainer2UmaContainer] = raceEl.querySelectorAll('.uma-ranks-container');
        createUmaInputs(raceCounter, 1, trainer1UmaContainer);
        createUmaInputs(raceCounter, 2, trainer2UmaContainer);
        
        performCalculation();
    }

    // 全体の計算処理
    function performCalculation() {
        const aggregatedScores = {};

        document.querySelectorAll('.race-wrapper').forEach(raceWrapper => {
            const raceNum = raceWrapper.dataset.raceNum;
            
            raceWrapper.querySelectorAll('.trainer-section').forEach(trainerSection => {
                const trainerId = trainerSection.dataset.trainerId;
                const trainerNameInput = trainerSection.querySelector('.trainer-name-input');
                const trainerName = trainerNameInput.value.trim();
                
                let raceScore = 0;
                for (let u = 1; u <= 3; u++) {
                    const selectedRadio = document.querySelector(`input[name="race${raceNum}trainer${trainerId}Uma${u}"]:checked`);
                    if (selectedRadio) {
                        raceScore += calculateScore(parseInt(selectedRadio.value));
                    }
                }
                
                trainerSection.querySelector('.race-score').textContent = raceScore;

                if (trainerName) {
                    if (!aggregatedScores[trainerName]) {
                        aggregatedScores[trainerName] = 0;
                    }
                    aggregatedScores[trainerName] += raceScore;
                }
            });
        });

        updateTotalScores(aggregatedScores);
    }

    // イベントリスナーを設定
    addRaceBtn.addEventListener('click', addRace);

    // 初期状態で1レース表示
    addRace();
});
