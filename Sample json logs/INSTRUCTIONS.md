# Loading Sample Data into HoneyBlock

**On your file manager, search `admin:/` so you can get admin privilege, then go to `/home/cowrie/cowrie/var/log/cowrie/` to find the `cowrie.json` and replace it with the prebuilt logs.**

---

Replaces Cowrie's log with pre-built attacker data so the dashboard fills up instantly.

> Requires HoneyBlock to already be installed.

## Steps

1. Open your distro's **file manager**.
2. In the address/search bar, type `admin:/` and press Enter — this opens the file manager with admin privileges.
3. Navigate to:
   ```
   /home/cowrie/cowrie/var/log/cowrie/
   ```
4. Replace `cowrie.json` in that folder with the `cowrie.json` from this Sample Data folder.

Refresh **http://localhost:5000** — the sample sessions should appear.

## Resetting back to a clean state

To wipe everything and start fresh, **delete the `cowrie.json`** in `/home/cowrie/cowrie/var/log/cowrie/` and re-download it from the main GitHub repo.
