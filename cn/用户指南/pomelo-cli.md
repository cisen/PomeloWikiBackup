##pomelo-cli 交互式命令行
pomelo-cli 提供了一个交互式命令行，开发者可以使用这个工具对使用[pomelo](https://github.com/NetEase/pomelo)框架开发的应用和服务进行运维  

### 安装
```
npm install -g pomelo-cli
```

### 登录
使用命令  
```
pomelo-cli -h host -P port -u username -p password  
```

默认的pomelo-cli登录参数  
```
pomelo-cli -h 127.0.0.1 -P 3005 -u monitor -p monitor
```

登录用户的用户名密码权限等级是在config/adminUser.json里面进行配置的  
具体可以参考[admin user](https://github.com/NetEase/pomelo-admin#user-level-control)  

对于kill, stop, add ,enable, disable 等命令是受权限限制的，非admin用户将无权进行操作  

### 命令
#### use  
使用某个context来进行操作，context可以是serverId或者是all  
use {serverId|all}  
之后你的命令就会被应用到该context  
```
example: use area-server-1  
example: use all  
```

#### quit
敲入 **quit** 你就会退出 pomelo-cli  

#### kill
关闭所有服务器  
```
example: kill
```
**注意**：小心使用该命令  

#### exec

具体操作请看 : 
https://github.com/NetEase/pomelo/wiki/pomelo-cli-exec%E5%91%BD%E4%BB%A4%E4%BD%BF%E7%94%A8

执行脚本文件  
在这之前, 需要设置app ****master****服务器配置: 
```
app.configure('production|development', 'master', function() {
        app.enable('systemMonitor');
}
```

exec {filepath}  
filepath 可以是相对于pomelo-cli命令执行的路径  
```
example : 
use chat-server-1 [use all 不可以] //必须要指定服务器Id
exec xxx.js 
```
等价于 exec pwd/xxx.js  

filepath 也可以是以 / 开头的绝对路径  
```
example : exec /home/user/xxx.js
```

脚本文件的执行是通过 [vm](http://nodejs.org/api/vm.html) 模块  
vm context 是  [ node_modules/pomelo/pomelo-admin/lib/modules/scripts.js文件 ]
```
var context = {
  app: this.app,
  require: require,
  os: require("os"),
  fs: require("fs"),
  process: process,
  util: util
};
```
只能使用context里引用的模块, 其他模块都不可用;例如 console.log() 也会报undefined.

执行结果是通过 **result** 参数  
因此，你在脚本文件里，你需要使用**result**来得到返回结果  
getCPUs.js
```
var cpus = os.cpus();
result = util.inspect(cpus,true,null);
```

#### get
等价于 app.get(key)  
get {key}  

#### set
等价于 app.set(key, value)  
set {key} {value}  
**注意**：value 必须是 string 或者简单的value  

#### add
动态添加服务器到pomelo集群中  
add 参数是来自于servers.json配置文件中的 key = value 对
```
example: add host=127.0.0.1 port=3451 serverType=chat id=chat-server-2  
example: add host=127.0.0.1 port=3152 serverType=connector id=connector-server-3 clientPort=3012 frontend=true  
```

**注意**：添加服务器必须使用正确完整的参数，否则添加的服务器会处于bad模式  

#### stop
停止服务器，以serverId作为参数  
stop {serverId}  
```
example: stop area-server-1 
```

#### show
查看信息比如：servers, connections  
可以查看如下信息：  
servers, connections, logins, modules, status, proxy, handler, components, settings  
```
example: show servers  
example: show connections  
example: show proxy  
example: show handler  
example: show logins  
```
**注意**: 只有查看servers的时候是可以在任何一个context下面的，其他的所有的信息查看必须在某一个server的context下进行。

#### enable
enable admin module 设置 或者 enable app 设置  
enable module {moduleId}  
enable app {settings}  
```
example: enable module systemInfo  
example: enable app systemMonitor
```

#### disable
disable admin module 设置 或者 disable app 设置  
disable module {moduleId}  
disable app {settings}
```
example: disable module systemInfo  
example: disable app systemMonitor
```

#### dump
dump v8 heap 和 cpu 以供之后的分析  
dump cpu|memory {filepath} [times] [--force]  
times 是 cpu dump 所需要的时间，以秒为单位  
```
example: dump cpu /home/xxx/test 5  
example: dump memory /home/xxx/test 
```
**注意**：你可以使用 --force 来覆盖写入已经存在的文件  
```
example: dump cpu /home/xxx/test 5 --force  
example: dump memory /home/xxx/test --force
```

##### 分析dump结果  
打开[google chrome](https://www.google.com/intl/en/chrome/browser/)浏览器，按下F12来打开浏览器控制台  
找到**profile**标签，右键选择**Load profile...**  
选择dump文件，点击**open**。dump 文件就会被载入，你就可以进行分析  
关于dump的更多信息，你可以访问[ndump](https://github.com/piaohai/ndump)  