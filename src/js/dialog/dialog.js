Sui.namespace('Sui.dialog');

/**
 * 弹出窗口组件命名空间，负责管理所有存在的窗体、窗体数据
 * @class Sui.dialog
 * @static
 */
(function(window) {

    Sui.dialog = {

        top:null,
        dataStore:null,
        list:null,
        opener:null,

        /**
         * 获得同域的最顶层窗口
         * @method _getTop
         * @private
         */
        _getTop:function(){
            var win = window;
            //自身为顶部窗口
            if(win.top == win ){
                return win;
            }
            //自身与顶部窗口同域
            try{
                win.top.document;
                win = win.top;
                return win;
            }catch(e){}
            //自底向上找直到域名不同
            try{
                while(win.parent.document){
                    win = win.parent;
                }
            }catch(e){
                return win;
            }
        },

        init:function(){
            try{
                this.top = this._getTop();
                //初始化数据存储池
                if (!this.top._Sui_Dialog_Date) {
                    this.top._Sui_Dialog_Date = {};
                }
                this.dataStore = this.top._Sui_Dialog_Date;
                //初始化所有窗体列表
                if(!window._Sui_Dialog_List){
                    window._Sui_Dialog_List = {};
                }
                this.list = window._Sui_Dialog_List;
            }catch(e) {
            }
        },

        data:function(dataName, value) {

            //指定value变量时为set方法、不指定则为get方法
            if (Sui.isDefined(value)) {
                this.dataStore[dataName] = value;
            } else {
                return this.dataStore[dataName] ;
            }

        },

        open:function() {

        },
        add:function(id,dialog){
            this.list[id] = dialog;
            if(this.top !== window){
                this.top.Sui.dialog.list[id] = dialog;
            }
        },
        remove:function(id) {
            this.list[id] = null;
            delete this.list[id];

            if(this.top !== window){
                delete this.top.Sui.dialog.list[id];
            }
        },
        removeData:function(name){
            var data =  this.data[name];
            data && delete data;
        },
        close:function() {
            var dialog = this.top.Sui.dialog.list[window.name];
            dialog && dialog.closeDialog();
        },

        createId:function() {
            return 'SuiDialog' + (new Date()).getTime();
        },
        getCurrentDialog: function () {
            //遍历所有窗体，如果遇到状态为opening的窗体则作为当前窗体，
            // 判断方式有bug，不能解决同时存在多个打开窗口的情况
            var dialog = this.top.Sui.dialog.list[window.name];
            if (dialog) {
                return dialog;
            } else {
                for (var i in this.list) {
                    if (this.list[i].isOpening()) {
                        return this.list[i];
                    }
                }
            }
        },
        /**
         * 设置当前窗体的属性,只适合在窗体的iframe内使用
         * @method setProperty
         * @param prop
         * @param val
         */
        setProperty: function (prop, val) {

            var dialog = this.top.Sui.dialog.list[window.name];

            if (dialog && dialog.option.hasOwnProperty(prop)) {

                if (Sui.isArray(dialog.option[prop])) {
                    dialog.option[prop].push(val);
                } else {
                    dialog.option[prop] = val;
                }
            }
        }
    };

    Sui.dialog.init();

})(window);

/**
 * 弹出窗体，别名SysDialog
 * @class Sui.dialog.SysDialog
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.title 标题
 * @param {String} config.id 弹出窗口唯一标识，可通过Sui.dialog.list[id]方式找到对应窗体，如果不声明该参数则为窗体自动生成Id
 * @param {String,Dom}  config.body   主体内容
 * @param {String}  config.url  若该属性存在，则窗口主体为以该值为src的iframe
 * @param {Array}  config.button  按钮,如 [{value:'ok',fun:{},arg:[]},{value:'cancel',fun:{},arg:[]},]
 * @param {Boolean}  config.mask  是否生成遮罩层，默认为true，此时除弹出窗口外其他区域点击无效
 * @param {Number}  config.maskAlpha  遮罩层透明度，为0-1二位小数，默认值0.4
 * @param {Number}  config.width  内容区宽度
 * @param {Number}  config.height  内容区高度
 * @param {Array}  config.openAfterFun 弹出窗口后执行函数  [ { fun:function(){},arg:[] },{ fun:function(){},arg:[]},... ]
 * @param {Array}  config.closeBeforeFun 关闭窗口前执行函数 [ { fun:function(){},arg:[] },{ fun:function(){},arg:[]},... ]
 * @param {Array}  config.closeAfterFun 关闭窗口后执行函数 [ { fun:function(){},arg:[] },{ fun:function(){},arg:[]},... ]
 * @param {Boolean}  config.hideScroll 是否隐藏html滚动条 true|false(缺省)
 * @param {Boolean}  config.autoOpen 是否创建后自动打开窗口 true(缺省)|false
 * @param {Boolean}  config.drag 是否可拖拽 true(缺省)|false
 * @param {Boolean}  config.resize 是否可改变窗口尺寸 true|false(缺省)
 * @param {Object}  config.trigger 声明该弹出窗口的触发者，以便返回数据给它
 * @param {Function}  config.callback 触发者传入dialog的回调函数
 * @param {Boolean} config.needIframeInIE  在IE浏览器是否需要使用iframe方法将layer的z轴层级提高，高于视频控件 ，该参数只对IE有效
 * @param {Boolean} config.appendToTop true为在顶部窗口生成，false为在当前窗口生成，默认为true
 * @param {Boolean} config.hasCloser  是否出现关闭按钮，默认为true
 * @example
 * <pre><code>
 *    new SysDialog({
 *       title:'我是标题栏'
 *       body:document.getElementById('content'),
 *       button:[{ value:'提交',func:{ form.submit(); }, arg:[ item1,item2] }],
 *       maskAlpha:0.6,
 *       width:400,
 *       height:220,
 *       openAfterFun: [{ fun:function(){ alert('I execute after opening'); },arg:[] }, ...] ,
 *       closeAfterFun: [{ fun:function(){ alert('I execute after close'); },arg:[] }, ...] ,
 *       resize:true,
 *       callback: function(){ alert(window.caller); }
 *    })
 *
 * </code></pre>
 */
Sui.dialog.SysDialog =
SysDialog = //兼容旧版本名称,新版本会删除
function (option) {

    //查找顶部list,如果标识已经存在，则不创建窗体
    if(option.id && Sui.dialog.top.Sui.dialog.list[option.id]){
        typeof console !== undefined && console.log('The Dialog Id exists.');
        return false;
    }

    //初始化配置参数和属性
    this.initConfig(option);
    this.initProperty();

    //关闭iframe窗体时，遍历其子窗口，将子窗口全部关闭
    if(this.top !== window){
        $(window).bind('unload', function () {
             for(var i in Sui.dialog.list){
                 Sui.dialog.list[i].closeDialog();
             }
        });
    }
    if(this.option.mask){
        this.createMask();
    }
    this.createDialog();
    if (this.option.autoOpen && !this.option.url) {
        this.openDialog();
    }

};

Sui.dialog.SysDialog.prototype = {
    constructor:Sui.dialog.SysDialog,
    /**
     * 初始化配置参数
     * @param {Object} option
     */
    initConfig:function(option){

        this.option = $.extend({
            title:'系统消息',
            body:'',
            url:null,
            button:[],
            funs:[],
            mask:true,
            maskAlpha:0.4,
            width:'auto',
            height:'auto',
            openAfterFun:[],
            closeAfterFun:[],
            closeBeforeFun:[],
            hideScroll:false,
            autoOpen:true,
            drag:true,
            resize:false,
            trigger:null,
            callback:null,
            opening:false ,//标记窗口是否开启中
            needIframeInIE:false,  //在IE浏览器是否需要使用iframe方法将layer的z轴层级提高，高于视频控件 ，该参数只对IE有效
            appendToTop:true,
            hasCloser:true
        }, option); //定义并覆盖默认参数

        this.template = option.template
        || '<div class="std_pop"  actor="wrap">'
        + '    <div class="pop_border"> '
        + '        <table>'
        + '            <colgroup>'
        + '                <col>'
        + '            </colgroup>'
        + '            <tbody>'
        + '            <tr>'
        + '                <td>'
        + '                    <div class="pop_title" actor="drager">'
        + '                        <span actor="title"></span>'
        +                          ( this.option.hasCloser ? '<b class="close _close" actor="closer" ></b>' : '')
        + '                    </div>'
        + '                </td>'
        + '            </tr>'
        + '            <tr>'
        + '                <td class="pop_main" actor="main"> '
        + '                    <div class="pop_content" actor="content"> '
        + '                    </div> '
        + '                </td>'
        + '            </tr>'
        + '            <tr>'
        + '                <td>'
        + '                    <div class="pop_foot" actor="foot">'
        + '                    </div>'
        + '                </td>'
        + '            </tr>'
        + '            </tbody>'
        + '        </table>'
        + '        <b class="pop_resize" actor="resizer"></b>'
        + '    </div>'
        + '</div>';
    },
    /**
     * 初始化各种参数
     * @method  initProperty
     * @private
     */
    initProperty:function () {
        //$遮罩层
        this.mask = null;
        //异步加载完成前的提示标签，option.url不为null时会使用到
        this.tip = null;
        //$窗口主体
        this.dlg = null;
        //窗口主体iframe
        this.iframe = null;
        //$顶部窗口
        this.top = this.option.appendToTop ? Sui.dialog.top : window;
        this.document = $(this.top.document);
        //$窗口内容区的所有表单项
        //this.inputs = null;
        //该弹出窗的触发者
        this.trigger = this.option.trigger;
        this.callback = this.option.callback;
        //当前滚动位置
        this.scrolltop = $(this.top.document).scrollTop();
        //按钮
        this.button = [];
        //窗体唯一标识
        this.id = this.option.id || Sui.dialog.createId();
        Sui.dialog.add(this.id , this);
        //catch各个组件Dom元素
        this.title = null;
        this.main = null;
        this.content = null;
        this.foot = null;
        this.closer = null;
        this.drager = null;
        this.resizer = null;

    },
    /**
     * 创建并显示遮罩层
     * @method createMask
     * @private
     */
    createMask:function(callback) {
        var that = this,
            wh = Math.max($(window.document).height(), $(this.top.document).height()),
            alpha = this.option.maskAlpha,
            mask = this.document[0].createElement("div"),
            isIE6 = !('minWidth' in document.documentElement.style);

        if (this.option.hideScroll) {
            $(this.document).find('html').css('overflow', 'hidden').scrollTop(that.scrolltop);
        }

        mask.style.cssText = 'position:absolute;top:0;left:0;margin:0;padding:0;background:#333;'
            + 'width:100%;height:' + wh + 'px;z-index:9999;overflow:hidden;display:none;'
            + 'filter:alpha(opacity=' + alpha * 100 + ');opacity:' + alpha + ';';

        //IE6下使用iframe覆盖select，object等标签
        if (isIE6 || (this.option.needIframeInIE && Sui.isIE)) {
            var _iframe = this.document[0].createElement("iframe");
            _iframe.style.cssText = "filter:alpha(opacity=0);width:100%;height:100%;";
            mask.appendChild(_iframe);
        }

        this.document[0].body.appendChild(mask);
        this.mask = $(mask);

    },
    /**
     * 显示遮罩层
     * @method showMask
     * @private
     */
    showMask:function(){
        this.mask.fadeIn("fast", function() {});
    },
    /**
     * 创建窗体
     * @method createDialog
     * @private
     */
    createDialog:function () {

        var that = this ,
            option = this.option;
        this._getDom();
        this.setTitle();

        if (option.url) {
            this._setIframe();
        } else {
            this.setContent(option.body);

        }

        if(this.option.needIframeInIE && Sui.isIE && this.wrap){
            //避免IE下弹出层被第三方插件如视频遮挡
            var iframe = document.createElement('iframe');
            iframe.style.cssText = 'border:none;z-index: -1; position: absolute; filter: alpha(opacity=0);height:100%;width:100%; background: none transparent scroll repeat 0% 0%; top:0px;left:0px;';
            this.wrap.append(iframe);
        }

        this._setButton();
        this._setEventListener();

        //初始化窗口拖拽
        if (this.option.drag && this.drager) {
            this.drager.addClass('move');
            this.drager.bind('mousedown', function(event) {
                that.dragInit(event, $(that.dlg));
                return false;
            });
            maskIframe();
        }
        //初始化窗口尺寸调整
        if (this.option.resize && this.resizer) {
            this.resizer
                .show()
                .bind('mousedown', function(event) {
                    that.resizeInit(event, that);
                });
            maskIframe();
        }

        function maskIframe() {
            //避免鼠标指针落入iframe中导致拖拽停滞
            if (that.content.find('iframe').length > 0 && that.content.find('.imask').length == 0) {
                var imask = that.document[0].createElement('div');
                imask.className = "imask";
                imask.style.cssText = 'display:none;position:absolute;left:0;top:0;width:100%;height:100%;cursor:move;' +
                    'filter:alpha(opacity=0);opacity:0;background:#fff;z-index:3;';
                that.content.css({position:'relative'}).append(imask);
            }
        }

    },
    /**
     * 设置窗口标题内容
     * @method setTitle
     * @param {String} val
     */
    setTitle:function(val) {
        var str = (val == null) ? this.option.title : val;
        this.title && this.title.html(str);
    },
    /**
     * 打开窗体
     * @method openDialog
     *
     */
    openDialog:function () {

        //销毁[数据加载中...]提示信息
        this.tip && this._closeTip();
        //记录弹窗前聚焦的组件
        this._lastFocus = document.activeElement;
        if (this.mask) {
            //BUG: url模式下代码会执行两次，用!this.mask避免
            this.showMask();
        }
        this._showDialog();
        this.opening = true;
    },
    /**
     * 关闭窗体
     * @method closeDialog
     *
     */
    closeDialog:function (callback) {

        //关闭前执行函数
        var funs = this.option.closeBeforeFun;
        for (var i = 0,len = funs.length; i < len; i++) {
            typeof funs[i]['fun'] == 'function' && funs[i]['fun'].apply(this, funs[i]['arg'] || []);
        }

        //IE8或以下清除iframe内存，以保证unload事件成功
        var $frame = this.content.find('iframe');
        if($frame.length){
            $frame[0].src = 'about:blank';
            $frame.remove();
        }

        this.option.mask && this.mask.remove();
        this.dlg.remove();
        if (this.option.hideScroll) {
            $(this.document).find('html').css('overflow', 'auto').scrollTop(this.scrolltop);
        }
        //聚焦到触发窗口的组件
        if ($(this._lastFocus).is(":visible")) {
            this._lastFocus.focus();
        }
        //关闭后执行函数
        var funs = this.option.closeAfterFun;
        for (var i = 0,len = funs.length; i < len; i++) {
            typeof funs[i]['fun'] == 'function' && funs[i]['fun'].apply(this, funs[i]['arg'] || []);
        }


        //释放内存
        Sui.dialog.remove(this.id);
        this.opening = false;
        this._removeEventListener();
        for (var i in this) delete this[i];

    },
    /**
     * 显示数据加载提示
     * @method  _openTip
     * @private
     */
    _openTip:function () {
        var tip = this.document[0].createElement("span");
        tip.className = "sys_tip sys_wait";
        tip.style.cssText = 'position:fixed;_position:absolute;top:0;left:50%;z-index:9999;';
        tip.innerHTML = '数据加载中...';
        this.document[0].body.appendChild(tip);
        tip.style.marginLeft = -tip.offsetWidth / 2 + 'px';
        this.tip = tip;
    },
    /**
     * 关闭数据加载提示
     * @method _closeTip
     * @private
     */
    _closeTip:function() {
        $(this.tip).remove();
        this.tip = null;
    },
    /**
     * 显示窗体
     * @method _showDialog
     * @private
     */
    _showDialog:function() {

        this.dlg.css({visibility:'visible'});
        //聚焦到窗口内
        var area = this.main || this.content;
        area && area.attr('tabindex', -1).focus();
        //打开后执行函数
        var funs = this.option.openAfterFun;
        for (var i = 0,len = funs.length; i < len; i++) {
            typeof funs[i]['fun'] == 'function' && funs[i]['fun'].apply(this, funs[i]['arg'] || []);
        }

    },
    /* 获得组件Dom元素
     * @method _getDom
     * @private
     */
    _getDom:function fGetDom() {
        // IE6:在当前窗口创建的dom元素才能被操作
        var wrap = this.document[0].createElement('div');
        wrap.style.cssText = 'position:absolute;top:0;left:0;margin:0;padding:0;z-index:9999;visibility: hidden;';
        wrap.innerHTML = this.template;
        wrap.className = 'std_popwrap';
        this.document.find('body').append(wrap);

        var tags = wrap.getElementsByTagName('*'),
            i,
            len = tags.length;

        for (i = 0; i < len; i++) {
            var actor = tags[i].getAttribute('actor');
            if (actor) {
                this[actor] = $(tags[i]);
            }
        }

        this.dlg = $(wrap);

        return this.dlg;

    },
    /**
     * 初始化按钮
     * @method  _setButton
     * @private
     */
    _setButton:function() {

        var option = this.option,
            args = option.button
            ;
        if (args.length == 0) {
            this.foot && this.foot.hide();
            return;
        }
        for (var i = 0,len = args.length; i < len; i++) {

            var that = this,
                btn = this.document[0].createElement('input');
            btn.type = 'button';
            btn.value = args[i].value;
            btn.className = 'btn';
            btn.disabled = !!args[i].disabled;

            this.button.push(btn);
            this.foot.append(btn);
        }
    },
    /**
     * 设置内容
     * @method  setContent
     * @private
     */
    setContent:function (arg) {

        var option = this.option;

        if (arg && arg.nodeType == 1) {

            var display = arg.style.display,
                prev = arg.previousSibling,
                next = arg.nextSibling,
                parent = arg.parentNode;

            this.option.closeAfterFun.push({
                fun:function() {
                    if (prev && prev.parentNode) {
                        prev.parentNode.insertBefore(arg, prev.nextSibling);
                    } else if (next && next.parentNode) {
                        next.parentNode.insertBefore(arg, next);
                    } else if (parent) {
                        parent.appendChild(arg);
                    }
                    arg.style.display = display;
                }
            });

            this.content.html('').append(arg);
            $(arg).show();
        } else {
            this.content.html(arg);
        }

        this._size();
        this._locationDom();
    },
    /**
     * 设置ifram窗体
     * @method  _setIframe
     * @private
     */
    _setIframe:function() {

        var that = this,
            option = this.option,
            _h = option.height,
            _w = option.width;

        var iframe = this.document[0].createElement('iframe');
        iframe.style.cssText = 'border:0 none;';
        iframe.setAttribute('frameborder', '0', 0); //IE6

        if (_h && _h !== 'auto') {
            iframe.style.height = _h + 'px';
        }
        if (_w && _w !== 'auto') {
            iframe.style.width = _w + 'px';
        }

        iframe.src = this.option.url;
        iframe.name = that.id;
        this.iframe = $(iframe);
        this.content.css('padding', 0).append(iframe);
        this._openTip();

        this.iframe.load(function() {
            try {
                //设置iframe尺寸，定位,获取窗口宽高，需跨越协议
                try{
                    var doc = this.contentWindow.document.documentElement;
                    if (!_h || _h == 'auto') {
                        this.style.height = doc.scrollHeight + 'px';
                        that.content[0].style.height = doc.scrollHeight + 'px'; //保证内容区与窗口底部无间隙
                    }
                    if (!_w || _w == 'auto') {
                        this.style.width = doc.scrollWidth + 'px';
                    }
                }catch(e){}
                that._size();
                that._locationDom();
                //autoOpen为true则打开窗口
                that.option.autoOpen && that.openDialog();
                var frame = that.iframe[0];
                //获得iframe的jquery对象
                var frameDoc = frame.contentWindow;

                //将SysDialog的句柄交给iframe的body，以便子页面调用
                var jq = frameDoc.$;
                jq && jq('body').data('caller', that);//让iframe内部能获得SysDialog实例句柄，兼容旧版本

                //新版本获得触发窗口的方式
                frameDoc.Sui.dialog.opener = window;
                //新版本通过window.name属性（与iframe.name属性一致）在Sui.dailog.list中找到SysDialog的句柄
            } catch(e) {
                if (typeof console !== undefined) {
                    console.log('dialog.js: ' + e);
                }
            }
        })


    },
    /**
     * 事件监听
     * @method _setEventListener
     * @private
     */
    _setEventListener:function () {
        var that = this;

        $(this.button).each(function() {

            $(this).bind('click', function() {
                var idx = $(this).index();

                if (that.option.button[idx].fun && typeof that.option.button[idx].fun == 'function') {
                    that.option.button[idx].fun.apply(that);
                } else {
                    that.closeDialog();
                }
            })
        });

        this.closer && this.closer.bind('click', function() {
            that.closeDialog();
        })
    },
    /**
     * 删除所有监听器
     * @method _removeEventListener
     * @private
     */
    _removeEventListener:function () {
        var arr = ['button','close'];
        for (var i = 0,len = arr.length; i < len; i++) {
            $(this[arr[i]]).unbind();
        }
    },
    //调整尺寸
    /**
     * 设置窗体的尺寸
     * @method  _size
     * @private
     */
    _size:function fSize(width, height) {
        var option = this.option,
            w = width || option.width,
            h = height || option.height;
        this.main && this.main.css({width:w,height:h});
    },
    /**
     * 动态设置窗体宽高
     * @method   setSize
     * @param {Number} width
     * @param {Number} height
     */
    setSize:function(width, height) {

        if (this.main) {
            this.main.css({width:width,height:height});
            this._locationDom();
        }
    },
    /**
     * 定位窗体
     * @method _locationDom
     * @private
     */
    _locationDom:function fLocationDom() {
        var _win = this.top,
            dom = this.dlg[0],
            dw = dom.offsetWidth,
            dh = dom.offsetHeight,
            x,y;

        if (_win.innerWidth) {
            var ww = _win.innerWidth,
                wh = _win.innerHeight,
                bgX = _win.pageXOffset,
                bgY = _win.pageYOffset;
        } else {
            var dde = _win.document.documentElement,
                ww = dde.offsetWidth,
                wh = dde.offsetHeight,
                bgX = dde.scrollLeft,
                bgY = dde.scrollTop;
            //IE6\7\8
        }
        dom.style.left = (this.option.left == null ? bgX + ((ww - dw) / 2) : this.option.left ) + 'px';
        dom.style.top = ( this.option.top == null ? Math.max(bgY + ((wh - dh) / 2), 0) : this.option.top ) + 'px';
        dom.style.position = 'absolute';
    },
    /**
     * 最小化窗体
     * @method minimize
     *
     */
    minimize:function() {
        this.dlg.hide();
        this.mask.hide();
        this.opening = false;
    },
    /**
     * 显示窗体
     * @method show
     */
    show:function(){
        this.dlg.show();
        this.mask.show();
    },
    /**
     * @method 判断窗体是否开启中
     * @returns {*}
     */
    isOpening:function(){
        return this.opening;
    },
    /**
     * 拖拽功能
     * @method dragInit
     * @param {Event} event
     * @param {DOM} dom
     * @private
     */
    dragInit: function(event, dom) {
        //该方法中的变量需优化
        var dragEvent = new DragEvent({
            document: this.document[0]
        });
        var startLeft,startTop,
            hasiframe = dom.find('iframe').length,
            imask = hasiframe ? dom.find('iframe').next() : null;

        var minX = $(this.document).scrollLeft(),
            minY = $(this.document).scrollTop(),
            maxX = $(this.top).width() - dom.width(),
            maxY = $(this.top).height() - dom.height();

        dragEvent.onstart = function (x, y) {
            startLeft = dom.offset().left;
            startTop = dom.offset().top;

            $(this.document).bind('dblclick', dragEvent.end);
            if (imask) {
                imask.show();
            }
        };
        dragEvent.onover = function (x, y) {
            var left = Math.max(minX, Math.min(maxX, x + startLeft)),
                top = Math.max(y + startTop, minY);
            dom.css({left:left,top:top});
        };
        dragEvent.onend = function (x, y) {
            if (imask) {
                imask.hide();
            }
        };
        dragEvent.start(event);
    },
    /**
     * 拖拽功能
     * @method resizeInit
     * @param {Event} event
     * @param {Sui.dialog.SysDialog} comp
     */
    resizeInit: function resizeInit(event, comp) {
        //该方法中的变量需优化
        var dragEvent = new DragEvent({
            document: this.document[0]
        });
        var dom = $(comp.main);
        var content = dom.children().first();
        var iframe = dom.find('iframe'),
            imask = iframe.length ? dom.find('iframe').next() : null,
            minW = 200,maxW = 1000,minH = 100 ,maxH = 600;
        var orgW,orgH;

        if (content.length) {
            var pw = parseInt(content.css('paddingLeft') + content.css('paddingRight')),
                ph = parseInt(content.css('paddingTop') + content.css('paddingBottom'));
        }

        dragEvent.onstart = function(x, y) {
            orgW = dom.width();
            orgH = dom.height();
            if (imask) {
                imask.show();
            }
        };
        dragEvent.onover = function(x, y) {
            var w = Math.max(minW, Math.min(maxW, orgW + x));
            var h = Math.max(minH, Math.min(maxH, orgH + y));
            dom.width(w);
            dom.height(h);
            if (iframe.length) {
                iframe.width(w);
                iframe.height(h);
            }
            if (content.length) {
                content.width(w - pw);
                content.height(h - ph);
            }
        };
        dragEvent.onend = function(x, y) {
            comp._locationDom();
            if (imask) {
                imask.hide();
            }
        };
        dragEvent.start(event);
    },
    /**
     * 显示、隐藏关闭按钮
     * @method toggleCloser
     * @param {boolean} show
     */
    toggleCloser:function(show) {
        if (!this.closer) {
            return;
        }
        this.closer.toggle(show);
    }
};

function DragEvent(config) {
    //通过配置初始化拖动区域所在的document
    this.document = config.document || Sui.dialog.top.document;
    var that = this,
        proxy = function (name) {
            var fn = that[name];
            that[name] = function () {
                return fn.apply(that, arguments);
            };
        }; //保证start、over、end执行空间为DragEvent

    proxy('start');
    proxy('over');
    proxy('end');
}
DragEvent.prototype = {
    start:function (event) {
        $(this.document)
            .bind('mousemove', this.over)
            .bind('mouseup', this.end);

        this._sClientX = event.clientX;
        this._sClientY = event.clientY;
        this.onstart(event.clientX, event.clientY);
        return false;
    },
    over:function (event) {
        this._mClientX = event.clientX + $(this.document).offsetLeft;
        this._mClientY = event.clientY + $(this.document).scrollTop;
        this.onover(
            event.clientX - this._sClientX,
            event.clientY - this._sClientY
        );
        return false;
    },
    end:function (event) {
        $(this.document)
            .unbind('mousemove', this.over)
            .unbind('mouseup', this.end);
        this.onend(event.clientX, event.clientY);
        return false;
    }
} ;


/**
 *  系统提示窗口（SysDialog的实例），别名SysAlert
 * @class  Sui.dialog.Alert
 * @extends SysDialog
 * @constructor
 * @param {Object} config 配置参数
 * @param {Object} config.option  配置参数
 * @param {String} config.body 提示内容
 * @param {String} config.type 提示类型  inf(缺省) | suc | err | war
 * @param {Function} config.closeAfterFun 系统提示窗口关闭后触发
 * */
Sui.dialog.Alert =
SysAlert =   //兼容旧版本名称,新版本会删除
function SysAlert(option){
    //子类属性
    var type = option.type || "inf",
        _body = '<table> ' +
                '     <tbody><tr>  ' +
                '         <td class="tc td_ico">  ' +
                '             <b class="b_ico b_ico_' + type + ' "></b>  ' +
                '         </td>  ' +
                '         <td class="td_txt"><div>' + option.body + '</div></td>  ' +
                '     </tr>  ' +
                '</tbody></table>';
    return  new SysDialog(
        $.extend(option, {
            type:type,
            title:option.title || '系统提示',
            body:_body,
            button:[
                {
                    value:'确定'
                }
            ],
            closeAfterFun: [
                {   fun:option.closeAfterFun,
                    arg:[]
                }
            ]
        })
    );

} ;

/**
 * 系统信息窗口（SysDialog实例），别名SysPrompt
 * @class Sui.dialog.Prompt
 * @extends SysDialog
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.name  输入字段名称描述
 * @param {String} config.defaultValue 输入字段默认值,缺省为空字符串
 * @param {Function} config.fun 处理输入字段值的函数
 **/
Sui.dialog.Prompt =
SysPrompt =   //兼容旧版本名称,新版本会删除
function SysPrompt(option){
    var _defaultVal = option.defaultValue || '',
        _name = option.name || '输入数值',
        _body = '<table width="width:100%;">' +
            '<tr><td class="tl"><label>'+_name+'：</label></td></tr><tr><td>&nbsp;</td></tr>' +
            '<tr><td><input type="text" value="'+_defaultVal+'" class="ipt_txt w250"/></td></tr>' +
            '</table>';
    var target = new SysDialog(

        $.extend(option, {
            body:_body,
            width:280,
            height:60,
            button:[
                {
                    value:'确定',
                    fun:function() {
                        if (typeof option.fun == 'function') {
                            option.fun(target.content.find('input[type="text"]').val());
                        }
                        target.closeDialog();
                    }
                }
            ]
        })
    );
} ;

/**
 * 系统弹出自动消失框（SysDialog实例）,别名MsgDialog
 * @class Sui.dialog.Msg
 * @extentds SysDialog
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} body 提示内容
 * @param {Number} sec 窗口停留时间
 * @param {Boolean} autoClose 是否自动关闭，缺省为true
 * @param {Number} width 窗口宽度
 * */
Sui.dialog.Msg =
MsgDialog =   //兼容旧版本名称,新版本会删除
function MsgDialog(option) {
    var sec = option.sec || 2,
        autoClose = option.autoClose == null ? true : option.autoClose,
        template = '<div actor="wrap"></div><div class="msg' + (autoClose ? '' : ' msg_loading') + '" actor="content"></div></div>';

    return  new SysDialog(
        $.extend(option, {
            sec:sec,
            autoClose:autoClose,
            title:option.title || '系统提示',
            template:template,
            body:option.body || '自动消失的提示信息',
            needIframeInIE:option.needIframeInIE || true,
            openAfterFun:[
                {
                    fun:function() {
                        if (autoClose) {
                            var that = this;
                            setTimeout(function() {
                                that.closeDialog()
                            }, sec * 1000);
                        }
                    }
                }
            ] ,
            closeAfterFun: [
                {   fun:option.closeAfterFun,
                    arg:[]
                }
            ]
        })
    )
} ;
/**
 * 系统弹出自动消失的消息条（SysDialog实例），别名MsgTip
 * @class Sui.dialog.Tip
 * @extends SysDialog
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.body 提示内容
 * @param {Number} config.sec 窗口停留时间
 * @param {Boolean} config.autoClose 是否自动关闭，缺省为true
 * @param {String} config.type 提示类型 等待wait(缺省),err(错误),war(警告),suc(成功)
 * */
Sui.dialog.Tip =
MsgTip =   //兼容旧版本名称,新版本会删除
function MsgTip(option) {

    var autoClose = option.autoClose == null ? true : option.autoClose,
        sec = option.sec || 2,
        type = option.type || 'wait';

    var msgDialog = new SysDialog(
        $.extend(option, {
            sec: sec,
            autoClose : autoClose,
            type : option.type || 'wait',
            template :  '<div actor="wrap"><span class="sys_tip sys_' + type + '" actor="content">信息本体</span></div>',
            body: option.body || '操作提示信息',
            mask:false,
            top:option.top || 93,
            openAfterFun: [
                {
                    fun:function() {
                        if (autoClose) {
                            setTimeout(function() {
                                msgDialog.closeDialog()
                            }, sec * 1000);
                        }
                    }
                }
            ]
        })
    );
	
	return msgDialog;
} ;



