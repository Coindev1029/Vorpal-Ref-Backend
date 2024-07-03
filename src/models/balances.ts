import { runQuery as Q } from './connection';

async function GetValueByKey (key) {
    const keyQuery = `SELECT value FROM common_data WHERE key = '${key}';`;
    const result = await Q(keyQuery);
    return result && result.length > 0 ? result[0].value : '';
}

async function SetValueByKey (key, value) {
    const keyQuery = `INSERT INTO common_data (key, value) VALUES ('${key}', '${value}') `+
    `ON CONFLICT (key) DO UPDATE SET value = '${value}';`
    const result = await Q(keyQuery, false);
    return result ? true : false
}

async function DeleteKey ( key ) {
    const delQuery = `DELETE FROM common_data WHERE key = '${key}';`;
    const result = await Q(delQuery, false);
    return result ? true : false
}

async function FindLinkByReferral (ref: string) {
    let query = `select link_key from address_to_referral where address = '${ref}';`
    let result = await Q(query);
    return result && result.length > 0 ? result[0].link_key : '';
}

async function FindLinkOwner (link: string) {
    let query = `select address from referral_owner where link_key = '${link}';`
    let result = await Q(query);
    return result && result.length > 0 ? result[0].address : '';
}

async function UpdateScheduledBalance (owner, addAmount) {
    const UpdateQuery = `UPDATE balances SET balance_scheduled  = balance_scheduled+${addAmount} WHERE address = '${owner}';`
    const result = await Q(UpdateQuery, false);
    return result ? true : false
}

async function CreateVesting ( owner, amount, dateStart, dateEnd) {
    const CreateQuery = `INSERT INTO vestings (address, value_total, value_paid, date_start, date_watched, date_end)`+
    ` VALUES ('${owner}', ${amount}, 0, to_timestamp(${dateStart}), to_timestamp(${dateStart}), to_timestamp(${dateEnd}));`

    const result = await Q(CreateQuery, false)
    return result ? true : false
}

async function PayValue (address: string, amount: number, date: number, vestingId: number) {
    const PaymentQuery = `UPDATE balances SET balance_available = balance_available+${amount} WHERE address = '${address}';`
    const VestingUpdateQuery = `UPDATE vestings SET date_watched = to_timestamp(${date}), value_paid = value_paid+${amount} WHERE id=${vestingId};`
    await Promise.all([
        Q(PaymentQuery),
        Q(VestingUpdateQuery)
    ]);
}

async function UpdateVestings () {

    const queryUnpaidVestings = `SELECT * FROM vestings WHERE value_paid < value_total;`;

    const unpaidVestings = await Q(queryUnpaidVestings)
    const date = Math.floor(new Date().getTime() / 1000)

    if (!unpaidVestings) {
        return false;
    }

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
                const elapsedPart = valueTotal - vesting.value_paid
                const calculatedPayment = valueTotal * paymentPart
                paymentValue = Math.floor(calculatedPayment < elapsedPart ? calculatedPayment : elapsedPart)
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
    let result = await Q(balanceQuery)
    if (!result || result.length === 0) {
        return(
            {
                balanceSheduled : 0,
                balanceAvailable : 0
            }
        )
    } else {
        return(
            {
                balanceSheduled : result[0].balance_scheduled - result[0].balance_available,
                balanceAvailable : result[0].balance_available - result[0].balance_withdrawn
            }
        )
    }
    
}

export {
    UpdateScheduledBalance,
    CreateVesting,
    UpdateVestings,
    FindLinkByReferral,
    FindLinkOwner,
    GetValueByKey,
    GetBalances,
    DeleteKey,
    SetValueByKey
  }