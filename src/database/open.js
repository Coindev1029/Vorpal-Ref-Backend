const { connection } = require('./connection');

async function RequestPublicData ( project  = "all" ) {
     const publicQuery = `SELECT * FROM common_data WHERE key IN (SELECT key FROM public_keys WHERE project = 'all' OR project = '${project}');`
     const pd = await connection.query(publicQuery)
     const res = new Map()
     pd.rows.forEach((rw) => {
        console.log(rw)
        console.log(rw.key)
        console.log(rw.value)
        res.set(rw.key, rw.value)
     })
     console.log(res)
     console.log(Object.fromEntries(res))
     return Object.fromEntries(res)
}

module.exports = {
    RequestPublicData
}