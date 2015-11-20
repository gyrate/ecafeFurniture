/**
 * ==========================================================================================
 * 表单组件
 * ==========================================================================================
 */
Sui.namespace("Sui.form");
/**
 * form组件，普通文本
 * @class  Sui.form.Label
 * @extends Sui.Component
 */
Sui.form.Label = Sui.extend(Sui.Component, {
    applyToTagName: 'label'
});
Sui.Components.register("label", Sui.form.Label);

/**
 * form组件，文本输入框。
 * TextField组件的value属性的值，可以通过输入的方式进行修改。
 * value默认值为undefined，如果值不为undefined，表示设置了初始值或修改了值。
 * @class  Sui.form.TextField
 * @extends  Sui.Component
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.value 组件的值
 * @param {Boolean} config.readOnly 是否为只读
 * @param {Number} config.maxLength 最大字符长度
 * @param {Number} config.maxLength 最大字符长度
 * @param {String} config.title 提示信息
 */
Sui.form.TextField = Sui.extend(Sui.Component, {

    /* FIXME 暂时采用input_text */
    customClass : 'input_text',
    applyToTagName : '<input />',
    fieldType : 'text',
    /**
     * 组件的值
     * @property value
     * @type String
     * @default undefined
     */
    value : undefined,

    /**
     * 在Form组件中，定义Field的label。
     * @property   label
     * @type String
     * @default ''
     *
     */
    label : "",
    
    /**
     * 名称属性
     */
    name : "",
    
    /**
     * 是否为只读
     * @property  readOnly
     * @type  Boolean
     * @default false
     */
    readOnly : false,

    /**
     * 提示信息
     * @property  title
     * @type String
     * @default null
     */
    title : null,
    /**
     * 最大长度
     * @property maxLength
     * @type Number
     * @default null
     */
    maxLength : null,
    /**
     * 根据配置参数进行初始化
     * @method  initConfig
     * @param {Object} config 配置参数
     * @private
     */
    initConfig : function(config) {

        Sui.form.TextField.superclass.initConfig.call(this, config);
        config = config || {};

        Sui.applyProps(this, config, ["value", "label", "name", "readOnly", "title", "maxLength"]);
    },
    /**
     * 渲染后执行
     * @method afterRender
     * @private
     */
    afterRender : function() {
        Sui.form.TextField.superclass.afterRender.apply(this, arguments);

        // 用来禁止firefox浏览器对input元素的缓存。
        this.setPropertyOfElement("autocomplete", "off", this.getApplyToElement());

        this.applyReadOnly();
        this.applyTitle();
        this.applyValue();
        this.applyMaxLength();
        this._applyName();

    },
    /**
     * 获得文本
     * @method  getLabel
     * @returns {String|label}
     */
    getLabel : function() {
        return this.label;
    },
    /**
     * 设置最大文本长度
     * @method applyMaxLength
     * @private
     */
    applyMaxLength : function() {
        if (this.isRendered()) {
            if (Sui.isUndefinedOrNull(this.maxLength)) {
                this.getApplyToElement().removeAttr("maxlength");
            } else {
                this.setPropertyOfElement("maxlength", this.maxLength, this.getApplyToElement());
            }

        }
    },
    /**
     * 设置组件的只读性
     * @method  setReadOnly
     * @param {Boolean} readOnly
     */
    setReadOnly : function(readOnly) {
        this.readOnly = readOnly;
        this.applyReadOnly();
    },
    /**
     * 判断组件当前是否只读实际执行函数
     * @method  isReadOnly
     * @returns {Boolean}
     * @private
     */
    isReadOnly : function() {
        return this.readOnly;
    },

    /**
     * 判断输入框是否只读
     * @method isFieldReadOnly
     * @return {Boolean}
     *
     */
    isFieldReadOnly : function(){
        return this.isReadOnly();
    },
    /**
     * 设置组件的只读性
     * @method  applyReadOnly
     */
    applyReadOnly : function() {
        if (this.isRendered()) {
//            this.getApplyToElement().focus(function(){
//                this.getApplyToElement().blur();
//            });
            // 不能禁用,禁用的话,无法提交数据.
        	this.getApplyToElement().attr("readOnly", this.isFieldReadOnly());
        }
    },
    /**
     * 设置提示信息
     * @method setTitle
     * @param {String} title
     */
    setTitle : function(title) {
        this.title = title;
        this.applyTitle();
    },
    /**
     * 设置提示信息,实际执行函数
     * @method  applyTitle
     * @private
     */
    applyTitle : function() {
        if (this.isRendered()) {
            if (Sui.isDefinedAndNotNull(this.title)) {
                this.setPropertyOfElement("title", this.title, this.getApplyToElement());
            }
        }
    },
    /**
     * 获得提示信息
     * @method  getTitle
     * @return {String}
     */
    getTitle : function() {
        return this.title;
    },
    /**
     * 设置组件的值
     * @method setValue
     * @param {String} val
     */
    setValue : function(val) {
        Sui.log("设置TextField的值为:" + val + ",旧的值为:" + this.value);
        this.value = val;
        this.applyValue();
    },
    
    _applyName : function(){
        if (this.getApplyToElement()) {
            if (Sui.isNotEmpty(this.name)) {
                this.getApplyToElement().attr("name", this.name);
            }
        }
    },

    /**
     * 设置组件输入框中的文本值,实际执行函数
     * @method applyValue
     * @private
     */
    applyValue : function() {
        if (this.getApplyToElement()) {
            if (Sui.isDefined(this.value)) {
                this.getApplyToElement().val(this.value);
            }
        }
    },

    /**
     * 获得输入框中的值
     * @method  getValue
     * @return {String}
     */
    getValue : function() {
        if (this.getApplyToElement()) {
            return this.getApplyToElement().val();
        }
        return this.value;
    },
    /**
     * 初始化监听事件
     * @method initEvent
     * @private
     */
    initEvent : function() {
        Sui.form.TextField.superclass.initEvent.apply(this, arguments);

        this.getApplyToElement().keydown(Sui.makeFunction(this, this.onKeyDown))
            .keyup(Sui.makeFunction(this, this.onKeyUp))
            .blur(Sui.makeFunction(this, this.onBlur))
            .focus(Sui.makeFunction(this, this.onFocus))
            .click(Sui.makeFunction(this, this.onClick));

        this.getApplyToElement().change(Sui.makeFunction(this, this.onValueChange));

    },
    /**
     * 当组件值变化时执行，这是个空函数，可被子类重写
     * @method  onValueChange
     */
    onValueChange : Sui.emptyFn,
    /**
     * 当组件输入框失去焦点时派发事件 blur
     * @method onBlur
     * @param {Event} e
     */
    onBlur : function(e) {
        this.fireEvent("blur", new Sui.util.Event({
            originalEvent : e
        }));
    },
    /**
     * 当组件输入框获得焦点时派发事件 focus
     * @method onFocus
     * @param {Event} e
     */
    onFocus : function(e) {
        this.fireEvent("focus", new Sui.util.Event({
            originalEvent : e
        }));
    },
    /**
     * 当键盘按下时派发事件 keydown
     * @method  onKeyDown
     * @param {Event} e
     */
    onKeyDown : function(e) {
        this.fireEvent("keydown", {
            originalEvent : e
        });
    },
    /**
     * 当键盘弹起时派发事件 keyup
     * @method onKeyUp
     * @param {Event} e
     */
    onKeyUp : function(e) {
        this.fireEvent("keyup", {
            originalEvent : e
        });
    },
    /**
     * 当鼠标点击时派发事件 click
     * @method onClick
     * @param e
     */
    onClick : function(e) {
        this.fireEvent("click", {
            originalEvent : e
        });
    },

    /**
     * 令组件获得焦点
     * @method focus
     */
    focus : function() {
        Sui.focusIfCan(this.getApplyToElement());
    },
    
    /**
     * 标识为form表单组件
     * @method isField
     * @return {boolean}
     */
    isField : function(){
        return true;
    },

    /**
     * 标识为form表单组件
     * @method isField
     */
    getName : function(){
        return this.name;
    }

});

Sui.Components.register("textField", Sui.form.TextField);
