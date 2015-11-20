/**
 * 表格中包含一些数字，选择表格中的数字。
 */
Sui.TableSelect = Sui.extend(Sui.Component, {

    applyToTagName: 'table',

    defaultClass : 'sui_tableselect',

    rows : 1,
    cols : 1,
    startValue : 0,
    addValue : 1,

    initConfig : function(config) {
        Sui.applyProps(this, config, ["rows", "cols", "startValue", "addValue"]);
    },

    render : function(container, insertBefore) {
        Sui.TableSelect.superclass.render.apply(this, arguments);

        var table = this.getApplyToElement();

        var rows = this.rows;
        var cols = this.cols;
        var startValue = this.startValue;
        var addValue = this.addValue;

        for (var i = 0; i < rows; i++) {
            var tr = $("<tr></tr>").appendTo(table);
            for (var j = 0; j < cols; j++) {
                var td = $("<td></td>").appendTo(tr);
                td.text(startValue + addValue * (i * cols + j));
            }
        }


        var tds = table.find("tbody tr td");
        Sui.hoverEach(tds, 'onItem', "");
        tds.click(Sui.makeFunction(this, this.onItemSelected));
    },

    onItemSelected : function(e) {
        var val = parseInt($(e.target).text());
        this.fireEvent("selected", new Sui.util.Event({
            value : val
        }));
    }

});

/**
 * ==========================================================================================
 * 时间选择组件，继承Spinner。依赖Layer。
 * ==========================================================================================
 */
/**
 * 时间选择组件，需依赖Layer。
 * @class  Sui.form.TimeField
 * @extends Sui.form.Spinner
 * @constructor
 * @param {Object} config 配置参数
 * @param {DOM} config.renderTo 渲染容器
 * @param {String} config.timeFormat 时间格式，默认为"hh:mm:ss"
 * @param {DOM} config.hourField 可指定
 * @param {Number} config.hourValue 时钟的初始数值
 * @param {Number} config.minuteValue 分钟的初始数值
 * @param {Number} config.secondValue 秒钟的初始数值
 */
Sui.form.TimeField = Sui.extend(Sui.form.Spinner, {

    //默认组件样式
    extraWrapClass : 'sui_timefield',

    /**
     * 时间格式
     * @property  timeFormat
     * @type String
     * @default "hh:mm:ss"
     */
    timeFormat : "hh:mm:ss",
    /**
     * 时钟的初始数值
     * @property  hourValue
     * @type Number
     * @default null
     */
    hourValue:null,
    /**
     * 分钟的初始数值
     * @property  hourValue
     * @type Number
     * @default null
     */
    minuteValue:null,
    /**
     * 秒钟的初始数值
     * @property  hourValue
     * @type Number
     * @default null
     */
    secondValue:null,

    hourInfo : {
        value : 0,
        numberField : null
    },

    minuteInfo : {
        value : 0,
        numberField : null
    },

    secondInfo : {
        value : 0,
        numberField : null
    },

    lastFocusInput : null,
    /**
     * 根据配置参数进行初始化
     * @mehtod initConfig
     * @param config
     */
    initConfig : function(config) {
        Sui.form.TimeField.superclass.initConfig.apply(this, arguments);

        Sui.applyProps(this, config, ["hourInfo", "minuteInfo", "secondInfo", "timeFormat","secondValue","minuteValue","hourValue"]);
        Sui.applyProps(this, Sui.form.TimeField, ["HOUR", "MINUTE", "SECOND"]);
    },
    /**
     * 渲染组件
     * @mehtod render
     * @param {DOM} container
     * @param {DOM} insertBefore
     */
    render : function(container, insertBefore) {

        Sui.form.TimeField.superclass.render.apply(this, arguments);

        var wrapElement = this.getWrapElement();

        // 隐藏输入框。
        this.getApplyToElement().hide();

        if(Sui.isDefinedAndNotNull(this.secondValue)){
            this.secondInfo.value = this.secondValue;
        }else{
             this.secondValue = this.secondInfo.value = this.secondInfo.value || 0;
        }
        if(Sui.isDefinedAndNotNull(this.minuteValue)){
            this.minuteInfo.value = this.minuteValue;
        }else{
            this.minuteValue = this.minuteInfo.value = this.minuteInfo.value || 0;
        }
        if(Sui.isDefinedAndNotNull(this.hourValue)){
            this.hourInfo.value = this.hourValue;
        }else{
            this.hourValue = this.hourInfo.value = this.hourInfo.value || 0;
        }

        var secondField = this.secondInfo.numberField = this.createNumberField(this.secondInfo.value);
        secondField.setMinValue(0);
        secondField.setMaxValue(59);
        if( this.secondValue >=0  && this.secondValue <= 59 ){
            secondField.setValue(this.secondValue);
        }

        var sm = $("<span></span>").prependTo(wrapElement);
        sm.html(":").addClass("separate");

        var minuteField = this.minuteInfo.numberField = this.createNumberField(this.minuteInfo.value);
        minuteField.setMinValue(0);
        minuteField.setMaxValue(59);
        if( this.minuteValue >= 0 && this.minuteValue <= 59 ){
            minuteField.setValue(this.minuteValue);
        }

        var mh = $("<span></span>").prependTo(wrapElement);
        mh.html(":").addClass("separate");

        var hourField = this.hourInfo.numberField = this.createNumberField(this.hourInfo.value);
        hourField.setMinValue(0);
        hourField.setMaxValue(23);
        if( this.hourValue >= 0 && this.hourValue <= 23 ){
            hourField.setValue(this.hourValue);
        }

        this.bindNumberFieldTableSelect(secondField, 6, 10, "second");
        this.bindNumberFieldTableSelect(minuteField, 6, 10, "minute");
        this.bindNumberFieldTableSelect(hourField, 4, 6, "hour");

        secondField.on('focus', Sui.makeFunction(this, this.onInputFocus));
        minuteField.on('focus', Sui.makeFunction(this, this.onInputFocus));
        hourField.on('focus', Sui.makeFunction(this, this.onInputFocus));

        //通过键盘上下键改变数值大小
        secondField.on('keydown',Sui.makeFunction(this,this.onInputKeyDown));
        minuteField.on('keydown',Sui.makeFunction(this,this.onInputKeyDown));
        hourField.on('keydown',Sui.makeFunction(this,this.onInputKeyDown));
    },
    /**
     * 记录最近一个聚焦的input，当input聚焦时执行
     * @mehotd  onInputFocus
     * @param {Event} event
     * @private
     */
    onInputFocus : function(event) {
        this.lastFocusInput = event.target;
    },
    /**
     * 当输入框监听到键盘按下时触发处理函数
     * @mehotd  onInputKeyDown
     * @param {Event} event
     * @private
     */
    onInputKeyDown:function(event){

        Sui.form.TimeField.superclass.onKeyDown.apply(this, arguments);

        var KEY = Sui.KEY;
        switch (event.originalEvent.keyCode) {
            case KEY.UP:
                this.onUpButtonClick();
                break;
            case KEY.DOWN:
                this.onDownButtonClick();
                break;
            case KEY.RETURN:
                //取消事件默认行为，阻止IE浏览器对enter事件的派发
                event.originalEvent.preventDefault();
                break;
            default:
                break;
        }
    },
    /**
     * 生成时间选择面板
     * @mehtod  bindNumberFieldTableSelect
     * @private
     * @param {Sui.form.NumberField} field
     * @param {Number} rows
     * @param {Number} cols
     * @param {String} fieldName
     */
    bindNumberFieldTableSelect : function(field, rows, cols, fieldName) {

//        var thisTimeField = this;
//
//        var select = new Sui.TableSelect({
//            rows : rows,
//            cols : cols,
//            startValue: 0,
//            listeners : {
//                selected : function(event) {
//                    field.setValue(event.value);
//                    selectLayer.hide();
//
//                    thisTimeField.applyValue();
//                }
//            }
//        });
//
//        var selectLayer = new Sui.Layer({
//            alignArgs: {
//                src: 'lb',
//                dest: 'lt',
//                hspan: 0,
//                vspan: 1
//            },
//            customClass : 'sui_tableselect_layer',
//            alignmentElement : field.getApplyToElement(),
//            excludeElementsClick : field.getApplyToElement(),
//            component : select
//        });
//
//        field.on("click", function() {
//            selectLayer.toggle();
//            selectLayer.alignToElement(field.getApplyToElement());
//        });

    },
    /**
     * @method createNumberField
     * @return {Sui.form.NumberField}
     */
    createNumberField : function(val) {
        return new Sui.form.NumberField({
            value : val,
            defaultClass : 'commonInput',
            renderTo : [this.wrapElement, Sui.getFirstChild(this.getWrapElement())],
            toFixed:0
        });
    },
    /**
     * 渲染组件后执行
     * @method  afterRender
     * @private
     */
    after: function() {

        var fieldNames = [this.HOUR, this.MINUTE, this.SECOND];
        for (var i = 0; i < fieldNames.length; i++) {
            var fieldName = fieldNames[i];
            this.applyFieldValue(fieldName);
        }

        this.applyTimeFormat();

        Sui.form.TimeField.superclass.afterRender.apply(this, arguments);

    },
    /**
     * 获得最外部DOM元素
     * @method  getTopElement
     * @private
     */
    getTopElement : function(){
        return this.wrapElement;
    },
    /**
     * 设置时间格式
     * @method setTimeFormat
     * @param {String} timeFormat
     *
     */
    setTimeFormat : function(timeFormat) {
        this.timeFormat = timeFormat;
        if (this.isRendered()) {
            this.applyTimeFormat();
        }

        this.applyValue();
    },
    /**
     * 设置时间格式实际执行函数
     * @method setTimeFormat
     * @private
     */
    applyTimeFormat : function() {
        if (this.isSelectMinute() || this.isSelectSecond()) {
            this.setFieldDisabled(this.MINUTE, false);
        } else {
            this.setFieldDisabled(this.MINUTE, true);
        }

        if (this.isSelectSecond()) {
            this.setFieldDisabled(this.SECOND, false);
        } else {
            this.setFieldDisabled(this.SECOND, true);
        }
    },
    /**
     * 设置时分秒时间组件失效
     * @method  setFieldDisabled
     * @param {String} fieldName
     * @param {Boolean} disabled
     */
    setFieldDisabled : function(fieldName, disabled) {
        this.getFieldInfo(fieldName).numberField.setDisabled(disabled);
    },
    /**
     * 判断当前是否在调整“时”
     * @method isSelectHour
     * @return {Boolean}
     */
    isSelectHour : function() {
        return Sui.StringUtil.contains(this.timeFormat, "h");
    },
    /**
     * 判断当前是否在调整“分”
     * @method isSelectMinute
     * @return {Boolean}
     */
    isSelectMinute : function() {
        return Sui.StringUtil.contains(this.timeFormat, "m");
    },
    /**
     * 判断当前是否在调整“秒”
     * @method isSelectSecond
     * @return {Boolean}
     */
    isSelectSecond : function() {
        return  Sui.StringUtil.contains(this.timeFormat, "s");
    },
    /**
     * 设置组件的值实际执行函数
     * @method  applyValue
     * @private
     */
    applyValue : function() {
        if (this.getApplyToElement()) {
            Sui.setValue(this.getApplyToElement(), this.formatTime());
        }
    },
    /**
     * 格式化时间，
     * 如将[12,4,0]譬如将格式化为[12,04,00]
     * @method  formatTime
     */
    formatTime : function() {
        var time = [this.getFieldValue(this.HOUR),
            this.getFieldValue(this.MINUTE),
            this.getFieldValue(this.SECOND)
        ];
        return Sui.DateUtil.formatTime(time, this.timeFormat);
    },

    /**
     * 获取组件的hourInfo、MinuteInfo、SecondInfo参数
     * @method  getFieldInfo
     * @param {String} fieldName 值为'hour'\'minute'\'second'
     * @return {Object}
     * @private
     */
    getFieldInfo : function(fieldName) {
        return this[fieldName + "Info"];
    },
    /**
     * 获取组件的某个域(时、分、秒)组件的值
     * @method  getFieldValue
     * @param {String} fieldName
     * @return {String}
     * @private
     */
    getFieldValue : function(fieldName) {
        var fieldInfo = this.getFieldInfo(fieldName);
        var field = fieldInfo.numberField;
        if (field.isRendered()) {
            return field.getValue();
        }
        return fieldInfo.value;
    },

    /**
     * 设置组件的某个域(时、分、秒)组件的值
     * @method  setFieldValue
     * @param {String} fieldName
     * @param {String} value
     * @private
     */
    setFieldValue : function(fieldName, value) {
        var fieldInfo = this.getFieldInfo(fieldName);
        fieldInfo.value = value;
        this.applyFieldValue(fieldName);

        this.setValue(this.formatTime());
    },

    /**
     * 设置某个域(时、分、秒)的值
     * @mehthod  applyFieldValue
     * @param {String} fieldName
     * @private
     */
    applyFieldValue : function(fieldName) {
        var fieldInfo = this.getFieldInfo(fieldName);
        var field = fieldInfo.numberField;
        if (field.isRendered()) {
            return field.setValue(fieldInfo.value);
        }
    },
    /**
     * 当增加按钮点击时执行
     * @method onUpButtonClick
     */
    onUpButtonClick : function() {

        if (this.lastFocusInput) {
            this.lastFocusInput.focus();
            this.lastFocusInput.addNumber(this.addValue);
        }
    },
    /**
     * 当减少按钮点击时执行
     * @method onDownButtonClick
     */
    onDownButtonClick : function() {

        if (this.lastFocusInput) {
            this.lastFocusInput.focus();
            this.lastFocusInput.addNumber(0 - this.addValue);
        }

    }

});

Sui.apply(Sui.form.TimeField, {
    HOUR : 'hour',
    MINUTE : 'minute',
    SECOND : 'second'
});
