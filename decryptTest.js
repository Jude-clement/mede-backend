const { decrypt } = require('./utils/encryption');

// Your encrypted data
const encryptedEmail = '0d6d130abc9bfd91e5392c2acd82742c';
// const encryptedPhone = '5dcb55deecd0a6514a30d1ec2ae5666e';
const encryptedName = 'e9e82f7e9e537b9237e5d063ebdc2cbe';
const encryptedPassword = '7c477ae2441a669185b552fa4dcbde75';
// const encryptedgoogleid = 'b2253635c5e62f82d28f9df191d24f8f';
const encrypteddevicetoken = '9688252ab968390d097193a716a4591e';
// const encrypteddeviceid = '';
const encryptedpatientlocation = 'af775176caabc02f90ef77eebae8cf94,4ca06494b2b53ab5af1455eae9b18da9';
const encrypteddob = '71f8baefba24537c032be862577c0720';
const encryptedgender = '535616035e4bec539c2cb125f71af52a';
// const encryptedaccountotp = 'b2253635c5e62f82d28f9df191d24f8f';
const encryptedmaritalstatus = '47f30376bdbe00cd1c0434d7e7087157'
const encryptedprofilepic = 'c625658515bf3e4991a7767f5fe7afca0a46744c02aeedeb45c6ab96a40a9de8'

// Decryption test
// console.log('Testing decryption...');
// console.log('---------------------');

console.log('Encrypted Email:', encryptedEmail);
console.log('Decrypted Email:', decrypt(encryptedEmail));

// console.log('\nEncrypted Phone:', encryptedPhone);
// console.log('Decrypted Phone:', decrypt(encryptedPhone));

// console.log('\nEncrypted Name:', encryptedName);
// console.log('Decrypted Name:', decrypt(encryptedName));

console.log('\nEncrypted Password:', encryptedPassword);
console.log('Decrypted Password:', decrypt(encryptedPassword));

// console.log('\nEncrypted Google ID:', encryptedgoogleid);
// console.log('Decrypted Google ID:', decrypt(encryptedgoogleid));

// console.log('\nEncrypted Device Token:', encrypteddevicetoken);
// console.log('Decrypted Device Token:', decrypt(encrypteddevicetoken));

// console.log('\nEncrypted Device ID:', encrypteddeviceid);
// console.log('Decrypted Device ID:', decrypt(encrypteddeviceid));

console.log('\nEncrypted Patient Location:', encryptedpatientlocation);
console.log('Decrypted Patient Location:', decrypt(encryptedpatientlocation));

console.log('\nEncrypted Date of Birth:', encrypteddob);
console.log('Decrypted Date of Birth:', decrypt(encrypteddob));

// console.log('\nEncrypted Marital Status:', encryptedmaritalstatus);
// console.log('Decrypted Marital Status:', decrypt(encryptedmaritalstatus));

console.log('\nEncrypted Profile Picture:', encryptedprofilepic);
console.log('Decrypted Profile Picture:', decrypt(encryptedprofilepic));

// console.log('\nEncrypted Gender:', encryptedgender);
// console.log('Decrypted Gender:', decrypt(encryptedgender));

// console.log('\nEncrypted Account OTP:', encryptedaccountotp);
// console.log('Decrypted Account OTP:', decrypt(encryptedaccountotp));