import { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { fetchApi } from '../lib/api';
import { Link, Navigate } from 'react-router-dom';
import { Plus, Users, LayoutList } from 'lucide-react';

export function Dashboard() {
  const user = useAuthStore(state => state.user);
  
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-m3-on-surface)]">Dashboard</h1>
          <p className="text-[var(--color-m3-on-surface-variant)] mt-2">Welcome back, {user.name}</p>
        </div>
      </div>

      {user.role === 'ADMIN' || user.role === 'ORGANIZER' ? (
        <AdminDashboard />
      ) : user.role === 'JURY' ? (
        <JuryDashboard />
      ) : (
        <TeamDashboard />
      )}
    </div>
  );
}

function AdminDashboard() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  
  useEffect(() => {
    fetchApi('/tournaments').then(setTournaments).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <Link to="/tournaments/new" className="inline-flex items-center px-4 py-2.5 rounded-full bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] hover:opacity-90 transition-opacity font-medium">
          <Plus className="w-5 h-5 mr-2" />
          Create Tournament
        </Link>
      </div>
      
      <div className="bg-[var(--color-m3-surface)] rounded-3xl border border-[var(--color-m3-outline-variant)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-surface-variant)]">
          <h2 className="font-semibold text-lg flex items-center">
            <LayoutList className="w-5 h-5 mr-2" /> Manage Tournaments
          </h2>
        </div>
        <div className="divide-y divide-[var(--color-m3-outline-variant)]">
          {tournaments.length === 0 ? (
            <p className="p-6 text-center text-[var(--color-m3-on-surface-variant)]">No tournaments created yet.</p>
          ) : tournaments.map(t => (
            <div key={t.id} className="p-6 flex flex-col sm:flex-row items-center justify-between hover:bg-[var(--color-m3-bg)] transition-colors">
              <div className="flex-1 w-full mb-4 sm:mb-0">
                <h3 className="font-bold text-lg">{t.title}</h3>
                <p className="text-sm text-[var(--color-m3-on-surface-variant)] line-clamp-1">{t.description}</p>
              </div>
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                 <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                      t.status === 'REGISTRATION' ? 'bg-[#D3E3FD] text-[#041E49]' :
                      t.status === 'RUNNING' ? 'bg-[#C4EED0] text-[#072711]' :
                      t.status === 'FINISHED' ? 'bg-[#E1E2E8] text-[#44474E]' :
                      'bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)]'
                    }`}>
                      {t.status}
                </span>
                <Link to={`/tournaments/${t.id}/admin`} className="px-4 py-2 rounded-full border border-[var(--color-m3-outline)] text-sm font-medium hover:bg-[var(--color-m3-surface-variant)] transition-colors">
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JuryDashboard() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [activeScore, setActiveScore] = useState<any | null>(null);

  // Score Form State
  const [techBackend, setTechBackend] = useState(0);
  const [techDatabase, setTechDatabase] = useState(0);
  const [techFrontend, setTechFrontend] = useState(0);
  const [funcMustHave, setFuncMustHave] = useState(0);
  const [funcBugs, setFuncBugs] = useState(0);
  const [funcUx, setFuncUx] = useState(0);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = () => {
    fetchApi('/jury/assignments').then(setAssignments).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetchApi(`/assignments/${activeScore.id}/score`, {
        method: 'POST',
        body: JSON.stringify({
          tech_backend: Number(techBackend),
          tech_database: Number(techDatabase),
          tech_frontend: Number(techFrontend),
          func_must_have: Number(funcMustHave),
          func_bugs: Number(funcBugs),
          func_ux: Number(funcUx),
          comments
        })
      });
      setActiveScore(null);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openScoreModal = (a: any) => {
    setActiveScore(a);
    setTechBackend(a.score?.tech_backend || 0);
    setTechDatabase(a.score?.tech_database || 0);
    setTechFrontend(a.score?.tech_frontend || 0);
    setFuncMustHave(a.score?.func_must_have || 0);
    setFuncBugs(a.score?.func_bugs || 0);
    setFuncUx(a.score?.func_ux || 0);
    setComments(a.score?.comments || '');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.length === 0 ? (
           <div className="col-span-full p-12 text-center bg-[var(--color-m3-surface)] rounded-3xl border border-[var(--color-m3-outline-variant)]">
              <p className="text-[var(--color-m3-on-surface-variant)]">No assignments for you right now.</p>
           </div>
        ) : assignments.map(a => (
          <div key={a.id} className="bg-[var(--color-m3-surface)] p-6 rounded-3xl border border-[var(--color-m3-outline-variant)] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold">{a.submission.team.team_name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${a.status === 'COMPLETED' ? 'bg-[#C4EED0] text-[#072711]' : 'bg-[#F9DEDC] text-[#410E0B]'}`}>
                {a.status}
              </span>
            </div>
            <p className="text-sm font-medium mb-1">Round: {a.submission.round.title}</p>
            <div className="text-xs text-[var(--color-m3-on-surface-variant)] space-y-1 mb-6">
               <p><a href={a.submission.github_url} target="_blank" rel="noreferrer" className="text-[var(--color-m3-primary)] hover:underline">GitHub Repo</a></p>
               <p><a href={a.submission.video_url} target="_blank" rel="noreferrer" className="text-[var(--color-m3-primary)] hover:underline">Video Demo</a></p>
               {a.submission.live_demo_url && <p><a href={a.submission.live_demo_url} target="_blank" rel="noreferrer" className="text-[var(--color-m3-primary)] hover:underline">Live Demo</a></p>}
            </div>
            {a.status !== 'COMPLETED' ? (
              <button onClick={() => openScoreModal(a)} className="w-full py-2 bg-[var(--color-m3-primary)] text-white rounded-full text-sm font-medium transition-opacity hover:opacity-90">Evaluate</button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-center text-[var(--color-m3-on-surface-variant)] font-medium">Evaluated - {a.score?.total_calculated_score?.toFixed(1)}/100</p>
                <button onClick={() => openScoreModal(a)} className="w-full py-2 border border-[var(--color-m3-outline-variant)] text-[var(--color-m3-on-surface)] rounded-full text-sm font-medium transition-colors hover:bg-[var(--color-m3-surface-variant)]">Edit Score</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {activeScore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-m3-surface)] w-full max-w-2xl rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[var(--color-m3-outline-variant)] flex justify-between items-center bg-[var(--color-m3-surface-variant)]">
              <div>
                <h2 className="text-xl font-bold">Evaluate Submission</h2>
                <p className="text-xs text-[var(--color-m3-on-surface-variant)]">Team: {activeScore.submission.team.team_name}</p>
              </div>
              <button title="Close" onClick={() => setActiveScore(null)} className="text-[var(--color-m3-on-surface-variant)] hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto w-full">
              {error && <div className="mb-4 p-3 bg-[var(--color-m3-error-container)] text-[var(--color-m3-on-error-container)] rounded-xl text-sm">{error}</div>}
              
              <form id="scoreForm" onSubmit={handleScoreSubmit} className="space-y-6">
                <div>
                   <h3 className="font-semibold mb-3">Technical Quality (0-100)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                       <label className="block text-xs font-medium mb-1">Backend Code</label>
                       <input type="number" min="0" max="100" required value={techBackend} onChange={e => setTechBackend(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium mb-1">Database Arch.</label>
                       <input type="number" min="0" max="100" required value={techDatabase} onChange={e => setTechDatabase(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium mb-1">Frontend / Structure</label>
                       <input type="number" min="0" max="100" required value={techFrontend} onChange={e => setTechFrontend(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                     </div>
                   </div>
                </div>

                <div>
                   <h3 className="font-semibold mb-3">Functional Delivery (0-100)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                       <label className="block text-xs font-medium mb-1">Must-Have</label>
                       <input type="number" min="0" max="100" required value={funcMustHave} onChange={e => setFuncMustHave(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium mb-1">Stability / Bugs</label>
                       <input type="number" min="0" max="100" required value={funcBugs} onChange={e => setFuncBugs(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium mb-1">UX / Usability</label>
                       <input type="number" min="0" max="100" required value={funcUx} onChange={e => setFuncUx(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                     </div>
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Jury Comments</label>
                  <textarea required value={comments} onChange={e => setComments(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" placeholder="Leave constructive feedback..." />
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-[var(--color-m3-outline-variant)] flex justify-end">
              <button type="button" onClick={() => setActiveScore(null)} className="px-5 py-2.5 rounded-full font-medium hover:bg-[var(--color-m3-surface-variant)] mr-2 transition-colors">Cancel</button>
              <button form="scoreForm" type="submit" disabled={loading} className="px-6 py-2.5 bg-[var(--color-m3-primary)] text-white font-bold rounded-full disabled:opacity-50 transition-opacity">
                {loading ? 'Submitting...' : 'Submit Evaluation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamDashboard() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);

  useEffect(() => {
    fetchApi('/tournaments').then((data) => {
      setTournaments(data);
      // For a real app, there'd be an endpoint /api/teams/me
      // Since it's missing, let's fetch all tournaments and teams just for visualization or redirect to their active ones.
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Discover Tournaments</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tournaments.map(t => (
          <div key={t.id} className="bg-[var(--color-m3-surface)] p-6 rounded-3xl border border-[var(--color-m3-outline-variant)] shadow-sm hover:m3-elevation-2 transition-all">
            <h3 className="font-bold text-lg mb-2">{t.title}</h3>
             <span className={`text-xs px-2.5 py-1 rounded-full font-medium mb-4 inline-block ${
                  t.status === 'REGISTRATION' ? 'bg-[#D3E3FD] text-[#041E49]' : 'bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)]'
                }`}>
                  {t.status}
            </span>
            <p className="text-sm text-[var(--color-m3-on-surface-variant)] line-clamp-2 mb-4">{t.description}</p>
            <Link to={`/tournaments/${t.id}`} className="text-[var(--color-m3-primary)] text-sm font-semibold hover:underline">Go to Tournament &rarr;</Link>
            
            {t.status === 'RUNNING' && t.rounds && t.rounds.length > 0 && (
               <div className="mt-6 pt-4 border-t border-[var(--color-m3-outline-variant)] space-y-3">
                 <h4 className="font-semibold text-sm">Active Tasks</h4>
                 {t.rounds.map((r: any) => (
                   <div key={r.id} className="flex justify-between items-center bg-[var(--color-m3-surface-variant)] p-3 rounded-xl border border-[var(--color-m3-outline-variant)]">
                     <span className="text-sm font-medium">{r.title}</span>
                     <Link to={`/tournaments/${t.id}`} className="px-3 py-1.5 bg-[var(--color-m3-primary)] text-white text-xs font-bold rounded-full hover:opacity-90">View Task</Link>
                   </div>
                 ))}
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
