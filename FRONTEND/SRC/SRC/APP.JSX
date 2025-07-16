import { useEffect, useState, useRef } from "react";
import { socket } from "./socket";

function App() {
  const [status, setStatus] = useState("🔄 Connecting...");
  const [room, setRoom] = useState(null);
  const [logs, setLogs] = useState([]);
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const timerRef = useRef(null);

  useEffect(() => {
    socket.on("waiting", (msg) => setStatus(msg));
    socket.on("startGame", ({ roomID }) => {
      setStatus("✅ Game Started! Room: " + roomID);
      setRoom(roomID);
      startTimer();
    });
    socket.on("opponentMove", (move) => {
      log("Opponent chose: " + move);
      if (move === "attack") {
        setOpponentScore((s) => s + 1);
      }
    });
  }, []);

  const log = (msg) => setLogs((prev) => [...prev, msg]);

  const sendMove = (move) => {
    if (!room) return;
    socket.emit("move", { roomID: room, move });
    log("You chose: " + move);
    if (move === "attack") setScore((s) => s + 1);
  };

  const startTimer = () => {
    setTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    const result =
      score > opponentScore
        ? "🎉 You Win!"
        : score < opponentScore
        ? "😢 You Lose"
        : "🤝 Draw!";
    log("⏰ Time's Up! " + result);
    setStatus("🔚 Game Over");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>⚔️ Real-Time 1v1 Game</h1>
      <h2>{status}</h2>
      {room && (
        <>
          <p>⏱️ Timer: {timer}s</p>
          <p>🔢 Your Score: {score}</p>
          <p>🧑‍🤝‍🧑 Opponent Score: {opponentScore}</p>

          <button onClick={() => sendMove("attack")}>⚔️ Attack</button>
          <button onClick={() => sendMove("defend")}>🛡️ Defend</button>
        </>
      )}

      <h3>📝 Log</h3>
      <ul>{logs.map((msg, i) => <li key={i}>{msg}</li>)}</ul>
    </div>
  );
}

export default App;
