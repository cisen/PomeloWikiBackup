在实际编程中，网络带宽的有效数据负载率是一个值得考虑的问题。对于移动客户端来说，网络资源往往不是很丰富，为了尽可能地节省网络资源，往往需要尽大可能地增加数据包的有效数据率。

以我们的聊天应用为例，当客户端发起聊天时，需要指定处理其请求的服务器的路由信息，示例如下：

```javascript

pomelo.request('chat.chatHandler.send', 
  // ...
);

```
这个路由信息指出，处理这个请求的应该是chat服务器的chatHandler的send方法。当服务器给客户端推送消息的时候，同样也需要指明客户端的路由信息，在例子聊天应用中有onAdd，onLeave等。考虑当用户发起聊天的信息很短的时候，比如用户仅仅发了一个字，而我们在传输的时候一样要加上一个完整的路由信息，这样将造成实际传输中，有效数据率极低，网络资源被大量的额外信息浪费。最直接的想法就是缩短路由信息，对服务端的路由信息来说，由于当服务器确定后，其路由信息就确定了，对于客户端来说，虽然可以起很短的名字，但是很容易造成程序不可读。

针对这种情况，pomelo提供了基于字典的路由信息压缩。

* 对于服务端，pomelo会扫描所有的Handler信息
* 对于客户端，用户需要在config/dictionary.json中声明所有客户端使用的路由。

通过这两种方式，pomelo会拿到所有的客户端和服务端的路由信息，然后将每一个路由信息都映射为一个小整数，从1开始映射，累加。目前pomelo的路由信息压缩仅仅支持使用hybridconnector的方式，使用sioconnector的方式，暂不支持。在hybridconnector的实现中，如果使用了路由信息压缩，在客户端与服务器建立连接的握手过程中，服务器会将整个字典传给客户端，这样在以后的通信中，对于路由信息，将全部使用定义的小整数进行标记，大大地减少了额外信息开销。

chat中使用
===========

下面我们就将route压缩用到我们的chat示例中，具体的代码在分支`tutorial-dict`中，使用下面命令切换分支：

    $ git checkout tutorial-dict

首先看看客户端有哪些路由信息，我们把它放到config/dictionary.json里:

```javascript

// dictionary.json
[
  'onChat',
  'onAdd',
  'onLeave'
]

```

然后我们在connector配置选项里面增加useDict设置为true。

```javascript

app.configure('production|development','connector', function() {
  app.set('connectorConfig', {
    connector: pomelo.connectors.hybridconnector,
    heartbeat: 3,
    useDict: true // enable dict
  });
});

app.configure('production|development','gate', function() {
  app.set('connectorConfig', {
    connector: pomelo.connectors.hybridconnector,
    useDict: true // enable dict
  });
});

```

* 好了，现在我们就已经开启了pomelo的路由压缩，现在的所有的数据包的路由信息都变成小整数了。
* 对于dictionary中添加的客户端路由，会使用路由压缩。如果有客户端的推送路由没有加入到dictionary中，会怎么样呢？不用怕，对于在dictionary中找不到的路由信息，pomelo还是会使用原来不压缩的路由。

小结
=========

到目前位置，我们客户端与服务器之间使用的消息传输格式一直都是json。实际上，虽然json很方便，但是由于其还带了一些字段信息，在客户端和服务端数据包格式统一的情况下，这些字段信息是可以省略的，可以直接传输具体的消息，也就是说不再以字符串作为通信格式了，直接发送有效的二进制数据将会更好地减少额外开销，下面我们会使用pomelo提供的[protobuf 实现](Protobuf压缩 "Protobuf压缩")应用到我们的聊天应用中，以使得我们的应用更完善。

