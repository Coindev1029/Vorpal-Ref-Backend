const { connection } = require('./connection');

async function GetValueByKey (key) {
    keyQuery = `SELECT value FROM common_data WHERE key = '${key}';`
    result = await connection.query(keyQuery)
    if (!result.rows) return ''
    return result.rows[0].value
}

async function SetValueByKey (key, value) {
    keyQuery = `INSERT INTO common_data (key, value) VALUES ('${key}', '${value}') `+
    `ON CONFLICT (key) DO UPDATE SET value = '${value}';`
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
    let UpdateQuery = `UPDATE balances SET balance_scheduled  = balance_scheduled+${addAmount} WHERE address = '${owner}';`
    let result = await connection.query(UpdateQuery)
    console.log('Scheduled')
    console.log(result)
    return true
}

async function CreateVesting ( owner, amount, dateStart, dateEnd) {
    let CreateQuery = `INSERT INTO vestings (address, value_total, value_paid, date_start, date_watched, date_end)`+
    ` VALUES ('${owner}', ${amount}, 0, to_timestamp(${dateStart}), to_timestamp(${dateStart}), to_timestamp(${dateEnd}));`

    let result = await connection.query(CreateQuery)

    return true;
}

async function GetBalances ( owner ) {
    let balanceQuery =  `SELECT * FROM balances WHERE address = '${owner}';`
    let result = await connection.query(balanceQuery)
    if (!result.rows || result.rows.length === 0) {
        return(
            {
                balanceSheduled : 0,
                balanceAvailable : 0
            }
        )
    } else {
        return(
            {
                balanceSheduled : result.rows[0].balance_scheduled - result.rows[0].balance_available,
                balanceAvailable : result.rows[0].balance_available - result.rows[0].balance_withdrawn
            }
        )
    }
    
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
    GetValueByKey,
    GetBalances,
    SetValueByKey
  }