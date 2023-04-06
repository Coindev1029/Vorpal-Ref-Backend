const { connection } = require('./connection');

async function GetValueByKey (key) {
    keyQuery = `SELECT value FROM common_data WHERE key = '${key}';`
    result = await connection.query(keyQuery)
    if (!result.rows) return ''
    return result.rows[0].value
}

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
    UpdateVestings,
    GetValueByKey
  }