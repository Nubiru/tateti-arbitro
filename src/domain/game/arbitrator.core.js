/**
 * Núcleo del Árbitro - Funciones Puras para Lógica de Juego
 * Contiene lógica de juego central y sin opiniones que puede ser reutilizada y probada de forma aislada.
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

export const validatePlayers = players => {
  if (!Array.isArray(players)) {
    throw new Error('Los jugadores deben ser un array');
  }

  if (players.length !== 2) {
    throw new Error('Se necesitan exactamente 2 jugadores para la partida');
  }

  players.forEach((player, index) => {
    if (
      !player.name ||
      typeof player.name !== 'string' ||
      player.name.trim() === ''
    ) {
      throw new Error(`Jugador ${index + 1} debe tener un nombre válido`);
    }

    if (!player.port || typeof player.port !== 'number' || player.port <= 0) {
      throw new Error(`Jugador ${index + 1} debe tener un puerto válido`);
    }
  });
};

export const normalizePlayer = (player, id) => {
  return {
    id: id || player.id || 'X', // Player ID for board representation
    name: player.name.trim(),
    port: player.port,
    host: player.host || 'localhost',
    protocol: player.protocol || 'http',
    type: player.type || 'algorithm',
    isHuman: player.isHuman || false,
  };
};

export const createInitialBoard = boardSize => {
  if (boardSize !== 3 && boardSize !== 5) {
    throw new Error('Tamaño de tablero inválido');
  }
  return Array(boardSize * boardSize).fill(0);
};

export const isValidMove = (board, position) => {
  if (position < 0 || position >= board.length) {
    return false; // Fuera de límites
  }
  return board[position] === 0; // La celda debe estar vacía
};

export const makeMove = (board, position, symbol) => {
  const newBoard = [...board];
  newBoard[position] = symbol;
  return newBoard;
};

export const checkWinner = (board, boardSize, symbol) => {
  const lines = [];

  // Horizontal
  for (let i = 0; i < boardSize; i++) {
    const row = [];
    for (let j = 0; j < boardSize; j++) {
      row.push(i * boardSize + j);
    }
    lines.push(row);
  }

  // Vertical
  for (let i = 0; i < boardSize; i++) {
    const col = [];
    for (let j = 0; j < boardSize; j++) {
      col.push(j * boardSize + i);
    }
    lines.push(col);
  }

  // Diagonales
  const diag1 = [];
  const diag2 = [];
  for (let i = 0; i < boardSize; i++) {
    diag1.push(i * boardSize + i);
    diag2.push(i * boardSize + (boardSize - 1 - i));
  }
  lines.push(diag1);
  lines.push(diag2);

  return lines.some(line => line.every(index => board[index] === symbol));
};

export const getWinningLine = (board, boardSize, symbol) => {
  const lines = [];

  // Horizontal
  for (let i = 0; i < boardSize; i++) {
    const row = [];
    for (let j = 0; j < boardSize; j++) {
      row.push(i * boardSize + j);
    }
    lines.push(row);
  }

  // Vertical
  for (let i = 0; i < boardSize; i++) {
    const col = [];
    for (let j = 0; j < boardSize; j++) {
      col.push(j * boardSize + i);
    }
    lines.push(col);
  }

  // Diagonales
  const diag1 = [];
  const diag2 = [];
  for (let i = 0; i < boardSize; i++) {
    diag1.push(i * boardSize + i);
    diag2.push(i * boardSize + (boardSize - 1 - i));
  }
  lines.push(diag1);
  lines.push(diag2);

  // Encontrar la línea ganadora
  for (const line of lines) {
    if (line.every(index => board[index] === symbol)) {
      return line;
    }
  }
  return null;
};

export const checkDraw = board => {
  return board.every(cell => cell !== 0);
};

export const getNextPlayer = currentPlayer => {
  return currentPlayer === 'X' ? 'O' : 'X';
};

export const checkGameOver = (board, boardSize) => {
  // Verificar ganador
  if (checkWinner(board, boardSize, 'X')) {
    return { result: 'win', winner: 'X' };
  }
  if (checkWinner(board, boardSize, 'O')) {
    return { result: 'win', winner: 'O' };
  }

  // Verificar empate
  if (checkDraw(board)) {
    return { result: 'draw', winner: null };
  }

  // El juego continúa
  return { result: 'continue', winner: null };
};

export const getValidMoves = (board, boardSize) => {
  const validMoves = [];
  for (let i = 0; i < boardSize * boardSize; i++) {
    if (isValidMove(board, i)) {
      validMoves.push(i);
    }
  }
  return validMoves;
};

export const isInWinningLine = (board, position, boardSize, symbol) => {
  // Obtener la fila que contiene esta posición
  const rowIndex = Math.floor(position / boardSize);
  const row = [];
  for (let j = 0; j < boardSize; j++) {
    row.push(rowIndex * boardSize + j);
  }

  // Verificar si esta fila podría convertirse en una línea ganadora para el símbolo
  const lineCells = row.map(index => board[index]);
  const hasEmptyCell = lineCells.some(cell => cell === 0);
  const hasOpponentSymbol = lineCells.some(
    cell => cell !== 0 && cell !== symbol
  );

  // Una línea puede convertirse en una línea ganadora si:
  // 1. Tiene al menos una celda vacía (para que pueda completarse)
  // 2. No tiene símbolos del oponente (para que pueda ser ganada por el símbolo objetivo)
  return hasEmptyCell && !hasOpponentSymbol;
};

// Alias para checkDraw para coincidir con las expectativas de prueba
export const isBoardFull = checkDraw;

// Alias for checkWinner to match coordinator expectations
export const checkWin = checkWinner;

// Process move function
export const processMove = (board, position, symbol) => {
  if (!isValidMove(board, position)) {
    throw new Error('Movimiento inválido');
  }
  return makeMove(board, position, symbol);
};

// Create match result function
export const createMatchResult = ({
  players,
  history,
  winner,
  winningLine,
  result,
  message,
  finalBoard,
}) => {
  return {
    players,
    history,
    winner,
    winningLine,
    result,
    message,
    finalBoard,
    status: result, // Alias for backwards compatibility
    board: finalBoard, // Alias for backwards compatibility
  };
};

// Apply rolling window function (for no-tie mode)
export const applyRollingWindow = (board, boardSize) => {
  if (boardSize !== 3) {
    return board; // Only apply to 3x3 boards
  }

  // Shift all pieces one position to the left
  const newBoard = [...board];
  for (let i = 0; i < board.length - 1; i++) {
    newBoard[i] = newBoard[i + 1];
  }
  newBoard[board.length - 1] = 0; // Last position becomes empty

  return newBoard;
};
