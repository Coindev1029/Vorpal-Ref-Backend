import { ReadLogs } from "../database/log/reader"

const logsNum = Number(process.argv[2]) ? Number(process.argv[2]): 20

ReadLogs(logsNum).then((res) => {
    console.log(res)
})