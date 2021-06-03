const jwt = require("jsonwebtoken");

module.exports = (req,res,next)=>{
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decode = jwt.verify(token,'mysecretjwtstringfordevblogapp');
        req.UserData = decode;
        next();
    } catch (error) {
        req.UserData = null;
        next();
    }
}