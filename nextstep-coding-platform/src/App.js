import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Chart from 'chart.js/auto';
import { problems } from './data/problems';
import Signup from "./components/Signup";
import Login from "./components/Login";

function App() {
  // State management
  const [activeSection, setActiveSection] = useState('workspace');
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('NextStep-user');
    return saved ? JSON.parse(saved) : {
      solved: 0,
      attempts: {},
      timeSpent: 0,
      skillLevel: 'Beginner',
      history: [],
      badges: ['Welcome to NextStep! 🎉'],
      streak: 0,
      lastLogin: null,
      username: 'CodeWarrior',
      darkMode: false,
      topicStats: { 
        "Math": { solved: 0, attempted: 0, accuracy: 0 },
        "Strings": { solved: 0, attempted: 0, accuracy: 0 },
        "Arrays": { solved: 0, attempted: 0, accuracy: 0 },
        "Recursion": { solved: 0, attempted: 0, accuracy: 0 },
        "Searching": { solved: 0, attempted: 0, accuracy: 0 },
        "Dynamic Programming": { solved: 0, attempted: 0, accuracy: 0 },
        "Graphs": { solved: 0, attempted: 0, accuracy: 0 }
      }
    };
  });
  const [currentProblem, setCurrentProblem] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState([{ text: 'Submit your code to see test results', style: 'color: #666; text-align: center;' }]);
  const [hints, setHints] = useState(['Read the problem carefully', 'Check the sample inputs/outputs', 'Test edge cases']);
  const [output, setOutput] = useState('Click "Run Code" to test your solution');
  const [isLoading, setIsLoading] = useState(true);
  const [progressChart, setProgressChart] = useState(null);

  const editorRef = useRef(null);
  const chartRef = useRef(null);

  // Effects
  useEffect(() => {
    // Apply dark mode
    if (userData.darkMode) {
      document.body.classList.add('dark-mode');
    }
    
    // Update streak
    updateStreak();
    
    // Load first problem
    loadNextProblem();
    
    // Auto-save interval
    const saveInterval = setInterval(saveUserData, 30000);
    
    return () => clearInterval(saveInterval);
  }, []);

  useEffect(() => {
    if (activeSection === 'dashboard') {
      createProgressChart();
    }
  }, [activeSection, userData]);

  // Utility Functions
  const saveUserData = () => {
    localStorage.setItem('NextStep-user', JSON.stringify(userData));
    if (currentProblem) {
      localStorage.setItem(`NextStep-draft-${currentProblem.id}`, code);
    }
    setUserData(prev => ({ ...prev }));
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    let newStreak = userData.streak;
    
    if (!userData.lastLogin) {
      newStreak = 1;
    } else if (userData.lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (userData.lastLogin === yesterday.toDateString()) {
        newStreak++;
      } else {
        newStreak = 1;
      }
    }
    
    const updatedUserData = {
      ...userData,
      streak: newStreak,
      lastLogin: today
    };
    
    setUserData(updatedUserData);
    saveUserData();
  };

  const toggleDarkMode = () => {
    const isDark = !userData.darkMode;
    document.body.classList.toggle('dark-mode', isDark);
    
    setUserData(prev => ({
      ...prev,
      darkMode: isDark
    }));
    
    saveUserData();
  };

  // Problem Management
  const loadNextProblem = () => {
    let targetDifficulty = 'easy';
    const solvedCount = userData.solved;
    
    if (solvedCount > 3) targetDifficulty = 'medium';
    
    let nextProblem = problems.find(p => 
      p.difficulty === targetDifficulty && 
      !userData.history.some(h => h.id === p.id && h.status === 'solved')
    );
    
    if (!nextProblem) {
      nextProblem = problems[Math.floor(Math.random() * problems.length)];
    }
    
    setCurrentProblem(nextProblem);
    loadProblem(nextProblem);
  };

  const loadProblem = (problem) => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      document.getElementById('problem-title').textContent = problem.title;
      document.getElementById('problem-description').textContent = problem.description;
      
      const samplesDiv = document.getElementById('input-output-samples');
      samplesDiv.innerHTML = '<h4>📋 Sample Input/Output:</h4>';
      problem.testCases.slice(0, 2).forEach((tc, i) => {
        samplesDiv.innerHTML += `
          <div style="margin: 0.5rem 0; padding: 0.75rem; background: rgba(102,126,234,0.1); border-radius: 8px; border-left: 3px solid #667eea;">
            <strong>Sample ${i+1}:</strong><br>
            <strong>Input:</strong> <code>${JSON.stringify(tc.input)}</code><br>
            <strong>Expected:</strong> <code>${JSON.stringify(tc.expected)}</code>
          </div>
        `;
      });
      
      document.getElementById('test-case-descriptions').innerHTML = `
        <h4>🧪 Test Cases (${problem.testCases.length} total):</h4>
        <p>Complete test suite runs on submission. Includes edge cases and hidden tests.</p>
      `;
      
      const draft = localStorage.getItem(`NextStep-draft-${problem.id}`);
      setCode(draft || problem.template || `// ${problem.title}\n\nfunction solution() {\n    // Your solution here\n    return null;\n}`);
      
      setTestResults([{ text: 'Ready to test your solution!', style: 'color: #666; text-align: center;' }]);
      setHints(['Think about the problem requirements', 'Consider edge cases', 'Test with sample inputs first']);
      
      setStartTime(Date.now());
    }, 1000);
  };

  // Code Execution
  const runCode = () => {
    if (!currentProblem) return;
    
    setOutput('<span style="color: #ffeb3b;">⏳ Running...</span>');
    
    setTimeout(() => {
      try {
        const func = new Function(code)();
        const sample = currentProblem.testCases[0];
        const result = func(...sample.input);
        
        const expected = sample.expected;
        const isCorrect = JSON.stringify(result) === JSON.stringify(expected);
        
        setOutput(`
          <div style="color: ${isCorrect ? '#00ff00' : '#ff6b6b'}; font-weight: bold;">
            ${isCorrect ? '✓ Correct!' : '⚠ Expected different result'}
          </div>
          <div style="margin: 0.5rem 0;"><strong>Input:</strong> ${JSON.stringify(sample.input)}</div>
          <div style="margin: 0.5rem 0;"><strong>Your Output:</strong> ${JSON.stringify(result)}</div>
          <div style="margin: 0.5rem 0;"><strong>Expected:</strong> ${JSON.stringify(expected)}</div>
          ${!isCorrect ? '<div style="color: #666; font-size: 0.9em; margin-top: 0.5rem;">💡 Check your logic for this input type</div>' : ''}
        `);
      } catch (error) {
        setOutput(`
          <div style="color: #ff4757; font-weight: bold;">❌ Error: ${error.message}</div>
          <div style="color: #666; font-size: 0.9em;">💡 Check your syntax and function definition</div>
        `);
      }
    }, 800);
  };

  const submitCode = () => {
    if (!currentProblem || !code.trim()) {
      alert('Please write some code first! 💻');
      return;
    }
    
    const timeTaken = Math.round((Date.now() - startTime) / 60000);
    const newUserData = { ...userData, timeSpent: userData.timeSpent + timeTaken };
    
    setTestResults([{ text: 'Testing your solution...', style: 'color: #ffeb3b; text-align: center;' }]);
    
    setTimeout(() => {
      try {
        const func = new Function(code)();
        
        let passed = 0;
        let feedback = [];
        const newResults = [];
        
        currentProblem.testCases.forEach((tc, i) => {
          try {
            const result = func(...tc.input);
            const isPass = JSON.stringify(result) === JSON.stringify(tc.expected);
            
            if (isPass) passed++;
            
            const testResult = {
              isPass,
              description: tc.description,
              input: tc.input,
              expected: tc.expected,
              result,
              index: i + 1
            };
            
            newResults.push(testResult);
            
            if (!isPass) {
              feedback.push(`Test ${i+1} failed: ${tc.description}. ${currentProblem.hints[i % currentProblem.hints.length]}`);
            }
          } catch (testError) {
            newResults.push({
              isPass: false,
              description: 'Execution Error',
              error: testError.message,
              index: i + 1
            });
            feedback.push(`Runtime error in test ${i+1}: ${testError.message}`);
          }
        });
        
        // Update stats
        const attempts = (userData.attempts[currentProblem.id] || 0) + 1;
        const newAttempts = { ...userData.attempts, [currentProblem.id]: attempts };
        
        const result = {
          id: currentProblem.id,
          status: passed === currentProblem.testCases.length ? 'solved' : 'failed',
          attempts,
          time: timeTaken,
          timestamp: new Date().toISOString()
        };
        
        let updatedUserData = {
          ...newUserData,
          attempts: newAttempts,
          history: [result, ...userData.history]
        };
        
        // Success or failure
        if (result.status === 'solved') {
          updatedUserData.solved = userData.solved + 1;
          awardBadges(updatedUserData);
          updateSkillLevel(updatedUserData);
          
          // Add success message
          newResults.unshift({
            isSuccess: true,
            text: `🎉 Congratulations! All tests passed! 🎉<br><small>Solved in ${timeTaken} min with ${attempts} attempt${attempts > 1 ? 's' : ''}</small>`,
            style: 'text-align: center; font-size: 1.2em; padding: 1rem; background: linear-gradient(135deg, #28a745, #20c997); color: white; border-radius: 10px; margin: 1rem 0;'
          });
          
          feedback = [`Excellent work! ${currentProblem.optimizationHint || 'Consider refactoring for better readability.'}`];
          
          // Update topic stats
          const topic = currentProblem.topic;
          if (updatedUserData.topicStats[topic]) {
            const topicStats = updatedUserData.topicStats[topic];
            updatedUserData.topicStats[topic] = {
              ...topicStats,
              solved: topicStats.solved + 1,
              attempted: topicStats.attempted + 1,
              accuracy: Math.round(((topicStats.solved + 1) / (topicStats.attempted + 1)) * 100)
            };
          }
        } else {
          // Update topic attempts
          const topic = currentProblem.topic;
          if (updatedUserData.topicStats[topic]) {
            const topicStats = updatedUserData.topicStats[topic];
            updatedUserData.topicStats[topic] = {
              ...topicStats,
              attempted: topicStats.attempted + 1,
              accuracy: Math.round((topicStats.solved / Math.max(1, topicStats.attempted + 1)) * 100)
            };
          }
          
          feedback.unshift('Keep trying! Analyze the failing tests above.', ...currentProblem.hints);
        }
        
        setTestResults(newResults);
        setHints(feedback);
        setUserData(updatedUserData);
        saveUserData();
        updateDashboard();
        
      } catch (error) {
        setTestResults([{
          isError: true,
          text: `<strong>❌ Syntax Error</strong><br><small style="color: #666;">${error.message}</small><br><small>💡 Common issues: missing semicolons, unmatched brackets, or invalid syntax</small>`,
          style: 'text-align: center; padding: 1rem;'
        }]);
        
        setHints([
          `Syntax error: ${error.message}`,
          'Check for missing semicolons or unmatched parentheses',
          'Make sure your function is properly defined',
          ...currentProblem.hints
        ]);
      }
    }, 1200);
  };

  // Chart Functions
  const createProgressChart = () => {
    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;
    
    const topics = ["Math", "Strings", "Recursion", "Searching", "Dynamic Programming", "Graphs"];
    const accuracies = topics.map(topic => userData.topicStats[topic]?.accuracy || 0);
    
    if (progressChart) {
      progressChart.destroy();
    }
    
    setProgressChart(new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topics,
        datasets: [{
          label: 'Accuracy (%)',
          data: accuracies,
          backgroundColor: accuracies.map(acc => {
            if (acc >= 80) return '#28a745';
            if (acc >= 50) return '#ffc107';
            return '#dc3545';
          }),
          borderColor: document.body.classList.contains('dark-mode') ? '#e0e0e0' : '#333',
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.parsed.y}%`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              callback: function(value) {
                return value + '%';
              },
              color: document.body.classList.contains('dark-mode') ? '#e0e0e0' : '#333'
            },
            grid: {
              color: document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }
          },
          x: {
            ticks: { color: document.body.classList.contains('dark-mode') ? '#e0e0e0' : '#333' },
            grid: { display: false }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    }));
  };

  // Helper Functions
  const awardBadges = (updatedData) => {
    const solved = updatedData.solved;
    
    if (solved === 1 && !updatedData.badges.includes('First Solve! 🎯')) {
      updatedData.badges.push('First Solve! 🎯');
    }
    if (solved === 3 && !updatedData.badges.includes('Beginner Master 🥉')) {
      updatedData.badges.push('Beginner Master 🥉');
    }
    if (updatedData.streak >= 3 && !updatedData.badges.includes('Streak Starter 🔥')) {
      updatedData.badges.push('Streak Starter 🔥');
    }
  };

  const updateSkillLevel = (updatedData) => {
    const solved = updatedData.solved;
    if (solved >= 10) updatedData.skillLevel = 'Intermediate';
    else if (solved >= 3) updatedData.skillLevel = 'Beginner';
    else updatedData.skillLevel = 'Newcomer';
  };

  const showHints = (hintList) => {
    setHints(hintList);
  };

  const updateDashboard = () => {
    // Stats will update via userData state
  };

  const loadHistory = () => {
    // Handled by rendering logic
  };

  const loadAchievements = () => {
    // Handled by rendering logic
  };

  // Render Test Results
  const renderTestResults = () => {
    return testResults.map((result, index) => {
      if (result.isSuccess) {
        return (
          <li key={`success-${index}`} 
              className="pass" 
              style={{ textAlign: 'center', fontSize: '1.2em', padding: '1rem', 
                      background: 'linear-gradient(135deg, #28a745, #20c997)', 
                      color: 'white', borderRadius: '10px', margin: '1rem 0' }}
              dangerouslySetInnerHTML={{ __html: result.text }} 
          />
        );
      }
      
      if (result.isError) {
        return (
          <li key={`error-${index}`} 
              className="fail" 
              style={{ textAlign: 'center', padding: '1rem' }}
              dangerouslySetInnerHTML={{ __html: result.text }} 
          />
        );
      }
      
      const { isPass, description, input, expected, result: testResult, index: testIndex, error } = result;
      
      return (
        <li key={`test-${testIndex}`} className={isPass ? 'pass' : 'fail'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <strong>{isPass ? '✓' : '✗'} {description}</strong>
            <span style={{ fontSize: '0.9em', opacity: 0.7 }}>Test {testIndex}</span>
          </div>
          {!isPass && !error && (
            <div style={{ fontSize: '0.85em', marginTop: '0.25rem' }}>
              Input: <code>{JSON.stringify(input)}</code><br />
              Expected: <code>{JSON.stringify(expected)}</code><br />
              Got: <code>{JSON.stringify(testResult)}</code>
            </div>
          )}
          {error && (
            <small style={{ color: '#666' }}>{error}</small>
          )}
        </li>
      );
    });
  };

  // Components
  const Header = () => (
    <header>
      <nav>
        <div className="logo">NextStep</div>
        <ul className="nav-links">
          <li><a href="#workspace" className={activeSection === 'workspace' ? 'active' : ''} onClick={() => setActiveSection('workspace')}>Workspace</a></li>
          <li><a href="#dashboard" className={activeSection === 'dashboard' ? 'active' : ''} onClick={() => setActiveSection('dashboard')}>Dashboard</a></li>
          <li><a href="#profile" className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>Profile</a></li>
          <li><a href="#history" className={activeSection === 'history' ? 'active' : ''} onClick={() => setActiveSection('history')}>History</a></li>
          <li><a href="#achievements" className={activeSection === 'achievements' ? 'active' : ''} onClick={() => setActiveSection('achievements')}>Achievements</a></li>
        </ul>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="streak-tracker">Streak: <span>{userData.streak}</span> days 🔥</div>
          <button id="dark-mode-toggle" title="Toggle Dark Mode" onClick={toggleDarkMode}>
            {userData.darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>
    </header>
  );

  const Workspace = () => (
    <section id="workspace" className={activeSection === 'workspace' ? 'active' : ''}>
      <div className="panel problem-panel">
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your next challenge...</p>
          </div>
        ) : (
          <div id="problem-content">
            <h2 id="problem-title">{currentProblem?.title || 'Challenge Title'}</h2>
            <p id="problem-description">{currentProblem?.description || ''}</p>
            <div id="input-output-samples"></div>
            <div id="test-case-descriptions"></div>
            <button id="next-problem" onClick={loadNextProblem}>Next Challenge</button>
          </div>
        )}
      </div>

      <div className="panel editor-panel">
        <div id="editor-container">
          <textarea
            id="editor"
            ref={editorRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="/* Write your code here */\nfunction solution() {\n    // Your solution goes here\n    return null;\n}"
            style={{
              height: 'auto',
              minHeight: '400px'
            }}
          />
        </div>
        <div id="live-output">
          <strong>Live Output:</strong><br />
          <div id="output-console" dangerouslySetInnerHTML={{ __html: output }} />
        </div>
        <div className="button-group">
          <button onClick={runCode}>Run Code</button>
          <button onClick={submitCode}>Submit Solution</button>
        </div>
      </div>

      <div className="panel test-suite-panel">
        <h3>🧪 Test Results</h3>
        <ul id="test-results">{renderTestResults()}</ul>
      </div>

      <div className="panel hints-sidebar">
        <h3>💡 Hints & Feedback</h3>
        <ul id="hints-list">
          {hints.map((hint, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: `<strong>${index + 1}.</strong> ${hint}` }} />
          ))}
        </ul>
      </div>
    </section>
  );

  const Dashboard = () => (
    <section id="dashboard" className={activeSection === 'dashboard' ? 'active' : ''}>
      <h2>📊 Your Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{userData.solved}</span>
          <span>Problems Solved</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{Math.round(userData.timeSpent)} min</span>
          <span>Total Time</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{userData.skillLevel}</span>
          <span>Skill Level</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{userData.streak} days</span>
          <span>Current Streak</span>
        </div>
      </div>
      
      <div className="panel" style={{ margin: '2rem 0' }}>
        <h3>📈 Your Progress</h3>
        <div style={{ position: 'relative', height: '400px', marginTop: '1rem' }}>
          <canvas ref={chartRef}></canvas>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#28a745', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-block', marginRight: '0.5rem' }}></div>
            <span>Easy (80%+)</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#ffc107', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-block', marginRight: '0.5rem' }}></div>
            <span>Medium (50-79%)</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#dc3545', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-block', marginRight: '0.5rem' }}></div>
            <span>Hard ({'<'}50%)</span>
          </div>
        </div>
      </div>
      
      <div className="panel">
        <h3>🎯 Recommended Learning Path</h3>
        <ul>
          <li>🔥 Basic Algorithms (Easy)</li>
          <li>📚 Data Structures (Medium)</li>
          <li>⚡ Advanced Problem Solving (Hard)</li>
        </ul>
      </div>
    </section>
  );

  const Profile = () => (
    <section id="profile" className={activeSection === 'profile' ? 'active' : ''}>
      <h2>👤 Profile</h2>
      <div className="panel">
        <h3>Welcome, <span id="profile-username">{userData.username}</span>!</h3>
        <p><strong>Joined:</strong> January 2025</p>
        <p><strong>Learning Goal:</strong> Master JavaScript</p>
        <p><strong>Preferred Language:</strong> JavaScript</p>
        <button style={{ marginTop: '1rem' }}>Edit Profile</button>
      </div>
    </section>
  );

  const History = () => {
    const historyItems = userData.history.length === 0 ? (
      <li className="history-item" style={{ textAlign: 'center', color: '#666' }}>
        No solutions yet - start coding in the workspace! 🚀
      </li>
    ) : (
      Object.entries(userData.history.reduce((acc, entry) => {
        if (!acc[entry.id]) acc[entry.id] = [];
        acc[entry.id].push(entry);
        return acc;
      }, {})).map(([problemId, entries]) => {
        const problem = problems.find(p => p.id == problemId);
        if (!problem) return null;
        
        const latest = entries[0];
        return (
          <li key={problemId} className={`history-item ${latest.status}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{problem.title}</strong><br />
                <small style={{ color: '#666' }}>
                  {latest.status === 'solved' ? '✓ Solved' : '⚠ In Progress'} | 
                  {latest.attempts} attempt{latest.attempts > 1 ? 's' : ''} | 
                  {latest.time} min
                </small>
              </div>
              <span style={{ fontSize: '1.5em' }}>
                {latest.status === 'solved' ? '🎉' : '🔄'}
              </span>
            </div>
          </li>
        );
      })
    );

    return (
      <section id="history" className={activeSection === 'history' ? 'active' : ''}>
        <h2>📝 Solution History</h2>
        <div className="panel">
          <ul id="problem-history">{historyItems}</ul>
        </div>
      </section>
    );
  };

  const Achievements = () => (
    <section id="achievements" className={activeSection === 'achievements' ? 'active' : ''}>
      <h2>🏆 Achievements</h2>
      <div className="panel">
        <ul id="badges-list">
          {userData.badges.map((badge, index) => (
            <li key={index} className="badge-item">{badge}</li>
          ))}
        </ul>
      </div>
    </section>
  );

  const Footer = () => (
    <footer>
      <p>&copy; 2025 NextStep. Built with ❤️ for programmers everywhere.</p>
    </footer>
  );

  return (
    <>
      <Header />
      <main>
        <Workspace />
        <Dashboard />
        <Profile />
        <History />
        <Achievements />
      </main>
      <Footer />
    </>
  );
}

export default App;