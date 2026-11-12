# Refresh Terminal Env

Installed a tool or changed `PATH` / environment variables on Windows, and VS Code's terminal still can't see it? This extension adds a **Refresh Env** button to the status bar that reloads the Windows environment (Machine + User) into VS Code, so you don't have to restart VS Code.

## Usage

- Click **Refresh Env** in the status bar, or run **Refresh Terminal Environment (PATH)** from the Command Palette.
- The current terminal is refreshed in place; if none is open, a fresh one is opened.
- All new terminals also start with the up-to-date environment.

## Requirements

- Windows with PowerShell (`powershell.exe`).

## Source

https://github.com/AbdulAhaadChohan/Refresh-ENV
