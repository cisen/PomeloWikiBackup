# Pomelo的master服务器高可用(以LordOfPomelo为例)


### 使用master高可用的方法和步骤

#### 1. 启动和配置zookeeper相关服务

```
$ zkServer.sh start
```

* 在`lordofpomelo/game-server`目录下执行`./scripts/createZKMasterhaNode.js`或者`./scripts/createZKMasterhaNode.js /pomelo/master`都会在zookeeper中创建`/pomelo/master`znode. 可以使用`$ zkCli.sh`和`[zk: localhost:2181(CONNECTED) 1] ls /pomelo/master`来查看.

#### 2. lordofpomelo相关配置

* 在`lordofpomelo/game-server`目录下执行`npm install pomelo-masterha-plugin`安装`master高可用`插件.

* 创建文件`lordofpomelo/game-server/config/masterha.json`, 文件内容为:

```
{
        "masterha":[
               {"id": "master-server-1", "host": "127.0.0.1", "port":3006},
               {"id": "master-server-1", "host": "127.0.0.1", "port":3007}
         ]
}
```

注: 如果是在[分布式部署的环境](https://github.com/NetEase/pomelo/wiki/Pomelo%E7%9A%84%E5%88%86%E5%B8%83%E5%BC%8F%E9%83%A8%E7%BD%B2%E6%96%B9%E6%B3%95)下使用`master高可用`, 则上面的`host`应填写相应机器的IP地址, 如: `pomelo16.server.163.org`, 注意: 这时不要填写`127.0.0.1`或者`localhost`.

* 在文件`lordofpomelo/game-server/app.js`中添加`master高可用`相关代码:

```javascript
...
var masterhaPlugin = require('pomelo-masterha-plugin');
...
  // master high availability
  app.use(masterhaPlugin, {
    zookeeper: {
      server: '127.0.0.1:2181',
      path: '/pomelo/master'
    }
  });
...
```

注: 如果是在[分布式部署的环境](https://github.com/NetEase/pomelo/wiki/Pomelo%E7%9A%84%E5%88%86%E5%B8%83%E5%BC%8F%E9%83%A8%E7%BD%B2%E6%96%B9%E6%B3%95)下使用`master高可用`, 则上面的`server`应填写`zookeeper服务`所在机器的IP地址和端口, 如: `pomelo17.server.163.org:2181`, 注意: 这时不要填写`127.0.0.1:2181`或者`localhost:2181`.

至此, 相关配置就完成了.

#### 3. 启动master高可用服务

* 在目录`lordofpomelo/game-server`下执行`pomelo start -e production`启动`game-server`服务器集群; 在目录`lordofpomelo/game-server`下执行`./scripts/startMasterhaNode.sh`启动`master高可用`热备节点. 可以使用`$ zkCli.sh`和`[zk: localhost:2181(CONNECTED) 2] ls /pomelo/master/lock`来查看, 当前应有的3个master节点. 在目录`lordofpomelo/web-server`下执行`node app.js`启动`web-server`, 这时应可以正常登录并进行游戏.

注: `./scripts/startMasterhaNode.sh`文件的内容如下:

```
#!/usr/bin/env bash
pomelo masterha /config/masterha.json
```

该文件一定要在目录`lordofpomelo/game-server`下执行.

#### 4. 检验master高可用服务

* 使用`$ pomelo-cli`和`monitor@pomelo : all>show servers`来查看`master`服务器状态, 可以看到当前主`master`服务器的相关信息, 如`master-server-1    master     127.0.0.1 3005 4305 14.55       8.93`.

* 我们使用`$ kill 4305`来kill掉当前的主`master`服务进程. 切换到`启动master高可用服务`的终端窗口, 可以看到某个`master`高可用热备节点被提升为主`master`服务进程的信息, 如`server host: 127.0.0.1, port: 3007 now is promoted to master!`. 使用`$ zkCli.sh`和`[zk: localhost:2181(CONNECTED) 3] ls /pomelo/master/lock`来查看, 当前应有的2个master节点.

* 使用`$ pomelo-cli -P 3007`和`monitor@pomelo : all>show servers`来查看`master`服务器状态, 可以看到当前主`master`服务器的相关信息, 如`master-server-1    master     127.0.0.1 3007 4421 21.18       34.53`. 并且, 此时其它服务进程不受任何应用, 用户仍然可以正常进行游戏.

* 这时可以在目录`lordofpomelo/game-server`下使用`pomelo stop -P 3007`来关闭`game-server`服务器集群.

#### 5. 说明

* 具体代码可以参考[lordofpomelo](https://github.com/NetEase/lordofpomelo)的`master`分支.
* 该功能需要 [pomelo](https://npmjs.org/package/pomelo)@`0.7.2`及以上版本, [pomelo-masterha-plugin](https://npmjs.org/package/pomelo-masterha-plugin)@`0.0.4`及以上版本支持.