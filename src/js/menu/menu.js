Sui.namespace("Sui.menu");
/**
 * 水平布局组件类
 * @class Sui.HLayout
 * @extends Sui.Layout
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.defaultClass 默认样式
 * @param {String} config.itemClass 每一项的样式
 */
Sui.HLayout = Sui.extend(Sui.Layout, {
    /**
     * 默认组件样式
     * @property  defaultClass
     * @type String
     * @default  'sui_hlayout'
     */
    defaultClass : 'sui_hlayout',
    /**
     * 每一项的样式
     * @property  itemClass
     * @type String
     * @default  'hlayout_item'
     */
    itemClass : 'hlayout_item',
     /**
     * 渲染多个子组件
     * @method renderChildrenComponent
     * @param {}
     * @private
     */
    renderChildrenComponent : function(container) {
        this.ulElement = $("<ul></ul>").addClass(this.defaultClass).appendTo(this.childRenderToElement);
        Sui.HLayout.superclass.renderChildrenComponent.apply(this, arguments);
    },
     /**
     * 渲染单个子组件
     * @method  renderChildComponent
     * @param {Mixed} component
     * @param {Number} config 渲染成为第几个子组件
     * @private
     */
    renderChildComponent : function(component, config) {

        var childParent = $("<li></li>").addClass(this.itemClass).appendTo(this.ulElement);

        if (config == this.getComponentCount() - 1) {
            component.renderTo(childParent);
        } else {
            component.renderTo(childParent, this.getComponent(config + 1).getBeforeElement());
        }

    },
     /**
     * 移除某个索引值的子组件
     * @method  removeComponent
     * @param {Number} component 组件索引
     * @private
     */
    removeComponent : function(component) {
        var index = this.indexOfComponent(component);
        Sui.getChildElement(this.ulElement, "li", index).remove();
        Sui.HLayout.superclass.removeComponent.apply(this, arguments);
    }

});
/**
 * 垂直布局组件类
 * @class Sui.VLayout
 * @extends Sui.HLayout
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.defaultClass 默认样式
 * @param {String} config.itemClass 每一项的样式
 */
Sui.VLayout = Sui.extend(Sui.HLayout, {
    /**
     * 默认组件样式
     * @property  defaultClass
     * @type String
     * @default  'sui_vlayout'
     */
    defaultClass : 'sui_vlayout',
    /**
     * 每一项的样式
     * @property  itemClass
     * @type String
     * @default  'vlayout_item'
     */
    itemClass : 'vlayout_item'
});

/**
 * 菜单工具条
 * @class Sui.menu.MenuBar
 * @extends  Sui.Container
 * @constructor
 * @param {(Object} config 配置参数,可参考Sui.Container
 * @param {String}  applyTo 渲染到的组件id
 */
Sui.menu.MenuBar = Sui.extend(Sui.Container, {
    /**
     * 初始化属性
     * @method initProperties
     * @private
     */
    initProperties : function() {
        Sui.menu.MenuBar.superclass.initProperties.apply(this, arguments);
        this.layout = new Sui.HLayout();
    }

});
/**
 * @class  Sui.menu.ContextMenu
 * @extends  Sui.Container
 * @constructor
 * @param {Object} config 配置参数
 * @param {Array} config.itemConfigs 菜单项配置
 * @param {Boolean} config.hideOnClick   是否点击菜单项时菜单隐藏
 * @param {Boolean} config.needIframeInIE  在IE浏览器是否需要使用iframe方法将layer的z轴层级提高，高于视频控件 ，该参数只对IE有效
 * @example
 * <pre><code>
 *   new Sui.menu.ContextMenu({
 *    itemConfigs:[
 *      { html:'选项一',icon:'images/edit.png',action:function(obj){...} },
 *      { html:'选项二',icon:'images/edit.png',action:function(obj){...} },
 *      { html:'选项三',icon:'images/edit.png',action:function(obj){...} }
 *    ]
 *   })
 * </code></pre>
 */
Sui.menu.ContextMenu = Sui.extend(Sui.Container, {
    /**
     * 点击菜单项时菜单隐藏
     * @property hideOnClick
     * @type {Boolean}
     * @default true
     */
    hideOnClick:true,

    defaultClass : 'sui_contextmenu',

        /**
     * 在IE浏览器是否需要使用iframe方法将layer的z轴层级提高，高于视频控件 ，该参数只对IE有效
     * @property needIframeInIE
     * @type {Boolean}
     * @default false
     */
    needIframeInIE:false,

    layer:null,

    /**
     * 根据配置参数初始化
     * @method initConfig
     * @param {Object} config
     * @private
     */
    initConfig : function(config) {
        Sui.menu.ContextMenu.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ["hideOnClick","needIframeInIE"]);

        this.createLayout();
        this.createDefaultLayer();

        if (config.itemConfigs) {
            Sui.each(config.itemConfigs, Sui.makeFunction(this, this.addItemConfig));
        }
    },
    render:function(){
        Sui.menu.ContextMenu.superclass.render.apply(this, arguments);
    },
    /**
      * 创建默认的Layer
     * @method  createDefaultLayer
     * @return {DOM}
     */
    createDefaultLayer : function() {
        this.layer = new Sui.Layer({
            needIframeInIE:this.needIframeInIE,
            defaultClass : this.defaultClass,
            alignToMouse : true
        });
        this.layer.layout = this.layout;
        return this.layer;
    },
    /**
     *
     */
    createLayout : function() {
        this.layout = new Sui.VLayout();
    },
    /**
     * 根据配置项添加菜单项
     * @method  addItemConfig
     * @param {Object} itemConfig
     * @private
     */
    addItemConfig : function(itemConfig) {

        var item = null;
        if ("-" === itemConfig) {
            item = new Sui.menu.Seperator();
        } else {
            item = new Sui.menu.MenuItem(itemConfig);
        }

        this.addItem(item);
        item.on('click', Sui.makeFunction(this, this.onItemClick));
    },
    /**
     * 当菜单项被点击时执行
     * @method onItemClick
     * @private
     */
    onItemClick:function(){
        if(this.hideOnClick ){
            this.hide();
        }
    },
     /**
     * 添加菜单项
     * @method addItem
     * @param {Mixed} item
     * @private
     */
    addItem : function(item) {
        this.layout.addComponent(item);

        if (Sui.isFunction(item.setParentMenu)) {
            item.setParentMenu.call(item, this);
        }
    },
     /**
     *  显示所有菜单项
     * @method  showAllItems
     * @private
     */
    showAllItems : function() {
        for (var i = 0; i < this.layout.getComponentCount(); i++) {
            this.layout.getComponent(i).show()
        }
    },
    /**
     * 判断是否存在子菜单可见
     * @method existVisibleItem
     * @return {Boolean}
     */
    existVisibleItem : function() {
        for (var i = 0; i < this.layout.getComponentCount(); i++) {
            if (this.layout.getComponent(i).isVisible()) {
                return true;
            }
        }
        return false;
    },
    /**
     * 隐藏所有菜单项
     * @method  hideAllItems
     * @private
     */
    hideAllItems : function() {
        for (var i = 0; i < this.layout.getComponentCount(); i++) {
            this.layout.getComponent(i).hide();
        }
    },
    /**
     * 通过菜单项的itemId找到菜单项
     * @method findItemByItemId
     * @param {String} itemId
     * @private
     */
    findItemByItemId : function(itemId) {
        for (var i = 0; i < this.layout.getComponentCount(); i++) {
            var comp = this.layout.getComponent(i);
            if (comp.itemId == itemId) {
                return comp;
            }
        }
        return null;
    },
    /**
     * 显示指定的菜单项
     * @method showItems
     * @param {Array} itemIds
     * @private
     */
    showItems : function(itemIds) {

        var thisMenu = this;
        Sui.each(itemIds, function(itemId) {
            var comp = thisMenu.findItemByItemId(itemId);
            if (comp) {
                comp.show()
            }
        });
    },
    /**
     *  隐藏指定的菜单项
     * @method  hideItems
     * @param {Array} itemIds
     * @private
     */
    hideItems : function(itemIds) {

        var thisMenu = this;
        Sui.each(itemIds, function(itemId) {
            var comp = thisMenu.findItemByItemId(itemId);
            if (comp) {
                comp.hide();
            }
        });
    },
    /**
     * 对齐组件并显示
     * @method  alignToAndShow
     * @param  {Event} e
     */
    alignToAndShow : function(e) {
        this.layer.alignToAndShow(e);
    }

});
/**
 * 菜单组件
 * @class Sui.menu.Menu
 * @extends Sui.TagComponent
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.renderTo 渲染到组件的id
 * @param {String} config.html 菜单的描述值
 * @param {Array} config.itemConfigs 菜单项配置参数
 * @param {String} config.layerClass 菜单主体的外部样式
 * @param {Boolean} config.hideOnClick 点击每个可执行菜单项后是否关闭整个菜单
 * @example
 * <pre><code>
 *  new Sui.menu.Menu({
 *     html:'菜单A',
 *    itemConfigs:[
 *      { html:'选项一',
 *        icon:'images/edit.png',
 *        Listeners:{
 *            click:functon(e){...}
 *        }
 *      },...
 *    ]
 *  })
 * </code></pre>
 */
Sui.menu.Menu = Sui.extend(Sui.TagComponent, {

    applyToTagName : 'div',
    overClass : 'sui_menu_over',
    layer : null,

    childrenMenus:null,//子菜单
    childrenItems:null,//菜单项
    /**
     * 菜单主体的样式
     * @property  layerClass
     * @type String
     * @default null
     */
    layerClass : null,
    /**
     * 点击可执行菜单项后关闭整个菜单
     * @property hideOnClick
     * @type Boolean
     * @default true
     */
    hideOnClick:true,
    applyToElement:null,
    /**
     * 根据配置参数初始化
     * @method  initProperties
     * @private
     */
    initProperties : function() {
        Sui.menu.Menu.superclass.initProperties.apply(this, arguments);
        this.childrenMenus = [];
        this.childrenItems = [];
    },
    /**
     * 根据配置参数初始化
     * @method initConfig
     * @param {Object} config
     * @private
     */
    initConfig : function(config) {
        Sui.menu.Menu.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ['layerClass','hideOnClick']);

        this.layer = new Sui.Layer({
            defaultClass :  'sui_menu_layer',
            //取消layer点击document就会自动关闭的配置，改为在menu组件内初始化
            listenDocumentClick:false
        });

        if (config.itemConfigs) {
            Sui.each(config.itemConfigs, Sui.makeFunction(this, this.addItemConfig));
        }
    },
    /**
     * 渲染组件
     * @method  render
     * @param {DOM} container
     * @param {DOM} insertBefore
     * @private
     */
    render : function(container, insertBefore) {
        Sui.menu.Menu.superclass.render.apply(this, arguments);

        this.layer.renderTo(Sui.getBody());
        //为layer添加一个自定义样式
        this.layer.getApplyToElement().addClass(Sui.StringUtil.nullToEmpty(this.layerClass));
    },
    /**
     * 根据配置添加子组件
     * @method addItemConfig
     * @param {String} itemConfig
     * @private
     */
    addItemConfig : function(itemConfig) {

        var item = null;
        if ("-" === itemConfig) {
            item = new Sui.menu.Seperator();
        }else if( Sui.isArray(itemConfig.itemConfigs) && itemConfig.itemConfigs.length > 0 ){

            itemConfig.html = '<b class="icon"></b><span>'+ itemConfig.html + '</span>';
            item = new Sui.menu.Menu($.extend({ customClass: "sui_menuitem sui_submenuitem",hideOnClick:this.hideOnClick}, itemConfig));
            this.childrenMenus.push(item);

        } else {
            item = new Sui.menu.MenuItem($.extend({listeners:{
                mouseover: Sui.makeFunction(this, this.onItemMouseOver)
            }},itemConfig));

            this.childrenItems.push(item);
            //点击菜单项是否自动隐藏整个菜单系统
            if (this.hideOnClick) {
                item.on('click', Sui.makeFunction(this, this.hideToTop));
            }

        }

        this.addItem(item);

    },
    /**
     * 添加子组件
     * @method  addItem
     * @param {Mixed} item
     */
    addItem : function(item) {
        this.layer.addComponent(item);
        item.setParentMenu(this);

    },
    /**
     * 设置父菜单
     * @method setParentMenu
     * @param {Sui.menu.Menu} parentNode
     */
    setParentMenu : function(parentNode) {
        this.parentMenu = parentNode;
    },
    /**
     * 初始化事件监听
     * @method  initEvent
     * @private
     */
    initEvent : function() {
        Sui.menu.Menu.superclass.initEvent.apply(this, arguments);

        //根节点菜单通过click触发，非根节点菜单通过mouseover触发
        if(this.parentMenu){
            this.getApplyToElement().mouseover(this, Sui.makeFunction(this, this.onMenuClick));
        }else{
            this.getApplyToElement().click(this, Sui.makeFunction(this, this.onMenuClick));
        }
        //当鼠标点击区域为非菜单区域，则隐藏菜单
        $(document).mousedown(Sui.makeFunction(this, this.onDocMousedown));
    },
    /**
     * 当document被点击时触发，判断菜单是否应该隐藏
     * @method  onDocMousedown
     * @param {Event} e
     * @private
     */
    onDocMousedown: function (e) {
        if (!$(e.target).parents('.' + this.layer.defaultClass).length ) {
            this.layer.hide();
        }
    },
    /**
     * 鼠标经过菜单项时执行
     * @method   onItemMouseOver
     * @param {Sui.util.Event}  e
     * @private
     */
    onItemMouseOver: function (e) {
        var item = e.target;
        var sibling = item.parentMenu.childrenMenus;

        for (var i = 0; i < sibling.length; i++) {
            sibling[i].hide();
        }
    },
    /**
     * 菜单被点击时执行
     * @method onClick
     * @private
     */
    onMenuClick : function(e) {

        if(this.parentMenu){

            var sibling = this.parentMenu.childrenMenus;
            for (var i = 0, len = sibling.length; i < len; i++) {
                if( sibling[i] !== this ){
                    sibling[i].hide();
                }
            }
        }

        this.layer.show();
        this.locateLayer();
    },
    /**
     * 隐藏组件
     * @method hide
     */
    hide:function() {
        this.layer.hide();
        //隐藏子菜单
        Sui.each(this.childrenMenus, function(child) {
            child.hide();
        });
    },
    /**
     * 自底向上隐藏菜单
     * @method hideToTop
     * @private
     */
    hideToTop:function(){
        this.layer.hide();
        this.parentMenu && this.parentMenu.hideToTop();
    },
    /**
     * 定位layer
     * @method locateLayer
     */
    locateLayer:function() {

        var h = this.parentMenu ? 0 : Sui.getDomHeight(this.getApplyToElement()),  //如果不是根节点则不需要横轴位移
            w = this.parentMenu ? Sui.getDomWidth(this.getApplyToElement()) : 0, //如果是根节点则不需要横轴位移
            top = this.getApplyToElement().offset().top,
            left = this.getApplyToElement().offset().left;

        this.layer.locate(top + h, left + w);
    },
    /**
     * 对索引值在数组arr中的菜单项设置图标，其余菜单项图标置空
     * @method setItemsIcon
     * @param {Array} arr
     * @param {String} iconUrl
     */
    setItemsIcon:function(arr, iconUrl) {

        for (var i = 0,len = this.childrenItems.length; i < len; i++) {
            if ( $.inArray(i, arr) > -1 ) {
                this.childrenItems[i].setIcon(iconUrl);
            } else {
                this.childrenItems[i].setIcon();
            }
        }
    },
    getItemIndex:function(item){
        for (var i = 0,len = this.childrenItems.length; i < len; i++) {
            if (this.childrenItems[i] === item) {
                return i;
            }
        }
        return -1;
    }

});

/**
 * 菜单项分隔符组件
 * @class Sui.menu.Seperator
 * @extends Sui.TagComponent
 */
Sui.menu.Seperator = Sui.extend(Sui.TagComponent, {
    //该组件将生成在哪种标签元素内
    applyToTagName : 'hr' ,
    /**
     * 设置父菜单
     * @method setParentMenu
     * @param parentNode
     */
    setParentMenu : function(parentNode) {
        this.parentMenu = parentNode;
    }
});
/**
 * 菜单项组件
 * @class Sui.menu.MenuItem
 * @extends Sui.Component
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.html 组件描述值
 * @param {Function} config.action 点击该组件时执行的函数
 * @param {String} config.icon 该菜单项的图标路径
 * @param {String} config.iconBaseUrl  图标图片的通用文件路径，可助于缩短config.icon
 */
Sui.menu.MenuItem = Sui.extend(Sui.Component, {
    //相关样式
    applyToTagName : 'div',
    overClass : 'sui_menuitem_over',
    defaultClass : 'sui_menuitem',
    /**
     * 组件描述值
     * @property  html
     * @type String
     * @default  ""
     */
    html : "",
    /**
     * 点击该组件时执行的函数
     * @property  action
     * @type String
     * @default  ""
     * @example
     * <pre><code>
     *   action:function(obj){
     *      console.log(obj);
     *   }
     * </pre><code>
     */
    action : "",
    /**
     * 该菜单项的图标路径
     * @property  icon
     * @type String
     * @default ""
     */
    icon : "",
    /**
     * 该菜单项的图标样式
     * @property  iconCss
     * @type String
     * @default ""
     */
    iconCss : "",

    /**
     * 图标图片的通用文件路径，可助于缩短config.icon
     * @property iconBaseUrl
     * @type String
     * @default ''
     */
    iconBaseUrl:'',
    child:"",

    itemId : null,

    parentMenu : null,

    itemConfigs:null,
    /**
     * 根据配置参数初始化
     * @method  initConfig
     * @param {Object} config
     * @private
     */
    initConfig : function(config) {
        Sui.menu.MenuItem.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ['itemId', "action", "icon","iconBaseUrl","iconCss", "html"]);

    },
    /**
     * 初始化事件监听
     * @method initEvent
     */
    initEvent : function() {
        Sui.menu.MenuItem.superclass.initEvent.apply(this, arguments);
        this.getApplyToElement().click(this, Sui.makeFunction(this, this.onClick))
                                .mouseover(this,Sui.makeFunction(this,this.onMouseOver));
    },
    /**
     * 当鼠标移动到组件上时执行
     * @method onMouseOver
     * @private
     */
    onMouseOver:function() {
        Sui.menu.MenuItem.superclass.onMouseOver.apply(this,arguments);
        this.fireEvent('mouseover',new Sui.util.Event({
            target:this,
            text: this.getApplyToElement().text()
        }))
    },
    /**
     * 组件被点击时执行,派发click事件，执行action声明的函数
     * @method  onClick
     * @private
     */
    onClick : function() {

        //this.parentMenu.hide();

        this.fireEvent("click", new Sui.util.Event({
            target : this,
            text : this.getApplyToElement().text()
        }));

        if (this.action) {
            this.action.apply(this, arguments);
        }

    },
    /**
     * 渲染组件
     * @method  render
     * @param {DOM} container
     * @param {DOM} insertBefore
     * @private
     */
    render : function(container, insertBefore) {
        Sui.menu.MenuItem.superclass.render.apply(this, arguments);

        this.iconElement = $("<b class='icon'></b>").appendTo(this.getApplyToElement());
        this.textElement = $("<span class='text'></span>").appendTo(this.getApplyToElement());
    },
    /**
     * 渲染后执行
     * @method  afterRender
     * @private
     */
    afterRender : function() {
        Sui.menu.MenuItem.superclass.afterRender.apply(this, arguments);
        this.applyHtml();
        this.applyIcon();
        this.applyIconCss();
    },
    /**
     * 设置组件的描述值
     * @method  applyHtml
     * @private
     */
    applyHtml : function() {
        if (this.isRendered()) {
            this.textElement.html(this.html);
        }
    },
    /**
     * 初始化菜单项图标
     * @method applyIcon
     * @private
     */
    applyIcon : function() {
        if (this.isRendered()) {
            if (this.icon) {
                this.iconElement.css("background-image", "url(" + this.iconBaseUrl + this.icon + ")");
            }
        }
    },
    /**
     * 初始化菜单项图标样式
     * @method applyIconCss
     * @private
     */
    applyIconCss : function() {
        if (this.isRendered()) {
            if (this.iconCss) {
                this.iconElement.addClass(this.iconCss);
            }
        }
    },
    /**
     * 切换菜单项图标
     * @method  toggleIcon
     * @param {String} ico1
     * @param {String} ico2
     */
    toggleIcon:function(ico1,ico2){
        this.icon = this.icon == ico1? ico2:ico1;
        this.iconElement.css('background-image','url('+ this.iconBaseUrl + this.icon +')');
    },
    /**
     * 切换菜单项图标样式
     * @method  toggleIconCss
     * @param {String} icoCss1
     * @param {String} icoCss2
     */
    toggleIconCss : function(icoCss1, icoCss2){
    	var oldCss = this.iconCss;
    	this.iconCss = this.iconCss == icoCss1? icoCss2:icoCss1;

        this.iconElement.addClass(this.iconCss).removeClass(oldCss);
    },

    /**
     * 设置父菜单
     * @method  setParentMenu
     * @param {Sui.menu.Menu} parentNode
     * @private
     */
    setParentMenu : function(parentNode) {
        this.parentMenu = parentNode;
    },
    /**
     * 设置菜单项图标
     * @method setIcon
     * @param  {String} str
     */
    setIcon:function(str) {

        if (Sui.isString(str)) {
            this.icon = str;
            this.iconElement.css('background-image', 'url(' + this.iconBaseUrl + this.icon + ')');
        } else {
            this.iconElement.css('background', 'none');
        }

    }

});
