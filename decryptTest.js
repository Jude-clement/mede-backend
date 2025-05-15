const { decrypt } = require('./utils/encryption');

// Your encrypted data
const encryptedEmail = '23da6b8b7a52b847e48ad87e23903e3b';
const encryptedPhone = '5dcb55deecd0a6514a30d1ec2ae5666e';
const encryptedName = '88e810ae5c9051df35fe4c0e80d3896f';
const encryptedPassword = 'd20acf4b6017099bf080c5491ea1c42160a10668b0fbf5c36fcd83642e96ca0a';

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