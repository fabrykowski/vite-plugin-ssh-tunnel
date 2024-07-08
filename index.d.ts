import type { Plugin } from 'vite';

/**
 * The configuration object for the plugin.
 */
type Config = {
    /**
     * The username for the SSH connection.
     */
    username: string;
    /**
     * The host for the SSH connection.
     */
    host: string;
    /**
     * The path to the private key for the SSH connection.
     */
    privateKey: string;
    /**
     * The remote port to forward to. Defaults to 3000.
     */
    remotePort?: number;
    /**
     * The URL of the reverse proxy server. Defaults to 'https://{host}'.
     */
    proxyUrl?: string;
};

/**
 * Create a plugin that sets up a reverse SSH tunnel to a remote server.
 */
export const sshTunnel: (config: Config) => Plugin;
