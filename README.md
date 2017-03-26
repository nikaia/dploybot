# dploybot

Deploy your deploybot.com projects from CLI


## Install

```
npm install -g dploybot
```


## Update

```
npm update -g dploybot
```

## Usage
```
 dploybot -h

  Usage: dploybot <command> [options]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

  Commands:

    dploybot --version                       Print version
    dploybot config                          Create config file
    dploybot openconfig                      Open config file for edition
    dploybot repos                           Display list of all repositories
    dploybot envs <repo>                     Displays configured environments for <repo>
    dploybot deploy <repo> <env> [comment]   Deploy environment last revision on <env> for <repo>
```

