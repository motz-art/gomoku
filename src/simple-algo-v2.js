function createPlayer() {
  const vm = {};
  vm.makeTurn = function (board) {
    return Promise.resolve().then(() => {
      function onBoard({ row, col }) {
        return row >= 0 && col >= 0 && row < board.length && board[row] && col < board[row].length;
      }
      function add(a, b) {
        return { row: a.row + b.row, col: a.col + b.col };
      }
      function mul(a, s) {
        return { row: a.row * s, col: a.col * s };
      }
      function val({ row, col }) {
        return board[row][col];
      }
      function proc(p, d, func, init, limit) {
        limit = limit || 5;
        for (let cnt = 0; cnt < limit && onBoard(p); cnt++) {
          init = func(val(p), init, p);
          p = add(p, d);
        }
        return init;
      }
      function count(p, d) {
        return proc(p, d, (cur, res) => {
          res[cur + 1]++;
          return res;
        }, [0, 0, 0]);
      }
      function match(pattern, p, d) {
        const limit = pattern.length;
        if (!onBoard(add(p, mul(d, limit - 1)))) {
          return false;
        }
        for (let cnt = 0; cnt < limit; cnt++) {
          if (val(p) !== pattern[cnt]) {
            return false;
          }
          p = add(p, d);
        }
        return true;
      }

      var patterns = [
        { pattern: [0, 1, 1, 1, 1], goto: 0, weight: 10001 },
        { pattern: [1, 0, 1, 1, 1], goto: 1, weight: 10001 },
        { pattern: [1, 1, 0, 1, 1], goto: 2, weight: 10001 },
        { pattern: [1, 1, 1, 0, 1], goto: 3, weight: 10001 },
        { pattern: [1, 1, 1, 1, 0], goto: 4, weight: 10001 },
        { pattern: [0, -1, -1, -1, -1], goto: 0, weight: 10000 },
        { pattern: [-1, 0, -1, -1, -1], goto: 1, weight: 10000 },
        { pattern: [-1, -1, 0, -1, -1], goto: 2, weight: 10000 },
        { pattern: [-1, -1, -1, 0, -1], goto: 3, weight: 10000 },
        { pattern: [-1, -1, -1, -1, 0], goto: 4, weight: 10000 },

        { pattern: [0, 0, 1, 1, 1, 0], goto: 1, weight: 1001 },
        { pattern: [0, 1, 0, 1, 1, 0], goto: 2, weight: 1001 },
        { pattern: [0, 1, 1, 0, 1, 0], goto: 3, weight: 1001 },
        { pattern: [0, 1, 1, 1, 0, 0], goto: 4, weight: 1001 },

        { pattern: [0, 0, -1, -1, -1, 0], goto: 1, weight: 1000 },
        { pattern: [0, -1, 0, -1, -1, 0], goto: 2, weight: 1000 },
        { pattern: [0, -1, -1, 0, -1, 0], goto: 3, weight: 1000 },
        { pattern: [0, -1, -1, -1, 0, 0], goto: 4, weight: 1000 },
      ];

      var directions = [
        { row: 1, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: -1, col: 1 }
      ];

      var matches = [];
      var attack = board.map(r => r.map(c => 0));
      var defend = board.map(r => r.map(c => 0));
      var space = board.map(r => r.map(c => 0));
      var weights = [0, 1, 5, 10, 50];
      for (let startRow = 0; startRow < board.length; startRow++) {
        for (let startCol = 0; startCol < board[startRow].length; startCol++) {
          var position = { row: startRow, col: startCol };
          for (let d = 0; d < directions.length; d++) {
            var direction = directions[d];
            matches = matches.concat(
              patterns.filter(ptn => match(ptn.pattern, position, direction)).
                map(ptn => Object.assign({
                  weight: ptn.weight,
                  pattern: ptn,
                }, add(position, mul(direction, ptn.goto)))
                ));

            var endPos = add(position, mul(direction, 4));
            if (onBoard(endPos)) {
              var cnt = count(position, direction);
              if ((cnt[0] > 0 && cnt[2] > 0) || cnt[1] === 5) {
                continue;
              }
              if (cnt[0] > 0) {
                var weight = weights[cnt[0]];
                proc(position, direction, (c, i, p) => defend[p.row][p.col] += c === 0 ? weight : 0);
              } else {
                var weight = weights[cnt[2]];
                proc(position, direction, (c, i, p) => attack[p.row][p.col] += c === 0 ? weight : 0);
              }
            }
          }
        }
      }

      if (matches.length > 0) {
        matches.sort((a, b) => {
          if (a.weight !== b.weight) {
            return b.weight - a.weight;
          }
          return attack[b.row][b.col] + defend[b.row][b.col] - attack[a.row][a.col] - defend[a.row][a.col] +  (Math.random() - 0.5) * 2;
        });
        return matches[0];
      }

      var maxRow = Math.round(board.length / 2) + 1;
      var maxCol = Math.round(board[0].length / 2) + 1;
      var maxValue = 0;
      var counter = 0;
      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          if (board[row][col] !== 0) {
            continue;
          }
          if (attack[row][col] + defend[row][col] + (Math.random() - 0.5) * 0.1 > maxValue) {
            maxCol = col;
            maxRow = row;
            maxValue = attack[row][col] + defend[row][col];
          }
        }
      }
      console.log(counter);
      return { row: maxRow, col: maxCol };
    });
  }
  return vm;
}

export default { createPlayer };

