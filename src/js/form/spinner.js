/**
 * Spinner组件，可通过鼠标按钮改变大小
 * 长按调节按钮可使数值连续变化
 * @class Sui.form.Spinner
 * @extends Sui.form.TextField
 * @constructor
 * @param {Object} config  配置参数
 * @param {String} config.applyTo  渲染到组件的id，必选
 * @param {String} config.value 组件的值
 * @param {Number} config.minValue 最小值，默认为null
 * @param {Number} config.maxValue 最大值，默认为null
 * @param {Number} config.toFixed 小数点后的位数，默认为0位
 * @param {Number} config.addValue  数字增加（减少）步长，默认为1
 * @param {Boolean} config.readOnly  是否为只读状态
 */
Sui.form.Spinner = Sui.extend(Sui.form.TextField, {

    wrapElement : null,
    wrapClass : 'sui_spinner',

    extraWrapClass : '',

    iconContainerClass : 'iconContainer',
    upIconClass : 'upButton',
    downIconClass : 'downButton',
    /**
     * 数字增加（减少）步长
     * @property addValue
     * @type Number
     * @default 1
     */
    addValue : 1,
    /**
     * 用于周期性执行组件值的调整
     * @property  changeInterval
     * @param config
     */
    changeInterval:null,
    //用于周期性执行组件值的调整的标识
    mouseDownFlag :true,
    onChangFlag : false,
    /**
     * 根据配置参数进行初始化
     * @method  initConfig
     * @param {Object} config 配置参数
     */
    initConfig : function(config) {

        Sui.form.TextField.superclass.initConfig.call(this, config);
        config = config || {};

        Sui.applyProps(this, config, ["value", "label", "readOnly", "title", "maxLength","maxValue","minValue","toFixed"]);
    },
    /**
     * 获取最外层DOM
     * @method getWrapElement
     * @return DOM
     */
    getWrapElement : function() {
        return this.wrapElement;
    },
    /**
     * 设置最外层DOM的样式
     * @method  setExtraWrapClass
     * @param {String} extraWrapClass
     * @private
     */
    setExtraWrapClass : function(extraWrapClass) {

        if (this.getWrapElement()) {
            this.getWrapElement().removeClass(this.extraWrapClass);
        }

        this.extraWrapClass = extraWrapClass;
        this.applyExtraWrapClass();
    },
    /**
     * 设置最外层DOM的样式,实际执行函数
     * @method  applyExtraWrapClass
     */
    applyExtraWrapClass : function() {
        if (this.getWrapElement()) {
            this.getWrapElement().addClass(this.extraWrapClass);
        }
    },
    /**
     * 修正addValue使其为数字
     * @method  setAddValue
     * @param {Mixed} addValue
     */
    setAddValue : function(addValue) {

        if (! Sui.isNumber(addValue)) {
            addValue = parseInt(addValue + "");
        }

        if (isNaN(addValue)) {
            addValue = 1;
        }

        this.addValue = addValue;
    },
    /**
     * 渲染组件
     * @method render
     * @param {DOM} container
     * @param {DOM} insertBefore
     * @private
     */
    render : function(container, insertBefore) {

        Sui.form.Spinner.superclass.render.apply(this, arguments);

        var self = this;
        var inputElement = this.getApplyToElement().wrap("<div></div>");
        var wrapElement = this.wrapElement = inputElement.parent();
        wrapElement.addClass(this.wrapClass);

        this.iconContainer = $("<span></span>").appendTo(wrapElement);
        this.iconContainer.addClass(this.iconContainerClass);

        this.upIconElement = $("<button></button>").appendTo(this.iconContainer);
        this.upIconElement.addClass(this.upIconClass);
        //实现根据鼠标点击行为增加数值
        this.upIconElement.mousedown(function(){ self.onButtonMouseDown.apply(self,['onUpButtonClick']) })
                            .mouseup(function(){ self.onButtonMouseUp.apply(self, ['onUpButtonClick']) });

        this.downIconElement = $("<button></button>").appendTo(this.iconContainer);
        this.downIconElement.addClass(this.downIconClass);
        this.downIconElement.addClass(this.upIconClass);
        //实现根据鼠标点击行为减少数值
        this.downIconElement.mousedown(function(){ self.onButtonMouseDown.apply(self,['onDownButtonClick']) })
                              .mouseup(function(){ self.onButtonMouseUp.apply(self, ['onDownButtonClick']) });

        this.upIconElement.attr('disabled',this.readOnly);
        this.downIconElement.attr('disabled',this.readOnly);

    },
    /**
     * 当调节按钮按下时执行
     * @method  onButtonMouseDown
     * @param {String} handle
     * @private
     */
    onButtonMouseDown:function(handle) {

        this.mouseDownFlag = true;
        this.onChangFlag = false;
        var self = this;

        this.dt = new Sui.util.DelayedTask(function() {
            if (this.mouseDownFlag) {

                this.onChangFlag = true;

                this.changeInterval = setInterval(function() {
                    self[handle]();
                }, 100);
            }
            this.dt = null;
        }, this);
        this.dt.delay(500);

    },

    onButtonMouseUp:function(handle) {
        if (this.dt) {
            this.dt.cancel();
            this.dt = null;
        }
        clearInterval(this.changeInterval);
        if( !this.onChangFlag ){
            this[handle]();
        }
        this.onChangFlag = false;
        this.mouseDownFlag = false;

    },
    /**
     * 渲染组件后执行
     * @method  afterRender
     * @private
     */
    afterRender : function() {
        Sui.form.Spinner.superclass.afterRender.apply(this, arguments);
        this.applyExtraWrapClass();
    },
    /**
     * 当增加按钮点击时执行
     * @method  onUpButtonClick
     * @private
     */
    onUpButtonClick : function() {
        var val = this.getValue();
        if (val == "") {
            val = 0;
        } else {
            val = parseInt(val) + this.addValue;
        }
        if (Sui.isNumber(this.maxValue)) {
            val = Math.min(this.maxValue, val);
        }
        this.setValue(val);
    },
    /**
     * 当减少按钮点击时执行
     * @method onDownButtonClick
     * @private
     */
    onDownButtonClick : function() {

        var val = this.getValue();
        if (val == "") {
            val = 0;
        } else {
            val = parseInt(val) - this.addValue;
        }
        if(Sui.isNumber(this.minValue)){
            val = Math.max(this.minValue,val);
        }
        this.setValue(val);

    },
    /**
     * 设置最大值
     * @method setMaxValue
     * @param {Number} val
     */
    setMaxValue:function(val){
        if(Sui.isNumber(val)){
            this.maxValue = val;
        }
        if (this.value > this.maxValue) {
            this.setValue(this.maxValue);
        }
    },
    /**
     * 设置最小值
     * @method setMinValue
     * @param {Number} val
     */
    setMinValue:function(val){
        if(Sui.isNumber(val)){
            this.minValue = val;
        }
        if(this.value < this.minValue){
            this.setValue(this.minValue);
        }
    },
    /**
     * 输入框失焦时执行
     * @method  onBlur
     * @param {Event} e
     */
    onBlur : function(e) {
        Sui.form.Spinner.superclass.onBlur.apply(this, arguments);

        var value = this.checkChar(this.getValue());
        value = Math.min( this.maxValue, Math.max( value , this.minValue ) );

        value = this.checkFixed(value);

        this.setValue(value);
    } ,
    /**
     * 检测输入值是否合法并将其修正
     * @method checkChar
     * @param {Mixed} value
     * @return {Number}
     */
    checkChar : function(value) {
        // 只能包含数字,点号'.'和负号'-'
        value = value.replace(/[^\d.-]/g, "");

        // 只能在开头包含负号
        var subCount = 1;
        if (! (value.length > 0 && value.charAt(0) == '-')) {
            subCount = 0;
        }
        value = Sui.StringUtil.removeChar(value, '-', subCount);

        // 不能在开头包含点号
        value = Sui.StringUtil.removeStart(value, ".", true);

        // 如果是整数,没有点号'.'。如果是实数，可以包含一个点号。
        value = Sui.StringUtil.removeChar(value, '.', this.toFixed <= 0 ? 0 : 1);

        return value;
    },
    /**
     * 检测小数位数是否符合要求，如不和要求则修正
     * @method checkFixed
     * @private
     * @return {Number}
     */
    checkFixed:function(value) {
        if (Sui.isUndefinedOrNull(this.toFixed)) {
            return value;
        }
        return value.toFixed(this.toFixed);
    },
    /**
     * 键盘按下时执行
     * @method onKeyDown
     * @param {Event} event
     * @private
     */
    onKeyDown : function(event) {

        Sui.form.Spinner.superclass.onKeyDown.apply(this, arguments);

        var KEY = Sui.KEY;
        switch (event.keyCode) {
            case KEY.UP:
                this.onUpButtonClick();
                break;
            case KEY.DOWN:
                this.onDownButtonClick();
                break;
            case KEY.RETURN:
                //阻止enter事件的派发
                event.preventDefault();
                break;
            default:
                break;
        }
    },
    /**
     * 设置组件的只读性
     * @method  setReadOnly
     * @param readOnly
     */
    setReadOnly : function(readOnly) {
        this.readOnly = readOnly;
        this.applyReadOnly();

        Sui.form.Spinner.superclass.setReadOnly.apply(this,arguments);
        this.upIconElement.attr('disabled',readOnly);
        this.downIconElement.attr('disabled',readOnly);
    }


});
