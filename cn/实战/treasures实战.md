# Treasures介绍
## 描述
[Treasures](https://github.com/NetEase/treasures) 游戏是从 [LordOfPomelo](https://github.com/NetEase/lordofpomelo) 中抽取出来的, 去掉了大量的游戏逻辑, 用以更好的展示 [Pomelo](https://github.com/NetEase/pomelo) 框架的用法以及运作机制. 

Treasures 很简单, 输入一个用户名后, 会随机得到一个游戏角色并进入游戏场景. 在游戏场景中地上会散落一些宝物, 每个宝物都有分数, 玩家操作游戏角色去捡起地上的宝物, 然后得到相应的分数. 

## 安装和运行
安装 `pomelo`

```bash
npm install -g pomelo
```
获取源码
```bash
git clone https://github.com/NetEase/treasures.git
```
安装 `npm` 依赖包（先进入项目目录）
```bash
sh npm-install.sh
```
启动 `web-server`  (先进入`web-server`目录)
```bash
node app.js
```
启动 `game-server` (先进入`game-server`目录)
```bash
pomelo start
```
在浏览器中访问 [http://localhost:3001](http://localhost:3001) 进入游戏.

如有问题, 可以参照 [pomelo快速使用指南](https://github.com/NetEase/pomelo/wiki/pomelo%E5%BF%AB%E9%80%9F%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97)

也可以参照 [tutorial1 分布式聊天](https://github.com/NetEase/pomelo/wiki/tutorial1--%E5%88%86%E5%B8%83%E5%BC%8F%E8%81%8A%E5%A4%A9)

## 架构
Treasures 分为 web-Server 和 game-Server 两部分. 

* `web-server` 是用 Express 建立的最一个基础的 http 服务器, 用来为浏览器页面的访问提供服务. 

* `game-server` 是 WebSocket 服务器, 用来运行整个游戏的逻辑. 

首先, 通过配置文件来看 `game-server` 的具体架构 `game-server/config/servers.json`
```javascript
{
  "development": {
    "connector": [
      {"id": "connector-server-1", "host": "127.0.0.1", "port": 3150, "clientPort": 3010, "frontend": true},
      {"id": "connector-server-2", "host": "127.0.0.1", "port": 3151, "clientPort": 3011, "frontend": true}
    ],
    "area": [
      {"id": "area-server-1", "host": "127.0.0.1", "port": 3250, "areaId": 1}
    ],
    "gate": [
      {"id": "gate-server-1", "host": "127.0.0.1", "clientPort": 3014, "frontend": true}
    ]
  }
}
```
可以看到, 服务端是由以下几个部分构成：

* 1 个 `gate` 服务器, 主要用于负载均衡, 把来自客户端的连接分散到两个 `connector` 服务器上. 
* 2 个 `connector` 服务器, 主要用于接收和发送消息. 
* 1 个 `area` 服务器, 主要用于驱动游戏场景和游戏逻辑

服务器之间的关系, 如下图所示：

![treasure-arch](http://pomelo.netease.com/resource/documentImage/treasure-arch.png)

## 源码分析
##### 通过游戏流程来分析代码:

### 1. 连接服务器
客户端 `web-server/public/js/main.js` 的 `entry` 方法中:

```javascript
pomelo.request('gate.gateHandler.queryEntry', {uid: name}, function(data) {
  //...
});
```

服务端 `game-server/app/servers/gate/handler/gateHandler.js` 的 `queryEntry`方法中:

```javascript
Handler.prototype.queryEntry = function(msg, session, next) {
  // ...
  // 通过crc算法将玩家输入的用户名字符串转换为整数, 然后对connector服务器个数取余hash到某个connector服务器上.
  // 最后将要连接的 connector 服务器的 host 和 port 返回给客户端.
  next(null, {code: Code.OK, host: res.host, port: res.wsPort});
};
```

这样客户端就能连接到所分配的 `connector` 服务器上了. 

### 2. 进入游戏
在与 `connector` 服务器建立连接之后, 就可以进入游戏了:

```javascript
pomelo.request('connector.entryHandler.entry', {name: name}, function(data) {
  // ...
});
```

在客户端第一次向 `connector` 服务器发出请求时, 服务器会将 `session` 信息进行初始化和绑定:

```javascript
session.bind(playerId); // session 与 playerId 绑定
session.set('areaId', 1); // 设置玩家 areaId
```
并将该 `connector` 服务器的序号与一个自增的变量 `id` 组合生成该角色的 `playerId`, 最后将生成的这个 `playerId` 发送给客户端.

客户端向服务端发起进入场景的请求：

```javascript
pomelo.request("area.playerHandler.enterScene", {name: name, playerId: data.playerId}, function(data) {
  // ...
});
```

客户端向服务端发送请求后, 请求先到达 `connector` 服务器, 然后 `connector` 服务器根据pomelo框架的默认转发规则(`pomelo/lib/components/proxy.js`中的`defaultRoute`函数), 将请求路由到相应的 `area` 服务器(本例子中只有一个`area`服务器), `area` 服务器中的 `playerHandler` 再处理相应的请求. 这样玩家就加入到游戏场景中了. 

在一个玩家加入到游戏场景之后, 其他玩家必须能即时的看到这个玩家的加入, 所以服务端必须将消息广播到在此游戏场景中的所有玩家. 
建立 `channel`, 所有加入此游戏场景的玩家都会加入到这个 `channel` 中

```javascript
// game-server/app/models/area.js 的 addEntity 函数中
// 获取 channel, 如果没有就创建一个, 然后将玩家加入 channel
getChannel().add(e.id, e.serverId);
```

当 `area` 中有玩家加入, 或其他事件发生改变时, 这些信息都会被推送到在这个 `channel` 中的每个玩家. 例如有玩家加入时：

```javascript
// game-server/app/models/area.js 的 entityUpdate 函数中
getChannel().pushMessage({route: 'addEntities', entities: added});
// 注: entityUpdate 是由 game-server/app/models/timer.js 中的 tick 函数调用的(详见下面介绍).
```

这些消息都是通过 `connector` 服务器发送到客户端的. `area` 中的消息是通过`session.frontendId` 来决定是由哪个 `connector` 服务器发出去. 

客户端接受消息:
```javascript
// web-server/public/js/msgHandler.js 中的 init 函数:
// 当有新玩家加入时, 服务端会广播消息给所有玩家. 客户端通过这个路由绑定, 来获取消息.
pomelo.on('addEntities', function(data) {
  // ...
});
```

### 3. Area 服务器
`area` 服务器是一个由 `tick` 来驱动的游戏场景. 每个tick(100ms)都会对场景中 `entity` 的状态进行更新. 如果 `entities` 的状态发生了改变, 那么新的状态会被推送到所有相关客户端.
```javascript
function tick() {
  //run all the action
  area.actionManager().update();
  // update entities
  area.entityUpdate();
  // update rank
  area.rankUpdate();
}
```

例如玩家发起一个 `move` 动作:

客户端
```javascript
// 向服务端发送 move 请求request:
pomelo.request('area.playerHandler.move', {targetPos: targetPos}, function(result) {...});
```
服务端 `playerHandler` 接受请求：
```javascript
handler.move = function(msg, session, next) {
  // ...
  // 产生一个 move action
  var action = new Move({
    entity: player,
    endPos: endPos
  });
  // ...
  // 并将该 action 加入到 actionManager 中:
  if (area.timer().addAction(action)) { ... });
  // ...
});
```
然后这个 `action` 会在下个 `tick` 中更新. 

### 4. 客户端发送和接受消息
客户端和服务端的通讯有以下几种方式：

* Request - Response 方式

```javascript
// 向 connector 发送请求, 参数 {name: name}
pomelo.request('connector.entryHandler.entry', {name: name}, function(data) {
  // 回调函数得到请求的返回结果
  // do something
});
```

* Notify (向服务端发送通知)

```javascript
// 向服务端发送notify通知
pomelo.notify("***.***.***", params);
```

* Push （服务端主动发送消息到客户端）

```javascript
// 当有新玩家加入时, 服务端会广播消息给所有玩家. 客户端通过这个路由绑定, 来获取消息:
pomelo.on('addEntities', function(data) {
  // ...
});
```

### 5. 离开游戏

当玩家离开游戏时, `connector` 服务器会先收到断开的消息. 然后需要在 `area` 服务器中将用户剔除, 并广播消息给其他在线玩家.
 
因为服务器之间的进程都是独立的, 所以这就涉及到一个 `RPC` 调用. 好在 Pomelo 框架对 `RPC` 做了很好的封装, 例如:
`area` 服务器想要提供一系列的 `remote` 接口供其他服务器进程调用, 只需要在 `servers/area` 目录下创建一个 `remote` 目录, 在 `remote` 目录下的文件暴露出来的接口, 都可以作为 `RPC` 调用接口. 

例如, 玩家离开:

```javascript
// connector 中对 session 绑定事件, 当 session 关闭时, 触发事件
session.on('closed', onUserLeave.bind(null, self.app));
var onUserLeave = function (app, session, reason) {
  if (session && session.uid) {
    // rpc 调用
    app.rpc.area.playerRemote.playerLeave(session, {playerId: session.get('playerId'), areaId: session.get('areaId')}, null);
  }
};
```

对应的 `area/remote/playerRemote.js` 中 `playerLeave` 方法

```javascript
exp.playerLeave = function(args, cb) {
  // ...
  // 发出通知
  area.getChannel().pushMessage({route: 'onUserLeave', code: consts.MESSAGE.RES, playerId: playerId});
  // ...
};
```
这样就轻松的完成了一个跨进程的调用.


### 6. 总结
通过上述对游戏流程相关源代码的分析, 我们对Treasures的代码结构已经有了比较深入的认识. 上述流程也已基本涵盖使用Pomelo框架进行游戏客户端/服务器端开发的相关方法, 如需继续深入了解此方面的内容请参考[LordOfPomelo-介绍](https://github.com/NetEase/pomelo/wiki/LordOfPomelo-%E4%BB%8B%E7%BB%8D).

