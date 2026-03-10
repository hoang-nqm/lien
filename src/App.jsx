import React, { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Save, Trophy, History, X, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [history, setHistory] = useState([]);
  const [numPlayers, setNumPlayers] = useState(4);
  const [tempNames, setTempNames] = useState({});
  const [isStarted, setIsStarted] = useState(false);
  const [roundScores, setRoundScores] = useState({});
  const [autoId, setAutoId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const saved = localStorage.getItem('lieng_mobile_final');
    if (saved) {
      const p = JSON.parse(saved);
      setPlayers(p.players); setHistory(p.history || []); setIsStarted(p.isStarted);
      initRound(p.players);
    }
  }, []);

  useEffect(() => {
    if (isStarted) localStorage.setItem('lieng_mobile_final', JSON.stringify({ players, history, isStarted }));
  }, [players, history, isStarted]);

  const initRound = (list) => {
    const init = {}; list.forEach(p => init[p.id] = 0);
    setRoundScores(init); setAutoId(list[list.length - 1].id);
  };

  const handleStart = () => {
    const newPs = Array.from({ length: numPlayers }).map((_, i) => ({ id: i, name: tempNames[i] || `P${i + 1}`, totalScore: 0 }));
    setPlayers(newPs); setIsStarted(true); initRound(newPs);
  };

  // Nút chọn nhanh Dynamic theo số người chơi
  const quickValues = useMemo(() => {
    const n = players.length;
    const max = Math.max(15, (n - 1) * 5);
    const vals = []; for (let i = 5; i <= max; i += 5) vals.push(i);
    return vals;
  }, [players.length]);

  const handleFocus = (id) => {
    if (id === autoId) {
      const idx = players.findIndex(p => p.id === id);
      const nextId = players[(idx + 1) % players.length].id;
      setAutoId(nextId); recalculate(roundScores, nextId);
    }
  };

  const recalculate = (scores, currentAutoId) => {
    let sum = 0;
    players.forEach(p => { if (p.id !== currentAutoId) sum += (Number(scores[p.id]) || 0); });
    scores[currentAutoId] = -sum;
    setRoundScores({ ...scores });
  };

  const saveRound = () => {
    const updated = players.map(p => ({ ...p, totalScore: p.totalScore + Number(roundScores[p.id]) }));
    setHistory([{ roundNo: history.length + 1, scores: updated.map(p => p.totalScore) }, ...history]);
    setPlayers(updated); initRound(players); setCurrentPage(1);
  };

  if (!isStarted) {
    return (
      <div className="app-wrapper">
        <div className="setup-box">
          <div style={{textAlign:'center', marginBottom:'20px'}}><UserPlus size={40} color="var(--primary)" /><h2>Vào bàn Liêng</h2></div>
          <input type="number" inputMode="numeric" className="st-input" value={numPlayers} onChange={e => setNumPlayers(e.target.value)} placeholder="Số người chơi" />
          <div style={{maxHeight:'40vh', overflowY:'auto'}}>
            {Array.from({ length: numPlayers }).map((_, i) => (
              <input key={i} className="st-input" placeholder={`Tên người chơi ${i + 1}`} onChange={e => setTempNames({...tempNames, [i]: e.target.value})} />
            ))}
          </div>
          <button className="btn-save" style={{position:'static', marginTop:'10px'}} onClick={handleStart}>Bắt đầu chơi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header className="header">
        <h1 onClick={() => setShowHistory(true)}><History size={20} /> Liêng Scorer</h1>
        <RotateCcw size={20} color="#94a3b8" onClick={() => confirm("Xóa toàn bộ dữ liệu?") && (localStorage.clear() || window.location.reload())} />
      </header>

      <div className="summary-card">
        <div className="score-grid">
          {players.map(p => (
            <div key={p.id} className="stat-item">
              <span className="stat-name">{p.name}</span>
              <span className="stat-val" style={{color: p.totalScore >= 0 ? 'var(--success)' : 'var(--danger)'}}>
                {p.totalScore > 0 ? `+${p.totalScore}` : p.totalScore}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{paddingBottom:'100px'}}>
        {players.map((p) => {
          const isAuto = p.id === autoId;
          return (
            <div key={p.id} className={`player-card ${isAuto ? 'is-auto' : ''}`}>
              <div className="row-top">
                <span className="p-name">{p.name} {isAuto && <span style={{fontSize:'10px', color: 'var(--primary)'}}>(Auto)</span>}</span>
                <div className="input-group">
                  {!isAuto && (
                    <button className="btn-sign" onClick={() => {
                      const newS = { ...roundScores, [p.id]: (Number(roundScores[p.id]) || 0) * -1 };
                      recalculate(newS, autoId);
                    }}>+/-</button>
                  )}
                  <input 
                    type="number" inputMode="numeric" pattern="[0-9]*"
                    className="input-score" value={roundScores[p.id]} readOnly={isAuto}
                    onFocus={() => handleFocus(p.id)}
                    onChange={e => {
                      const newS = { ...roundScores, [p.id]: e.target.value };
                      recalculate(newS, autoId);
                    }}
                  />
                </div>
              </div>
              {!isAuto && (
                <div className="q-grid">
                  {quickValues.map(v => (
                    <React.Fragment key={v}>
                      <button className="btn-q neg" onClick={() => {
                        const newS = { ...roundScores, [p.id]: (Number(roundScores[p.id]) || 0) - v };
                        recalculate(newS, autoId);
                      }}>-{v}</button>
                      <button className="btn-q pos" onClick={() => {
                        const newS = { ...roundScores, [p.id]: (Number(roundScores[p.id]) || 0) + v };
                        recalculate(newS, autoId);
                      }}>+{v}</button>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <footer className="footer">
        <button className="btn-save" onClick={saveRound}><Save size={20}/> Lưu ván bài</button>
      </footer>

      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="header" style={{marginBottom:'20px'}}><h3 style={{margin:0}}>Lịch sử bài</h3><X onClick={() => setShowHistory(false)}/></div>
            {history.length === 0 ? <p style={{textAlign:'center', color:'var(--sub)'}}>Chưa có ván nào</p> : (
              <>
                <div className="table-wrapper">
                  <table className="h-table">
                    <thead><tr><th>#</th>{players.map(p => <th key={p.id}>{p.name}</th>)}</tr></thead>
                    <tbody>
                      {history.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).map((row, i) => (
                        <tr key={i}>
                          <td style={{color:'var(--sub)'}}>{row.roundNo}</td>
                          {row.scores.map((s, idx) => (
                            <td key={idx} style={{color: s >= 0 ? 'var(--success)' : 'var(--danger)'}}>{s > 0 ? `+${s}` : s}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pagination">
                  <button className="btn-p" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18}/></button>
                  <span style={{fontSize:'14px', fontWeight:800}}>{currentPage} / {Math.ceil(history.length/itemsPerPage)}</span>
                  <button className="btn-p" disabled={currentPage === Math.ceil(history.length/itemsPerPage)} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18}/></button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;