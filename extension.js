const vscode = require('vscode');
const { execFile } = require('child_process');
const path = require('path');

const READ = "$r=@{Machine=[Environment]::GetEnvironmentVariables('Machine');User=[Environment]::GetEnvironmentVariables('User')};$r|ConvertTo-Json -Compress";

function readRegistryEnv() {
  return new Promise((resolve, reject) => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', READ], { windowsHide: true }, (err, out) => {
      if (err) return reject(err);
      try { resolve(JSON.parse(out)); } catch (e) { reject(e); }
    });
  });
}

// Push fresh registry env into VS Code so every NEW terminal starts with it.
async function applyEnv(context) {
  const { Machine: m, User: u } = await readRegistryEnv();
  const merged = { ...m, ...u };
  const pathKey = Object.keys(m).find(k => k.toLowerCase() === 'path') || 'Path';
  const uPath = Object.keys(u).find(k => k.toLowerCase() === 'path');
  merged[pathKey] = [m[pathKey], uPath ? u[uPath] : ''].filter(Boolean).join(';');
  const col = context.environmentVariableCollection;
  col.clear();
  let n = 0;
  for (const [k, v] of Object.entries(merged)) {
    const cur = Object.entries(process.env).find(([ck]) => ck.toLowerCase() === k.toLowerCase());
    if (!cur || cur[1] !== v) { col.replace(k, String(v)); n++; }
  }
  return n;
}

function activate(context) {
  applyEnv(context).catch(() => {});

  const run = vscode.commands.registerCommand('refreshTerminalEnv.run', async () => {
    try {
      await applyEnv(context);
      const t = vscode.window.activeTerminal;
      if (t) {
        // Run refresh.ps1 inside the CURRENT terminal, then clear so nothing stays visible.
        const script = path.join(context.extensionPath, 'refresh.ps1');
        t.sendText(`. '${script}'; Clear-Host`, true);
        vscode.window.setStatusBarMessage('Env refreshed in current terminal', 3000);
      } else {
        vscode.window.createTerminal().show();
        vscode.window.setStatusBarMessage('Env refreshed - new terminal opened', 3000);
      }
    } catch (e) {
      vscode.window.showErrorMessage('Refresh Env failed: ' + e.message);
    }
  });

  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
  item.text = '$(refresh) Refresh Env';
  item.tooltip = 'Reload PATH/env from Windows and open a fresh terminal';
  item.command = 'refreshTerminalEnv.run';
  item.show();
  context.subscriptions.push(run, item);
}
function deactivate() {}
module.exports = { activate, deactivate };
