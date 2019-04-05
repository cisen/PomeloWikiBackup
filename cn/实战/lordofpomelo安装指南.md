# LordOfPomelo介绍

LordOfPomelo是一个基于Pomelo游戏框架开发的MMORPG(大型多人在线角色扮演游戏)的游戏Demo, 具有角色、怪物、装备、战斗、聊天、技能、升级系统、任务系统、组队、副本等较为完整的游戏功能. 

LordOfPomelo服务端采用了Pomelo框架, 客户端采用了基于HTML5的colorbox框架, 在大约3个月的时间内实现快速开发. 服务端约8000行代码, 客户端约6000行代码. 支持单场景800人以上的并发访问, 响应时间控制在100ms左右. 

# 运行环境
* [nodejs](http://nodejs.org/)
* Windows、Linux 或 MacOS 操作系统
* MySql 数据库

# 安装LordOfPomelo

## 下载源码

`git clone https://github.com/NetEase/lordofpomelo.git`

## 安装依赖包 

进入目录：
`cd lordofpomelo`

安装依赖包：
`sh npm-install.sh`(Windows: `npm-install.bat`)

# 创建MySql数据库

## 创建数据库
sql文件路径：./game-server/config/schema/Pomelo.sql

* 安装MySql数据库(略)
* 登录MySql:
`mysql –u用户名 –p密码`
(登录成功提示符：mysql>)
* 创建数据库:
`mysql> create database Pomelo;`
* 选择数据库:
`mysql> use Pomelo;`
* 导入sql文件:
`mysql> source ./game-server/config/schema/Pomelo.sql`

## 修改数据库配置
数据库配置文件为./shared/config/mysql.json
```json
{
  "development": {
   "host" : "127.0.0.1",
    "port" : "3306",
    "database" : "Pomelo",
    "user" : "xy",
    "password" : "dev"
  },
  "production": {
   "host" : "127.0.0.1",
    "port" : "3306",
    "database" : "Pomelo",
    "user" : "xy",
    "password" : "dev"
  }
}
```

将"development"环境下的的数据库配置修改为实际的配置. 

# 运行游戏
需要分别启动game-server和web-server. 
game-server的启动方式：

* `pomelo start` (pomelo的安装方法参考[pomelo快速使用指南](https://github.com/NetEase/pomelo/wiki/pomelo快速使用指南)) 注: 如果上次启动的进程没有完全退出, 可以使用`pomelo kill --force`来结束所有node进程. 

web-server的启动方式：

* `cd web-server && node app`

# 访问游戏
本地运行, 直接在浏览器中访问 http://localhost:3001 或者 http://127.0.0.1:3001

浏览器需支持websocket, 推荐使用chrome. 

# 相关问题解决办法
1. 端口冲突

修改服务器配置文件./game-server/config/servers.json,内容如下：
```json
{
  "development": {
    "connector": [
      {"id": "connector-server-1", "host": "127.0.0.1", "port": 3150, "clientPort": 3010, "frontend": true},
      {"id": "connector-server-2", "host": "127.0.0.1", "port": 3151, "clientPort":3011, "frontend": true}
    ],
    "area": [
      {"id": "area-server-1", "host": "127.0.0.1", "port": 3250, "area": 1}, 
      {"id": "area-server-2", "host": "127.0.0.1", "port": 3251, "area": 2}, 
      {"id": "area-server-3", "host": "127.0.0.1", "port": 3252, "area": 3}, 
      {"id": "instance-server-1", "host": "127.0.0.1", "port": 3260, "instance": true},
      {"id": "instance-server-2", "host": "127.0.0.1", "port": 3261, "instance": true},
      {"id": "instance-server-3", "host": "127.0.0.1", "port": 3262, "instance": true}
    ],
    "chat": [
      {"id":"chat-server-1","host":"127.0.0.1","port":3450}
    ],
    "path": [
      {"id": "path-server-1", "host": "127.0.0.1", "port": 3550}
    ],
    "auth": [
      {"id": "auth-server-1", "host": "127.0.0.1", "port": 3650}
    ],
    "gate": [
      {"id": "gate-server-1", "host": "127.0.0.1", "clientPort": 3014, "frontend": true}
    ],
    "manager": [
      {"id":"manager-server-1","host":"127.0.0.1","port":3750}
    ]
  },
  "production": {
    // ...
  }
}
```

该配置文件分别定义了development和production环境下的各个服务器的配置信息, 包括服务器类型, 地址, 端口号等, production环境下的参数和development环境的结构类似. frontend参数为true时表示前端服务器. 端口冲突时可以修改相应的端口号. 

或者修改文件./web-server/public/js/config/config.js, 内容如下：
```json
__resources__["/config.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
  module.exports = { 
    IMAGE_URL:'http://pomelo.netease.com/art/',
    GATE_HOST: window.location.hostname,
    GATE_PORT:3014
  };
}};
```
该文件是web服务器的常用配置信息: IMAGE_URL是图片等静态资源的地址; GATE_HOST是gate服务器接受websocket的入口, 所有的websocket请求须先经过gate服务器获取connector服务器的id, 然后再和connector建立连接; GATE_PORT是前端gate的端口号. manager服务器主要负责是副本和组队功能.

# 配置文件汇总说明
* ./game-server/config/master.json

master服务器的配置信息, 包括development和production环境下的服务器地址、端口号等. 

master服务器负责启动、关闭各服务器, 并监控所有服务器的状态信息. 
* ./game-server/config/servers.json

area、connector等服务器的配置信息, 包括development和production环境下的服务器地址、端口号等. 由于connector是前端服务器, 用于接收并转发玩家的请求, 所以会有clientPort. 

* ./shared/config/mysql.json

数据库配置信息, 在安装LordOfPomelo之后需要根据数据库安装的实际情况修改development和production环境的参数. 

* ./web-server/public/js/config/config.js

客户端图片等静态资源及HTTP访问地址的配置. 

# 登录问题说明
LordOfPomelo提供了注册新用户以及使用github, google, facebook, twitter和新浪微博授权的方式进行登录. 在使用github等授权方式进行登录时, 需要自己通过OAuth授权认证, 然后修改配置文件中的对应信息(./web-server/config/oauth.json). 

