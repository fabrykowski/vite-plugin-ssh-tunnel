import pc from 'picocolors';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';

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
export const sshTunnel = (config) =>
    ({
        name: 'ssh-tunnel',
        configureServer(server) {
            const { httpServer } = server;

            httpServer?.on('listening', async () => {
                const address = httpServer.address();

                if (address === null || typeof address === 'string') {
                    return;
                }

                const port = address.port;

                closeTunnel();

                execSync(
                    `ssh -i ${config.privateKey} -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -f -N -M -S ${socketPath} -R 0.0.0.0:${config.remotePort ?? 3000}:localhost:${port} ${config.username}@${config.host}`
                );

                server.config.logger.info(
                    pc.magenta('  ➜') + pc.magenta('  tunnel: ') + pc.cyan(config.proxyUrl ?? `https://${config.host}`)
                );
            });

            httpServer?.on('close', () => {
                closeTunnel();
                server.config.logger.info(pc.magenta('  ➜') + pc.magenta('  tunnel: ') + pc.red('closed'));
            });
        }
    });
