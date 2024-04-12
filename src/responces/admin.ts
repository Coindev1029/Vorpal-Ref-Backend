import { RequestUserData, UpdateUserDataAction } from "../admin/user"
import { RequestAdminData, SaveNewData } from "../admin"
import { RequestPublicData } from "../database/open"

export const GetProjectData = async (req, res) => {

    const resp = JSON.stringify({
      content: await RequestPublicData(req.params.project)
    })
  
    res.status(200).send(resp)
  
  }

export const AdminDataRequest = async (req, res) => {

  const authResult = await RequestAdminData(req.body)
  console.log (authResult)
  res.status(200).send(JSON.stringify({
     data : authResult
  }))
}

export const AdminSaveData = async (req, res) => {

  const saveResult = await SaveNewData (req.body)
  res.status(200).send(JSON.stringify({
    data : saveResult
 }))
}

export const GetAdminUserData = async (req, res) => {

  const Users = await RequestUserData ( req.body )

  res.status(200).send(JSON.stringify({
    data : Users
 }))
}

export const AdminUpdateUserData = async (req, res) => {


  const updateReport = await UpdateUserDataAction (req.body)

  res.status(200).send(JSON.stringify({
    data : updateReport
 }))
}