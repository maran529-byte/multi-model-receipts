import type { AggregatedUsage, ReceiptOptions } from '../types/index.js';
import { PROVIDER_LOGOS, PROVIDER_NAMES } from './pricing.js';
import { formatCurrency, formatNumber } from '../utils/formatting.js';
import chalk from 'chalk';

export class ConsoleRenderer {
  render(usage: AggregatedUsage, options: ReceiptOptions): void {
    const primaryProvider = usage.providers[0];
    const providerName = PROVIDER_NAMES[primaryProvider?.provider] || 'AI';
    const logo = PROVIDER_LOGOS[primaryProvider?.provider] || PROVIDER_LOGOS.openai;

    console.log('\n');
    console.log(chalk.bold(logo));
    console.log('\n');

    // Header info
    console.log(chalk.dim('─'.repeat(50)));
    console.log(chalk.bold(`  ${providerName} Usage Receipt`));
    console.log(chalk.dim('─'.repeat(50)));
    
    console.log(chalk.dim(`  Period: ${this.formatPeriod(usage.period)}`));
    if (options.customBranding) {
      console.log(chalk.dim(`  User: ${options.customBranding}`));
    }
    console.log('\n');

    // Provider breakdown
    for (const provider of usage.providers) {
      console.log(chalk.bold(`  ${provider.providerName}`));
      console.log(chalk.dim('  ' + '─'.repeat(40)));

      for (const model of provider.modelsUsed) {
        console.log(`  ${chalk.cyan(model.modelName)}`);
        console.log(`    Input:  ${formatNumber(model.inputTokens).padStart(12)} tokens`);
        console.log(`    Output: ${formatNumber(model.outputTokens).padStart(12)} tokens`);
        if (model.cacheCreationTokens > 0) {
          console.log(`    Cache Write: ${formatNumber(model.cacheCreationTokens).padStart(10)} tokens`);
        }
        if (model.cacheReadTokens > 0) {
          console.log(`    Cache Read:  ${formatNumber(model.cacheReadTokens).padStart(10)} tokens`);
        }
        console.log(`    ${chalk.yellow('Cost:')} ${formatCurrency(model.cost, options.currency).padStart(12)}`);
        console.log();
      }

      console.log(chalk.dim('─'.repeat(50)));
    }

    // Summary
    console.log(chalk.bold(`  ${chalk.white('SUMMARY')}`));
    console.log(chalk.dim('─'.repeat(50)));
    console.log(`  Total Tokens:      ${formatNumber(usage.totalTokens).padStart(12)}`);
    console.log(`  Input Tokens:      ${formatNumber(usage.totalInputTokens).padStart(12)}`);
    console.log(`  Output Tokens:     ${formatNumber(usage.totalOutputTokens).padStart(12)}`);
    if (usage.totalCacheCreationTokens > 0) {
      console.log(`  Cache Write:       ${formatNumber(usage.totalCacheCreationTokens).padStart(12)}`);
    }
    if (usage.totalCacheReadTokens > 0) {
      console.log(`  Cache Read:        ${formatNumber(usage.totalCacheReadTokens).padStart(12)}`);
    }
    console.log();
    console.log(chalk.bgBlack.white.bold(`  TOTAL COST: ${formatCurrency(usage.totalCost, options.currency).padStart(15)} `));
    console.log('\n');

    // Footer
    console.log(chalk.dim('─'.repeat(50)));
    console.log(chalk.italic(`  Thank you for using AI!`));
    console.log(chalk.dim(`  github.com/marans/multi-model-receipts`));
    console.log('\n');
  }

  private formatPeriod(period: string): string {
    switch (period) {
      case 'today': return 'Today';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'custom': return 'Custom Range';
      default: return period;
    }
  }
}
