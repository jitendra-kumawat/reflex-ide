var express = require('express');
var router = express.Router();
const SSHUtil = require('../ssh');


const globalUsername = 'root';
const globalPassword = 'guavus@123';

const sshConnections = [];
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a host resource.');
});

router.get('/ssh', async (req, res, next) => {
    const ip = req.query.ip;
    const username = req.query.username ? req.query.username : globalUsername;
    const password = req.query.password ? req.query.password : globalPassword;

    console.log('Connecting to: ' + ip, username, password);

    try {
        const connIp = await (SSHUtil.connect(ip, username, password));
        res.send(connIp);
    } catch (error) {
        next(error);
    }
});

module.exports = router;