import { Command } from 'commander';
import chalk from 'chalk';
import { PROVIDER_NAMES } from '../core/pricing.js';
import type { Provider } from '../types/index.js';

const providers: Array<{ id: Provider; name: string; status: string; models: string }> = [
  { id: 'openai', name: 'OpenAI', status: '✅ Full', models: 'GPT-4o, GPT-4-turbo, GPT-3.5-turbo, etc.' },
  { id: 'anthropic', name: 'Anthropic', status: '✅ Full', models: 'Claude Opus 4.5, Sonnet 4.5, Haiku 4.5' },
  { id: 'google', name: 'Google AI', status: '✅ Full', models: 'Gemini 1.5 Pro, Flash, Ultra' },
  { id: 'azure', name: 'Azure OpenAI', status: '✅ Full', models: 'All Azure-hosted models' },
  { id: 'minimax', name: 'MiniMax', status: '✅ Full', models: 'MiniMax-Text-01, abab6.5s-chat' },
  { id: 'groq', name: 'Groq', status: '✅ Full', models: 'Llama 3.1, Mixtral 8x7B' },
  { id: 'cohere', name: 'Cohere', status: '✅ Full', models: 'Command R+, Command R' },
];

export const providersCommand = new Command('providers')
  .description('List supported providers')
  .action(() => {
    console.log('\n📦 Supported AI Model Providers\n');
    console.log(chalk.bold('Provider'.padEnd(20)) + chalk.bold('Status').padEnd(12)) + chalk.bold('Models');
    console.log(chalk.dim('─'.repeat(80)));

    for (const p of providers) {
      const name = p.name.padEnd(18);
      const status = p.status.padEnd(10);
      console.log(`${chalk.cyan(name)} ${chalk.green(status)} ${chalk.dim(p.models)}`);
    }

    console.log('\n' + chalk.dim('─'.repeat(80)));
    console.log('\nUsage:');
    console.log('  multi-model-receipts generate --provider openai --api-key sk-xxx');
    console.log('  multi-model-receipts config --set openai.key=sk-xxx');
    console.log('\n');
  });
