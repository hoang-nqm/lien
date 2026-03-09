import React, { useState, useEffect } from 'react';
import { RotateCcw, Save, Trophy, History, AlertCircle, UserPlus } from 'lucide-react';
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [history, setHistory] = useState([]);
  const [numPlayers, setNumPlayers] = useState(4);
  const [tempNames, setTempNames] = useState({});
  const [isStarted, setIsStarted] = useState(false);
  const [roundScores, setRoundScores] = useState({});
  const [error, setError] = useState("");

  // Tự động Load dữ liệu khi mở trang
  useEffect(() => {
    const saved = localStorage.getItem('lieng_v4_final');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPlayers(parsed.players);
      setHistory(parsed.history);
      setIsStarted(parsed.isStarted);
      syncRoundInputs(parsed.players);
    }
  }, []);

  // Tự động Lưu dữ liệu khi có thay đổi
  useEffect(() => {
    if (isStarted) {
      localStorage.setItem('lieng_v4_final', JSON.stringify({ players, history, isStarted }));
    }
  }, [players, history, isStarted]);

  const syncRoundInputs = (list) => {
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
    syncRoundInputs(newPs);
  };

  const updateRoundVal = (id, delta) => {
    setRoundScores(prev => ({ ...prev, [id]: (Number(prev[id]) || 0) + delta }));
  };

  const saveRound = () => {
    const sum = Object.values(roundScores).reduce((a, b) => Number(a) + Number(b), 0);
    
    if (sum !== 0) {
      setError(`Tổng điểm ván phải = 0 (Hiện tại: ${sum > 0 ? '+' + sum : sum})`);
      return;
    }

    const updatedPlayers = players.map(p => ({
      ...p,
      totalScore: p.totalScore + Number(roundScores[p.id])
    }));
    
    const newRound = {
      roundNo: (history[0]?.roundNo || 0) + 1,
      scoresAtRound: updatedPlayers.map(p => p.totalScore)
    };

    // Chỉ lưu 5 ván gần nhất
    const newHistory = [newRound, ...history].slice(0, 5);

    setPlayers(updatedPlayers);
    setHistory(newHistory);
    syncRoundInputs(players);
    setError("");
  };

  const resetGame = () => {
    if (confirm("Xóa toàn bộ dữ liệu và chơi lại từ đầu?")) {
      localStorage.removeItem('lieng_v4_final');
      window.location.reload();
    }
  };

  // MÀN HÌNH SET UP (Khi mới mở app)
  if (!isStarted) {
    return (
      <div className="app-wrapper">
        <div className="card" style={{ marginTop: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ background: '#eef2ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <UserPlus color="var(--primary)" size={28} />
            </div>
            <h2 style={{ margin: 0 }}>Liêng Score</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px' }}>Thiết lập bàn bài của bạn</p>
          </div>

          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: '6px' }}>Số lượng người chơi</label>
          <input 
            type="number" 
            inputMode="numeric" 
            pattern="[0-9]*"
            className="setup-input" 
            value={numPlayers} 
            onChange={e => setNumPlayers(e.target.value)} 
          />

          <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '4px', marginTop: '10px' }}>
            {Array.from({ length: numPlayers }).map((_, i) => (
              <input 
                key={i} 
                className="setup-input" 
                placeholder={`Tên người chơi ${i + 1}`} 
                onChange={e => setTempNames({ ...tempNames, [i]: e.target.value })} 
              />
            ))}
          </div>
          
          <button className="btn-main" style={{ marginTop: '20px' }} onClick={handleStart}>Bắt đầu ván 1</button>
        </div>
      </div>
    );
  }

  // MÀN HÌNH CHÍNH (Khi đang chơi)
  return (
    <div className="app-wrapper">
      <header className="header">
        <h1>Liêng Scorer</h1>
        <button onClick={resetGame} style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }}>
          <RotateCcw size={22} />
        </button>
      </header>

      {/* TỔNG ĐIỂM HIỆN TẠI */}
      <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <Trophy size={16} color="#f59e0b" />
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)' }}>BẢNG TỔNG ĐIỂM</span>
        </div>
        <div className="score-grid">
          {players.map(p => (
            <div key={p.id} className="stat-item">
              <div className="stat-name">{p.name}</div>
              <div className={`stat-val ${p.totalScore >= 0 ? 'pos' : 'neg'}`} style={{ color: p.totalScore >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {p.totalScore > 0 ? `+${p.totalScore}` : p.totalScore}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NHẬP ĐIỂM VÁN MỚI */}
      <section className="card">
        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Ván tiếp theo</h3>
       {players.map(p => (
  <div key={p.id} className="player-block">
    <div className="player-header">
      <span className="player-name">{p.name}</span>
      
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Nút Đảo Dấu +/- */}
        <button 
          className="btn-toggle-sign"
          onClick={() => {
            const currentVal = Number(roundScores[p.id]) || 0;
            if (currentVal !== 0) {
              setRoundScores({ ...roundScores, [p.id]: currentVal * -1 });
            }
          }}
        >
          +/-
        </button>

        <input 
          type="number" 
          inputMode="numeric" 
          pattern="[0-9]*"
          className="input-score" 
          value={roundScores[p.id]} 
          onChange={e => setRoundScores({ ...roundScores, [p.id]: e.target.value })} 
        />
      </div>
    </div>

    <div className="quick-actions">
      {[-20, -15, -10, -5, 5, 10, 15, 20].map(v => (
        <button 
          key={v} 
          className={`btn-q ${v > 0 ? 'pos' : 'neg'}`}
          onClick={() => setRoundScores({ ...roundScores, [p.id]: (Number(roundScores[p.id]) || 0) + v })}
        >
          {v > 0 ? `+${v}` : v}
        </button>
      ))}
    </div>
  </div>
))}

        {error && <div className="error-msg"><AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {error}</div>}
        
        <button className="btn-main" onClick={saveRound}>
          <Save size={20} /> Lưu ván bài
        </button>
      </section>

      {/* LỊCH SỬ 5 VÁN GẦN NHẤT */}
      {history.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <History size={16} color="var(--text-sub)" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)' }}>5 VÁN GẦN NHẤT</span>
          </div>
          <div className="table-scroll">
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
                    <td style={{ fontWeight: '800', color: '#94a3b8' }}>#{row.roundNo}</td>
                    {row.scoresAtRound.map((score, i) => (
                      <td key={i} style={{ fontWeight: '700', color: score >= 0 ? 'var(--success)' : 'var(--danger)' }}>
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