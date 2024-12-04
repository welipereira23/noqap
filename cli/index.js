#!/usr/bin/env node

const { program } = require('commander');
const { deploy } = require('./commands/deploy');
const { login } = require('./commands/login');
const { listProjects } = require('./commands/list');
const { checkHealth } = require('./commands/health');

program
  .version('1.0.0')
  .description('CLI personalizada da Vercel');

program
  .command('login')
  .description('Fazer login na sua conta Vercel')
  .action(login);

program
  .command('deploy')
  .description('Fazer deploy de um projeto')
  .option('-d, --dir <directory>', 'Diretório do projeto')
  .action(deploy);

program
  .command('list')
  .description('Listar todos os projetos')
  .action(listProjects);

program
  .command('health')
  .description('Verificar a saúde do projeto na Vercel')
  .action(checkHealth);

program.parse(process.argv); 