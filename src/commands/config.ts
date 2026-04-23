import { Command } from 'commander';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import chalk from 'chalk';

const homeDir = os.homedir();
const configPath = path.join(homeDir, '.multi-model-receipts.config.json');

const defaultConfig = {
  version: '1.0.0',
  providers: {},
  defaults: {
    output: 'html',
    period: 'month',
    currency: 'USD',
    timezone: 'Asia/Shanghai',
    openBrowser: true,
  },
  customBranding: null,
  qrImagePath: null,
};

export const configCommand = new Command('config')
  .description('Manage configuration')
  .option('--show', 'Show current configuration')
  .option('--set <key=value>', 'Set a configuration value (e.g., openai.key=sk-xxx)')
  .option('--reset', 'Reset to defaults')
  .action(async (options) => {
    let config = defaultConfig;

    // Load existing config
    if (await fs.pathExists(configPath)) {
      config = await fs.readJson(configPath);
    }

    if (options.reset) {
      await fs.remove(configPath);
      console.log('✅ Configuration reset to defaults.');
      return;
    }

    if (options.show) {
      console.log('\n📋 Current Configuration\n');
      console.log(chalk.bold('Config path:'), configPath);
      console.log();
      console.log(chalk.bold('Providers:'));
      if (config.providers && Object.keys(config.providers).length > 0) {
        for (const [provider, settings] of Object.entries(config.providers)) {
          const key = (settings as any)?.apiKey;
          if (key) {
            const masked = key.slice(0, 8) + '...' + key.slice(-4);
            console.log(`  ${provider}: ${chalk.green(masked)}`);
          } else {
            console.log(`  ${provider}: ${chalk.yellow('(not set)')}`);
          }
        }
      } else {
        console.log('  (none configured)');
      }
      console.log();
      console.log(chalk.bold('Defaults:'));
      console.log(`  output: ${config.defaults?.output || 'html'}`);
      console.log(`  period: ${config.defaults?.period || 'month'}`);
      console.log(`  currency: ${config.defaults?.currency || 'USD'}`);
      console.log(`  timezone: ${config.defaults?.timezone || 'Asia/Shanghai'}`);
      console.log();
      console.log(chalk.bold('Custom Branding:'), config.customBranding || '(none)');
      console.log(chalk.bold('QR Image:'), config.qrImagePath || '(none)');
      console.log();
      return;
    }

    if (options.set) {
      const [key, ...valueParts] = options.set.split('=');
      const value = valueParts.join('=');

      if (!key || !value) {
        console.error('❌ Invalid format. Use: --set key=value');
        console.error('   Example: --set openai.key=sk-xxx');
        process.exit(1);
      }

      // Parse nested keys like "providers.openai.key"
      const parts = key.split('.');
      
      if (parts.length === 2 && parts[0] === 'providers') {
        const [provider, setting] = parts[1].split('.');
        config.providers = config.providers || {};
        config.providers[provider as any] = config.providers[provider as any] || {};
        (config.providers as any)[provider][setting] = value;
      } else if (parts.length === 1) {
        if (['output', 'period', 'currency', 'timezone'].includes(parts[0])) {
          config.defaults = config.defaults || defaultConfig.defaults;
          (config.defaults as any)[parts[0]] = value;
        } else if (parts[0] === 'customBranding' || parts[0] === 'qrImagePath') {
          (config as any)[parts[0]] = value;
        }
      }

      await fs.writeJson(configPath, config, { spaces: 2 });
      console.log(`✅ Set ${key} = ${value}`);
      return;
    }

    // No options provided, show help
    configCommand.help();
  });
