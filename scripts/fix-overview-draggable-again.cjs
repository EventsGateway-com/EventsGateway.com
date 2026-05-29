const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');       
let content = fs.readFileSync(appTsxPath, 'utf8');

// The ReactGridLayout component does not support resize on custom elements inside easily unless we pass the ref correctly.
// But ReactGridLayout injects the resize handle automatically if we don't hide it.
// Previously we hid it with CSS because it was ugly. Let's just restore the default resize handle and style it nicely, or use the custom resize handle properly by using the `resizeHandle` prop on ResponsiveGridLayout!

const gridLayoutRegex = /<ResponsiveGridLayout[\s\S]*?onLayoutChange=\{handleLayoutChange\}\s*>/;
const newGridLayout = `<ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={20}
          draggableHandle=".drag-handle"
          onLayoutChange={handleLayoutChange}
          resizeHandle={
            <div className="react-resizable-handle" style={{ position: 'absolute', bottom: '8px', right: '8px', cursor: 'nwse-resize', color: 'var(--eg-muted)', zIndex: 10 }}>
              <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="21 15 21 21 15 21"></polyline><line x1="21" y1="21" x2="13" y2="13"></line></svg>
            </div>
          }
        >`;

if (gridLayoutRegex.test(content)) {
  content = content.replace(gridLayoutRegex, newGridLayout);
} else {
  console.log("Could not find grid layout to replace");
}

// Fix the restore height bug:
// When restoring a panel, the layout state wasn't being correctly updated or it was restoring to 1 row.
// Let's check `restorePanel` in `app.tsx`

const restorePanelRegex = /const restorePanel = \(panelId: string\) => \{[\s\S]*?return newState;\n    \}\);\n  \};/;
const newRestorePanel = `const restorePanel = (panelId: string) => {
    setClosedPanels(prev => {
      const newState = { ...prev, [panelId]: false };
      saveState({ closedPanels: newState });
      
      // Also restore the layout height if it was crushed
      setLayouts((currentLayouts: any) => {
        const newLayouts = { ...currentLayouts };
        Object.keys(newLayouts).forEach(breakpoint => {
          newLayouts[breakpoint] = newLayouts[breakpoint].map((l: any) => {
            if (l.i === panelId) {
              return { ...l, h: originalHeights[panelId] || 5 };
            }
            return l;
          });
        });
        saveState({ layouts: newLayouts });
        return newLayouts;
      });
      
      return newState;
    });
  };`;

if (restorePanelRegex.test(content)) {
  content = content.replace(restorePanelRegex, newRestorePanel);
}

// Also remove our custom resize handle from DraggablePanel since we pass it to the grid now
const customResizeHandleRegex = /\{!isMinimized && \(\n\s*<div className="eg-draggable-panel__resize-handle"[\s\S]*?<\/div>\n\s*\)\}/;
if (customResizeHandleRegex.test(content)) {
  content = content.replace(customResizeHandleRegex, '');
}

fs.writeFileSync(appTsxPath, content);
console.log("Fixed Overview resize and restore bugs");

// Restore the styles.css for the resize handle so it's not hidden
const stylesCssPath = path.join(__dirname, '../apps/dashboard/src/styles.css');
let stylesContent = fs.readFileSync(stylesCssPath, 'utf8');

stylesContent = stylesContent.replace(/\.react-resizable-handle \{ opacity: 0; \}/g, '.react-resizable-handle { opacity: 1; }');

// For the sidebar scroll issue inside the app:
const sidebarScrollRegex = /\.eg-sidebar__content \{\s*gap: 1rem;\s*overflow-y: auto;\s*padding-bottom: 2rem;\s*\}/g;
stylesContent = stylesContent.replace(sidebarScrollRegex, `.eg-sidebar__content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 2rem;
    height: 100%;
    overscroll-behavior: contain;
  }`);

fs.writeFileSync(stylesCssPath, stylesContent);
console.log("Fixed styles.css for resize handle and sidebar scroll");
