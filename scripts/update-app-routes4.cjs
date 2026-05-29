const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

const adminSitesPageRegex = /function AdminSitesPage\(\) \{[\s\S]*?(?=function ProtectedAdminOutlet)/;
const newAdminSitesPage = `function AdminSitesPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  const [siteDraft, setSiteDraft] = useState({
    name: "",
    domain: "",
    org_name: "",
    project_name: "",
    environment: "production"
  });
  const [domainDrafts, setDomainDrafts] = useState<Record<string, string>>({});
  const [descriptionDrafts, setDescriptionDrafts] = useState<Record<string, string>>({});
  const [keyLabelDrafts, setKeyLabelDrafts] = useState<Record<string, string>>({});
  const sitesQuery = useQuery({
    queryKey: qk.adminSites(),
    queryFn: dashboardApi.fetchAdminSites
  });
  const refreshAdminSites = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: qk.adminSites() }),
      queryClient.invalidateQueries({ queryKey: qk.adminOverview() })
    ]);
  };
  const createDomainMutation = useMutation({
    mutationFn: ({ siteId, input }: { siteId: string; input: { domain: string; description?: string } }) =>
      dashboardApi.createDomainForSite(siteId, input),
    onSuccess: async (_, variables) => {
      setError("");
      setDomainDrafts((current) => ({ ...current, [variables.siteId]: "" }));
      setDescriptionDrafts((current) => ({ ...current, [variables.siteId]: "" }));
      await refreshAdminSites();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to add domain.");
    }
  });
  const deleteDomainMutation = useMutation({
    mutationFn: ({ siteId, domainId }: { siteId: string; domainId: string }) => dashboardApi.deleteDomainForSite(siteId, domainId),
    onSuccess: async () => {
      setError("");
      await refreshAdminSites();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to delete domain.");
    }
  });
  const createSiteMutation = useMutation({
    mutationFn: (input: { name: string; domain?: string; org_name?: string; project_name?: string; environment?: string }) =>
      dashboardApi.createAdminSite(input),
    onSuccess: async () => {
      setError("");
      setSiteDraft({
        name: "",
        domain: "",
        org_name: "",
        project_name: "",
        environment: "production"
      });
      setIsPaneOpen(false);
      await refreshAdminSites();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to create site.");
    }
  });
  const deleteSiteMutation = useMutation({
    mutationFn: dashboardApi.deleteAdminSite,
    onSuccess: async () => {
      setError("");
      await refreshAdminSites();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to delete site.");
    }
  });
  const createKeyMutation = useMutation({
    mutationFn: ({ siteId, input }: { siteId: string; input: { label: string } }) => dashboardApi.createAdminSiteKey(siteId, input),
    onSuccess: async (_, variables) => {
      setError("");
      setKeyLabelDrafts((current) => ({ ...current, [variables.siteId]: "" }));
      await refreshAdminSites();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to create collector key.");
    }
  });
  const revokeKeyMutation = useMutation({
    mutationFn: ({ siteId, keyId }: { siteId: string; keyId: string }) => dashboardApi.revokeAdminSiteKey(siteId, keyId),
    onSuccess: async () => {
      setError("");
      await refreshAdminSites();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to revoke collector key.");
    }
  });

  function handleCreateSiteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const domain = siteDraft.domain.trim();
    createSiteMutation.mutate({
      name: siteDraft.name.trim(),
      domain: domain || undefined,
      org_name: siteDraft.org_name.trim() || undefined,
      project_name: siteDraft.project_name.trim() || undefined,
      environment: siteDraft.environment.trim() || undefined
    });
  }

  function handleAdminDomainSubmit(event: React.FormEvent<HTMLFormElement>, siteId: string) {
    event.preventDefault();
    setError("");
    const domain = (domainDrafts[siteId] ?? "").trim();
    const description = (descriptionDrafts[siteId] ?? "").trim();
    createDomainMutation.mutate({
      siteId,
      input: {
        domain,
        description: description || undefined
      }
    });
  }

  return (
    <div className="eg-page">
      <PageIntro
        title="Sites Admin"
        description="Inspect all tracked sites, manage their domains, review collector keys, and monitor total event activity."
        action={
          <button className="eg-button eg-button--primary" onClick={() => setIsPaneOpen(true)} type="button">
            Add Site
          </button>
        }
      />
      {error ? <p className="eg-form-error">{error}</p> : null}
      
      {!sitesQuery.data ? (
        <StateCard title="Loading sites" description="Fetching the global platform site inventory." />
      ) : (
        <section className="eg-stack">
          {sitesQuery.data.map((site) => (
            <SurfaceCard key={site.id} title={site.name} subtitle={\`\${site.org_name} · \${site.project_name} · \${site.id}\`}>
              <div className="eg-admin-site">
                <div className="eg-inline-actions">
                  <span className="eg-pill is-mono">{site.collector_url}</span>
                  <button
                    className="eg-button eg-button--compact"
                    disabled={deleteSiteMutation.isPending}
                    onClick={() => {
                      if(confirm("Are you sure you want to delete this site?")) {
                        deleteSiteMutation.mutate(site.id);
                      }
                    }}
                    type="button"
                  >
                    Delete site
                  </button>
                </div>
                <div className="eg-admin-site__meta">
                  <MetricMini label="Environment" value={site.environment} />
                  <MetricMini label="Domains" value={site.domain_count} />
                  <MetricMini label="API keys" value={site.api_key_count} />
                  <MetricMini label="Events" value={site.collected_event_count} />
                  <MetricMini label="Last event" value={formatDateTime(site.last_event_at)} />
                </div>
                <div className="eg-grid eg-grid--two">
                  <div className="eg-admin-panel">
                    <strong>Verified domains</strong>
                    <div className="eg-list">
                      {site.domains.map((domain) => (
                        <div className="eg-list__row" key={domain.id}>
                          <div>
                            <strong>{domain.domain}</strong>
                            <span>{domain.description ?? domain.kind}</span>
                          </div>
                          <div className="eg-inline-actions">
                            <StatusBadge status={domain.status === "verified" || domain.status === "internal" ? "healthy" : "pending"}>
                              {domain.status}
                            </StatusBadge>
                            {domain.domain !== "goldring.ro" && domain.domain !== "www.goldring.ro" ? (
                              <button
                                className="eg-button eg-button--compact"
                                disabled={deleteDomainMutation.isPending}
                                onClick={() => deleteDomainMutation.mutate({ siteId: site.id, domainId: domain.id })}
                                type="button"
                              >
                                Remove
                              </button>
                            ) : (
                              <span className="eg-pill">Protected</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <form className="eg-auth-form" onSubmit={(event) => handleAdminDomainSubmit(event, site.id)}>
                      <label className="eg-field">
                        <span>Add domain</span>
                        <input
                          className="eg-input"
                          onChange={(event) =>
                            setDomainDrafts((current) => ({
                              ...current,
                              [site.id]: event.target.value
                            }))}
                          placeholder="shop.example.com"
                          required
                          type="text"
                          value={domainDrafts[site.id] ?? ""}
                        />
                      </label>
                      <label className="eg-field">
                        <span>Description</span>
                        <input
                          className="eg-input"
                          onChange={(event) =>
                            setDescriptionDrafts((current) => ({
                              ...current,
                              [site.id]: event.target.value
                            }))}
                          placeholder="Regional storefront"
                          type="text"
                          value={descriptionDrafts[site.id] ?? ""}
                        />
                      </label>
                      <button
                        className="eg-button eg-button--primary"
                        disabled={createDomainMutation.isPending || (domainDrafts[site.id] ?? "").trim().length === 0}
                        type="submit"
                      >
                        {createDomainMutation.isPending ? "Saving domain..." : "Add domain"}
                      </button>
                    </form>
                  </div>
                  <div className="eg-admin-panel">
                    <strong>Collector keys</strong>
                    <div className="eg-list">
                      {site.api_keys.map((item) => {
                        const activeKeyCount = site.api_keys.filter((key) => key.status === "active").length;
                        return (
                          <div className="eg-list__row" key={item.id}>
                            <div>
                              <strong>{item.label}</strong>
                              <span>{item.public_key}</span>
                            </div>
                            <div className="eg-inline-actions">
                              <StatusBadge status={item.status === "active" ? "healthy" : "warning"}>{item.status}</StatusBadge>
                              {activeKeyCount > 1 ? (
                                <button
                                  className="eg-button eg-button--compact"
                                  disabled={revokeKeyMutation.isPending}
                                  onClick={() => revokeKeyMutation.mutate({ siteId: site.id, keyId: item.id })}
                                  type="button"
                                >
                                  Revoke
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <form
                      className="eg-auth-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        createKeyMutation.mutate({
                          siteId: site.id,
                          input: { label: (keyLabelDrafts[site.id] ?? "").trim() }
                        });
                      }}
                    >
                      <label className="eg-field">
                        <span>New key label</span>
                        <input
                          className="eg-input"
                          onChange={(event) =>
                            setKeyLabelDrafts((current) => ({
                              ...current,
                              [site.id]: event.target.value
                            }))}
                          placeholder="Mobile App Key"
                          required
                          type="text"
                          value={keyLabelDrafts[site.id] ?? ""}
                        />
                      </label>
                      <button
                        className="eg-button eg-button--primary"
                        disabled={createKeyMutation.isPending || (keyLabelDrafts[site.id] ?? "").trim().length === 0}
                        type="submit"
                      >
                        {createKeyMutation.isPending ? "Creating key..." : "Create key"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </section>
      )}

      <SidePane 
        isOpen={isPaneOpen} 
        onClose={() => setIsPaneOpen(false)} 
        title="Add Site" 
        subtitle="Register a new tracked site with its first collector key and optional primary domain"
      >
        <form className="eg-stack" onSubmit={handleCreateSiteSubmit}>
          <label className="eg-field">
            <span>Site name</span>
            <input
              className="eg-input"
              onChange={(event) => setSiteDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder="Main storefront"
              required
              type="text"
              value={siteDraft.name}
            />
          </label>
          <label className="eg-field">
            <span>Primary domain</span>
            <input
              className="eg-input"
              onChange={(event) => setSiteDraft((current) => ({ ...current, domain: event.target.value }))}
              placeholder="store.example.com"
              type="text"
              value={siteDraft.domain}
            />
          </label>
          <label className="eg-field">
            <span>Organization</span>
            <input
              className="eg-input"
              onChange={(event) => setSiteDraft((current) => ({ ...current, org_name: event.target.value }))}
              placeholder="Open Commerce Lab"
              type="text"
              value={siteDraft.org_name}
            />
          </label>
          <label className="eg-field">
            <span>Project</span>
            <input
              className="eg-input"
              onChange={(event) => setSiteDraft((current) => ({ ...current, project_name: event.target.value }))}
              placeholder="Events Core"
              type="text"
              value={siteDraft.project_name}
            />
          </label>
          <label className="eg-field">
            <span>Environment</span>
            <input
              className="eg-input"
              onChange={(event) => setSiteDraft((current) => ({ ...current, environment: event.target.value }))}
              placeholder="production"
              type="text"
              value={siteDraft.environment}
            />
          </label>
          <button
            className="eg-button eg-button--primary"
            disabled={createSiteMutation.isPending || siteDraft.name.trim().length < 2}
            type="submit"
          >
            {createSiteMutation.isPending ? "Creating site..." : "Create site"}
          </button>
        </form>
      </SidePane>
    </div>
  );
}
`;

content = content.replace(adminSitesPageRegex, newAdminSitesPage);
fs.writeFileSync(appTsxPath, content);
console.log("Moved Site creation to SidePane");
