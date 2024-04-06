let randomUserNum = 0;
function saveScore(nickname, score) {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    // Replace undefined, null, or empty nickname with "unknown"
    const safeNickname = nickname ? nickname.trim() : `Random Player ${++randomUserNum}`;

    scores.push({ nickname: safeNickname, score });
    scores.sort((a, b) => b.score - a.score);
    scores.splice(10); // Keep only top 10 scores
    localStorage.setItem('scores', JSON.stringify(scores));
}

function getTopScores() {
    return JSON.parse(localStorage.getItem('scores')) || [];
}

function updateLeaderboard() {
    const scoresList = document.getElementById('scoresList');
    scoresList.innerHTML = ''; // Clear current list
    const topScores = getTopScores(); // Assuming this returns an array of { nickname, score } objects

    topScores.forEach(({ nickname, score }) => {
        const li = document.createElement('li');
        // Replace undefined, null, or empty nickname with "unknown"
        li.textContent = `${nickname ? nickname.trim() : "unknown"}: ${score}`;
        scoresList.appendChild(li);
    });
}

function promptForNicknameAndSaveScore(score) {
    let nickname = prompt("Enter your nickname for the leaderboard:");
    saveScore(nickname, score);
    updateLeaderboard();
}

function generateUserToken() {
    // Simple UUID v4 generation, consider using a library for more robust UUID generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getUserToken() {
    let token = localStorage.getItem('userToken');
    if (!token) {
        token = generateUserToken();
        localStorage.setItem('userToken', token);
    }
    return token;
}

