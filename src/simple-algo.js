
function createPlayer() {
  const vm = {};
  vm.makeTurn = function (board) {
    return Promise.resolve().then(() => {
      function proc(row, col, dr, dc, func, init) {
        let r = row;
        let c = col;
        let cnt = 0;
        while (r >= 0 && c >= 0 && r < board.length && board[r] && c < board[r].length && cnt < 5) {
          init = func(board[r][c], init, r, c);
          r += dr;
          c += dc;
          cnt++;
        }
        return init;
      }
      function count(row, col, dr, dc) {
        return proc(row, col, dr, dc, (cur, res) => {
          res[cur + 1]++;
          return res;
        }, [0, 0, 0]);
      }

      var attack = board.map(r => r.map(c => 0));
      var defend = board.map(r => r.map(c => 0));
      var weights = [0, 1, 5, 10, 50];
      for (let startRow = 0; startRow < board.length; startRow++) {
        for (let startCol = 0; startCol < board[startRow].length; startCol++) {
          var directions = [[1, 0], [0, 1], [1, 1], [-1, 1]];
          for (let d = 0; d < directions.length; d++) {
            var direction = directions[d];
            var endRow = startRow + 4 * direction[0];
            var endCol = startCol + 4 * direction[1];
            if (endRow >= 0 && endCol >= 0 && endRow < board.length && endCol < board[0].length) {
              var cnt = count(startRow, startCol, direction[0], direction[1]);
              if ((cnt[0] > 0 && cnt[2] > 0) || cnt[1] === 5) {
                continue;
              }
              if (cnt[0] > 0) {
                var weight = weights[cnt[0]];
                proc(startRow, startCol, direction[0], direction[1], (c, i, rw, cl) => defend[rw][cl] += c === 0 ? weight : 0);
              } else {
                var weight = weights[cnt[2]] - 0.1;
                proc(startRow, startCol, direction[0], direction[1], (c, i, rw, cl) => attack[rw][cl] += c === 0 ? weight : 0);
              }
            }
          }
        }
      }

      var maxRow = Math.round(board.length / 2);
      var maxCol = Math.round(board[0].length / 2);
      var maxValue = 0;
      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          if (board[row][col] !== 0) {
            continue;
          }
          if (attack[row][col] + defend[row][col] > maxValue) {
            maxCol = col;
            maxRow = row;
            maxValue = attack[row][col] + defend[row][col];
          }
        }
      }
      return { row: maxRow, col: maxCol };
    });
  }
  return vm;
}

export default { createPlayer };
