一个pomelo的应用，一般是由一个服务器群来支持，对于这些应用服务器的管理以及监控就显得尤为重要。比如监控这些应用服务器的进程状态，系统状态，杀死某个服务器等等。

对服务器的监控和管理有三个主体：master，monitor，client。服务器的管理和监控由master服务器加载的master component和普通的应用服务器加载的monitor component，还有服务器管理客户端共同完成，下面的叙述中将不加区分地使用monitor与应用服务器，master与master服务器。

master负责收集所有服务器的信息，下发对服务器的操作指令。monitor负责上报服务器状态，并对master的命令作出反应。client是第三方监视的客户端，它注册到master上，通过给master发请求获得服务器群信息，或者给master发指令，管理操作应用服务器群。pomelo中内建实现并使用了console和watchdog这两个admin module，它们是pomelo核心的一部分,这里不再详述。

由于对于具体的应用来说，需要监控和管理的信息也是各不相同的，因此，pomelo并没有实现固定的监控模块，而是提供了一个可插拔的监控框架机制，用户只需要定义一个监控模块所需要的回调方法，并完成相应的配置即可。

一组相关的供不同主体调用的回调函数构成一个admin module，一个admin module中一般包括四个回调方法，monitorHandler，masterHandler，clientHandler, start。其中monitorHandler是monitor收到master的请求或者通知时由monitor回调，masterHandler是master收到monitor的请求或者通知时回调，clientHandler是master收到client的请求或通知时回调的, start是当admin module加载完成后，用来执行一些初始化监控时调用。

为了演示admin module的用法，我们将给聊天应用增加一个监控模块，我们让monitor每隔5秒钟向master上报一下自己的当前时间。当然，上报时间没有太多的实际意义，不过为了保持示例的简单化，选择上报时间还是可取的。实际使用中，可以上报任何信息，使用方式都是与上报时间的方式是一样的，这里使用上报时间仅仅是为了使得示例尽可能简单，更容易抓住如何使用admin module。

chat中使用
=============

下面我们将给我们的聊天应用增加一个监控管理模块，具体的代码在分支`tutorial-admin-module`上，使用如下命令切换分支：
  
    $ git checkout tutorial-admin-module

* 首先，我们在app目录下建立文件modules/timeReport.js, 在其中定义monitorHandler，masterHandler和clientHandler，代码如下：
```javascript

module.exports = function(opts) {
    return new Module(opts);
}

var moduleId = "timeReport";
module.exports.moduleId = moduleId;

var Module = function(opts) {
    this.app = opts.app;
    this.type = opts.type || 'pull';
    this.interval = opts.interval || 5;
}

Module.prototype.monitorHandler = function(agent, msg, cb) {
    console.log(this.app.getServerId() + '  ' + msg);
    var serverId = agent.id;
    var time = new Date().toString();

    agent.notify(moduleId, {serverId: serverId, time: time});
};

Module.prototype.masterHandler = function(agent, msg) {
    if (!msg) {
      var testMsg = 'testMsg';
      agent.notifyAll(moduleId, testMsg);
      return;
    }

    console.log(msg);
    var timeData = agent.get(moduleId);
    if (!timeData) {
        timeData = {};
        agent.set(moduleId, timeData);
    }
    timeData[msg.serverId] = msg.time;
};


Module.prototype.clientHandler = function(agent, msg, cb) {
    cb(null, agent.get(moduleId));
}

```

* 这里我们没有定义start回调，因为我们这里用不到。在定义完上面的admin module后，需要将其注册到我们的应用中，使用Application.registerAdmin调用，在app.js中增加如下代码：

```javascript

var timeReport = require('./app/modules/timeReport');
app.registerAdmin(timeReport, {app: app});

```

这里registerAdmin可以接收两个或三个参数，如果是三个参数的话，第一个必须是字符串来指定moduleId。如果是两个参数的话，moduleId将使用第一个参数，也就是module的工厂函数的moduleId属性。这里由于我们给timeReport定义了moduleId属性，因此我们就省略掉了第一个moduleId参数了。最后一个参数是配置选项，可以配置监控数据获取是pull还是push方式，以及获取周期。在我们这个例子中，由于注册时没有传入任何关于type和interval的配置，将使用默认值，也就是使用拉模式，每隔5秒获取一次数据。


一些说明
=========

* 在导出一个module的时候，一般需要指定一个moduleId，在这里，我们指定的moduleId是`timeReport`。当然我们如果这里不指定moduleId的话，在调用Application.registerAdmin的时候再指定moduleId也是可以的。

* 一个module有两个属性很重要，type和interval，type指出的是数据所采用的方式，有两种pull和push。pull方式是让master定时给monitor发请求，monitor给其上报信息。push的方式则是monitor定时上报自己的信息。interval就是这个信息上报的时间周期了。我们例子中使用的是方式通过opts传入，如果opts中没有配置的话，默认使用pull方式，上报周期为5秒，而实际上，我们就是使用了这样的两个参数值，即使用pull方式，让master主动拉数据，每5秒拉一次。

* 还有一个要注意的地方是masterHandler的实现，可能会让人感到迷惑。实际上，由于使用pull的方式，masterHandler会在两种情况下被回调，一种是每隔5秒产生的一次拉数据事件，一种是monitor向master上报信息。这两种情况，可以通过参数msg区分。

    - 如果是定时器产生的周期性的拉数据事件导致的回调，此时msg参数是undefined，因此此时只是简单的调用notifyAll，参数moduleId使用来区分到底是哪个监控模块；testMsg参数在这里仅仅用来示例如何传参,在monitorHandler中也仅仅把其打印到console上而已，实际应用中，可以用其传递更有意义的参数；

    - 如果是monitor在收到master的通知后，上报自己的时间信息的话，此时msg将会是一个对象，这个时候，master将这个时间值打印到console，并缓存其值，当然这个值没什么意义，仅仅是为了示例。因此这段代码通过对msg的判断区分了这两种情况。

    - 实际应用中，也经常使用判断msg来区分两种情况的方式。考虑另一种情况，假如使用的不是pull方式，而是push方式的话，那么monitor将会遇到两种情况，与master类似，一种是定时器的周期事件，一种是master给其发了通知或请求，此时也可以通过判断msg进行两种情况的区分，只不过此时将会在monitorHandler中进行判断了。关于这种使用push方式并在monitorHandler中通过判断msg的值进行区分两种情况的实现方式，读者可以自行尝试。

* monitorHandler的实现中，当收到master的通知后，取出了master传来的参数，这里的参数就是testMsg，实际应用中可以使用更复杂的更有实际意义的参数。然后通过对参数进行分析，执行相应的逻辑。这里的逻辑很简单，就是获取自己当前的时间，然后通知给master。

* clientHandler是当有第三方监控客户端给master发请求时，由master进行回调的。为了保持简单，我们这里不再对client做过多的介绍,在开发指南部分会有详细的介绍。

小结
==========

在这部分里，我们使用了pomelo提供的监控管理框架完成了monitor向master上报其本地时间的功能。实际上，通过定制自己的admin module可以实现上报任何我们需要的上报的数据。比如，在实际应用中，connector服务器可以向master报告登录到其服务器上的用户信息，monitor可以向master上报其进程相关的信息等等。在pomelo-admin中还实现了另外几个admin module，这些admin module可以通过对Application调用`app.enable('systemMonitor')`完成开启，这里不再详述，可以直接阅读相关代码。到此为止，我们基本上就介绍完了pomelo的所有基本功能，下面会有一个简单的[总结还有一些没有涉及到的内容](总结 "总结")。
