# Loading Sample Data into HoneyBlock

This folder contains `cowrie.json` — a sample log file with attacker sessions you can feed
into HoneyBlock to populate the dashboard without waiting for real attacks.

> **Heads up:** This only works **after** HoneyBlock is installed. See the
> [main README](../Honey/README.md) for install instructions.

## Where Cowrie writes its log

On a stock HoneyBlock install (Ubuntu 20.04+), Cowrie logs to:

```
/home/cowrie/cowrie/var/log/cowrie/cowrie.json
```

The HoneyBlock watcher service tails this file and pushes new lines into the dashboard.

## Option 1 — Append the sample data (recommended)

Appending plays nicely with the running watcher: each new line is parsed live, so
sessions, attackers, and the world map fill in as if real attacks were arriving.

```bash
# 1. Make sure the watcher is running
sudo systemctl status honeyblock-watcher

# 2. Append the sample log lines into Cowrie's log file
sudo tee -a /home/cowrie/cowrie/var/log/cowrie/cowrie.json < cowrie.json > /dev/null

# 3. Fix ownership (the cowrie user must own its log)
sudo chown cowrie:cowrie /home/cowrie/cowrie/var/log/cowrie/cowrie.json
```

Open **http://localhost:5000** — entries should appear within a few seconds.

## Option 2 — Replace the log file

Use this on a fresh install when you want *only* the sample data showing.

```bash
# 1. Stop the watcher so it doesn't read a half-written file
sudo systemctl stop honeyblock-watcher

# 2. Replace the log
sudo cp cowrie.json /home/cowrie/cowrie/var/log/cowrie/cowrie.json
sudo chown cowrie:cowrie /home/cowrie/cowrie/var/log/cowrie/cowrie.json

# 3. Reset the watcher's read position so it starts from line 1
sudo rm -f /opt/honeyblock/watcher.pos

# 4. (Optional) Wipe the database for a clean slate
sudo rm -f /opt/honeyblock/honeyblock.db

# 5. Start the watcher again
sudo systemctl start honeyblock-watcher
```

## Verifying it worked

```bash
# Tail the watcher log — you should see "Recorded ..." lines
sudo tail -f /opt/honeyblock/logs/watcher.log

# Or query the database directly
sqlite3 /opt/honeyblock/honeyblock.db \
  "SELECT COUNT(*) FROM attacker_session;"
```

Then refresh the dashboard at **http://localhost:5000**.

## Troubleshooting

- **Nothing appears on the dashboard** — check `sudo systemctl status honeyblock-watcher`.
  If it's not running, start it with `sudo systemctl start honeyblock-watcher`.
- **Permission denied writing the log** — you forgot `sudo`, or the `cowrie` user
  doesn't own the file. Re-run the `chown` step above.
- **Map shows no countries** — geolocation needs internet access; check `watcher.log`
  for `Geolocation failed` entries.
- **Sessions appear, but timestamps look old** — the sample data is dated
  March 2026. That's expected; HoneyBlock displays them as historical sessions.
