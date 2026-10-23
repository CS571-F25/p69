"""Zip the built web app into worker/bundles/ and record it in worker/bundle.json.

Usage: python make-bundle.py <version> [--builtin]
  --builtin  marks this bundle as the one embedded in the next native store build,
             so devices still on the built-in bundle are not asked to re-download it.
"""
import hashlib
import json
import os
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOCS = os.path.join(ROOT, "docs")
BUNDLES = os.path.join(ROOT, "worker", "bundles")
MANIFEST = os.path.join(ROOT, "worker", "bundle.json")
KEEP = 2

version = sys.argv[1]
mark_builtin = "--builtin" in sys.argv
name = f"trickskicalc-{version}.zip"
out = os.path.join(BUNDLES, name)

with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(DOCS):
        for f in sorted(files):
            p = os.path.join(root, f)
            z.write(p, os.path.relpath(p, DOCS).replace(os.sep, "/"))

sha = hashlib.sha256()
with open(out, "rb") as fh:
    for chunk in iter(lambda: fh.read(1 << 20), b""):
        sha.update(chunk)

with open(MANIFEST, encoding="utf-8") as fh:
    manifest = json.load(fh)
manifest.update({"version": version, "file": name, "checksum": sha.hexdigest()})
if mark_builtin:
    manifest["builtinVersion"] = version
with open(MANIFEST, "w", encoding="utf-8", newline="\n") as fh:
    json.dump(manifest, fh, indent=2)
    fh.write("\n")

zips = sorted(
    (f for f in os.listdir(BUNDLES) if f.endswith(".zip")),
    key=lambda f: os.path.getmtime(os.path.join(BUNDLES, f)),
)
for old in zips[:-KEEP]:
    os.remove(os.path.join(BUNDLES, old))

print(f"bundle {name} ({os.path.getsize(out) / 1e6:.1f} MB) sha256 {manifest['checksum'][:12]}…")
