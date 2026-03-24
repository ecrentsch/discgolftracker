import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users';
import { Avatar } from '../ui/Avatar';
import type { UserPublic } from '../../../../shared/src/types';

export function MobileHeader() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<UserPublic[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        setSearchOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  if (!isAuthenticated) return null;

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-stone-200 h-14">
      <div className="flex items-center justify-between h-full px-4">
        {searchOpen ? (
          /* Expanded search mode */
          <div ref={searchRef} className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-stone-50"
            />
            {showResults && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-stone-100 py-1 z-50">
                {results.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      navigate(`/profile/${u.username}`);
                      setSearch('');
                      setShowResults(false);
                      setSearchOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-stone-50 text-left"
                  >
                    <Avatar profilePicture={u.profilePicture} username={u.username} size="xs" />
                    <span className="text-sm text-stone-800">{u.username}</span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => { setSearchOpen(false); setSearch(''); setShowResults(false); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          /* Default header mode */
          <>
            <Link to="/dashboard" className="flex items-center gap-1.5">
              <span className="text-xl">🥏</span>
              <span className="text-lg font-extrabold text-forest-700 tracking-tight">RoundTracker</span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={openSearch}
                aria-label="Search players"
                className="p-1.5 text-stone-500 hover:text-stone-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>

              <Link to={`/profile/${user?.username}`}>
                <Avatar profilePicture={user?.profilePicture} username={user?.username || ''} size="sm" />
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
