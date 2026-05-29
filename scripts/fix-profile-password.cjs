const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../apps/dashboard/src/app.tsx');       
let content = fs.readFileSync(appTsxPath, 'utf8');

const profilePageRegex = /function MyProfilePage\(\) \{[\s\S]*?(?=function ProtectedAdminShell\(\))/;

const newProfilePage = `function MyProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");

  const updateProfileMutation = useMutation({
    mutationFn: () => dashboardApi.updateMyProfile({ name, email, phone }),
    onSuccess: () => {
      setError("");
      setNotice("Profile details updated.");
      setTimeout(() => setNotice(""), 3000);
    },
    onError: (err) => {
      setNotice("");
      setError(err instanceof Error ? err.message : "Unable to update profile.");
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: () => dashboardApi.updateMyProfile({ password: newPassword, current_password: currentPassword }),
    onSuccess: () => {
      setPasswordError("");
      setPasswordNotice("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordNotice(""), 3000);
    },
    onError: (err) => {
      setPasswordNotice("");
      setPasswordError(err instanceof Error ? err.message : "Unable to update password.");
    }
  });

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfileMutation.mutate();
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    updatePasswordMutation.mutate();
  }

  return (
    <div className="eg-page">
      <PageIntro title="My Profile" description="Manage your personal account details and security credentials." />
      
      <div className="eg-grid eg-grid--two">
        <SurfaceCard title="Personal Information" subtitle="Update your contact details and display name.">
          {error ? <p className="eg-form-error">{error}</p> : null}
          {notice ? <p className="eg-form-notice" style={{ color: "var(--eg-healthy)" }}>{notice}</p> : null}
          <form className="eg-stack" onSubmit={handleProfileSubmit}>
            <label className="eg-field">
              <span>Full name</span>
              <input className="eg-input" type="text" value={name} onChange={e => setName(e.target.value)} required />
            </label>
            <label className="eg-field">
              <span>Email address</span>
              <input className="eg-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </label>
            <label className="eg-field">
              <span>Phone number</span>
              <input className="eg-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </label>
            <button className="eg-button eg-button--primary" type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
            </button>
          </form>
        </SurfaceCard>

        <SurfaceCard title="Security" subtitle="Change your account password.">
          {passwordError ? <p className="eg-form-error">{passwordError}</p> : null}
          {passwordNotice ? <p className="eg-form-notice" style={{ color: "var(--eg-healthy)" }}>{passwordNotice}</p> : null}
          <form className="eg-stack" onSubmit={handlePasswordSubmit}>
            <label className="eg-field">
              <span>Current password</span>
              <input className="eg-input" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            </label>
            <label className="eg-field">
              <span>New password</span>
              <input className="eg-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </label>
            <label className="eg-field">
              <span>Confirm new password</span>
              <input className="eg-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </label>
            <button className="eg-button eg-button--primary" type="submit" disabled={updatePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}>
              {updatePasswordMutation.isPending ? "Updating..." : "Update password"}
            </button>
          </form>
        </SurfaceCard>
      </div>
    </div>
  );
}
`;

content = content.replace(profilePageRegex, newProfilePage);
fs.writeFileSync(appTsxPath, content);
console.log("Updated MyProfilePage with separate password section");
