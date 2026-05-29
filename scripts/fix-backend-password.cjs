const fs = require('fs');
const path = require('path');

const cpPath = path.join(__dirname, '../packages/runtime/src/control-plane.ts');
let content = fs.readFileSync(cpPath, 'utf8');

const updateProfileRegex = /export async function updateMyProfile\([\s\S]*?\}\n\nexport async function adminSetUserPassword/m;

const newUpdateProfile = `export async function updateMyProfile(
  dbInput: DatabaseBinding | undefined,
  userId: string,
  input: { name?: string; email?: string; phone?: string; password?: string; current_password?: string }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const target = await firstRecord(
    db,
    "SELECT id, name, email, phone, password_hash FROM dashboard_users WHERE id = ? LIMIT 1",
    userId
  );
  if (!target) {
    throw new Error("User not found.");
  }

  if (input.password) {
    if (!input.current_password) {
      throw new Error("Current password is required to set a new password.");
    }
    const isValid = await verifyPassword(input.current_password, asString(target.password_hash));
    if (!isValid) {
      throw new Error("Current password is incorrect.");
    }
    
    if (input.password.length < 8) {
      throw new Error("New password must be at least 8 characters long.");
    }
    const hash = await hashPassword(input.password);
    await db
      .prepare("UPDATE dashboard_users SET password_hash = ?, password_changed_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(hash, userId)
      .run();
  }

  const nextName = input.name?.trim() || asString(target.name);
  const nextEmail = input.email ? normalizeEmail(input.email) : asString(target.email);
  const nextPhone = input.phone !== undefined ? input.phone.trim() : asNullableString(target.phone);

  await db
    .prepare("UPDATE dashboard_users SET name = ?, email = ?, phone = ? WHERE id = ?")
    .bind(nextName, nextEmail, nextPhone || null, userId)
    .run();

  return { updated: true };
}

export async function adminSetUserPassword`;

content = content.replace(updateProfileRegex, newUpdateProfile);
fs.writeFileSync(cpPath, content);
console.log("Updated updateMyProfile to require current password");
