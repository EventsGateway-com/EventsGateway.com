const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// 1. Eliminarea referintelor la Publish din UI

// Sterg apelurile de mutatie Publish
content = content.replace(/const publishRoutesMutation = useMutation\(\{[\s\S]*?\}\);/g, "");
content = content.replace(/await queryClient\.invalidateQueries\(\{ queryKey: qk\.routeVersions\(currentContext\.siteId\) \}\);/g, "");

// In OverviewPage (daca exista "Routing state" cumva desi e posibil sa fi fost doar in topbar)
const routingStateRegex = /<SurfaceCard title="Routing state"[\s\S]*?<\/SurfaceCard>/;
content = content.replace(routingStateRegex, "");

// Scot butoanele de "Publish routing changes"
const publishButtonRegex = /<button[^>]*?onClick=\{\(\) => publishRoutesMutation\.mutate\(\)\}[^>]*?>[\s\S]*?<\/button>/g;
content = content.replace(publishButtonRegex, "");
const publishButtonRegex2 = /<button[^>]*?disabled=\{publishRoutesMutation\.isPending\}[^>]*?onClick=\{\(\) => publishRoutesMutation\.mutate\(\)\}[^>]*?>[\s\S]*?<\/button>/g;
content = content.replace(publishButtonRegex2, "");
const publishTextBtnRegex = /<button[^>]*?>[^<]*?Publish routing changes[^<]*?<\/button>/g;
content = content.replace(publishTextBtnRegex, "");

content = content.replace(/const routeVersionsQuery = useQuery\(\{[^\}]*?qk\.routeVersions[\s\S]*?\}\);/g, "");

// 2. Modificari in AdminUsersPage
const adminUsersPageRegex = /function AdminUsersPage\(\) \{[\s\S]*?(?=function AdminSitesPage)/;
const newAdminUsersPage = `function AdminUsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    phone: "",
    role: "member" as "member" | "global_admin",
    status: "active" as "active" | "blocked",
    password: ""
  });

  const usersQuery = useQuery({
    queryKey: qk.adminUsers(),
    queryFn: dashboardApi.fetchAdminUsers
  });

  const refreshAdminQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: qk.adminUsers() }),
      queryClient.invalidateQueries({ queryKey: qk.adminOverview() })
    ]);
  };

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: any }) =>
      dashboardApi.updateAdminUserRecord(userId, input),
    onSuccess: async () => {
      setError("");
      setSuccess("User updated successfully.");
      setIsPaneOpen(false);
      await refreshAdminQueries();
    },
    onError: (mutationError) => {
      setSuccess("");
      setError(mutationError instanceof Error ? mutationError.message : "Unable to update user.");
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) => dashboardApi.updateAdminUserPassword(userId, password),
    onSuccess: async () => {
      setError("");
      setSuccess("Password updated successfully.");
      await refreshAdminQueries();
    },
    onError: (mutationError) => {
      setSuccess("");
      setError(mutationError instanceof Error ? mutationError.message : "Unable to reset password.");
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: dashboardApi.deleteAdminUserRecord,
    onSuccess: async () => {
      setError("");
      setSuccess("User deleted successfully.");
      await refreshAdminQueries();
    },
    onError: (mutationError) => {
      setSuccess("");
      setError(mutationError instanceof Error ? mutationError.message : "Unable to delete user.");
    }
  });

  function openEdit(u: any) {
    setEditingUserId(u.id);
    setDraft({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role,
      status: u.status,
      password: ""
    });
    setError("");
    setSuccess("");
    setIsPaneOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUserId) return;
    
    updateUserMutation.mutate({
      userId: editingUserId,
      input: {
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        role: draft.role,
        status: draft.status
      }
    });

    if (draft.password) {
      updatePasswordMutation.mutate({ userId: editingUserId, password: draft.password });
    }
  }

  return (
    <div className="eg-page">
      <PageIntro
        title="Users Admin"
        description="Global directory of all dashboard accounts across the platform."
      />
      {error && <p className="eg-form-error">{error}</p>}
      {success && <p className="eg-form-success">{success}</p>}
      
      {!usersQuery.data ? (
        <StateCard title="Loading users" description="Fetching the global platform user directory." />
      ) : (
        <SurfaceCard title="Platform accounts" subtitle="Every registered dashboard user across all sites">
          <div className="eg-stack">
            {usersQuery.data.map((u) => (
              <div className="eg-admin-user" key={u.id}>
                <div className="eg-admin-user__meta">
                  <ActionLine title="Name" text={u.name} />
                  <ActionLine title="Email" text={u.email} />
                  <ActionLine title="Phone" text={u.phone || "—"} />
                  <ActionLine title="Role" text={u.role} />
                  <ActionLine title="Status" text={u.status} />
                  <ActionLine title="Created" text={formatDateTime(u.created_at)} />
                  <ActionLine title="Last login" text={formatDateTime(u.last_login_at)} />
                  <ActionLine title="Sessions" text={String(u.session_count)} />
                </div>
                <div className="eg-admin-user__actions">
                  <button className="eg-button eg-button--compact" onClick={() => openEdit(u)} type="button">
                    Edit user
                  </button>
                  {u.id !== user?.id && (
                    <button
                      className="eg-button eg-button--compact"
                      disabled={deleteUserMutation.isPending}
                      onClick={() => {
                        if(confirm("Are you sure you want to delete this user?")) {
                          deleteUserMutation.mutate(u.id);
                        }
                      }}
                      type="button"
                    >
                      Delete user
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      )}

      <SidePane 
        isOpen={isPaneOpen} 
        onClose={() => setIsPaneOpen(false)} 
        title="Edit User" 
        subtitle="Modify user details, role, status or password."
      >
        <form onSubmit={handleSave} className="eg-stack">
          <label className="eg-field">
            <span>Name</span>
            <input className="eg-input" type="text" value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} required />
          </label>
          <label className="eg-field">
            <span>Email</span>
            <input className="eg-input" type="email" value={draft.email} onChange={e => setDraft({...draft, email: e.target.value})} required />
          </label>
          <label className="eg-field">
            <span>Phone</span>
            <input className="eg-input" type="text" value={draft.phone} onChange={e => setDraft({...draft, phone: e.target.value})} />
          </label>
          <label className="eg-field">
            <span>Role</span>
            <select className="eg-input" value={draft.role} onChange={e => setDraft({...draft, role: e.target.value as any})}>
              <option value="member">Member</option>
              <option value="global_admin">Global Admin</option>
            </select>
          </label>
          <label className="eg-field">
            <span>Status</span>
            <select className="eg-input" value={draft.status} onChange={e => setDraft({...draft, status: e.target.value as any})}>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>
          <label className="eg-field">
            <span>New Password (optional)</span>
            <input className="eg-input" type="password" value={draft.password} onChange={e => setDraft({...draft, password: e.target.value})} />
          </label>
          <button className="eg-button eg-button--primary" type="submit" disabled={updateUserMutation.isPending || updatePasswordMutation.isPending}>
            {updateUserMutation.isPending || updatePasswordMutation.isPending ? "Saving..." : "Save user"}
          </button>
        </form>
      </SidePane>
    </div>
  );
}

`;

content = content.replace(adminUsersPageRegex, newAdminUsersPage);

fs.writeFileSync(appTsxPath, content);
console.log("Applied UI cleanups and AdminUsers edit feature.");
