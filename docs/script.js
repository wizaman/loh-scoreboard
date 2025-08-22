document.addEventListener('DOMContentLoaded', () => {
    const rankInputs = document.querySelectorAll('.uma-rank');
    const nameInputs = document.querySelectorAll('input[type="text"]');

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

    // 全体の計算処理
    function performCalculation() {
        // プレイヤー1の処理
        const player1Name = document.getElementById('player1Name').value;
        const player1Uma1Rank = parseInt(document.getElementById('player1Uma1').value);
        const player1Uma2Rank = parseInt(document.getElementById('player1Uma2').value);
        const player1Uma3Rank = parseInt(document.getElementById('player1Uma3').value);

        const player1TotalScore =
            calculateScore(player1Uma1Rank) +
            calculateScore(player1Uma2Rank) +
            calculateScore(player1Uma3Rank);

        document.getElementById('player1Score').textContent = player1TotalScore;

        // プレイヤー2の処理
        const player2Name = document.getElementById('player2Name').value;
        const player2Uma1Rank = parseInt(document.getElementById('player2Uma1').value);
        const player2Uma2Rank = parseInt(document.getElementById('player2Uma2').value);
        const player2Uma3Rank = parseInt(document.getElementById('player2Uma3').value);

        const player2TotalScore =
            calculateScore(player2Uma1Rank) +
            calculateScore(player2Uma2Rank) +
            calculateScore(player2Uma3Rank);

        document.getElementById('player2Score').textContent = player2TotalScore;
    }

    // 各着順入力フィールドに変更があった場合に計算を実行
    rankInputs.forEach(input => {
        input.addEventListener('input', performCalculation);
    });

    // プレイヤー名入力フィールドに変更があった場合に計算を実行
    nameInputs.forEach(input => {
        input.addEventListener('input', performCalculation);
    });

    // 初期表示時に一度計算を実行
    performCalculation();
});