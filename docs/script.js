document.addEventListener('DOMContentLoaded', () => {
    const racesContainer = document.getElementById('races-container');
    const addRaceBtn = document.getElementById('add-race-btn');
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

    // レース全体のHTMLを生成
    function createRaceElement(raceNum) {
        const raceDiv = document.createElement('div');
        raceDiv.classList.add('race-wrapper');
        raceDiv.dataset.raceNum = raceNum; // Store race number in a data attribute
        raceDiv.innerHTML = `
            <div class="race-number">${raceNum}R</div>
            <div class="race-container">
                <div class="trainer-section" id="race${raceNum}-trainer1-section">
                    <div class="trainer-header">
                        <h2>トレーナー1</h2>
                        <input type="text" id="race${raceNum}-trainer1Name" value="トレーナーA">
                        <p>スコア: <span id="race${raceNum}-trainer1Score">0</span>点</p>
                    </div>
                    <div class="uma-ranks-container"></div>
                </div>
                <div class="trainer-section" id="race${raceNum}-trainer2-section">
                    <div class="trainer-header">
                        <h2>トレーナー2</h2>
                        <input type="text" id="race${raceNum}-trainer2Name" value="トレーナーB">
                        <p>スコア: <span id="race${raceNum}-trainer2Score">0</span>点</p>
                    </div>
                    <div class="uma-ranks-container"></div>
                </div>
            </div>
        `;
        return raceDiv;
    }

    // ウマ娘の入力欄を生成
    function createUmaInputs(raceNum, trainerNum, container) {
        for (let i = 1; i <= 3; i++) {
            const group = document.createElement('div');
            group.classList.add('uma-rank-group');

            const label = document.createElement('label');
            label.textContent = `ウマ娘${i}:`;
            group.appendChild(label);

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.classList.add('uma-name');
            nameInput.id = `r${raceNum}t${trainerNum}u${i}Name`;
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

        const trainer1UmaContainer = raceEl.querySelector(`#race${raceCounter}-trainer1-section .uma-ranks-container`);
        const trainer2UmaContainer = raceEl.querySelector(`#race${raceCounter}-trainer2-section .uma-ranks-container`);

        createUmaInputs(raceCounter, 1, trainer1UmaContainer);
        createUmaInputs(raceCounter, 2, trainer2UmaContainer);
        
        performCalculation(); // Recalculate everything
    }

    // 全体の計算処理
    function performCalculation() {
        let totalTrainer1Score = 0;
        let totalTrainer2Score = 0;

        const raceWrappers = document.querySelectorAll('.race-wrapper');
        raceWrappers.forEach(raceWrapper => {
            const raceNum = raceWrapper.dataset.raceNum;
            let raceTrainer1Score = 0;
            let raceTrainer2Score = 0;

            // Trainer 1
            for (let u = 1; u <= 3; u++) {
                const selectedRadio = document.querySelector(`input[name="race${raceNum}trainer1Uma${u}"]:checked`);
                if (selectedRadio) {
                    raceTrainer1Score += calculateScore(parseInt(selectedRadio.value));
                }
            }

            // Trainer 2
            for (let u = 1; u <= 3; u++) {
                const selectedRadio = document.querySelector(`input[name="race${raceNum}trainer2Uma${u}"]:checked`);
                if (selectedRadio) {
                    raceTrainer2Score += calculateScore(parseInt(selectedRadio.value));
                }
            }

            const trainer1ScoreEl = document.getElementById(`race${raceNum}-trainer1Score`);
            if(trainer1ScoreEl) {
                trainer1ScoreEl.textContent = raceTrainer1Score;
            }

            const trainer2ScoreEl = document.getElementById(`race${raceNum}-trainer2Score`);
            if(trainer2ScoreEl) {
                trainer2ScoreEl.textContent = raceTrainer2Score;
            }


            totalTrainer1Score += raceTrainer1Score;
            totalTrainer2Score += raceTrainer2Score;
        });

        document.getElementById('trainer1TotalScore').textContent = totalTrainer1Score;
        document.getElementById('trainer2TotalScore').textContent = totalTrainer2Score;
    }

    // イベントリスナーを設定
    addRaceBtn.addEventListener('click', addRace);

    // 初期状態で1レース表示
    addRace();
    
    // 初期計算
    performCalculation();
});