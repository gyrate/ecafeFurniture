/**
 * 依赖sui/form/textfield.js
 */
Sui.namespace("Sui.form");

/**
 * 数字输入框
 * @class Sui.form.NumberField
 * @extends Sui.form.TextField
 * @constructor
 * @param {Object} config 配置参数
 * @param {Boolean} config.isInteger 是否要求输入值为整数
 * @param {Number} config.minValue 最小值
 * @param {Number} config.maxValue 最大值
 * @param {Number} config.toFixed 小数点后位数
 */
//通过keydown事件去判断比较麻烦，需要处理很多特殊的字符，例如各种方向键,删除键,Tab键，复制、粘贴、剪切等操作。
Sui.form.NumberField = Sui.extend(Sui.form.TextField, {
    /**
     * 是否要求输入值为整数
     * @property  isInteger
     * @type Boolean
     * @default false
     */
    isInteger : false,

    containMinValue : true,
    containMaxValue : true,
    /**
     * 最小值
     * @property  minValue
     * @type Number
     * @default null
     */
    minValue : null,
    /**
     * 最大值
     * @property  maxValue
     * @type Number
     * @default null
     */
    maxValue : null,
    /**
     * 小数点后位数
     * @property toFixed
     * @type Number
     * @default null
     */
    toFixed : null,

    listenValueChange : true,
    /**
     * 根据配置条件初始化
     * @method initConfig
     * @param {Object} config
     */
    initConfig : function(config) {

        Sui.form.NumberField.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ["isInteger", "containMinValue", "containMaxValue" ,
            "minValue", "maxValue", "toFixed"]);
    },
    
    /**
     * 设置是否是整数
     * @method setIsInteger
     * @param {boolean} isInteger
     */
    setIsInteger: function(isInteger){
        this.isInteger = isInteger;
    },
    
    /**
     * 设置最大值
     * @method setMaxValue
     * @param {Number} maxValue
     */
    setMaxValue : function(maxValue) {
        this.maxValue = maxValue;
        this.applyMaxValue();
    },
    /**              \
     * 设置最大值实际执行函数
     * @method applyMaxValue
     * @private
     */
    applyMaxValue : function() {
        if (this.getApplyToElement()) {
            var val = this.getValue();
            if (val != "") {
                val = parseFloat(val);

                val = this.checkMaxValueAndReturn(val);
                this.setValue(val);
            }
        }
    },
    /**
     * 判断当前输入框中的值是否在最大值允许的范围内，不在则修正它
     * @method  checkMaxValueAndReturn
     * @param  {Number} val
     * @return {Number}
     * @private
     */
    checkMaxValueAndReturn : function(val) {

        var value = val;
        if (Sui.isDefinedAndNotNull(this.maxValue)) {
            if (this.containMaxValue && !(value <= this.maxValue)) {
                value = this.maxValue;
            } else if (! this.containMaxValue && !(value < this.maxValue)) {
                value = (this.minValue + this.maxValue) / 2;
            }
        }
        return value;
    },
    /**
     * 设置最小值
     * @method setMinValue
     * @param {Number} minValue
     */
    setMinValue : function(minValue) {
        this.minValue = minValue;

        this.applyMinValue();
    },
    /**
     * 设置最小值的实际执行函数
     * @method  applyMinValue
     * @private
     */
    applyMinValue : function() {
        if (this.getApplyToElement()) {
            var val = this.getValue();
            if (val != "") {
                val = parseFloat(val);

                val = this.checkMinValueAndReturn(val);
                this.setValue(val);
            }
        }
    },
    /**
     * 判断当前输入框中的值是否在最小值允许的范围内，不在则修正它
     * @method  checkMinValueAndReturn
     * @param {Number} val
     * @return {Number}
     * @private
     */
    checkMinValueAndReturn : function(val) {

        var value = val;
        if (Sui.isDefinedAndNotNull(this.minValue)) {
            if (this.containMinValue && !(this.minValue <= value)) {
                value = this.minValue;
            } else if (! this.containMinValue && !(this.minValue < value)) {
                value = (this.minValue + this.maxValue) / 2;
            }
        }
        return value;
    },
    /**
     *
     * 当按键上弹时执行，判断输入输入值是否符合格式，是否在约定范围内，否则修正它
     * @method onKeyUp
     * @param {Event} e
     */
    onKeyUp : function(e) {
        Sui.form.NumberField.superclass.onKeyUp.apply(this, arguments);
        var value = this.checkChar(this.getValue());
        value = this.checkDecimalPart(value);
        value = this.checkRange(value);
        this.setValue(value);
    },
    /**
     * @method  checkDecimalPart
     * @param {Number} value
     */
    checkDecimalPart : function(value) {
        return value;
    },
    /**
     * 当失去焦点时,进行触发
     * @method  onBlur
     * @param {Event} e
     * @private
     */
    onBlur : function(e) {
        this.checkValue();
        Sui.form.NumberField.superclass.onBlur.apply(this, arguments);
    },
    /**
     * 检测值是否在最大最小范围内，格式是否正确，否则修正它
     * @method checkRange
     * @param {Number} value
     * @return  {Number}
     * @private
     */
    checkRange : function(value) {
        // 如果是空白的话,不进行检查
        if (value == "") {
            return value;
        }

        // 如果大于等于0的话,则不能包含负号
        if (Sui.isDefinedAndNotNull(this.minValue) && this.minValue >= 0) {
            value = Sui.StringUtil.removeStart(value, "-");
        }

        // 小数点后面的位数
        if(Sui.isDefinedAndNotNull(this.toFixed)){
            var index = value.indexOf(".");
            if(index >= 0){
                value = value.substring(0, index + this.toFixed + 1);
            }
        }

        // 转换成数字
        var endWithPoint = Sui.StringUtil.endsWith(value, ".");
        // 如果用户还没有输入完成,则可以是一个无效的值,例如"12."
        num = parseFloat(value);
        if (isNaN(num)) {
            return value;
        }

        if (Sui.isDefinedAndNotNull(this.minValue)) {

            if (this.containMinValue) {
                if (num < this.minValue) {
                    num = this.minValue;
                }
            } else {
                if (num <= this.minValue) {
                    num = "";
                }
            }
        }

        if (num != "" && Sui.isDefinedAndNotNull(this.maxValue)) {

            if (this.containMaxValue) {
                if (num > this.maxValue) {
                    num = this.maxValue;
                }
            } else {
                if (num >= this.maxValue) {
                    num = "";
                }
            }
        }

        // 需要还原后面的点号
        var ret = num + (endWithPoint ? "." : "");

        // 小数点后的位数保持一致
        if (! this.isInteger) {
            var decimalCount = this.calcDecimalCount(value);

            var numDecimalCount = this.calcDecimalCount(ret);
            if(decimalCount - numDecimalCount > 0){
                if(! Sui.StringUtil.endsWith(ret, ".")){
                    ret += ".";
                }
                for(var i=0; i<decimalCount - numDecimalCount; i++){
                    ret += "0";
                }
            }
        }

        return ret;
    },
    /**
     * 计算小数位数，
     * 比如：2.33, 点号的索引为1, 长度为4, 小数位2
     * @method calcDecimalCount
     * @param {Number} value
     * @return {Number}
     * @private
     */
    calcDecimalCount : function(value) {
        if(Sui.isUndefinedOrNull(value)){
            return 0;
        }

        value = value + "";
        var index = value.indexOf(".");
        if (index >= 0) {
            return value.length - index - 1;
        }
        return 0;
    },
    /**
     * 判断输入值格式是否符合要求，否则修正它
     * @method checkChar
     * @param {Mixed} value
     * @param {Number}
     * @private
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
        value = Sui.StringUtil.removeChar(value, '.', this.isInteger ? 0 : 1);

        return value;
    },
    /**
     * 在输入值改变时尝试根据约定范围修正它
     * @method checkValue
     * @private
     */
    checkValue : function() {

        var value = this.getValue();
        if (Sui.isUndefinedOrNull(value)) {
            value = "";
        }

        value = Sui.StringUtil.trim(value);
        if (value != "") {

            value = this.checkChar(value);
            value = parseFloat(value);

            value = this.checkMinValueAndReturn(value);
            value = this.checkMaxValueAndReturn(value);
        }

        this.setValue(value);

    },
    /**
     * 根据步长number改变值
     * @method addNumber
     * @param {Number} number
     */
    addNumber : function(number) {
        number = parseInt(number);

        if (this.getValue() != "") {
            number += parseFloat(this.getValue());
        }

        if (isNaN(number)) {
            number = "0";
        }

        number = Math.min(this.maxValue, Math.max(number, this.minValue));
        this.setValue(number);

    }

});

Sui.Components.register("numberField", Sui.form.NumberField);
