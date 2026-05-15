import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { fetchApi } from '../lib/api';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TEAM');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { user, token } = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role })
      });
      login(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-[var(--color-m3-surface)] p-8 rounded-[28px] border border-[var(--color-m3-outline-variant)] m3-elevation-1 animate-in fade-in slide-in-from-bottom-4">
      <h1 className="text-3xl font-bold mb-2 text-[var(--color-m3-on-surface)]">Create account</h1>
      <p className="text-[var(--color-m3-on-surface-variant)] mb-8">Join the platform to participate or manage</p>
      
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--color-m3-error-container)] text-[var(--color-m3-on-error-container)] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-[var(--color-m3-on-surface)]">Full Name</label>
          <input 
            type="text" 
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-m3-primary)] focus:border-transparent transition-all"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-[var(--color-m3-on-surface)]">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-m3-primary)] focus:border-transparent transition-all"
            placeholder="name@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-[var(--color-m3-on-surface)]">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-m3-primary)] focus:border-transparent transition-all"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-[var(--color-m3-on-surface)]">Role</label>
          <select 
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-m3-primary)] focus:border-transparent transition-all"
          >
            <option value="TEAM">Participant (Team)</option>
            <option value="JURY">Jury Member</option>
            <option value="ORGANIZER">Organizer</option>
            <option value="ADMIN">System Admin</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 mt-4 bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      
      <p className="mt-8 text-center text-sm text-[var(--color-m3-on-surface-variant)]">
        Already have an account? <Link to="/login" className="text-[var(--color-m3-primary)] font-semibold hover:underline">Log in</Link>
      </p>
    </div>
  );
}
