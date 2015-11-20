/**
 * ==========================================================================================
 * 表单组件，依赖textfield.js
 * ==========================================================================================
 */
Sui.namespace("Sui.form");

/**
 *
 * 弹出选择框的组件。 包括多个元素：
 * wrapElement
 *   applyToElement
 *   iconElement
 *   hiddenElement
 * 一般通过设置applyTo属性，来创建组件，
 * 设置初始值value和initLabel(显示的值)
 *
 * 如果不创建hidden元素，所有的操作都是在applyToElement上进行操作。
 * 如果创建hidden元素，hidden用来存放实际的值，而applyToElement用来存在显示的值。
 * @class Sui.form.TriggerField
 * @extends  Sui.form.TextField
 * @constructor
 * @param config 配置参数
 * @param config.name 组件名称,提交表单时使用到
 * @param config.needIframeInIE  在IE浏览器是否需要使用iframe方法将layer的z轴层级提高，高于视频控件 ，该参数只对IE有效
 */
Sui.form.TriggerField = Sui.extend(Sui.form.TextField, {

    //组件的构成元素，包括外部容器、图标、隐藏元素(用于表单提交)
    wrapElement : null,
    iconElement : null,
    hiddenElement : null,
    /**
     * 是否可编辑
     * @property editable
     * @type Boolean
     * @default true
     */
    editable : true,
    /**
     * 是否需要创建HiddenElement
     * @property  createHiddenElement
     * @type Boolean
     * @default false
     */
    createHiddenElement : false,
    //组件相关样式
    wrapClass : "sui_trigger",
    iconClass : "trigger_icon",
    /**
     * layer的样式,宽度或高度
     */
    layerClass : '',
    layerWidth : '',
    layerHeight : '',

    useDefaultLayer : true,
    layer : null,
    dataView : null,

    /**
     * hiddenElement的id
     * @property hiddenElementId
     * @type String
     * @default ''
     */
    hiddenElementId : "",
    /**
     * displayElement的id
     * @property  displayElementId
     * @type String
     * @default ''
     */
    displayElementId : "",
    /**
     * 直接渲染Layer
     */
    renderLayerDirect : true,
    /**
     * 在IE浏览器是否需要使用iframe方法将layer的z轴层级提高，高于视频控件 ，该参数只对IE有效
     * @property  needIframeInIE
     * @type {Boolean}
     * @default false
     */
    needIframeInIE:false,
    /**
     * 根据配置参数初始化
     * @method initConfig
     * @param {Object} config
     */
    initConfig : function(config) {

        Sui.form.TriggerField.superclass.initConfig.call(this, config);

        Sui.applyProps(this, config, [ "wrapClass", "iconClass",
            "layerClass", "layerWidth", "layerHeight",
            "onTrigger", "layer", "dataView", "name",
            "hiddenElementId", "displayElementId",'needIframeInIE']);

    },
    /**
     * 类似render的功能，将已有DOM元素转换为符合组件标准的DOM(SIE遗留)
     * @method transform
     * @param {DOM} transformElement
     * @private
     */
    transform : function(transformElement) {

        if (this.createHiddenElement) {
            this.hiddenElement = Sui.getJQ(transformElement);
            this.wrapElement = Sui.findFirstAncestorBySelector(this.hiddenElement, "div");
            // FIXME applyToElement元素的id问题.注册组件时,采用的是applyToElement元素,而该组件的id应该是transformElement
            this.applyToElement = Sui.getFirstChild(this.wrapElement);
            this.iconElement = this.applyToElement.next();
        } else {
            this.applyToElement = Sui.getJQ(transformElement);
            this.wrapElement = Sui.findFirstAncestorBySelector(this.hiddenElement, "div");
            this.iconElement = this.applyToElement.next();
        }
        this.doAfterTransform();

    },
    /**
     * 渲染组件
     * @method render
     * @param {DOM} container
     * @param {DOM} insertBefore
     * @private
     */
    render : function(container, insertBefore) {

        Sui.form.TriggerField.superclass.render.apply(this, arguments);

        var inputElement = this.getApplyToElement().wrap("<div></div>");

        this.wrapElement = inputElement.parent();

        this.iconElement = $("<span></span>").appendTo(this.wrapElement);

        if (this.createHiddenElement) {
            this.hiddenElement = $("<input type='hidden' />").appendTo(
                this.wrapElement);
        }
        this.doAfterTransform();
    },
    /**
     * transform之后遗留的函数
     * @method  doAfterTransform
     * @private
     */
    doAfterTransform : function() {

        this.wrapElement.addClass(this.wrapClass);
        this.iconElement.addClass(this.iconClass);

        var layer = this.getLayer();
        if (! layer && this.useDefaultLayer) {
            layer = this.createDefaultLayer();
        }

        if (layer) {
            layer.addExcludeElementsClick(this.getIconElement());

            if (this.layerWidth) {
                layer.setWidth(this.layerWidth);
            }
            if (this.layerHeight) {
                layer.setHeight(this.layerHeight);
            }

            if (this.layerClass) {
                layer.setCustomClass(this.layerClass);
            }

            if (this.getDataView()) {
                layer.addComponent(this.getDataView());
            }
            if (! layer.isRendered() && this.renderLayerDirect) {
                layer.renderTo(Sui.getBody());
            }
        }
    },
     /**
      * 渲染后执行
     * @method afterRender
     * @private
     */
    afterRender : function() {

        Sui.form.TriggerField.superclass.afterRender.apply(this, arguments);

        // 如果input元素包含name，则将该name删除。
        var name = this.getPropertyOfElement("name", this.getApplyToElement());
        if (name) {
            this.getApplyToElement().attr("name", "");
        }

        // this.name的优先级高于input元素的name属性。
        if (! this.name) {
            this.name = name;
        }

        // 设置hidden元素的name属性的值。
        if (this.name) {
            if (this.createHiddenElement) {
                this.setPropertyOfElement("name", this.name, this.getHiddenElement());
            }
            
            // 注意: 有些组件不需要设置ApplyToElement的name属性
        } else {
            Sui.warn("Sui.form.TriggerField的name属性没有定义。");
        }

        if (this.hiddenElementId) {
            if (this.createHiddenElement) {
                this.hiddenElement.attr("id", this.hiddenElementId);
            }
        }

        if (this.displayElementId) {
            this.applyToElement.attr("id", this.displayElementId);
        }

        this.applyInitData();

    },
    /**
     * 获取layer
     * @method getLayer
     * @return {DOM}
     */
    getLayer : function() {
        return this.layer;
    },
     /**
      * 创建默认的Layer
     * @method  createDefaultLayer
     * @return {DOM}
     */
    createDefaultLayer : function() {
         this.layer = new Sui.Layer({needIframeInIE:this.needIframeInIE});
         return this.layer;
    },
    /**
     * 获取dataView，即数据选择组件
     * @method  getDataView
     * @return {Mixed}
     */
    getDataView : function() {
        return this.dataView;
    },
    /**
     * 设置组件宽度的执行函数
     * @method applyWidth
     * @private
     */
    applyWidth : function() {
        if (this.isRendered()) {
            if (Sui.isDefined(this.width)) {
                this.getResizeElement().width(this.width);
                var iconWidth = 0;
                if(! this.isReadOnly()){
                    iconWidth = this.iconElement.outerWidth();
                }
                Sui.setOuterWidth(this.getApplyToElement(), this.getWidth() - iconWidth);
            }
        }
    },
    /**
     * 设置外部容器的宽度的执行函数
     * @method  applyOuterWidth
     * @private
     */
    applyOuterWidth : function() {
        if (this.isRendered()) {
            Sui.setOuterWidth(this.wrapElement, this.outerWidth);
            var iconWidth = this.iconElement.outerWidth();
            Sui.setOuterWidth(this.getApplyToElement(), this.getWidth() - iconWidth);
        }
    },
    /**
     * 获取wrapElement
     * @method getResizeElement
     * @return {DOM}
     */
    getResizeElement : function() {
        return this.wrapElement;
    },
    /**
     * 获取wrapElement
     * @method  getWrapElement
     * @return {DOM}
     */
    getWrapElement : function() {
        return this.wrapElement;
    },
    /**
     * 获取iconElement
     * @method  getIconElement
     * @param {DOM}
     */
    getIconElement : function() {
        return this.iconElement;
    },
    /**
     * 获取getHiddenElement
     * @method getHiddenElement
     * @param {hiddenElement}
     */
    getHiddenElement : function() {
        return this.hiddenElement;
    },
    /**
     * 添加特许元素（如果鼠标点击这些元素，不隐藏当前组件）
     * @method  addExcludeElementsClick
     * @private
     */
    addExcludeElementsClick : function() {
        this.layer.addExcludeElementsClick.apply(this.layer, arguments);
    },
    /**
     * 移除特许元素
     * @method   removeExcludeElementsClick
     * @private
     */
    removeExcludeElementsClick : function() {
        this.layer.removeExcludeElementsClick.apply(this.layer, arguments);
    },
    /**
     * 获得组件可视的值
     * @method  getDispalyValue
     * @return {String}
     * @private
     */
    getDisplayValue : function() {
        if (this.isRendered()) {
            return this.getApplyToElement().val();
        } else {
            return this.initLabel;
        }
    },
    /**
     * 获得组件（输入框中）的值
     * @method  getValue
     * @return {String}
    */
    getValue : function() {
        if (this.isRendered()) {
            if (this.createHiddenElement) {
                return this.getHiddenElement().val();
            } else {
                return this.getDisplayValue();
            }
        }
        return this.value;
    },
    /**
     * 设置组件的值，
     * hiddenElement和input是关联的
     * @method  setValue
     * @param {String} val
     */
    setValue : function(val) {
        this.value = val;
        this.applyValue();
    },
    /**
     * 设置属性值的执行函数
     * @method  applyValue
     * @private
     */
    applyValue : function() {
        if (this.isRendered()) {

            if (this.createHiddenElement) {
                this.getHiddenElement().val(this.value);
            }

            var displayValue = this.findLabelByValue();
            this.getApplyToElement().val(displayValue);
        }
    },
    /**
     * 设置initLabelValue的值
     * @method  setInitLabelValue
     * @param {String} initLabelValue
     * @private
     */
    setInitLabelValue: function(initLabelValue){
    	this.initLabelValue = initLabelValue;
    },
     /**
      * 判断是否可编辑
     * @method isEditable
     * @return {Boolean}
     */
    isEditable : function() {
        return this.editable;
    },
     /**
      * 判断是否只读
     * @method isFieldReadOnly
     * @param {Boolean}
     */
    isFieldReadOnly : function() {
        return this.isReadOnly() || !this.isEditable();
    },
    /**
     * 初始化数据
     * @method  applyInitData
     * @private
     */
    applyInitData : function() {
        this.applyValue();
    },

     /**
      * 根据隐藏的值,获取要显示给用户看的值
     * @method  findLabelByValue
     * @return {String}
     * @private
     */
    findLabelByValue : function() {
        return this.value;
    },
    /**
     * 初始化事件监听
     * @method  initEvent
     * @private
     */
    initEvent : function() {

        Sui.form.TriggerField.superclass.initEvent.call(this);

        this.iconElement.click(Sui.makeFunction(this, this.onTrigger));

        if (this.dataView) {

            this.dataView.addListeners({
                "selected" : Sui.makeFunction(this, this.onSelectedItem),
                "cancel" : Sui.makeFunction(this,this.onCancel)
            });

        }
        //窗口尺寸改变时，浮动层的位置也应该有所调整
        $(window).resize(Sui.makeFunction(this, this.adjustLayerPosition));
    },
    /**
     * 窗口尺寸改变时，浮动层的位置也应该有所调整,该函数是为了解决这个问题
     * @method adjustLayerPosition
     * @private
     */
    adjustLayerPosition:function(){
        if (this.getLayer().isVisible()) {
            this.getLayer().alignToElement(this.getAlignElement());
        }
    },
    /**
     * 当有选项被选中时执行
     * @method  onSelectedItem
     * @param {}
     * @private
     */
    onSelectedItem : function(event) {

        var oldValue = this.getValue();

        var value = event.value;

        var valueChanged = event.valueChanged = oldValue !== value;

        // 需要先获取焦点，再设置值
        var input = this.getApplyToElement();
        input.focus();

        this.setValue(value);
        this.getLayer().hide();
        this.fireEvent("selected", event);

        if(valueChanged){
            this.fireEvent("valueChanged", new Sui.util.Event({
                target : this,
                oldValue : oldValue ,
                newValue : this.getValue()
            }));
        }
    },
    /**
     * 取消选择时触发该函数，可被继承
     * @method onCancel
     * @private
     */
    onCancel:function(){
        this.fireEvent("cancel", event);
    },
    /**
     * 处理Trigger事件
     * @method onTrigger
     * @private
     */
    onTrigger : function() {
        this.toggleExpand();
    },
    /**
     * 展开和收缩
     * @method  toggleExpand
     */
    toggleExpand : function() {
        if (this.isExpanded()) {
            this.collapse();
        } else {
            this.expand();
        }
    },
    /**
     * 展开
     * @method  expand
     * @private
     */
    expand : function() {
        this.showLayer();
    },
    /**
     * 收缩
     * @method  collapse
     * @private
     */
    collapse : function() {
        this.getLayer().hide();
    },
    /**
     * 判断是否展开
     * @method isExpanded
     * @return {Boolean}
     * @private
     */
    isExpanded : function() {
        return this.getLayer().isVisible();
    },
    /**
     * 获得最外层DOM
     * @method  getTopElement
     * @return {DOM}
     * @private
     */
    getTopElement : function() {
        return this.getWrapElement();
    },
    /**
     * 获得最外层DOM
     * @method getAlignElement
     * @return {DOM}
     * @private
     */
    getAlignElement : function() {
        return this.getTopElement();
    },
    /**
     * 显示下拉浮层
     * @method  showLayer
     * @private
     */
    showLayer : function() {
        this.getLayer().alignToAndShow(this.getAlignElement());
        this.afterShowLayer();
    },
    /**
     * 显示下拉浮层后执行，可被继承
     * @method  afterShowLayer
     * @private
     */
    afterShowLayer : Sui.emptyFn

});