import { Command } from 'commander';
import { ReceiptGenerator } from '../core/receipt-generator.js';
import { HtmlRenderer } from '../core/html-renderer.js';
import { ConsoleRenderer } from '../core/console-renderer.js';
import type { Provider, Period, ReceiptOptions, AggregatedUsage } from '../types/index.js';
import { PROVIDER_NAMES } from '../core/pricing.js';
import { execa } from 'execa';
import { pathToFileURL } from 'url';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

const homeDir = os.homedir();
const configPath = path.join(homeDir, '.multi-model-receipts.config.json');
const outputDir = path.join(homeDir, '.multi-model-receipts', 'receipts');

export const summaryCommand = new Command('summary')
  .description('Generate daily/weekly/monthly token usage summaries')
  .option('-p, --provider <name>', 'AI provider (openai|anthropic|google|azure|minimax|groq|cohere)')
  .option('-k, --api-key <key>', 'API key for the provider')
  .option('-o, --output <formats>', 'Output format: html, console, json (default: html,console)', 'html,console')
  .option('-t, --timezone <tz>', 'Timezone (default: local)', Intl.DateTimeFormat().resolvedOptions().timeZone)
  .option('-c, --currency <currency>', 'Currency (default: USD)', 'USD')
  .option('--qr-image <path>', 'Path to QR code image for donations')
  .option('--custom-branding <name>', 'Your name/brand to show on receipt')
  .option('--open', 'Open HTML in browser (default: true)', true)
  .option('-s, --save <path>', 'Save path for output files')
  .action(async (options) => {
    try {
      const config = await loadConfig();
      const provider = (options.provider || 'openai') as Provider;
      
      let apiKey = options.apiKey;
      if (!apiKey && config.providers?.[provider]?.apiKey) {
        apiKey = config.providers[provider].apiKey;
      }
      if (!apiKey) {
        console.error(`❌ No API key provided. Use --api-key or set in config`);
        process.exit(1);
      }

      console.log(`\n📊 Multi-Model Usage Summary`);
      console.log(`   Provider: ${PROVIDER_NAMES[provider] || provider}\n`);

      const generator = new ReceiptGenerator(provider, apiKey, {
        baseUrl: config.providers?.[provider]?.baseUrl,
        organization: config.providers?.[provider]?.organization,
      });

      const receiptOptions: ReceiptOptions = {
        currency: options.currency || 'USD',
        timezone: options.timezone || 'Asia/Shanghai',
        showDetails: true,
        includeModels: [],
        excludeModels: [],
        qrImagePath: options.qrImage || config.qrImagePath,
        customBranding: options.customBranding || config.customBranding,
      };

      // Generate summaries for all periods
      const periods: { period: Period; label: string }[] = [
        { period: 'today', label: 'Today' },
        { period: 'week', label: 'This Week' },
        { period: 'month', label: 'This Month' },
      ];

      const summaries: { period: Period; label: string; usage: AggregatedUsage }[] = [];

      for (const p of periods) {
        process.stdout.write(`Fetching ${p.label}... `);
        const usage = await generator.fetchUsage({ period: p.period });
        summaries.push({ ...p, usage });
        console.log(chalk.green('✓'));
      }

      // Display console summary
      const outputs = (options.output || 'html,console').split(',').map(s => s.trim());

      for (const outputFormat of outputs) {
        if (outputFormat === 'console') {
          console.log('\n' + chalk.bold('═'.repeat(50)));
          console.log(chalk.bold('          USAGE SUMMARY REPORT'));
          console.log(chalk.bold('═'.repeat(50)));

          for (const s of summaries) {
            console.log(`\n${chalk.cyan('┌─')} ${chalk.bold(s.label)} ${chalk.cyan('─'.repeat(30 - s.label.length))}┐`);
            console.log(`${chalk.cyan('│')} Total Cost:    ${chalk.yellow('$' + s.usage.totalCost.toFixed(4))}`);
            console.log(`${chalk.cyan('│')} Total Tokens:  ${s.usage.totalTokens.toLocaleString()}`);
            console.log(`${chalk.cyan('│')} Input Tokens:  ${s.usage.totalInputTokens.toLocaleString()}`);
            console.log(`${chalk.cyan('│')} Output Tokens: ${s.usage.totalOutputTokens.toLocaleString()}`);
            if (s.usage.totalCacheCreationTokens > 0) {
              console.log(`${chalk.cyan('│')} Cache Write:    ${s.usage.totalCacheCreationTokens.toLocaleString()}`);
            }
            if (s.usage.totalCacheReadTokens > 0) {
              console.log(`${chalk.cyan('│')} Cache Read:     ${s.usage.totalCacheReadTokens.toLocaleString()}`);
            }
            console.log(`${chalk.cyan('│')} Requests:      ${s.usage.totalRequestCount.toLocaleString()}`);
            
            // Show top 3 models by cost
            const topModels = [...s.usage.providers[0]?.modelsUsed || []]
              .sort((a, b) => b.cost - a.cost)
              .slice(0, 3);
            if (topModels.length > 0) {
              console.log(`${chalk.cyan('│')} ${chalk.dim('Top models:')}`);
              for (const m of topModels) {
                const name = m.modelName.length > 20 ? m.modelName.slice(0, 18) + '..' : m.modelName;
                console.log(`${chalk.cyan('│')}   ${name.padEnd(20)} $${m.cost.toFixed(4)}`);
              }
            }
            console.log(chalk.cyan('└' + '─'.repeat(40) + '┘'));
          }

          console.log('\n' + chalk.bold('═'.repeat(50)));
        }

        if (outputFormat === 'html') {
          const renderer = new HtmlRenderer(receiptOptions.qrImagePath, receiptOptions.customBranding);
          const html = renderer.generateSummaryHtml(summaries.map(s => s.usage), receiptOptions);
          
          const savePath = options.save || outputDir;
          await fs.ensureDir(savePath);
          
          const filename = `summary-${provider}-${Date.now()}.html`;
          const filePath = path.join(savePath, filename);
          
          await fs.writeFile(filePath, html, 'utf-8');
          console.log(`\n✅ HTML summary saved to: ${filePath}`);
          
          if (options.open !== false) {
            const url = pathToFileURL(filePath).href;
            await execa('open', [url]);
          }
        }

        if (outputFormat === 'json') {
          const savePath = options.save || outputDir;
          await fs.ensureDir(savePath);
          
          const filename = `summary-${provider}-${Date.now()}.json`;
          const filePath = path.join(savePath, filename);
          
          await fs.writeJson(filePath, { summaries, generatedAt: new Date() }, { spaces: 2 });
          console.log(`\n✅ JSON summary saved to: ${filePath}`);
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
