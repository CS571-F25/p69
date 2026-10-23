// Live-update endpoint for @capgo/capacitor-updater running in self-hosted mode.
// The app POSTs its platform, native version and current bundle version; we
// reply with the latest bundle from bundle.json or an "up to date" response.
import latest from "../bundle.json";

const parseVersion = (v) => String(v || "0").split(".").map((n) => parseInt(n, 10) || 0);

function versionAtLeast(a, b) {
  const [x, y] = [parseVersion(a), parseVersion(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] || 0) - (y[i] || 0);
    if (d !== 0) return d > 0;
  }
  return true;
}

const upToDate = (version) => ({ kind: "up_to_date", error: "no_new_version", message: "No new version available", version });

export async function handleUpdateCheck(request, origin) {
  let info = {};
  try {
    info = await request.json();
  } catch {
    return { error: "bad_request", message: "Expected JSON body", kind: "failed" };
  }

  const current = info.version_name || "builtin";

  // Debug builds from Android Studio / Xcode keep whatever web code they were
  // built with, so local testing is never overwritten by a published bundle.
  if (info.is_prod === false) return upToDate(current);
  if (!latest.version || !latest.file) return upToDate(current);
  if (!versionAtLeast(info.version_build, latest.minNative)) return upToDate(current);
  if (current === latest.version) return upToDate(current);
  if (current === "builtin" && latest.version === latest.builtinVersion) return upToDate(current);

  return {
    version: latest.version,
    url: `${origin}/${latest.file}`,
    checksum: latest.checksum,
  };
}
