import React, { useState, useEffect, useRef } from 'react';
import './GameMenu.css';
import wordList from './wordList';
import Leaderboard from './Leaderboard'; // Import the Leaderboard component
import { useNavigate } from 'react-router-dom';

function GameMenu() {
  const [selectedWord, setSelectedWord] = useState('');
  const [feedback, setFeedback] = useState(['', '', '', '', '']);
  const [guesses, setGuesses] = useState([['', '', '', '', '']]);
  const [guessCount, setGuessCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [points, setPoints] = useState(0);

  const inputRefs = useRef([]);

  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const randomWord = wordList[randomIndex].toUpperCase();
    setSelectedWord(randomWord);
  }, []);

  const handleInput = (row, index, value) => {
    if (!gameOver) {
      const newGuesses = [...guesses];
      const newInput = [...guesses[row]];
      newInput[index] = value.toUpperCase();
      newGuesses[row] = newInput;
      setGuesses(newGuesses);

      if (index < newInput.length - 1) {
        if (inputRefs.current[row][index + 1]) {
          inputRefs.current[row][index + 1].focus();
        }
      }
    }
  };

  const handleRestart = () => {
    setGuesses([['', '', '', '', '']]);
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const randomWord = wordList[randomIndex].toUpperCase();
    setSelectedWord(randomWord);
    setFeedback(['', '', '', '', '']);
    setGuessCount(0);
    setGameOver(false);
    setPoints(0);
  };

  const handleSubmit = (row) => {
    if (gameOver || guesses[row].some(letter => letter === '')) return; // Don't allow submissions if the game is over or if any box is empty
    const guess = guesses[row].join('');
    const correctWord = selectedWord;

    // Check if the guess is correct
    if (guess === correctWord) {
      // You've guessed the word correctly
      setGameOver(true);
      setPoints((5 - guessCount) * 5);
      return;
    }

    // Create an array to keep track of letters that have been matched
    const matchedIndices = [];

    // Initialize newFeedback for the current row
    const newFeedback = [...feedback];
    for (let i = row * 5; i < (row + 1) * 5; i++) {
      newFeedback[i] = '';
    }

    // Check for correct letters in the correct position (green)
    for (let i = 0; i < correctWord.length; i++) {
      if (guess[i] === correctWord[i]) {
        newFeedback[i + row * 5] = 'green';
        matchedIndices.push(i);
      }
    }

    // Check for correct letters in the wrong position (orange)
    for (let i = 0; i < correctWord.length; i++) {
      if (
        guess[i] !== correctWord[i] &&
        correctWord.includes(guess[i]) &&
        !matchedIndices.includes(i)
      ) {
        newFeedback[i + row * 5] = 'orange';
      }
    }

    // Check for letters not in the word (gray)
    for (let i = 0; i < guess.length; i++) {
      if (!correctWord.includes(guess[i])) {
        newFeedback[i + row * 5] = '';
      }
    }

    setFeedback(newFeedback);

    if (guessCount + 1 < 5) {
      // Only add a new row if all boxes in the current row are filled
      setGuesses([...guesses, ['', '', '', '', '']]);
      setGuessCount(guessCount + 1);
    } else {
      // You've used all your guesses, game over
      setGameOver(true);
    }
  };

  const handleKeyPress = (row, e) => {
    if (e.key === 'Enter') {
      handleSubmit(row);
    }
  };

  return (
    <div className="game-menu">
      <h1 className="title">
        Dash<span className="highlight">Words</span>
      </h1>
      <div className="word-grid">
        {guesses.map((guess, rowIndex) =>
          guess.map((letter, index) => (
            <input
              key={index}
              type="text"
              value={letter}
              onChange={(e) => handleInput(rowIndex, index, e.target.value)}
              maxLength={1}
              ref={(inputRef) => {
                if (!inputRefs.current[rowIndex]) {
                  inputRefs.current[rowIndex] = [];
                }
                inputRefs.current[rowIndex][index] = inputRef;
              }}
              autoFocus={index === 0 && rowIndex === guesses.length - 1}
              onKeyPress={(e) => handleKeyPress(rowIndex, e)}
              style={{
                backgroundColor: feedback[index + rowIndex * 5],
                pointerEvents: gameOver ? 'none' : 'auto',
              }}
            />
          ))
        )}
      </div>
      <div>
        {gameOver ? (
          <div>
            {points > 0 ? (
              <p>Congratulations! You've won {points} points!</p>
            ) : (
              <p>Sorry, you lost. The word was: {selectedWord}</p>
            )}
            <button className="restart-button" onClick={handleRestart}>
              Restart
            </button>
            <button
              className="leaderboard-button"
              onClick={() => navigate('/leaderboard')}
            >
              Leaderboard
            </button>
          </div>
        ) : (
          <div>
            
            <button
              className="submit-button"
              onClick={() => {
                const lastGuess = guesses[guesses.length - 1];
                if (lastGuess.every(letter => letter !== '')) {
                  handleSubmit(guesses.length - 1);
                }
              }}
              disabled={
                guessCount === 4 &&
                guesses[guesses.length - 1].some(letter => letter === '')
              }
            >
              Submit
            </button>
          </div>
        )}
      </div>

      {/* Conditionally render the leaderboard */}
      {showLeaderboard && <Leaderboard />}
    </div>
  );
}

export default GameMenu;
