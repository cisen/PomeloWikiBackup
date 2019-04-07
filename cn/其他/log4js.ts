module.exports = {
    "appenders": {
        "displayConsole": {
            "type": "console"
        },
        // "other": {
        //     "type": "file",
        //     "filename": "${opts:base}/logs/${opts:serverId}.log",
        //     "maxLogSize": 1048576,
        //     "layout": {
        //         "type": "basic"
        //     },
        //     "backups": 5
        // }
    },
    "categories": {
        "default": {
            "appenders": [
                /*"other",*/"displayConsole"
            ],
            "level": "debug"
        }
    },
    "replaceConsole": true,
    "prefix": "${opts:serverId} ",
    "lineDebug": false,
    "errorStack": true
};
