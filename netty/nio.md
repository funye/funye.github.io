## JAVA NIO

### Channel

- 既可以从通道中读取数据，又可以写数据到通道。但流的读写通常是单向的。
- 通道可以异步地读写。
- 通道中的数据总是要先读到一个Buffer，或者总是要从一个Buffer中写入。

在channel中还有一个概念就是 scatter / gather
- scatter 将channel的数据分散到多个buffer中
- gather 将多个buffer的数据聚合到channel中

例如：
1.scatter 将channel的数据read到多个buffer,读满第一个后再读下一个

```java
    ByteBuffer header = ByteBuffer.allocate(128);
    ByteBuffer body   = ByteBuffer.allocate(1024);
    ByteBuffer[] bufferArray = { header, body };
    channel.read(bufferArray);
```

Scattering Reads在移动下一个buffer前，必须填满当前的buffer，这也意味着它不适用于动态消息(译者注：消息大小不固定)。换句话说，如果存在消息头和消息体，消息头必须完成填充（例如 128byte），Scattering Reads才能正常工作。


2.gather 将多个buffer的数据写到channel

```java
    ByteBuffer header = ByteBuffer.allocate(128);
    ByteBuffer body   = ByteBuffer.allocate(1024);
    //write data into buffers
    ByteBuffer[] bufferArray = { header, body };
    channel.write(bufferArray);
```

buffers数组是write()方法的入参，write()方法会按照buffer在数组中的顺序，将数据写入到channel，注意只有position和limit之间的数据才会被写入。因此，如果一个buffer的容量为128byte，但是仅仅包含58byte的数据，那么这58byte的数据将被写入到channel中。因此与Scattering Reads相反，Gathering Writes能较好的处理动态消息。


### Buffer

数据是从通道读入缓冲区，从缓冲区写入到通道中的

buffer有读写两种模式。通过 flip() 方法切换到读模式

buffer的三个重要概念
- capacity buffer的容量
- limit 
- position 

以上三个概念都需要区分当前的buffer是读模式还是写模式来分析

1. 写模式的下 limit=capacity=最多能往Buffer里写多少数据 position为当期正在写的数据的下标

2. 读模式下 limit=写模式下position 的值，也就是之前写入的数据大小。position置0，并随着读取数据而移动

**基本方法**
- allocate() 申请空间
- put() 写数据
- get(）读数据
- flip() 切换成读状态，即 limit=position,postion=0
- rewind() 重新读取，即 limit不变，position=0
- clear() 清空缓存，未读数据也会清楚，position=0, limit=capacity
- compact() 与clear() 不同的是，未读数据会放到缓存的开头，position从未读数据末尾开始，可以保留之前未读的数据
- mark()/ reset() 配合使用，标识一个位子，然后reset的时候，游标回到标记的位子

### Selector

使用selector之后，一个selector可以同时处理多个channel，这样就是可以做到一个线程处理多个通讯信道了，减少线程数。（但是现在CPU都是多核，利用多线程也是对CPU的充分利用）

selector监听channel的四种事件，这四种事件用SelectionKey的四个常量来表示：
- SelectionKey.OP_CONNECT
- SelectionKey.OP_ACCEPT
- SelectionKey.OP_READ
- SelectionKey.OP_WRITE


[关于selector的文章](http://ifeve.com/selectors/)

```java
    Selector selector = Selector.open();
    channel.configureBlocking(false);
    SelectionKey key = channel.register(selector, SelectionKey.OP_READ);
    while(true) {
      int readyChannels = selector.select();
      if(readyChannels == 0) continue;
      Set selectedKeys = selector.selectedKeys();
      Iterator keyIterator = selectedKeys.iterator();
      while(keyIterator.hasNext()) {
        SelectionKey key = keyIterator.next();
        if(key.isAcceptable()) {
            // a connection was accepted by a ServerSocketChannel.
        } else if (key.isConnectable()) {
            // a connection was established with a remote server.
        } else if (key.isReadable()) {
            // a channel is ready for reading
        } else if (key.isWritable()) {
            // a channel is ready for writing
        }
        keyIterator.remove();
      }
    }
```










