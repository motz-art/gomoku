/* eslint-env browser */
import consolePlayer from './console-player.js';
import { createView } from './board-view.js';
import simpleAlgo from './simple-algo.js';
import simpleAlgoV2 from './simple-algo-v2.js';
import tacticAlgo from './tactic-algo.js';

function start() {
  const boardSize = 20;
  const board = Array(boardSize).fill(0).map(() => Array(boardSize).fill(0).map(x => ({ value: 0, element: null })));

  let currentPlayer = null;

  function handleClick(row, col) {
    if (!currentPlayer || typeof currentPlayer.respond !== 'function') {
      return;
    }
    currentPlayer.respond(row, col);
  }

  const boardView = createView(board, handleClick);

  const game = {
    board,
    turn: 0,
    state: 0,
    players: [simpleAlgo.createPlayer(), simpleAlgoV2.createPlayer()]
  };

  function getUserBoard(userId) {
    userId++;
    return game.board.map(row => row.map(cell => (cell.value === 0 ? 0 : cell.value === userId ? 1 : -1)));
  }

  function gameOver(row, col) {
    const v = game.turn + 1;
    function count(dr, dc) {
      let r = row;
      let c = col;
      const board = game.board;
      let cnt = 0;
      while (r >= 0 && c >= 0 && r < board.length && board[r] && c < board[r].length && board[r][c].value === v) {
        r += dr;
        c += dc;
        cnt++;
      }
      return cnt;
    }
    if (count(-1, 0) + count(1, 0) > 5) {
      return true;
    }
    if (count(-1, -1) + count(1, 1) > 5) {
      return true;
    }
    if (count(-1, 1) + count(1, -1) > 5) {
      return true;
    }
    if (count(0, -1) + count(0, 1) > 5) {
      return true;
    }
    return false;
  }

  let lastTurn = null;
  function iteration(params) {
    try {
      switch (game.state) {
        case 0:
          game.state = 1;
          currentPlayer = game.players[game.turn];
          Promise.resolve(currentPlayer.makeTurn(getUserBoard(game.turn), lastTurn)).then(iteration).
            catch(err => {
              game.state = -1;
              iteration(err);
            });
          return;
        case 1:
          game.state = 2;
          lastTurn = { row: params.row, col: params.col };

          if (typeof params.row !== 'number' ||
            typeof params.col !== 'number' ||
            params.row < 0 ||
            params.row >= board.length ||
            !board[params.row] ||
            params.col < 0 ||
            params.col >= board[params.row].length ||
            board[params.row][params.col].value !== 0) {
            throw new Error(`Invalid move data [${params.row},${params.col}]...`);
          }
          game.board[params.row][params.col].value = game.turn + 1;

          boardView.draw(params.row, params.col, game.turn).then(iteration);
          return;
        case 2:
          if (gameOver(params.row, params.col)) {
            game.state = 3;
          } else {
            game.state = 0;
            game.turn = 1 - game.turn;
          }
          Promise.resolve().then(() => iteration(params));
          return;
        case 3:
          boardView.drawGameOver(params.row, params.col, game.turn);
          return;
        case -1:
          boardView.showError(params);
          return;
      }
    } catch (err) {
      game.state = -1;
      iteration(err);
    }
  }
  iteration();
}

start();

const startBtn = document.getElementById('start');
startBtn.addEventListener('click', start);
