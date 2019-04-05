* 上面我们使用了dictionary的方式对聊天应用中的路由信息进行了压缩，减少了很多通信中的额外开销。在这里，我们将使用pomelo提供的protobuf实现完成通信消息的基于protobuf的压缩。protobuf是google提出的数据交换格式，关于protobuf的更多信息请参阅[这里](https://github.com/google/protobuf)。

* 原始的protobuf，首先需要定义一个.proto文件，然后调用protoc进行编译，根据不同的宿主语言，生成源码，然后将生成的源码应用到具体使用protobuf的应用中。这种使用方式比较笨重，因为涉及到了静态编译，应用程序无法在运行时动态地使用，一旦数据格式有变，就需要修改proto，编译，重新生成源码。

* pomelo的protobuf实现，借助了javascript的动态性，使得应用程序可以在运行时解析proto文件，不需要进行proto文件的编译。pomelo的实现中，为了更方便地解析proto文件，使用了json格式，与原生的proto文件语法是相通的，但是是不相同的。用户定义好客户端以及服务端的通信所需要的信息格式的proto文件，服务端的proto配置放在config/serverProtos.json中，客户端的proto配置放在config/clientProtos.json。如果在其配置文件里，配置了所有类型的proto信息，那么在通信过程中，将会全部使用二进制的方式对消息进行编码; 如果没有定义某一类消息相应的proto，pomelo还是会使用初始的json格式对消息进行编码。

chat中使用
============

下面将pomelo-protobuf应用到我们的聊天应用中，具体的代码在分支`tutorial-protobuf`中，使用下面命令切换分支：

    $ git checkout tutorial-protobuf

* 首先提取所有的数据格式，分为客户端使用的数据格式以及服务器端使用的数据格式，如下：

```javascript

// clientProtos.json
{
  "chat.chatHandler.send": {
    "required string rid": 1,
    "required string content": 2,
    "required string from": 3,
    "required string target": 4
  },

  "connector.entryHandler.enter": {
    "required string username": 1,
    "required string rid": 2
  },

  "gate.gateHandler.queryEntry": {
    "required string uid": 1
  }
}

// serverProtos.json
{
  "onChat": {
    "required string msg": 1,
    "required string from": 2,
    "required string target": 3
  },

  "onLeave": {
    "required string user": 1
  },

  "onAdd": {
    "required string user": 1
  }
}

```
* 然后将这两个配置文件分别命名为clientProtos.json和serverProtos.json中，并将这两个配置文件都放到config目录下;
* 在我们的程序中开启protobuf，在app.js的配置中，增加protobuf使用，在配置connector的时候，加入useProtobuf:

```javascript

app.configure('production|development', 'connector',  function() {
  app.set('connectorConfig', {
    connector: pomelo.connectors.hybridconnector,
    heartbeat: 3,
    useDict: true,
    useProtobuf: true //enable useProtobuf
  });
});

app.configure('production|development', 'gate', function(){
	app.set('connectorConfig', {
			connector : pomelo.connectors.hybridconnector,
			useDict: true,
      useProtobuf: true //enable useProtobuf
		});
});

```

这样，我们对我们的聊天应用进行了protobuf的压缩。当然，我们这里仅仅是为了示例，实际上，对于onAdd以及onLeave这样的，数据包本身就很小，而且又是字符串，对其使用proto压缩的效果不大，完全没必要进行使用proto压缩，而且使用protobuf压缩会造成编解码的效率开销，得不偿失。实际运用中，还是需要根据实际情况进行合理的选择，更多时候我们是在消息的压缩率和编解码的开销中达到一个平衡。

对于proto文件里面没有配置的通信数据类型，pomelo依然会使用原始的基于json的数据通信格式。

小结
============

到这里为止，我们已经实现了一个功能基本完善的聊天应用了，我们使用了pomelo提供的filter机制，基于dict的route压缩和基于protobuf的消息压缩。下面将给聊天应用增加一些纯属``“画蛇添足”``的一些功能，目的是为了继续展示pomelo的特性。下一步，[给聊天应用增加一个rpc调用](增加rpc调用 "rpc调用")。
