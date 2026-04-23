#!/usr/bin/env node

import { Command } from 'commander';
import { generateCommand } from './commands/generate.js';
import { setupCommand } from './commands/setup.js';
import { configCommand } from './commands/config.js';
import { providersCommand } from './commands/providers.js';
import { summaryCommand } from './commands/summary.js';

const program = new Command();

program
  .name('multi-model-receipts')
  .description('Universal AI model usage receipt generator - track tokens and costs across OpenAI, Anthropic, Google, Azure, MiniMax and more')
  .version('1.1.0');

program.addCommand(generateCommand);
program.addCommand(summaryCommand);
program.addCommand(setupCommand);
program.addCommand(configCommand);
program.addCommand(providersCommand);

program.parse();
