const crypto = require('crypto');

// Generate a secure random JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('🔐 Generated JWT Secret:');
console.log(jwtSecret);
console.log('\n📝 Add this to your .env file as:');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('\n⚠️  Keep this secret secure and never share it!'); 