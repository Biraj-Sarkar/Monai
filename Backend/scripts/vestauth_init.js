#!/usr/bin/env node
import dotenv from 'dotenv';
import vestauth from 'vestauth';
import readline from 'readline';

dotenv.config();

function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(query, (ans) => { rl.close(); resolve(ans); }));
}

(async () => {
  try {
    const hostnameArgIndex = process.argv.indexOf('--hostname');
    const hostname = hostnameArgIndex !== -1 ? process.argv[hostnameArgIndex + 1] : (process.env.TOOL_HOSTNAME || null);
    const force = process.argv.includes('--yes') || process.argv.includes('-y');

    console.log('vestauth init helper');
    console.log('This will register this service as a vestauth "tool" and persist TOOL_* values into Backend/.env.');

    if (!force) {
      const ans = await askQuestion('Proceed and write to Backend/.env? (y/N): ');
      if (!/^y(es)?$/i.test(ans)) {
        console.log('Aborted by user.');
        process.exit(0);
      }
    }

    console.log('Initializing vestauth tool...');
    const info = await vestauth.tool.init(hostname || null);

    console.log('vestauth tool registration complete. Returned info:');
    console.log(JSON.stringify(info, null, 2));
    console.log('\nCheck Backend/.env for TOOL_UID, TOOL_PUBLIC_JWK and TOOL_PRIVATE_JWK.');
    console.log('Remember to keep TOOL_PRIVATE_JWK secret and add Backend/.env to .gitignore.');
  } catch (err) {
    console.error('vestauth init failed:', err?.message || err);
    process.exit(1);
  }
})();
