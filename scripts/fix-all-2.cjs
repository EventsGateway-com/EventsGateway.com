const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');       
let content = fs.readFileSync(appTsxPath, 'utf8');

// 1. Update DraggablePanel properly 
// Fix syntax issues and ensure it renders properly
const draggablePanelRegex = /function DraggablePanel\(\{ title, children, onRemove \}: \{ title: string; children: React\.ReactNode; onRemove\?: \(\) => void \}\) \{[\s\S]*?(?=function OverviewPage\(\) \{)/;

// Note: it seems DraggablePanel signature was changed in the previous step. We need to match the new one if we want to replace it again.
const currentDraggablePanelRegex = /function DraggablePanel\(\{ title, children, isMinimized, onToggleMinimize \}: \{ title: string; children: React\.ReactNode; isMinimized: boolean; onToggleMinimize: \(\) => void \}\) \{[\s\S]*?(?=function OverviewPage\(\) \{)/;

const newDraggablePanel = `function DraggablePanel({ title, children, isMinimized, onToggleMinimize }: { title: string; children: React.ReactNode; isMinimized: boolean; onToggleMinimize: () => void }) {
  const [maximized, setMaximized] = useState(false);
  
  return (
    <div className={\`eg-draggable-panel \${maximized ? 'is-maximized' : ''} \${isMinimized ? 'is-minimized' : ''}\`} style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--eg-bg-elevated)', border: '1px solid var(--eg-border)', borderRadius: 'var(--eg-radius-lg)', overflow: maximized ? 'auto' : 'hidden', zIndex: maximized ? 1000 : 1, position: maximized ? 'fixed' : 'relative', top: maximized ? '2rem' : 'auto', left: maximized ? '2rem' : 'auto', right: maximized ? '2rem' : 'auto', bottom: maximized ? '2rem' : 'auto' }}>
      <div className="eg-draggable-panel__header drag-handle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: isMinimized ? 'none' : '1px solid var(--eg-border)', cursor: 'move', background: 'rgba(255,255,255,0.02)' }}>
        <strong style={{ fontSize: '0.95rem', fontWeight: 600 }}>{title}</strong>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={onToggleMinimize} style={{ background: 'transparent', border: 'none', color: 'var(--eg-muted)', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          {!isMinimized && (
            <button type="button" onClick={() => setMaximized(!maximized)} style={{ background: 'transparent', border: 'none', color: 'var(--eg-muted)', cursor: 'pointer' }}>
              {maximized ? (
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
              )}
            </button>
          )}
        </div>
      </div>
      {!isMinimized && (
        <div className="eg-draggable-panel__content" style={{ padding: '1rem', flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      )}
    </div>
  );
}

`;
if(currentDraggablePanelRegex.test(content)) {
  content = content.replace(currentDraggablePanelRegex, newDraggablePanel);
} else if (draggablePanelRegex.test(content)) {
  content = content.replace(draggablePanelRegex, newDraggablePanel);
}

// Write app.tsx changes back
fs.writeFileSync(appTsxPath, content);
console.log("Updated app.tsx issues");

// Now update styles for sidebar scroll again, specifically checking for the media query rule
const stylesCssPath = path.join(__dirname, '../apps/dashboard/src/styles.css');
let stylesContent = fs.readFileSync(stylesCssPath, 'utf8');

// Ensure overflow-y: auto is applied to the main content div of sidebar in both base and media query
const sidebarContentRegex = /\.eg-sidebar__content \{[\s\S]*?\}/;
stylesContent = stylesContent.replace(sidebarContentRegex, `.eg-sidebar__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.8rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 2rem;
  -webkit-overflow-scrolling: touch;
}`);

const desktopSidebarContentRegex = /\.eg-sidebar__content \{\s*gap: 1rem;\s*overflow-y: auto;\s*padding-bottom: 0;\s*\}/;
if (desktopSidebarContentRegex.test(stylesContent)) {
  stylesContent = stylesContent.replace(desktopSidebarContentRegex, `.eg-sidebar__content {
    gap: 1rem;
    overflow-y: auto;
    padding-bottom: 2rem;
  }`);
} else {
  // If the old one was still there
  const oldDesktopSidebarContentRegex = /\.eg-sidebar__content \{\s*gap: 1rem;\s*overflow: visible;\s*padding-bottom: 0;\s*\}/;
  stylesContent = stylesContent.replace(oldDesktopSidebarContentRegex, `.eg-sidebar__content {
    gap: 1rem;
    overflow-y: auto;
    padding-bottom: 2rem;
  }`);
}

fs.writeFileSync(stylesCssPath, stylesContent);
console.log("Updated styles.css issues");
