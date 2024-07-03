import { runQuery as Q } from './connection';

export async function RequestPublicData ( project  = "all" ) {
     const publicQuery = `SELECT * FROM common_data WHERE key IN (SELECT key FROM public_keys WHERE project = 'all' OR project = '${project}');`
     const pd = await Q(publicQuery);
     const res = new Map()
     
     if (pd) pd.forEach((rw) => {
        res.set(rw.key, rw.value)
     })

     return Object.fromEntries(res)
}
