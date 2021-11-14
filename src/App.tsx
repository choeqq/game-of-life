import React, { useCallback, useRef, useState } from "react";
import produce from "immer";
import styled from "styled-components";

const numRows = 50;
const numCols = 50;

const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0],
];

const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }

  return rows;
};

const App: React.FC = () => {
  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  });
  const [running, setRunning] = useState(false);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);

  const getToggledGrid = (rowIdx: number, colIdx: number) => {
    const newGrid = produce(grid, (gridCopy) => {
      gridCopy[rowIdx][colIdx] = grid[rowIdx][colIdx] ? 0 : 1;
    });
    return newGrid;
  };

  const handleMouseDown = (rowIdx: number, colIdx: number) => {
    const newGrid = getToggledGrid(rowIdx, colIdx);
    setGrid(newGrid);
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (rowIdx: number, colIdx: number) => {
    if (!mouseIsPressed) return;
    const newGrid = getToggledGrid(rowIdx, colIdx);
    setGrid(newGrid);
  };

  const handlerMouseUp = () => {
    setMouseIsPressed(false);
  };

  const runningRef = useRef(running);
  runningRef.current = running;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    setGrid((prevState) => {
      return produce(prevState, (gridCopy) => {
        for (let i = 0; i < numRows; i++) {
          for (let j = 0; j < numCols; j++) {
            let neighbors = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newJ = j + y;
              if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCols) {
                neighbors += prevState[newI][newJ];
              }
            });

            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][j] = 0;
            } else if (prevState[i][j] === 0 && neighbors === 3) {
              gridCopy[i][j] = 1;
            }
          }
        }
      });
    });

    setTimeout(runSimulation, 100);
  }, []);

  return (
    <>
      <button
        onClick={() => {
          setRunning((prevState) => !prevState);
          if (!running) {
            runningRef.current = true;
            runSimulation();
          }
        }}
      >
        {running ? "stop" : "start"}
      </button>
      <button
        onClick={() => {
          setGrid(generateEmptyGrid());
        }}
      >
        clear
      </button>
      <button
        onClick={() => {
          const rows = [];
          for (let i = 0; i < numRows; i++) {
            rows.push(
              Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0))
            );
          }

          setGrid(rows);
        }}
      >
        random
      </button>
      <Container numCols={numCols}>
        {grid.map((rows, i) =>
          rows.map((col, j) => (
            <Cell
              key={`${i}-${j}`}
              value={grid[i][j]}
              onMouseDown={() => handleMouseDown(i, j)}
              onMouseEnter={() => handleMouseEnter(i, j)}
              onMouseUp={() => handlerMouseUp()}
            />
          ))
        )}
      </Container>
    </>
  );
};

export default App;

interface CellProps {
  value: number;
}

interface ContainerProps {
  numCols: number;
}

const Container = styled.div<ContainerProps>`
  display: grid;
  grid-template-columns: repeat(${({ numCols }) => numCols}, 20px);
`;

const Cell = styled.div<CellProps>`
  width: 20px;
  height: 20px;
  background-color: ${({ value }) => (value ? "pink" : undefined)};
  border: 1px solid black;
`;
