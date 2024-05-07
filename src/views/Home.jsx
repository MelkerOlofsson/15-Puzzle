import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import "../components/css/Home.css";
import { useState } from "react";

function Home() {
  const [boardSize, setBoardSize] = useState({ row: 4, column: 4 }); // Rader bör vara lägre än kolumner!
  const [classicMode, setClassicMode] = useState(0); // 0 är "av", 1 är "på"
  const [overOrUnderLimit, setOverOrUnderLimit] = useState(false);

  // Skiftar Classicmode mellan  av och på.
  function toggleClassicMode() {
    setClassicMode(classicMode === 1 ? 0 : 1);
  }

  // Ställer in rader och kolumner på spelbrädet och håller koll på gränsen.
  function onRowAndColumnChange(event) {
    if (event.target.value < 2 || event.target.value > 10) {
      setOverOrUnderLimit(true);
    } else {
      setOverOrUnderLimit(false);
    }
    if (event.target.name === "rows") {
      setBoardSize({ ...boardSize, row: parseInt(event.target.value) });
    } else if (event.target.name === "columns") {
      setBoardSize({ ...boardSize, column: parseInt(event.target.value) });
    }
  }

  return (
    <>
      <section className="homehero">
        <h1>Välkommen Grebban!</h1>
        <h2>Klicka på knappen nedanför för att starta pusslet.</h2>
        <Link
          className="linkbutton"
          to={
            boardSize.row <= boardSize.column &&
            overOrUnderLimit !== true &&
            `/puzzle/${classicMode}/${boardSize.row}/${boardSize.column}`
          }
        >
          Start
        </Link>
        <h3 className="infoheading">
          Glömt hur man lirar?
          <HashLink className="infobutton" smooth to="#info">
            Kika instruktionerna!
          </HashLink>
        </h3>
        <h3 className="infoheading">
          Vill du ha en utmaning?
          <HashLink className="infobutton" smooth to="#settings">
            Ställ in dina inställningar.
          </HashLink>
        </h3>
      </section>
      <section className="gamesetting">
        <h2 id="settings">Inställningar</h2>
        <fieldset className="classicmode" onChange={toggleClassicMode}>
          <h3>Klassiskt läge:</h3>
          <label htmlFor="classicmodeoff">Av</label>
          <input
            type="radio"
            name="classicmode"
            id="classicmodeoff"
            defaultChecked
            value={false}
          />
          <label htmlFor="classicmodeon">På</label>
          <input
            type="radio"
            name="classicmode"
            id="classicmodeon"
            value={true}
          />
        </fieldset>
        <h4>
          Klassiskt läge limiterar dig till att endast kunna flytta en ruta åt
          taget.
        </h4>
        {boardSize.row > boardSize.column && (
          <h2 id="error">Rader behöver vara samma eller mindre än kolumner.</h2>
        )}
        {overOrUnderLimit === true && (
          <h2 id="error">Gränsen över-/underskriden.</h2>
        )}
        <div className="difficulty">
          <h3>Rader</h3>
          <input
            value={boardSize.row}
            max={10}
            min={2}
            type="number"
            name="rows"
            id="rows"
            onChange={onRowAndColumnChange}
          />
          <h3>Kolumner</h3>
          <input
            value={boardSize.column}
            max={10}
            min={2}
            type="number"
            name="columns"
            id="columns"
            onChange={onRowAndColumnChange}
          />
        </div>
        <h4>Min 2. Max 10.</h4>
      </section>
      <section className="infosection" id="info">
        <h2>Instruktioner</h2>
        <ul>
          <li>
            Spelplanen består utav rutor med nummer. Ett klassiskt 15-pussel
            består utav 15st numrerade rutor (1 till 15) och en tom ruta, men i
            detta pussel så kan du själv bestämma hur många rader och kolumner
            du vill spela med.
          </li>
          <li>
            Rutorna kommer att blandas, och din uppgift är att försöka ordna
            tillbaka rutorna till sin ordning på så få drag som möjligt. Från
            den lägsta siffran högst upp till vänster, till den högsta siffran
            längst ner till höger.
          </li>
          <li>
            Du flyttar rutorna genom att klicka på dem. Du kan endast flytta de
            rutor som befinner sig på samma rad eller kolumn som den tomma
            rutan. OBS: I det klassiska läget så kan du endast flytta de rutor
            som befinner sig precis intill den tomma rutan.
          </li>
          <li>
            Du kan närsomhelst avbryta ditt pussel och börja om genom att klicka
            på knappen &quot;Blanda&quot;.
          </li>
        </ul>
        <h2>Lycka till!</h2>
      </section>
    </>
  );
}

export default Home;
