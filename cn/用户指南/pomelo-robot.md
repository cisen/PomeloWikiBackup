#pomelo-robot
pomelo-robot 是一个用来对pomelo游戏服务器框架进行性能测试的工具, 也可以测试其他基于socket.io服务的性能. 
该模块可以采用单机或者分布式测试两种模式. 

#功能
对游戏项目进行自动化的性能测试和分析, 为游戏服务器提供机器人及其运行脚本, 最终输出性能测试分析报告. 
pomelo-robot 模块通过沙箱的方式执行用户自定义的JS脚本. 运行过程中各客户端会自动把数据汇报给主节点, 主节点把所有节点的测试数据进行提炼汇总, 计算出平均响应时间等统计数据, 然后定时发给内置的HTTP服务器进行界面展示. 

#模块结构
模块内部运行结构如下：

![](https://raw.github.com/palmtoy/ImageBucket/master/Pomelo/Robot/1.jpg)

"Master"负责收集所有"Client"的运行数据并展示统计结果. <br/>
"Client"负责在多个沙箱("User")中运行自定义脚本, 同时向"Master"汇报运行数据. 

##使用示例
创建Node.js测试工程, 工程目录结构如下图所示:<br/>

![](https://raw.github.com/palmtoy/ImageBucket/master/Pomelo/Robot/2.jpg)

安装依赖库:<br/>
``` javascript
npm install pomelo-robot
```

###config.json配置
"config.json"分为两种运行环境: 开发(dev)或生产(prod)环境, "prod"环境的文件内容如下：
``` javascript
{
  "master": {"host": "127.0.0.1", "port":8888, "webport":8889, "interval":500}
}
```
"master"：主服务器的IP, 与客户端的通讯端口, WEB界面端口, 间隔多少毫秒运行一个自定义JS脚本(如:lord.js). <br/>

###实现自定义脚本配置
#####在"env.json"中配置自定义脚本路径:<br/>
``` javascript
{
  "env": "prod",
  "script": "/app/script/lord.js"
}
```

#####实现自定义脚本"lord.js": 
``` javascript
// ...
var queryHero = require(cwd + '/app/data/mysql').queryHero;
// ...
function entry(host, port, token, callback) {
  // ...
  // 初始化socketClient
  pomelo.init({host: host, port: port, log: true}, function() {
    pomelo.request('connector.entryHandler.entry', {token: token}, function(data) {
	  // ...
      afterLogin(pomelo,data);
    });
  });
}
// ...
```

"/app/data/mysql.js"中查找登录角色的代码如下：
``` javascript
// ...
queryHero = function(client,limit,offset,cb){
    var users = [];
    var sql = "SELECT User.* FROM User,Player where User.id = Player.userId and User.name like 'pomelo%' limit ? offset ? ";
	// ...
};
// ...
``` 

上面的代码运行在沙箱中: 首先登录游戏服务器, 登录成功后回调"afterLogin"函数, 用户可以进行后续的相关操作. <br/>

###启动入口文件app.js
"app.js"会根据启动参数判断是启动"master"服务还是"client"服务. <br/>
``` javascript
var envConfig = require('./app/config/env.json');
var config = require('./app/config/' + envConfig.env + '/config');
//...
if (mode === 'master') {
    robot.runMaster(__filename);
} else {
    var script = (process.cwd() + envConfig.script);
    robot.runAgent(script);
}
// ...
``` 
具体代码可参考[工程](https://github.com/NetEase/pomelo-robot-demo). <br/>

###运行测试
运行如下命令, 启动"master"服务: <br/>
"node app.js master" <br/>
打开浏览器访问地址"http://masterIp:8889" <br/>

运行如下命令, 启动"client"服务: <br/>
"node app.js client" <br/>
注: 可以在多台机器上启动"client"服务进行性能和压力测试.

WEB界面会显示连接到"master"的"client"数量, 可以在"Per Agent Users"一栏中配置每个"client"将要运行的沙箱数量, 点击"Go"按钮通知所有的"client"开始运行. WEB界面会定时获取后台数据进行展示. <br/>
运行界面如下图所示：<br/>

![](https://raw.github.com/palmtoy/ImageBucket/master/Pomelo/Robot/3.jpg) 

![](https://raw.github.com/palmtoy/ImageBucket/master/Pomelo/Robot/4.jpg) 

###其他
源代码请参考[工程](https://github.com/NetEase/pomelo-robot) 