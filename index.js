import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import pc from 'picocolors';
import { quote } from "shell-quote";

const tmpFolderPath = join(tmpdir(), 'vite-plugin-ssh-tunnel');

mkdirSync(tmpFolderPath, { recursive: true });

const socketPath = join(tmpFolderPath, 'socket');

const closeTunnel = () => {
    if (existsSync(socketPath)) {
        execSync(`ssh -S ${socketPath} -O exit dummy.com`);
    }
};

/**
 * Create a plugin that creates an SSH tunnel to a remote server.
 * @param {import('./index.d.ts').Config} config - The configuration object for the plugin.
 * @returns {import('vite').Plugin}
 */
export const sshTunnel = (config) => ({
    name: 'ssh-tunnel', configureServer(server) {
        const { httpServer } = server;

        const log = (color, message) => {
            server.config.logger.info(pc.magenta('  ➜') + pc.magenta('  tunnel: ') + pc[color](message));
        }

        httpServer?.on('listening', async () => {
            const address = httpServer.address();

            if (address === null || typeof address === 'string') {
                return;
            }

            const privateKey = resolve(config.privateKey);

            if (!existsSync(privateKey)) {
                log('red', `Private key file not found: ${config.privateKey}`);
                return;
            }

            const port = address.port;
            const remotePort = Math.min(Math.max(Number.isInteger(config.remotePort) ? config.remotePort : 3000, 1), 65535);
            const username = quote(config.username);
            const host = quote(config.host);

            closeTunnel();

            execSync(`ssh -i ${privateKey} -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -f -N -M -S ${socketPath} -R 0.0.0.0:${remotePort}:localhost:${port} ${username}@${host}`);

            log('cyan', config.proxyUrl ?? `https://${config.host}`);
        });

        httpServer?.on('close', () => {
            closeTunnel();
            log('red', 'closed');
        });
    }
});
