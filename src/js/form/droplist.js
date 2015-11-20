Sui.namespace("Sui.form");

/**
 * Sui.form.Droplist中的dataView必须实现的接口。
 * 下拉菜单的选择面板可以是list组件、树、颜色选择器等等，这些面板都必须能够实现该接口所规定的功能。
 * @class Sui.form.DropListInterface
 * @static
 */
Sui.form.DropListInterface = {

    filter : Sui.emptyFn,
    clearFilter : Sui.emptyFn,
    selectPrev  : Sui.emptyFn,

    /**
     * 在搜索之后,设置默认选中的元素
     */
    selectDefaultElementAfterQuery : Sui.emptyFn,
    setDefaultSelect : Sui.emptyFn,
    onViewClick  : Sui.emptyFn,
    selectNext  : Sui.emptyFn,
    enableListItems : Sui.emptyFn,
    disabledAllListItems : Sui.emptyFn,

    checkDataView : function(dataView) {

        var funcArray = ["filter", "selectPrev", "setDefaultSelect", "onViewClick", "selectNext"];
        for (var i = 0; i < funcArray.length; i++) {
            var funcName = funcArray[i];
            var func = dataView[funcName];
            if (func) {
                if (Sui.isFunction(func)) {
                    // 不处理
                } else {
                    throw new Error("Sui.form.ComboBox中的DataView组件的" + funcName + "属性必须是一个函数。");
                }
            } else {
                // 使用默认的函数
                dataView[funcName] = this[funcName];
            }
        }
    }
};
/**
 * 采用何种方式触发选择层，
 * 可选择CLICK_MODE（点击）或KEY_MODE（键盘敲击）两种模式
 * @class Sui.form
 * @static
 * @property DroplistMode
 * @type Object
 */
Sui.form.DroplistMode = {
    CLICK_MODE : 'CLICK_MODE',
    KEY_MODE : 'KEY_MODE'
};

Sui.data.RemoteStore = Sui.extend(Sui.data.Store, {

    url : "",
    data:null,
    dataType:'json',
    type:'GET',

    constructor : function(config){
        Sui.data.RemoteStore.superclass.constructor.call(this, config);
        Sui.applyProps(this, config, ['url','data','dataType','type']);
        this.loadDatas();
    },

    loadDatas : function(){
        var thisStore = this;
        Sui.getJsonData({
            url:this.url,
            data:this.data,
            dataType:this.dataType,
            type:this.type
        }, function(datas){
            thisStore.initDatas(datas);
            thisStore.fireEvent("loaded", {});
        },function(responText){
            thisStore.fireEvent("fail", responText);
        });
    }

});

/**
 * 别名Sui.form.ComboBox（为兼容旧版）
 * 下拉单选菜单组件,采用Sui.form.List，来进行选择。
 * 如果希望能够滚动List，必须设置List的大小，高度不能设置为auto。
 * 待处理问题：不监听Store删除Record。Store删除Record,又添加Record,应该如何处理.
 * @class Sui.form.DropList
 * @extends Sui.form.TriggerField
 * @constructor
 * @param {Object} config 配置参数
 * @param {Array} config.items 组件的数据源
 * @param {String} config.applyTo 要替换的元素Id
 * @param {String} config.labelField  服务器输出的数据中与描述值对应的属性名
 * @param {String} config. 	valueField  服务器输出的数据中与实际值对应的属性名
 * @param {String} config.displayValueField  服务器输出的数据中与输入框显示的值对应的属性名
 * @param {String} config.name 提交表单时所对应的属性名
 * @param {String} config.value 提交表单时的值
 * @param {Number} config.comboMaxHeight 下拉选择框最大高度
 * @param {Boolean} config.forceSelect  是否强制选择选项内的值，非选项内的值不能提交，默认为true
 * @param {Boolean} config.hideIconElement  是否隐藏组件触发选择层按钮，默认为false
 * @param {String} config.url 通过异步方式获得初始化数据，此时url为请求地址
 * @param {String} config.searchUrl  支持ajax搜索时，数据请求地址，通过GET方式传递关键词返回数据
 */
Sui.form.ComboBox =
Sui.form.DropList = Sui.extend(Sui.form.TriggerField, {

    /**
     * 组件对应的数据源
     * @property store
     * @type Sui.data.Store
     * @default null
     */
    store : null,

    /**
     * 服务器数据中与List组件选项描述值对应的属性名，比如服务器输出的初始化数据为
     * [{user:'张三',id:'0001',desc:'张三(编号0001)'},{user:'李四',id:'0002',desc:'李四(编号0002)'}]，
     * 则List组件对应的labelField为'user'
     * @property  labelField
     * @type String
     * @default "label"
     */
    labelField : 'label',
    /**
     * 服务器数据中与List组件选项实际对应的属性名，比如服务器输出的初始化数据为
     * [{user:'张三',id:'0001',desc:'张三(编号0001)'},{user:'李四',id:'0002',desc:'李四(编号0002)'}]，
     * 则List组件对应的valueField为'user'
     * @property  labelField
     * @type String
     * @default "label"
     */
    valueField : 'value',
    /**
     * 服务器数据中与List组件选项实际对应的属性名，比如服务器输出的初始化数据为
     * [{user:'张三',id:'0001',desc:'张三(编号0001)'},{user:'李四',id:'0002',desc:'李四(编号0002)'}]，
     * 则List组件对应的displayValueField为'desc'
     * @property  labelField
     * @type String
     * @default "label"
     */
    displayValueField : 'displayValue',

    initValue : null,
    initLabel : null,
    initIndex : null,

    tbuttons : null,

    createHiddenElement : true,
    /**
     * 是否强制选择选项内的值，非选项内的值不能提交
     * @property isForceSelect
     * @type Boolean
     * @default true
     */
    forceSelect:true,
    /**
     * 默认采用点击模式
     * @property mode
     * @type String
     * @default
    */
    mode : Sui.form.DroplistMode.CLICK_MODE,

    /**
     * 下拉选择的值与输入框显示的值是否分离；
     * 当enableDisplayValue设置为true时，会打开一种模式：
     * 比如下拉菜单中选项的描述值为“李四(编号0002)”，实际值为'0002',一旦选择该项
     * 则input框出现的值为“李四“
     * @property  enableDisplayValue
     * @type Boolean
     * @default false
     */
    enableDisplayValue : false,

    /**
     * 是否启用搜索功能
     * @property searchable
     * @type Boolean
     * @default true
     *
     */
    searchable : true,
    /**
     * 执行查询延迟时间
     * @property queryDelay
     * @type Number
     * @default 10
     */
    queryDelay : 10,
    lastQuery : null,

    /**
     * 是否自动调整宽度和高度.
     * 如果内容小于最小宽度,则调小宽度. 如果超过最小宽度,则调大元素的宽度.
     * 如果内容小于最大高度,则调小高度. 如果超过最大高度,则显示滚动条.
     * @property   autoAdjustSize
     * @type Boolean
     * @default true
     */
    autoAdjustSize : true,
    /**
     * 是否初始化的时候隐藏所有选项
     * @property initDisabledAll
     * @type Boolean
     * @default false
     */
    initDisabledAll : false,
    /**
     * 外层layer高度是否为auto
     * @property  layerAutoHeight
     * @type Boolean
     * @default false
     */
    layerAutoHeight : false,
    /**
     * 输入框可以编辑时，
     * 输入框中的值和真正的值可能不匹配。是否需要强制进行匹配。
     * @property forceSelect
     * @type Boolean
     * @default true
     */
    forceSelect : true,
    /**
     * 是否显示清空按钮
     * @property  emptyToClear
     * @type Boolean
     * @default false
     */
    emptyToClear : false,
    /**
     * 下拉菜单最外层样式
     * @property  layerClass
     * @type String
     * @default 'sui_combo_layer'
     */
    layerClass : 'sui_combo_layer',
    /**
     * 下拉选择框最大高度
     * @property comboMaxHeight
     * @type Number
     * @dafault null
     */
    comboMaxHeight : null,
    /**
     * 是否隐藏组件触发选择层按钮
     * @property
     * @type Boolean
     * @default false
     */
    hideIconElement:false,
    /**
     * 支持ajax搜索时，数据请求地址
     * @property searchUrl
     * @type String
     * @default null
    **/
    searchUrl:null,

    comboListClass : 'sui_combo_list',
    comboItemClass :  'sui_combo_item',
    comboItemOverClass : 'sui_combo_itemOver',
    comboItemSelectedClass : 'sui_combo_itemSelected',
    /**
     * 在IE浏览器是否需要使用iframe方法将layer的z轴层级提高，高于视频控件 ，该参数只对IE有效
     * @property  needIframeInIE
     * @type {Boolean}
     * @default false
     */
    needIframeInIE:false,
    /**
     * 根据配置参数进行初始化
     * @method  initConfig
     * @param {Object} config
     * @private
     */
    initConfig : function(config) {

        if (Sui.isArray(config)) {
            config = {
                items : config
            };
        }

        Sui.form.DropList.superclass.initConfig.call(this, config);

        Sui.applyProps(this, config, [ "sortable", "name", "valueField", "labelField", "displayValueField",
            "initLabel",  "initIndex", "initValue", "initDisabledAll",
            "searchable", "layerAutoHeight", "autoAdjustSize", "comboListClass",
            "comboItemClass", "comboItemOverClass","hideIconElement",
            "comboItemSelectedClass", "forceSelect", "comboMaxHeight", "emptyToClear", "enableDisplayValue","forceSelect", "tbuttons","needIframeInIE","searchUrl"]);

        // 创建搜索相关的查询任务
        this.queryDelay = Math.max(this.queryDelay, 10);
        this.dqTask = new Sui.util.DelayedTask(this.initQuery, this);

        if (config.store) {
            this.store = config.store;
        }else if(config.url){
        	this.store = new Sui.data.RemoteStore({
        		url : config.url
        	});
        	
        	this.initRemoteLoadEvent();
        	
        } else {
            if (config.items) {
                if (config.items.length > 0 && (Sui.isString(config.items[0]) || Sui.isNumber(config.items[0]) )) {
                    config.items = this.convertStringArrayToItemArray(config.items);
                }
            }

            this.store = new Sui.data.Store(config.items);
        }
        this.initialStore = this.store;

        this.autoJudgeIfEnableDisplayValue();

        if (config.sort) {
            this.store.setSortInfo({
                sortDesc : 'asc',
                fieldName : this.labelField
            })
        }

        if (config.dataView) {
            this.setDataView(config.dataView);
        }

    },
    /**
      * 渲染后执行
     * @method afterRender
     * @private
     */
    afterRender : function() {
        Sui.form.DropList.superclass.afterRender.apply(this, arguments);

        if(!!this.hideIconElement){
            this.iconElement.width(0).hide();
            this.applyWidth();
        }
    },
    /**
     * 获得属性enableDisplayValue的值
     * @method  getEnableDisplayValue
     * @return Boolean
     */
    getEnableDisplayValue : function(){
        return this.enableDisplayValue;
    },
    /**
     * 设置属性 setEnableDisplayValue的值
     * @method  setEnableDisplayValue
     * @param enableDisplayValue
     */
    setEnableDisplayValue : function(enableDisplayValue){
        this.enableDisplayValue = enableDisplayValue;
    },
    /**
     * 如果服务器输出的数据中存在displayValueField的值对应的属性，则将enableDisplayValue设置为true
     * @method autoJudgeIfEnableDisplayValue
     */
    autoJudgeIfEnableDisplayValue : function(){
        if(this.store && this.store.getCount() > 0){
            var isAllExist = true;
            for(var i =0; i<this.store.getCount(); i++){
                var record = this.store.getRecord(i);
                if(! record.existField(this.displayValueField)){
                    isAllExist = false;
                    break;
                }
            }

            if(isAllExist){
                this.setEnableDisplayValue(true);
                Sui.logFormat("Combobox(id={0})的enableDisplayValue属性的值为true", this.getComponentId());
            }
        }
    },
    /**
     * 获得属性 forceSelect的值
     * @method  isForceSelect
     * @return Boolean
     */
    isForceSelect : function(){
        return this.forceSelect;
    },
    /**
     * 获得组件的数据源
     * @method getStore
     * @return Sui.data.Store
     */
    getStore : function(){
        return this.store;
    },

    /**
     * 初始化远程数据加载
     * @method initRemoteLoadEvent
     * @private
     */
    initRemoteLoadEvent : function(){
        var thisCombo = this;
        this.store.addListener("loaded", function(){
        	thisCombo.initStateAfterLoaded();
        });
    },
    /**
     * 如果初始化数据靠ajax获取，当数据加载完成时更新组件的值
     * @method initStateAfterLoaded
     * @private
    **/
    initStateAfterLoaded : function(){
    	if(this.isRendered()){
    		this.applyValue();
    	}
    },
    /**
     * 异步加载数据后更新组件
     * @method updateListAfterSearch
    **/
    updateListAfterSearch:function(){
        this.dataView.store = this.store;
        this.dataView.updataComponents();
    },
    /**
     * 失去焦点后,输入框的内容为空的话,需要将其值删除.
     * @method onBlur
     * @private
     */
    onBlur : function() {
        // 注意: 这里先要处理焦点问题,再调用父类的方法触发blur事件.
        if(! this.isReadOnly()){
            this.fixValueWhenBlur();
        }
        Sui.form.DropList.superclass.onBlur.apply(this, arguments);
    },
    /**
     * 当失去焦点时，执行修正输入框里的值
     * @method  fixValueWhenBlur
     */
    fixValueWhenBlur: function () {
    	var newLabel = this.getApplyToElement().val();
        if (newLabel == "") {
        	this.setValue("");
        } else if (Sui.isString(this.searchUrl)) {
            if(this.isForceSelect()){
                //如无匹配，置空；否则选择第一个
                if(this.store.getCount() == 0){
                    this.setValue("");
                }else{
                    var _v = this.store.getRecord(0).getFieldValue(this.valueField);
                    this.setValue(_v);
                }
            }else{
                this.setValue(newLabel);
            }
        } else {
            var label = this.findLabelByValue();
            // 如果value和label不匹配
            if (label != newLabel) {
                if(this.isForceSelect()){
                    // 还原之前的值
                    this.applyValue();
                }else {
                	// 从下拉列表中查找,如果有匹配的,则选中匹配的;否则设置一个新的值.
                	if(this.existLabelInStore(newLabel)){
                		this.setValue(this.findValueByLabelInStore(newLabel));
                	}else {
                		this.setValue(newLabel);
                	}
                }
            }
        }
    },
    /**
     * 将字符串的数组转换为对象数组
     * @method  convertStringArrayToItemArray
     * @param Array
     */
    convertStringArrayToItemArray : function(array) {
        var ret = [];
        Sui.each(array, function(item) {
            ret.push({
                value : item,
                label : item
            });
        });
        return ret;
    },
    /**
     * 设置DropList的数据选择组件dataView
     * @method setDataView
     * @param {Mixed} dataView
     */
    setDataView : function(dataView) {
        this.dataView = dataView;
        Sui.form.DropListInterface.checkDataView(dataView);
    },
    /**
     * 获取DropList的数据选择组件dataView
     * @method getDataView
     * @returns {Mixed}
     */
    getDataView : function() {
        if (! this.dataView) {
            this.dataView = this.createDefaultDataView();
        }
        return this.dataView;
    },
    /**
     *  创建默认的数据选择组件，默认数据选择组件类型为Sui.List
     *  @method  createDefaultDataView
     */
    createDefaultDataView : function() {

        this.dataView = new Sui.List({
            emptyToClear : this.emptyToClear,
            store : this.store,
            initDisabledAll : this.initDisabledAll,
            labelField : this.labelField,
            valueField : this.valueField,
            customClass : this.comboListClass,
            itemClass : this.comboItemClass,
            itemOverClass : this.comboItemOverClass,
            itemSelectedClass: this.comboItemSelectedClass,
            tbuttons : this.tbuttons
        });

        return this.dataView;

    },
    /**
     * 更新数据源
     * @method setStore
     * @param {Array} newData
     */
    setStore:function(newData){

        this.dataView.store.clear();
        for (var i = 0,len = newData.length; i < len; i++) {
            this.dataView.store.addRecordData(newData[i]);
        }

        this.store = new Sui.data.Store(newData);
        this.setSelectedIndex(0);
    },
    /**
     * 将当前组件所有子项中与指定fieldName值匹配的项设置为enable, 其余的设置为disabled
     * @method enableListItems
     * @param {String} str
     * @param {String} fieldName
     */
    enableListItems : function(str, fieldName) {
        this.getDataView().enableListItems.apply(this.getDataView(), arguments);
    },
    /**
     * 令所有选项失效
     * @method  disabledAllListItems
     *
     */
    disabledAllListItems : function() {
        this.getDataView().disabledAllListItems.apply(this.getDataView(), arguments);
    },
    /**
     * 如果输入值非法，将其清空
     * @method clearValueIfValid
     */
    clearValueIfValid : function() {
        var curVal = this.getValue();

        var shouldClear = true;
        for (var i = 0; i < this.store.getCount(); i++) {
            var record = this.store.getRecord(i);
            var val = record.getFieldValue(this.valueField);
            if (val == curVal) {
                shouldClear = false;
                break;
            }
        }

        if (shouldClear) {
            this.clearValue();
        }
    },
    /**
     * 将组件值置为""
     * @method  clearValue
     */
    clearValue : function() {
        this.setValue("");
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
     * 设置是否可搜索
     * @method  setSearchable
     * @param {Boolean} searchable
     */
    setSearchable : function(searchable) {
        this.searchable = searchable;
        this.setReadOnly(false);
        this.clearQuery();
    },
    /**
     * 设置 是否强制选项
     * @method setForceSelect
     * @param {Boolean} force
    **/
    setForceSelect:function(force) {
        this.forceSelect = force;
    },
    /**
     * 设置第index个选项被选中
     * @method  setSelectedIndex
     * @param {Number} index
     */
    setSelectedIndex : function(index) {
        var record = this.store.getRecord(index);
        if (record) {
            this.getApplyToElement().val(record.getFieldValue(this.getEnableDisplayValue() ? this.displayValueField : this.labelField));
            this.getHiddenElement().val(record.getFieldValue(this.valueField));
            // 如果不设置值,在失去焦点时,会清空当前值
            this.value = record.getFieldValue(this.valueField);
        }
    },
    /**
     * 判断store是否存在labelField对应属性值为label的数据
     * @method existLabelInStore
     * @param {String} label
     * @return {Boolean}
     */
    existLabelInStore : function(label){
        if(this.store){
            var record = this.store.findRecordByNameValue(this.labelField,
                label);
            return !!record;
        }
        return false;
    },
    /**
     * 判断store中是否存在valueField值为val
     * @method  existValueInStore
     * @param {String} val
     * @return {Boolean}
     */
    existValueInStore : function(val){
       if(this.store){
           var record = this.store.findRecordByNameValue(this.valueField,
               val);
           return !!record;
       }
        return false;
    },
    /**
     * 通过组件的value值找到对应的label值
     * @method findLabelByValue
     * @return {String}
     */
    findLabelByValue : function() {
        var label = "";
        if (this.store) {

            label = this.getEnableDisplayValue() ? this.findDisplayValueInStore(this.value) : this.findLabelInStore(this.value);

            if(! label){
                // 不强制选择的话,则等于用户输入的值
                if(! this.isForceSelect()){
                     label = this.value;
                }
            }
        }

        return label;
    },
    /**
     * 再store中查找displayValueField对应属性值为val的数据
     * @method findDisplayValueInStore
     * @param {String} val
     * @return {Mixed}
     */
    findDisplayValueInStore : function(val){
        return this.findFieldByValueInStore(val, this.displayValueField);
    },

    /**
     * 再store中查找labelField对应属性值为val的数据
     * @method  findLabelInStore
     * @param {String} val
     * @returns {Mixed}
     */
    findLabelInStore : function(val) {
        return this.findFieldByValueInStore(val, this.labelField);
    },
    /**
     * 在store中查找并返回valueField对应属性值为val的数据，其所对应的某个属性值。
     * 举例说明
     *
     * @method findFieldByValueInStore
     * @param {String} val
     * @param {String} fieldName
     * @returns {String}
     */
    findFieldByValueInStore : function(val, fieldName) {

        var record = this.store.findRecordByNameValue(this.valueField,
            val);
        if (record) {
            return record.getFieldValue(fieldName);
        }
        return "";
    },
    /**
     * 在store中查找并返回labelField对应属性值为val的数据，其所对应的valueField值。
     * @method  findValueByLabelInStore
     * @param {String} label
     * @returns {String}
     */
    findValueByLabelInStore : function(label){
        var record = this.store.findRecordByNameValue(this.labelField,
            label);
        if (record) {
            return record.getFieldValue(this.valueField);
        }
        return "";
    },
    /**
     * 显示数据选择层后执行,作用为调节尺寸和定位
     * @method  afterShowLayer
     * @private
     */
    afterShowLayer : function() {

        if (this.autoAdjustSize) {
            this.getDataView().adjustSizeByContent({
                minWidth : this.getTopElement().width(),
                maxHeight : this.comboMaxHeight
            });
        }
        this.getLayer().alignToAndShow(this.getAlignElement());
    },
    /**
     * 初始化数据
     * @method applyInitData
     *
     */
    applyInitData : function() {
        if (Sui.isDefinedAndNotNull(this.initIndex) && this.initIndex != -1) {
            this.setSelectedIndex(this.initIndex);
        } else {
            if(Sui.isDefinedAndNotNull(this.initValue)){
                if(this.existValueInStore(this.initValue)){
                    this.value = this.initValue;
                }else if(! this.isForceSelect()){
                    this.value = this.initValue;
                }
            }
            this.applyValue();
        }
    },
    /**
     * 键盘按下时执行
     * @method onKeyDown
     * @param {Event} event
     * @private
     */
    onKeyDown : function(event) {

        this.mode = Sui.form.DroplistMode.KEY_MODE;

        Sui.form.DropList.superclass.onKeyDown.apply(this, arguments);

        if (this.isReadOnly()) {
            return;
        }

        var KEY = Sui.KEY;
        switch (event.keyCode) {
            case KEY.UP:
                Sui.log("UP keydown");
                this.selectPrev();
                break;
            case KEY.DOWN:
                Sui.log("DOWN keydown");
                this.selectNext(true);
                break;
            case KEY.RETURN:
                Sui.log("RETURN keydown");
                if (this.forceSelect) {
                    this.onViewClick();
                } else{
                    this.onBlur();
                    this.collapse();
                    this.getApplyToElement().blur();
                    this.fireEvent('inputComplete',event)
                }
                break;
            case KEY.ESC:
                Sui.log("ESC keydown");
                this.collapse();
                break;
        }
    },
    /**
     * 键盘弹起时执行
     * @method onKeyUp
     * @param {Event} event
     * @private
     */
    onKeyUp : function(event) {

        this.mode = Sui.form.DroplistMode.KEY_MODE;

        Sui.form.DropList.superclass.onKeyUp.apply(this, arguments);
        if (this.searchable) {
            if (! Sui.KEY.isSpecialKey(event.keyCode)) {
                this.dqTask.delay(this.queryDelay);
            }
        }
    },
    /**
     * 初始化延迟查询功能
     * @method  initQuery
     * @private
     */
    initQuery : function() {
        this.doQuery(this.getDisplayValue());
    },
    /**
     * 清除延迟查询任务
     * @method  clearQuery
     * @private
     */
    clearQuery : function() {
        this.lastQuery = null;
        this.dataView.clearFilter();
    },
    /**
     * 点击展开的图标，设置模式为点击模式
     * @method onTrigger
     * @private
     */
    onTrigger : function() {
        this.mode = Sui.form.DroplistMode.CLICK_MODE;
        Sui.form.DropList.superclass.onTrigger.apply(this, arguments);
    },

    /**
     * 在搜索后显示Layer。
     * 因为搜索会延迟进行。在搜索前将面板关闭了，搜索仍会进行，在搜索完成之后，这时会导致面板再次打开。
     * @method  doQuery
     * @param {String} q 搜索关键词
     */
    doQuery : function(q) {

        if (q === undefined || q === null) {
            q = '';
        }

        if (this.lastQuery == null || this.lastQuery !== q) {
            this.lastQuery = q;

            if(this.searchUrl){
                if (q !== '') {
                    var thisCombo = this;
                    this.store = new Sui.data.RemoteStore({
                        //Store.getJsonData方法为GET
                        url :  this.searchUrl ,
                        data: {ky:q} ,
                        type:'POST'
                    });
                    this.toggleLoading(true);
                    this.store.addListener("loaded", function() {
                        thisCombo.updateListAfterSearch();
                        thisCombo.toggleLoading(false);
                    });
                    this.store.addListener("fail",function(event){
                        thisCombo.toggleLoading(false);
                        thisCombo.fireEvent("ajaxSearchFail", event);
                    });
                }else{
                    this.store = this.initialStore;
                    this.updateListAfterSearch();
                }
            }else{
                var dataView = this.getDataView();
                dataView.filter(q, this.labelField);
                // 让dataView默认选中第一个
                dataView.selectDefaultElementAfterQuery();
            }

        }

        // 当前组件没有焦点的话,则不要再自动显示Layer
        if(this.isFocus()){
            this.showLayer();
        }

    },
    /**
     * 显示|隐藏数据加载效果
     * @method toggleLoading
     * @param {Boolean} show
     * @private
    **/
    toggleLoading:function(show) {
        this.getTopElement().toggleClass('sui_trigger_loading', show);
    },
    /**
     * 判断组件是否处于焦点中
     * @method isFocus
     * @returns {Boolean}
     */
    isFocus : function(){
        var isFocus = this.getApplyToElement()[0] == document.activeElement;
        //如果当前聚焦元素为组件的excludeElements，也算组件isFocus为true
        var excludeElement =  this.layer.excludeElementsClick || [];
        for (var i = 0,len = excludeElement.length; i < len; i++){
            if( excludeElement[i][0]  == document.activeElement ){
                isFocus = true;
                break;
            }
        }
        Sui.logFormat("下拉组件(componentId={0})" + (isFocus ? "具有焦点" : "没有焦点"), this.getComponentId() );
        return isFocus;
    },
    /**
     * 选择当前选中项的前一个项
     * @method  selectPrev
     *
     */
    selectPrev : function() {
        if (this.isExpanded()) {
            this.getDataView().selectPrev();
        }
    },
    /**
     * 选择当前选中项的后一个项
     * @method  selectNext
     * @param {Boolean} force
     */
    selectNext : function(force) {

        if (force) {
            this.expand();
        }

        if (this.isExpanded()) {
            this.getDataView().selectNext();
        }
    },
    /**
     * 当选项层被点击时执行
     * @method onViewClick
     * @private
     */
    onViewClick : function() {
        if (this.isExpanded()) {
            this.getDataView().onViewClick();
        }
    },
    /**
     * 展开选项层
     * @method  expand
     */
    expand : function() {
        if (this.searchable) {
            // 先查询，查询完之后进行显示。
            if (this.mode == Sui.form.DroplistMode.KEY_MODE) {
                this.initQuery();
            } else {
                this.clearQuery();
                this.showLayer();
            }
        } else {
            this.showLayer();
        }
    },
    /**
     * 折叠选项层
     * @method collapse
     *
     */
    collapse : function() {
        Sui.form.DropList.superclass.collapse.apply(this, arguments);
        this.getDataView().setDefaultSelect();
    },
    /**
     * 销毁DropList的浮动选择层
     * @method destroy
     */
    destroy: function () {

        Sui.form.DropList.superclass.destroy.apply(this, arguments);

        var dataView = this.getDataView();
        if(Sui.isDefinedAndNotNull(dataView)){
            dataView.destroy();
        }
    } ,
    /**
     * 设置组件的值，
     * hiddenElement和input是关联的
     * @method  setValue
     * @param {String} val
     */
    setValue : function(val) {

        if (this.isRendered()) {
            this.value = val;
            var displayValue = this.findLabelByValue();
            if (displayValue !== '') {
                this.getApplyToElement().val(displayValue);
            } else {
                this.value = '';
                this.getApplyToElement().val('');
            }

            if (this.createHiddenElement) {
                this.getHiddenElement().val(this.value);
            }
        }
    }

});

/**
 * 多选下拉框。
 * 多选下拉框的输入框不可编辑.
 * @class Sui.form.MultiDropList
 * @extends  Sui.form.DropList
 * @constructor
 * @param {Object} config 配置参数
 * @param {Array} config.items 组件的数据源
 * @param {String} config.applyTo 要替换的元素Id
 * @param {String} config.labelField  服务器输出的数据中与描述值对应的属性名
 * @param {String} config. 	valueField  服务器输出的数据中与实际值对应的属性名
 * @param {String} config.name 提交表单时所对应的属性名
 * @param {String} config.value 提交表单时的值
 * @param {Boolean} config.searchable 是否可搜索，默认为false
 * @param {Boolean} config.createHiddenElement 是否创建用于提交表单的<input type="hidden">标签,默认为true
 * @param {Number} config.panelWidth 下拉面板宽度，默认为null，搜索模式下默认为360
 * @param {Number} config.itemWidth  已选区域和待选区域选项的宽度，该参数只在searchable为true的模式下生效，默认为100
 */
Sui.form.MultiComboBox = Sui.form.MultiDropList = Sui.extend(Sui.form.DropList, {

    /**
     * 是否创建用于提交表单的<input type="hidden">标签
     * @property createHiddenElement
     * @type Boolean
     * @default false
     */
    createHiddenElement : false,
    /**
     * 是否可搜索
     * @property searchable
     * @type Boolean
     * @default false
     */
    searchable : false,
    
    /**
     * 是否可编辑
     * @property editable
     * @type Boolean
     * @default false
     */
    editable : false,
    
    /**
     * 是否自动调整宽度和高度.
     * 如果内容小于最小宽度,则调小宽度. 如果超过最小宽度,则调大元素的宽度.
     * 如果内容小于最大高度,则调小高度. 如果超过最大高度,则显示滚动条.
     * @property   autoAdjustSize
     * @type Boolean
     * @default false
     */
    autoAdjustSize : false,
    /**
     * 输入框可以编辑时，
     * 输入框中的值和真正的值可能不匹配。是否需要强制进行匹配。
     * @property forceSelect
     * @type Boolean
     * @default false
     */
    forceSelect : false,
    /**
     *  已选区域和待选区域选项的宽度，该参数只在搜索模式下生效，默认为100
     *  @property itemWidth
     *  @type Number
     *  @default 100
     */
    itemWidth:null,
    /**
     * 下拉面板宽度，默认为null，搜索模式下默认为360
     * @method  panelWidth
     * @type Number
     * @default 360
     */
    panelWidth:null,
    /**
     * 根据配置参数进行初始化
     * @method  initConfig
     * @param {Object} config
     * @private
     */
    initConfig : function(config) {

        Sui.form.MultiDropList.superclass.initConfig.call(this, config);
        Sui.applyProps(this, config, [ "panelWidth" ]);

    },
    /**
     * 渲染组件
     * @method render
     * @private
     */
    render : function() {
        Sui.form.MultiDropList.superclass.render.apply(this, arguments);
        this.valueSet = $("<div style='display:none'></div>").appendTo(this.getWrapElement());
    },
    /**
     * 渲染后执行
     * @method afterRender
     */
    afterRender:function(){
        Sui.form.MultiDropList.superclass.afterRender.apply(this,arguments);

        this.getApplyToElement().attr('readonly',true);
    },
    /**
     * 创建默认的数据选择组件dataView，默认为Sui.MultiList
     * @method createDefaultDataView
     * @return {Mixed}
     * @private
     */
    createDefaultDataView : function() {

        if(this.searchable){
            this.dataView = new Sui.ExMultiList({
                store: this.store,
                labelField : this.labelField,
                valueField : this.valueField,
                itemClass : this.comboItemClass,
                itemOverClass : this.comboItemOverClass,
                itemSelectedClass: this.comboItemSelectedClass,
                width: this.panelWidth || 360
            })
        }else{
            this.dataView = new Sui.MultiList({
                store : this.store,
                labelField : this.labelField,
                valueField : this.valueField,
                customClass : "sui_multicombo_list",
                itemClass : this.comboItemClass,
                itemOverClass : this.comboItemOverClass,
                itemSelectedClass: this.comboItemSelectedClass,
                width: this.panelWidth
            });
        }

        return this.dataView;
    },
    /**
     * 将选中的项目的值复制过来，成为组件的值
     * @method  setSelectedValues
     * @param {Array} array
     * @private
     */
    setSelectedValues : function(array) {
        Sui.log("MultiDropList.setSelectedValues调用，参数为：" + array);
        this.valueSet.empty();
        if (array) {
            for (var i = 0; i < array.length; i++) {
                var value = array[i];
                $('<input name="' + this.name + '" value ="' + value + '" > ').appendTo(this.valueSet);
            }
        }
    },
    /**
     * 当选中某项时执行，设置组件值，派发selected事件
     * @method onSelectedItem
     * @param {Event} event
     * @private
     */
    onSelectedItem : function(event) {

        // 需要先获取焦点，再设置值
        var input = this.getApplyToElement();
        if(! input.attr("readOnly")){
        	input.focus();
        }

        var value = event.value;
        this.setValue(Sui.ArrayUtil.getPropertyValues(value, "value"));
        this.getLayer().hide();
        this.fireEvent("selected", event);

		// 这里为了触发校验器进行校验.
        if(input.attr("readOnly")){
        	input.blur();
        }
    },
    /**
     * 取消选择时触发
     * @method onCancel
     * @private
     */
    onCancel:function(event){
        this.getLayer().hide();
        this.fireEvent("cancel", event);
    },
    /**
     * 组件失去焦点时，若输入框中值为""，则将组件的值设置为""
     * @method fixValueWhenBlur
     * @private
     */
    fixValueWhenBlur : function(){
        if (this.getApplyToElement().val() == "") {
            this.setValue("");
        }
    },
    /**
     * 设置组件值执行函数
     * @method  applyValue
     * @private
     */
    applyValue : function() {

        Sui.form.MultiDropList.superclass.applyValue.apply(this, arguments);

        if (this.isRendered()) {
            this.setSelectedValues(this.value);
        }

        this.getApplyToElement().attr('title',this.findLabelByValue()) ;
    },
    /**
     * 通过组件的值获取对应的描述值，
     * 比如组件值为['apple','boy','cat'],通过函数获取到描述值为['苹果','男孩','喵星人']
     * @method findLabelByValue
     * @return {String}
     */
    findLabelByValue : function() {
        if (this.value) {
            this.value = typeof this.value == 'string' ? this.value.split(0) : this.value;
            var labels = [];
            for (var i = 0; i < this.value.length; i++) {
                var label = this.findLabelInStore(this.value[i]);
                labels.push(label);
            }
            return labels.join(", ");
        }
        return "";
    },
    /**
     * 获得组件值
     * @method getValue
     */
    getValue : function() {
        if (this.isRendered()) {
            var inputs = Sui.getInputElement(this.name, this.valueSet);
            return Sui.getValues(inputs);
        } else {
            return this.value;
        }
    },
    /**
     * 显示选项层
     * @method  showLayer
     * @private
     */
    showLayer : function() {
        this.dataView.setValue(this.value);
        Sui.form.MultiDropList.superclass.showLayer.apply(this, arguments);
    },
    /**
     * 初始化点击事件
     * @method  initEvent
     * @private
     */
    initEvent : function(){
        Sui.form.MultiDropList.superclass.initEvent.apply(this, arguments);
        var that = this;
        this.layer.addListener("autoHide", function(){
            that.dataView.onSure();
        });

    },
    /// 键盘操作功能未完成，有各种bug，暂时不开放 ////
    /**
     * 键盘弹起时执行
     * @method onKeyUp
     * @param {Event} event
     * @private
     */
    onKeyUp : function(event) {
        return; //暂时不开发
        Sui.form.DropList.superclass.onKeyUp.apply(this, arguments);
    },
    /**
     * 键盘按下时执行
     * @method onKeyDown
     * @param {Event} event
     * @private
     */
    onKeyDown : function(event) {
        return;//暂时不开发
        Sui.form.DropList.superclass.onKeyDown.apply(this, arguments);

        if (this.isReadOnly()) {
            return;
        }

        var KEY = Sui.KEY;
        switch (event.keyCode) {
            case KEY.UP:
                Sui.log("UP keydown");
                this.selectPrev();
                break;
            case KEY.DOWN:
                Sui.log("DOWN keydown");
                this.selectNext(true);
                break;
            case KEY.RETURN:
                Sui.log("RETURN keydown");
                this.onViewClick();
                break;
            case KEY.ESC:
                Sui.log("ESC keydown");
                this.collapse();
                break;
        }
    },
    /**
     * 选择当前选中项的前一个项
     * @method  selectPrev
     *
     */
    selectPrev : function() {
        if (this.isExpanded()) {
            var dataView = this.searchable ? this.getDataView().list : this.getDataView();
            dataView.selectPrev();
        }
    },
    /**
     * 选择当前选中项的后一个项
     * @method  selectNext
     * @param {Boolean} force
     */
    selectNext : function(force) {

        if (force) {
            this.showLayer();
        }

        if (this.isExpanded()) {
            var dataView = this.searchable ? this.getDataView().list : this.getDataView();
            dataView.selectNext();
        }
    },
    /**
     * 折叠选项层
     * @method collapse
     * @private
     */
    collapse : function() {
        this.getLayer().hide();
        if (this.searchable) {
            this.getDataView().list.setDefaultSelect();
        }else{
            this.getDataView().setDefaultSelect();
        }
    },
    /**
     * 当选项层被点击时执行
     * @method onViewClick
     * @private
     */
    onViewClick : function() {
        if (this.isExpanded()) {
            if(this.searchable){
                this.getDataView().list.onViewClick();
            }else{
                this.getDataView().onViewClick();
            }
        }
    }
});