import { useState } from "react";
import bigEye from "../assets/bigEye.gif";
import eyePile from "../assets/eyes_pile.gif";
import knight from "../assets/knight.gif";

const GRID_SIZE: number = 5;

const rangedBossAttack = (x: number, y: number) => {
  const attackMode: Record<number, BoardGrid[]> = {
    // horizontal attack two rows
    1: [0, 1].flatMap((rowOffset) =>
      [0, 1, 2, 3, 4].map((colIndex) => ({
        row: x + rowOffset,
        col: colIndex,
      })),
    ),
    //vertically attacking two columns
    2: [0, 1].flatMap((rowOffset) =>
      [0, 1, 2, 3, 4].map((colIndex) => ({
        row: colIndex,
        col: y + rowOffset,
      })),
    ),
    3: [],
    // Mode 4: Inner 9 Grids (Center 3x3)
    4: [1, 2, 3].flatMap((r) =>
      [1, 2, 3].map((c) => ({
        row: r,
        col: c,
      })),
    ),

    // Mode 5: Outer Perimeter (The Ring)
    5: [0, 1, 2, 3, 4].flatMap((r) =>
      [0, 1, 2, 3, 4]
        .filter((c) => r === 0 || r === 4 || c === 0 || c === 4)
        .map((c) => ({
          row: r,
          col: c,
        })),
    ),
    6: [0, 1, 2, 3, 4].flatMap((r) =>
      [0, 1, 2, 3, 4]
        .filter((c) => (r + c) % 2 === 0)
        .map((c) => ({ row: r, col: c })),
    ),

    // Mode 7: All Black Grids ((r + c) is odd)
    7: [0, 1, 2, 3, 4].flatMap((r) =>
      [0, 1, 2, 3, 4]
        .filter((c) => (r + c) % 2 !== 0)
        .map((c) => ({ row: r, col: c })),
    ),
  };

  // Update random to include up to 5
  const nextAttackID = Math.floor(Math.random() * 7) + 1;
  return attackMode[nextAttackID];
};

interface Player {
  health: number;
  class: "knight" | "wizard";
  posX: number;
  posY: number;
}

interface Boss {
  health: number;
  class: "bigEye";
  posX: number;
  posY: number;
  // this control how many grid the boss occupied
  size: number;
  mode: "aggressive" | "passive";
}

interface BoardGrid {
  col: number;
  row: number;
}

const ChessRPG = () => {
  const [player, setPlayer] = useState<Player>({
    health: 3,
    class: "knight",
    posX: 4,
    posY: 4,
  });

  const [boss, setBoss] = useState<Boss>({
    health: 10,
    class: "bigEye",
    posX: 0,
    posY: 0,
    size: 2,
    mode: "aggressive",
  });

  const [isGameOver, setGameOver] = useState(false);

  const [attackRange, setAttackRange] = useState<BoardGrid[]>([]);

  const isBossTile = (x: number, y: number) => {
    return (
      x >= boss.posX &&
      x < boss.posX + boss.size &&
      y >= boss.posY &&
      y < boss.posY + boss.size
    );
  };

  // check if the upperleft boss grid fits inside the chessboard
  const canBossFitIn = (
    x: number,
    y: number,
    playerX: number,
    playerY: number,
  ) => {
    return (
      x <= GRID_SIZE - boss.size &&
      0 <= x &&
      y <= GRID_SIZE - boss.size &&
      0 <= y &&
      (playerX >= x + boss.size ||
        playerX < x ||
        playerY >= y + boss.size ||
        playerY < y)
    );
  };

  const handlePlayerMove = (targetX: number, targetY: number) => {
    if (isGameOver) return;

    const colDiff = Math.abs(targetX - player.posX);
    const rowDiff = Math.abs(targetY - player.posY);

    const isLegalMove =
      (rowDiff == 1 && colDiff == 0) ||
      (rowDiff == 0 && colDiff == 1) ||
      (rowDiff == 0 && colDiff == 0);

    if (isLegalMove && !isBossTile(targetX, targetY)) {
      setPlayer((prev) => ({
        ...prev,
        posX: targetX,
        posY: targetY,
      }));

      if (
        //left margin
        (boss.posX - targetX == 1 &&
          (targetY == boss.posY || targetY == boss.posY + boss.size - 1)) ||
        //top margin
        (boss.posY - targetY == 1 &&
          (targetX == boss.posX || targetX == boss.posX + boss.size - 1)) ||
        // right margin
        (targetX - boss.posX == boss.size &&
          (targetY == boss.posY || targetY == boss.posY + boss.size - 1)) ||
        //bottom margin
        (targetY - boss.posY == boss.size &&
          (targetX == boss.posX || targetX == boss.posX + boss.size - 1))
      ) {
        setBoss((prev) => ({
          ...prev,
          health: prev.health - 1,
        }));
        if (boss.health == 1) {
          setGameOver(true);
          return;
        }
      }

      processBossTurn({ posX: targetX, posY: targetY });
    }
  };

  const moveAggressively = (currentPLayerPos: {
    posX: number;
    posY: number;
  }) => {
    let bossNextPosX = boss.posX;
    let bossNextPosY = boss.posY;

    const horizantalDistance = currentPLayerPos.posX - boss.posX;
    const verticalDistance = currentPLayerPos.posY - boss.posY;

    const isMoveDirectionHorizontal =
      Math.abs(horizantalDistance) >= Math.abs(verticalDistance) ? true : false;

    bossNextPosX = isMoveDirectionHorizontal
      ? bossNextPosX + Math.sign(horizantalDistance)
      : bossNextPosX;
    bossNextPosY = isMoveDirectionHorizontal
      ? bossNextPosY
      : bossNextPosY + Math.sign(verticalDistance);

    return canBossFitIn(
      bossNextPosX,
      bossNextPosY,
      currentPLayerPos.posX,
      currentPLayerPos.posY,
    )
      ? { posX: bossNextPosX, posY: bossNextPosY }
      : { posX: boss.posX, posY: boss.posY };
  };

  const processBossTurn = async (currentPlayerPos: {
    posX: number;
    posY: number;
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    attackRange.forEach((tile) => {
      // Check if player is on this specific tile
      if (
        tile.row === currentPlayerPos.posX &&
        tile.col === currentPlayerPos.posY
      ) {
        setPlayer((prev) => ({
          ...prev,
          health: prev.health - 1,
        }));
        console.log("Player hit by fire at:", tile.row, tile.col);
        if (player.health - 1 <= 0) setGameOver(true);
      }
    });

    const pos = moveAggressively(currentPlayerPos);

    setBoss((prev) => ({
      ...prev,
      posX: pos.posX,
      posY: pos.posY,
    }));

    setAttackRange(rangedBossAttack(pos.posX, pos.posY));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white p-4 select-none touch-none">
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-red-500 uppercase mb-8 drop-shadow-lg">
        CHESS RPG
      </h1>

      <div className="flex flex-col md:flex-row items-start gap-8 max-w-6xl">
        <div className="w-full md:w-48 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-zinc-300">
          <h3 className="font-bold text-red-500 uppercase mb-3 tracking-widest border-b border-zinc-700 pb-1">
            Manual
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-2">
              <div className="w-4 h-4 bg-green-500/20 border border-green-500/50 rounded-sm shrink-0" />
              <p>
                <span className="text-green-400 font-bold">Green</span> tiles
                show where you can move.
              </p>
            </li>
            <li className="flex gap-2 text-zinc-400">
              <p>
                Watch for the{" "}
                <span className="text-red-400 font-bold italic">Eye Piles</span>
                —they show the boss's next attack.
              </p>
            </li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-zinc-800 border border-zinc-600 text-zinc-400 font-bold uppercase text-xs tracking-widest hover:bg-red-900/20 hover:text-red-500 hover:border-red-900/50 transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            Exit Game
          </button>
        </div>

        <div className="flex flex-col items-center">
          {/* Health Bars */}
          <div className="flex justify-between items-end w-full px-1 mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">
                Boss
              </span>
              <span className="text-xl font-mono text-red-400">
                HP: {boss.health}/10
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">
                Player
              </span>
              <span className="text-xl font-mono text-blue-400">
                HP: {player.health}/3
              </span>
            </div>
          </div>

          {/* The Grid */}
          <div className="relative border-4 border-zinc-700 leading-0">
            {[...Array(GRID_SIZE)].map((_, r) => (
              <div key={r} className="flex">
                {[...Array(GRID_SIZE)].map((_, c) => {
                  const isGrey = (r + c) % 2 === 0;
                  const hasPlayer = player.posX === r && player.posY === c;
                  // Move distance logic for 4-direction movement
                  const isMovable =
                    Math.abs(r - player.posX) + Math.abs(c - player.posY) <= 1;
                  const isAttack = attackRange.some(
                    (a) => a.row === r && a.col === c,
                  );
                  const isBoss =
                    r >= boss.posX &&
                    r < boss.posX + boss.size &&
                    c >= boss.posY &&
                    c < boss.posY + boss.size;

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handlePlayerMove(r, c)}
                      className={`w-[16vw] h-[16vw] max-w-17.5 max-h-17.5 flex items-center justify-center relative border border-zinc-800 ${isGrey ? "bg-zinc-600" : "bg-zinc-400"}`}
                    >
                      {/* Movable Highlight (Subtle Overlay) */}
                      {isMovable && (
                        <div className="absolute inset-0 bg-green-400/20 z-0 pointer-events-none" />
                      )}

                      {/* Attack indicator (eyePile.gif handles the visual warning) */}
                      {isAttack && !isBoss && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <img src={eyePile} alt="Attack Warning" />
                        </div>
                      )}

                      {/* Knight GIF (with cache-busting key) */}
                      {hasPlayer && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <img src={knight} alt="Knight" />
                        </div>
                      )}

                      {/* Boss Rendering */}
                      {boss.posX === r && boss.posY === c && (
                        <div className="absolute top-0 left-0 w-[200%] h-[200%] z-30 pointer-events-none p-1">
                          <img
                            src={bigEye}
                            className="w-full h-full object-contain"
                            alt="Boss"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Victory Popup */}
      {isGameOver && boss.health <= 0 && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center p-8 border-4 border-yellow-500 bg-zinc-900 rounded-lg shadow-2xl">
            <h2 className="text-6xl font-black text-yellow-500 mb-4 italic tracking-tighter">
              VICTORY
            </h2>
            <p className="text-zinc-400 mb-8 uppercase tracking-widest font-bold">
              The Dungeon is Cleared
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-yellow-500 text-black font-black uppercase hover:bg-yellow-400 transition-transform active:scale-95"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      {isGameOver && player.health <= 0 && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center p-8 border-4 border-yellow-500 bg-zinc-900 rounded-lg shadow-2xl">
            <h2 className="text-6xl font-black text-yellow-500 mb-4 italic tracking-tighter">
              LOSS
            </h2>
            <p className="text-zinc-400 mb-8 uppercase tracking-widest font-bold">
              The boss is too strong...
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-yellow-500 text-black font-black uppercase hover:bg-yellow-400 transition-transform active:scale-95"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessRPG;
