document.addEventListener('DOMContentLoaded', () => {
    const trainerSections = document.querySelectorAll('.trainer-section');
    const nameInputs = document.querySelectorAll('input[type="text"].uma-name');

    // スコア計算関数
    function calculateScore(rank) {
        if (rank === 1) return 100;
        if (rank === 2) return 60;
        if (rank === 3) return 40;
        if (rank === 4) return 30;
        if (rank === 5) return 20;
        if (rank >= 6 && rank <= 12) return 10;
        return 0; // 無効な着順の場合
    }

    // トレーナーごとのラジオボタンを生成し、イベントリスナーを設定
    trainerSections.forEach((section, trainerIndex) => {
        const trainerNumber = trainerIndex + 1;
        const umaRankGroups = section.querySelectorAll('.uma-rank-group');

        umaRankGroups.forEach((group, umaIndex) => {
            const umaNumber = umaIndex + 1;
            const rankContainer = document.createElement('div');
            rankContainer.classList.add('rank-radio-buttons');

            for (let rank = 1; rank <= 12; rank++) {
                const radioId = `t${trainerNumber}u${umaNumber}r${rank}`;
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.id = radioId;
                radio.name = `trainer${trainerNumber}Uma${umaNumber}`;
                radio.value = rank;
                radio.addEventListener('change', performCalculation);

                const label = document.createElement('label');
                label.htmlFor = radioId;
                label.textContent = rank;

                rankContainer.appendChild(radio);
                rankContainer.appendChild(label);
            }
            group.appendChild(rankContainer);
        });
    });

    // 全体の計算処理
    function performCalculation() {
        trainerSections.forEach((section, trainerIndex) => {
            const trainerNumber = trainerIndex + 1;
            let totalScore = 0;
            const umaRankGroups = section.querySelectorAll('.uma-rank-group');

            umaRankGroups.forEach((group, umaIndex) => {
                const umaNumber = umaIndex + 1;
                const selectedRadio = document.querySelector(`input[name="trainer${trainerNumber}Uma${umaNumber}"]:checked`);
                if (selectedRadio) {
                    totalScore += calculateScore(parseInt(selectedRadio.value));
                }
            });

            document.getElementById(`trainer${trainerNumber}Score`).textContent = totalScore;
        });
    }

    // 初期表示時に一度計算を実行
    performCalculation();
});
