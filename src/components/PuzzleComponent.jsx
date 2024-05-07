import "./css/PuzzleComponent.css";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

function PuzzleComponent() {
  let { classic, row, column } = useParams();

  const [boardSize] = useState({
    rows: parseInt(row), // Rader bör vara lägre än kolumner!
    columns: parseInt(column),
  });
  const [classicMode] = useState(Boolean(parseInt(classic)));
  const [lastTileInteger] = useState(boardSize.columns * boardSize.rows);
  const [tilesArray, setTilesArray] = useState([]);
  const [availableMoves, setAvailableMoves] = useState();
  const [solved, setSolved] = useState(false);
  const [movesAmount, setMovesAmount] = useState(0);

  // Anpassar mitt CSS-grid baserat på hur många kolumner och rader som valts.
  function grid() {
    const gridStyle = {
      gridTemplateColumns: `repeat(${boardSize.columns}, 1fr)`,
      gridTemplateRows: `repeat(${boardSize.rows}, 1fr)`,
    };
    return gridStyle;
  }

  // Kollar om pusslet är löst.
  function checkIfSolved(tiles) {
    let correctTiles = 0;
    tiles.forEach((tile) => {
      if (tile.correctValue === tile.currentValue) {
        correctTiles++;
        if (correctTiles === lastTileInteger) {
          setSolved(true);
          console.log("Du vann");
        }
      }
    });
  }

  // Shufflefunktion (Fisher-Yates).
  function shuffle(tiles) {
    let items = tiles.length;
    let temp;
    let i;

    while (items) {
      i = Math.floor(Math.random() * items--);
      temp = tiles[items].currentValue;
      tiles[items].currentValue = tiles[i].currentValue;
      tiles[i].currentValue = temp;
    }
    return tiles;
  }

  // Kollar om en siffra är jämn. Behövs i funktionen nedanför.
  // Credit: "Modulus Operator", https://www.educative.io/answers/how-to-check-if-a-number-is-odd-or-even-in-javascript.
  function isEven(number) {
    return number % 2 === 0;
  }

  // Kollar om spelet är lösbart efter blandning, annars blandas det om.
  // Information om vad som gör pusslet lösbart fann jag här: https://www.geeksforgeeks.org/check-instance-15-puzzle-solvable/.
  // På denna sidan finns kod som jag misstänker visar hur man bygger en sådan "algoritm". Jag har inte använt mig utav denna, all kod nedanför har jag skrivit själv.
  function checkIfSolveable(tiles) {
    let inversions = 0;
    let oddArray = [];
    let checkIfLastTileIsInOddPosition;

    // Klonar arrayen och plockar bort den tomma platsen.
    let tempArray = tiles.filter(
      (tile) => tile.currentValue !== lastTileInteger
    );

    // Kollar antalet "inversions" för varje tile.
    tempArray.forEach((tile) => {
      let nIsFinished = false;
      // Kollar om värdet på nuvarande tile är större än nästkommande tiles (en inversion).
      for (let n = tempArray.indexOf(tile) + 1; n < tempArray.length; n++) {
        if (tile.currentValue > tempArray[n].currentValue) {
          inversions++;
          if (n === tempArray.length) {
            nIsFinished = true;
          }
        }
      }
      // Plockar bort de tiles som kontrollerats.
      if (nIsFinished === true) {
        tempArray.shift();
      }
    });

    // Definierar index på raderna som är udda om antal kolumner är ett jämnt tal...
    if (isEven(boardSize.columns)) {
      let firstTileIndexInRow = isEven(boardSize.rows) ? boardSize.columns : 0;

      tiles.forEach((tile) => {
        if (tile.index === firstTileIndexInRow) {
          for (let i = 0; i < boardSize.columns; i++) {
            oddArray.push(tiles[i + firstTileIndexInRow].index);
          }
          firstTileIndexInRow = firstTileIndexInRow + boardSize.columns * 2;
        }
      });

      // ...och kollar om den tomma platsen är placerad på någon av dessa.
      checkIfLastTileIsInOddPosition = oddArray.some(
        (index) =>
          tiles.findIndex((tile) => tile.currentValue === lastTileInteger) ===
          index
      );

      // Om positionen av den tomma rutan är på en jämn rad, och antal inversions är ett jämnt tal så skapas nya tiles (då spelplanen ej var lösbar).
      if (
        (isEven(inversions) === true && !checkIfLastTileIsInOddPosition) ||
        (isEven(inversions) === false && checkIfLastTileIsInOddPosition)
      ) {
        createTiles();
      }
    } else {
      if (isEven(inversions) === false) {
        createTiles();
      }
    }
  }

  // Skapar alla "tiles".
  function createTiles() {
    setSolved(false);
    setMovesAmount(0);

    let tempTileArray = [];

    for (let i = 1; i <= lastTileInteger; i++) {
      const tempTileObject = { index: i - 1, correctValue: i, currentValue: i };
      tempTileArray.push(tempTileObject);
    }

    // Blandar och sedan skapar spelplanen.
    shuffle(tempTileArray);
    setTilesArray(tempTileArray);
  }

  // Kollar vilka drag som är okej att göra.
  function checkLegalMoves(tiles) {
    let lastAndFirstTileOfRow = { leftSide: [], rightSide: [] };
    let first = 1;
    let last = boardSize.columns;

    // CLASSIC MODE (Går endast att klicka på tiles bredvid den tomma rutan.)
    if (classicMode) {
      // Kollar vilka tiles som är breddramen utav spelplanen.
      tiles.forEach((tile) => {
        if (tile.correctValue === first) {
          lastAndFirstTileOfRow.leftSide.push(tile);
          lastAndFirstTileOfRow.rightSide.push(tiles[last - 1]);
          first = 1 + last;
          last = last + boardSize.columns;
        }
      });

      // Returnerar de drag som är giltiga.
      const positionOfBlank = tiles.find(
        (tile) => tile.currentValue === lastTileInteger
      );
      const moves = tiles.filter((tile) => {
        if (tile.index === positionOfBlank.index - boardSize.columns) {
          return true;
        } else if (
          tile.index === positionOfBlank.index + 1 &&
          !lastAndFirstTileOfRow.leftSide.find(
            (item) => item.index === tile.index
          )
        ) {
          return true;
        } else if (tile.index === positionOfBlank.index + boardSize.columns) {
          return true;
        } else if (
          tile.index === positionOfBlank.index - 1 &&
          !lastAndFirstTileOfRow.rightSide.find(
            (item) => item.index === tile.index
          )
        ) {
          return true;
        }
      });
      setAvailableMoves(moves);
    }

    // EJ CLASSIC MODE (Identifierar den tomma rutan och vilka tiles som ligger över, under, och bredvid.)
    else {
      let xAndYOfBlank = {
        index: tiles.findIndex((tile) => tile.currentValue === lastTileInteger),
        xOfBlank: [],
        yOfBlank: [],
      };
      let yAxis = [];
      let xAxis = [];
      let firstRowIndex = 0;
      let lastRowIndex = boardSize.columns;

      // Loopar igenom raderna...
      for (let r = 0; r < boardSize.rows; r++) {
        let tempObjectArray = [];
        let firstColumnIndex = 0;
        // ...och lägger varje 'tile' i en array per rad (X-axeln).
        for (let i = firstRowIndex; i < lastRowIndex; i++) {
          tempObjectArray.push(tiles[i]);
          // Sparar Y-axeln (Y-axeln skapas i koden längre ner).
          if (yAxis.length === boardSize.columns) {
            yAxis[firstColumnIndex].push(tiles[i]);
            firstColumnIndex++;
          }
        }
        firstRowIndex += boardSize.columns;
        lastRowIndex += boardSize.columns;

        // Sparar X-axeln och skapar grunden för Y-axeln.
        xAxis.push(tempObjectArray);
        if (yAxis.length < boardSize.columns) {
          tempObjectArray.forEach((tile) => {
            yAxis.push([tile]);
          });
        }
        // Tar fram X-axeln för den tomma platsen.
        if (
          tempObjectArray.find((item) => item.currentValue === lastTileInteger)
        ) {
          tempObjectArray.forEach((tile) => {
            xAndYOfBlank.xOfBlank.push(tile);
          });
        }
      }
      // Tar fram Y-axeln för den tomma platsen.
      yAxis.forEach((array) => {
        if (array.find((tile) => tile.currentValue === lastTileInteger)) {
          array.forEach((tile) => {
            xAndYOfBlank.yOfBlank.push(tile);
          });
        }
      });
      setAvailableMoves(xAndYOfBlank);
    }
  }

  // Skapa spelbrädet...
  useEffect(() => {
    createTiles();
  }, []);

  // ...sen kolla om pusslet går att lösa samt giltiga drag.
  useEffect(() => {
    if (tilesArray.length === lastTileInteger) {
      checkLegalMoves(tilesArray);
      checkIfSolveable(tilesArray);
    }
  }, [tilesArray]);

  function handleTileClick(object) {
    if (solved === false) {
      let updatedArray = [...tilesArray];
      // CLASSIC MODE (Går endast att klicka på tiles bredvid den tomma rutan.)
      if (classicMode) {
        // Kolla om värdet som klickas är giltigt.
        if (
          availableMoves.find(
            (item) => item.currentValue === object.currentValue
          )
        ) {
          // Flippa den tomma rutan med värdet som klickades.
          updatedArray[
            updatedArray.findIndex(
              (item) => item.currentValue === lastTileInteger
            )
          ].currentValue = object.currentValue;
          updatedArray[object.correctValue - 1].currentValue = lastTileInteger;

          // Uppdatera spelplanen med det gjorda draget...
          setTilesArray(updatedArray);
          // ... och kollar om pusslet är löst.
          setMovesAmount(movesAmount + 1);
          checkIfSolved(updatedArray);
        }
      }

      // EJ CLASSIC MODE (Går att flytta samtliga tiles på samma X- och Y-axel)
      else {
        const tileExistInX = availableMoves.xOfBlank.find(
          (item) => item.currentValue === object.currentValue
        );
        const tileExistInY = availableMoves.yOfBlank.find(
          (item) => item.currentValue === object.currentValue
        );
        // Kollar om den klickade rutan är giltig.
        if (tileExistInX || tileExistInY) {
          let tempArray = tileExistInX
            ? availableMoves.xOfBlank.map((tile) => tile.currentValue)
            : availableMoves.yOfBlank.map((tile) => tile.currentValue);

          let tempOriginal = tileExistInX
            ? [...availableMoves.xOfBlank]
            : [...availableMoves.yOfBlank];

          const clickedTileIndex = tempArray.findIndex(
            (item) => item === object.currentValue
          );

          // Byter plats på den tomma rutan.
          if (tempArray.find((value) => value === object.currentValue)) {
            tempArray = tempArray.filter((item) => item !== lastTileInteger);
            tempArray.splice(clickedTileIndex, 0, lastTileInteger);

            // Uppdaterar alla tiles med sina nya värden.
            updatedArray.forEach((tile) => {
              const tileIndex = tile.index;
              const tileValue = tile.currentValue;
              tempOriginal.forEach((tile) => {
                const checkedIndex = tempOriginal.indexOf(tile);
                if (tileValue === tile.currentValue) {
                  updatedArray[tileIndex].currentValue =
                    tempArray[checkedIndex];
                }
              });
            });
          }
          // Uppdatera spelplanen med det gjorda draget...
          setTilesArray(updatedArray);
          // ... och kollar om pusslet är löst.
          setMovesAmount(movesAmount + 1);
          checkIfSolved(updatedArray);
        } else {
          console.log("Ogiltigt drag!");
        }
      }
    }
  }

  return (
    <>
      <section className="gamesection">
        <section className="puzzlesection">
          <div className="puzzlecontainer" style={grid()}>
            {tilesArray.map((tile) =>
              tile.currentValue !== lastTileInteger ? (
                <div
                  key={tile.correctValue}
                  className="puzzlebox"
                  onClick={() => handleTileClick(tile)}
                >
                  <h3>{tile.currentValue}</h3>
                </div>
              ) : (
                <div
                  key={tile.correctValue}
                  className="PuzzleBox"
                  id="LastTile"
                ></div>
              )
            )}
          </div>
        </section>
        {solved === true && (
          <div className="wincontainer">
            <h2>Du löste det! Snyggt jobbat.</h2>
          </div>
        )}
        <section className="gameinputs">
          <div className="statscontainer">
            <p>Antal drag:</p>
            <h3 id="moves">{movesAmount}</h3>
          </div>
          <button className="shufflebutton" onClick={createTiles}>
            {solved ? "Nytt spel" : "Blanda"}
          </button>
        </section>
      </section>
    </>
  );
}

export default PuzzleComponent;
