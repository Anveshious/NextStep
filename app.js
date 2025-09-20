// app.js

console.log('NextStep initializing...');

// Sample problems data - added more for new challenges
const problems = [
    {
        id: 1,
        title: "Sum of Two Numbers",
        description: "Write a function that takes two numbers as parameters and returns their sum. Remember to handle both positive and negative numbers correctly.",
        difficulty: "easy",
        testCases: [
            { input: [1, 2], expected: 3, description: "Basic positive sum" },
            { input: [5, -3], expected: 2, description: "Positive + negative" },
            { input: [-1, -4], expected: -5, description: "Both negative" },
            { input: [0, 100], expected: 100, description: "Zero + positive" }
        ],
        hints: [
            "Use the + operator to add numbers",
            "Make sure your function returns the result",
            "Handle negative numbers correctly"
        ],
        optimizationHint: "This is already optimal, but consider using arrow functions for conciseness: const sum = (a, b) => a + b;",
        template: `function sumTwoNumbers(a, b) {
    // Your code here
}`
    },
    {
        id: 2,
        title: "Reverse a String",
        description: "Write a function that takes a string and returns it reversed. The function should work with any string length, including empty strings.",
        difficulty: "medium",
        testCases: [
            { input: ["hello"], expected: "olleh", description: "Basic reversal" },
            { input: ["world!"], expected: "!dlrow", description: "With punctuation" },
            { input: [""], expected: "", description: "Empty string" },
            { input: ["a"], expected: "a", description: "Single character" }
        ],
        hints: [
            "Consider using split(), reverse(), and join()",
            "Strings are immutable, so create a new string",
            "Test with empty strings and single characters"
        ],
        optimizationHint: "For better performance in large strings, use a loop instead of array methods.",
        template: `function reverseString(str) {
    // Your code here
}`
    },
    {
        id: 3,
        title: "Find Maximum in Array",
        description: "Write a function that finds and returns the maximum number in a given array of numbers. The array will always contain at least one element.",
        difficulty: "medium",
        testCases: [
            { input: [[1, 3, 2]], expected: 3, description: "Small array" },
            { input: [[-1, -5, 0, 3]], expected: 3, description: "Mixed numbers" },
            { input: [[42]], expected: 42, description: "Single element" },
            { input: [[10, 20, 15, 25, 5]], expected: 25, description: "Larger array" }
        ],
        hints: [
            "Use Math.max() with the spread operator [...array]",
            "Initialize with the first element and compare",
            "Consider using reduce() for a functional approach"
        ],
        optimizationHint: "Math.max(...arr) is simple, but for very large arrays, use a loop to avoid stack overflow.",
        template: `function findMax(arr) {
    // Your code here
}`
    },
    {
        id: 4,
        title: "Check Palindrome",
        description: "Write a function that checks if a given string is a palindrome (reads the same forwards and backwards, ignoring case and non-alphanumeric characters).",
        difficulty: "medium",
        testCases: [
            { input: ["radar"], expected: true, description: "Simple palindrome" },
            { input: ["hello"], expected: false, description: "Not palindrome" },
            { input: ["A man a plan a canal Panama"], expected: true, description: "With spaces and case" },
            { input: [""], expected: true, description: "Empty string" }
        ],
        hints: [
            "Remove non-alphanumeric characters and convert to lowercase",
            "Compare the string with its reverse",
            "Use two pointers approach for efficiency"
        ],
        optimizationHint: "Use two pointers from start and end to avoid creating a new string.",
        template: `function isPalindrome(str) {
    // Your code here
}`
    },
    {
        id: 5,
        title: "Factorial",
        description: "Write a function that computes the factorial of a non-negative integer n.",
        difficulty: "easy",
        testCases: [
            { input: [5], expected: 120, description: "Basic factorial" },
            { input: [0], expected: 1, description: "Factorial of 0" },
            { input: [1], expected: 1, description: "Factorial of 1" },
            { input: [10], expected: 3628800, description: "Larger number" }
        ],
        hints: [
            "Use recursion or a loop",
            "Base case: factorial(0) = 1",
            "Watch for stack overflow in recursion for large n"
        ],
        optimizationHint: "For large n, consider memoization or iterative approach to avoid recursion depth issues.",
        template: `function factorial(n) {
    // Your code here
}`
    },
    {
        id: 6,
        title: "FizzBuzz",
        description: "Write a function that returns an array of strings from 1 to n, where multiples of 3 are 'Fizz', multiples of 5 are 'Buzz', both are 'FizzBuzz', else the number.",
        difficulty: "easy",
        testCases: [
            { input: [5], expected: ["1","2","Fizz","4","Buzz"], description: "Small n" },
            { input: [15], expected: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"], description: "With FizzBuzz" }
        ],
        hints: [
            "Loop from 1 to n",
            "Check multiples using % operator",
            "Prioritize checking for both 3 and 5 first"
        ],
        optimizationHint: "This is O(n), which is optimal. Consider using string concatenation efficiently.",
        template: `function fizzBuzz(n) {
    // Your code here
}`
    },
    // Add more as needed
];

// User data management
let userData = JSON.parse(localStorage.getItem('NextStep-user')) || {
    solved: 0,
    attempts: {},
    timeSpent: 0,
    skillLevel: 'Beginner',
    history: [],
    badges: ['Welcome to NextStep! 🎉'],
    streak: 0,
    lastLogin: null,
    username: 'CodeWarrior',
    darkMode: false
};

let currentProblem = null;
let startTime = Date.now();
let editor = null;
let improvementChart = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing NextStep...');
    
    // Apply dark mode if set
    if (userData.darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode-toggle').textContent = '☀️';
    }
    
    // Update streak
    updateStreak();
    
    // Initialize editor
    initEditor();
    
    // Load initial problem
    loadNextProblem();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load dashboard if needed
    if (document.getElementById('dashboard').classList.contains('active')) {
        loadDashboard();
    }
});

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    userData.darkMode = document.body.classList.contains('dark-mode');
    document.getElementById('dark-mode-toggle').textContent = userData.darkMode ? '☀️' : '🌙';
    saveUserData();
    // Re-render chart if open
    if (improvementChart) {
        improvementChart.destroy();
        improvementChart = null;
        loadDashboard();
    }
}

function initEditor() {
    try {
        editor = ace.edit("editor");
        editor.setTheme("ace/theme/monokai");
        editor.session.setMode("ace/mode/javascript");
        editor.setOptions({
            fontSize: "14px",
            showGutter: true,
            showPrintMargin: false,
            wrap: true
        });
        // Dynamic theme for dark mode
        document.body.classList.contains('dark-mode') 
            ? editor.setTheme("ace/theme/monokai") 
            : editor.setTheme("ace/theme/chrome");
        console.log('Ace Editor initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Ace Editor:', error);
        // Fallback
        const fallbackEditor = document.createElement('textarea');
        fallbackEditor.style.width = '100%';
        fallbackEditor.style.height = '100%';
        fallbackEditor.value = '// Write your code here';
        document.getElementById('editor').appendChild(fallbackEditor);
    }
}

function setupEventListeners() {
    // Navigation...
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            
            document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            switch(targetId) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'history':
                    loadHistory();
                    break;
                case 'achievements':
                    loadAchievements();
                    break;
            }
        });
    });

    // Workspace buttons
    document.getElementById('run-code').addEventListener('click', runCode);
    document.getElementById('submit-code').addEventListener('click', submitCode);
    document.getElementById('next-problem').addEventListener('click', loadNextProblem);
    
    // Dark mode
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
}

function updateStreak() {
    // Same as before...
    const today = new Date().toDateString();
    
    if (!userData.lastLogin) {
        userData.streak = 1;
        userData.lastLogin = today;
    } else if (userData.lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (userData.lastLogin === yesterday.toDateString()) {
            userData.streak++;
        } else {
            userData.streak = 1;
        }
        userData.lastLogin = today;
    }
    
    document.getElementById('streak').textContent = userData.streak;
    document.getElementById('current-streak').textContent = userData.streak + ' days';
    
    saveUserData();
}

function loadNextProblem() {
    // Adaptive difficulty...
    let targetDifficulty = 'easy';
    const solvedCount = userData.solved;
    const avgAttempts = Object.values(userData.attempts).reduce((a, b) => a + b, 0) / Math.max(1, solvedCount);
    
    if (solvedCount > 5 && avgAttempts < 3) {
        targetDifficulty = 'medium';
    } else if (solvedCount > 12) {
        targetDifficulty = 'hard'; // But no hard yet, will fallback
    }
    
    let nextProblem = problems.find(p => 
        p.difficulty === targetDifficulty && 
        !userData.history.some(h => h.id === p.id && h.status === 'solved')
    );
    
    if (!nextProblem) {
        nextProblem = problems.find(p => 
            !userData.history.some(h => h.id === p.id && h.status === 'solved')
        ) || problems[Math.floor(Math.random() * problems.length)]; // Random if all solved
    }
    
    currentProblem = nextProblem;
    loadProblem(currentProblem);
}

function loadProblem(problem) {
    // Same as before, with loadDraft
    console.log('Loading problem:', problem.title);
    
    document.getElementById('loading-problem').style.display = 'block';
    document.getElementById('problem-content').style.display = 'none';
    
    setTimeout(() => {
        document.getElementById('loading-problem').style.display = 'none';
        document.getElementById('problem-content').style.display = 'block';
        
        document.getElementById('problem-title').textContent = problem.title;
        document.getElementById('problem-description').textContent = problem.description;
        
        const samplesDiv = document.getElementById('input-output-samples');
        samplesDiv.innerHTML = '<h4>📋 Sample Input/Output:</h4>';
        problem.testCases.slice(0, 2).forEach((tc, i) => {
            samplesDiv.innerHTML += `
                <div style="margin: 0.5rem 0; padding: 0.5rem; background: #e8f4f8; border-radius: 5px;">
                    <strong>Sample ${i+1}:</strong><br>
                    Input: <code>${JSON.stringify(tc.input)}</code><br>
                    Expected: <code>${JSON.stringify(tc.expected)}</code>
                </div>
            `;
        });
        
        document.getElementById('test-case-descriptions').innerHTML = `
            <h4>🧪 Test Cases (${problem.testCases.length} total):</h4>
            <p>Complete test suite will run when you submit. Includes edge cases and performance tests.</p>
        `;
        
        if (editor) {
            editor.setValue(problem.template || `// ${problem.title}\n\nfunction solution() {\n    // Your solution here\n}`);
            editor.focus();
        }
        
        document.getElementById('test-results').innerHTML = '<li>Ready to test your solution!</li>';
        showHints(['Think about the problem requirements', 'Consider edge cases', 'Test with sample inputs first']);
        
        loadDraft(problem.id);
        
        startTime = Date.now();
    }, 800);
}

function runCode() {
    // Same...
    if (!currentProblem) return;
    
    const code = editor ? editor.getValue() : '';
    const outputConsole = document.getElementById('output-console');
    
    outputConsole.textContent = 'Running...';
    
    setTimeout(() => {
        try {
            const func = new Function(code)();
            const sample = currentProblem.testCases[0];
            const result = func(...sample.input);
            
            outputConsole.innerHTML = `
                <span style="color: #00ff00;">Output:</span> ${JSON.stringify(result)}<br>
                <span style="color: #ccc;">Input was: ${JSON.stringify(sample.input)}</span><br>
                <span style="color: #ccc;">Expected: ${JSON.stringify(sample.expected)}</span>
            `;
        } catch (error) {
            outputConsole.innerHTML = `
                <span style="color: #ff4757;">❌ Error: ${error.message}</span><br>
                <small>Check your syntax and function definition</small>
            `;
        }
    }, 500);
}

function submitCode() {
    if (!currentProblem || !editor) return;
    
    const code = editor.getValue();
    const timeTaken = (Date.now() - startTime) / 1000;
    const minutes = Math.round(timeTaken / 60);
    
    userData.timeSpent += minutes;
    
    let passed = 0;
    const resultsList = document.getElementById('test-results');
    resultsList.innerHTML = '';
    let feedbackHints = [];
    
    try {
        const func = new Function(code)();
        
        const failedTests = [];
        currentProblem.testCases.forEach((tc, i) => {
            try {
                const result = func(...tc.input);
                const isPass = JSON.stringify(result) === JSON.stringify(tc.expected);
                
                if (isPass) passed++;
                else failedTests.push(i);
                
                const resultItem = document.createElement('li');
                resultItem.className = isPass ? 'pass' : 'fail';
                resultItem.innerHTML = `
                    <strong>${isPass ? '✓' : '✗'} Test ${i+1}: ${tc.description}</strong><br>
                    ${!isPass ? `Input: <code>${JSON.stringify(tc.input)}</code><br>Expected: <code>${JSON.stringify(tc.expected)}</code><br>Got: <code>${JSON.stringify(result)}</code>` : ''}
                `;
                resultsList.appendChild(resultItem);
            } catch (testError) {
                failedTests.push(i);
                const resultItem = document.createElement('li');
                resultItem.className = 'fail';
                resultItem.innerHTML = `<strong>✗ Test ${i+1}: Execution Error</strong><br><small>${testError.message}</small>`;
                resultsList.appendChild(resultItem);
                feedbackHints.push(`Error in test ${i+1}: ${testError.message}. Check your code for runtime issues.`);
            }
        });
        
        const attempts = (userData.attempts[currentProblem.id] || 0) + 1;
        userData.attempts[currentProblem.id] = attempts;
        
        const result = {
            id: currentProblem.id,
            status: passed === currentProblem.testCases.length ? 'solved' : 'failed',
            attempts,
            time: minutes,
            timestamp: new Date().toISOString()
        };
        
        userData.history.unshift(result);
        
        if (result.status === 'solved') {
            userData.solved++;
            awardBadges();
            updateSkillLevel();
            
            resultsList.insertAdjacentHTML('afterbegin', `
                <li class="pass" style="text-align: center; font-size: 1.2em; padding: 1rem;">
                    🎉 Congratulations! All tests passed! 🎉<br>
                    <small>Solved in ${minutes} minutes with ${attempts} attempt${attempts > 1 ? 's' : ''}</small>
                </li>
            `);
            
            feedbackHints = [currentProblem.optimizationHint || 'Great job! Consider refactoring for readability.'];
        } else {
            feedbackHints = [
                'Analyze the failing tests:',
                ...failedTests.map(i => `Test ${i+1} failed - ${currentProblem.testCases[i].description}. Hint: ${currentProblem.hints[i % currentProblem.hints.length]}`),
                ...currentProblem.hints
            ];
        }
    } catch (error) {
        resultsList.innerHTML = `
            <li class="fail" style="text-align: center;">
                <strong>❌ Compilation Error</strong><br>
                <small>${error.message}</small><br>
                <small>Common issues: Syntax errors, missing brackets, or invalid code structure.</small>
            </li>
        `;
        feedbackHints = [
            `Error: ${error.message}`,
            'Check for missing semicolons, unmatched parentheses, or invalid syntax.',
            'Ensure your function is properly defined and exported if needed.'
        ];
    }
    
    showHints(feedbackHints);
    
    saveUserData();
    updateDashboardStats();
}

function showHints(hints) {
    const hintsList = document.getElementById('hints-list');
    hintsList.innerHTML = '';
    
    hints.forEach((hint, index) => {
        const hintItem = document.createElement('li');
        hintItem.innerHTML = `<span style="color: #e67e22;">${index + 1}.</span> ${hint}`;
        hintsList.appendChild(hintItem);
    });
}

function updateSkillLevel() {
    // Same...
    const solved = userData.solved;
    if (solved >= 20) userData.skillLevel = 'Expert';
    else if (solved >= 10) userData.skillLevel = 'Intermediate';
    else if (solved >= 3) userData.skillLevel = 'Beginner';
    else userData.skillLevel = 'Newcomer';
}

function awardBadges() {
    // Same...
    const solved = userData.solved;
    
    if (solved === 1 && !userData.badges.includes('First Solve! 🎯')) userData.badges.push('First Solve! 🎯');
    if (solved === 5 && !userData.badges.includes('Beginner Master 🥉')) userData.badges.push('Beginner Master 🥉');
    if (solved === 10 && !userData.badges.includes('Intermediate Hero 🥈')) userData.badges.push('Intermediate Hero 🥈');
    if (userData.streak >= 7 && !userData.badges.includes('Week Streak 🔥')) userData.badges.push('Week Streak 🔥');
}

function loadDashboard() {
    updateDashboardStats();
    
    const ctx = document.getElementById('improvement-chart').getContext('2d');
    if (improvementChart) improvementChart.destroy();
    
    improvementChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: userData.history.slice(0, 10).map((_, i) => `P${i+1}`),
            datasets: [{
                label: 'Time (minutes)',
                data: userData.history.slice(0, 10).map(h => h.time || 1),
                borderColor: document.body.classList.contains('dark-mode') ? '#9fa8da' : '#667eea',
                backgroundColor: document.body.classList.contains('dark-mode') ? 'rgba(159, 168, 218, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, color: document.body.classList.contains('dark-mode') ? '#ddd' : '#333' } },
                x: { ticks: { color: document.body.classList.contains('dark-mode') ? '#ddd' : '#333' } }
            }
        }
    });
}

function updateDashboardStats() {
    document.getElementById('problems-solved').textContent = userData.solved;
    document.getElementById('time-spent').textContent = Math.round(userData.timeSpent) + ' min';
    document.getElementById('skill-level').textContent = userData.skillLevel;
}

function loadHistory() {
    // Same...
    const historyList = document.getElementById('problem-history');
    historyList.innerHTML = '';
    
    if (userData.history.length === 0) {
        historyList.innerHTML = '<li class="history-item" style="text-align: center; color: #666;">No solutions yet - start coding!</li>';
        return;
    }
    
    const problemHistory = {};
    userData.history.forEach(entry => {
        if (!problemHistory[entry.id]) problemHistory[entry.id] = [];
        problemHistory[entry.id].push(entry);
    });
    
    Object.entries(problemHistory).forEach(([problemId, entries]) => {
        const problem = problems.find(p => p.id == problemId);
        if (problem) {
            const latest = entries[0];
            const historyItem = document.createElement('li');
            historyItem.className = `history-item ${latest.status}`;
            historyItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${problem.title}</strong><br>
                        <small>${latest.status === 'solved' ? '✓ Solved' : '⚠ In Progress'}</small> | 
                        <small>${latest.attempts} attempt${latest.attempts > 1 ? 's' : ''}</small> | 
                        <small>${latest.time} min</small>
                    </div>
                    <span style="font-size: 1.2em;">${latest.status === 'solved' ? '🎉' : '🔄'}</span>
                </div>
            `;
            historyList.appendChild(historyItem);
        }
    });
}

function loadAchievements() {
    // Same...
    const badgesList = document.getElementById('badges-list');
    badgesList.innerHTML = '';
    
    userData.badges.forEach(badge => {
        const badgeItem = document.createElement('li');
        badgeItem.className = 'badge-item';
        badgeItem.textContent = badge;
        badgesList.appendChild(badgeItem);
    });
}

function saveUserData() {
    localStorage.setItem('NextStep-user', JSON.stringify(userData));
}

function loadDraft(problemId) {
    const draft = localStorage.getItem(`NextStep-draft-${problemId}`);
    if (draft && editor) editor.setValue(draft);
}

setInterval(() => {
    if (editor && currentProblem) {
        localStorage.setItem(`NextStep-draft-${currentProblem.id}`, editor.getValue());
    }
}, 30000);

console.log('NextStep fully initialized! Ready to code 🚀');