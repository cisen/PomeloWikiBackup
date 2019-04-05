# Pomelo的分布式部署(以LordOfPomelo为例)


### 分布式部署的方法和步骤
#### 1. 系统及应用软件环境搭建和配置
所有参与分布式部署的机器: 

* 必须为同类操作系统(建议为完全相同的操作系统, 本文所示例的4台机器的操作系统均为"Debian GNU/Linux 7.0"). 
* 必须都有一个同名的用户(如:"pomelo"等, 本文所示例的4台机器均有一个名为"pomelo"的用户).
* Node.js的安装版本必须完全相同, 安装的`绝对路径`也必须完全相同(本文所示例的安装绝对路径为"/home/pomelo/node-v0.10.21-linux-x64").
* "lordofpomelo"所放置的`绝对路径`也必须完全相同(本文所示例的绝对路径为"/home/pomelo/lordofpomelo").
* 在所有参与分布式部署的机器上配置`ssh登录选项`. 方法为: 在"~/.ssh"目录下创建一个名为"config"的文件(本文所示例的目录为"/home/pomelo/.ssh"), 文件内容如下:

```
Host *
HashKnownHosts no
CheckHostIP no
StrictHostKeyChecking no
```

上述文件的目的是使得各个机器之间可以进行顺畅的ssh登录. 各选项的含义请参考[ssh_config](http://man.he.net/man5/ssh_config).

#### 2. 全局安装Pomelo, 安装lordofpomelo依赖包

```
$ npm install pomelo -g
$ cd lordofpomelo
$ sh npm-install.sh
```

详细的步骤请参考[安装pomelo](https://github.com/NetEase/pomelo/wiki/%E5%AE%89%E8%A3%85pomelo)和[LordOfPomelo-安装指南](https://github.com/NetEase/pomelo/wiki/LordOfPomelo-%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97).

#### 3. 修改lordofpomelo中相关配置文件

* 修改"lordofpomelo/shared/config/mysql.json": 将其中的`host`的地址修改为MySql所在机器的IP地址, 注意: 不要填写"127.0.0.1"或者"localhost". 具体的配置如下所示, 大家可以根据实际情况修改对应配置项:

```json
{
	"development": {
	  "host" : "pomelo3.server.163.org",
	  "port" : "3306",
	  "database" : "Pomelo",
	  "user" : "xy",
	  "password" : "dev"
	},
	"production": {
	  ...
	}
}
```

* 修改"lordofpomelo/game-server/config/master.json":  将其中的`host`的地址修改为`master`所在机器的IP地址(即, 将要在哪台机器上使用`pomelo start`来启动`game-server`服务器集群), 注意: 不要填写"127.0.0.1"或者"localhost". 具体的配置如下所示, 大家可以根据实际情况修改对应配置项:

```json
{
    "development":{
        "id": "master-server-1", "host": "pomelo16.server.163.org", "port": 3005
    },
    "production":
    {
        ...
    }  	
}
```

* 修改"lordofpomelo/game-server/config/servers.json":  将其中的`host`的地址修改为相应服务进程所在机器的IP地址(即, 将要在哪台机器上运行该服务进程), 注意: 不要填写"127.0.0.1"或者"localhost". 具体的配置如下所示, 大家可以根据实际情况修改对应配置项:

```json
{
	"development": {
		...
		"area": [
			{"id": "area-server-1", "host": "pomelo16.server.163.org", "port": 3250, "area": 1},
			{"id": "area-server-2", "host": "pomelo18.server.163.org", "port": 3251, "area": 2},
			{"id": "area-server-3", "host": "pomelo19.server.163.org", "port": 3252, "area": 3},
			...
		],
		...
		"gate": [
			{"id": "gate-server-1", "host": "pomelo16.server.163.org", "clientPort": 3014, "frontend": true}
		],
		...
	},
	"production": {
		...
	}
}
```

* 修改"lordofpomelo/web-server/public/js/config/config.js":  将其中的`GATE_HOST`和`GATE_PORT`修改为`game-server的gate服务进程`所在机器的IP地址和端口, 注意: 如果`web-server`与`game-server的gate服务进程`在同一台机器上则可将`GATE_HOST`配置为`window.location.hostname`, 否则配置相应的IP; 该配置应与"lordofpomelo/game-server/config/servers.json"中`gate`的配置相对应. 具体的配置如下所示, 大家可以根据实际情况修改对应配置项:

```javascript
...
    IMAGE_URL: 'http://pomelo.netease.com/art/',
    GATE_HOST: 'pomelo16.server.163.org',
    GATE_PORT: 3014
...
```

上述步骤都完成后就可以在`master`所在机器(本文所示例的是"pomelo16.server.163.org")的`lordofpomelo/game-server`目录下使用`pomelo start`命令启动`game-server`服务器集群; 在`lordofpomelo/game-server`目录下使用`pomelo stop`命令停止`game-server`服务器集群了. 在另外一台机器(本文所示例的是"pomelo17.server.163.org"; 当然也可以和上面的`master`在同一台机器上)的`lordofpomelo/web-server`目录下使用命令`node app.js`来启动`web-server`; 由于`web-server`是无状态的web服务器, 则可以通过`kill`/`Ctrl+c`来停止.

#### 4. 说明
* 在分布式部署中, 启动/停止各应用服务器的代码可以参考`lordofpomelo/game-server/node_modules/pomelo/lib/master/starter.js`中的`sshrun`函数相关部分.