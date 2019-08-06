var request = require("superagent"),
    _ = require("underscore"),
    config = require("./config").get(),
    logger = require("./logger");

function reportError(err) {
    if (err.response.error.text) {
        logger.fatalWithMessages('Deploybot api error : ', JSON.parse(err.response.error.text).errors);
    }

    logger.fatal('Deploybot api error  - ' + err);
}

function api(endpoint, method) {
    var vmethod = typeof method === 'undefined' ? 'GET' : 'POST';
    var url = 'https://' + config.account + '.deploybot.com/api/v1/' + endpoint;
    var req = vmethod === 'GET' ? request.get(url) : request.post(url);

    return req
        .set('Content-Type', 'application/json')
        .set('User-Agent', 'nikaia-dploybot')
        .set('X-Api-Token', config.token);
}

function getRepositories(cb, uri = 'repositories', carry = {entries:[]}) {
    api(uri).end(function (err, res) {
        if (err) {
            reportError(err);
        }

        if (! res.body.meta.next_uri) {
            return cb(mergedEntries(res.body.entries, carry.entries));
        }

        return getRepositories(cb, res.body.meta.next_uri, mergedEntries(res.body.entries, carry.entries));
    });
}

const mergedEntries = (a, b) => ({entries: [...a, ...b]})

function repo(name, cb) {
    logger.spin('Fetching repos, please wait ...');
    getRepositories(function (repos) {
        var repository_id = null;
        _.each(repos.entries, function (repo) {
            if (name === repo.title) {
                repository_id = repo.id;
            }
        });

        if (!repository_id) {
            logger.fatal('Cannot find repo [' + name + ']');
        }

        cb(repository_id);
    });
}

function getUsers(cb) {
    api('users').end(function (err, res) {
        if (err) {
            reportError(err);
        }

        cb(res.body.entries);
    });
}

function userByEmail(email, cb) {
    logger.spin('Fetching user, please wait ...');
    getUsers(function (users) {
        var foundUser = null;

        _.each(users, function (user) {
            if(user.email === email) {
                 foundUser = user;
            }
        });

        if (!foundUser) {
            logger.fatal('Cannot find user for email [' + email + ']');
        }

        cb(foundUser);
    });
}

function configuredUser(cb) {
    userByEmail(config.email, function (user) {
        cb(user);
    });
}

function getEnvironments(repoName, cb) {
    repo(repoName, function (repository_id) {
        logger.spin('Fetching environments, please wait ...');
        api('environments?repository_id=' + repository_id).end(function (err, res) {
            if (err) {
                reportError(err);
            }
            cb(res.body.entries);
        });
    });
}

function environment(repoName, serverEnvironmentId, cb) {
    logger.log('Getting server environments');

    api(repoName + '/server_enironments/' + serverEnvironmentId).end(function (err, res) {
        if (err) {
            reportError(err);
        }

        cb(res.body);
    });
}

function deploy(environment_id, revision, user_id, comment, cb) {
    var deployment = {
        environment_id: environment_id,
        user_id: user_id,
        deployed_version: revision
    };

    if (comment) {
        release.comment = comment;
    }

    api('deployments', 'POST')
        .send(deployment)
        .end(function (err, res) {
            if (err) {
                reportError(err);
            }

            cb(res.body);
        });
}

function deployment(deployment_id, cb) {
    api('/deployments/' + deployment_id).end(function (err, res) {
        if (err) {
            reportError(err);
        }

        cb(res.body);
    });
}

/*
 |--------------------------------------------------------------------------
 | Exports
 |--------------------------------------------------------------------------
 */
exports.getRepositories = getRepositories;
exports.repo = repo;
exports.getEnvironments = getEnvironments;
exports.environment = environment;
exports.deploy = deploy;
exports.deployment = deployment;
exports.configuredUser = configuredUser;
