在这部分，我们将讨论关于rpc调用相关的问题。在pomelo中rpc的调用主要是通过proxy组件和remote组件实现，其中proxy组件主要负责创建rpc客户端代理，让开发者在pomelo中更方便地进行rpc调用；remote组件主要负责加载rpc服务，包括系统的rpc服务和用户的rpc服务。Pomelo的rpc框架主要解决了两个问题，第一个就是进程间的路由策略，第二个则是rpc底层的通信协议的选择。对于第一个问题，pomelo提供了一套灵活的路由机制，并允许开发者根据需要自由地控制路由信息；对于第二个问题，pomelo现在支持基于socket.io的通信机制和基于原生socket的通信机制。下面我们就分别介绍rpc客户端和服务端的具体实现：

## RPC客户端
rpc客户端主要负责产生代理对象，加载路由策略和进行消息的转发。
### proxy组件
在进行pomelo开发的过程中，进行rpc调用的代码如下：

```
app.rpc.chat.chatRemote.add(session, uid, serverId, param, cb);
```

在pomelo中之所以能够如此简洁地进行rpc调用是因为javascript的语言特性和pomelo底层对rpc客户端进行的封装。proxy组件在启动时首先会生成一个rpc client，同时监听系统中服务器增加、服务器移除、服务器替换事件；当这些事件被触发时，proxy组件会根据相应的事件信息对服务器代理对象进行相应的动态变化。例如，当有新的服务器增加时，proxy组件会增加该服务器的代理对象；当有服务器被移除后，proxy组件会移除该服务器的代理对象。在proxy组件启动完成时会将rpc client生成的代理对象挂载到app.rpc下，这样开发者在进行rpc调用时就可以匹配到对应的代理对象，从而通过rpc client进行相应的rpc调用。

### RPC client
对于rpc client，其整体架构图如下所示：

![rpc client](http://pomelo.netease.com/resource/documentImage/rpc-client.png)

在最底层，使用mail box的抽象隐藏了底层通讯协议的细节。一个mail box对应一个远程服务器的连接。Mail box对上提供了统一的接口，如：连接，发送，关闭等。Mail box内部则可以提供不同的实现，包括底层的传输协议，消息缓冲队列，传输数据的包装等。开发者可以根据实际需要，实现不同的mail box，来满足不同的底层协议的需求。现在pomelo提供基于socket.io的mail box和基于原生socket的mail box，默认使用socket.io。

在mail box上面，是mail station层，负责管理底层所有mail box实例的创建和销毁，以及对上层提供统一的消息分发接口。上层代码只要传递一个目标mail box的id，mail station则可以知道如何通过底层相应的mail box实例将这个消息发送出去。开发者可以给mail station传递一个mail box的工厂方法，即可以定制底层的mail box实例的创建过程了，比如：连接到某个服务器，使用某一类型的mail box，而其他的服务器，则使用另外一个类型的mail box。

再往上的是路由层。路由层的主要工作就是提供消息路由的算法。路由函数是可以从外面定制的，开发者通过注入自定义的路由函数来实现自己的路由策略。每个rpc消息分发前，都会调用路由函数进行路由计算。容器会提供与该rpc相关的玩家会话对象（当中包含了该玩家当前的状态）和rpc的描述消息（包含了rpc的具体信息），通过这两个对象，即可做出路由的决策。路由的结果是目标mail box的id，然后传递给底下的mail station层即可。

最上面的是代理层，其主要作用是隐藏底层rpc调用的细节。Pomelo会根据远程接口生成代理对象，上层代码调用远程对象就像调用本地对象一样。但这里对远程代理对象有两个约定的规则，即第一个参数必须是相关玩家的session对象，如果没有这么一个对象可以填充null，在路由函数中需做特殊处理。还有就是最后一个参数是rpc调用结果的回调函数，调用的错误或是结果全部通过该回调函数返回，且这个参数不能省略。而在远程服务的提供端，方法的声明与代理端的声明相比，除了不需要第一个session参数，其余的参数是一样的。

### rpc请求流程
对于发送rpc请求，rpc客户端采用了一种懒加载的机制，其主要实现思路是客户端与服务端的连接并不是在服务器启动后就创建，而是当客户端第一次向服务端发起rpc请求时才真正建立连接。当客户端与相应的服务端建立连接后，以后有从该客户端到对应服务端的请求就无需再建立连接，消息可以直接发送。消息的发送过程类似前面介绍的handler-filter链处理模式，同样在rpc请求过程开发者可以添加before和after filter对消息进行相应的处理，现在pomelo内建的rpc filter包括rpcLog和toobusy。

## RPC服务端
rpc服务端主要负责接收客户端的rpc请求后将相应的消息转给客户端请求的rpc服务中，同时将rpc服务处理完成的消息返回给rpc客户端。
### remote组件
remote组件在启动时会创建一个rpc server，同时加载系统中所有的rpc服务；remote组件在关闭时会停止rpc server的所有服务。
### RPC server
对于rpc server，其整体架构图如下所示：

![rpc server](http://pomelo.netease.com/resource/documentImage/rpc-server.png)
 
最底下的是acceptor层，主要负责网络监听，消息的接收和解析。Acceptor层与mail box层相对应，可以看成是网络协议栈上同一层上的两端，即从mail box层传入的消息与acceptor层上传出的消息应该是同样的内容。所以这两端的实例必须一致，使用同样的底层传输协议，对传输的数据使用同样格式进行封装。在客户端替换了mail box的实现，则在服务提供端也必须替换成对应的acceptor实现。同mail box一样，pomelo提供基于socket.io的acceptor和基于原生socket的acceptor。

往上是dispatch层。该层主要完成的工作是根据rpc描述消息将请求分发给上层的远程服务。

最上层的是远程服务层，即提供远程服务业务逻辑的地方，由pomelo框架自动加载remote代码来完成。

## 需要注意的地方
大部分的mailbox序列化使用的是```JSON.stringfiy```，当消息量过大时（使用bufferMsg时），会导致序列化过程更长，最终可能会发送失败（包太大）。同时由于超时等待时，是需要计算序列化时间的，所以这个超时有可能在消息量较大的情况下直接就在本地发生（内存存在泄漏,并且超时消息会没法取消）。

## 总结
在本部分，详细介绍了rpc客户端和服务端的通信机制，包括对mail box、mail station、acceptor、gateway的功能进行了阐述，同时分析了pomelo中proxy组件和remote组件的相关功能。
