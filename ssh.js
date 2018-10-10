var express = require('express');
var Client = require('ssh2').Client;
var _ = require('lodash');
var credentials = require('./application/config');

const sshConnections = [];

function findConnection(ip) {
    return sshConnections.find((element) => element.config.host === ip);
}

createConnection = (ip) => {
    return new Promise(resolve => {
        connection = new Client();
        connection.on('ready', () => {
            console.log('New connection ready with: ' + ip);
            sshConnections.push(connection)
            resolve(connection);
        }).connect({
            host: ip,
            username: credentials.username,
            password: credentials.password
        });
    });
};

getConnection = async (ip) => {

    const promise = new Promise(resolve => {
        let connection = findConnection(ip);

        if (_.isNil(connection)) {
            createConnection(ip)
                .then(connection => {

                    resolve(connection);
                })
        } else {
            resolve(connection);
        }

    });

    return promise;
}

exports.connect = async (ip) => {
    const promise = new Promise(resolve => {
        getConnection(ip)
            .then(connection => {
                resolve('Connection ready with: ' + ip);
            });
    });

    return promise;
}

exports.cmd = async (ip, cmd) => {
    const promise = new Promise(resolve => {
        getConnection(ip)
            .then(connection => {
                connection.exec(cmd, (error, stream) => {
                    if (error) {
                        console.error('Error when executing the command on host machine,', error);
                        resolve(error);
                    }

                    stream.on('data', (data) => resolve(data));
                    stream.stderr.on('data', (data) => resolve(data));
                    stream.on('close', (code, signal) => {
                        console.error('Process close when executing command', code, signal);
                        resolve(signal);
                    });
                });
            });
    });

    return promise;
}

exports.dir = async (ip, path) => {
    const promise = new Promise(resolve => {
        getConnection(ip)
            .then(connection => {
                connection.sftp((err, sftp) => {
                    if (err) throw err;

                    sftp.readdir(path, (err, list) => {
                        if (err) throw err;
                        resolve(list);
                        // connection.end();
                    });

                });
            });
    });

    return promise;
}

exports.file = async (ip, path) => {
    const promise = new Promise(resolve => {
        getConnection(ip)
            .then(connection => {
                connection.sftp((err, sftp) => {
                    if (err) throw err;

                    sftp.open(path, 'r', (err, fd) => {
                        if (err) throw err;
                        sftp.fstat(fd, (err, stats) => {
                            if (err) throw err;

                            var bufferSize = stats.size,
                                chunkSize = 16384,
                                buffer = new Buffer(bufferSize),
                                bytesRead = 0,
                                errorOccured = false;

                            while (bytesRead < bufferSize && !errorOccured) {
                                if ((bytesRead + chunkSize) > bufferSize) {
                                    chunkSize = (bufferSize - bytesRead);
                                }
                                sftp.read(fd, buffer, bytesRead, chunkSize, bytesRead, callbackFunc);
                                bytesRead += chunkSize;
                            }

                            var totalBytesRead = 0;
                            var data = [];

                            function callbackFunc(err, bytesRead, buf, pos) {
                                if (err) {
                                    writeToErrorLog("downloadFile(): Error retrieving the file.");
                                    throw err;
                                }
                                totalBytesRead += bytesRead;
                                data.push(buf);
                                if (totalBytesRead === bufferSize) {
                                    m_fileBuffer = Buffer.concat(data);
                                    resolve(m_fileBuffer.toString());
                                }
                            }
                        });
                    });
                });
            });
    });

    return promise;
}