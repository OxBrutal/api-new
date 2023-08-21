const { limitCount, limitPremium } = require('../lib/settings');
const { User } = require('./model');
const nodemailer = require('nodemailer')
const halaman = require('../lib/email')

    async function addUser(username, email, password, apikey, id, nomorWa) {
        let obj = { username, email, password, apikey, defaultKey: apikey, jid: id, nomorWa, status: null, premium: null, admin: null, limit: limitCount, totalreq: 0 };
        User.create(obj);
    }
    module.exports.addUser = addUser

    async function checkUsername(username) {
        let users = await User.findOne({username: username});
        if(users !== null) {
            return users.username;
        } else {
            return false;
        }
    }
    module.exports.checkUsername = checkUsername;
    
    async function checkEmail(email) {
        let users = await User.findOne({email: email});
        if(users !== null) {
            return users.email;
        } else {
            return false;
        }
    }
    module.exports.checkEmail = checkEmail;
    
    async function checkNomor(nomor) {
        let users = await User.findOne({nomorWa: nomor});
        if(users !== null) {
            return users.nomorWa;
        } else {
            return false;
        }
    }
    module.exports.checkNomor = checkNomor;
    
    async function checkAdmin(admin) {
        let users = await User.findOne({admin: admin});
        if(users !== null) {
            return users.admin;
        } else {
            return false;
        }
    }
    module.exports.checkNomor = checkAdmin;

    async function getApikey(id) {
        let users = await User.findOne({_id: id});
        return { apikey: users.apikey, username: users.username };
    }
    module.exports.getApikey = getApikey;

    async function cekKey(apikey) {
        let db = await User.findOne({apikey: apikey});
        if(db === null) {
            return false;
        } else {
            return db.apikey;
        }
    }
    module.exports.cekKey = cekKey;
    
    async function limitAdd(apikey) {
        let key = await User.findOne({apikey: apikey});
        let min = key.limit - 1;
        let plus = key.totalreq + 1;
        User.updateOne({apikey: apikey}, {limit: min, totalreq: plus}, function (err, res) {
            if (err) throw err;
        })
    }
    module.exports.limitAdd = limitAdd

    async function checkLimit(apikey) {
        let key = await User.findOne({apikey: apikey});
        return key.limit;
    }
    module.exports.checkLimit = checkLimit;

    async function isLimit(apikey) {
        let key = await User.findOne({apikey: apikey});
        if (key.limit <= 0){
            return true;
        } else {
            return false;
        }
    }
    module.exports.isLimit = isLimit

    async function resetAllLimit() {
        let users = await User.find({});
        users.forEach(async(data) => {
            let { premium, username } = data
            if (premium !== null) {
                return User.updateOne({username: username}, {limit: limitPremium}, function (err, res) {
                    if (err) throw err;
                })   
            } else {
                return User.updateOne({username: username}, {limit: limitCount}, function (err, res) {
                    if (err) throw err;
                })
            }
        })
    }
    
    module.exports.resetAllLimit = resetAllLimit
    
    //send email
    
    async function sendEmail(email, idnya, hostname) {
    const verifykan = "https://"+hostname+"/verification/verify?id="+idnya
    const mailer = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "tesheroku123@gmail.com",
        pass: "sjvzqsfltvuyitfy"
    }
    })
    mailer.sendMail({
        from: `"KirBotz Rest Api's"`,
        to: email,
        subject: "Please Verify",
        html: halaman.email(verifykan)
    }, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log("Succes Send Email ke " + email)
        }
    })
    }
    module.exports.sendEmail = sendEmail;
    
    async function verifyUser(id) {
        let users = await User.findOne({jid: id});
        if (users.jid !== null) {
            return User.updateOne({jid: id}, {status: "Terverifikasi"}, function (err, res) {
            if (err) throw err;
        });
        } else {
            return false
        };
    };
    module.exports.verifyUser = verifyUser;

   async function checkVerify(username) {
        let users = await User.findOne({username: username});
        if (users.status !== null) {
            return false;
        } else {
            return users.username;
        };
    };
    module.exports.checkVerify = checkVerify;
