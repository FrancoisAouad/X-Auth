import jwt from 'jsonwebtoken';

class Service {
    constructor() {}

    getUser(authHeader: any) {
        const secret: any = process.env.SECRET_ACCESS_TOKEN;
        //split auth header to get bearer token
        const token = authHeader.split(' ')[1];
        //verify the token and decoded it using
        const decoded: any = jwt.verify(token, secret);
        //get the id field from the decoded token
        const id = decoded.aud;
        //return the id value
        return id;
    }
}
export default Service;
