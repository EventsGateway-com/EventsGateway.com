const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// 1. Replace login/auth redirects to overview with /app/sites
content = content.replace(/<Navigate replace to=\{sitePath\("overview"\)\} \/>/g, '<Navigate replace to="/app/sites" />');
content = content.replace(/window\.location\.assign\(sitePath\("overview"\)\);/g, 'window.location.assign("/app/sites");');
content = content.replace(/<Navigate replace to=\{user \? sitePath\("overview"\) : "\/login"\} \/>/g, '<Navigate replace to={user ? "/app/sites" : "/login"} />');

// 2. Remove "Publish routing changes" from Navbar
content = content.replace(/<div className="eg-sidebar__footer">[\s\S]*?<\/div>\s*<\/div>\s*<\/aside>/, `</div>\n      </aside>`);

// 3. Remove unnecessary pills from Topbar and add Profile Menu & Site Selector
// I will locate the AppShell's Topbar and replace it.
const topbarRegex = /<header className="eg-topbar">[\s\S]*?<\/header>/;
const newTopbar = `<header className="eg-topbar">
          <div className="eg-topbar__primary">
            <button
              aria-label="Toggle navigation"
              className="eg-mobile-nav-toggle"
              onClick={() => setIsSidebarOpen(true)}
              type="button"
            >
              Menu
            </button>
            <div>
              <h1>{bootstrap?.site.name ?? currentContext.siteName}</h1>
            </div>
          </div>
          <div className="eg-topbar__controls" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <select
              className="eg-input"
              style={{ minHeight: "2rem", padding: "0.2rem 1.5rem 0.2rem 0.5rem", width: "auto" }}
              value={bootstrap?.site.id || ""}
              onChange={(e) => {
                const s = bootstrap?.accessible_sites.find(x => x.id === e.target.value);
                if (s) window.location.assign(\`/app/orgs/\${s.org_id}/projects/\${s.project_id}/sites/\${s.id}/overview\`);
              }}
            >
              {bootstrap?.accessible_sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div style={{ position: "relative" }} className="eg-profile-menu-container">
              <button
                className="eg-button eg-button--compact"
                type="button"
                onClick={() => {
                  const m = document.getElementById("profile-dropdown");
                  if(m) m.style.display = m.style.display === "none" ? "block" : "none";
                }}
              >
                {user?.name || user?.email}
              </button>
              <div
                id="profile-dropdown"
                style={{
                  display: "none", position: "absolute", top: "100%", right: 0, marginTop: "0.5rem",
                  background: "var(--eg-bg-elevated)", border: "1px solid var(--eg-border)",
                  borderRadius: "0.5rem", padding: "0.5rem", minWidth: "150px", zIndex: 100,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                }}
              >
                <div style={{ padding: "0.5rem", borderBottom: "1px solid var(--eg-border)", marginBottom: "0.5rem" }}>
                  <strong style={{ display: "block" }}>{user?.name}</strong>
                  <small style={{ color: "var(--eg-muted)" }}>{user?.email}</small>
                </div>
                {user?.role === "global_admin" && (
                  <NavLink className="eg-nav-link" style={{ display: "block", marginBottom: "0.5rem" }} to="/admin/overview">
                    Platform Admin
                  </NavLink>
                )}
                <NavLink className="eg-nav-link" style={{ display: "block", marginBottom: "0.5rem" }} to="/app/profile">
                  My Profile
                </NavLink>
                <button
                  className="eg-button eg-button--compact"
                  style={{ width: "100%", textAlign: "left", background: "transparent", border: "none" }}
                  onClick={() => { logout(); window.location.assign("/login"); }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>`;

content = content.replace(topbarRegex, newTopbar);

// 4. Update Admin Outlet
// Remove from AppShell
const appShellRoutesRegex = /<Route element=\{<ProtectedAdminOutlet \/>\}>[\s\S]*?<\/Route>/;
content = content.replace(appShellRoutesRegex, "");

// Write back
fs.writeFileSync(appTsxPath, content);
console.log("Replaced basics in app.tsx");
