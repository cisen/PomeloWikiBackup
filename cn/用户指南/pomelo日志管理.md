日志管理
===========

pomelo 日志是通过 [pomelo-logger](https://github.com/NetEase/pomelo-logger) 模块来管理的，[pomelo-logger](https://github.com/NetEase/pomelo-logger) 是对 [log4js](https://github.com/nomiddlename/log4js-node) 的简单封装，并提供了一些非常有用的 feature。

日志是通过 category 来进行管理与维护的，可以在log4js.json文件中进行配置  
```json
{
  "appenders": [
    {
      "type": "console"
    },
    {
      "type": "file",
      "filename": "./logs/con-log-${opts:serverId}.log",
      "pattern": "connector",
      "maxLogSize": 1048576,
      "layout": {
        "type": "basic"
      },
      "backups": 5,
      "category": "con-log"
    },
    {
      "type": "file",
      "filename": "./logs/rpc-log-${opts:serverId}.log",
      "maxLogSize": 1048576,
      "layout": {
        "type": "basic"
      },
      "backups": 5,
      "category": "rpc-log"
    },
    {
      "type": "file",
      "filename": "./logs/forward-log-${opts:serverId}.log",
      "maxLogSize": 1048576,
      "layout": {
        "type": "basic"
      },
      "backups": 5,
      "category": "forward-log"
    },
    {
     "type": "file",
     "filename": "./logs/rpc-debug-${opts:serverId}.log",
     "maxLogSize": 1048576,
     "layout": {
      "type": "basic"
     },
     "backups": 5,
     "category": "rpc-debug"
    },
    {
      "type": "file",
      "filename": "./logs/crash.log",
      "maxLogSize": 1048576,
      "layout": {
        "type": "basic"
      },
      "backups": 5,
      "category":"crash-log"
    },
    {
      "type": "file",
      "filename": "./logs/admin.log",
      "maxLogSize": 1048576,
      "layout": {
          "type": "basic"
        }
      ,"backups": 5,
      "category":"admin-log"
    },
    {
      "type": "file",
      "filename": "./logs/pomelo.log",
      "maxLogSize": 1048576,
      "layout": {
          "type": "basic"
        }
      ,"backups": 5,
      "category":"pomelo"
    }
  ],

  "levels": {
    "rpc-log" : "ERROR",
    "forward-log": "ERROR"
  },

  "replaceConsole": true,
  "lineDebug": false
}

```

从配置文件中可以看出，每一项（除了console项）都配了category，pomelo-logger 通过 getLogger 的第一个参数指定 category 来把该logger输出的日志定向到该category配置的文件或者其它输出方案。  
你可以添加自己的category，并在getLogger指定该category，你就可以把日志定向到该category所配的输出方案  
**注意**：不建议使用不指定category的方式来进行配置，这样子所有的logger都会定向到该全局的输出方案  

### 日志category  
在pomelo中有些指定的category用于输出日志：  
* pomelo： 输出 pomelo 框架里的日志  
* admin-log： 输出 pomelo-admin 用于监控client登陆master时输出的日志  
* crash-log： 输出服务器crash异常时的日志信息  
* rpc-debug： 输出 rpc-debug 的日志，需要开启 [rpc-debug 模式](https://github.com/NetEase/pomelo/wiki/pomelo-0.6%E7%89%88%E6%96%B0%E7%89%B9%E6%80%A7#rpc-debug%E6%97%A5%E5%BF%97)  
* forward-log : 输出从前端服务器转发到后端服务器的请求日志  
* rpc-log: 输出 rpc filter 上的日志  
* con-log: 输出 handler filter 上的日志  

### 日志levels
可以通过指定日志的levels来控制输出的日志  
```javascript
"levels": {
    "rpc-log" : "ERROR",
    "forward-log": "ERROR"
}
```

日志等级从左到右依次提升：  
```
TRACE, DEBUG, INFO, WARN, ERROR, FATAL
```

在levels上等级配的越低，输出的日志范围则越大  
相反，则输出的日志范围越小  
比如：
```javascript
var rpc_logger = require('pomelo-logger').getLogger('rpc-log', __filename);
rpc_logger.info("msg");
```

这里rpc_logger的输出日志等级是 INFO，而 levels 上配的是 ERROR  
那么该日志就不会被输出到对应的appenders上面  
你需要levels改成低于 INFO 的级别，比如 DEBUG 才会把 rpc_logger 的日志输出  

### 日志配置项说明
* type： 指定appenders的类型，可以是console， dataFile， file 等，具体详见 [log4js](https://github.com/nomiddlename/log4js-node/wiki/Appenders)
* filename： 指定输出文件的路径
* pattern：指定输出日志的pattern
* maxLogSize：指定输出日志的最大大小
* layout：指定输出的layout样式
* backups：指定最大输出的文件数目
* category：指定该appender对应的category，如果没有该项，说明该appender是一个全局的appender
* replaceConsole：指定是否替换默认的console
* lineDebug：指定是否开启debug显示日志行数
