const { connection } = require('./connection');

async function GetValueByKey (key) {
    keyQuery = `SELECT value FROM common_data WHERE key = '${key}';`
    result = await connection.query(keyQuery)
    if (!result.rows) return ''
    return result.rows[0].value
}

async function SetValueByKey (key, value) {
    keyQuery = `INSERT INTO common_data (key, value) VALUES ('${key}', '${value}') `+
    `ON CONFLICT UPDATE common_data SET value = '${value}' WHERE key = '${key}';`
    result = await connection.query(keyQuery)
    if (!result.rows) return ''
    return result.rows[0].value
}

async function FindLinkByReferral (ref) {
    let query = `select link_key from address_to_referral where address = '${ref}';`
    let result = await connection.query(query)
    if (result.rows[0]) {
        return result.rows[0].link_key
    } else {
        return ''
    }
}

async function FindLinkOwner (link) {
    let query = `select address from referral_owner where link_key = '${link}';`
    let result = await connection.query(query)
    if (result.rows[0]) {
        return result.rows[0].address
    } else {
        return ''
    }
}

async function UpdateScheduledBalance (owner, addAmount) {
    let UpdateQuery = `UPDATE balances SET balance_scheduled  = balance_scheduled+${addAmount} WHERE address = ${owner};`
    let result = await connection.query(UpdateQuery)
    console.log('Scheduled')
    console.log(result)
    return true
}

async function CreateVesting ( owner, amount, dateStart, dateEnd) {
    let CreateQuery = `INSERT INTO vestings ();`
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