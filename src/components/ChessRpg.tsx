import { useState } from "react";
import bigEye from "../assets/bigEye.gif"
import hole from "../assets/hole.gif"

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
  };

  const nextAttackID = Math.floor(Math.random() * 3) + 1;

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
    health: 5,
    class: "knight",
    posX: 4,
    posY: 2,
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
        setGameOver(true);
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
      <div className="text-center mb-4 ">
        <h1 className="text-2xl font-black tracking-tighter text-red-500 uppercase">
          Boss Encounter
        </h1>
        <p className="text-zinc-400 text-sm">
          Boss health {boss.health} === Player Health {player.health}
        </p>
      </div>

      <div className="relative border-4 border-zinc-700 leading-0">
        {[...Array(GRID_SIZE)].map((_, r) => (
          <div key={r} className="flex">
            {[...Array(GRID_SIZE)].map((_, c) => {
              const isGrey = (r + c) % 2 === 0;
              const hasPlayer = player.posX === r && player.posY === c;
              const isAttack = attackRange.some(
                (a) => a.row === r && a.col == c,
              );

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handlePlayerMove(r, c)}
                  className={`
                    w-[16vw] h-[16vw] max-w-17.5 max-h-17.5
                    flex items-center justify-center text-3xl
                    border border-zinc-800 transition-colors relative
                    ${isGrey ? "bg-zinc-600" : "bg-zinc-400"}
                  `}
                >
                  {/* Fire Attack Visual */}
                  {isAttack && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img src = {hole} />
                    </div>
                  )}

                  {/* Player King */}
                  {hasPlayer && <span className="z-10 drop-shadow-lg">♔</span>}

                  {/* Boss Representation (Top-left anchor renders the image) */}
                  {boss.posX === r && boss.posY === c && (
                    <div className="absolute top-0 left-0 w-[200%] h-[200%] z-20 pointer-events-none p-1">
                      <img
                        src={bigEye}
                        alt="Boss"
                        className="w-full h-full object-contain"
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
  );
};

export default ChessRPG;
