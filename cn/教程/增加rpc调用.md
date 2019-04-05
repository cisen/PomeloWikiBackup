在多进程应用中，进程间通讯是不可或缺的。在pomelo中，借助javascript的语言特性，实现了对开发者非常友好的一个rpc框架。下面，我们将在我们的chat应用中，实践一个rpc调用。为了保持简单，而又能说明问题，我们“画蛇添足”地实现一个时间服务器，当gate服务器接受到用户的查询请求时，我们让gate服务器向时间服务器请求当前的时间，并将其打印在console上。当然这个例子没有啥实际意义，你也可以认为它有意义，因为一个统一的时间服务器可以提供统一的时间信息。这里仅仅是为了示例rpc调用的使用方式，并向用户展示pomelo中rpc调用的方便性。

实际上在我们的聊天应用中，已经有了rpc调用的实现，那就是当有用户连接connector或者离开时，connector会向chat发起rpc，chat会根据相应的用户离开和加入，对应操作其Channel信息。由于在前面我们并没有很详细地对其进行分析，所以干脆重新实现一个全新的rpc，同时，我们也可以展示如何在pomelo应用中增加一个服务器类型。

chat中增加rpc
==============

下面将给我们的聊天应用增加一个rpc调用和一个time类型的服务器，具体的代码在分支 `tutorial-rpc` 上，使用如下命令切换分支:

    $ git checkout tutorial-rpc

首先，我们在servers下建立时间服务器类型time，建立服务名称timeRemote,获取时间方法getCurrentTime(arg1, arg2, cb)，其中arg1, arg2没有实际意义，纯属于示例的目的，在servers/time/remote/timeRemote.js 里面，定义方法：

```javascript

// timeRemote.js
module.exports.getCurrentTime = function (arg1, arg2, cb) {
  console.log("timeRemote - arg1: " + arg1+ "; " + "arg2: " + arg2);
  var d = new Date();
  var hour = d.getHours();
  var min = d.getMinutes();
  var sec = d.getSeconds();
  cb( hour, min, sec);
};

```

这里，首先将客户端传来的两个参数打印到console上，然后获取到当前的时间，然后取出其时分秒信息，将其发到客户端。
客户端的调用：

```javascript

// gateHandler.js
var routeParam = Math.floor(Math.random()*10);
app.rpc.time.timeRemote.getCurrentTime(routeParam, arg1, arg2,  function(hour, min, sec) {
  // ...
});

```

在客户端的rpc调用中，getCurrentTime的第一个参数是用来做路由计算的，arg1, arg2...为调用参数示例，这里的参数arg1, arg2实际上没有啥实际用途，仅仅是为了示例，我们在远程调用的服务端也仅仅是将其打印到console而已。当然实际的rpc调用的时候，就可以使用多个参数，从客户端给服务端传参数。最后的回调应与服务端最后的回调签名保持一致。对于routeParam，我们在这里不再使用session，而是使用一个0-10之内的随机整数，然后直接让其与服务器的个数做hash，得到一个具体的时间服务器。

当有多个time服务器的时候，我们还要为每一次对time服务的请求配置相应的路由，rpc路由函数的第一个参数为rpc调用时的第一个参数，对于本例来说，就是随机数routeParam。在pomelo中很多时候是使用session作为路由参数的，这里示例了一个不一样的路由参数，具体示例代码如下：

```javascript

// app.js
var router = function(routeParam, msg, context, cb) {
  var timeServers = app.getServersByType('time');
  var id = timeServers[routeParam % timeServers.length].id;
  cb(null, id);
}

app.route('time', router);

```

这样我们就定义了对time服务器的路由函数。路由函数的参数routeParam就是rpc调用时的第一个参数，msg中封装了rpc调用的详细信息，包括namespace，servertype，等等。context是rpc客户端的上下文，一般由全局的application充当,cb是一个回调，第一个参数是当有错误发生时的错误信息,第二个参数是具体的服务器id。

在服务器配置config/servers.json中增加time服务器如下：

```javascript

"time":[
  {"id": "time-server-1", "host":"127.0.0.1", "port" : 7000},
  {"id": "time-server-2", "host":"127.0.0.1", "port" : 7001}
]

```

好了，这样就为聊天应用增加了一个时间服务器，时间服务器提供一个远程时间，当gate接收到查询请求时，会向time服务器发一个请求，time服务器会为其提供一个时间。gate服务器会向console打印出其得到的远程时间，time服务器会向console打印出gate发起rpc请求时提供的两个参数arg1,arg2,虽然这两个参数没有啥实际意义，但是还是演示了如何在远程调用中传参数。最后的两个回调函数，我们保持了回调函数的签名一致即可。回调函数可以有多个参数，说明我们的rpc调用实际上是可以返回多个结果的。

一些说明
============

* 你可能注意到了我们在time服务器的timeRemote.js和chat服务器的chatRemote.js中，定义远程调用方式的不同了。在timeRemote.js中，直接在``module.exports``上面挂载``getCurrentTime``，而在chatRemote.js中，则是另一种方式，示例如下:

```javascript

// chatRemote.js
module.exports = function(app) {
	return new ChatRemote(app);
};

// timeRemote.js
module.exports.getCurrentTime(arg1, arg2, cb) {
  // ...
};

```
实际上这两种方式都是可以的，pomelo在加载具体的remote的时候，如果发现加载到的不是一个对象而是一个函数，那么将认为其是一个工厂方法，它将使用一个全局的上下文（一般是唯一的一个application实例）作为参数，调用这个函数，并使用其结果。chatRemote就是使用这种方式，最终加载到的remote对象实际上是一个ChatRemote对象; 而对于timeRemote来说，require调用返回的就是一个对象，这个对象有一个方法getCurrentTime，所以这个时候，就不需要进行一次函数调用了。

当remote需要当前的application实例的时候，往往可以使用第一种chatRemote的那种方式，而当remote跟app完全没关系时，也可以使用timeRemote的这种实现方式，这在pomelo中是没有差别的。

不仅仅是remote，对于handler也是一样，也就是说定义handler的时候也可以使用这两种方式中的一种，只不过到目前为止，我们这个例子中使用的都是类似于chatRemote中的那种实现方式。

* 当前端服务器接受客户端请求，将请求路由给后端服务器时，pomelo使用的是发起一个系统级远程调用的方式，这个时候会使用session作为rpc请求的路由参数，这也是我们看到的前面在给chat配置路由的时候，路由函数的第一个参数总是session。在time中，我们使用了一个随机整数作为路由参数，因此time的路由函数的第一个参数也就是这个随机整数了。实际上pomelo的rpc框架对于路由参数的使用是没有限制的，并不仅限于一直使用session。

* rpc调用的返回值是通过回调的形式获得的，回调函数也就是我们上面看到的rpc调用的最后一个参数。这个回调函数可以有多个参数，表示远程调用可以返回多个值，在我们这个例子中，返回了时分秒三个值。

* 0.8版本以后，当进行rpc调用的时候，可以跳过路由计算而直接将调用发送到一个具体的服务器或者广播到一类服务器的调用方式，代码示例如下：
```javascript
// route
var routeParam = session;
app.rpc.area.playerRemote.leaveTeam(routeParam, args..., cb);

// to specified server 'area-server-1'
app.rpc.area.playerRemote.leaveTeam.toServer('area-server-1', args..., cb);

// broadcast to all the area servers
app.rpc.area.playerRemote.leaveTeam.toServer('*', args..., cb);
```
小结
==========

在这部分，我们给聊天应用增加了一个time服务器并实现了一个rpc调用，并对pomelo的rpc调用进行了一些说明。下一步，我们将[增加一个component](给pomelo加个组件 "增加组件")。
