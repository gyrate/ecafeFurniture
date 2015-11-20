/**
 * ==========================================================================================
 * 日期组件
 * ==========================================================================================
 */
Sui.namespace("Sui.form");
/**
 * 为表格组件而设计的日期选择组件，应该考虑用Sui.Datepicker将其替换掉
 * @class  Sui.form.DateField
 * @extends  Sui.form.TriggerField
 * @constructor
 * @param {Object} config 参数配置，参考Sui.form.TriggerField
 */
Sui.form.DateField = Sui.extend(Sui.form.TriggerField, {

    layerClass : 'sui_datefield_layer',
    iconClass : 'datefield_trigger_icon',
    readOnly : false,
	editable : false,
    /**
     * 设置日期格式
     * @method  setDateFormat
     * @param {String} dateFormat
     */
    setDateFormat : function(dateFormat) {
        this.dataView.setDateFormat(dateFormat);
    },
    /**
     * 获取日期格式
     * @method  getDateFormat
     * @return {String}
     */
    getDateFormat : function() {
       return  this.dataView.getDateFormat();
    },
    /**
     * 根据配置参数初始化
     * @method initConfig
     * @param {Object} config
     * @private
     */
    initConfig : function(config) {
        Sui.form.DateField.superclass.initConfig.apply(this, arguments);
        if(Sui.isUndefinedOrNull(this.dataView)){
            this.dataView = this.createDataView(config);
        }
    },
    /**
     * 创建数据选择器
     * @method  createDataView
     * @param {Object} config
     * @private
     */
    createDataView : function(config){
        var dateConfig = Sui.applyProps({}, config, ["dateFormat"]);
        if(Sui.isDefinedAndNotNull(config.value)){
            dateConfig.currentDate = config.value;
        }

        var dateComponent =  new Sui.Date(dateConfig);
        dateComponent.on("selected", Sui.makeFunction(this, this.onDateSelected));
        return dateComponent;
    },
    /**
     * 当数据选择时执行
     * @method  onDateSelected
     * @param {Object} event
     * @private
     */
    onDateSelected : function(event) {

        var date = event.value;
        this.setValue(date);
        this.collapse();
        //this.fireEvent('selected', event);
        //父类TriggerField会监听dataView并自动派发selected事件，无需再派发一次
    },
    /**
     * 渲染后执行
     * @method afterRender
     * @private
     */
    afterRender : function() {

        Sui.form.DateField.superclass.afterRender.apply(this, arguments);
        if(this.name){
        	this.getApplyToElement().attr("name", this.name);
        }

    },
	
	/**
     * 将组件状态设置为只读
     * @method  applyReadOnly
     */
    applyReadOnly : function() {
        Sui.form.DropList.superclass.applyReadOnly.apply(this, arguments);

        if (this.isReadOnly()) {
            this.getWrapElement().addClass("sui_trigger_readonly");
        } else {
            this.getWrapElement().removeClass("sui_trigger_readonly");
        }

        // 只读的话，则隐藏图标
        this.getIconElement().toggle(! this.isReadOnly());

        // 不准获取焦点
        if (this.isReadOnly()) {
            this.getApplyToElement().bind("focus", Sui.blurOnFocus);
        } else {
            this.getApplyToElement().unbind("focus", Sui.blurOnFocus);
        }
    },
	
    /**
     * 为组件赋值
     * @method setValue
     * @param {String,Date} val
     */
    setValue:function(val){

        var date,
            format = this.getDateFormat();
        if( Sui.isString(val) && val !== '' ){
            date = Sui.DateUtil.convertStrToDate(val,format);
        }else if( val instanceof Date){
            date = val;
        }else if(val == ''){
            this.dataView.currentDate.setDate(1) ; //setDate返回数据为UTC格式不能用
            date = this.dataView.currentDate;
        }else{
            date = new Date();
        }
        this.value = (val =='')? '': Sui.DateUtil.format(date,format);
        this.applyValue();
        this.dataView.setCurrentDate(date);
    }

});
