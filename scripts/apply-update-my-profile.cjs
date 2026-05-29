const fs = require('fs');
const path = require('path');

const cpPath = path.join(__dirname, '../packages/runtime/src/control-plane.ts');
let content = fs.readFileSync(cpPath, 'utf8');

// Also update the EVENTS Gateway spelling as we saw in the diff earlier
content = content.replace(/EventsGateway/g, "EVENTS Gateway");

const regex = /export async function updateMyProfile\(\n  dbInput: DatabaseBinding \| undefined,\n  userId: string,\n  input: \{ name\?: string; email\?: string; phone\?: string; password\?: string \}\n\) \{[\s\S]*?return \{ success: true \};\n\}/;

const replacement = `export async function updateMyProfile(
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

  return { success: true };
}`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(cpPath, content);
  console.log("Applied updateMyProfile securely!");
} else {
  console.log("Could not match updateMyProfile regex");
}
