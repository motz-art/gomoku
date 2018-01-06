/* eslint-env browser */
/* eslint no-console: 'off' */

export function createView(board, handleClick) {
  const boardElement = document.createElement('div');
  const boardCanvas = document.createElement('canvas');

  boardCanvas.addEventListener('click', event => {
    const coord = { col: Math.floor(event.offsetX / 20), row: Math.floor(event.offsetY / 20) };
    handleClick(coord.row, coord.col);
  });

  boardCanvas.setAttribute('width', '401px');
  boardCanvas.setAttribute('height', '401px');
  boardElement.appendChild(boardCanvas);

  const ctx = boardCanvas.getContext('2d');

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#ccc';

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

  const be = document.getElementById('board');
  be.parentNode.replaceChild(boardElement, be);
  boardElement.id = 'board';

  function draw(row, col, turn) {
    if (turn === 0) {
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
    const text = document.createTextNode(`[${col}, ${row}]`);
    const el = document.createElement('div');
    el.appendChild(text);
    boardElement.appendChild(el);
    return (new Promise(res => requestAnimationFrame(() => res()))).then(() => ({ row, col }));
  }

  function drawGameOver(row, col, turn) {
    boardElement.appendChild(document.createTextNode('GAME OVER'));
    const boardValue = turn + 1;
    function count(dr, dc) {
      let r = row + dr;
      let c = col + dc;
      let cnt = 0;
      while (r >= 0 && c >= 0 && r < board.length && board[r] && c < board[r].length && board[r][c].value === boardValue) {
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
      const min = count(-1, -1);
      const add = count(1, 1);
      crossLine((col - min) * 20 + 2, (row - min) * 20 + 2, (col + add) * 20 + 18, (row + add) * 20 + 18);
    }
    if (count(-1, 1) + count(1, -1) >= 4) {
      const min = count(-1, 1);
      const add = count(1, -1);
      crossLine((col + min) * 20 + 18, (row - min) * 20 + 2, (col - add) * 20 + 2, (row + add) * 20 + 18);
    }
    if (count(0, -1) + count(0, 1) >= 4) {
      crossLine((col - count(0, -1)) * 20 + 2, row * 20 + 10.5, (col + count(0, 1)) * 20 + 18, row * 20 + 10.5);
    }
  }

  function showError(error) {
    console.error(error);
    boardElement.innerHTML = `${error.message}<br><pre>${error.stack}</pre>`;
  }

  return {
    drawGameOver,
    draw,
    showError
  }

}
