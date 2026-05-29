const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// 1. Add ThemeProvider logic inside App component
const appComponentRegex = /export default function App\(\) \{/;

const themeLogic = `
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('eg_theme') as 'light' | 'dark' | 'system') || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      root.setAttribute('data-theme', systemTheme);
      
      const listener = (e: MediaQueryListEvent) => {
        root.setAttribute('data-theme', e.matches ? 'light' : 'dark');
      };
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', listener);
      return () => window.matchMedia('(prefers-color-scheme: light)').removeEventListener('change', listener);
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('eg_theme', theme);
  }, [theme]);

  return { theme, setTheme };
}

export default function App() {
  const { theme, setTheme } = useTheme();
`;

if (!content.includes('useTheme()')) {
  content = content.replace(appComponentRegex, themeLogic);
}

// 2. Add Theme Toggle to the Topbar User Menu
const userMenuRegex = /<div style=\{\{ padding: "0\.5rem", borderBottom: "1px solid var\(--eg-border\)", marginBottom: "0\.5rem" \}\}>[\s\S]*?<\/div>/;

const newMenuSection = `<div style={{ padding: "0.5rem", borderBottom: "1px solid var(--eg-border)", marginBottom: "0.5rem" }}>
                  <strong style={{ display: "block" }}>{user?.name}</strong>
                  <small style={{ color: "var(--eg-muted)" }}>{user?.email}</small>
                </div>
                <div style={{ display: "flex", gap: "0.25rem", padding: "0.25rem", background: "var(--eg-surface)", borderRadius: "0.5rem", marginBottom: "0.5rem" }}>
                  <button 
                    type="button"
                    onClick={() => setTheme('light')}
                    style={{ flex: 1, padding: "0.25rem", border: "none", borderRadius: "0.25rem", cursor: "pointer", background: theme === 'light' ? 'var(--eg-accent)' : 'transparent', color: theme === 'light' ? '#fff' : 'var(--eg-muted)' }}
                    title="Light theme"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto' }}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTheme('dark')}
                    style={{ flex: 1, padding: "0.25rem", border: "none", borderRadius: "0.25rem", cursor: "pointer", background: theme === 'dark' ? 'var(--eg-accent)' : 'transparent', color: theme === 'dark' ? '#fff' : 'var(--eg-muted)' }}
                    title="Dark theme"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto' }}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTheme('system')}
                    style={{ flex: 1, padding: "0.25rem", border: "none", borderRadius: "0.25rem", cursor: "pointer", background: theme === 'system' ? 'var(--eg-accent)' : 'transparent', color: theme === 'system' ? '#fff' : 'var(--eg-muted)' }}
                    title="System theme"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto' }}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                  </button>
                </div>`;

if (!content.includes('setTheme(\'light\')')) {
  content = content.replace(userMenuRegex, newMenuSection);
}

fs.writeFileSync(appTsxPath, content);
console.log("Added theme switcher to dashboard");
