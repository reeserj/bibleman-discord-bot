#!/usr/bin/env node

require('dotenv').config();

const clientId = process.env.DISCORD_CLIENT_ID;

if (!clientId) {
    console.log('❌ DISCORD_CLIENT_ID not found in .env file');
    process.exit(1);
}

console.log('🔗 BibleMan Bot Invite Links\n');

// Required permissions for the bot to work properly
const permissions = [
    'Send Messages',
    'Read Message History', 
    'Add Reactions',
    'Use Slash Commands',
    'Embed Links',
    'Attach Files',
    'Read Messages/View Channels'
];

console.log('📋 Required Permissions:');
permissions.forEach(perm => {
    console.log(`   ✅ ${perm}`);
});

// Generate invite links with different permission sets
const permissionBits = {
    minimal: '274877926464',      // Basic permissions
    recommended: '412317240384',  // All needed permissions
    admin: '8'                    // Administrator (not recommended)
};

console.log('\n🔗 Invite Links:');
console.log('=' .repeat(60));

console.log('\n1. RECOMMENDED - All necessary permissions:');
console.log(`https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissionBits.recommended}&scope=bot%20applications.commands`);

console.log('\n2. MINIMAL - Basic permissions only:');
console.log(`https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissionBits.minimal}&scope=bot%20applications.commands`);

console.log('\n📝 Instructions:');
console.log('1. Click the RECOMMENDED link above');
console.log('2. Select your Discord server');
console.log('3. Grant the permissions');
console.log('4. The bot should now have proper access to your server');
console.log('\n💡 If the bot is already in your server but has wrong permissions:');
console.log('1. Right-click the bot user in Discord');
console.log('2. Select "Edit Role" or "Manage Roles"');
console.log('3. Go to "Permissions" tab');
console.log('4. Enable all the required permissions listed above');
console.log('5. Make sure the bot role is positioned above other roles that might deny permissions');


