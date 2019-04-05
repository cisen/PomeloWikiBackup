为了方便开发者根据自身的需求对pomelo原有的功能进行有效的扩展，pomelo在0.6版本提供了一种灵活的插件机制。

## Plugins
在pomelo 0.6版中，已开发完成组件包括：[pomelo-sync-plugin](https://github.com/NetEase/pomelo-sync-plugin)，[pomelo-globalchannel-plugin](https://github.com/NetEase/pomelo-globalchannel-plugin)，[pomelo-status-plugin](https://github.com/NetEase/pomelo-status-plugin)，[pomelo-masterha-plugin](https://github.com/NetEase/pomelo-masterha-plugin)；另外可以参考使用插件机制完成的 [chatofpomelo-plugins](https://github.com/py8765/chatofpomelo-plugins)。

+ [pomelo-sync-plugin](https://github.com/NetEase/pomelo-sync-plugin)：提供数据同步服务，将[pomelo-sync](https://github.com/NetEase/pomelo-sync)以plugin形式提供使用。
+ [pomelo-globalchannel-plugin](https://github.com/NetEase/pomelo-globalchannel-plugin)：提供全局channel服务，默认使用redis存储。
+ [pomelo-status-plugin](https://github.com/NetEase/pomelo-status-plugin)：提供用户状态服务，同时提供对指定用户进行消息推送服务。
+ [pomelo-masterha-plugin](https://github.com/NetEase/pomelo-masterha-plugin)：提供master节点高可用服务。

## 结构
插件的结构主要包括两个部分：components和events，其中components是必要的，events则可以根据插件自身所需功能进行配置。如下图所示：

![plugin](http://pomelo.netease.com/resource/documentImage/plugin.png)

components跟pomelo中原有的组件功能一致，具体可以参考 [pomelo 组件](https://github.com/NetEase/pomelo/wiki/Pomelo-Framework)。它是服务器生命周期的服务单元，一个组件负责实现一类具体的功能。在plugin中开发者可以根据需要定义多个组件，开发者可以根据需要实现服务器不同生命周期的回调方法，包括start、afterStart、stop三个生命周期过程。

events是为了开发者可以对pomelo中基本事件进行处理，开发者可以根据自身的需求对不同的事件进行监听并作出相应的处理。现在主要包括add_servers、remove_servers、replace_servers、bind_session、close_session。

+ add_servers：系统添加服务器事件，参数为添加的服务器信息，参数类型是数组。
+ remove_servers: 系统移除服务器事件，参数为移除的服务器信息，参数类型是数组。
+ replace_servers: 系统中有(除master)的服务器断网后重新连接事件，参数为断网的服务器收到系统中现存服务器信息，参数类型是数组。
+ bind_session: 系统中有用户进行session绑定操作事件，参数为session对象。
+ close_session: 系统中有用户session关闭事件（包括连接断开和连接异常），参数为session对象。

## 使用方法

pomelo中使用plugin的相应API如下：

### API

#### app.use(plugin, opts)
使用相应的pomelo插件
#### Arguments
+ plugin - plugin that uses in pomelo
+ opts - attach parameters

pomelo中使用组件只需要在app.js中进行相应配置即可，具体可以参考如下代码：

```javascript
var statusPlugin = require('pomelo-status-plugin');

app.use(statusPlugin, {
 status:{
  host: '127.0.0.1',
  port: 6379
 }
});
```
ps: 由于plugin中可以有多个component，所以相应的配置参数也可能为多个，为了区分不同组件的配置参数，在use方法的第二个参数中可以配置多个组件的配置参数，key为相应组件的文件名，value为配置参数。

## 构建方法

首先，需要创建一个符合plugin规范的空项目，具体的项目目录结构如下图所示：

![plugin-dir](http://pomelo.netease.com/resource/documentImage/plugin-dir.png)

其次，需要在index.js中进行相关配置，由于在plugin中components是必要的，所以必须在index.js中指明components的路径信息，events如果有用到可以进行配置，具体配置参考如下代码：

```javascript
module.exports = {
 components: __dirname + '/lib/components/',
 events: __dirname + '/lib/events/'
};
```
最后，就可以进行components和events中相关代码的编写。对于component，需要对外提供相应的构造函数，pomelo在加载过程中会将相应的服务器上下文信息和配置参数进行注入，具体可参考如下代码：

```javascript
module.exports = function(app, opts) {
 return new Component(app, opts);
};

var Component = function(app, opts) {
 //do construction
};

Component.prototype.start = function(cb) {
// do something application start
};

Component.prototype.afterStart = function(cb) {
// do something after application started
};

Component.prototype.stop = function(force, cb) {
// do something on application stop
};
```

对于event, 同样需要对外提供其构造函数，pomelo会在加载过程中将相应服务器的上下文信息注入，开发者只需根据自身需要编写相应的回调函数即可，具体可参考如下代码：

```javascript
module.exports = function(app) {
 return new Event(app, opts);
};

var Event = function(app) {
 //do construction
};

Event.prototype.add_servers = function(servers) {
 //do something when application add servers
};

Event.prototype.remove_servers = function(ids) {
 //do something when application remove servers
};

Event.prototype.replace_servers = function(servers) {
 //do something when server reconnected
};

Event.prototype.bind_session = function(session) {
 //do something when session binded
};

Event.prototype.close_session = function(session) {
 //do something when session closed
};
```
