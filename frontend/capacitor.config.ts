import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.gleasoncomparison.app',
  appName: 'Gleason Comparison',
  webDir: 'dist',
  server: { androidScheme: 'https' },
};

export default config;
