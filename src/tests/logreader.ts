import { ReadLogs } from "database/log/reader"


const logsNum = Number(process.argv[1]) ? Number(process.argv[1]): 20

ReadLogs(logsNum).then((res) => {
    console.log(res)
})