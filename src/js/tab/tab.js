//Sui.namespace('Sui.Tab');
/**
 * 选项卡组件
 * @class Sui.Tab
 * @extends Sui.Container
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.applyTo  渲染到的组件id
 * @param {String} config.menuClass 菜单项的classNmae 通过该参数找到tab菜单
 * @param {String} config.contentClass tab内容的className，通过该参数找到tab内容
 * @param {String} config.trigger 触发更换tab的方式，可以是click或hover
 * @param {Boolean} config.needOperator 是否需要tab控制面板
 * @param {Number} config.currentIndex 当前选项的索引
 * @param {Object} config.listeners 事件监听函数，可参考例子
 * @example
 * new Sui.Tab({
 *    applyTo:'switch' ,
 *    menuClass:'menu_item',
 *    contentClass:'content_item',
 *    trigger:'click',
 *    needOperator:true,
 *    currentIndex:2,
 *    listeners:{
 *        changeTab:function(e) {
 *            alert(e.index);
 *        }
 *    }
 *})
 */
Sui.Tab = Sui.extend(Sui.Container, {
    defaultClass:'tab',
    /**
     * 菜单项的classNmae 通过该参数找到tab菜单
     * @property menuClass
     * @type String
     * @default  'menu_item'
     */
    menuClass:'menu_item',
    onMenuClass:'on',
    /**
     * tab内容的className，通过该参数找到tab内容
     * @property contentClass
     * @type  String
     * @default  'content_item'
     */
    contentClass:'content_item',
    /**
     * 触发方式,可以选择click、hover
     * @property trigger
     * @type String
     * @default 'click'
     */
    trigger:'click',
    /**
     * 是否需要tab控制面板
     * @property needOperator
     * @type  Boolean
     * @default  true
     */
    needOperator:true,
    /**
     * 当前选项的索引
     * @property currentIndex
     * @type Number
     * @default 0
     */
    currentIndex:0,

    menuItems:[],
    contentItems:[],
    operator:null,
    /**
     * 根据配置参数初始化
     * @method initConfig
     * @param {Object} config
     * @private
     */
    initConfig: function (config) {
        Sui.Tab.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ['menuClass','contentClass','onMenuClass','trigger','autoPlay',
            'autoPlayDuration','effect','needOperator','currentIndex']);
    },
    /**
     * 渲染组件
     * @method  render
     * @param {DOM} container
     * @param {DOM} insertBefore
     * @private
     */
    render: function (container, insertBefore) {
        Sui.Tab.superclass.render.apply(this, arguments);

        this.menuItems = this.getApplyToElement().find('.' + this.menuClass);
        this.contentItems = this.getApplyToElement().find('.' + this.contentClass);
        if (this.needOperator) {
            this.createOperator();
        }
    },
    /**
     * 渲染后执行
     * @method afterRender
     * @private
     */
    afterRender:function() {
        Sui.Tab.superclass.afterRender.apply(this, arguments);
        this.initCurrentIndex();
    },
    /**
     * 初始化事件
     * @method initEvent
     * @private
     */
    initEvent:function() {

        Sui.Tab.superclass.initEvent.apply(this, arguments);
        this.menuItems.on(this.trigger, Sui.makeFunction(this, this.onTriggerMenu));
        this.menuItems.find('.close').click(Sui.makeFunction(this,this.onCloseClick));
    } ,
    /**
     * 点击关闭图标后执行
     * @method  onCloseClick
     * @param {Event} e
     * @private
     */
    onCloseClick:function(e){
        var mIdx = this.calMenuItemIndex(e.target.parentNode);
        this.removeTabItem(mIdx);
    },
    /**
     *  创建tab控制面板
     * @method createOperator
     * @private
     */
    createOperator:function() {
        var itemConfigs = [];
        var self = this;

        this.menuItems.each(function(index) {

            itemConfigs.push({
                html: $(this).text(),
                icon: index == self.currentIndex ? '../../images/tab/bullet.png' : null,
                action: (function(idx) {
                    return function(obj) {
                        self.setCurrentIndex(idx);
                        self.operator.setItemsIcon([idx],'../../images/tab/bullet.png');
                        self.operator.hide();
                    }
                })(index)
            });
        });

        if( this.isRemovable() ){
            itemConfigs.push('-');
            itemConfigs.push({
                html:'关闭全部',
                action:function(obj) {
                    self.removeAllTabItemss();
                }
            });
        }

        this.operator = new Sui.menu.Menu({
            html:'',
            defaultClass:'operator',
            layerClass:'tab_operator_layer',
            renderTo: this.menuItems.parent().parent(),
            itemConfigs:itemConfigs
        });

    } ,
    /**
     * 判断是否有可以移除的tab
     * @method  isRemovable
     * @return {Number}
     * @private
     */
    isRemovable:function(){
        return this.menuItems.find('.close').length > 0;
    },
    /**
     * 获取当前tab的索引值
     * @method getCurrentIndex
     * @return {Number}
     * @private
     */
    getCurrentIndex:function() {
        return this.currentIndex;
    },
    /**
     * 初始化当前tab的状态
     * @method  initCurrentIndex
     * @private
     */
    initCurrentIndex:function() {

        var currIndex = this.currentIndex,
            onMeuClass = this.onMenuClass ;

        this.menuItems.each(function(index) {
            $(this).toggleClass( onMeuClass , index == currIndex);
        });

        this.contentItems.each(function (index) {
            if (index == currIndex) {
                $(this).css({ display:'',zIndex:99});
            } else {
                $(this).css({display:'none',zIndex:0});
            }
        });

    },
    /**
     *  更新所有tab菜单项
     * @method  refreshItems
     * @private
     */
    refreshItems:function(){

        this.menuItems = this.getApplyToElement().find('.' + this.menuClass);
        this.contentItems = this.getApplyToElement().find('.' + this.contentClass);
        this.menuItems.on(this.trigger, Sui.makeFunction(this, this.onTriggerMenu));

        this.initCurrentIndex();

        if (this.needOperator) {
            this.operator.getApplyToElement().remove();
            this.operator.layer.getApplyToElement().remove();
            this.operator = null;
            this.createOperator();
        }
    },
    /**
     * 将某个索引值对应tab设置为当前tab
     * @method setCurrentIndex
     * @param {Number} val
     * @private
     */
    setCurrentIndex:function(val) {

        var curIdx = this.currentIndex;
        if (Sui.isUndefinedOrNull(val) || val == curIdx) {
            return;
        }
        var len = this.getTabCount();
        val = (val + len) % len;

        //取消旧的currentMenuItem状态
        this.getMenuItemByIndex(curIdx).removeClass(this.onMenuClass);
        this.getContentItemByIndex(curIdx).hide().css('z-index',0);

        //设置新的currentMenuItem状态
        this.getMenuItemByIndex(val).addClass(this.onMenuClass);
        this.getContentItemByIndex(val).show().css('z-index',99);
        this.currentIndex = val;
        //派发changeTab事件，可被listener监听
        this.fireEvent('changeTab', {
            index:val,
            contentItem: this.getContentItemByIndex(val)
        })
    },
    /**
     * 当tab菜单项点击时执行
     * @method  onTriggerMenu
     * @param {Event} e
     * @private
     */
    onTriggerMenu:function(e) {

        var index = this.calMenuItemIndex(e.currentTarget);
        this.setCurrentIndex(index);

    },
    /**
     *  计算某个tab菜单的索引值
     * @method  calMenuItemIndex
     * @param {DOM} dom
     * @private
     */
    calMenuItemIndex:function(dom) {
        return this.menuItems.index(dom);
    },
    /**
     * 根据索引值查找tab菜单项
     * @method getMenuItemByIndex
     * @return {Number}
     * @private
     */
    getMenuItemByIndex:function(val){
        return $(this.menuItems.get(val));
    },
    /**
     * 根据索引值查找tab内容
     * @method  getContentItemByIndex
     * @return {Number}
     * @private
     */
    getContentItemByIndex:function(val){
        return $(this.contentItems.get(val));
    },
    /**
     * 添加一个选项卡
     * @method addTabItem
     * @param {Object} config 配置参数
     * @param {String} config.menuText 选项柄文字内容
     * @param {Number} config.index 插入tab位置，不指定则插入到末位,指定值小于0则插入到首位
     * @param {String} config.url 选项卡的内容来源
     * @param {Mixed} config.content 选项卡的内容，有可能是DOM，字符串,也可能是url地址
     * @param {Boolean} config.needIframe 是否用iframe将内容包裹住，此时url不为空
     */
    addTabItem:function(config){
        var self = this;
        //渲染tab菜单元素
        var menuItem = $('<' + this.menuItems.get(0).tagName + '>').addClass(this.menuClass);
        $('<span></span>').text(config.menuText).appendTo(menuItem);
        $('<a class="close"></a>').appendTo(menuItem).click(function(e){
            self.removeTabItem(self.calMenuItemIndex(e.currentTarget.parentNode));
        });

        //渲染tab内容
        var contentItem = $('<' + this.contentItems.get(0).tagName + '>').addClass(this.contentClass);
        this.setContentItemDom(contentItem, config);

        //添加DOM元素
        var count = this.menuItems.length;
        if( Sui.isUndefinedOrNull(config.index) || config.index > count ){

            menuItem.insertAfter( this.getMenuItemByIndex(count-1) );
            contentItem.insertAfter( this.getContentItemByIndex(count-1) );
            this.currentIndex = count ;

        }else{
            var index = Math.max(0, config.index);
            menuItem.insertBefore( this.getMenuItemByIndex(index) );
            contentItem.insertBefore( this.getContentItemByIndex(index) );
            this.currentIndex = 0;
        }

        //重新定义menuItem和contentItem
        this.refreshItems();

    },
    /**
     * 设置tab内容
     * @param {DOM} contentItem
     * @param {Object} config 配置参数可参考方法addTabItem
     * @method setContentItemDom
     *
     */
    setContentItemDom:function(contentItem,config){

        contentItem.html('');
         //如果配置参数中存在url，则
         if( Sui.isString(config.url) ){

            if (config.needIframe) {
                var iframe = $('<iframe src="' + config.url + '" frameborder="0" width="100%" height="100%"></iframe>');
                contentItem.append(iframe);
            } else {
                $.ajax({
                    url: config.url,
                    method: 'GET',
                    success: function (data) {
                        contentItem.html(data);
                    },
                    error: function (request, status, err) {
                        Sui.error("加载数据失败");
                    }
                });
            }
        }else if( (config.content.nodeType && config.content.nodeType == 1) || config.content instanceof jQuery){
            //判断是否为html元素，或jquery元素
            contentItem.append(config.content);

        }else{
            contentItem.html(config.content);
        }
    },
    /**
     *  删除某个索引对应的tab
     * @method removeTabItem
     * @param {Number} index
     *
     */
    removeTabItem:function(index){

        var menuItem = this.getMenuItemByIndex(index);
        //如果该tab不能被删除，则不删除
        if(!menuItem.find('.close').length){
            return;
        }

        menuItem.remove();
        this.getContentItemByIndex(index).remove();

        if(this.currentIndex == index){
            this.currentIndex = Math.max(0, this.currentIndex - 1);
        }
        this.refreshItems();
    },
    /**
     * 移除所有可删除的tab
     * @method  removeAllTabItemss
     *
     */
    removeAllTabItemss:function(){

        var len = this.getTabCount(),
            last = len-1;
        for (var i = 0; i < len; i++) {
            if ($(this.menuItems[i]).find('.close').length) {
                this.getMenuItemByIndex(i).remove();
                this.getContentItemByIndex(i).remove();
                last--;
            }
        }

        this.currentIndex = Math.min(last, this.currentIndex);
        this.refreshItems();
    },
    /**
     * 改变某个索引对应tab菜单的文字内容
     * @method  setMenuText
     * @param {Number} index
     * @param {String} val
     *
     */
    setMenuText:function(index,val){
        this.getMenuItemByIndex(index).find('span').text(val);
    },
    /**
     * 获得tab数量
     * @method  getTabCount
     *
     */
    getTabCount:function(){
        return this.menuItems.length;
    }

})
