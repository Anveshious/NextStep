// app.js

// Core data structures
const problems = [
    // Sample problems: each has id, title, description, difficulty, testCases, hints
    {
        id: 1,
        title: "Sum of Two Numbers",
        description: "Write a function that takes two numbers and returns their sum.",
        difficulty: "easy",
        testCases: [
            { input: [1, 2], expected: 3 },
            { input: [5, 5], expected: 10 },
            { input: [-1, 1], expected: 0 }
        ],
        hints: ["Use the + operator.", "Ensure function returns a value."]
    },
    {
        id: 2,
        title: "Reverse a String",
        description: "Write a function that reverses a given string.",
        difficulty: "medium",
        testCases: [
            { input: ["hello"], expected: "olleh" },
            { input: ["world"], expected: "dlrow" },
            { input: [""], expected: "" }
        ],
        hints: ["Use split, reverse, join.", "Handle empty string."]
    },
    {
        id: 3,
        title: "Fibonacci Sequence",
        description: "Write a function that returns the nth Fibonacci number.",
        difficulty: "hard",
        testCases: [
            { input: [0], expected: 0 },
            { input: [1], expected: 1 },
            { input: [10], expected: 55 }
        ],
        hints: ["Use recursion or iteration.", "Optimize for performance."]
    }
    // Add more problems as needed
];

// User performance tracking
let userData = JSON.parse(localStorage.getItem('userData')) || {
    solved: 0,
    attempts: {},
    timeSpent: 0,
    skillLevel: 'Beginner',
    history: [],
    badges: [],
    streak: 0,
    lastLogin: new Date().toDateString()
};

// Update streak on load
const today = new Date().toDateString();
if (userData.lastLogin !== today) {
    // Check if consecutive
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (userData.lastLogin === yesterday.toDateString()) {
        userData.streak++;
    } else {
        userData.streak = 1;
    }
    userData.lastLogin = today;
    saveUserData();
}
document.getElementById('streak').textContent = userData.streak;

// Navigation handling
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        if (targetId === 'dashboard') loadDashboard();
        if (targetId === 'history') loadHistory();
        if (targetId === 'achievements') loadAchievements();
    });
});

// Initialize editor (using Ace)
const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
editor.setValue(`// Write your code here\nfunction solution() {\n    // Implement the function\n}`);

// Current problem
let currentProblem = problems[0];
let startTime = Date.now();

// Load initial problem
loadProblem(currentProblem);

// Function to load a problem
function loadProblem(problem) {
    document.getElementById('problem-title').textContent = problem.title;
    document.getElementById('problem-description').textContent = problem.description;

    // Randomized samples (for demo, just show test cases as samples)
    const samplesDiv = document.getElementById('input-output-samples');
    samplesDiv.innerHTML = '<h4>Sample Input/Output:</h4>';
    problem.testCases.forEach((tc, i) => {
        samplesDiv.innerHTML += `<p>Sample ${i+1}: Input: ${JSON.stringify(tc.input)}, Expected: ${JSON.stringify(tc.expected)}</p>`;
    });

    // Test case descriptions (generic for now)
    document.getElementById('test-case-descriptions').innerHTML = '<h4>Test Cases:</h4><p>There are hidden test cases to evaluate your code.</p>';

    // Reset editor if needed
    editor.setValue(`// ${problem.description}\nfunction solution(${problem.testCases[0].input.length > 1 ? 'a, b' : 'n'}) {\n    // Your code\n}`);

    // Reset tests and hints
    document.getElementById('test-results').innerHTML = '';
    document.getElementById('hints-list').innerHTML = '';

    startTime = Date.now();
}

// Run code button
document.getElementById('run-code').addEventListener('click', () => {
    const code = editor.getValue();
    const outputConsole = document.getElementById('output-console');
    outputConsole.textContent = '';

    try {
        // Simulate run: eval code and call solution with sample input
        const func = new Function(`return ${code}`)();
        const result = func(...currentProblem.testCases[0].input);
        outputConsole.textContent = `Result: ${JSON.stringify(result)}`;
    } catch (err) {
        outputConsole.textContent = `Error: ${err.message}`;
    }
});

// Submit code button
document.getElementById('submit-code').addEventListener('click', submitCode);

// Submit logic
function submitCode() {
    const code = editor.getValue();
    const timeTaken = (Date.now() - startTime) / 60000; // minutes
    userData.timeSpent += timeTaken;

    let passed = 0;
    const resultsList = document.getElementById('test-results');
    resultsList.innerHTML = '';

    try {
        const func = new Function(`return ${code}`)();

        currentProblem.testCases.forEach((tc, i) => {
            const result = func(...tc.input);
            const isPass = JSON.stringify(result) === JSON.stringify(tc.expected);
            if (isPass) passed++;
            resultsList.innerHTML += `<li>Test ${i+1}: ${isPass ? 'Pass' : `Fail (Expected: ${JSON.stringify(tc.expected)}, Got: ${JSON.stringify(result)})`}</li>`;
        });
    } catch (err) {
        resultsList.innerHTML += `<li>Error: ${err.message}</li>`;
    }

    const attempts = (userData.attempts[currentProblem.id] || 0) + 1;
    userData.attempts[currentProblem.id] = attempts;

    if (passed === currentProblem.testCases.length) {
        userData.solved++;
        userData.history.push({ id: currentProblem.id, status: 'solved', attempts, time: timeTaken });
        awardBadges();
        updateSkillLevel();
        showHints([]); // Clear hints on success
    } else {
        userData.history.push({ id: currentProblem.id, status: 'failed', attempts, time: timeTaken });
        // Show hints based on failure (mock AI)
        showHints(currentProblem.hints);
    }

    saveUserData();
}

// Show hints
function showHints(hints) {
    const hintsList = document.getElementById('hints-list');
    hintsList.innerHTML = '';
    hints.forEach(hint => {
        hintsList.innerHTML += `<li>${hint}</li>`;
    });
}

// Next problem button: adaptive
document.getElementById('next-problem').addEventListener('click', () => {
    // Adaptive logic: based on solved and attempts
    let nextDifficulty = 'easy';
    if (userData.solved > 5 && Object.values(userData.attempts).reduce((a, b) => a + b, 0) / userData.solved < 2) {
        nextDifficulty = 'medium';
    }
    if (userData.solved > 10) {
        nextDifficulty = 'hard';
    }

    // Find next unsolved problem of that difficulty
    const nextProblem = problems.find(p => p.difficulty === nextDifficulty && !userData.history.some(h => h.id === p.id && h.status === 'solved')) || problems[0];
    currentProblem = nextProblem;
    loadProblem(nextProblem);
});

// Update skill level
function updateSkillLevel() {
    if (userData.solved > 20) userData.skillLevel = 'Expert';
    else if (userData.solved > 10) userData.skillLevel = 'Intermediate';
    else userData.skillLevel = 'Beginner';
}

// Award badges
function awardBadges() {
    if (userData.solved === 5 && !userData.badges.includes('Novice Coder')) {
        userData.badges.push('Novice Coder');
    }
    if (userData.solved === 10 && !userData.badges.includes('Pro Coder')) {
        userData.badges.push('Pro Coder');
    }
    if (userData.streak >= 7 && !userData.badges.includes('Streak Master')) {
        userData.badges.push('Streak Master');
    }
}

// Load dashboard
function loadDashboard() {
    document.getElementById('problems-solved').textContent = userData.solved;
    document.getElementById('time-spent').textContent = Math.round(userData.timeSpent) + ' minutes';
    document.getElementById('skill-level').textContent = userData.skillLevel;

    // Improvement chart
    const ctx = document.getElementById('improvement-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: userData.history.map((_, i) => `Problem ${i+1}`),
            datasets: [{
                label: 'Time Taken (min)',
                data: userData.history.map(h => h.time),
                borderColor: '#007bff'
            }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });

    // Recommended paths (mock)
    const pathsList = document.querySelector('#recommended-paths ul');
    pathsList.innerHTML = '<li>Start with Easy Algorithms</li><li>Move to Data Structures</li>';
}

// Load history
function loadHistory() {
    const historyList = document.getElementById('problem-history');
    historyList.innerHTML = '';
    userData.history.forEach(h => {
        const problem = problems.find(p => p.id === h.id);
        historyList.innerHTML += `<li>${problem.title} - ${h.status} (Attempts: ${h.attempts}, Time: ${Math.round(h.time)} min)</li>`;
    });
}

// Load achievements
function loadAchievements() {
    const badgesList = document.getElementById('badges-list');
    badgesList.innerHTML = '';
    userData.badges.forEach(b => {
        badgesList.innerHTML += `<li>${b}</li>`;
    });
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('userData', JSON.stringify(userData));
}