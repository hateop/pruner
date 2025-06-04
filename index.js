const readline = require('readline-sync');
const DiscordJS = require('discord.js');
const SelfbotJS = require('discord.js-selfbot-v13');

(async () => {
  const { default: chalk } = await import('chalk');
  console.clear();
  const banner = `
 ██▓███   ██▀███   █    ██  ███▄    █ ▓█████  ██▀███  
▓██░  ██▒▓██ ▒ ██▒ ██  ▓██▒ ██ ▀█   █ ▓█   ▀ ▓██ ▒ ██▒
▓██░ ██▓▒▓██ ░▄█ ▒▓██  ▒██░▓██  ▀█ ██▒▒███   ▓██ ░▄█ ▒
▒██▄█▓▒ ▒▒██▀▀█▄  ▓▓█  ░██░▓██▒  ▐▌██▒▒▓█  ▄ ▒██▀▀█▄  
▒██▒ ░  ░░██▓ ▒██▒▒▒█████▓ ▒██░   ▓██░░▒████▒░██▓ ▒██▒
▒▓▒░ ░  ░░ ▒▓ ░▒▓░░▒▓▒ ▒ ▒ ░ ▒░   ▒ ▒ ░░ ▒░ ░░ ▒▓ ░▒▓░
░▒ ░       ░▒ ░ ▒░░░▒░ ░ ░ ░ ░░   ░ ▒░ ░ ░  ░  ░▒ ░ ▒░
░░         ░░   ░  ░░░ ░ ░    ░   ░ ░    ░     ░░   ░ 
            ░        ░              ░    ░  ░   ░     `;
  console.log(chalk.red(banner));
  console.log(chalk.yellow('[1] Bot Pruner'));
  console.log(chalk.yellow('[2] Self Bot Pruner'));

  let mode;
  while (true) {
    mode = readline.question(chalk.yellow('Choose an option [1 or 2]: '));
    if (mode === '1' || mode === '2') break;
    console.log(chalk.red('Invalid choice! Please enter 1 or 2.'));
  }

  const token = readline.question(chalk.yellow('\nEnter Your Token: '), {
    hideEchoBack: true,
  });

  let client;
  if (mode === '1') {
    client = new DiscordJS.Client({
      intents: [
        DiscordJS.GatewayIntentBits.Guilds,
        DiscordJS.GatewayIntentBits.GuildMembers,
      ],
    });
  } else {
    client = new SelfbotJS.Client();
  }

  client
    .login(token)
    .then(() => {
      console.log(chalk.green(`Logged in as ${client.user.tag}!!`));
    })
    .catch(() => {
      console.log(chalk.red('Token invalid!!'));
      process.exit(1);
    });

  client.once('ready', async () => {
    let guild;
    while (true) {
      const guildId = readline.question(chalk.yellow('\nEnter Guild Id: '));
      try {
        guild = await client.guilds.fetch(guildId);
        console.log(chalk.green(`Checked in "${guild.name}"`));
        break;
      } catch {
        console.log(chalk.red('Invalid Guild!'));
      }
    }

    let tries;
    while (true) {
      const input = readline.question(chalk.yellow('\nNumber Of Tries: '));
      tries = parseInt(input, 10);
      if (!isNaN(tries) && tries > 0) break;
      console.log(chalk.red('Please enter a valid number greater than 0.'));
    }

    let pruneDays;
    while (true) {
      const input = readline.question(chalk.yellow('\nPrune Day Count (1-30): '));
      pruneDays = parseInt(input, 10);
      if (!isNaN(pruneDays) && pruneDays >= 1 && pruneDays <= 30) break;
      console.log(chalk.red('Please enter a number between 1 and 30.'));
    }

    console.log(chalk.yellow('\nChoosing Role Automatic...'));

    const botMember = await guild.members.fetch(client.user.id);
    const botHighestRole = botMember.roles.highest;

    const includeRoleIds = guild.roles.cache
      .filter((role) => role.position < botHighestRole.position)
      .map((role) => role.id);

    for (let i = 1; i <= tries; i++) {
      try {
        const prunedCount = await guild.members.prune({
          days: pruneDays,
          computePruneCount: true,
          includeRoles: includeRoleIds,
          reason: 'Pruning inactive members',
        });

        console.log(
          chalk.green(
            `Pruned... (${prunedCount} members) [Iteration ${i}/${tries}]`
          )
        );
      } catch (err) {
        console.log(chalk.red(`Prune failed on iteration ${i}: ${err.message}`));
      }
    }

    console.log(chalk.green('\nAll prune iterations complete!'));
    process.exit(0);
  });
})();
