Sui.namespace('Sui.Accordion');
/**
 * 手风琴组件
 * @class Sui.Accordion
 * @extends Sui.Container
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.applyTo  渲染到的组件id
 * @param {String} config.menuClass 手风琴叶片的的className 通过该参数找到折叠情况下的元素
 * @param {String} config.contentClass 组件内容的className，通过该参数找到内容元素
 * @param {String} config.trigger 触发更换tab的方式，可以是click或hover
 * @param {String} config.triggerByIcon 是否通过点击图标触发展开折叠，默认为false
 * @param {Number} config.currentIndex 当前选项的索引
 * @param {Object} config.listeners 事件监听函数，可参考例子
 * @example
 * new Sui.Accordion({
 *    applyTo:'accordion' ,
 *    menuClass:'menu_item',
 *    contentClass:'content_item',
 *    trigger:'click',
 *    currentIndex:2,
 *    listeners:{
 *        changeRegion:function(e) {
 *            alert(e.index);
 *        }
 *    }
 *})
 */
Sui.Accordion = Sui.extend(Sui.Container,{

    defaultClass:'accordion',
    /**
     * 手风琴叶片的的className 通过该参数找到折叠情况下的元素
     * @property menuClass
     * @type String
     * @default  'menu_item'
     */
    menuClass:'menu_item',
    /**
     * 组件内容的className，通过该参数找到内容元素
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
     * 当前选项的索引
     * @property currentIndex
     * @type Number
     * @default 0
     */
    currentIndex:0,
    /**
     * 是否通过点击图标触发展开折叠
     * @property  triggerByIcon
     * @type Boolean
     * @default false
     */
    triggerByIcon:false,

    menuItems:[],
    menuItemIcons:[],
    contentItems:[],
    /**
     * 根据配置参数初始化
     * @method initConfig
     * @param {Object} config
     * @private
     */
    initConfig:function(config){
         Sui.Accordion.superclass.initConfig.apply(this, arguments);
         Sui.applyProps(this, config, ['menuClass','contentClass','trigger','effect','currentIndex','triggerByIcon']);
    },
    /**
     * 渲染组件
     * @method  render
     * @param {DOM} container
     * @param {DOM} insertBefore
     * @private
     */
    render:function(container,interBefore){
        Sui.Accordion.superclass.render.apply(this, arguments);

        this.menuItems = this.getApplyToElement().find('.' + this.menuClass);
        this.contentItems = this.getApplyToElement().find('.' + this.contentClass);

        var self = this;
        this.menuItems.each(function(index){
            var icon = $('<b class="ico ico_' + (index == self.currentIndex ? 'expand' : 'fold') + '"></b>');
            $(this).append(icon);
            self.menuItemIcons.push(icon[0]);
        });
        if(!this.triggerByIcon){
            this.menuItems.css({cursor:'pointer'});
        }
    },
    /**
     * 渲染后执行
     * @method afterRender
     * @private
     */
    afterRender:function(){
        Sui.Accordion.superclass.afterRender.apply(this, arguments);
        this.initCurrentIndex();
    } ,
    /**
     * 初始化事件
     * @method initEvent
     * @private
     */
    initEvent:function(){
        Sui.Accordion.superclass.initEvent.apply(this, arguments);

        if(this.triggerByIcon){
            for (var i = 0,len = this.menuItemIcons.length; i < len; i++) {
                $(this.menuItemIcons[i]).on(this.trigger, Sui.makeFunction(this, this.onTriggerMenu));
            }
        }else{
            this.menuItems.on(this.trigger, Sui.makeFunction(this, this.onTriggerMenu));
        }
    },
    /**
     * 当tab菜单项点击时执行
     * @method  onTriggerMenu
     * @param {Event} e
     * @private
     */
    onTriggerMenu:function(e) {

        var index =  this.calMenuItemIndex( this.triggerByIcon ? e.currentTarget.parentNode : e.currentTarget);
        this.setCurrentIndex(index);

    },
     /**
     * 将某个索引值对应tab设置为当前tab
     * @method setCurrentIndex
     * @param {Number} val
     * @private
     */
    setCurrentIndex:function(val) {

        var curIdx = this.currentIndex;
        if (Sui.isUndefinedOrNull(val) ) {
            return;
        }
        if( val == curIdx){
            val++;
        }
        var len = this.getRegionCount();
        val = (val + len) % len;

        this.getContentItemByIndex(curIdx).slideUp(200);
        this.getContentItemByIndex(val).slideDown(200);

        this.menuItemIcons[this.currentIndex].className = 'ico ico_fold';
        this.menuItemIcons[val].className = 'ico ico_expand';

        //设置新的currentMenuItem状态
        this.getMenuItemByIndex(val).addClass(this.onMenuClass);
        this.currentIndex = val;
        //派发changeTab事件，可被listener监听
        this.fireEvent('changeRegion', {
            index:val,
            contentItem: this.getContentItemByIndex(val)
        })

    },
    /**
     * 获取当前tab的索引值
     * @method getCurrentIndex
     * @return {Number}
     * @private
     */
    getCurrentIndex:function(){
        return this.currentIndex;
    },

    /**
     * 初始化当前tab的状态
     * @method  initCurrentIndex
     * @private
     */
    initCurrentIndex:function() {

        var currIndex = this.currentIndex;

        this.contentItems.each(function (index) {
            $(this).toggle(index == currIndex);
        });

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
     * 获取手风琴组件
     * @method getRegionCount
     * @return {Number}
     */
    getRegionCount:function(){
        return this.menuItems.length;
    }
});