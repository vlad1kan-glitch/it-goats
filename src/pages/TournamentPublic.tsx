import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { useAuthStore } from '../store';
import { format } from 'date-fns';
import { Users, Info, Award, X, Plus, Clock, Target, Rocket } from 'lucide-react';

export function TournamentPublic() {
  const { id } = useParams();
  const user = useAuthStore(state => state.user);
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState<string | null>(null);

  // Form State
  const [teamName, setTeamName] = useState('');
  const [citySchool, setCitySchool] = useState('');
  const [tgDiscord, setTgDiscord] = useState('');
  const [members, setMembers] = useState([{ full_name: user?.name || '', email: user?.email || '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Submission Form State
  const [selectedTeam, setSelectedTeam] = useState('');
  const [gitUrl, setGitUrl] = useState('');
  const [vidUrl, setVidUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, user]);

  const loadData = () => {
     fetchApi(`/tournaments/${id}`).then(setTournament).catch(console.error);
     fetchApi(`/tournaments/${id}/teams`).then(setTeams).catch(console.error);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (members.length < 2) {
        throw new Error("Team must have at least 2 members including the captain.");
      }
      await fetchApi(`/tournaments/${id}/register-team`, {
        method: 'POST',
        body: JSON.stringify({
          team_name: teamName,
          city_school: citySchool,
          telegram_discord: tgDiscord,
          members
        })
      });
      setShowRegModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!selectedTeam) {
        throw new Error("You must select your team to submit.");
      }
      await fetchApi(`/rounds/${showSubmitModal}/submissions`, {
        method: 'POST',
        body: JSON.stringify({
           team_id: selectedTeam,
           github_url: gitUrl,
           video_url: vidUrl,
           live_demo_url: demoUrl,
           summary
        })
      });
      setShowSubmitModal(null);
      alert('Submission successful!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Find teams the current user is part of (if user is team role)
  const myEnrolledTeams = user?.role === 'TEAM' ? teams.filter(t => t.members?.some((m: any) => m.email === user.email)) : [];

  useEffect(() => {
    if (showSubmitModal && myEnrolledTeams.length === 1 && selectedTeam === '') {
       setSelectedTeam(myEnrolledTeams[0].id);
    }
  }, [showSubmitModal, myEnrolledTeams, selectedTeam]);

  if (!tournament) {
    return <div className="text-center p-12">Loading tournament...</div>;
  }

  const isRegistrationOpen = tournament.status === 'REGISTRATION';
  const isRunning = tournament.status === 'RUNNING';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="bg-[var(--color-m3-primary-container)] text-[var(--color-m3-on-primary-container)] rounded-[32px] p-8 md:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-[var(--color-m3-surface)] text-[var(--color-m3-on-surface)] rounded-full text-xs font-bold tracking-wider mb-4">
            {tournament.status}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{tournament.title}</h1>
          <p className="text-lg opacity-90 mb-8 font-light">{tournament.description}</p>
          
          {isRegistrationOpen && user?.role === 'TEAM' && myEnrolledTeams.length === 0 && (
             <button onClick={() => setShowRegModal(true)} className="bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] px-6 py-3 rounded-full font-semibold shadow-sm hover:opacity-90 transition-opacity">
               Register Team Now
             </button>
          )}
          {isRegistrationOpen && !user && (
            <Link to="/register" className="inline-block bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] px-6 py-3 rounded-full font-semibold shadow-sm hover:opacity-90 transition-opacity">
               Setup Account to Register
            </Link>
          )}
        </div>
        <Award className="absolute -right-8 -bottom-8 w-64 h-64 opacity-10 text-[var(--color-m3-primary)] rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
        
          {tournament.rounds && tournament.rounds.length > 0 && (
             <section className="bg-[var(--color-m3-surface)] rounded-3xl p-8 border border-[var(--color-m3-outline-variant)]">
               <h2 className="text-2xl font-bold mb-6 flex items-center"><Target className="mr-2" /> Rounds & Tasks</h2>
               <div className="space-y-6">
                 {tournament.rounds.map((r: any) => (
                    <div key={r.id} className="p-6 rounded-2xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] relative overflow-hidden">
                       <div className="flex justify-between items-start mb-4">
                         <h3 className="font-bold text-xl">{r.title}</h3>
                         <span className="px-2 py-1 bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] text-xs rounded-full font-bold uppercase">{r.status}</span>
                       </div>
                       <p className="text-[var(--color-m3-on-surface-variant)] text-sm mb-4">{r.description}</p>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                         <div className="p-3 bg-[var(--color-m3-surface)] rounded-xl border border-[var(--color-m3-outline-variant)] text-sm">
                            <span className="block font-semibold mb-1 text-[var(--color-m3-primary)]">Tech Stack</span>
                            {r.tech_requirements}
                         </div>
                         <div className="p-3 bg-[var(--color-m3-surface)] rounded-xl border border-[var(--color-m3-outline-variant)] text-sm">
                            <span className="block font-semibold mb-1 text-[var(--color-m3-primary)]">Must Haves</span>
                            {(() => {
                               try { return JSON.parse(r.must_have_criteria).join(", "); }
                               catch { return r.must_have_criteria; }
                            })()}
                         </div>
                       </div>
                       
                       <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-m3-outline-variant)]">
                         <div className="flex items-center text-xs font-semibold text-[var(--color-m3-on-surface-variant)]">
                           <Clock className="w-4 h-4 mr-1" />
                           {format(new Date(r.end_time), 'PPp')}
                         </div>
                         
                         {r.status === 'ACTIVE' && user?.role === 'TEAM' && myEnrolledTeams.length > 0 && (
                            <button onClick={() => setShowSubmitModal(r.id)} className="flex items-center px-4 py-2 bg-[var(--color-m3-primary)] text-white text-sm font-bold rounded-full hover:opacity-90">
                              <Rocket className="w-4 h-4 mr-1.5" /> Submit Work
                            </button>
                         )}
                       </div>
                    </div>
                 ))}
               </div>
             </section>
          )}

          <section className="bg-[var(--color-m3-surface)] rounded-3xl p-8 border border-[var(--color-m3-outline-variant)]">
            <h2 className="text-2xl font-bold mb-4 flex items-center"><Info className="mr-2" /> Rules & Details</h2>
            <div className="prose prose-sm max-w-none text-[var(--color-m3-on-surface-variant)] leading-relaxed whitespace-pre-wrap">
              {tournament.rules || "No specific rules provided."}
            </div>
          </section>

          <section className="bg-[var(--color-m3-surface)] rounded-3xl p-8 border border-[var(--color-m3-outline-variant)]">
            <h2 className="text-2xl font-bold mb-6 flex items-center"><Users className="mr-2" /> Participating Teams ({teams.length})</h2>
            {teams.length === 0 ? (
              <p className="text-[var(--color-m3-on-surface-variant)] italic">No teams registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.map(t => (
                  <div key={t.id} className="p-4 border border-[var(--color-m3-outline-variant)] rounded-2xl flex items-center space-x-3 bg-[var(--color-m3-bg)]">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-m3-secondary-container)] text-[var(--color-m3-on-surface)] flex items-center justify-center font-bold">
                      {t.team_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{t.team_name}</h4>
                      <p className="text-xs text-[var(--color-m3-on-surface-variant)]">{t.city_school || 'Unknown Location'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--color-m3-surface)] rounded-3xl p-6 border border-[var(--color-m3-outline-variant)]">
             <h3 className="font-bold text-lg mb-4">Timeline</h3>
             <ul className="space-y-4 text-sm">
                <li className="flex flex-col">
                  <span className="text-[var(--color-m3-on-surface-variant)] font-medium text-xs uppercase tracking-wider mb-1">Registration Opens</span>
                  <span className="font-semibold">{format(new Date(tournament.reg_start), 'PPP')}</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-[var(--color-m3-on-surface-variant)] font-medium text-xs uppercase tracking-wider mb-1">Registration Closes</span>
                  <span className="font-semibold">{format(new Date(tournament.reg_end), 'PPP')}</span>
                </li>
                {tournament.start_date && (
                   <li className="flex flex-col">
                     <span className="text-[var(--color-m3-on-surface-variant)] font-medium text-xs uppercase tracking-wider mb-1">Event Starts</span>
                     <span className="font-semibold text-[var(--color-m3-primary)]">{format(new Date(tournament.start_date), 'PPP')}</span>
                   </li>
                )}
             </ul>
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-m3-surface)] w-full max-w-lg rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="px-6 py-4 border-b border-[var(--color-m3-outline-variant)] flex justify-between items-center">
               <h2 className="text-xl font-bold">Submit Your Work</h2>
               <button title="Close" onClick={() => setShowSubmitModal(null)} className="p-2 hover:bg-[var(--color-m3-surface-variant)] rounded-full text-[var(--color-m3-on-surface-variant)]">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="p-6 overflow-y-auto w-full">
                {error && <div className="mb-4 p-3 bg-[var(--color-m3-error-container)] text-[var(--color-m3-on-error-container)] rounded-xl text-sm">{error}</div>}
                
                <form id="submitForm" onSubmit={handleSubmitWork} className="space-y-5">
                  {myEnrolledTeams.length > 1 ? (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Select Team</label>
                      <select required value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]">
                         <option value="">Select a team</option>
                         {myEnrolledTeams.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                      </select>
                    </div>
                  ) : (
                    // Automatically select if only 1 team
                    <>
                      <div className="p-4 bg-[var(--color-m3-bg)] rounded-xl border border-[var(--color-m3-outline-variant)] mb-4">
                        <span className="text-xs text-[var(--color-m3-on-surface-variant)]">Submitting as team: </span>
                        <strong className="block text-sm">{myEnrolledTeams[0]?.team_name}</strong>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1.5">GitHub URL</label>
                    <input required type="url" placeholder="https://github.com/..." value={gitUrl} onChange={e => setGitUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Video Demo URL</label>
                    <input required type="url" placeholder="https://youtube.com/... or Google Drive" value={vidUrl} onChange={e => setVidUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Live Demo URL (Optional)</label>
                    <input type="url" placeholder="https://myapp.com" value={demoUrl} onChange={e => setDemoUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Summary / Setup Instructions</label>
                    <textarea rows={3} placeholder="Briefly describe how to run or test your project..." value={summary} onChange={e => setSummary(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                  </div>
                </form>
             </div>
             
             <div className="p-4 border-t border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-surface-variant)] flex justify-end">
               <button type="button" onClick={() => setShowSubmitModal(null)} className="px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[var(--color-m3-outline-variant)] transition-colors mr-2">Cancel</button>
               <button form="submitForm" type="submit" disabled={loading} className="px-6 py-2.5 bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-70">
                 {loading ? 'Submitting...' : 'Submit Final'}
               </button>
             </div>
          </div>
        </div>
      )}

      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-m3-surface)] w-full max-w-2xl rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[var(--color-m3-outline-variant)] flex justify-between items-center">
              <h2 className="text-xl font-bold">Register Team</h2>
              <button title="Close" onClick={() => setShowRegModal(false)} className="p-2 hover:bg-[var(--color-m3-surface-variant)] rounded-full text-[var(--color-m3-on-surface-variant)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto w-full">
              {error && <div className="mb-4 p-3 bg-[var(--color-m3-error-container)] text-[var(--color-m3-on-error-container)] rounded-xl text-sm">{error}</div>}
              
              <form id="regForm" onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Team Name</label>
                    <input required type="text" value={teamName} onChange={e => setTeamName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">City / School / Hub</label>
                    <input type="text" value={citySchool} onChange={e => setCitySchool(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Telegram / Discord (Contact link)</label>
                  <input type="text" value={tgDiscord} onChange={e => setTgDiscord(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                </div>

                <div className="bg-[var(--color-m3-bg)] p-4 rounded-2xl border border-[var(--color-m3-outline-variant)]">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="font-semibold">Team Members</h3>
                     <button type="button" onClick={() => setMembers([...members, { full_name: '', email: '' }])} className="text-sm px-3 py-1 bg-[var(--color-m3-surface)] rounded-full border border-[var(--color-m3-outline-variant)] flex items-center hover:bg-[var(--color-m3-surface-variant)]">
                        <Plus className="w-4 h-4 mr-1" /> Add Member
                     </button>
                   </div>
                   
                   <div className="space-y-3">
                     {members.map((m, i) => (
                       <div key={i} className="flex space-x-2 items-start">
                         <div className="flex-1">
                           <input required type="text" placeholder="Full Name" value={m.full_name} onChange={e => { const nm = [...members]; nm[i].full_name = e.target.value; setMembers(nm); }} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] text-sm mb-2" />
                           <input required type="email" placeholder="Email Address" value={m.email} onChange={e => { const nm = [...members]; nm[i].email = e.target.value; setMembers(nm); }} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] text-sm" />
                         </div>
                         {i > 0 && (
                           <button type="button" title="Remove" onClick={() => setMembers(members.filter((_, idx) => idx !== i))} className="p-2 text-[var(--color-m3-error)] hover:bg-[var(--color-m3-error-container)] rounded-full mt-1">
                             <X className="w-4 h-4" />
                           </button>
                         )}
                       </div>
                     ))}
                   </div>
                   <p className="mt-4 text-xs text-[var(--color-m3-on-surface-variant)]">Minimum 2 members required. Team Captain is member #1.</p>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-surface-variant)] flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowRegModal(false)} 
                className="px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[var(--color-m3-outline-variant)] transition-colors mr-2"
              >
                Cancel
              </button>
              <button 
                form="regForm"
                type="submit" 
                disabled={loading}
                className="px-6 py-2.5 bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {loading ? 'Submitting...' : 'Register Team'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
