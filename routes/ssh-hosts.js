var express = require('express');
var router = express.Router();
const SSHUtil = require('../ssh');
const credentials = require('../application/config');

const sshConnections = [];
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a host resource.');
});

router.get('/ssh', async (req, res, next) => {
    const ip = req.query.ip;
    const username = req.query.username ? req.query.username : credentials.username;
    const password = req.query.password ? req.query.password : credentials.password;

    console.log('Connecting to: ' + ip, username, password);

    try {
        const connIp = await (SSHUtil.connect(ip, username, password));
        res.send(connIp);
    } catch (error) {
        console.error(error);
    }
});

router.get('/cmd', async (req, res, next) => {

    try {
        const ip = req.query.ip ? req.query.ip : credentials.defaultIP;
        let cmd;
        if (req.query.cmd) {
            cmd = req.query.cmd;
        } else {
            throw ('cmd is required parameter');
        }

        const path = req.query.path ? req.query.path : credentials.defaultPath;

        cmd = `cd ${path} && ${cmd}`;

        console.log('Running command on: ' + ip + ' in folder ' + path);

        const response = await (SSHUtil.cmd(ip, cmd));
        res.send(response.toString());
    } catch (error) {
        console.error('Error in command execution', error);
        throw(error);
    }
});

router.get('/dir', async (req, res, next) => {
    const ip = req.query.ip ? req.query.ip : credentials.defaultIP;
    const path = req.query.path ? req.query.path : credentials.defaultPath;

    const response = await (SSHUtil.dir(ip, path));

    return res.send(response);
});

router.get('/file', async (req, res, next) => {
    const ip = req.query.ip ? req.query.ip : credentials.defaultIP;
    const path = req.query.path ? req.query.path : credentials.defaultPath;

    const response = await (SSHUtil.file(ip, path));
    return res.send(response);
})

module.exports = router;