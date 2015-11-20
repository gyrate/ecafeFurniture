/**
 * Created by IntelliJ IDEA.
 * User: zhanglinhai
 * Date: 13-11-22
 * Time: 上午10:45
 * 用于测试前端组件性能
 */
var Timer ={
    _data:[],
    start:function(key){
        this._data[key] = new Date();
    },
    stop:function(key){
        var time = Timer._data[key];
        if(time){
            Timer._data[key] = new Date - time;
        }
    },
    getTime:function(key){
        return Timer._data[key];
    },
    showResult:function(key) {
        var div = document.createElement('div');
        div.style.cssText = 'position:fixed; top:0;left:0;right:0; background:#f0f0f0;border-bottom:1px solid #ccc;';
        div.innerHTML = '组件总用时:' + this.getTime(key) + 'ms';
        document.body.appendChild(div);
    }
} ;
