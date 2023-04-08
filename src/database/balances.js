const { connection } = require('./connection');

async function GetValueByKey (key) {
    keyQuery = `SELECT value FROM common_data WHERE key = '${key}';`
    result = await connection.query(keyQuery)
    if (!result.rows) return ''
    return result.rows[0].value
}

async function FindLinkByReferral (ref) {
    let query = `SELECT link_key FROM address_to_referral WHERE address = '${ref}';`
    let result = await connection.query(query)
    console.log(result.rows)
    if (result.rows[0]) {
        return result.rows[0].link_key
    } else {
        return ''
    }
}

async function FindLinkOwner (link) {
    let query = `select address from referral_owner where link_key = '${link}';`
    let result = await connection.query(query)
    let dt = result.rows.length = 0 ? '' : result.rows[0].address
    return dt
}

async function UpdateScheduledBalance (link, addAmount) {
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
    FindLinkByReferral,
    FindLinkOwner,
    GetValueByKey
  }