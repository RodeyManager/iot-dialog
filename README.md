
## Features

+ 采用TypeScript开发弹框组件

![Alt text](assets/images/mpv1.jpg)

##USE

```javascript

    iot.dialog({
        id: 'OPEN-1',
        title: '提示',
        message: 'is message!!!',
        lock: true,
        ok: {
            text: '确认',
            callback: function(){
                console.log(this);
                //阻止关闭弹框
                return false;
            }
        },
        cancel: {
            text: '取消',
            callback: false
        }
    });

    //可以通过id获取dialog实例
    var dialog = iot.getDialog('OPEN-1');

    //设置标题
    dialog.setTitle('改变标题');
    //设置内容
    dialog.setMessage('设置新内容');
    //设置自动关闭时间  秒为单位
    dialog.setTime(3);

    //options
    dialog.isLock(true);
    dialog.open(id, options);
    dialog.close(id);
    dialog.remove();
    dialog.affirm(text, function)；
    dialog.shut(text, function);
    dialog.show();
    dialog.hide();

```

##options

#License
ISC
