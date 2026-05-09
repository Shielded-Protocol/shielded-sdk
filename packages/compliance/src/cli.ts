#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('shielded-audit')
  .description('CLI for auditing shielded transactions')
  .version('0.1.0');

program.command('view')
  .description('View a private position using a viewing key')
  .argument('<commitment>', 'Commitment hash')
  .argument('<key>', 'Viewing key')
  .action((commitment, key) => {
    console.log(`Auditing commitment ${commitment} with key ${key}...`);
    // TODO: implement CLI action
  });

program.parse();
