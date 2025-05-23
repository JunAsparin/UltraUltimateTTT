let gameMode = "ultra"; // Default to ultra

const mainBoard = document.getElementById("main-board");
const statusText = document.getElementById("status");

let currentPlayer = "X";
let activeUltimate = null; // Start from center ultimate board
let activeMini = null;

const structure = Array(9).fill(null).map(() =>
  Array(9).fill(null).map(() =>
    Array(9).fill("")
  )
);
const miniWinners = Array(9).fill(null).map(() => Array(9).fill(""));
const ultimateWinners = Array(9).fill("");

function startGame(mode) {
  gameMode = mode;
  document.getElementById("menu-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  document.getElementById("game-title").textContent =
    mode === "regular" ? "Tic-Tac-Toe" :
    mode === "ultimate" ? "Ultimate Tic-Tac-Toe" :
    "Ultra Ultimate Tic-Tac-Toe";

  if (mode === "regular") {
    alert("Regular mode is not implemented yet.");
    location.reload(); // placeholder
  } else if (mode === "ultimate") {
    alert("Ultimate mode is not implemented yet.");
    location.reload(); // placeholder
  } else {
    createGame(); // Launch ultra mode (your current logic)
  }
}

function createGame() {
  for (let u = 0; u < 9; u++) {
    const ultimate = document.createElement("div");
    ultimate.classList.add("ultimate-board");
    ultimate.dataset.ultimate = u;

    for (let m = 0; m < 9; m++) {
      const mini = document.createElement("div");
      mini.classList.add("mini-board");
      mini.dataset.mini = m;

      for (let c = 0; c < 9; c++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.cell = c;
        cell.addEventListener("click", () => handleMove(u, m, c, cell));
        mini.appendChild(cell);
      }

      ultimate.appendChild(mini);
    }

    mainBoard.appendChild(ultimate);
  }
  highlightActiveBoard();
}

function handleMove(u, m, c, cellEl) {
  if (ultimateWinners[u] || miniWinners[u][m] || structure[u][m][c] !== "") return;

  if (activeUltimate === null) {
    // Lock into whichever ultimate board the player clicked first
    if (!ultimateWinners[u]) {
      activeUltimate = u;
      highlightActiveBoard(); // 🔧 Update highlight
    } else {
      return; // Don't allow clicking into a won ultimate board
    }
  }  

  // Enforce play only in active ultimate board (or anywhere if unlocked)
  if (activeUltimate !== null && u !== activeUltimate) return;

  // Enforce play only in active mini-board if locked
  if (activeMini !== null && m !== activeMini) return;

  structure[u][m][c] = currentPlayer;
  cellEl.textContent = currentPlayer;
  cellEl.classList.add(currentPlayer.toLowerCase()); // Adds .x or .o class

  // Check mini-board win
  const miniWinner = checkWinner(structure[u][m]);
  if (miniWinner) {
    miniWinners[u][m] = miniWinner;
    markBoardWinner(u, m, miniWinner);

    // Check ultimate board win
    const ultimateWinner = checkWinner(miniWinners[u]);
    if (ultimateWinner) {
      ultimateWinners[u] = ultimateWinner;
      markUltimateWinner(u, ultimateWinner);

      const finalWinner = checkWinner(ultimateWinners);
      if (finalWinner) {
        statusText.textContent = `Player ${finalWinner} wins the whole game!`;
        disableAll();
        return;
      }
    }

    // Move to new ultimate board based on mini-board index
    const targetUltimate = m;
    if (!ultimateWinners[targetUltimate]) {
        activeUltimate = targetUltimate;
      } else {
        // Free move: let them pick any *one* ultimate board on their next move
        activeUltimate = null;
      
        // ✅ After free move, lock the ultimate board they chose
        // (This happens on their next valid move)
      }
      

    activeMini = null;
  } else {
    // No mini-board win: move within same ultimate board
    const nextMini = c;
    if (miniWinners[u][nextMini] || !structure[u][nextMini].includes("")) {
      activeMini = null;
    } else {
      activeMini = nextMini;
    }
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.innerHTML = `Player <span class="player-${currentPlayer.toLowerCase()}">${currentPlayer}</span>'s turn`;
  highlightActiveBoard();
}

function highlightActiveBoard() {
    // Remove 'active' class from all ultimate and mini boards
    document.querySelectorAll(".ultimate-board").forEach(board =>
      board.classList.remove("active")
    );
    document.querySelectorAll(".mini-board").forEach(board =>
      board.classList.remove("active")
    );
  
    // Not in free-move mode: only one active ultimate (and maybe mini) board
    if (activeUltimate !== null) {
      const ultimate = document.querySelectorAll(".ultimate-board")[activeUltimate];
      if (ultimate) {
        ultimate.classList.add("active");
  
        if (activeMini !== null) {
          const mini = ultimate.children[activeMini];
          if (mini) mini.classList.add("active");
        } else {
          // Highlight all un-won mini-boards in the active ultimate board
          Array.from(ultimate.children).forEach((mini, index) => {
            if (!miniWinners[activeUltimate][index]) {
              mini.classList.add("active");
            }
          });
        }
      }
    } else {
      // Free move: all ultimate boards and their un-won mini-boards are active
      document.querySelectorAll(".ultimate-board").forEach((board, u) => {
        if (!ultimateWinners[u]) {
          board.classList.add("active");
          Array.from(board.children).forEach((mini, m) => {
            if (!miniWinners[u][m]) {
              mini.classList.add("active");
            }
          });
        }
      });
    }
  }
  
  
  

  function markBoardWinner(u, m, winner) {
    const mini = document.querySelectorAll(".ultimate-board")[u].children[m];
  
    // Don't clear the mini-board. Instead overlay a winner mark
    const winnerMark = document.createElement("div");
    winnerMark.classList.add("winner-mark", `winner-${winner}`);
    winnerMark.textContent = winner;
    mini.appendChild(winnerMark);
  
    mini.classList.add(`won-${winner}`);
  }
  

  function markUltimateWinner(u, winner) {
    const ultimate = document.querySelectorAll(".ultimate-board")[u];
  
    // Don't clear the mini-boards. Just overlay winner mark
    const winnerMark = document.createElement("div");
    winnerMark.classList.add("ultimate-winner-mark", `winner-${winner}`);
    winnerMark.textContent = winner;
    ultimate.appendChild(winnerMark);
  
    Array.from(document.querySelectorAll(".cell")).forEach(cell =>
      cell.classList.add("disabled")
    );
  }
  

function disableAll() {
  document.querySelectorAll(".cell").forEach(cell =>
    cell.classList.add("disabled")
  );
}

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}


function reloadGame() {
  location.reload();
}


function goToHome() {
  window.location.href = "index.html"; // Adjust this path if needed
}


createGame();