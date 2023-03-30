const { connection } = require('./connection');

async function UpdateScheduledBalance (owner, addAmount) {
    console.log('Scheduled')
}

async function CreateVesting ( owner, amount, dateStart, dateEnd) {
    console.log('create')
}

async function UpdateVestings () {
    console.log('Updating...')
}

module.exports = {
    UpdateScheduledBalance,
    CreateVesting,
    UpdateVestings 
  }