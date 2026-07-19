import type { CheatSheetData } from "./types";

const linux: CheatSheetData = {
  title: "The Ultimate Linux Cheat Sheet",
  subtitle: "Filesystem & permissions · processes & signals · namespaces/cgroups · production hardening",
  sections: [
    {
      title: "Filesystem & Permissions",
      color: "violet",
      rows: [
        { term: "Single hierarchy, rooted at /", desc: "No drive letters -- everything mounts under one tree", code: "/etc config  /var logs  /home users  /proc kernel state" },
        { term: "Permission triads", desc: "owner / group / other, each read-write-execute", code: "rwxr-xr--  ->  owner: rwx, group: r-x, other: r--" },
        { term: "chmod / chown", desc: "Numeric or symbolic permission changes", code: "chmod 644 file; chmod +x script.sh; chown user:group file" },
        { term: "Everything is a file", desc: "Devices, sockets, even kernel state (/proc) are files", code: "cat /proc/meminfo; cat /proc/1234/status" },
      ],
    },
    {
      title: "Processes & Signals",
      color: "blue",
      rows: [
        { term: "fork() then exec()", desc: "Every new process = duplicate, then replace memory image", code: "// fork() duplicates the caller; exec() loads a new program into the copy" },
        { term: "SIGTERM vs SIGKILL", desc: "ALWAYS try graceful first -- SIGKILL cannot be caught or cleaned up after", code: "kill 1234       # SIGTERM -- catchable, allows cleanup\nkill -9 1234    # SIGKILL -- immediate, no cleanup possible" },
        { term: "ps / top / htop", desc: "See what's running and consuming CPU/memory right now", code: "ps aux --sort=-%mem | head" },
        { term: "Zombie processes", desc: "A parent that never calls wait() leaves a dead child lingering", code: "// Fix the parent's signal handling, or restart it to reap zombies" },
      ],
    },
    {
      title: "Text Processing (90% of log analysis)",
      color: "emerald",
      rows: [
        { term: "grep / sed / awk", desc: "Find, transform, and field-process text -- the core Unix toolkit", code: "grep -r 'ERROR' log/\nsed 's/foo/bar/g' file\nawk '{print $1, $3}' file" },
        { term: "Pipes compose small tools", desc: "Unix philosophy: do one thing well, chain freely", code: "cat access.log | grep ERROR | wc -l" },
      ],
    },
    {
      title: "The Container Foundation",
      color: "amber",
      rows: [
        { term: "Namespaces = isolation", desc: "PID, network, mount, UTS, IPC, user -- each 'private' per container", code: "// A container's PID 1 isn't the host's PID 1" },
        { term: "Cgroups = resource limits", desc: "How Docker/Kubernetes enforce CPU/memory limits, mechanically", code: "echo 536870912 > .../memory.limit_in_bytes   # 512MB" },
        { term: "Why containers beat VMs on startup speed", desc: "ONE shared host kernel, no separate guest OS boot", code: "// VMs boot a full separate kernel via a hypervisor -- containers don't" },
      ],
    },
    {
      title: "Memory: Free vs Available",
      color: "rose",
      rows: [
        { term: "Low 'free' memory is often FINE", desc: "Linux uses idle RAM as page cache -- instantly reclaimable", code: "free -h   # check the AVAILABLE column, not free" },
        { term: "Genuine pressure signal", desc: "Sustained SWAP usage under load, not low 'free'", code: "" },
      ],
    },
    {
      title: "Production Hardening & Debugging",
      color: "cyan",
      rows: [
        { term: "SSH hardening (non-negotiable)", desc: "Keys only, no root login, no password auth", code: "PasswordAuthentication no\nPermitRootLogin no" },
        { term: "Never run apps as root", desc: "Least privilege limits any vulnerability's blast radius", code: "sudo -u appuser ./app_server" },
        { term: "systemd basics", desc: "PID 1 -- starts services, restarts on failure, unifies logs", code: "systemctl status nginx; journalctl -u nginx -f" },
        { term: "Debugging escalation order", desc: "Start cheap, go deeper only as needed", code: "top/htop -> journalctl -> strace -> lsof -> dmesg" },
      ],
    },
  ],
};

export default linux;
