const { connection } = require('./connection');

async function GetValueByKey (key) {
    keyQuery = `SELECT value FROM common_data WHERE key = '${key}';`
    result = await connection.query(keyQuery)
    console.log(result)
    if (!result.rows || result.rows.length === 0) return ''
    return result.rows[0].value
}

async function SetValueByKey (key, value) {
    keyQuery = `INSERT INTO common_data (key, value) VALUES ('${key}', '${value}') `+
    `ON CONFLICT (key) DO UPDATE SET value = '${value}';`
    result = await connection.query(keyQuery)
    console.log(result)
    if (!result.rows || result.rows.length === 0) {
        return ''
    }
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

async function PayValue (address, amount, date, vestingId) {

    let PaymentQuery = `UPDATE balances SET balance_available = balance_available+${amount} WHERE address = '${address}';`
    let VestingUpdateQuery = `UPDATE vestings SET date_watched = to_timestamp(${date}), value_paid = value_paid+${amount} WHERE id=${vestingId};`
    await connection.query(PaymentQuery)
    await connection.query(VestingUpdateQuery)

}

async function UpdateVestings () {

    const queryUnpaidVestings = `SELECT * FROM vestings WHERE value_paid < value_total;`;

    const unpaidVestingsRequest = await connection.query(queryUnpaidVestings)
    const unpaidVestings = unpaidVestingsRequest.rows
    const date = Math.floor(new Date().getTime() / 1000)

    if (unpaidVestings.length > 0) {
        unpaidVestings.forEach((vesting) => {

            const dateStart = Date.parse(vesting.date_start) / 1000
            const dateWatched = Date.parse(vesting.date_watched) / 1000
            const dateEnd = Date.parse(vesting.date_end) / 1000
            const valueTotal = vesting.value_total
            let paymentValue = 0
            if (date > dateEnd) {
                paymentValue = (valueTotal - vesting.value_paid) > 0 ? (valueTotal - vesting.value_paid) : 0
            } else {
                const paymentPart = ((date - dateStart)/ (dateEnd - dateStart))
                paymentValue = Math.floor(valueTotal * paymentPart)
            }

            PayValue(vesting.address, paymentValue, date, vesting.id)
            console.log(dateStart)
            console.log(dateWatched)
        })
        return true
    } else {
        return false
    }
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