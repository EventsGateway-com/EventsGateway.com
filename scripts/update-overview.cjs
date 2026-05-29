const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');       
let content = fs.readFileSync(appTsxPath, 'utf8');

// Add imports if not present
if (!content.includes('react-grid-layout')) {
  const importStatement = `import { Responsive, WidthProvider } from "react-grid-layout";\nimport "react-grid-layout/css/styles.css";\nimport "react-resizable/css/styles.css";\n`;
  content = content.replace(/import \{.*?\} from "react";/, match => importStatement + match);
}

const overviewRegex = /function OverviewPage\(\) \{[\s\S]*?(?=function RealtimePage\(\))/;

const newOverviewPage = `const ResponsiveGridLayout = WidthProvider(Responsive);

function DraggablePanel({ title, children, onRemove }: { title: string; children: React.ReactNode; onRemove?: () => void }) {
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  
  return (
    <div className={\`eg-draggable-panel \${maximized ? 'is-maximized' : ''} \${minimized ? 'is-minimized' : ''}\`} style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--eg-bg-elevated)', border: '1px solid var(--eg-border)', borderRadius: 'var(--eg-radius-lg)', overflow: maximized ? 'auto' : 'hidden', zIndex: maximized ? 1000 : 1, position: maximized ? 'fixed' : 'relative', top: maximized ? '2rem' : 'auto', left: maximized ? '2rem' : 'auto', right: maximized ? '2rem' : 'auto', bottom: maximized ? '2rem' : 'auto' }}>
      <div className="eg-draggable-panel__header drag-handle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: minimized ? 'none' : '1px solid var(--eg-border)', cursor: 'move', background: 'rgba(255,255,255,0.02)' }}>
        <strong style={{ fontSize: '0.95rem', fontWeight: 600 }}>{title}</strong>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={() => setMinimized(!minimized)} style={{ background: 'transparent', border: 'none', color: 'var(--eg-muted)', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          {!minimized && (
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
      {!minimized && (
        <div className="eg-draggable-panel__content" style={{ padding: '1rem', flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function OverviewPage() {
  const overviewQuery = useQuery({
    queryKey: qk.overview(currentContext.siteId, currentContext.dateRange),
    queryFn: dashboardApi.fetchOverview
  });

  const [layouts, setLayouts] = useState({
    lg: [
      { i: 'metric1', x: 0, y: 0, w: 3, h: 4 },
      { i: 'metric2', x: 3, y: 0, w: 3, h: 4 },
      { i: 'metric3', x: 6, y: 0, w: 3, h: 4 },
      { i: 'metric4', x: 9, y: 0, w: 3, h: 4 },
      { i: 'panel1', x: 0, y: 4, w: 6, h: 8 },
      { i: 'panel2', x: 6, y: 4, w: 6, h: 8 }
    ]
  });

  if (!overviewQuery.data) return <StateCard title="Loading overview" description="Building the latest metrics snapshot." />;

  return (
    <div className="eg-page">
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
          rowHeight={30}
          draggableHandle=".drag-handle"
          onLayoutChange={(currentLayout, allLayouts) => setLayouts(allLayouts)}
        >
          <div key="metric1">
            <DraggablePanel title="Events per minute">
              <div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{overviewQuery.data.ingestPerMinute}</div>
              <div style={{ color: 'var(--eg-muted)' }}>Current ingest lane</div>
            </DraggablePanel>
          </div>
          <div key="metric2">
            <DraggablePanel title="Matched rate">
              <div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{overviewQuery.data.matchedRate}%</div>
              <div style={{ color: 'var(--eg-muted)' }}>Events that resolve into at least one route</div>
            </DraggablePanel>
          </div>
          <div key="metric3">
            <DraggablePanel title="Delivery success">
              <div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{overviewQuery.data.deliverySuccess}%</div>
              <div style={{ color: 'var(--eg-muted)' }}>Last 24h delivery performance</div>
            </DraggablePanel>
          </div>
          <div key="metric4">
            <DraggablePanel title="Queue depth">
              <div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{overviewQuery.data.queueDepth}</div>
              <div style={{ color: 'var(--eg-muted)' }}>Forwarder backlog</div>
            </DraggablePanel>
          </div>
          
          <div key="panel1">
            <DraggablePanel title="Top signals">
              <div className="eg-list">
                {overviewQuery.data.topSignals.map((signal) => (
                  <div className="eg-list__row" key={signal.label}>
                    <div>
                      <strong>{signal.label}</strong>
                      <span>{signal.value.toLocaleString()} events</span>      
                    </div>
                    <StatusBadge status="healthy">{signal.delta}</StatusBadge> 
                  </div>
                ))}
              </div>
            </DraggablePanel>
          </div>

          <div key="panel2">
            <DraggablePanel title="Routing state">
              <div className="eg-stack">
                <div className="eg-stat-line">
                  <span>Compiled version</span>
                  <strong>v{overviewQuery.data.compiledVersion}</strong>       
                </div>
                <div className="eg-stat-line">
                  <span>Active routes</span>
                  <strong>{overviewQuery.data.activeRoutes}</strong>
                </div>
                <div className="eg-stat-line">
                  <span>Pipeline posture</span>
                  <strong>Collect once, route everywhere</strong>
                </div>
              </div>
            </DraggablePanel>
          </div>
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
`;

content = content.replace(overviewRegex, newOverviewPage);
fs.writeFileSync(appTsxPath, content);
console.log("Updated OverviewPage with DraggablePanel and Grid");
