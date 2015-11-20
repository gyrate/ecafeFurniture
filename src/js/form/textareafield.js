/**
 * 依赖sui/form/textfield.js
 */
Sui.namespace("Sui.form");

/**
 * TextArea段落编辑器
 * @class Sui.form.TextAreaField
 * @extends Sui.form.TextField
 * @Sui.form.TextField
 * @constructor
 * @param {Object} config 配置参数
 * @param {Number} config.cols 规定文本区内的可见宽度
 * @param {Number} config.rows 规定文本区内的可见行数
 **/
//通过keydown事件去判断比较麻烦，需要处理很多特殊的字符，例如各种方向键,删除键,Tab键，复制、粘贴、剪切等操作。
Sui.form.TextAreaField = Sui.extend(Sui.form.TextField, {

    applyToTagName : '<textarea></textarea>',
    rows:4,
    cols:30,
    customClass : '',
    /**
     * 根据参数进行初始化配置
     * @method  initConfig
     * @param {Object} config
     */
    initConfig : function(config) {

        Sui.form.TextAreaField.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ["rows", "cols"]);
    },
    /**
     * 组件渲染后执行
     * @method  afterRender
     *
     */
    afterRender : function() {
        Sui.form.TextAreaField.superclass.afterRender.apply(this, arguments);
        this._applyRows();
        this._applyCols();
    },
    /**
     * 设置组件rows属性
     * @method  setRows
     * @param {Number} rows
     */
    setRows:function(rows){
        this.rows = rows;
        this._applyRows();
    },
     /**
      * 修改组件textarea的高度
      * @method  _applyRows
      * @private
      */
    _applyRows:function(){
        if (this.getApplyToElement()) {
            if (Sui.isDefined(this.rows)) {
                this.getApplyToElement().attr('rows',this.rows);
            }
        }
    },
    /**
     * 设置组件cols属性
     * @method setCols
     * @param {Number} config
     */
    setCols:function(cols){
        this.cols = cols;
        this._applyCols();
    },
    /**
     * 修改组件textarea的宽度
     * @method  _applyCols
     * @private
     */
    _applyCols:function(){
        if (this.getApplyToElement()) {
            if (Sui.isDefined(this.cols)) {
                this.getApplyToElement().attr("cols",this.cols);
            }
        }
    }
});

Sui.Components.register("textAreaField", Sui.form.TextAreaField);
