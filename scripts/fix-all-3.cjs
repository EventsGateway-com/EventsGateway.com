const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');       
let content = fs.readFileSync(appTsxPath, 'utf8');

const navLinkRenderRegex = /<NavLink\s*className=\{\(\{ isActive \}\) => \`eg-nav-link\$\{isActive \? " is-active" : ""\}\`\}\s*key=\{item\.href\}\s*to=\{item\.href\}\s*>\s*\{item\.icon && <span className="eg-nav-link__icon">\{item\.icon\}<\/span>\}\s*\{item\.label\}\s*<\/NavLink>/g;

// Fix syntax error in App component where the closing tags were broken
// It seems there was an issue around line 335 with a missing or extra tag.
// Let's find the Sidebar component definition and make sure it's valid.

// Look for <aside className={`eg-sidebar${isSidebarOpen ? " is-open" : ""}`} id="dashboard-navigation">
// and its closing tag.
const sidebarRegex = /<aside className=\{\`eg-sidebar\$\{isSidebarOpen \? " is-open" : ""\}\`\} id="dashboard-navigation">[\s\S]*?<\/aside>/;

const newSidebar = `<aside className={\`eg-sidebar\${isSidebarOpen ? " is-open" : ""}\`} id="dashboard-navigation">
        <div className="eg-brand">
          <div className="eg-brand__mark">EG</div>
          <div>
            <strong>EVENTS Gateway</strong>
            <span>Control center</span>
          </div>
          <button
            aria-label="Close navigation"
            className="eg-sidebar__close"
            onClick={() => setIsSidebarOpen(false)}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="eg-sidebar__content">
          {navGroups.map((group) => (
            <div className="eg-sidebar__group" key={group.label}>
              <p>{group.label}</p>
              <nav>
                {group.items.map((item) => (
                  <NavLink
                    className={({ isActive }) => \`eg-nav-link\${isActive ? " is-active" : ""}\`}
                    key={item.href}
                    to={item.href}
                  >
                    {item.icon && <span className="eg-nav-link__icon">{item.icon}</span>}
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>`;

content = content.replace(sidebarRegex, newSidebar);
fs.writeFileSync(appTsxPath, content);
console.log("Fixed App syntax");
