let randomUserNum = 0;
let numOfDifferentTokens = 0;
function saveScore(nickname, score) {
    const scoreKey = numOfDifferentTokens > 1 ? 'multiplayerScores' : 'singlePlayerScores';
    let scores = JSON.parse(localStorage.getItem(scoreKey)) || [];

    scores.push({ nickname, score });
    // Sort scores in descending order based on score
    scores.sort((a, b) => b.score - a.score);
    // Keep only the top 10 scores
    scores = scores.slice(0, 10);

    localStorage.setItem(scoreKey, JSON.stringify(scores));
    updateLeaderboard(score);

    if(numOfDifferentTokens > 1) {
        submitScore(nickname, score);
        fetchAndDisplayLeaderboard();
    }
}

function updateLeaderboard(score) {
    const scoresList = document.getElementById('scoresList');
    scoresList.innerHTML = ''; // Clear current list
    console.log(numOfDifferentTokens);
    const scoreKey = numOfDifferentTokens > 1 ? 'multiplayerScores' : 'singlePlayerScores';
    const scores = JSON.parse(localStorage.getItem(scoreKey)) || [];

    // Sort scores in descending order and take the top 10
    scores.sort((a, b) => b.score - a.score).slice(0, 10).forEach(({ nickname, score }) => {
        const li = document.createElement('li');
        li.textContent = `${nickname}: ${score}`;
        scoresList.appendChild(li);
    });
}

function promptForNickname() {
    let nickname = localStorage.getItem('nickname');
    if (nickname == null) {
        nickname = prompt("Enter your nickname for the leaderboard:");
        localStorage.setItem('nickname', nickname ? nickname.trim() : `Random Player ${++randomUserNum}`);
    }
    return nickname;
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
        token = generateUserToken(); // Assume generateUserToken() is defined as before
        localStorage.setItem('userToken', token);
        numOfDifferentTokens++;
    }
    return token;
}
function submitScore(nickname, score) {
    fetch('/submit-score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, score }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to submit score');
        }
        return response.text();
    })
    .then(() => {
        console.log('Score submitted successfully');
        // Optionally, refresh the leaderboard here
    })
    .catch(error => {
        console.error('Error submitting score:', error);
    });
}
function fetchAndDisplayLeaderboard() {
    fetch('/leaderboard')
    .then(response => response.json())
    .then(scores => {
        // Assume you have an HTML element to display the leaderboard
        const leaderboardElement = document.getElementById('leaderboard');
        leaderboardElement.innerHTML = scores.map(score => `<li>${score.nickname}: ${score.score}</li>`).join('');
    })
    .catch(error => {
        console.error('Error fetching leaderboard:', error);
    });
}
