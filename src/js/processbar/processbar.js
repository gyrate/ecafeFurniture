/**
 * Processbar,进度条组件
 * @class  Sui.Processbar
 * @extends Sui.Component
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.customClass  自定义组件样式
 * @param {Boolean} config.showText 是否显示进度数值
 * @param {Number} config.value 组件的数值
 */
Sui.Processbar = Sui.extend(Sui.Component, {
    /**
     * 默认组件样式
     * @property  defaultClass
     * @type String
     * @default 'sui_process'
     */
    defaultClass:'sui_process',
    /**
     * 自定义组件样式
     * @property  customClass
     * @type String
     * @default ''
    **/
    customClass:'',
    /**
     * 组件的值
     * @property value
     * @type Number
     * @default 0
    **/
    value: 0,
    /**
     *  是否显示进度数值
     * @property showText
     * @type Boolean
     * @default true
    **/
    showText:true,


    content:null,
    textField:null,
    /**
     * 根据配置参数初始化
     * @method initConfig
     * @param {Object} config
     * @private
     */
    initConfig:function(config) {
        Sui.Processbar.superclass.initConfig.apply(this,arguments);
        Sui.applyProps(this, config, ["value",'showText','customClass']);
    },
    /**
     * 渲染当前组件
     * @method render
     * @param {Object} container
     * @param {Object} insertBefore
     */
    render:function(container, insertBefore) {
        Sui.Processbar.superclass.render.apply(this,arguments);

        this.buildDom();
        this.setValue(this.value);
    },
    /**
     * 渲染表格后执行
     * @method afterRender
     */
    afterRender:function() {
        Sui.Processbar.superclass.afterRender.apply(this,arguments);
    } ,
    /**
     * 初始化事件
     * @method initEvent
     */
    initEvent:function() {
       Sui.Processbar.superclass.initEvent.apply(this,arguments);
    },
    /**
     * 创建相关标签
     * @method buildDom
     * @private
     */
    buildDom:function() {
        this.content = $('<span></span>').addClass('sui_process_con').appendTo(this.getApplyToElement());

        if (this.showText) {
            this.textField = $('<span></span>').addClass('sui_process_text').html(this.calibrate(this.value) + '%').appendTo(this.getApplyToElement());
        }
    },
    /**
     * 校准value值
     * @method  calibrate
     * @param {Mixed} val
     * @private
     * @return
    **/
    calibrate:function(val) {
        var calib = parseFloat(val) ;
        return (typeof calib == 'number') ? parseFloat(calib.toFixed(2)) : 0;
    },
    /**
     * 为组件赋值
     * @method setValue
     * @param {Mixed} val
     */
    setValue:function(val) {
        this.value =  this.calibrate(val);
        this.applyValue();
    },
    /**
     * 为组件赋值的实际执行函数
     * @method applyValue
     * @private
     */
    applyValue:function() {
        var val = Math.min(100, Math.max(0, this.value));
        this.content.width(val + '%');
        this.textField && this.textField.html(this.value + '%');
    }
});