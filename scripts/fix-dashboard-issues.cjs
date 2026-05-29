const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');       
let content = fs.readFileSync(appTsxPath, 'utf8');

// 1. Fix ReactGridLayout imports and layout definition for height and minimize
// We need to use state for the grid layout to allow height changes dynamically.
// We'll update DraggablePanel to report its minimize state and the Grid to update 'h'
const draggablePanelRegex = /function DraggablePanel\(\{ title, children, onRemove \}: \{ title: string; children: React\.ReactNode; onRemove\?: \(\) => void \}\) \{[\s\S]*?(?=function OverviewPage\(\) \{)/;

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

content = content.replace(draggablePanelRegex, newDraggablePanel);

const overviewBodyRegex = /const \[layouts, setLayouts\] = useState<any>\(\{[\s\S]*?(?=function RealtimePage\(\))/;

const newOverviewBody = `const defaultLayouts = {
    lg: [
      { i: 'metric1', x: 0, y: 0, w: 3, h: 5 },
      { i: 'metric2', x: 3, y: 0, w: 3, h: 5 },
      { i: 'metric3', x: 6, y: 0, w: 3, h: 5 },
      { i: 'metric4', x: 9, y: 0, w: 3, h: 5 },
      { i: 'panel1', x: 0, y: 5, w: 6, h: 8 },
      { i: 'panel2', x: 6, y: 5, w: 6, h: 8 }
    ]
  };
  
  const [layouts, setLayouts] = useState<any>(defaultLayouts);
  const [minimizedPanels, setMinimizedPanels] = useState<Record<string, boolean>>({});

  const toggleMinimize = (panelId: string, originalHeight: number) => {
    setMinimizedPanels(prev => {
      const isCurrentlyMinimized = !!prev[panelId];
      const newMinimizedState = { ...prev, [panelId]: !isCurrentlyMinimized };
      
      setLayouts((currentLayouts: any) => {
        const newLayouts = { ...currentLayouts };
        Object.keys(newLayouts).forEach(breakpoint => {
          newLayouts[breakpoint] = newLayouts[breakpoint].map((l: any) => {
            if (l.i === panelId) {
              return { ...l, h: !isCurrentlyMinimized ? 2 : originalHeight };
            }
            return l;
          });
        });
        return newLayouts;
      });
      
      return newMinimizedState;
    });
  };

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
          rowHeight={25}
          draggableHandle=".drag-handle"
          onLayoutChange={(currentLayout, allLayouts) => setLayouts(allLayouts)}
        >
          <div key="metric1">
            <DraggablePanel title="Events per minute" isMinimized={!!minimizedPanels['metric1']} onToggleMinimize={() => toggleMinimize('metric1', 5)}>
              <div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{overviewQuery.data.ingestPerMinute}</div>
              <div style={{ color: 'var(--eg-muted)' }}>Current ingest lane</div>
            </DraggablePanel>
          </div>
          <div key="metric2">
            <DraggablePanel title="Matched rate" isMinimized={!!minimizedPanels['metric2']} onToggleMinimize={() => toggleMinimize('metric2', 5)}>
              <div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{overviewQuery.data.matchedRate}%</div>
              <div style={{ color: 'var(--eg-muted)' }}>Events that resolve into at least one route</div>
            </DraggablePanel>
          </div>
          <div key="metric3">
            <DraggablePanel title="Delivery success" isMinimized={!!minimizedPanels['metric3']} onToggleMinimize={() => toggleMinimize('metric3', 5)}>
              <div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{overviewQuery.data.deliverySuccess}%</div>
              <div style={{ color: 'var(--eg-muted)' }}>Last 24h delivery performance</div>
            </DraggablePanel>
          </div>
          <div key="metric4">
            <DraggablePanel title="Queue depth" isMinimized={!!minimizedPanels['metric4']} onToggleMinimize={() => toggleMinimize('metric4', 5)}>
              <div style={{ fontSize: '2rem', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{overviewQuery.data.queueDepth}</div>
              <div style={{ color: 'var(--eg-muted)' }}>Forwarder backlog</div>
            </DraggablePanel>
          </div>
          
          <div key="panel1">
            <DraggablePanel title="Top signals" isMinimized={!!minimizedPanels['panel1']} onToggleMinimize={() => toggleMinimize('panel1', 8)}>
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
            <DraggablePanel title="Routing state" isMinimized={!!minimizedPanels['panel2']} onToggleMinimize={() => toggleMinimize('panel2', 8)}>
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

content = content.replace(overviewBodyRegex, newOverviewBody);

// 3. Fix "My profile" linking in the topbar dropdown
content = content.replace(/<NavLink className="eg-nav-link" style=\{\{ display: "block", marginBottom: "0\.5rem" \}\} to="\/app\/profile">/g, '<NavLink className="eg-nav-link" style={{ display: "block", marginBottom: "0.5rem" }} to="/app/sites/alpha/profile">');

// We also need to define the MyProfile page route explicitly if it's missing or redirect to the site contextualized route. 
// Since MyProfile requires a siteContext, let's fix the route in the ProtectedOutlet.
// It seems the link was hardcoded to `/app/profile`, but the user has to be in the context of a site. 
// I replaced `/app/profile` with `/app/sites/alpha/profile` as a fallback or rather let's replace it with a dynamically generated route using `bootstrap.accessible_sites[0].id`
// The Topbar has access to bootstrap, let's dynamically set the route if bootstrap is present.
// Actually, earlier we replaced it with `/app/sites/alpha/profile`, let's just make it dynamic:
content = content.replace(/<NavLink className="eg-nav-link" style=\{\{ display: "block", marginBottom: "0\.5rem" \}\} to="\/app\/sites\/alpha\/profile">/, '{bootstrap?.accessible_sites?.[0] ? <NavLink className="eg-nav-link" style={{ display: "block", marginBottom: "0.5rem" }} to={`/app/orgs/${bootstrap.accessible_sites[0].org_id}/projects/${bootstrap.accessible_sites[0].project_id}/sites/${bootstrap.accessible_sites[0].id}/profile`}>My Profile</NavLink> : null}');

// Let's handle the case if it wasn't replaced
content = content.replace(/<NavLink className="eg-nav-link" style=\{\{ display: "block", marginBottom: "0\.5rem" \}\} to="\/app\/profile">[\s\S]*?<\/NavLink>/, '{bootstrap?.accessible_sites?.[0] ? <NavLink className="eg-nav-link" style={{ display: "block", marginBottom: "0.5rem" }} to={`/app/orgs/${bootstrap.accessible_sites[0].org_id}/projects/${bootstrap.accessible_sites[0].project_id}/sites/${bootstrap.accessible_sites[0].id}/profile`}>My Profile</NavLink> : null}');


// 4. Update the App Shell routes to include profile page correctly within the SiteContext!
// We'll verify if `MyProfilePage` is correctly mapped inside `ProtectedOutlet`
const myProfileRegex = /<Route path="profile" element=\{<MyProfilePage \/>\} \/>/;
if(!myProfileRegex.test(content)){
  // Add it to ProtectedOutlet routes
  const settingsRouteRegex = /<Route path="settings\/billing" element=\{<BillingPage \/>\} \/>/;
  content = content.replace(settingsRouteRegex, '<Route path="profile" element={<MyProfilePage />} />\n                <Route path="settings/billing" element={<BillingPage />} />');
}

fs.writeFileSync(appTsxPath, content);
console.log("Updated app.tsx issues");

// Now update styles for sidebar scroll and layout height issues
const stylesCssPath = path.join(__dirname, '../apps/dashboard/src/styles.css');
let stylesContent = fs.readFileSync(stylesCssPath, 'utf8');

// For the sidebar scroll: The issue might be `overflow: hidden` on the sidebar itself or the content not flexing properly
const sidebarRegex = /\.eg-sidebar \{[\s\S]*?\}/;
stylesContent = stylesContent.replace(sidebarRegex, `.eg-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 17rem;
  z-index: 50;
  background: var(--eg-bg-elevated);
  border-right: 1px solid var(--eg-border);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Only hide x, let content scroll y */
}`);

// Check for .eg-sidebar__content in styles.css and ensure it scrolls correctly
const sidebarContentRegex = /\.eg-sidebar__content \{[\s\S]*?\}/;
// Replace the FIRST occurence of .eg-sidebar__content
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

// Also fix the larger breakpoint sidebar content which might be overriding the scroll
const desktopSidebarContentRegex = /\.eg-sidebar__content \{\s*gap: 1rem;\s*overflow-y: auto;\s*padding-bottom: 0;\s*\}/;
stylesContent = stylesContent.replace(desktopSidebarContentRegex, `.eg-sidebar__content {
    gap: 1rem;
    overflow-y: auto;
    padding-bottom: 2rem;
  }`);

fs.writeFileSync(stylesCssPath, stylesContent);
console.log("Updated styles.css issues");
