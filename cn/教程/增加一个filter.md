在实际的应用中，我们往往需要在逻辑服务器处理请求之前对用户请求做一些前置处理，而当请求被处理后，又需要做一些善后处理，由于这是一种很常见的情形，pomelo对其进行了抽象，也就是filter。在pomelo中，filter分为before filter和after filter。在一个请求到达Handler被处理之前，可以经过多个before Filter组成的filter链进行一些前置处理，比如对请求进行排队，超时处理。当请求被Handler处理完成后，又可以通过一个after filter链进行一些善后处理。这里需要注意的是在after filter中一般只做一些清理处理，而不应该再去修改到客户端的响应内容，因为此时，对客户端的响应内容已经发给了客户端。

本例是一个聊天应用，在聊天室里，当有人说脏话时，往往需要进行屏蔽。我们在这里就以加一个脏话屏蔽的filter来示范如何使用pomelo的filter。具体的代码请切换到`tutorial-abuse-filter`分支，使用如下命令：

    $ git checkout tutorial-abuse-filter

Filter结构
================

Filter是一个对象，定义一个Filter的大致代码如下:

```javascript
var Filter = function (<args>) {
  // ....
};

Filter.prototype.before = function(msg, session, next) {
	// ...
}

Filter.prototype.after = function(err, msg, session, resp, next) {
 // ...
}

```

如果定义了before，那么就可以作为一个before filter使用，如果定义了after，就是一个after filter。

对于before filter来说，其有两个参数msg和session，这里msg可能是用户请求原始内容，也可能是经过了前面filter链处理后的内容。如果在后端服务器上，session在这里是BackendSession，如果在前端服务器上，则是FrontendSession，用户对其的直接修改都只会在整个请求处理链的后面处理过程中有效，而不会对前端的session有任何影响，更不会影响原始的session信息了。当然如果确实有需要修改session的话，比如绑定uid的话，可以通过BackendSessionService的相关调用达到目的。

在after中，err是当前面有错误的错误信息，resp是对客户端的相应内容。当定义好Filter后，通过application的filter，before或after调用将其挂到对应的逻辑服务器处理的处理链上。这是只是一个简单教程，不做深入探讨。


定义我们自己的Filter
=========================

我们这里需要的一个脏话过滤Filter，为了简单起见我们只对`fuck`进行过滤。在before filter里，如果用户发言里有`fuck`字眼，那么就将其替换为`****`,并在其session里增加一个标记。在after filter里，我们检查session的这个标记，如果是脏话，那么就将这个用户的名字记录下来，同样为了简单起见，我们将其记录的方式仅仅是打到console中。我们的abuseFilter 代码如下:

```javascript
// abuseFilter.js
module.exports = function() {
  return new Filter();
}

var Filter = function() {
};

Filter.prototype.before = function (msg, session, next) {
  if (msg.content.indexOf('fuck') !== -1) {
    session.__abuse__ = true;
    msg.content = msg.content.replace('fuck', '****');
  }
  
  next();
};

Filter.prototype.after = function (err, msg, session, resp, next) {
  if (session.__abuse__) {
    var user_info = session.uid.split('*');
    console.log('abuse:' + user_info[0] + " at room " + user_info[1]);
  }
  next(err);
};

```

在定义完filter后，我们需要把其配置到chat服务器中，在app.js中增加代码如下：

```javascript

// app.js
var abuseFilter = require('./app/servers/chat/filter/abuseFilter');
app.configure('production|development', 'chat', function() {
	app.filter(abuseFilter());
});

```

好了，让我们按照前面所讲的部分，重新运行我们的chat应用，在聊天内容里面输入what a fucking day，看看是不是已经被****替换了，效果图如下：

![abuse](images/abuse.png)

一些说明
=============

* 需要指出的是，这里使用filter来做脏话替换，可能不是很合理，但仅仅为了示例filter的使用，还是可以的。一般情况下，在before filter里，可以做一些请求排队，超时处理, 而在after filter里做一些清理记录的处理。比如，为了统计Handler的处理请求时间，可以在before filter里给session记录一个时间戳，在after filter里取出刚才的时间戳，跟当前时间做运算，就能得到Handler处理请求的时间。pomelo内置提供了几个filter，有toobusy，timeout等，这里不再深入。

* 一个filter里可以只定义before，可以只定义after，也可以两者都定义。application中与filter相关的调用为filter，after和before。如果一个filter既定义了before又定义了after，那么就可以调用filter，这样，application就会将其after和before都加载进去，否则，就只能调用after或者before了。

小结
==============

在这部分，我们使用了pomelo 提供的filter机制实现了我们聊天应用的脏话过滤。当然我们的实现非常得简陋而且并不一定很合理，但是仅仅是为了说明Filter的使用方式，还是可行的。下一步我们来使用[基于dict的route压缩](试试route压缩 "route压缩")来继续完善我们的聊天应用。
