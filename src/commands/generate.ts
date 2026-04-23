import { Command } from 'commander';
import { ReceiptGenerator } from '../core/receipt-generator.js';
import { HtmlRenderer } from '../core/html-renderer.js';
import { ConsoleRenderer } from '../core/console-renderer.js';
import type { Provider, Period, ReceiptOptions } from '../types/index.js';
import { PROVIDER_NAMES } from '../core/pricing.js';
import { execa } from 'execa';
import { pathToFileURL } from 'url';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const homeDir = os.homedir();
const configPath = path.join(homeDir, '.multi-model-receipts.config.json');
const outputDir = path.join(homeDir, '.multi-model-receipts', 'receipts');

export const generateCommand = new Command('generate')
  .description('Generate a usage receipt')
  .option('-p, --provider <name>', 'AI provider (openai|anthropic|google|azure|minimax|groq|cohere)')
  .option('-k, --api-key <key>', 'API key for the provider')
  .option('-o, --output <formats>', 'Output format: html, console, json (default: html)', 'html')
  .option('-r, --period <period>', 'Time period: today, week, month (default: month)', 'month')
  .option('--start-date <date>', 'Start date (YYYY-MM-DD) for custom period')
  .option('--end-date <date>', 'End date (YYYY-MM-DD) for custom period')
  .option('-t, --timezone <tz>', 'Timezone (default: local)', Intl.DateTimeFormat().resolvedOptions().timeZone)
  .option('-c, --currency <currency>', 'Currency (default: USD)', 'USD')
  .option('--include-models <list>', 'Comma-separated model filter')
  .option('--exclude-models <list>', 'Comma-separated model exclusion')
  .option('--qr-image <path>', 'Path to QR code image for donations')
  .option('--custom-branding <name>', 'Your name/brand to show on receipt')
  .option('--open', 'Open HTML in browser (default: true)', true)
  .option('-s, --save <path>', 'Save path for output files')
  .action(async (options) => {
    try {
      // Load config
      const config = await loadConfig();

      // Resolve provider
      const provider = (options.provider || config.defaults?.output || 'openai') as Provider;
      
      // Resolve API key
      let apiKey = options.apiKey;
      if (!apiKey && config.providers?.[provider]?.apiKey) {
        apiKey = config.providers[provider].apiKey;
      }
      if (!apiKey) {
        console.error(`❌ No API key provided. Use --api-key or set in config: multi-model-receipts config --set ${provider}.key=YOUR_KEY`);
        process.exit(1);
      }

      // Resolve period
      const period: Period = options.period || 'month';
      const startDate = options.startDate ? new Date(options.startDate) : undefined;
      const endDate = options.endDate ? new Date(options.endDate) : undefined;

      // Resolve options
      const receiptOptions: ReceiptOptions = {
        currency: options.currency || 'USD',
        timezone: options.timezone || 'Asia/Shanghai',
        showDetails: true,
        includeModels: options.includeModels?.split(',').map(s => s.trim()) || [],
        excludeModels: options.excludeModels?.split(',').map(s => s.trim()) || [],
        qrImagePath: options.qrImage || config.qrImagePath,
        customBranding: options.customBranding || config.customBranding,
      };

      console.log(`\n🧾 Multi-Model Receipts Generator`);
      console.log(`   Provider: ${PROVIDER_NAMES[provider] || provider}`);
      console.log(`   Period: ${period}`);
      console.log(`   Output: ${options.output || 'html'}\n`);

      // Generate receipt
      const generator = new ReceiptGenerator(provider, apiKey, {
        baseUrl: config.providers?.[provider]?.baseUrl,
        organization: config.providers?.[provider]?.organization,
      });

      const usage = await generator.fetchUsage({ period, startDate, endDate });

      // Determine outputs
      const outputs = (options.output || 'html').split(',').map(s => s.trim());

      for (const outputFormat of outputs) {
        if (outputFormat === 'html') {
          const renderer = new HtmlRenderer(receiptOptions.qrImagePath, receiptOptions.customBranding);
          const html = renderer.generateHtml(usage, receiptOptions);
          
          const savePath = options.save || outputDir;
          await fs.ensureDir(savePath);
          
          const filename = `receipt-${provider}-${Date.now()}.html`;
          const filePath = path.join(savePath, filename);
          
          await fs.writeFile(filePath, html, 'utf-8');
          console.log(`✅ HTML receipt saved to: ${filePath}`);
          
          if (options.open !== false) {
            const url = pathToFileURL(filePath).href;
            await execa('open', [url]);
          }
        } else if (outputFormat === 'console') {
          const renderer = new ConsoleRenderer();
          renderer.render(usage, receiptOptions);
        } else if (outputFormat === 'json') {
          const savePath = options.save || outputDir;
          await fs.ensureDir(savePath);
          
          const filename = `receipt-${provider}-${Date.now()}.json`;
          const filePath = path.join(savePath, filename);
          
          await fs.writeJson(filePath, { usage, options: receiptOptions }, { spaces: 2 });
          console.log(`✅ JSON saved to: ${filePath}`);
        }
      }

      console.log('\n✨ Done!\n');

    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

async function loadConfig(): Promise<any> {
  try {
    if (await fs.pathExists(configPath)) {
      return await fs.readJson(configPath);
    }
  } catch {
    // Ignore
  }
  return {};
}
