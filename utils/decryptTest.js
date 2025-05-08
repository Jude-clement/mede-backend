const { decrypt } = require('../utils/encryption');

// Your encrypted data
const encryptedEmail = '31689a6fbbf24eef4c93568cb59895870210fbd8e273d8a9c867ace19654f1e9';
const encryptedPhone = '198b25e9cc4f9ea49cf8712ef670d856';
const encryptedName = 'dbee1b430b1dd38baadbdb732a215c97';
const encryptedPassword = '332abd4a4c10ac85f37b819647285aae';

// Decryption test
console.log('Testing decryption...');
console.log('---------------------');

console.log('Encrypted Email:', encryptedEmail);
console.log('Decrypted Email:', decrypt(encryptedEmail));

console.log('\nEncrypted Phone:', encryptedPhone);
console.log('Decrypted Phone:', decrypt(encryptedPhone));

console.log('\nEncrypted Name:', encryptedName);
console.log('Decrypted Name:', decrypt(encryptedName));

console.log('\nEncrypted Password:', encryptedPassword);
console.log('Decrypted Password:', decrypt(encryptedPassword));