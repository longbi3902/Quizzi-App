import bcrypt from 'bcryptjs';

// Script để generate password hash cho fake users
// Chạy: npx ts-node scripts/generate-password-hash.ts

const password = '123456';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Password:', password);
  console.log('Hash:', hash);
});







