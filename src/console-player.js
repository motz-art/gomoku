function createPlayer() {
  let board = null;
  let resolve = null;
  const vm = {};
  function makeTurn(brd) {
    board = brd;
    return new Promise(res => {
      resolve = res;
    })
  }
  function respond(row, col) {
    if (board && board[row][col] === 0) {
      board = null;
      resolve({ row, col });
    }
  }
  vm.makeTurn = makeTurn;
  vm.respond = respond;
  return vm;
}

export default { createPlayer };
