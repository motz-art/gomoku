import simpleAlgoV2 from './simple-algo-v2.js';
import simpleAlgo from './simple-algo.js';


function start() {

  var boardElement = document.createElement('div');
  var boardSize = 20;
  var board = Array(boardSize).fill(0).map(() => Array(boardSize).fill(0).map(x => ({ value: 0, element: null })));

  var currentPlayer = null;

  function handleClick(row, col) {
    if (!currentPlayer) {
      return;
    }
    currentPlayer.respond(row, col);
  }

  var boardCanvas = document.createElement('canvas');
  boardCanvas.addEventListener('click', e => {
    var coord = { col: Math.floor(e.offsetX / 20), row: Math.floor(e.offsetY / 20) };
    handleClick(coord.row, coord.col);
    console.log();
  })
  boardCanvas.setAttribute('width', '401px');
  boardCanvas.setAttribute('height', '401px');
  boardElement.appendChild(boardCanvas);

  var ctx = boardCanvas.getContext('2d');

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#ccc";

  ctx.beginPath();
  ctx.moveTo(0, 400.5);
  ctx.lineTo(401, 400.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(400.5, 0);
  ctx.lineTo(400.5, 401);
  ctx.stroke();

  for (let j = 0; j < board.length; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * 20 + 0.5);
    ctx.lineTo(400, j * 20 + 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(j * 20 + 0.5, 0);
    ctx.lineTo(j * 20 + 0.5, 400);
    ctx.stroke();
  }

  var be = document.getElementById('board');
  be.parentNode.replaceChild(boardElement, be);
  boardElement.id = 'board';

  let game = {
    board,
    turn: 0,
    state: 0,
    players: [simpleAlgo.createPlayer(), simpleAlgoV2.createPlayer()]
  };

  function getUserBoard(userId) {
    userId++;
    return game.board.map(row => row.map(cell => cell.value === 0 ? 0 : cell.value === userId ? 1 : -1));
  }

  function draw(row, col) {
    if (typeof row !== 'number' ||
      typeof col !== 'number' ||
      row < 0 ||
      row >= game.board.length ||
      !game.board[row] ||
      col < 0 ||
      col >= game.board[row].length ||
      game.board[row][col].value !== 0) {
      return Promise.reject(new Error(`Invalid move data [${row},${col}]...`));
    }
    game.board[row][col].value = game.turn + 1;
    if (game.turn === 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#8d1';
      ctx.lineWidth = 2;
      ctx.moveTo(col * 20 + 3.5, row * 20 + 3.5);
      ctx.lineTo(col * 20 + 17.5, row * 20 + 17.5);
      ctx.stroke();
      ctx.moveTo(col * 20 + 17.5, row * 20 + 3.5);
      ctx.lineTo(col * 20 + 3.5, row * 20 + 17.5);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.strokeStyle = '#fa3';
      ctx.lineWidth = 2;
      ctx.arc(col * 20 + 10.5, row * 20 + 10.5, 6.5, 0, 2 * Math.PI);
      ctx.stroke();
    }
    var text = document.createTextNode(`[${col}, ${row}]`);
    var el = document.createElement('div');
    el.appendChild(text);
    boardElement.appendChild(el);
    return (new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => res())))).then(() => ({ row, col }));
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
    if (count(-1, 0) + count(1, 0) > 5) { return true; }
    if (count(-1, -1) + count(1, 1) > 5) { return true; }
    if (count(-1, 1) + count(1, -1) > 5) { return true; }
    if (count(0, -1) + count(0, 1) > 5) { return true; }
    return false;
  }

  function drawGameOver(row, col) {
    boardElement.appendChild(document.createTextNode('GAME OVER'));
    const v = game.turn + 1;
    function count(dr, dc) {
      let r = row + dr;
      let c = col + dc;
      const board = game.board;
      let cnt = 0;
      while (r >= 0 && c >= 0 && r < board.length && board[r] && c < board[r].length && board[r][c].value === v) {
        r += dr;
        c += dc;
        cnt++;
      }
      return cnt;
    }
    function crossLine(x1, y1, x2, y2) {
      ctx.beginPath();
      ctx.strokeStyle = '#f00';
      ctx.lineWidth = 3;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    if (count(-1, 0) + count(1, 0) >= 4) {
      crossLine(col * 20 + 10.5, (row - count(-1, 0)) * 20 + 2, col * 20 + 10.5, (row + count(1, 0)) * 20 + 18);
    }
    if (count(-1, -1) + count(1, 1) >= 4) {
      var min = count(-1, -1);
      var add = count(1, 1);
      crossLine((col - min) * 20 + 2, (row - min) * 20 + 2, (col + add) * 20 + 18, (row + add) * 20 + 18);
    }
    if (count(-1, 1) + count(1, -1) >= 4) {
      var min = count(-1, 1);
      var add = count(1, -1);
      crossLine((col + min) * 20 + 18, (row - min) * 20 + 2, (col - add) * 20 + 2, (row + add) * 20 + 18);

    }
    if (count(0, -1) + count(0, 1) >= 4) {
      crossLine((col - count(0, -1)) * 20 + 2, row * 20 + 10.5, (col + count(0, 1)) * 20 + 18, row * 20 + 10.5);
    }
  }

  function iteration(params) {
    try {
      switch (game.state) {
        case 0:
          game.state = 1;
          game.players[game.turn].makeTurn(getUserBoard(game.turn)).then(iteration)
            .catch(err => {
              game.state = -1;
              iteration(err);
            });
          return;
        case 1:
          game.state = 2;
          draw(params.row, params.col).then(iteration);
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
          drawGameOver(params.row, params.col);
          return;
        case -1:
          console.error(params);
          boardElement.innerHTML = `${params.message}<br><pre>${params.stack}</pre>`;
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

var startBtn = document.getElementById('start');
startBtn.addEventListener('click', start);
