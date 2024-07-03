import { Request, Response, NextFunction } from "express";
import { RequestUserData, UpdateUserDataAction } from "../models/admin/user"
import { RequestAdminData, SaveNewData } from "../models/admin"
import { RequestPublicData } from "../models/open"

export const GetProjectData = async (req: Request, res: Response) => {

    const resp = JSON.stringify({
      content: await RequestPublicData(req.params.project)
    })
  
    res.status(200).send(resp)
  
  }

export const AdminDataRequest = async (req: Request, res: Response) => {

  const authResult = await RequestAdminData(req.body)
  console.log (authResult)
  res.status(200).send(JSON.stringify({
     data : authResult
  }))
}

export const AdminSaveData = async (req: Request, res: Response) => {

  const saveResult = await SaveNewData (req.body)
  res.status(200).send(JSON.stringify({
    data : saveResult
 }))
}

export const GetAdminUserData = async (req: Request, res: Response) => {

  const Users = await RequestUserData ( req.body )

  res.status(200).send(JSON.stringify({
    data : Users
 }))
}

export const AdminUpdateUserData = async (req: Request, res: Response) => {


  const updateReport = await UpdateUserDataAction (req.body)

  res.status(200).send(JSON.stringify({
    data : updateReport
 }))
}