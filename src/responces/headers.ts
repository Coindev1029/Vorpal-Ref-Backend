import { Request, Response, NextFunction } from "express";

export function SetupHeaders (res: Response) {
    res.setHeader("Access-Control-Allow-Origin", "*" );
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE");
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export function SetupHeadersGlobal(req: Request, res: Response, next: NextFunction) {
    res.setHeader("Access-Control-Allow-Origin", "*" );
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE");
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
}