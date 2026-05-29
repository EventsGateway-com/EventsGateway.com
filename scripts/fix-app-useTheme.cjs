const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');       
let content = fs.readFileSync(appTsxPath, 'utf8');

// Ensure that `theme` and `setTheme` are correctly passed through context, or that `useTheme` is used in AppShell where the topbar lives, not just App, because the Topbar needs access to `setTheme`.
// Ah! The Topbar is inside `AppShell`, but `useTheme` is called inside `App`. 
// The Topbar buttons call `setTheme`, but `setTheme` is not in scope in `AppShell`!
// Let's move `useTheme` call to `AppShell`.

const appShellRegex = /function AppShell\(\) \{[\s\S]*?const \{ bootstrap, logout, user \} = useAuth\(\);/;
content = content.replace(appShellRegex, `function AppShell() {
  const { bootstrap, logout, user } = useAuth();
  const { theme, setTheme } = useTheme();`);

// Remove `const { theme, setTheme } = useTheme();` from `App` if it exists.
content = content.replace(/export default function App\(\) \{\n  const \{ theme, setTheme \} = useTheme\(\);\n/, 'export default function App() {\n');

fs.writeFileSync(appTsxPath, content);
console.log("Moved useTheme to AppShell");
