# vite-plugin-ssh-tunnel

[![NPM Version](https://img.shields.io/npm/v/vite-plugin-ssh-tunnel)](https://www.npmjs.com/package/vite-plugin-ssh-tunnel)

Vite plugin to set up a reverse SSH tunnel for reverse proxies

## Installation

```bash
npm install vite-plugin-ssh-tunnel
```

## Usage

`vite.config.js`
```javascript
import { defineConfig } from 'vite';
import { sshTunnel } from 'vite-plugin-ssh-tunnel';

export default defineConfig({
    plugins: [
        sshTunnel({
            username: 'tunnel', 
            host: 'tunnel.example.com', 
            privateKey: '/homes/user/.ssh/id_rsa',
        })
    ]
});
```

## Options

### `username: string`
The username for the SSH connection.

### `host: string`
The host for the SSH connection.

### `privateKey: string`
The path to the private key for the SSH connection.

### `remotePort?: number`
The remote port to forward to. Defaults to 3000.

### `proxyUrl?: string`
The URL of the reverse proxy server. Defaults to 'https://{host}'.
