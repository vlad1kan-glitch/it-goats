import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { useAuthStore } from '../store';
import { Settings, Users, LayoutList, Trophy, Plus, X } from 'lucide-react';

export function TournamentAdmin() {
  const { id } = useParams();
  const user = useAuthStore(state => state.user);
  const [tournament, setTournament] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showRoundModal, setShowRoundModal] = useState(false);
  
  // New Round Form State
  const [roundTitle, setRoundTitle] = useState('');
  const [roundDesc, setRoundDesc] = useState('');
  const [roundTechReq, setRoundTechReq] = useState('');
  const [roundStart, setRoundStart] = useState('');
  const [roundEnd, setRoundEnd] = useState('');

  const loadData = () => {
    fetchApi(`/tournaments/${id}`).then(setTournament).catch(console.error);
  };

  useEffect(() => {
    if (id) {
       loadData();
    }
  }, [id]);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'ORGANIZER')) {
    return <Navigate to="/" replace />;
  }

  if (!tournament) return <div className="p-12 text-center text-[var(--color-m3-on-surface-variant)]">Loading admin panel...</div>;

  const handleAssignJury = async (roundId: string) => {
    try {
      const res = await fetchApi(`/rounds/${roundId}/assign-jury`, {
        method: 'POST',
        body: JSON.stringify({ K: 2 }) // 2 jurors per project
      });
      alert(`Success! ${res.count} assignments created.`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const loadLeaderboard = async (roundId: string) => {
    try {
       const lb = await fetchApi(`/rounds/${roundId}/leaderboard`);
       setLeaderboard(lb);
    } catch (e: any) {
       console.error(e);
    }
  };

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi(`/tournaments/${id}/rounds`, {
        method: 'POST',
        body: JSON.stringify({
          title: roundTitle,
          description: roundDesc,
          tech_requirements: roundTechReq,
          must_have_criteria: ["Functional logic", "Clean code", "Working demo"], // Simplified for form
          start_time: roundStart,
          end_time: roundEnd
        })
      });
      setShowRoundModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-[var(--color-m3-surface)] rounded-3xl p-6 md:p-8 m3-elevation-1 border border-[var(--color-m3-outline-variant)]">
        <h1 className="text-3xl font-bold mb-2">{tournament.title}</h1>
        <div className="flex items-center space-x-2 text-sm text-[var(--color-m3-on-surface-variant)]">
          <span>Tournament Management</span>
          <span>•</span>
          <span className="font-semibold px-2 py-0.5 rounded-full bg-[var(--color-m3-secondary-container)] text-[var(--color-m3-on-surface)]">{tournament.status}</span>
        </div>
      </div>

      <div className="flex bg-[var(--color-m3-surface)] rounded-full p-2 border border-[var(--color-m3-outline-variant)] overflow-x-auto gap-2">
        <button onClick={() => setActiveTab('overview')} className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-[var(--color-m3-primary)] text-white' : 'hover:bg-[var(--color-m3-surface-variant)]'}`}>
          Overview
        </button>
        <button onClick={() => setActiveTab('teams')} className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${activeTab === 'teams' ? 'bg-[var(--color-m3-primary)] text-white' : 'hover:bg-[var(--color-m3-surface-variant)]'}`}>
          <Users className="w-4 h-4 mr-2" /> Teams
        </button>
        <button onClick={() => setActiveTab('rounds')} className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${activeTab === 'rounds' ? 'bg-[var(--color-m3-primary)] text-white' : 'hover:bg-[var(--color-m3-surface-variant)]'}`}>
          <LayoutList className="w-4 h-4 mr-2" /> Rounds / Tasks
        </button>
        <button onClick={() => setActiveTab('leaderboard')} className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${activeTab === 'leaderboard' ? 'bg-[var(--color-m3-primary)] text-white' : 'hover:bg-[var(--color-m3-surface-variant)]'}`}>
          <Trophy className="w-4 h-4 mr-2" /> Leaderboard
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${activeTab === 'settings' ? 'bg-[var(--color-m3-primary)] text-white' : 'hover:bg-[var(--color-m3-surface-variant)]'}`}>
          <Settings className="w-4 h-4 mr-2" /> Settings
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-[var(--color-m3-surface)] p-6 rounded-3xl border border-[var(--color-m3-outline-variant)]">
              <h3 className="font-bold mb-4">Quick Stats</h3>
              <p>Teams Registered: {tournament.teams?.length || 0}</p>
              <p>Total Rounds: {tournament.rounds?.length || 0}</p>
           </div>
        </div>
      )}

      {activeTab === 'rounds' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setShowRoundModal(true)} className="flex items-center px-5 py-2.5 bg-[var(--color-m3-primary)] text-white font-medium rounded-full hover:opacity-90 transition-opacity text-sm shadow-sm">
               <Plus className="w-4 h-4 mr-2" /> Create Round
            </button>
          </div>

          {tournament.rounds?.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {tournament.rounds.map((r: any) => (
                <div key={r.id} className="bg-[var(--color-m3-surface)] p-6 rounded-3xl border border-[var(--color-m3-outline-variant)] flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-lg">{r.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-m3-surface-variant)]">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-m3-on-surface-variant)] max-w-xl">{r.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    {r.status === 'SUBMISSION_CLOSED' && user.role === 'ADMIN' && (
                      <button onClick={() => handleAssignJury(r.id)} className="w-full md:w-auto py-2 px-4 bg-[var(--color-m3-primary)] text-white font-medium rounded-full text-sm">
                        Auto Assign Jury
                      </button>
                    )}
                    {(r.status === 'DRAFT' || r.status === 'ACTIVE') && (
                       <button onClick={async () => {
                         await fetchApi(`/rounds/${r.id}/status`, { method: 'PUT', body: JSON.stringify({ status: r.status === 'DRAFT' ? 'ACTIVE' : 'SUBMISSION_CLOSED' }) });
                         loadData();
                       }} className="w-full md:w-auto py-2 px-4 border border-[var(--color-m3-outline-variant)] rounded-full text-sm font-medium hover:bg-[var(--color-m3-surface-variant)]">
                         {r.status === 'DRAFT' ? 'Launch Round' : 'Close Submissions'}
                       </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[var(--color-m3-surface)] rounded-3xl border border-[var(--color-m3-outline-variant)] text-[var(--color-m3-on-surface-variant)]">
               No rounds created for this tournament.
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="flex border border-[var(--color-m3-outline-variant)] rounded-full p-2 bg-[var(--color-m3-surface)] overflow-x-auto gap-2">
             {tournament.rounds?.map((r: any) => (
                <button key={r.id} onClick={() => loadLeaderboard(r.id)} className="flex-1 py-2 px-4 whitespace-nowrap text-sm font-medium hover:bg-[var(--color-m3-surface-variant)] rounded-full transition-colors border border-transparent hover:border-[var(--color-m3-outline-variant)]">
                  Load {r.title}
                </button>
             ))}
          </div>
          
          <div className="bg-[var(--color-m3-surface)] rounded-3xl border border-[var(--color-m3-outline-variant)] overflow-x-auto w-full">
             {leaderboard.length === 0 ? (
               <div className="p-8 text-center text-[var(--color-m3-on-surface-variant)]">Select a round or wait for jury evaluations.</div>
             ) : (
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)]">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Rank</th>
                      <th className="px-6 py-4 font-semibold">Team</th>
                      <th className="px-6 py-4 font-semibold">Final Score (Avg)</th>
                      <th className="px-6 py-4 font-semibold">Evaluations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-m3-outline-variant)]">
                     {leaderboard.map((row: any, idx: number) => (
                       <tr key={row.team.id} className="hover:bg-[var(--color-m3-bg)] transition-colors">
                         <td className="px-6 py-4 font-bold text-[var(--color-m3-primary)]">#{idx + 1}</td>
                         <td className="px-6 py-4 font-semibold">{row.team.team_name}</td>
                         <td className="px-6 py-4 text-lg font-mono tracking-tight">{row.totalAverage.toFixed(2)}</td>
                         <td className="px-6 py-4 text-[var(--color-m3-on-surface-variant)]">{row.scores.length} Jury votes</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
             )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
         <div className="bg-[var(--color-m3-surface)] p-6 rounded-3xl border border-[var(--color-m3-outline-variant)]">
           <h3 className="font-bold mb-4">Change Status</h3>
           <div className="flex gap-2 flex-wrap">
             {['DRAFT', 'REGISTRATION', 'RUNNING', 'FINISHED'].map(s => (
               <button 
                 key={s}
                 onClick={async () => {
                   await fetchApi(`/tournaments/${tournament.id}/status`, {
                     method: 'PUT',
                     body: JSON.stringify({ status: s })
                   });
                   loadData();
                 }}
                 className={`px-4 py-2 border rounded-xl text-sm font-semibold transition-colors ${tournament.status === s ? 'bg-[var(--color-m3-primary-container)] border-[var(--color-m3-primary)] text-[var(--color-m3-on-primary-container)]' : 'hover:bg-[var(--color-m3-surface-variant)]'}`}
               >
                 {s}
               </button>
             ))}
           </div>
         </div>
      )}

      {showRoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-m3-surface)] w-full max-w-2xl rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[var(--color-m3-outline-variant)] flex justify-between items-center">
              <h2 className="text-xl font-bold">Create Round / Task</h2>
              <button title="Close" onClick={() => setShowRoundModal(false)} className="p-2 hover:bg-[var(--color-m3-surface-variant)] rounded-full text-[var(--color-m3-on-surface-variant)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto w-full">
              <form id="roundForm" onSubmit={handleCreateRound} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Round Title</label>
                  <input required type="text" value={roundTitle} onChange={e => setRoundTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Description / Goal</label>
                  <textarea required rows={3} value={roundDesc} onChange={e => setRoundDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Technical Requirements</label>
                  <textarea required rows={2} value={roundTechReq} onChange={e => setRoundTechReq(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Start Time</label>
                    <input required type="datetime-local" value={roundStart} onChange={e => setRoundStart(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">End Time (Deadline)</label>
                    <input required type="datetime-local" value={roundEnd} onChange={e => setRoundEnd(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-surface-variant)] flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowRoundModal(false)} 
                className="px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[var(--color-m3-outline-variant)] transition-colors mr-2"
              >
                Cancel
              </button>
              <button 
                form="roundForm"
                type="submit" 
                className="px-6 py-2.5 bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
              >
                Create Round
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
