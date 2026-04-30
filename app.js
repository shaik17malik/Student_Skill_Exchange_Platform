const { useState, useEffect, useRef } = React;
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.origin.includes('127.0.0.1')) 
    ? 'http://127.0.0.1:8000/api' 
    : '/api';

// ─── UTILITIES ───────────────────────────────────────────────────────────────

const StarRating = ({ rating, onRate }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
                <span key={s}
                    className={`text-xl cursor-pointer transition-all ${(hovered||rating)>=s?'text-amber-400 scale-110':'text-white/20'}`}
                    onMouseEnter={()=>onRate&&setHovered(s)}
                    onMouseLeave={()=>onRate&&setHovered(0)}
                    onClick={()=>onRate&&onRate(s)}>
                    {'\u2605'}
                </span>
            ))}
        </div>
    );
};

const SkillBadge = ({ label, color='indigo' }) => (
    <span className={`badge-${color} px-3 py-1 rounded-full text-xs font-semibold`}>{label}</span>
);

const GlassCard = ({ children, className='' }) => (
    <div className={`glass rounded-2xl p-5 animate-fadeIn ${className}`}>{children}</div>
);

const PrimaryBtn = ({ onClick, children, className='', type='button' }) => (
    <button type={type} onClick={onClick}
        className={`btn-primary px-6 py-2.5 rounded-xl font-semibold text-white text-sm ${className}`}>
        {children}
    </button>
);

const GhostBtn = ({ onClick, children, className='' }) => (
    <button onClick={onClick}
        className={`px-4 py-2 rounded-xl font-medium text-sm text-white/70 border border-white/15 hover:bg-white/10 hover:text-white transition-all ${className}`}>
        {children}
    </button>
);

const Input = ({ type='text', placeholder, value, onChange, className='' }) => (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        className={`inp rounded-xl px-4 py-2.5 w-full text-sm ${className}`} />
);

// ─── APP ROOT ────────────────────────────────────────────────────────────────

const App = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [currentPage, setCurrentPage] = useState(user ? 'dashboard' : 'login');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type='success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentPage('dashboard');
        showToast('Welcome back! \u{1F44B}');
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setCurrentPage('login');
    };

    const navigate = (page) => setCurrentPage(page);

    return (
        <div className="min-h-screen flex flex-col">
            {user && <Navbar user={user} navigate={navigate} logout={handleLogout} currentPage={currentPage} />}
            <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
                {!user ? (
                    <LoginSignup onLogin={handleLogin} />
                ) : (
                    <>
                        {currentPage==='dashboard'   && <Dashboard user={user} navigate={navigate} showToast={showToast} />}
                        {currentPage==='profile'     && <ProfilePage user={user} showToast={showToast} />}
                        {currentPage==='search'      && <SearchPage user={user} showToast={showToast} navigate={navigate} />}
                        {currentPage==='matches'     && <MatchPage user={user} showToast={showToast} navigate={navigate} />}
                        {currentPage==='chat'        && <Chat user={user} showToast={showToast} />}
                        {currentPage==='booking'     && <SessionBooking user={user} showToast={showToast} />}
                        {currentPage==='ai_chat'     && <AIChat />}
                        {currentPage==='leaderboard' && <Leaderboard />}
                    </>
                )}
            </main>
            {toast && (
                <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-2xl shadow-2xl z-50 font-semibold text-white animate-slideUp glass-dark border ${toast.type==='error'?'border-red-400/40 text-red-300':'border-indigo-400/30'}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

// ─── NAVBAR ──────────────────────────────────────────────────────────────────

const Navbar = ({ user, navigate, logout, currentPage }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const links = [
        { id:'dashboard',   label:'Home',        icon:'\u{1F3E0}' },
        { id:'profile',     label:'Profile',     icon:'\u{1F464}' },
        { id:'search',      label:'Search',      icon:'\u{1F50D}' },
        { id:'matches',     label:'Matches',     icon:'\u{1F91D}' },
        { id:'chat',        label:'Chat',        icon:'\u{1F4AC}' },
        { id:'booking',     label:'Sessions',    icon:'\u{1F4C5}' },
        { id:'ai_chat',     label:'AI Help',     icon:'\u{1F916}' },
        { id:'leaderboard', label:'Ranks',       icon:'\u{1F3C6}' },
    ];
    return (
        <nav className="glass-dark sticky top-0 z-40 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-14">
                <div className="grad-text text-xl font-extrabold tracking-tight cursor-pointer select-none" onClick={()=>navigate('dashboard')}>
                    {'\u26A1'} SkillExchange
                </div>
                <div className="hidden md:flex gap-1 items-center">
                    {links.map(l => (
                        <button key={l.id} onClick={()=>navigate(l.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${currentPage===l.id?'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40':'text-white/60 hover:text-white hover:bg-white/10'}`}>
                            {l.icon} {l.label}
                        </button>
                    ))}
                    <button onClick={logout}
                        className="ml-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/50 border border-white/15 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/30 transition-all">
                        Logout
                    </button>
                </div>
                <button className="md:hidden text-white/70 hover:text-white" onClick={()=>setMenuOpen(!menuOpen)}>
                    {menuOpen ? '\u2715' : '\u2630'}
                </button>
            </div>
            {menuOpen && (
                <div className="md:hidden glass-dark border-t border-white/10 px-4 pb-4 flex flex-col gap-1 animate-slideUp">
                    {links.map(l => (
                        <button key={l.id} onClick={()=>{navigate(l.id);setMenuOpen(false);}}
                            className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium ${currentPage===l.id?'bg-indigo-500/25 text-indigo-300':'text-white/60 hover:text-white hover:bg-white/10'}`}>
                            {l.icon} {l.label}
                        </button>
                    ))}
                    <button onClick={logout} className="text-left px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/15">Logout</button>
                </div>
            )}
        </nav>
    );
};

// ─── LOGIN / SIGNUP ──────────────────────────────────────────────────────────

const LoginSignup = ({ onLogin }) => {
    const [tab, setTab] = useState('login');
    const [form, setForm] = useState({ username:'', email:'', password:'', first_name:'', phone:'', college:'', department:'', branch:'', year:'', semester:'' });
    const [loading, setLoading] = useState(false);
    const upd = k => e => setForm({...form, [k]:e.target.value});

    const submit = async () => {
        setLoading(true);
        try {
            if (tab === 'login') {
                const r = await fetch(`${API_BASE}/login/`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ username:form.username, password:form.password }) });
                const d = await r.json();
                if (r.ok) onLogin({ id:d.user_id, username:d.username, ...d });
                else alert(d.error || 'Invalid credentials');
            } else {
                const r = await fetch(`${API_BASE}/register/`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
                const d = await r.json();
                if (r.ok) { setTab('login'); alert('Registered! Please log in.'); }
                else alert(JSON.stringify(d));
            }
        } catch { alert('Network error. Is the backend running?'); }
        setLoading(false);
    };

    const floatingBadges = ['React','Python','ML','Django','Node.js','Java','Design','DSA'];

    return (
        <div className="min-h-[90vh] flex items-center justify-center">
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Illustration */}
                <div className="hidden md:flex flex-col items-center gap-6 animate-fadeIn">
                    <div className="relative w-64 h-64 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/10 blur-3xl" />
                        <div className="text-9xl animate-float select-none">{'\u{1F393}'}</div>
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold grad-text mb-2">SkillExchange</h1>
                        <p className="text-white/50 text-sm">Learn from peers. Teach what you know.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                        {floatingBadges.map((b,i) => (
                            <span key={b} className="badge-indigo px-3 py-1 rounded-full text-xs font-semibold animate-float"
                                style={{animationDelay:`${i*0.3}s`}}>{b}</span>
                        ))}
                    </div>
                </div>
                {/* Right: Form */}
                <div className="glass rounded-3xl p-8 animate-slideUp">
                    <div className="flex mb-6 bg-white/5 rounded-xl p-1">
                        {['login','register'].map(t => (
                            <button key={t} onClick={()=>setTab(t)}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab===t?'bg-indigo-500 text-white shadow-lg':'text-white/50 hover:text-white'}`}>
                                {t==='login'?'\u{1F511} Login':'\u{1F4DD} Register'}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-3">
                        {tab==='register' && (
                            <>
                                <Input placeholder="Full Name" value={form.first_name} onChange={upd('first_name')} />
                                <Input placeholder="Email" type="email" value={form.email} onChange={upd('email')} />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input placeholder="Phone" value={form.phone} onChange={upd('phone')} />
                                    <Input placeholder="College" value={form.college} onChange={upd('college')} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input placeholder="Department" value={form.department} onChange={upd('department')} />
                                    <Input placeholder="Branch" value={form.branch} onChange={upd('branch')} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input placeholder="Year (e.g. 2)" value={form.year} onChange={upd('year')} />
                                    <Input placeholder="Semester" value={form.semester} onChange={upd('semester')} />
                                </div>
                            </>
                        )}
                        <Input placeholder="Username" value={form.username} onChange={upd('username')} />
                        <Input type="password" placeholder="Password" value={form.password} onChange={upd('password')} />
                        <PrimaryBtn onClick={submit} className="w-full py-3 mt-1 text-base">
                            {loading ? '\u23F3 Please wait...' : (tab==='login' ? '\u{1F511} Login' : '\u{1F680} Create Account')}
                        </PrimaryBtn>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

const Dashboard = ({ user, navigate, showToast }) => {
    const [stats, setStats] = useState({ sessions:0, reviews:0, points:0, skills:0 });
    const [trending, setTrending] = useState([]);
    const [topMentors, setTopMentors] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE}/profile/${user.id}/`).then(r=>r.json()).then(p=>{
            setStats({ skills:(p.skills_have||[]).length, points:p.points||0, sessions:0, reviews:0 });
        });
        fetch(`${API_BASE}/trending/`).then(r=>r.json()).then(setTrending).catch(()=>{});
        fetch(`${API_BASE}/top_mentors/`).then(r=>r.json()).then(d=>setTopMentors(d.slice(0,3))).catch(()=>{});
    }, [user.id]);

    const quickActions = [
        { label:'Find Skills', icon:'\u{1F50D}', page:'search', color:'from-indigo-500 to-purple-600' },
        { label:'My Matches', icon:'\u{1F91D}', page:'matches', color:'from-purple-500 to-pink-500' },
        { label:'Book Session', icon:'\u{1F4C5}', page:'booking', color:'from-amber-500 to-orange-500' },
        { label:'Ask AI', icon:'\u{1F916}', page:'ai_chat', color:'from-emerald-500 to-teal-500' },
    ];

    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Hero */}
            <div className="glass rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                    <p className="text-white/50 text-sm font-medium mb-1">Welcome back</p>
                    <h1 className="text-4xl font-extrabold grad-text mb-2">{user.username} {'\u{1F44B}'}</h1>
                    <p className="text-white/40 text-sm">Ready to learn something new today?</p>
                    <div className="flex gap-6 mt-6">
                        {[
                            { label:'Skills', value:stats.skills, icon:'\u{1F4A1}' },
                            { label:'Points', value:stats.points, icon:'\u{1F3C6}' },
                            { label:'Sessions', value:stats.sessions, icon:'\u{1F4C5}' },
                        ].map(s=>(
                            <div key={s.label} className="flex flex-col">
                                <span className="text-2xl font-extrabold text-white">{s.icon} {s.value}</span>
                                <span className="text-white/40 text-xs mt-0.5">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map(a=>(
                    <button key={a.page} onClick={()=>navigate(a.page)}
                        className={`card-hover glass rounded-2xl p-5 flex flex-col items-center gap-2 text-center bg-gradient-to-br ${a.color} bg-opacity-10`}>
                        <span className="text-3xl">{a.icon}</span>
                        <span className="text-white font-semibold text-sm">{a.label}</span>
                    </button>
                ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {/* Trending */}
                <GlassCard>
                    <h3 className="font-bold text-white mb-4">{'\u{1F525}'} Trending Skills</h3>
                    {trending.length === 0 ? (
                        <p className="text-white/40 text-sm">Loading trending skills...</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {trending.slice(0,12).map((t,i)=>(
                                <span key={i} className="badge-indigo px-3 py-1 rounded-full text-xs font-semibold">{t.skill}</span>
                            ))}
                        </div>
                    )}
                </GlassCard>
                {/* Top Mentors */}
                <GlassCard>
                    <h3 className="font-bold text-white mb-4">{'\u{1F947}'} Top Mentors</h3>
                    <div className="flex flex-col gap-3">
                        {topMentors.map((m,i)=>(
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                    {m.username[0].toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-semibold text-sm">{m.username}</p>
                                    <StarRating rating={m.avg_rating} />
                                </div>
                                <span className="badge-amber px-2 py-0.5 rounded-full text-xs font-bold">{m.points} pts</span>
                            </div>
                        ))}
                        {topMentors.length===0 && <p className="text-white/40 text-sm">No mentors yet.</p>}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────

const ProfilePage = ({ user, showToast }) => {
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({});
    const [skillInput, setSkillInput] = useState({ name:'', level:'Beginner', category:'Technical' });
    const [wantInput, setWantInput] = useState('');
    const [certFile, setCertFile] = useState(null);
    const [tab, setTab] = useState('info');

    const load = () => fetch(`${API_BASE}/profile/${user.id}/`).then(r=>r.json()).then(p=>{
        setProfile(p); setForm({ bio:p.bio||'', github_link:p.github_link||'', portfolio_link:p.portfolio_link||'' });
    });
    useEffect(()=>{ load(); },[user.id]);

    const saveProfile = async () => {
        await fetch(`${API_BASE}/profile/${user.id}/`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
        showToast('Profile updated!'); setEditMode(false); load();
    };

    const addSkill = async () => {
        if (!skillInput.name) return;
        const updated = [...(profile.skills_have||[]), skillInput];
        await fetch(`${API_BASE}/profile/${user.id}/`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ skills_have:updated }) });
        setSkillInput({ name:'', level:'Beginner', category:'Technical' }); load();
    };

    const removeSkill = async (idx) => {
        const updated = (profile.skills_have||[]).filter((_,i)=>i!==idx);
        await fetch(`${API_BASE}/profile/${user.id}/`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ skills_have:updated }) });
        load();
    };

    const addWant = async () => {
        if (!wantInput.trim()) return;
        const updated = [...(profile.skills_want||[]), wantInput.trim()];
        await fetch(`${API_BASE}/profile/${user.id}/`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ skills_want:updated }) });
        setWantInput(''); load();
    };

    const removeWant = async (idx) => {
        const updated = (profile.skills_want||[]).filter((_,i)=>i!==idx);
        await fetch(`${API_BASE}/profile/${user.id}/`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ skills_want:updated }) });
        load();
    };

    const uploadCert = async () => {
        if (!certFile) return;
        const fd = new FormData();
        fd.append('certificate', certFile);
        fd.append('user_id', user.id);
        const r = await fetch(`${API_BASE}/certificate/`, { method:'POST', body:fd });
        if (r.ok) { showToast('Certificate uploaded!'); setCertFile(null); load(); }
        else showToast('Upload failed', 'error');
    };

    if (!profile) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        </div>
    );

    const tabs = ['info','skills','wants','certs'];
    const tabLabels = { info:'Info', skills:'Skills I Have', wants:'Want to Learn', certs:'Certificates' };

    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Profile Header */}
            <div className="glass rounded-3xl p-6 flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl flex-shrink-0">
                    {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-extrabold text-white">{user.username}</h2>
                    <p className="text-white/40 text-sm mt-0.5">{profile.user?.college || 'Student'}</p>
                    <div className="flex gap-2 mt-2">
                        <span className="badge-indigo px-2 py-0.5 rounded-full text-xs font-semibold">{(profile.skills_have||[]).length} Skills</span>
                        <span className="badge-amber px-2 py-0.5 rounded-full text-xs font-semibold">{profile.points||0} Points</span>
                    </div>
                </div>
                <button onClick={()=>setEditMode(!editMode)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${editMode?'bg-red-500/20 text-red-300 border border-red-400/30':'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 hover:bg-indigo-500/30'}`}>
                    {editMode ? 'Cancel' : '\u270F\uFE0F Edit'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-full overflow-x-auto">
                {tabs.map(t=>(
                    <button key={t} onClick={()=>setTab(t)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap px-2 ${tab===t?'bg-indigo-500 text-white':'text-white/50 hover:text-white'}`}>
                        {tabLabels[t]}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <GlassCard>
                {tab==='info' && (
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-white/50 text-xs mb-1 block">Bio</label>
                            {editMode
                                ? <textarea className="inp rounded-xl px-4 py-2.5 w-full text-sm resize-none" rows="3" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} />
                                : <p className="text-white/80 text-sm">{profile.bio || 'No bio yet.'}</p>
                            }
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-white/50 text-xs mb-1 block">GitHub</label>
                                {editMode
                                    ? <Input placeholder="https://github.com/..." value={form.github_link} onChange={e=>setForm({...form,github_link:e.target.value})} />
                                    : <a href={profile.github_link} target="_blank" className="text-indigo-400 text-sm hover:underline">{profile.github_link || 'Not set'}</a>
                                }
                            </div>
                            <div>
                                <label className="text-white/50 text-xs mb-1 block">Portfolio</label>
                                {editMode
                                    ? <Input placeholder="https://..." value={form.portfolio_link} onChange={e=>setForm({...form,portfolio_link:e.target.value})} />
                                    : <a href={profile.portfolio_link} target="_blank" className="text-indigo-400 text-sm hover:underline">{profile.portfolio_link || 'Not set'}</a>
                                }
                            </div>
                        </div>
                        {editMode && <PrimaryBtn onClick={saveProfile} className="w-full">Save Changes</PrimaryBtn>}
                    </div>
                )}

                {tab==='skills' && (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2">
                            {(profile.skills_have||[]).map((s,i)=>(
                                <div key={i} className="badge-indigo px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                                    <span>{s.name} <span className="opacity-60">· {s.level}</span></span>
                                    <button onClick={()=>removeSkill(i)} className="text-white/40 hover:text-red-400 ml-1">{'\u2715'}</button>
                                </div>
                            ))}
                            {(profile.skills_have||[]).length===0 && <p className="text-white/40 text-sm">No skills added yet.</p>}
                        </div>
                        <div className="border-t border-white/10 pt-4">
                            <p className="text-white/50 text-xs font-semibold mb-3">Add New Skill</p>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                <Input placeholder="Skill name" value={skillInput.name} onChange={e=>setSkillInput({...skillInput,name:e.target.value})} />
                                <select className="inp rounded-xl px-3 py-2.5 text-sm" value={skillInput.level} onChange={e=>setSkillInput({...skillInput,level:e.target.value})}>
                                    <option>Beginner</option><option>Intermediate</option><option>Expert</option>
                                </select>
                                <select className="inp rounded-xl px-3 py-2.5 text-sm" value={skillInput.category} onChange={e=>setSkillInput({...skillInput,category:e.target.value})}>
                                    <option>Technical</option><option>Non-Technical</option>
                                </select>
                            </div>
                            <PrimaryBtn onClick={addSkill} className="w-full">+ Add Skill</PrimaryBtn>
                        </div>
                    </div>
                )}

                {tab==='wants' && (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2">
                            {(profile.skills_want||[]).map((s,i)=>(
                                <div key={i} className="badge-amber px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                                    <span>{s}</span>
                                    <button onClick={()=>removeWant(i)} className="text-amber-400/60 hover:text-red-400">{'\u2715'}</button>
                                </div>
                            ))}
                            {(profile.skills_want||[]).length===0 && <p className="text-white/40 text-sm">No learning goals yet.</p>}
                        </div>
                        <div className="border-t border-white/10 pt-4 flex gap-2">
                            <Input placeholder="Skill you want to learn..." value={wantInput} onChange={e=>setWantInput(e.target.value)} />
                            <PrimaryBtn onClick={addWant}>Add</PrimaryBtn>
                        </div>
                    </div>
                )}

                {tab==='certs' && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(profile.certificates||[]).map((c,i)=>(
                                <a key={i} href={c.file_url||c.file} target="_blank" rel="noopener noreferrer"
                                    className="glass rounded-xl p-3 flex flex-col items-center gap-2 card-hover group">
                                    <span className="text-4xl group-hover:scale-110 transition-transform">{'\u{1F4C4}'}</span>
                                    <span className="text-white/60 text-xs text-center truncate w-full">{c.title || 'Certificate '+(i+1)}</span>
                                </a>
                            ))}
                            {(profile.certificates||[]).length===0 && <p className="text-white/40 text-sm col-span-3">No certificates uploaded yet.</p>}
                        </div>
                        <div className="border-t border-white/10 pt-4">
                            <p className="text-white/50 text-xs font-semibold mb-3">Upload Certificate Photo</p>
                            <div className="flex gap-2 items-center">
                                <input type="file" accept="image/*,.pdf"
                                    className="flex-1 text-sm text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-300"
                                    onChange={e=>setCertFile(e.target.files[0])} />
                                <PrimaryBtn onClick={uploadCert}>Upload</PrimaryBtn>
                            </div>
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

// ─── SEARCH PAGE ─────────────────────────────────────────────────────────────

const SearchPage = ({ user, showToast, navigate }) => {
    const [q, setQ] = useState('');
    const [level, setLevel] = useState('');
    const [category, setCategory] = useState('');
    const [minRating, setMinRating] = useState('');
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);

    const openUser = (u) => {
        setSelected(u);
    };

    const doSearch = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (level) params.append('level', level);
        if (category) params.append('category', category);
        if (minRating) params.append('min_rating', minRating);
        const res = await fetch(`${API_BASE}/search/?${params}`);
        const data = await res.json();
        setResults(data); setSearched(true); setLoading(false);
    };

    const sendChatRequest = async (receiverId) => {
        const r = await fetch(`${API_BASE}/chat_request/`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ sender:user.id, receiver:receiverId }) });
        if (r.ok) { showToast('Chat request sent!'); setSelected(null); navigate('chat'); }
        else { const d = await r.json(); showToast(d.error||'Request failed','error'); }
    };

    const selp = selected;
    const fp = selp?.fullProfile;

    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-extrabold text-white mb-1">Search and Filter</h2>
                <p className="text-white/40 text-sm">Find students with the skills you want to learn</p>
            </div>

            {/* Search bar */}
            <div className="glass rounded-2xl p-5">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-white/40 text-xs mb-1 block">Skill Name</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">{'\u{1F50D}'}</span>
                            <input type="text" placeholder="e.g. Python, React..."
                                value={q} onChange={e=>setQ(e.target.value)}
                                onKeyPress={e=>e.key==='Enter'&&doSearch()}
                                className="inp rounded-xl pl-9 pr-4 py-2.5 w-full text-sm" />
                        </div>
                    </div>
                    <div className="min-w-[130px]">
                        <label className="text-white/40 text-xs mb-1 block">Level</label>
                        <select className="inp rounded-xl px-3 py-2.5 text-sm w-full" value={level} onChange={e=>setLevel(e.target.value)}>
                            <option value="">Any Level</option>
                            <option>Beginner</option><option>Intermediate</option><option>Expert</option>
                        </select>
                    </div>
                    <div className="min-w-[130px]">
                        <label className="text-white/40 text-xs mb-1 block">Category</label>
                        <select className="inp rounded-xl px-3 py-2.5 text-sm w-full" value={category} onChange={e=>setCategory(e.target.value)}>
                            <option value="">Any</option>
                            <option>Technical</option><option>Non-Technical</option>
                        </select>
                    </div>
                    <div className="min-w-[110px]">
                        <label className="text-white/40 text-xs mb-1 block">Min Rating</label>
                        <select className="inp rounded-xl px-3 py-2.5 text-sm w-full" value={minRating} onChange={e=>setMinRating(e.target.value)}>
                            <option value="">Any</option>
                            <option value="3">3+</option><option value="4">4+</option><option value="4.5">4.5+</option>
                        </select>
                    </div>
                    <PrimaryBtn onClick={doSearch} className="px-8">{loading ? '...' : '\u{1F50D} Search'}</PrimaryBtn>
                </div>
            </div>

            {/* Results */}
            {searched && (
                <div className="grid md:grid-cols-3 gap-4">
                    {results.map((u,i)=>(
                        <div key={i} onClick={()=>openUser(u)}
                            className="glass rounded-2xl p-5 card-hover cursor-pointer group">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                    {u.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{u.username}</p>
                                    <p className="text-white/40 text-xs">{u.college||'Student'}</p>
                                </div>
                            </div>
                            <span className="badge-indigo px-2 py-1 rounded-lg text-xs font-semibold">
                                {u.matched_skill.name} · {u.matched_skill.level}
                            </span>
                            <div className="flex items-center justify-between mt-3">
                                <StarRating rating={u.avg_rating} />
                                <span className="badge-amber px-2 py-0.5 rounded-full text-xs font-bold">{u.points} pts</span>
                            </div>
                            <p className="text-indigo-400 text-xs mt-2 group-hover:underline">View profile {'\u2192'}</p>
                        </div>
                    ))}
                    {results.length===0 && (
                        <div className="col-span-3 glass rounded-2xl p-16 text-center">
                            <p className="text-5xl mb-3">{'\u{1F50D}'}</p>
                            <p className="text-white/40">No users found. Try a different skill!</p>
                        </div>
                    )}
                </div>
            )}

            {/* User detail modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4 animate-fadeIn"
                    onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
                    <div className="glass rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp">
                        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
                            <h3 className="text-white font-bold text-sm">User Profile</h3>
                            <button onClick={()=>setSelected(null)} className="text-white/40 hover:text-white text-xl transition-colors">{'\u2715'}</button>
                        </div>
                        <div className="px-6 pt-4 pb-6">
                            <div className="flex items-end gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl ring-4 ring-[#060818]">
                                    {selected.username[0].toUpperCase()}
                                </div>
                                <div className="mb-1">
                                    <h3 className="text-xl font-extrabold text-white">{selected.username}</h3>
                                    <p className="text-white/50 text-xs">{selected.college||'Student'}</p>
                                </div>
                            </div>
                            {selected.bio && <p className="text-white/60 text-sm mb-4 glass rounded-xl p-3">{selected.bio}</p>}
                            <div className="mb-4">
                                <p className="text-white/40 text-xs font-semibold mb-2">MATCHED SKILL</p>
                                <span className="badge-indigo px-3 py-1.5 rounded-xl text-xs font-bold">
                                    {selected.matched_skill.name} · {selected.matched_skill.level}
                                </span>
                            </div>
                            <div className="mb-4">
                                <p className="text-white/40 text-xs font-semibold mb-2">SKILLS THEY HAVE</p>
                                <div className="flex flex-wrap gap-2">
                                    {(selected.skills_have||[]).map((s,i)=>(
                                        <span key={i} className="badge-indigo px-2 py-1 rounded-lg text-xs">{s.name}</span>
                                    ))}
                                    {(selected.skills_have||[]).length===0 && <span className="text-white/30 text-xs">None listed</span>}
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-white/40 text-xs font-semibold mb-2">WANTS TO LEARN</p>
                                <div className="flex flex-wrap gap-2">
                                    {(selected.skills_want||[]).map((s,i)=>(
                                        <span key={i} className="badge-amber px-2 py-1 rounded-lg text-xs">{s.name||s}</span>
                                    ))}
                                    {(selected.skills_want||[]).length===0 && <span className="text-white/30 text-xs">None listed</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mb-4 glass rounded-xl p-3">
                                <div>
                                    <p className="text-white/40 text-xs">Rating</p>
                                    <StarRating rating={selected.avg_rating} />
                                </div>
                                <div className="border-l border-white/10 pl-4">
                                    <p className="text-white/40 text-xs">Points</p>
                                    <p className="grad-text-gold font-extrabold">{selected.points}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={()=>sendChatRequest(selected.user_id)}
                                    className="flex-1 btn-primary py-2.5 rounded-xl font-bold text-sm text-white">
                                    {'\u{1F4AC}'} Chat Request
                                </button>
                                <button onClick={()=>{ setSelected(null); navigate('booking'); }}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-amber-300 border border-amber-400/40 hover:bg-amber-500/20 transition-all">
                                    {'\u{1F4C5}'} Book Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── MATCH PAGE ───────────────────────────────────────────────────────────────

const MatchPage = ({ user, navigate, showToast }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        fetch(`${API_BASE}/match/`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ user_id:user.id }) })
            .then(r=>r.json()).then(d=>{ setMatches(d); setLoading(false); });
    },[user.id]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        </div>
    );

    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-extrabold text-white mb-1">{'\u{1F91D}'} Smart Matches</h2>
                <p className="text-white/40 text-sm">ML-powered matches using Cosine Similarity</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                {matches.map((m,i)=>(
                    <div key={i} className="glass rounded-2xl p-5 card-hover">
                        <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14 flex-shrink-0">
                                <svg className="w-14 h-14 ring-progress" viewBox="0 0 56 56">
                                    <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4"/>
                                    <circle cx="28" cy="28" r="24" fill="none" stroke="#818cf8" strokeWidth="4"
                                        strokeDasharray={`${2*3.14159*24}`}
                                        strokeDashoffset={`${2*3.14159*24*(1-(m.score||0))}`}
                                        strokeLinecap="round"/>
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-300">
                                    {Math.round((m.score||0)*100)}%
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="font-extrabold text-white text-lg">{m.username}</p>
                                <p className="text-white/40 text-xs mb-2">{m.college||'Student'}</p>
                                <div className="flex flex-wrap gap-1">
                                    {(m.common_skills||[]).slice(0,3).map((s,j)=>(
                                        <span key={j} className="badge-indigo px-2 py-0.5 rounded-full text-xs">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={()=>navigate('chat')}
                                className="flex-1 py-2 rounded-xl text-xs font-semibold btn-primary text-white">Chat</button>
                            <button onClick={()=>navigate('booking')}
                                className="flex-1 py-2 rounded-xl text-xs font-semibold text-amber-300 border border-amber-400/30 hover:bg-amber-500/20 transition-all">Book</button>
                        </div>
                    </div>
                ))}
                {matches.length===0 && (
                    <div className="col-span-2 glass rounded-2xl p-16 text-center">
                        <p className="text-5xl mb-3">{'\u{1F91D}'}</p>
                        <p className="text-white/40">Add skills to your profile to see matches!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── CHAT ─────────────────────────────────────────────────────────────────────

const Chat = ({ user, showToast }) => {
    const [activeTab, setActiveTab] = useState('chats');
    const [connections, setConnections] = useState([]);
    const [requests, setRequests] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState('');
    const [file, setFile] = useState(null);
    const messagesEndRef = useRef(null);

    const loadConnections = () => fetch(`${API_BASE}/chat_request/?user_id=${user.id}&status=ACCEPTED`).then(r=>r.json()).then(data=>{
        const conns = data.filter(r=>r.status==='ACCEPTED').map(r=>({
            id: r.sender===user.id ? r.receiver : r.sender,
            username: r.sender===user.id ? r.receiver_name : r.sender_name,
            requestId: r.id
        }));
        setConnections(conns);
    });

    const loadRequests = () => fetch(`${API_BASE}/chat_request/?user_id=${user.id}&status=PENDING`).then(r=>r.json()).then(data=>{
        setRequests(data.filter(r=>r.receiver===user.id&&r.status==='PENDING'));
    });

    const loadAllUsers = () => fetch(`${API_BASE}/users/`).then(r=>r.json()).then(data=>{
        setAllUsers(data.filter(p=>p.user.id!==user.id).map(p=>p.user));
    });

    useEffect(()=>{ loadConnections(); loadRequests(); loadAllUsers(); },[user.id]);

    const loadMessages = (otherId) => {
        fetch(`${API_BASE}/message/?user_id=${user.id}&other_id=${otherId}`).then(r=>r.json()).then(setMessages);
    };

    useEffect(()=>{ if(activeChat) { loadMessages(activeChat.id); const i=setInterval(()=>loadMessages(activeChat.id),3000); return ()=>clearInterval(i); } },[activeChat]);
    useEffect(()=>{ messagesEndRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);

    const sendMsg = async () => {
        if (!msg.trim()&&!file) return;
        const fd = new FormData();
        fd.append('sender', user.id);
        fd.append('receiver', activeChat.id);
        if (msg.trim()) fd.append('content', msg.trim());
        if (file) fd.append('file_attachment', file);
        await fetch(`${API_BASE}/message/`, { method:'POST', body:fd });
        setMsg(''); setFile(null); loadMessages(activeChat.id);
    };

    const sendRequest = async (receiverId) => {
        const r = await fetch(`${API_BASE}/chat_request/`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ sender:user.id, receiver:receiverId }) });
        if (r.ok) { showToast('Request sent!'); loadAllUsers(); }
        else { const d=await r.json(); showToast(d.error||'Failed','error'); }
    };

    const respondRequest = async (id, action) => {
        await fetch(`${API_BASE}/chat_request/${id}/`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ status:action }) });
        showToast(action==='ACCEPTED'?'Connected!':'Declined');
        loadRequests(); loadConnections();
    };

    const pendingCount = requests.length;

    return (
        <div className="flex gap-4 h-[78vh] animate-fadeIn">
            {/* Sidebar */}
            <div className="w-72 flex-shrink-0 glass rounded-2xl flex flex-col overflow-hidden">
                {/* Tab header */}
                <div className="flex border-b border-white/10">
                    {[
                        { id:'chats', label:'Chats', icon:'\u{1F4AC}' },
                        { id:'requests', label:'Requests', icon:'\u{1F514}', badge:pendingCount },
                        { id:'new', label:'New', icon:'\u2795' }
                    ].map(t=>(
                        <button key={t.id} onClick={()=>setActiveTab(t.id)}
                            className={`flex-1 py-3 text-xs font-semibold relative transition-all ${activeTab===t.id?'text-indigo-300 border-b-2 border-indigo-400':'text-white/40 hover:text-white/70'}`}>
                            {t.icon} {t.label}
                            {t.badge>0 && <span className="absolute -top-0.5 right-2 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">{t.badge}</span>}
                        </button>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {activeTab==='chats' && (
                        connections.length===0
                            ? <p className="text-white/30 text-xs text-center p-6">No connections yet. Send chat requests!</p>
                            : connections.map((c,i)=>(
                                <button key={i} onClick={()=>setActiveChat(c)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${activeChat?.id===c.id?'bg-indigo-500/25':'hover:bg-white/5'}`}>
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                        {c.username[0].toUpperCase()}
                                    </div>
                                    <span className="text-white font-medium text-sm">{c.username}</span>
                                </button>
                            ))
                    )}
                    {activeTab==='requests' && (
                        requests.length===0
                            ? <p className="text-white/30 text-xs text-center p-6">No pending requests</p>
                            : requests.map((r,i)=>(
                                <div key={i} className="glass rounded-xl p-3 mb-2">
                                    <p className="text-white font-semibold text-sm mb-2">{r.sender_name}</p>
                                    <div className="flex gap-2">
                                        <button onClick={()=>respondRequest(r.id,'ACCEPTED')}
                                            className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 hover:bg-indigo-500/30">Accept</button>
                                        <button onClick={()=>respondRequest(r.id,'REJECTED')}
                                            className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-300 border border-red-400/20 hover:bg-red-500/20">Decline</button>
                                    </div>
                                </div>
                            ))
                    )}
                    {activeTab==='new' && allUsers.map((u,i)=>{
                        const isConnected = connections.some(c=>c.id===u.id);
                        return (
                            <div key={i} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-xl">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                                    {u.username[0].toUpperCase()}
                                </div>
                                <span className="flex-1 text-white text-xs font-medium">{u.username}</span>
                                <button onClick={()=>!isConnected&&sendRequest(u.id)}
                                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${isConnected?'text-green-400 cursor-default':'text-indigo-300 border border-indigo-400/30 hover:bg-indigo-500/20'}`}>
                                    {isConnected ? 'Connected' : 'Request'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Chat window */}
            <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
                {activeChat ? (
                    <>
                        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {activeChat.username[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{activeChat.username}</p>
                                <p className="text-green-400 text-xs">Connected</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                            {messages.map((m,i)=>{
                                const mine = m.sender===user.id;
                                return (
                                    <div key={i} className={`flex ${mine?'justify-end':'justify-start'}`}>
                                        <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${mine?'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-none':'glass text-white/80 rounded-bl-none'}`}>
                                            {m.content && <p>{m.content}</p>}
                                            {m.file_attachment && (
                                                <a href={m.file_attachment} target="_blank" className="text-indigo-300 underline text-xs block mt-1">Attachment</a>
                                            )}
                                            <p className={`text-[10px] mt-1 ${mine?'text-white/50':'text-white/30'}`}>{new Date(m.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="px-4 py-3 border-t border-white/10 flex gap-2 items-center">
                            <input type="file" id="chatFile" className="hidden" onChange={e=>setFile(e.target.files[0])} />
                            <label htmlFor="chatFile" className="text-white/40 hover:text-indigo-300 cursor-pointer text-lg select-none">{'\u{1F4CE}'}</label>
                            {file && <span className="text-indigo-400 text-xs truncate max-w-[80px]">{file.name}</span>}
                            <input type="text" placeholder="Type a message..." value={msg} onChange={e=>setMsg(e.target.value)}
                                onKeyPress={e=>e.key==='Enter'&&sendMsg()}
                                className="flex-1 inp rounded-xl px-4 py-2.5 text-sm" />
                            <button onClick={sendMsg} className="btn-primary p-2.5 rounded-xl text-white text-lg">{'\u{27A4}'}</button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
                        <div className="text-6xl animate-float">{'\u{1F4AC}'}</div>
                        <p className="text-white font-semibold">Select a conversation</p>
                        <p className="text-white/40 text-sm">or send a new chat request in the New tab</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── SESSION BOOKING ─────────────────────────────────────────────────────────

const SessionBooking = ({ user, showToast }) => {
    const [sessions, setSessions] = useState([]);
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ provider:'', skill_name:'', date_time:'' });
    const [reviewModal, setReviewModal] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating:0, feedback:'' });

    const load = () => fetch(`${API_BASE}/session/?user_id=${user.id}`).then(r=>r.json()).then(setSessions);

    useEffect(()=>{
        load();
        fetch(`${API_BASE}/users/`).then(r=>r.json()).then(d=>setUsers(d.filter(p=>p.user.id!==user.id).map(p=>p.user)));
    },[user.id]);

    const bookSession = async () => {
        if (!form.provider||!form.skill_name||!form.date_time) { showToast('Please fill all fields','error'); return; }
        try {
            const res = await fetch(`${API_BASE}/session/`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ requester:Number(user.id), provider:Number(form.provider), skill_name:form.skill_name, date_time:form.date_time }) });
            const data = await res.json();
            if (res.ok) { showToast('Session booked! Meet link generated.'); setShowForm(false); setForm({ provider:'', skill_name:'', date_time:'' }); load(); }
            else showToast(data.error||data.detail||'Booking failed','error');
        } catch { showToast('Network error','error'); }
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_BASE}/session/`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ session_id:id, status }) });
            if (res.ok) { showToast(`Session ${status.toLowerCase()}`); load(); }
        } catch { showToast('Error','error'); }
    };

    const deleteSession = async (id) => {
        if (!window.confirm('Cancel this session?')) return;
        const res = await fetch(`${API_BASE}/session/`, { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ session_id:id, user_id:Number(user.id) }) });
        const d = await res.json();
        if (res.ok) { showToast('Session cancelled'); load(); }
        else showToast(d.error||'Failed','error');
    };

    const submitReview = async () => {
        if (!reviewForm.rating) { showToast('Select a rating','error'); return; }
        const otherId = reviewModal.requester===user.id ? reviewModal.provider : reviewModal.requester;
        await fetch(`${API_BASE}/review/`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ reviewer:user.id, reviewee:otherId, session:reviewModal.id, rating:reviewForm.rating, feedback:reviewForm.feedback }) });
        showToast('Review submitted! +10 points'); setReviewModal(null); setReviewForm({ rating:0, feedback:'' });
    };

    const statusStyle = { PENDING:'badge-amber', ACCEPTED:'badge-green', REJECTED:'badge-red', COMPLETED:'badge-indigo' };

    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-extrabold text-white">{'\u{1F4C5}'} Sessions</h2>
                    <p className="text-white/40 text-sm">Video calls via Jitsi Meet</p>
                </div>
                <PrimaryBtn onClick={()=>setShowForm(!showForm)}>
                    {showForm ? '\u2715 Cancel' : '+ Book Session'}
                </PrimaryBtn>
            </div>

            {showForm && (
                <div className="glass rounded-2xl p-6 animate-slideUp">
                    <h3 className="text-white font-bold mb-4">New Session</h3>
                    <div className="grid md:grid-cols-3 gap-3 mb-4">
                        <div>
                            <label className="text-white/40 text-xs mb-1 block">Student to learn from</label>
                            <select className="inp rounded-xl px-3 py-2.5 text-sm w-full" value={form.provider} onChange={e=>setForm({...form,provider:e.target.value})}>
                                <option value="">Select student...</option>
                                {users.map(u=><option key={u.id} value={u.id}>{u.username}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-white/40 text-xs mb-1 block">Skill to learn</label>
                            <Input placeholder="e.g. Python, React..." value={form.skill_name} onChange={e=>setForm({...form,skill_name:e.target.value})} />
                        </div>
                        <div>
                            <label className="text-white/40 text-xs mb-1 block">Date and Time</label>
                            <input type="datetime-local" className="inp rounded-xl px-3 py-2.5 text-sm w-full" value={form.date_time} onChange={e=>setForm({...form,date_time:e.target.value})} />
                        </div>
                    </div>
                    <PrimaryBtn onClick={bookSession} className="w-full">Book Session + Generate Meet Link</PrimaryBtn>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {sessions.map((s,i)=>{
                    const uid = Number(user.id);
                    const partner = s.requester===uid ? s.provider_name : s.requester_name;
                    const isProvider = s.provider===uid;
                    const isRequester = s.requester===uid;
                    return (
                        <div key={i} className="glass rounded-2xl p-5 card-hover">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                    {partner[0].toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-bold">{partner}</p>
                                    <p className="text-white/40 text-xs">{s.skill_name} · {new Date(s.date_time).toLocaleString()}</p>
                                </div>
                                <span className={`${statusStyle[s.status]} px-3 py-1 rounded-full text-xs font-bold`}>{s.status}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/10">
                                {isProvider && s.status==='PENDING' && <>
                                    <button onClick={()=>updateStatus(s.id,'ACCEPTED')} className="px-3 py-1.5 rounded-lg text-xs font-semibold badge-green hover:bg-green-500/25 transition-all">Accept</button>
                                    <button onClick={()=>updateStatus(s.id,'REJECTED')} className="px-3 py-1.5 rounded-lg text-xs font-semibold badge-red hover:bg-red-500/25 transition-all">Reject</button>
                                </>}
                                {s.status==='ACCEPTED' && <button onClick={()=>updateStatus(s.id,'COMPLETED')} className="px-3 py-1.5 rounded-lg text-xs font-semibold badge-indigo hover:bg-indigo-500/25 transition-all">Mark Done</button>}
                                {s.status==='COMPLETED' && <button onClick={()=>setReviewModal(s)} className="px-3 py-1.5 rounded-lg text-xs font-semibold badge-amber hover:bg-amber-500/25 transition-all">{'\u2605'} Review</button>}
                                {isRequester && ['PENDING','ACCEPTED'].includes(s.status) && (
                                    <button onClick={()=>deleteSession(s.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-300 border border-red-400/20 hover:bg-red-500/15 transition-all">{'\u{1F5D1}'} Cancel</button>
                                )}
                                {s.meeting_link && (
                                    <a href={s.meeting_link} target="_blank"
                                        className="ml-auto btn-primary px-4 py-1.5 rounded-xl text-xs font-bold text-white">{'\u{1F3A5}'} Join Meet</a>
                                )}
                            </div>
                        </div>
                    );
                })}
                {sessions.length===0 && (
                    <div className="glass rounded-2xl p-16 text-center">
                        <p className="text-5xl mb-3">{'\u{1F4C5}'}</p>
                        <p className="text-white/40">No sessions yet. Book one above!</p>
                    </div>
                )}
            </div>

            {reviewModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="glass rounded-3xl p-6 w-full max-w-md animate-slideUp">
                        <h3 className="text-white font-extrabold text-lg mb-1">{'\u2605'} Leave a Review</h3>
                        <p className="text-white/40 text-sm mb-4">Rate your session on {reviewModal.skill_name}</p>
                        <div className="mb-4"><StarRating rating={reviewForm.rating} onRate={r=>setReviewForm({...reviewForm,rating:r})} /></div>
                        <textarea className="inp rounded-xl px-4 py-3 w-full text-sm resize-none mb-4" rows="3"
                            placeholder="Share your experience..." value={reviewForm.feedback}
                            onChange={e=>setReviewForm({...reviewForm,feedback:e.target.value})} />
                        <div className="flex gap-3">
                            <PrimaryBtn onClick={submitReview} className="flex-1">Submit Review</PrimaryBtn>
                            <GhostBtn onClick={()=>setReviewModal(null)}>Cancel</GhostBtn>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── AI CHAT ─────────────────────────────────────────────────────────────────

const AIChat = () => {
    const [messages, setMessages] = useState([{ sender:'ai', content:'Hello! I am SkillBot. Ask me about skills, learning paths, or how to use the platform!' }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    useEffect(()=>endRef.current?.scrollIntoView({behavior:'smooth'}),[messages]);

    const send = async () => {
        if (!input.trim()) return;
        const userMsg = input.trim(); setInput('');
        setMessages(m=>[...m,{ sender:'user', content:userMsg }]);
        setLoading(true);
        try {
            const r = await fetch(`${API_BASE}/ai_chat/`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ message:userMsg }) });
            const d = await r.json();
            setMessages(m=>[...m,{ sender:'ai', content:d.response||d.reply||'I am not sure about that. Please try again.' }]);
        } catch { setMessages(m=>[...m,{ sender:'ai', content:'Network error. Please try again.' }]); }
        setLoading(false);
    };

    const suggestions = ['What skills are trending?','How do I find a mentor?','Tips for learning Python?','How does skill matching work?'];

    return (
        <div className="flex flex-col gap-4 animate-fadeIn h-[80vh]">
            <div>
                <h2 className="text-2xl font-extrabold text-white">{'\u{1F916}'} AI Assistant</h2>
                <p className="text-white/40 text-sm">Ask anything about skills and learning</p>
            </div>
            <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {messages.map((m,i)=>(
                        <div key={i} className={`flex items-end gap-2 ${m.sender==='user'?'justify-end':''} animate-fadeIn`}>
                            {m.sender==='ai' && (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm flex-shrink-0">{'\u{1F916}'}</div>
                            )}
                            <div className={`max-w-md px-4 py-3 rounded-2xl text-sm ${m.sender==='user'?'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-none':'glass text-white/80 rounded-bl-none'}`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-end gap-2">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm">{'\u{1F916}'}</div>
                            <div className="glass px-4 py-3 rounded-2xl rounded-bl-none flex gap-1.5">
                                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                            </div>
                        </div>
                    )}
                    <div ref={endRef} />
                </div>
                <div className="p-3 border-t border-white/10">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {suggestions.map((s,i)=>(
                            <button key={i} onClick={()=>setInput(s)}
                                className="badge-indigo px-3 py-1 rounded-full text-xs hover:bg-indigo-500/25 transition-all">{s}</button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Ask SkillBot anything..." value={input} onChange={e=>setInput(e.target.value)}
                            onKeyPress={e=>e.key==='Enter'&&send()}
                            className="flex-1 inp rounded-xl px-4 py-2.5 text-sm" />
                        <PrimaryBtn onClick={send} className="px-5">{'\u27A4'}</PrimaryBtn>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────

const Leaderboard = () => {
    const [mentors, setMentors] = useState([]);
    useEffect(()=>{ fetch(`${API_BASE}/top_mentors/`).then(r=>r.json()).then(setMentors).catch(()=>{}); },[]);

    const podiumColors = [
        'from-amber-400 to-yellow-500',
        'from-slate-400 to-slate-500',
        'from-amber-700 to-amber-800'
    ];
    const podiumEmoji = ['\u{1F947}','\u{1F948}','\u{1F949}'];

    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-extrabold text-white">{'\u{1F3C6}'} Leaderboard</h2>
                <p className="text-white/40 text-sm">Top mentors ranked by points and rating</p>
            </div>

            {/* Podium top 3 */}
            {mentors.length>=3 && (
                <div className="flex items-end justify-center gap-4 py-6">
                    {[mentors[1], mentors[0], mentors[2]].map((m,i)=>{
                        const orig = i===0?1:i===1?0:2;
                        const heights = ['h-28','h-36','h-24'];
                        return (
                            <div key={orig} className="flex flex-col items-center gap-2">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xl mb-1">
                                    {m.username[0].toUpperCase()}
                                </div>
                                <p className="text-white font-bold text-sm text-center">{m.username}</p>
                                <p className="grad-text-gold font-extrabold text-sm">{m.points} pts</p>
                                <div className={`${heights[i]} w-24 rounded-t-2xl bg-gradient-to-t ${podiumColors[orig]} flex items-start justify-center pt-2 text-2xl`}>
                                    {podiumEmoji[orig]}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Full list */}
            <div className="glass rounded-2xl overflow-hidden">
                {mentors.map((m,i)=>(
                    <div key={i} className={`flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 card-hover ${i===0?'bg-amber-500/5':''}`}>
                        <span className="text-2xl w-8 text-center">{i<3?podiumEmoji[i]:`#${i+1}`}</span>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {m.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-bold">{m.username} {m.name&&<span className="text-white/40 font-normal text-sm">({m.name})</span>}</p>
                            <StarRating rating={m.avg_rating} />
                        </div>
                        <div className="text-right">
                            <p className="grad-text-gold font-extrabold">{m.points} pts</p>
                            <p className="text-white/30 text-xs">Score: {m.score}</p>
                        </div>
                    </div>
                ))}
                {mentors.length===0 && (
                    <div className="p-16 text-center">
                        <p className="text-5xl mb-3">{'\u{1F3C6}'}</p>
                        <p className="text-white/40">No rankings yet. Complete sessions to get on the board!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
