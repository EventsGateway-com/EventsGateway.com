const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');       
let content = fs.readFileSync(appTsxPath, 'utf8');

const restorePanelRegex = /const restorePanel = \(panelId: string\) => \{[\s\S]*?return newState;\n    \}\);\n  \};/;

const newRestorePanel = `const restorePanel = (panelId: string) => {
    setClosedPanels(prev => {
      const newState = { ...prev, [panelId]: false };
      saveState({ closedPanels: newState });
      
      setLayouts((currentLayouts: any) => {
        const newLayouts = { ...currentLayouts };
        Object.keys(newLayouts).forEach(breakpoint => {
          newLayouts[breakpoint] = newLayouts[breakpoint].map((l: any) => {
            if (l.i === panelId) {
              const defaultHeight = (panelId === 'panel1' || panelId === 'panel2') ? 8 : 5;
              return { ...l, h: originalHeights[panelId] || defaultHeight };
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

content = content.replace(restorePanelRegex, newRestorePanel);
fs.writeFileSync(appTsxPath, content);
console.log("Updated restorePanel");

const stylesPath = path.join(__dirname, '../apps/dashboard/src/styles.css');
let stylesContent = fs.readFileSync(stylesPath, 'utf8');

// For the sidebar scroll issue, the problem is usually that the sidebar itself doesn't let the content flex properly, or it's wrapped in something that is not `display: flex; flex-direction: column`. Let's force it.
stylesContent += `
.eg-sidebar {
  display: flex !important;
  flex-direction: column !important;
  max-height: 100vh !important;
  overflow: hidden !important;
}
.eg-sidebar__content {
  flex: 1 !important;
  overflow-y: auto !important;
  min-height: 0 !important;
}
`;

fs.writeFileSync(stylesPath, stylesContent);
console.log("Updated sidebar styles");
