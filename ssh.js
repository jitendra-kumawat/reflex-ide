var express = require('express');
var Client = require('ssh2').Client;
var _ = require('lodash');
var {gUsername, gPassword} = require('./application/credentials');

const sshConnections = [];

function findConnection(ip) {
    return sshConnections.find((element) => element.config.host === ip);
}

// function createConnection(ip, username, password)

exports.connect = (ip, username, password) => {
    const promise = new Promise(resolve => {
        let connection = findConnection(ip);

        if (_.isNil(connection)) {
            connection = new Client();
            connection.on('ready', () => {
                console.log('READY connection with: ' + ip);
                sshConnections.push(connection)
                resolve('Connection Successfull.');
            }).connect({
                host: ip,
                username: username,
                password: password
            });
        } else {
            resolve(connection.config.host);
        }
    });

    return promise;
}

exports.cmd = (ip, cmd) => {

}