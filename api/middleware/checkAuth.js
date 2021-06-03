const jwt = require("jsonwebtoken");

module.exports = (req,res,next)=>{
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decode = jwt.verify(token,'mysecretjwtstringfordevblogapp');
        req.UserData = decode;
        next();
    } catch (error) {
        res.status(404);
        return res.json({
            message:"Authentication Failed",
            ok:false
        });
    }
}