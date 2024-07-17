import { runQuery as Q } from './connection';

const defaultUserData = {
    login: "",
    rights: "user",
    address: "0x0000000000000000000000000"
}

export async function RequestUsers () {
    const userQuery = `SELECT address, login, rights FROM users;`
    const userData = await Q(userQuery)
  
    return ( {
        success: userData ? true : false,
        error: '',
        content: userData || []
    })
}

export async function UpdateUser (data = defaultUserData) {
    if (data === defaultUserData || !data.address || data.login === undefined || data.rights === undefined) {
        return ({
            success: false,
            err: "Failed to update user: invalid entry"
        });
    }

    const addr = data.address.toLowerCase()

    const checkQuery = `SELECT * FROM users WHERE address = '${addr}';`
    const checking = await Q(checkQuery);
    if (!checking || checking.length < 1) {
        return ({
            success: false,
            err: 'User not found'
        });
    }

    const updateQuery = `UPDATE users SET login = '${data.login}', rights='${data.rights}' WHERE address = '${addr}';`
    const updating = await Q(updateQuery)
    return( {
        success: updating ? true : false,
        err: updating ? "" : "Unknown"
    })

}


export async function CreateUser (data = defaultUserData) {
    if (data === defaultUserData || !data.address || !data.login || !data.rights) {
        return ({
            success: false,
            err: "Failed to create user: invalid entry"
        });
    }
    
    const addr = data.address.toLowerCase()

    const checkQuery = `SELECT * FROM users WHERE address = '${addr}';`
    const checking = await Q(checkQuery);
    if (checking && checking.length > 0) {
        return ({
            success: false,
            err: 'User already exists'
        });
    }

    const creationQuery = `INSERT INTO users (login, rights, address) VALUES ('${data.login}', '${data.rights}', '${addr}');`
    const result = await Q(creationQuery)

    return( {
        success: result ? true : false,
        err: result ? "" : "Unknown"
    })
}

export async function DeleteUser (address = defaultUserData.address) {
    if (address === defaultUserData.address || !address) {
        return false;
    }

    const addr = address.toLowerCase()

    const checkCount = await RequestUsers ();
    if (checkCount.content.length < 2) {
        return ({
            success: false,
            err: 'Cannot remove the last user'
        });
    }

    const checkQuery = `SELECT * FROM users WHERE address = '${addr}';`
    const checking = await Q(checkQuery);
    
    if (checking && checking.length < 1) {
        return ({
            success: false,
            err: 'User already not exists'
        });
    }

    const deleteQuery = `DELETE FROM users WHERE address = '${addr}';`
    const result = await Q(deleteQuery)

    return( {
        success: result ? true : false,
        err: result ? "" : "Unknown"
    })
}
