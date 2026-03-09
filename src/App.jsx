import React, { useState, useEffect } from 'react';
import { RotateCcw, Save, Trophy, History, AlertCircle } from 'lucide-react';
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [history, setHistory] = useState([]);
  const [numPlayers, setNumPlayers] = useState(4);
  const [tempNames, setTempNames] = useState({});
  const [isStarted, setIsStarted] = useState(false);
  const [roundScores, setRoundScores] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('lieng_v5_recent');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPlayers(parsed.players);
      setHistory(parsed.history);
      setIsStarted(parsed.isStarted);
      resetRoundScores(parsed.players);
    }
  }, []);

  useEffect(() => {
    if (isStarted) {
      localStorage.setItem('lieng_v5_recent', JSON.stringify({ players, history, isStarted }));
    }
  }, [players, history, isStarted]);

  const resetRoundScores = (list) => {
    const init = {};
    list.forEach(p => init[p.id] = 0);
    setRoundScores(init);
  };

  const handleStart = () => {
    const newPs = Array.from({ length: numPlayers }).map((_, i) => ({
      id: i,
      name: tempNames[i] || `P${i + 1}`,
      totalScore: 0
    }));
    setPlayers(newPs);
    setIsStarted(true);
    resetRoundScores(newPs);
  };

  const saveRound = () => {
    const sum = Object.values(roundScores).reduce((a, b) => Number(a) + Number(b), 0);
    
    if (sum !== 0) {
      setError(`Tổng ván phải bằng 0. Hiện là: ${sum > 0 ? '+' + sum : sum}`);
      return;
    }

    const updatedPlayers = players.map(p => ({
      ...p,
      totalScore: p.totalScore + Number(roundScores[p.id]) 
    }));
    
    const newRound = {
      roundNo: (history[0]?.roundNo || 0) + 1, // Lấy số ván tiếp theo dựa trên ván mới nhất
      scoresAtRound: updatedPlayers.map(p => p.totalScore)
    };

    // LOGIC QUAN TRỌNG: Chỉ giữ 5 ván gần nhất
    const updatedHistory = [newRound, ...history].slice(0, 5);

    setPlayers(updatedPlayers);
    setHistory(updatedHistory);
    resetRoundScores(players);
    setError("");
  };

  if (!isStarted) {
    return (
      <div className="app-container">
        <div className="card shadow-lg">
          <h2 style={{marginTop: 0, color: 'var(--primary)', textAlign: 'center'}}>Thiết lập bàn bài</h2>
          <div style={{marginBottom: '15px'}}>
            <label style={{fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '5px'}}>Số người chơi</label>
            <input type="number" value={numPlayers} onChange={e => setNumPlayers(e.target.value)} />
          </div>
          <div style={{maxHeight: '300px', overflowY: 'auto', marginBottom: '15px'}}>
            {Array.from({ length: numPlayers }).map((_, i) => (
              <input key={i} placeholder={`Tên người chơi ${i + 1}`} style={{marginBottom: '8px'}} 
                onChange={e => setTempNames({...tempNames, [i]: e.target.value})} />
            ))}
          </div>
          <button className="btn-save" onClick={handleStart}>Bắt đầu chơi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h2 style={{margin: 0}}>Liêng Scorer</h2>
        <button className="btn-reset-icon" onClick={() => confirm("Xóa hết dữ liệu?") && (localStorage.clear() || window.location.reload())}>
            <RotateCcw size={20} />
        </button>
      </header>

      {/* Tổng điểm */}
      <div className="card shadow-sm">
        <div className="section-header">
          <Trophy size={16} color="#f59e0b" />
          <span>TỔNG ĐIỂM</span>
        </div>
        <div className="total-grid">
          {players.map(p => (
            <div key={p.id} className="stat-box">
              <div className="stat-name">{p.name}</div>
              <div className={`stat-value ${p.totalScore >= 0 ? 'text-pos' : 'text-neg'}`}>
                {p.totalScore > 0 ? `+${p.totalScore}` : p.totalScore}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nhập ván mới */}
      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
            <h3 style={{margin: 0}}>Nhập điểm</h3>
            <span style={{fontSize:'12px', color:'var(--text-sub)'}}>Ván tiếp theo</span>
        </div>
        
        {players.map(p => (
          <div key={p.id} className="player-row">
            <div className="player-header">
              <span className="p-name-label">{p.name}</span>
              <input type="number" className="score-input" value={roundScores[p.id]} 
                onChange={e => setRoundScores({...roundScores, [p.id]: e.target.value})} />
            </div>
            <div className="q-grid">
              {[-20, -15, -10, -5, 5, 10, 15, 20].map(v => (
                <button key={v} className={`btn-q ${v > 0 ? 'btn-plus' : 'btn-minus'}`}
                  onClick={() => setRoundScores({...roundScores, [p.id]: Number(roundScores[p.id]) + v})}>
                  {v > 0 ? `+${v}` : v}
                </button>
              ))}
            </div>
          </div>
        ))}

        {error && <div className="alert-error"><AlertCircle size={14} /> {error}</div>}
        
        <button className="btn-save" onClick={saveRound}>
          <Save size={18} style={{marginRight: '8px'}} /> Lưu ván bài
        </button>
      </div>

      {/* Lịch sử 5 ván gần nhất */}
      {history.length > 0 && (
        <div style={{marginBottom: '40px'}}>
          <div className="section-header">
            <History size={16} color="#64748b" />
            <span>LỊCH SỬ (5 VÁN GẦN NHẤT)</span>
          </div>
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Ván</th>
                  {players.map(p => <th key={p.id}>{p.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {history.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{fontWeight: '800', color: '#94a3b8'}}>#{row.roundNo}</td>
                    {row.scoresAtRound.map((score, i) => (
                      <td key={i} className={score >= 0 ? 'text-pos' : 'text-neg'} style={{fontWeight: '700'}}>
                        {score > 0 ? `+${score}` : score}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;