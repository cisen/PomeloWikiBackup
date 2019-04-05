使用pomelo做服务端开发时，无论什么客户端，只要能遵循与服务端的线上协议，就能够与服务端建立通信。pomelo内建提供的sioconnector和hybridconnector都定义了自己的协议格式，其中sioconnector用于socket.io的通信，hybridconnector则用来处理websocket和tcp的连接通信。为了方便客户端的开发，pomelo提供了部分平台的客户端SDK，这里主要会介绍一下用于Web端的JavaScript的SDK以及基于C语言的libpomelo的使用。

Web端JavaScript开发库
=======================

对于浏览器来说，HTML5中已经支持了websocket，因此使用支持websocket的浏览器可以直接与服务端的hybridconnector建立通信。而对于比较旧的浏览器来说，还没有支持websocket的，可以使用基于socket.io的方式进行与服务端建立连接。因此，对于Web端，pomelo提供了两套开发库，分别适用于支持websocket的浏览器和不支持websocket的浏览器，这两套开发库的链接如下，适用于socket.io的[pomelo-jsclient-socket.io](https://github.com/pomelonode/pomelo-jsclient-socket.io)以及适用于websocket的[pomelo-jsclient-websocket](https://github.com/pomelonode/pomelo-jsclient-websocket)。

#### socket.io的客户端开发库

  对于使用socket.io的客户端SDK来说，其依赖[socket.io-client](https://github.com/learnboost/socket.io-client/), 由于这个库在使用[component](https://github.com/component/component/)进行管理时有bug，因此在使用的时候，是直接引用其提供的js文件，具体引用的js文件为[socket.io-client.js](https://github.com/LearnBoost/socket.io-client/blob/master/socket.io-client.js)。对于pomelo-jsclient-socket.io来说，同样也是直接使用引用其js文件，也即是[pomelo-client.js](https://github.com/pomelonode/pomelo-jsclient-socket.io/blob/master/lib/pomelo-client.js)。在直接引用这两个文件后即可使用pomelo的调用了。

#### websocket的客户端开发库

对于使用websocket的客户端SDK来说，使用了[component](https://github.com/component/component/)进行管理，因此只需要配置一个component.json文件，里面配置相应的依赖，然后运行

    $ component install
    $ component build

component会自动寻找依赖，完成客户端js的打包。用户只需要引用编译后的build.js即可，然后就可以使用pomelo的调用了。关于component的使用，请参考component的wiki。我们的例子[chatofpomelo-websocket](https://github.com/NetEase/chatofpomelo-websocket/tree/master/web-server/public/js/lib)，这里就是使用了component来管理前端js的，可以作为用户使用的一个参考。

<a name="clientAPI"/>
#### web端API简介

无论是socket.io的还是websocket的，都提供了统一的API，下面对这些API进行简单的介绍。

* pomelo.init(params, cb)

这是往往是客户端的第一次调用，params中应该指出要连接的服务器的ip和端口号，cb会在连接成功后进行回调;

* pomelo.request(route, msg, cb)

请求服务，route为服务端的路由，格式为"<ServerType>.<HandlerName>.<MethodName>", msg为请求的内容，cb会响应回来后的回调;

* pomelo.notify(route, msg)

发送notify，不需要服务器回响应的，因此没有对响应的回调，其他参数含义同request;

* pomelo.on(route, cb)

这个是从EventEmmiter继承过来的方法，用来对服务端的推送作出响应的。route会用户自定义的，格式一般为"onXXX";

* pomelo.disconnect()

这个是pomelo主动断开连接的方法。

libpomelo
===============

libpomelo 是 [pomelo](https://github.com/NetEase/pomelo) 的 c 客户端，支持pomelo 0.3版本以后的协议  

### 依赖
* [libuv](https://github.com/joyent/libuv) 跨平台开发库，主要使用了网络I/O和线程  
* [jansson](https://github.com/akheron/jansson) c 的 json 解析库  

### 使用
#### 创建客户端实例
```
// create a client instance.
pc_client_t *client = pc_client_new();
```

#### 添加事件监听
```
// add some event callback.
pc_add_listener(client, "onHey", on_hey);
pc_add_listener(client, PC_EVENT_DISCONNECT, on_close);
```

#### 监听器的定义
```
// disconnect event callback.
void on_close(pc_client_t *client, const char *event, void *data) {
  printf("client closed: %d.\n", client->state);
}
```

#### 连接到服务器
```
struct sockaddr_in address;

memset(&address, 0, sizeof(struct sockaddr_in));
address.sin_family = AF_INET;
address.sin_port = htons(port);
address.sin_addr.s_addr = inet_addr(ip);

// try to connect to server.
if(pc_client_connect(client, &address)) {
  printf("fail to connect server.\n");
  pc_client_destroy(client);
  return 1;
}
```

#### 发起一个 notify 请求
```
// notified callback
void on_notified(pc_notify_t *req, int status) {
  if(status == -1) {
    printf("Fail to send notify to server.\n");
  } else {
    printf("Notify finished.\n");
  }

  // release resources
  json_t *msg = req->msg;
  json_decref(msg);
  pc_notify_destroy(req);
}

// send a notify
void do_notify(pc_client_t *client) {
  // compose notify.
  const char *route = "connector.helloHandler.hello";
  json_t *msg = json_object();
  json_t *json_str = json_string("hello");
  json_object_set(msg, "msg", json_str);
  // decref json string
  json_decref(json_str);

  pc_notify_t *notify = pc_notify_new();
  pc_notify(client, notify, route, msg, on_notified);
}
```

#### 发起一个 requst 请求
```
// request callback
void on_request_cb(pc_request_t *req, int status, json_t *resp) {
  if(status == -1) {
    printf("Fail to send request to server.\n");
  } else if(status == 0) {
    char *json_str = json_dumps(resp, 0);
    if(json_str != NULL) {
      printf("server response: %s\n", json_str);
      free(json_str);
    }
  }

  // release relative resource with pc_request_t
  json_t *msg = req->msg;
  pc_client_t *client = req->client;
  json_decref(msg);
  pc_request_destroy(req);

  // stop client
  pc_client_stop(client);
}

// send a request
void do_request(pc_client_t *client) {
  // compose request
  const char *route = "connector.helloHandler.hi";
  json_t *msg = json_object();
  json_t *str = json_string("hi~");
  json_object_set(msg, "msg", str);
  // decref for json object
  json_decref(str);

  pc_request_t *request = pc_request_new();
  pc_request(client, request, route, msg, on_request_cb);
}
```

### API 接口  
* 创建一个新的pomelo client实例  
```
pc_client_t *pc_client_new();
```

* 停止客户端的连接  
该接口适合于在libuv子线程中调用，然后在主线程中，通过 pc_client_join来wait子线程退出  
```
void pc_client_stop(pc_client_t *client);
```

* 销毁客户端的连接  
```
void pc_client_destroy(pc_client_t *client);
```

* 主线程中调用等待子线程的退出  
```
int pc_client_join(pc_client_t *client);
```

* 创建一个request请求实例  
```
pc_request_t *pc_request_new();
```

* 销毁一个request请求实例  
```
void pc_request_destroy(pc_request_t *req);
```

* 连接到服务器，在连接过程中会创建子线程用于处理网络I/O  
```
int pc_client_connect(pc_client_t *client, struct sockaddr_in *addr);
```

* 销毁pc_connect_t类型的实例  
```
void pc_connect_req_destroy(pc_connect_t *conn_req);
```

* 发起一个request请求  
```
int pc_request(pc_client_t *client, pc_request_t *req, const char *route,
               json_t *msg, pc_request_cb cb);
```

* 创建一个notify请求实例  
```
pc_notify_t *pc_notify_new();
```

* 销毁一个notify请求实例  
```
void pc_notify_destroy(pc_notify_t *req);
```

* 发起一个notify请求  
```
int pc_notify(pc_client_t *client, pc_notify_t *req, const char *route,
              json_t *msg, pc_notify_cb cb);
```

* 添加一个事件监听  
```
int pc_add_listener(pc_client_t *client, const char *event,
                    pc_event_cb event_cb);
```

* 删除一个事件监听  
```
void pc_remove_listener(pc_client_t *client, const char *event,
                    pc_event_cb event_cb);
```

* 触发一个事件监听  
```
void pc_emit_event(pc_client_t *client, const char *event, void *data);
```

### 编译
#### 前提条件
下载 [gyp](http://code.google.com/p/gyp/source/checkout)  
gyp 其实是一个python写的脚本，并不需要安装，只需要下载下来，可以执行gyp里面的脚本就行  

#### Mac 环境
```
./pomelo_gyp
xcodebuild -project pomelo.xcodeproj
```

#### IOS 环境
```
./pomelo_gyp -DTO=ios
./build_ios
```

#### IOS 模拟器
```
./pomelo_gyp -DTO=ios
./build_iossim
```

#### Linux 环境
```
./pomelo_gyp
make
```

#### Windows 环境
在libpomelo项目跟目录下  
打开[git bash](https://help.github.com/articles/set-up-git#platform-windows)，敲入  
```
mkdir -p build
git clone https://github.com/martine/gyp.git build/gyp
```
之后，打开windows cmd命令行窗口，并且cd切换目录到libpomelo跟目录下面，敲入    
```
build\gyp\gyp.bat --depth=. pomelo.gyp -Dlibrary=static_library -DTO=pc 
```
之后就会生成pomelo.sln，使用visual studio打开即可进行编译  


#### Android 环境
开发前提条件：   
windows:   
* 安装 [Cygwin](http://www.cygwin.com/) with make (select make package from the list during the install).    
* android adt eclipse 这个只要下载最新的 android sdk 里面就有一个配置好环境的 eclipse    

环境搭建：    
1: 新建一个 android 工程，比如新建一个 test 的 工程，建完之后如图：  
![test工程](http://ww3.sinaimg.cn/large/6a98ae6cgw1e3ym2kkdofj207x0f0q3t.jpg)


2: 然后在项目根目录下面，新建一个 jni 文件夹  
然后里面添加一个 Android.mk 文件  
在 Android.mk 里面敲入    

 

    LOCAL_PATH := $(call my-dir)
    
    include $(CLEAR_VARS)
    
    LOCAL_MODULE := game_shared
    
    LOCAL_MODULE_FILENAME := libgame               
    
    LOCAL_WHOLE_STATIC_LIBRARIES := pomelo_static
                
    include $(BUILD_SHARED_LIBRARY)
    
    LOCAL_CFLAGS    := -D__ANDROID__ 
    
    $(call import-module,libpomelo) 


这样子就表示将在 android 中使用 libpomelo 编译而来的 .so 库  

3: 然后在项目目录下面新建一个 pomelo 的文件夹，然后从 github 上把最新的 libpomelo 下载到 刚刚建的 pomelo 文件夹下面  
![enter image description here](http://ww2.sinaimg.cn/large/6a98ae6cgw1e3ymh7vavqj208h0gtq3v.jpg)

4: 然后打开终端（windows 则打开 cygwin）
在项目目录下敲入  
ndk-build NDK_MODULE_PATH=/android项目绝对路径/pomelo/  
即可完成编译  

![enter image description here](http://ww3.sinaimg.cn/large/6a98ae6cgw1e3ymfi9wk8j20lt0e9787.jpg)


5: 如果是要结合cocos2d-x进行开发，那么只需要把 libpomelo 放在 /cocos2dx绝对路径/cocos2dx/platform/third_party/android/prebuilt 文件夹里面，然后执行 ./build_native.sh 即可  
具体可参考 [cocos2d-x android](https://github.com/cocos2d/cocos2d-x/tree/master/samples/Cpp/TestCpp/proj.android)
