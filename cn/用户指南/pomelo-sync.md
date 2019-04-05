## 概述
pomelo-sync模块用于解决游戏进程中需要持久化的数据在内存和存储系统之间的同步问题. 该模块为上述的数据同步需求提供了一种异步的实现方式, 并可以根据用户配置, 定时的将数据同步到持久层(如MySQL, Redis, 磁盘文件等). 

## 应用场景
在游戏进程中, 需要进行大量的数据更新与同步(如角色的位置坐标, 血量, 装备属性等). 如果频繁的操作数据持久层, IO操作的开销就会很大. 采用定时批量的方式同步变动的数据是避免IO开销太大的一种方法, pomelo-sync就是按照这个思路设计和实现的. pomelo-sync的配置与iBATIS类似, 不同的一点是ORM完全由用户配置控制, 具有很大的灵活性, 因此, pomelo-sync可以应用于各种不同的数据库中(如MongoDB等). 

## 模块结构
pomelo-sync模块内部结构如下：

![](http://pomelo.netease.com/resource/documentImage/pomelo-sync.png) 

Logic Interface：提供侵入式的数据更新调用接口, 包括常规的add、update、delete和立即执行持久化的接口flush <br/>

Invoke Interface：提供持久化的实际调用执行接口 <br/>
Queue：保存本周期内需要持久化的对象, 可支持多节点转发数据<br/>
Timer：可支持静态配置和动态修改同步时间间隔<br/>
Mapping：支持在持久化时自定义同步方法映射<br/>

Store Interface：封装了各种存储引擎的持久化接口 <br/>
Log：提供对数据变动时的AOF日志记录 <br/>
Mysql, Redis, File：根据用户传入的对象执行用户自定义的同步方法 <br/>

## 安装
npm install pomelo-sync-plugin <br/>
注: 目前pomelo-sync模块被封装在了[pomelo-sync-plugin](https://github.com/NetEase/pomelo-sync-plugin)插件中.

## 使用示例
### 使用pomelo-sync-plugin
``` javascript
// app.js
var sync = require('pomelo-sync-plugin');
// ...
// Configure database
app.configure('production|development', 'area|auth|connector|master', function() {
  var dbclient = require('./app/dao/mysql/mysql').init(app);
  app.set('dbclient', dbclient);
  app.use(sync, {sync: {path:__dirname + '/app/dao/mapping', dbclient: dbclient}});
});
// ...
```
注: "/app/dao/mapping"路径下的所有js文件都会被加载进入pomelo-sync中, 这些模块中定义了定时同步时所执行的所有面向持久层的操作. 加载模块的代码如下所示:
``` javascript
// pomelo-sync-plugin/node_modules/pomelo-sync/lib/dbsync.js
var DataSync = module.exports = function(options) {
  // ...
  this.mapping = this.loadMapping(options.mappingPath);
  // ...
};
```

### 配置同步对象映射关系
该模块支持用户自定义同步方法, 如：
``` javascript
// game-server/app/dao/mapping/taskSync.js
module.exports = {
  updateTask: function(dbclient, val, cb) {
    var sql = 'update Task set taskState = ?, startTime = ?, taskData = ? where id = ?';
    // ...
    var args = [val.taskState, val.startTime, taskData, val.id];
    dbclient.query(sql, args, function(err, res) {
    // ...
    });
  }
};
```

### 创建sync对象
``` javascript
// pomelo-sync-plugin/lib/components/sync.js
var DataSync = require('pomelo-sync');
// ...
var createSync = function(opts){
  var opt = opts || {};
  opt.mappingPath = opts.path;
  opt.client = opts.dbclient;
  opt.interval = opts.interval || 60 * 1000;
  return new DataSync(opt);
};
```

## API
### sync.exec(key,id,val,cb)
添加异步定时执行的操作
#### Arguments
+ key -  方法映射的关键词, 使用时需要唯一. 
+ id  -  实体对象主键. 
+ val -  需要同步对象, 添加后会克隆此对象. 
+ cb  -  同步完成后的异步回调, 可以为空. 

具体使用示例:
``` javascript
// app/dao/taskDao.js
// ...
task.on('save', function() {
  app.get('sync').exec('taskSync.updateTask', task.id, task);
});
// ...
```

### sync.flush(key,id,val,cb)
立即同步某个对象到持久层
#### Arguments
+ key -  方法映射的关键词, 使用时需要唯一. 
+ id  -  实体对象主键. 
+ val -  需要同步对象. 
+ cb  -  同步完成后的异步回调, 可以为空. 

### sync.isDone()
检查内存中是否还有需要同步到持久层的数据对象, 一般配合"sync()"方法使用.

### sync.sync()
无视定时器, 立即执行同步过程. 一般用在服务器关闭时调用. 代码如下：
``` javascript
// pomelo-sync-plugin/lib/components/sync.js
Component.prototype.stop = function(force, cb) {
  // ...
  this.state = STATE_STOPED;
  this.sync.sync();
  var self = this;
  var interval = setInterval(function(){
    if (self.sync.isDone()) {
      clearInterval(interval);
      cb();
    }
  }, 200);
};
``` 

## 其他参数选项
该模块默认的同步时间间隔为"1000 * 60"(即1分钟), 如需修改, 使用"opt.interval"传入即可. <br/>
该模块默认关闭"AOF"日志记录, 如需打开, 使用"opts.aof=ture"打开. 

## 注意
如需支持事务操作则应依赖于持久层内置事务模型来保证.

## 其他
更详细的示例, 请参考该模块[源代码](https://github.com/NetEase/pomelo-sync)与[游戏Demo](https://github.com/NetEase/lordofpomelo). 
