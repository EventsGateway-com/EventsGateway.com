const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');       
let content = fs.readFileSync(appTsxPath, 'utf8');

const draggablePanelRegex = /function DraggablePanel\(\{ title, children, isMinimized, onToggleMinimize \}: \{ title: string; children: React\.ReactNode; isMinimized: boolean; onToggleMinimize: \(\) => void \}\) \{[\s\S]*?(?=function OverviewPage\(\) \{)/;

const newDraggablePanel = `function DraggablePanel({ title, children, isMinimized, onToggleMinimize, onClose }: { title: string; children: React.ReactNode; isMinimized: boolean; onToggleMinimize: () => void; onClose: () => void }) {
  return (
    <div className={\`eg-draggable-panel \${isMinimized ? 'is-minimized' : ''}\`} style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--eg-bg-elevated)', border: '1px solid var(--eg-border)', borderRadius: 'var(--eg-radius-lg)', overflow: 'hidden', zIndex: 1, position: 'relative' }}>
      <div className="eg-draggable-panel__header drag-handle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: isMinimized ? 'none' : '1px solid var(--eg-border)', cursor: 'grab', background: 'rgba(255,255,255,0.02)', userSelect: 'none' }}>
        <strong style={{ fontSize: '0.95rem', fontWeight: 600 }}>{title}</strong>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={onToggleMinimize} style={{ background: 'transparent', border: 'none', color: 'var(--eg-muted)', cursor: 'pointer' }}>
            {isMinimized ? (
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            )}
          </button>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--eg-muted)', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
      {!isMinimized && (
        <div className="eg-draggable-panel__content" style={{ padding: '1rem', flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      )}
      {!isMinimized && (
        <div className="eg-draggable-panel__resize-handle" style={{ position: 'absolute', bottom: '4px', right: '4px', cursor: 'nwse-resize', color: 'var(--eg-muted)' }}>
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="21 15 21 21 15 21"></polyline><line x1="21" y1="21" x2="13" y2="13"></line></svg>
        </div>
      )}
    </div>
  );
}

`;

content = content.replace(draggablePanelRegex, newDraggablePanel);

const overviewBodyRegex = /const defaultLayouts = \{[\s\S]*?(?=function RealtimePage\(\))/;

const newOverviewBody = `const STORAGE_KEY = "eg_dashboard_overview_state";

  const defaultLayouts = {
    lg: [
      { i: 'metric1', x: 0, y: 0, w: 3, h: 5 },
      { i: 'metric2', x: 3, y: 0, w: 3, h: 5 },
      { i: 'metric3', x: 6, y: 0, w: 3, h: 5 },
      { i: 'metric4', x: 9, y: 0, w: 3, h: 5 },
      { i: 'panel1', x: 0, y: 5, w: 6, h: 10 },
      { i: 'panel2', x: 6, y: 5, w: 6, h: 10 }
    ]
  };
  
  const [layouts, setLayouts] = useState<any>(defaultLayouts);
  const [minimizedPanels, setMinimizedPanels] = useState<Record<string, boolean>>({});
  const [closedPanels, setClosedPanels] = useState<Record<string, boolean>>({});
  const [originalHeights, setOriginalHeights] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(\`\${STORAGE_KEY}_\${currentContext.siteId}\`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.layouts) setLayouts(parsed.layouts);
        if (parsed.minimizedPanels) setMinimizedPanels(parsed.minimizedPanels);
        if (parsed.closedPanels) setClosedPanels(parsed.closedPanels);
        if (parsed.originalHeights) setOriginalHeights(parsed.originalHeights);
      }
    } catch (err) {
      // ignore
    }
  }, [currentContext.siteId]);

  const saveState = (newState: any) => {
    try {
      const current = localStorage.getItem(\`\${STORAGE_KEY}_\${currentContext.siteId}\`);
      const parsed = current ? JSON.parse(current) : {};
      localStorage.setItem(\`\${STORAGE_KEY}_\${currentContext.siteId}\`, JSON.stringify({ ...parsed, ...newState }));
    } catch (err) {
      // ignore
    }
  };

  const handleLayoutChange = (currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    saveState({ layouts: allLayouts });
  };

  const toggleMinimize = (panelId: string) => {
    setMinimizedPanels(prev => {
      const isCurrentlyMinimized = !!prev[panelId];
      const newMinimizedState = { ...prev, [panelId]: !isCurrentlyMinimized };
      
      setLayouts((currentLayouts: any) => {
        const newLayouts = { ...currentLayouts };
        let newHeights = { ...originalHeights };
        
        Object.keys(newLayouts).forEach(breakpoint => {
          newLayouts[breakpoint] = newLayouts[breakpoint].map((l: any) => {
            if (l.i === panelId) {
              if (!isCurrentlyMinimized) {
                // We are minimizing, save the current height
                newHeights[panelId] = l.h;
                return { ...l, h: 2 }; // exactly 2 rows for title bar
              } else {
                // We are restoring, use saved height or default
                return { ...l, h: newHeights[panelId] || 5 };
              }
            }
            return l;
          });
        });
        
        setOriginalHeights(newHeights);
        saveState({ layouts: newLayouts, originalHeights: newHeights });
        return newLayouts;
      });
      
      saveState({ minimizedPanels: newMinimizedState });
      return newMinimizedState;
    });
  };

  const closePanel = (panelId: string) => {
    setClosedPanels(prev => {
      const newState = { ...prev, [panelId]: true };
      saveState({ closedPanels: newState });
      return newState;
    });
  };

  const restorePanel = (panelId: string) => {
    setClosedPanels(prev => {
      const newState = { ...prev, [panelId]: false };
      saveState({ closedPanels: newState });
      return newState;
    });
  };

  if (!overviewQuery.data) return <StateCard title="Loading overview" description="Building the latest metrics snapshot." />;

  const allPanels = [
    { id: 'metric1', title: 'Events per minute', content: <><div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{overviewQuery.data.ingestPerMinute}</div><div style={{ color: 'var(--eg-muted)' }}>Current ingest lane</div></> },
    { id: 'metric2', title: 'Matched rate', content: <><div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{overviewQuery.data.matchedRate}%</div><div style={{ color: 'var(--eg-muted)' }}>Events that resolve into at least one route</div></> },
    { id: 'metric3', title: 'Delivery success', content: <><div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{overviewQuery.data.deliverySuccess}%</div><div style={{ color: 'var(--eg-muted)' }}>Last 24h delivery performance</div></> },
    { id: 'metric4', title: 'Queue depth', content: <><div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{overviewQuery.data.queueDepth}</div><div style={{ color: 'var(--eg-muted)' }}>Forwarder backlog</div></> },
    { id: 'panel1', title: 'Top signals', content: <div className="eg-list">{overviewQuery.data.topSignals.map((signal) => (<div className="eg-list__row" key={signal.label}><div><strong>{signal.label}</strong><span>{signal.value.toLocaleString()} events</span></div><StatusBadge status="healthy">{signal.delta}</StatusBadge></div>))}</div> },
    { id: 'panel2', title: 'Routing state', content: <div className="eg-stack"><div className="eg-stat-line"><span>Compiled version</span><strong>v{overviewQuery.data.compiledVersion}</strong></div><div className="eg-stat-line"><span>Active routes</span><strong>{overviewQuery.data.activeRoutes}</strong></div><div className="eg-stat-line"><span>Pipeline posture</span><strong>Collect once, route everywhere</strong></div></div> }
  ];

  const closedPanelObjects = allPanels.filter(p => closedPanels[p.id]);

  return (
    <div className="eg-page" style={{ paddingBottom: closedPanelObjects.length > 0 ? '4rem' : '1rem' }}>
      <PageIntro
        title="Overview"
        description="Central view for ingestion, matching, delivery success and active routing state."
      />
      <div style={{ margin: '0 -10px' }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={20}
          draggableHandle=".drag-handle"
          onLayoutChange={handleLayoutChange}
        >
          {allPanels.filter(p => !closedPanels[p.id]).map(p => (
            <div key={p.id}>
              <DraggablePanel title={p.title} isMinimized={!!minimizedPanels[p.id]} onToggleMinimize={() => toggleMinimize(p.id)} onClose={() => closePanel(p.id)}>
                {p.content}
              </DraggablePanel>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {closedPanelObjects.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '0.75rem', background: 'var(--eg-bg-elevated)', borderTop: '1px solid var(--eg-border)', display: 'flex', gap: '0.5rem', zIndex: 100, alignItems: 'center' }}>
          <strong style={{ fontSize: '0.85rem', color: 'var(--eg-muted)', marginRight: '1rem' }}>Hidden panels:</strong>
          {closedPanelObjects.map(p => (
            <button key={p.id} className="eg-button eg-button--compact" onClick={() => restorePanel(p.id)} type="button">
              {p.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
`;

content = content.replace(overviewBodyRegex, newOverviewBody);

fs.writeFileSync(appTsxPath, content);
console.log("Updated app.tsx issues for Draggable panels");

const stylesCssPath = path.join(__dirname, '../apps/dashboard/src/styles.css');
let stylesContent = fs.readFileSync(stylesCssPath, 'utf8');

// Hide default react-resizable handle since we use custom SVG
if (!stylesContent.includes('.react-resizable-handle')) {
  stylesContent += `\n\n.react-resizable-handle { opacity: 0; }\n`;
  stylesContent += `.react-grid-item.react-draggable-dragging { user-select: none; }\n`;
}

fs.writeFileSync(stylesCssPath, stylesContent);
console.log("Updated styles.css issues for resizable");
