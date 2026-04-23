import { Command } from 'commander';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import prompts from 'prompts';

const homeDir = os.homedir();
const configPath = path.join(homeDir, '.multi-model-receipts.config.json');

const defaultConfig = {
  version: '1.0.0',
  providers: {},
  defaults: {
    output: 'html',
    period: 'month',
    currency: 'USD',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    openBrowser: true,
  },
  customBranding: null,
  qrImagePath: null,
};

export const setupCommand = new Command('setup')
  .description('First-time setup and configuration')
  .option('--uninstall', 'Remove configuration and exit')
  .action(async (options) => {
    if (options.uninstall) {
      await uninstall();
      return;
    }

    console.log('\n🧾 Multi-Model Receipts Setup\n');
    console.log('This will help you configure API keys for various AI providers.\n');

    // Load existing config
    let config = defaultConfig;
    if (await fs.pathExists(configPath)) {
      config = await fs.readJson(configPath);
    }

    // Interactive prompts
    const response = await prompts([
      {
        type: 'text',
        name: 'customBranding',
        message: 'Your name/brand (shown on receipts, optional)',
        initial: config.customBranding || '',
      },
      {
        type: 'text',
        name: 'qrImagePath',
        message: 'Path to donation QR code image (optional)',
        initial: config.qrImagePath || '',
      },
      {
        type: 'select',
        name: 'addProvider',
        message: 'Add an API key for a provider?',
        choices: [
          { title: 'OpenAI', value: 'openai' },
          { title: 'Anthropic', value: 'anthropic' },
          { title: 'Google Gemini', value: 'google' },
          { title: 'Azure OpenAI', value: 'azure' },
          { title: 'MiniMax', value: 'minimax' },
          { title: 'Done - Save config', value: 'done' },
        ],
      },
    ]);

    if (response.addProvider && response.addProvider !== 'done') {
      const providerResponse = await prompts([
        {
          type: 'password',
          name: 'apiKey',
          message: `Enter your ${response.addProvider} API key:`,
        },
      ]);

      if (providerResponse.apiKey) {
        config.providers = config.providers || {};
        config.providers[response.addProvider] = {
          apiKey: providerResponse.apiKey,
        };
      }
    }

    if (response.customBranding) {
      config.customBranding = response.customBranding;
    }

    if (response.qrImagePath) {
      config.qrImagePath = response.qrImagePath;
    }

    // Save config
    await fs.ensureDir(os.homedir());
    await fs.writeJson(configPath, config, { spaces: 2 });

    console.log('\n✅ Configuration saved to:', configPath);
    console.log('\n✨ Setup complete!');
    console.log('\nNext steps:');
    console.log('  - Run: multi-model-receipts generate --provider openai');
    console.log('  - Or: multi-model-receipts config --show\n');
  });

async function uninstall(): Promise<void> {
  if (await fs.pathExists(configPath)) {
    await fs.remove(configPath);
    console.log('✅ Configuration removed.');
  } else {
    console.log('No configuration found.');
  }
}
