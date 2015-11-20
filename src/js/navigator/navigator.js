Sui.namespace('Sui.nav');

/**
 * 总导航菜单组件
 * @class Sui.nav.Navigator
 * @extends Sui.Container
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.applyTo 渲染到的组件id
 * @param {String} config.defaultClass 组件默认样式
 * @param {String} config.menuItemClass 菜单项样式
 * @param {String} config.subRenderTo 放置子菜单的DOM元素id
 * @param {Array} config.menuItems  初始化组件的数据
 * @param {Boolean} config.sideNavigator  子菜单是否为侧边菜单
 * @param {String} config.defaultSelectedItemId 初始默认选中菜单项id
 */
Sui.nav.Navigator = Sui.extend(Sui.Container,{
    /**
     * 组件默认样式
     * @property defaultClass
     * @type String
     * @default 'topmenu'
    **/
    defaultClass:'topmenu',
    /**
     * 菜单项样式
     * @property menuItemClass
     * @type String
     * @default 'menu_item'
    **/
    menuItemClass:'menu_item',
    /**
     * 放置子菜单的DOM元素id
     * @property subRenderTo
     * @type String
     * @default null
    **/
    subRenderTo:null,

    navElement:null,
    subnavElement:null,
    subnavList:{},
    /**
     * 初始默认选中菜单项id
     * @property defaultSelectedItemId
     * @type String
     * @default null
    **/
    defaultSelectedItemId:null,
    currentMenuItemMid:null,
    /**
     * 初始化组件的数据
     * @property menuItems
     * @type Array
     * @default null
    **/
    menuItems:null,
    /**
     * 子菜单是否为侧边菜单
     * @property sideNavigator
     * @type Boolean
     * @default false
    **/
    sideNavigator:false,
    /**
     * 根据配置参数初始化
     * @method initConfig
    **/
    initConfig:function(config){
        Sui.nav.Navigator.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ['defaultClass','menuItemClass','subRenderTo','menuItems','sideNavigator','defaultSelectedItemId']);
    },
    /**
     * 渲染组件
     * @method  render
    **/
    render:function(container,interBefore){
        Sui.nav.Navigator.superclass.render.apply(this, arguments);

        this.navElement = this.getApplyToElement();
        this.subnavElement = $('#'+ this.subRenderTo);
        this.renderMenuItems();

    },
    /**
     * 初始化监听事件
     * @method  initEvent
     *
    **/
    initEvent:function(){
        Sui.nav.Navigator.superclass.initEvent.apply(this, arguments);
        this.getApplyToElement().find('.'+this.menuItemClass).on('click',Sui.makeFunction(this,this.onMenuItemClick));
    },
    /**
     * 渲染后执行
     * @method  afterRender
     * @return
    **/
    afterRender:function(){
        Sui.nav.Navigator.superclass.afterRender.apply(this, arguments);
        //设置默认选中菜单
        this.initSelectedMenuItem( );
    },
    /**
     * 初始化选中的菜单项
     * @method initSelectedMenu
     * @private
    **/
    initSelectedMenuItem:function(){

        if (Sui.isString(this.defaultSelectedItemId)) {
            this.setSelectedMenuItem(this.defaultSelectedItemId,false);
        }else{

            var firstItem =  this.getApplyToElement().find('.' + this.menuItemClass).first(),
            fid = firstItem.attr('id').replace('_nav_','') ,
            mid = firstItem.attr('mid');
            //添加样式
            firstItem.addClass('on');
            this.currentMenuItemMid = mid;
            //显示子菜单，选中第一个二级菜单项，如果该二级菜单有子菜单，则选中三级菜单第一项
            if(this.subnavList[fid]){
                this.subnavList[fid].toggle(true);
                this.subnavList[fid].selectFirstItem(false);
            }
        }
    },
    /**
     * 设置选中的菜单项
     * @method setSelectedMenuItem
     * @param {String} id
     * @param {Boolean} patch 是否派发事件
     * @param {Object} eventProperty 事件属性
    **/
    setSelectedMenuItem:function(id, patch, eventProperty) {

        patch = Sui.isUndefinedOrNull(patch) ? true : patch;

        var menuItem = $('#_nav_' + id);
        if (!menuItem.length) {
            suiLog.log('菜单项不存在');
            return;
        }

        var menuItemMid = menuItem.attr('mid');
        var s1id = menuItemMid.split('_')[0],
            s1curid = this.currentMenuItemMid? this.currentMenuItemMid.split('_')[0] : null;

        if (s1id == s1curid) {
            //一级菜单相同
        } else {
            //去除现有选中菜单项样式
            if(s1curid){
                $('#_nav_' + s1curid).removeClass('on');
                this.subnavList[s1curid] && this.subnavList[s1curid].toggle(false);
            }
            //设置新选中菜单项样式
            $('#_nav_' + s1id).addClass('on');
            this.subnavList[s1id] && this.subnavList[s1id].toggle(true);
        }
        this.currentMenuItemMid = menuItemMid;

        if(this.subnavList[s1id]){
            if (menuItemMid.split('_').length == 1) {
                //如果id值只有一级菜单，则将选中子菜单的第一个菜单项
                this.subnavList[s1id].selectFirstItem(patch, eventProperty);
            } else {
                this.subnavList[s1id].setSelectedMenuItem(id, patch, eventProperty);
            }
        }else{
            //如果没有子菜单，就只能在第一级菜单项派发事件
            var eventContent = {
                target: menuItem,
                url: menuItem.attr('data-url')
            };
            if (!Sui.isUndefinedOrNull(eventProperty)) {
                $.extend(eventContent, eventProperty);
            }
            this.fireEvent('selected', new Sui.util.Event(eventContent));
        }
    },
    /**
     * 渲染组件菜单项
     * @method renderMenuItems
     * @private
    **/
    renderMenuItems:function(){
        var contain = this.navElement;
        var self = this;
        for (var i = 0 ,len = this.menuItems.length; i < len; i++) {
            var item = this.menuItems[i],
                subitems = item['subMenuItems'] ;
            var li = $('<li></li>').attr('id','_nav_'+item['id']).attr('mid',item['id']).addClass(this.menuItemClass).html('<a>' + item['caption'] + '</a><span></span>').appendTo(contain);
            item['url'] && li.attr('data-url', item['url']);

            //item添加属性名mid，用于记录菜单项的层级关系，如 第一层ID_第二层ID_第三层ID
            item['mid'] = item['id'] ;

            var hasChild = subitems && subitems.length > 0 ;
            if (hasChild) {
                //添加属性名mid，用于记录菜单项的层级关系，如 第一层ID_第二层ID_第三层ID
                for (var j = 0,slen = subitems.length; j < slen; j++) {
                    subitems[j]['mid'] = item['id'] + '_'+ subitems[j]['id'];
                }

                if(this.sideNavigator){

                    var div = $('<div></div>').appendTo(this.subnavElement);
                    this.subnavList[item.id] = new Sui.nav.SideNavigator({
                        applyTo:div[0],
                        menuItems:subitems  ,
                        defaultClass:'sidenav',
                        menuItemClass:'menu_item',
                        submenuClass:'submenu',
                        submenuItemClass:'submenu_item' ,
                        listeners:{
                            selected:function(e){
                                self.onSubMenuItemSelected(e);
                            }
                        }
                    });
                }else{

                    var ul = $('<ul></ul>').appendTo(this.subnavElement);
                    this.subnavList[item.id] = new Sui.nav.SubNavigator({
                        applyTo:ul[0],
                        menuItems:subitems  ,
                        defaultClass:'submenu',
                        menuItemClass:'menu_item',
                        submenuClass:'droplist',
                        submenuItemClass:'submenu_item',
                        listeners:{
                            selected:function(e){
                                self.onSubMenuItemSelected(e);
                            }
                        }
                    });
                }

               this.subnavList[item.id].toggle(false);
            }
        }
    },
    /**
     * 当一级菜单点击时触发
     * @method onMenuItemClick
     * @param {Event} e
     * @return
    **/
    onMenuItemClick:function(e){
        var menuId = $(e.currentTarget).attr('id').replace('_nav_','');
        this.setSelectedMenuItem(menuId, true, {ctrlKey:e.ctrlKey});
    } ,
    /**
     * 当有子菜单项被选中时执行
     * @method onSubMenuItemSelected
     * @param {Event} e
     * @private
     */
    onSubMenuItemSelected:function(e) {
        this.fireEvent('selected', e);
    }
});
/**
 * 顶部导航菜单
 * @class Sui.nav.SubNavigator
 * @extends Sui.Container
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.applyTo  渲染到的组件id
 * @param {String} config.defaultClass 组件样式名
 * @param {String} config.menuItemClass 一级菜单项样式名
 * @param {String} config.submenuClass 二级菜单样式名
 * @param {String} config.submenuItemClass 二级菜单项样式名
 * @param {String} config.menuItems 组件初始化数据参数
 * @param {Object} config.listeners 事件监听函数，可参考例子
 * @example
 * new Sui.nav.SubNavigator({
 *    applyTo:'toolbar' ,
 *    menuItems: [{
 *       caption : '菜单标题',
 *       imgURL : '菜单图标的URL',
 *       imgCss : '菜单图标的样式名称', //优先级高于imgURL
 *       url : 'http://www.baidu.com/',
 *       subMenuItems : [{
 *           caption : '子菜单标题',
 *           imgURL : '子菜单图标的URL',
 *           imgCss : 's_ico_list',
 *           url : 'http://www.baidu.com/'
 *       }]
 *     },
 *    listeners:{
 *        selected:function(e) {
 *            alert(e.url);
 *        }
 *    }
 *})
 */
Sui.nav.SubNavigator = Sui.extend(Sui.Container,{
    /**
     * 组件的样式名
     * @property defaultClass
     * @type String
     * @default 'toolbar'
     */
    defaultClass:'menu',
    /**
     * 菜单项的样式名
     * @property menuItemClass
     * @type  String
     * @default  'menu_item'
     */
    menuItemClass:'menu_item',
    /**
     * 子菜单的样式名
     * @property submenuClass
     * @type  String
     * @default  'submenu'
     */
    submenuClass:'submenu',
    /**
     * 子菜单项的样式名
     * @property submenuItemClass
     * @type  String
     * @default  'submenu_item'
     */
    submenuItemClass:'submenu_item',

    /**
     * 组件初始化数据参数
     * @property menuItems
     * @type Array
     * @default null
    **/
    menuItems:null,

    currentMenuItemMid:null,

    /**
     * 根据配置参数初始化
     * @method initConfig
     * @param {Object} config
     * @private
     */
    initConfig:function(config){
        Sui.nav.SubNavigator.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ['defaultClass','menuItemClass','submenuClass','submenuItemClass','currentIndex','menuItems']);
    },
    /**
     * 渲染组件
     * @method  render
     * @param {DOM} container
     * @param {DOM} insertBefore
     * @private
     */
    render:function(container,interBefore){
        Sui.nav.SubNavigator.superclass.render.apply(this, arguments);
    },
    /**
     * 渲染菜单图标
     * @method  renderMenuItems
     * @private
     */
    renderMenuItems:function() {

        var menu = this.getApplyToElement(),
            self = this;

        Sui.each(this.menuItems, function() {

            //菜单项主体
            var menuItem = $('<li id="_nav_'+ this['id'] +'"></li>').addClass(self.menuItemClass).attr('mid',this.mid);
            if(this['url']){
                menuItem.attr('data-url',this.url);
            }
            var hasChild = this['subMenuItems'] && this['subMenuItems'].length > 0 ;
            var a = $('<a></a>').appendTo(menuItem).addClass(self.menuItemClass+'_a');

            //图标
            var ico ;
            if(this['imgCss']){
                ico = $('<b class="s_ico"></b>').addClass(this['imgCss']);
            }else if(this['imgURL']){
                ico = $('<b class="s_ico"></b>').html('<img src="'+this['imgURL']+'" />');
            }else{
                ico = $('<b class="s_ico"></b>');
            }
            ico.appendTo(a);
            //文字
            var label  = $('<label></label>').html(this.caption) ;
            label.appendTo(a);
            //收缩展开图标
            var opt;
            if( hasChild ){
                opt = $('<b class="ico_tri"></b>');
                opt.appendTo(a);
            }

            $('<span></span>').appendTo(menuItem);

            menuItem.appendTo(menu);

            if(  hasChild ){
                var subitems = this['subMenuItems'];
                //添加属性名mid，用于记录菜单项的层级关系，如 第一层ID_第二层ID_第三层ID
                for (var j = 0,len = subitems.length; j < len; j++) {
                    subitems[j]['mid'] = this['mid'] + '_'+ subitems[j]['id'];
                }
                self.createSubMenu(this['subMenuItems'],menuItem);
            }

        });

    },
   /**
    * 创建子菜单
    * @method createSubMenu
    * @param {Object} submenuItems 菜单项配置
    * @param  {DOM} contain 容器
    * @private
   **/
    createSubMenu:function(submenuItems,contain){

        var self = this,
            submenu = $('<div></div>').addClass(this.submenuClass).appendTo(contain);
        var ul = $('<ul></ul>').appendTo(submenu).css({minWidth:contain.outerWidth()});

        Sui.each(submenuItems,function(){
            //菜单项主体
            var menuItem = $('<li id="_nav_'+ this['id'] +'"></li>').html('<a>' + this.caption + '</a>').addClass(self.submenuItemClass).attr('data-url', this.url).attr('mid',this.mid);
            menuItem.appendTo(ul);
        });

       contain.mouseover(function(){
           submenu.show();
       }).mouseleave(function(){
           submenu.hide();
       })

    },
    /**
     * 渲染后执行
     * @method afterRender
     * @private
     */
    afterRender:function(){
        Sui.nav.SubNavigator.superclass.afterRender.apply(this, arguments);
        this.renderMenuItems();
    } ,
    /**
     * 初始化事件
     * @method initEvent
     * @private
     */
    initEvent:function(){
        Sui.nav.SubNavigator.superclass.initEvent.apply(this, arguments);

        this.getApplyToElement().find('.' + this.menuItemClass+'_a').on('click',Sui.makeFunction(this,this.onMenuItemClick));
        this.getApplyToElement().find('.'+this.submenuItemClass).on('click',Sui.makeFunction(this,this.onSubMenuItemClick));

    },

    /**
     * 菜单项点击时执行
     * @method  onMenuItemClick
     * @private
     **/
    onMenuItemClick:function(e){

        var menuItem = $(e.currentTarget).parent(),
            menuItemId = menuItem.attr('id').replace('_nav_','');

        this.setSelectedMenuItem(menuItemId, true, {ctrlKey:e.ctrlKey});
    },
    /**
     * 子菜单项点击时执行
     * @method  onSubMenuItemClick
     * @private
     */
    onSubMenuItemClick:function(e){

        var menuItem = $(e.currentTarget),
            menuItemId = menuItem.attr('id').replace('_nav_','');

        this.setSelectedMenuItem(menuItemId, true, {ctrlKey:e.ctrlKey});
    } ,
    /**
     * 设置选中的菜单项
     * @method setSelectedMenuItem
     * @param {String} id  菜单项id，有格式要求，如'1_2'
     * @param {Boolean} patch 是否派发事件,不指定则不派发
     * @param {Object} eventProperty 事件属性
    **/
    setSelectedMenuItem:function(id,patch,eventProperty){

        patch = Sui.isUndefinedOrNull(patch) ? true : patch;

        var menuItem = $('#_nav_' + id),
            menuItemMid = menuItem.attr('mid');

        if(this.currentMenuItemMid == menuItemMid){
            //只派发事件，不变更样式
            patch && this.patchSelectedEvent(menuItemMid,eventProperty);
            return;
        }
        this.toggleMenuItemOn(this.currentMenuItemMid, false);
        this.toggleMenuItemOn(menuItemMid, true);

        patch && this.patchSelectedEvent(menuItemMid,eventProperty);
        this.currentMenuItemMid = menuItemMid;
    },
    /**
     * 显示隐藏菜单项的on样式
     * @method  toggleMenuItemOn
     * @param {String} mid 对象菜单项mid
     * @param {Boolean} show 是否显示
     */
    toggleMenuItemOn:function(mid,show){
        if(Sui.isUndefinedOrNull(mid)){
            return;
        }
        var operator = !!show ? 'addClass' : 'removeClass';

        //mid的格式只允许为 a_b,a_b_c
        var arr = mid.split('_');
        $('#_nav_' + arr[1])[operator]('on');
        if (arr.length == 3) {
            $('#_nav_' + arr[2])[operator]('on');
        }else{
            $('#_nav_' + arr[1]).find('.'+this.submenuItemClass).first()[operator]('on');
        }
    },
    /**
     * 派发菜单项选中事件
     * @method  patchSelectedEvent
     * @param {String} mid 菜单项对应mid属性值
     * @param {Object} eventProperty 事件属性
     * @private
    **/
    patchSelectedEvent:function(mid,eventProperty) {

        var target = null;
        //mid的格式只允许为 a_b,a_b_c
        var arr = mid.split('_');
        if (arr.length == 3) {
            //三级菜单
            target = $('#_nav_' + arr[2]);
        } else {
            //二级菜单
            var submenus = $('#_nav_' + arr[1]).find('.' + this.submenuItemClass);
            if (submenus.length) {
                //有子菜单
                target = submenus.first();
            } else{
                target = $('#_nav_' + arr[1]);
            }
        }
        var eventContent = {
            target: target,
            url: target.attr('data-url')
        };
        if (!Sui.isUndefinedOrNull(eventProperty)) {
            $.extend(eventContent, eventProperty);
        }
        this.fireEvent('selected', new Sui.util.Event(eventContent));
    } ,
    /**
     * 显示隐藏组件
     * @method toogle
     * @param {Boolean} show
    **/
    toggle:function(show){
        this.getApplyToElement().toggle(show);
    },
    /**
     * 选中第一个二级菜单项，如果该菜单项有子菜单，则同时选中第三级菜单；
     * 如果有指定菜单项，则选中指定菜单项
     * @method  selectFirstItem
     * @param {Boolean} patch 是否派发事件
     * @param {Object} eventProperty 事件属性
     */
    selectFirstItem:function(patch, eventProperty) {

        patch = Sui.isUndefinedOrNull(patch) ? true : patch;

        var menuItemMid;
        //没有指定firstItemId
        var firstMenuItem = this.getApplyToElement().find('.' + this.menuItemClass).first(),
        fitstSubMenuItem = firstMenuItem.find('.'+ this.submenuItemClass);

        if (fitstSubMenuItem.length) {
            menuItemMid = fitstSubMenuItem.first().attr('mid');
        } else {
            menuItemMid = firstMenuItem.attr('mid');
        }

        this.toggleMenuItemOn(this.currentMenuItemMid, false);
        this.toggleMenuItemOn(menuItemMid, true);
        this.currentMenuItemMid = menuItemMid;
        patch && this.patchSelectedEvent(menuItemMid,eventProperty);
    }
});

/**
 * 侧边导航菜单
 * @class Sui.nav.SideNavigator
 * @extends Sui.Container
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.applyTo  渲染到的组件id
 * @param {String} config.defaultClass 组件样式名
 * @param {String} config.menuItemClass 一级菜单项样式名
 * @param {String} config.submenuClass 二级菜单样式名
 * @param {String} config.submenuItemClass 二级菜单项样式名
 * @param {String} config.menuItems 组件初始化数据参数
 * @param {Object} config.listeners 事件监听函数，可参考例子
 * @example
 * new Sui.nav.SideNavigator({
 *    applyTo:'side' ,
 *    menuItems: [{
 *       caption : '菜单标题',
 *       imgURL : '菜单图标的URL',
 *       imgCss : '菜单图标的样式名称', //优先级高于imgURL
 *       url : 'http://www.baidu.com/',
 *       subMenuItems : [{
 *           caption : '子菜单标题',
 *           imgURL : '子菜单图标的URL',
 *           imgCss : 's_ico_list',
 *           url : 'http://www.baidu.com/'
 *       }]
 *     },
 *    listeners:{
 *        selected:function(e) {
 *            alert(e.url);
 *        }
 *    }
 *})
 */
Sui.nav.SideNavigator = Sui.extend(Sui.Container,{

    defaultClass:'sidenav',
    /**
     * 菜单项的样式名
     * @property menuItemClass
     * @type  String
     * @default  'menu_item'
     */
    menuItemClass:'menu_item',
    /**
     * 子菜单的样式名
     * @property submenuClass
     * @type  String
     * @default  'submenu'
     */
    submenuClass:'submenu',
    /**
     * 子菜单项的样式名
     * @property submenuItemClass
     * @type  String
     * @default  'submenu_item'
     */
    submenuItemClass:'submenu_item',

    /**
     * 组件初始化数据参数
     * @property menuItems
     * @type Array
     * @default null
    **/
    menuItems:null,

    currentMenuItemMid:null,

    //记录三级子菜单所对应的DOM元素
    submenuList:{},
    /**
     * 根据配置参数初始化
     * @method initConfig
     * @param {Object} config
     * @private
     */
    initConfig:function(config){
        Sui.nav.SideNavigator.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ['defaultClass','menuItemClass','submenuClass','submenuItemClass','menuItems']);
    },
    /**
     * 渲染组件
     * @method  render
     * @param {DOM} container
     * @param {DOM} insertBefore
     * @private
     */
    render:function(container,interBefore){
        Sui.nav.SideNavigator.superclass.render.apply(this, arguments);
        this.renderMenuItems();

    },
    /**
     * 渲染菜单图标
     * @method  renderMenuItems
     * @private
     */
    renderMenuItems:function() {

        var menu = this.getApplyToElement(),
            self = this;

        Sui.each(this.menuItems, function() {

            //菜单项主体
            var menuItem = $('<div></div>').addClass(self.menuItemClass).attr('id','_nav_'+ this['id']).attr('mid',this['mid']);
            if(this['url']){
                menuItem.attr('data-url',this.url);
            }
            var hasChild = this['subMenuItems'] && this['subMenuItems'].length > 0 ;
            var label = $('<a>'+ this.caption +'</a>').appendTo(menuItem);
            //图标
            var ico ;
            if(this['imgCss']){
                ico = $('<b class="s_ico"></b>').addClass(this['imgCss']);
            }else if(this['imgURL']){
                ico = $('<b class="s_ico"></b>').html('<img src="'+this['imgURL']+'" />');
            }else{
                ico = $('<b class="s_ico"></b>');
            }
            ico.appendTo(menuItem);

            //收缩展开图标
            var opt;
            if( hasChild ){
                opt = $('<b class="ico ico_fold"></b>');
                opt.appendTo(menuItem);
                opt.on('click',Sui.makeFunction(self,self.onTriggerClick));
            }

            menuItem.appendTo(menu);
            if(  hasChild ){
                var subitems = this['subMenuItems'];
                //添加属性名mid，用于记录菜单项的层级关系，如 第一层ID_第二层ID_第三层ID
                for (var j = 0,len = subitems.length; j < len; j++) {
                    subitems[j]['mid'] = this['mid'] + '_'+ subitems[j]['id'];
                }
                self.createSubMenu(this['subMenuItems'],menu,this['id']);
            }


        });

    },
   /**
    * 创建子菜单
    * @method createSubMenu
    * @param {Object} submenuItems 菜单项配置
    * @param  {DOM} contain 容器
    * @param {DOM} pid 父菜单项的id
    * @private
   **/
    createSubMenu:function(submenuItems,contain,pid){

        var self = this,
            submenu = $('<div></div>').addClass(this.submenuClass).appendTo(contain);
        Sui.each(submenuItems,function(){
            //菜单项主体
            var menuItem = $('<a></a>').html(this.caption).addClass(self.submenuItemClass).attr('data-url',this.url)
                .attr('id','_nav_'+this['id']).attr('mid',this['mid']);
            //图标
            var ico ;
            if(this['imgCss']){
                ico = $('<b class="s_ico"></b>').addClass(this['imgCss']);
            }else if(this['imgURL']){
                ico = $('<b class="s_ico"></b>').html('<img src="'+this['imgURL']+'" />');
            }else{
                ico = $('<b class="s_ico"></b>');
            }
            ico.appendTo(menuItem);
            menuItem.appendTo(submenu);

        });
       this.submenuList[pid] = submenu;

    },
    /**
     * 渲染后执行
     * @method afterRender
     * @private
     */
    afterRender:function(){
        Sui.nav.SideNavigator.superclass.afterRender.apply(this, arguments);
    } ,
    /**
     * 初始化事件
     * @method initEvent
     * @private
     */
    initEvent:function(){
        Sui.nav.SideNavigator.superclass.initEvent.apply(this, arguments);

        this.getApplyToElement().find('.'+this.menuItemClass).on('click',Sui.makeFunction(this,this.onMenuItemClick));
        this.getApplyToElement().find('.'+this.submenuItemClass).on('click',Sui.makeFunction(this,this.onMenuItemClick));

    },
    /**
     * 当tab菜单项点击时执行
     * @method  onTriggerClick
     * @param {Event} e
     * @private
     */
    onTriggerClick:function(e) {

        var thisIcon = e.currentTarget,
            thisMenuItem = e.currentTarget.parentNode,
            subMenu = $(thisMenuItem).next();

        thisIcon.className = subMenu.is(':visible') ? 'ico ico_expand':'ico ico_fold' ;
        subMenu.toggle();

    },
    /**
     * 菜单项点击时执行
     * @method  onMenuItemClick
     * @private
     **/
    onMenuItemClick:function(e){
        if (e.target.className.indexOf('ico ico_') !== -1) {
            return;
        }
        var menuItem = $(e.currentTarget),
            menuItemId = menuItem.attr('id').replace('_nav_','');

        this.setSelectedMenuItem(menuItemId, true, {ctrlKey:e.ctrlKey});
    },
    /**
     * 派发菜单项选中事件
     * @method  patchSelectedEvent
     * @param {String} mid 菜单项对应mid属性值
     * @param {Object} eventProperty 事件属性
     * @private
    **/
    patchSelectedEvent:function(mid,eventProperty) {

        var target = null;
        //mid的格式只允许为 a_b,a_b_c
        var arr = mid.split('_');
        if (arr.length == 3) {
            //三级菜单
            target = $('#_nav_' + arr[2]);
        } else {
            //二级菜单
            var subMenu = this.submenuList[arr[1]];
            if (subMenu) {
                //有子菜单
                target = subMenu.find('.' + this.submenuItemClass).first();
            } else{
                target = $('#_nav_' + arr[1]);
            }
        }
        var eventContent = {
            target: target,
            url: target.attr('data-url')
        };
        if(!Sui.isUndefinedOrNull(eventProperty)){
            $.extend(eventContent, eventProperty);
        }
        this.fireEvent('selected', new Sui.util.Event(eventContent));

    },
    /**
     * 显示隐藏组件
     * @method toogle
     * @param {Boolean} show
    **/
    toggle:function(show){
        this.getApplyToElement().toggle(show);
    },
    /**
     * 显示隐藏菜单项的on样式
     * @method  toggleMenuItemOn
     * @param {String} mid 对象菜单项mid
     * @param {Boolean} show 是否显示
     */
    toggleMenuItemOn:function(mid,show){
        if(Sui.isUndefinedOrNull(mid)){
            return;
        }
        //mid的格式只允许为 a_b,a_b_c
        var operator = !!show ? 'addClass' : 'removeClass';

        var arr = mid.split('_');
        $('#_nav_' + arr[1])[operator]('on');
        if (arr.length == 3) {
            $('#_nav_' + arr[2])[operator]('on');
        } else {
            //如果二级菜单项有对应的三级菜单，则对三级菜单的第一个菜单项进行操作
            var submenu = this.submenuList[arr[1]] ;
            if(submenu){
                submenu.find('.' + this.submenuItemClass).first()[operator]('on');
            }

        }
    },
    /**
     * 选中第一个二级菜单项，如果该菜单项有子菜单，则同时选中第三级菜单
     * @method  selectFirstItem
     * @param {Boolean} patch 是否派发
     * @param {Object} eventProperty 事件属性
     */
    selectFirstItem: function (patch, eventProperty) {

        patch = Sui.isUndefinedOrNull(patch) ? true : patch;

        var firstMenuItem = this.getApplyToElement().find('.' + this.menuItemClass).first(),
            subMenu = this.submenuList[firstMenuItem.attr('id').replace('_nav_', '')];

        var menuItemMid;
        if (subMenu) {
            menuItemMid = subMenu.find('.' + this.submenuItemClass).first().attr('mid');
        } else {
            menuItemMid = firstMenuItem.attr('mid');
        }

        this.toggleMenuItemOn(this.currentMenuItemMid, false);
        this.toggleMenuItemOn(menuItemMid, true);
        this.currentMenuItemMid = menuItemMid;
        patch && this.patchSelectedEvent(menuItemMid,eventProperty);
    },
    /**
     * 设置选中的菜单项
     * @method setSelectedMenuItem
     * @param {String} id  菜单项id，有格式要求，如'1_2'
     * @param {Boolean} patch 是否派发
     * @param {Object} eventProperty  事件对象的某些属性
     **/
    setSelectedMenuItem:function(id,patch,eventProperty) {

        patch = Sui.isUndefinedOrNull(patch) ? true : patch;

        var menuItem = $('#_nav_' + id),
            menuItemMid = menuItem.attr('mid');

        if (this.currentMenuItemMid == menuItemMid) {
            //只派发事件，不变更样式
            patch && this.patchSelectedEvent(menuItemMid,eventProperty);
            return;
        }
        this.toggleMenuItemOn(this.currentMenuItemMid, false);
        this.toggleMenuItemOn(menuItemMid, true);

        this.currentMenuItemMid = menuItemMid;
        patch && this.patchSelectedEvent(menuItemMid,eventProperty);
    }

});