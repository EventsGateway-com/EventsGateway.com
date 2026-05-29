const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');       
let content = fs.readFileSync(appTsxPath, 'utf8');

const useThemeRegex = /function useTheme\(\) \{[\s\S]*?return \{ theme, setTheme \};\n\}/;

const newUseTheme = `function useTheme() {
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
}`;

if (!content.includes('function useTheme()')) {
  // It seems the useTheme wasn't injected correctly or is missing
  // Let's check where to inject it. We should inject it before App
  content = content.replace(/export default function App\(\) \{/, newUseTheme + '\n\nexport default function App() {');
} else {
  content = content.replace(useThemeRegex, newUseTheme);
}

fs.writeFileSync(appTsxPath, content);
console.log("Fixed useTheme in app.tsx");
