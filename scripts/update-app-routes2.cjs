const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// Adăugăm SidePane la importuri, dacă nu există
if (!content.includes('import { SidePane } from "./side-pane";')) {
  content = content.replace('import { useAuth } from "./auth";', 'import { useAuth } from "./auth";\nimport { SidePane } from "./side-pane";');
}

// Inserăm noile componente înainte de export default function App()
const newComponents = `
function SiteSelectorPage() {
  const { bootstrap, user } = useAuth();
  if (!user || !bootstrap) return <Navigate replace to="/login" />;

  return (
    <div className="eg-auth-shell" style={{ alignItems: "flex-start", paddingTop: "4rem" }}>
      <div style={{ width: "min(100%, 800px)", display: "grid", gap: "2rem" }}>
        <header>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Select a site</h1>
          <p style={{ color: "var(--eg-muted)" }}>Choose a site to access its control plane.</p>
        </header>
        <div className="eg-grid eg-grid--two">
          {bootstrap.accessible_sites.map(site => (
            <a 
              key={site.id} 
              href={\`/app/orgs/\${site.org_id}/projects/\${site.project_id}/sites/\${site.id}/overview\`}
              className="eg-card"
              style={{ display: "block", textDecoration: "none", transition: "transform 0.2s" }}
            >
              <h3 style={{ margin: "0 0 0.5rem", color: "var(--eg-accent)" }}>{site.name}</h3>
              <p style={{ color: "var(--eg-muted)", fontSize: "0.9rem", margin: 0 }}>{site.org_name} · {site.project_name}</p>
              <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--eg-subtle)" }}>
                Role: {site.role}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function MyProfilePage() {
  const { user, bootstrap } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      await dashboardApi.updateMyProfile({ name, email, phone, password });
      setMessage("Profile updated successfully.");
      if (password) {
        window.location.assign("/login");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="eg-page">
      <PageIntro title="My Profile" description="Manage your personal account details." />
      <SurfaceCard title="Personal Information">
        <form onSubmit={handleSubmit} className="eg-stack" style={{ maxWidth: "400px" }}>
          <label className="eg-field">
            <span>Name</span>
            <input className="eg-input" type="text" value={name} onChange={e => setName(e.target.value)} required />
          </label>
          <label className="eg-field">
            <span>Email</span>
            <input className="eg-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label className="eg-field">
            <span>Phone</span>
            <input className="eg-input" type="text" value={phone} onChange={e => setPhone(e.target.value)} />
          </label>
          <label className="eg-field">
            <span>New Password (optional)</span>
            <input className="eg-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
          </label>
          {message && <p className={message.includes("success") ? "eg-form-success" : "eg-form-error"}>{message}</p>}
          <button className="eg-button eg-button--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      </SurfaceCard>
    </div>
  );
}

function ProtectedAdminShell() {
  const { user } = useAuth();
  if (!user || user.role !== "global_admin") return <Navigate replace to="/app/sites" />;
  
  return (
    <div className="eg-shell">
      <aside className="eg-sidebar is-open" style={{ transform: "none", position: "sticky", top: 0, height: "100dvh", float: "left" }}>
        <div className="eg-brand">
          <div className="eg-brand__mark">EG</div>
          <div><strong>Platform Admin</strong></div>
        </div>
        <div className="eg-sidebar__content">
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <NavLink className={({ isActive }) => \`eg-nav-link\${isActive ? " is-active" : ""}\`} to="/admin/overview">Overview</NavLink>
            <NavLink className={({ isActive }) => \`eg-nav-link\${isActive ? " is-active" : ""}\`} to="/admin/billing">Billing</NavLink>
            <NavLink className={({ isActive }) => \`eg-nav-link\${isActive ? " is-active" : ""}\`} to="/admin/users">Users</NavLink>
            <NavLink className={({ isActive }) => \`eg-nav-link\${isActive ? " is-active" : ""}\`} to="/admin/sites">Sites</NavLink>
            <div style={{ marginTop: "2rem" }}>
              <NavLink className="eg-nav-link" to="/app/sites">← Back to Sites</NavLink>
            </div>
          </nav>
        </div>
      </aside>
      <div className="eg-main">
        <header className="eg-topbar">
          <div className="eg-topbar__primary"><h1>Global Administration</h1></div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
`;

content = content.replace('export default function App() {', newComponents + '\nexport default function App() {');

// Injectăm rutele noi în Routes
const routesRegex = /<Route path="\/app\/orgs\/:orgId\/projects\/:projectId\/sites\/:siteId" element=\{<ProtectedAppShell \/>\}>/;
const newRoutes = `<Route path="/app/sites" element={<SiteSelectorPage />} />
      <Route path="/admin" element={<ProtectedAdminShell />}>
        <Route index element={<Navigate replace to="overview" />} />
        <Route path="overview" element={<AdminOverviewPage />} />
        <Route path="billing" element={<AdminBillingPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="sites" element={<AdminSitesPage />} />
      </Route>
      <Route path="/app/orgs/:orgId/projects/:projectId/sites/:siteId" element={<ProtectedAppShell />}>
        <Route path="profile" element={<MyProfilePage />} />`;

content = content.replace(routesRegex, newRoutes);

// Fix fallback route to /app/sites
content = content.replace(/<Route path="\*" element=\{<Navigate replace to=\{user \? sitePath\("overview"\) : "\/login"\} \/>\} \/>/g, '<Route path="*" element={<Navigate replace to={user ? "/app/sites" : "/login"} />} />');

fs.writeFileSync(appTsxPath, content);
console.log("Added new pages and routes in app.tsx");
