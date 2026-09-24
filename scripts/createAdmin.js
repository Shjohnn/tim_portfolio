// Ishlatish: npm run create-admin
// Faqat BITTA admin bo'ladi. Skript qayta ishga tushirilsa, login va parol yangilanadi.
require('dotenv').config();
const readline = require('readline');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dns').setServers(['8.8.8.8', '1.1.1.1']);   // <-- shuni qo'shing

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) rl._writeToOutput = (s) => rl.output.write(s.includes(question) ? s : '');
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

(async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI .env faylida yo\'q.');
  const username = await ask('Admin login: ');
  const password = await ask('Parol (kamida 8 belgi): ', true);
  if (!username || password.length < 8) throw new Error('Login bo\'sh bo\'lmasin, parol kamida 8 belgi bo\'lsin.');

  await mongoose.connect(process.env.MONGODB_URI);
  const passwordHash = await Admin.hash(password);
  const existing = await Admin.findOne();
  if (existing) {
    existing.username = username;
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log('Admin yangilandi.');
  } else {
    await Admin.create({ username, passwordHash });
    console.log('Admin yaratildi.');
  }
  await mongoose.disconnect();
})().catch((err) => {
  console.error('Xato:', err.message);
  process.exit(1);
});
