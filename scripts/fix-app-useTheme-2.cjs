const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');       
let content = fs.readFileSync(appTsxPath, 'utf8');

// Need to do the same for ProtectedAdminShell where the topbar also exists!
const adminShellRegex = /function ProtectedAdminShell\(\) \{[\s\S]*?const \{ logout, user \} = useAuth\(\);/;
content = content.replace(adminShellRegex, `function ProtectedAdminShell() {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();`);

// And for SiteSelectorPage where there's a topbar too!
const siteSelectorRegex = /function SiteSelectorPage\(\) \{[\s\S]*?const \{ bootstrap, logout, user \} = useAuth\(\);/;
content = content.replace(siteSelectorRegex, `function SiteSelectorPage() {
  const { bootstrap, logout, user } = useAuth();
  const { theme, setTheme } = useTheme();`);

// Wait, the hook also needs to be in `App` so it sets the data-theme attribute at the root level globally, but then `theme` and `setTheme` aren't passed down. 
// A better way: just create a global state or a Context, OR just use the hook in `App` and pass it down, OR just have `useTheme` handle the effect but return nothing, and call it in `App`. But then the buttons need `setTheme`.
// Let's just create a global event listener for theme change, or just call `useTheme` in `App` AND in the shells. 
// Calling it multiple times is fine, it reads from localStorage, but the effect will run multiple times.
// Let's modify `useTheme` to dispatch a custom event on window when theme changes, so all instances stay in sync.

const useThemeRegex = /function useTheme\(\) \{[\s\S]*?return \{ theme, setTheme \};\n\}/;

const newUseTheme = `function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('eg_theme') as 'light' | 'dark' | 'system') || 'system';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('eg_theme') as 'light' | 'dark' | 'system';
      if (stored && stored !== theme) {
        setThemeState(stored);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('eg-theme-change', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('eg-theme-change', handleStorageChange);
    };
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('eg_theme', newTheme);
    window.dispatchEvent(new Event('eg-theme-change'));
  };

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
  }, [theme]);

  return { theme, setTheme };
}`;

content = content.replace(useThemeRegex, newUseTheme);
fs.writeFileSync(appTsxPath, content);
console.log("Updated useTheme and shells");
