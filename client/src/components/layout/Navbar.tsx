import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { useState, useRef, useEffect } from 'react';
import { usersApi } from '../../api/users';
import type { UserPublic } from '../../../../shared/src/types';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<UserPublic[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.trim().length >= 2) {
        const res = await usersApi.search(search.trim()).catch(() => []);
        setResults(res);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-forest-700' : 'text-stone-600 hover:text-stone-900'}`;

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-white border-b border-stone-200 h-16">
      <div className="max-w-7xl mx-auto px-4 w-full flex items-center gap-6">
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 mr-4">
          <span className="text-2xl">🥏</span>
          <span className="text-xl font-extrabold text-forest-700 tracking-tight">RoundTracker</span>
        </Link>

        {isAuthenticated && (
          <>
            <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/log-round" className={navLinkClass}>Log Round</NavLink>
            <NavLink to="/my-bag" className={navLinkClass}>My Bag</NavLink>
            <NavLink to="/courses" className={navLinkClass}>Courses</NavLink>

            {/* Search */}
            <div ref={searchRef} className="relative ml-auto">
              <input
                type="text"
                placeholder="Search players..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-48 rounded-lg border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-stone-50"
              />
              {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-stone-100 py-1 z-50">
                  {results.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { navigate(`/profile/${u.username}`); setSearch(''); setShowResults(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-50 text-left"
                    >
                      <Avatar profilePicture={u.profilePicture} username={u.username} size="xs" />
                      <span className="text-sm text-stone-800">{u.username}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile menu */}
            <NavLink to={`/profile/${user?.username}`} className="flex items-center gap-2 ml-2">
              <Avatar profilePicture={user?.profilePicture} username={user?.username || ''} size="sm" />
              <span className="text-sm font-medium text-stone-700">{user?.username}</span>
            </NavLink>

            <button
              onClick={async () => { await logout(); navigate('/login'); }}
              className="text-sm text-stone-500 hover:text-stone-700 ml-1"
            >
              Sign out
            </button>
          </>
        )}

        {!isAuthenticated && (
          <div className="ml-auto flex gap-3">
            <Link to="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900">Sign in</Link>
            <Link to="/signup" className="text-sm font-medium bg-forest-600 text-white px-4 py-1.5 rounded-lg hover:bg-forest-700">Sign up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
