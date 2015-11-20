/**
 * ListItem，List的子组件
 * 依赖jquery ui的拖放功能。依赖ScrollTo。
 * 如果希望能够滚动List，必须设置List的大小，高度不能设置为auto。
 * @class  Sui.ListItem
 * @extends Sui.Component
 * @constructor
 * @param {Object} config 配置参数
 * @param {Sui.data.Record} config.data 数据
 * @param {String} config.labelField 服务器数据中与List组件选项描述值对应的属性名，默认为“label”
 * @param {String} config.valueField 服务器数据中与List组件选项实际值所对应的属性名，默认为“value”
 * @param {Mixed} config.removableIcon 是否需要删除图标组件
 * @param {String}  config.selectedClass   组件被选中的样式 “”
 * @param {Boolean}  config.draggable  是否启用拖拽，可通过拖拽交换两个子项的位置，默认为false
 * @param {DOM}  config.containment   限制拖放的范围DOM，默认为null
 * @param {String}  config.dropHoverClass   当被拖动对象在该对象的上面时，添加的样式,默认为''
 * @param {String}  config.acceptDragClass 哪些对象可以接受该对象放下，此时样式，默认为''
 * @param {String}  config.emptyToClear   是否显示清空按钮，默认为false
 * @param {Number} config.width 组件的宽度，有时候list项流式排列时会用到，默认为null
 * @param {Boolean} config.iconClass  字段前的图标样式，不指定则不生成图标
 */
Sui.ListItem = Sui.extend(Sui.Component, {

    /**
     * 组件所对应的数据源
     * @property  data
     * @type  Sui.data.Record
     * @default
     */
    data : null,
    /**
     * 服务器数据中与List组件选项描述值对应的属性名
     * @property  labelField
     * @type String
     * @default "label"
     */
    labelField : "label",
    /**
     * 服务器数据中与List组件选项实际值所对应的属性名
     * @property valueField
     * @type  String
     * @default "value"
     */
    valueField : "value",
    /**
     * 是否显示清空按钮
     * @property emptyToClear
     * @type Boolean
     * @default false
     */
    emptyToClear : false,

    /**
     * 是否可删除的字段的名称
     * @property removableName
     * @type String
     * @default 'removable'
     */
    removableName : 'removable',

    // 指定渲染的元素
    applyToTagName : "div",
    defaultClass : 'sui_list_item',

    // 用来存放工具图标的容器
    toolsContainer : null,
    /**
     * 删除图标组件
     * @property removableIcon
     * @type Boolean
     * @default null
     */
    removableIcon : null,
    /**
     * 组件被选中时的样式
     * @property selectedClass
     * @type String
     * @default ""
     */
    selectedClass : "",
    
    /**
     * 是否启用拖放
     * @property draggable
     * @type Boolean
     * @default false
     */
    draggable : false,
    // @private 启用了拖放，在未渲染之前，是没有使用拖放的。
    draggableUsed : false,
    /**
     * 限制拖放的范围
     * @property containment
     * @type DOM
     * @default null
     */
    containment : null,
    /**
     * 当被拖动对象在该对象的上面时，添加的样式
     * @property selectedClass
     * @type String
     * @default ''
     */
    dropHoverClass : '',
    /**
     * 哪些对象可以接受该对象放下
     * @property acceptDragClass
     * @type String
     * @default ''
     */
    acceptDragClass : '',
    /**
     * 字段前的图标样式
     * @property iconClass
     * @type String
     * @default null
     */
    iconClass:null,
    /**
     * 初始化配置
     * @method  initConfig
     * @param {Object} config 配置参数请参考构造函数
       @private
     */
    initConfig : function(config) {

        Sui.ListItem.superclass.initConfig.apply(this, arguments);

        Sui.applyProps(this, config, ["data", "labelField", "valueField", "removableName", "selectedClass",
            "draggable" ,"containment", "dropHoverClass", "acceptDragClass", "emptyToClear",'iconClass']);
    },
    /**
     * 设置可拖动的范围
     * @method setContainment
     * @param containment
     */
    setContainment : function(containment) {
        this.containment = containment;
    },
    /**
     * 获得当前ListIetm的值
     * @method  getValue
     * @return {String}
     *
     */
    getValue : function() {
        return this.data.getFieldValue(this.valueField);
    },
    /**
     * 获得当前ListItem的描述
     * @method getLabel
     * @return {String}
     *
     */
    getLabel : function() {
        return this.data.getFieldValue(this.labelField);
    },
    /**
     * 判断当前组件是否可以删除
     * @method isRemovable
     * @return {Boolean}
     *
     */
    isRemovable : function() {
        return this.data.getFieldValue(this.removableName);
    },
    /**
     * 渲染组件
     * @method render
     * @param {DOM} conatainer 父容器
     * @parm {DOM} insertBefore 插入到该元素的前面
     */
    render : function(container, insertBefore) {

        Sui.ListItem.superclass.render.apply(this, arguments);

        this.renderLabel();
        this.applyRemovable();
        this.applyDraggable();

    },
    /**
     * 如果当前项目与搜索关键词匹配，则添加匹配样式，否则移除样式
     * @method setSearchMatched
     *
     */
    setSearchMatched : function(matched) {
        if (matched) {
            this.getApplyToElement().removeClass("sui_listitem_searchnotmatch");
        } else {
            this.getApplyToElement().addClass("sui_listitem_searchnotmatch");
        }
    },
    /**
     * 渲染组件的描述值
     * @method  renderLabel
     *
     */
    renderLabel : function() {
        var applyTo = this.getApplyToElement();

        if(this.emptyToClear && Sui.isEmpty(this.getLabel())){
            applyTo.html("<a href='javascript:void(0)' >清空</a>");
        }else {
            // 处理null,undefined,空字符串和空数组等
            if(Sui.isEmpty(this.getLabel())){

                applyTo.text('');
            }else{
                applyTo.text(this.getLabel()).attr('title',this.getLabel());
            }
        }

        if( !Sui.isUndefinedOrNull(this.iconClass)){
            $('<b></b>' ).addClass(this.iconClass).prependTo(applyTo);
        }

    },
    /**
     * 判断当前组件是否被选中
     * @method  isChecked
     *
     */
    isChecked : function() {
        return this.checkboxElement.attr("checked");
    },
    /**
     *设置当前项的选中状态
     * @method setChecked
     * @param {Boolean} checked
     *
     */
    setChecked : function(checked) {
        this.checkboxElement.attr("checked", checked);
    }   ,
    /**
     * 判断toolsContainer是否存在，不存在则创建
     * @method  checkToolsContainer
     *
     */
    checkToolsContainer : function() {
        if (! this.toolsContainer) {
            this.toolsContainer = $("<div class='tool_area'></div>").appendTo(this.getApplyToElement());
        }
    },
    /**
     * 检查是否存在删除图标，不存在则创建
     * @method  checkRemovableIcon
     *
     */
    checkRemovableIcon : function() {

        this.checkToolsContainer();

        if (! this.removableIcon) {
            this.removableIcon = new Sui.Component({
                applyToTagName : 'b',
                renderTo : this.toolsContainer,
                overClass : 'closed_icon_over',
                defaultClass : 'closed_icon'
            });

            // 这个值是根据toolsContainer和removableIcon的高度值来计算的。
            //this.removableIcon.setStyle("margin-top", "4px");
        }
    },
    /**
     * 判断当前组件是否可拖拽
     * @method  isDraggable
     * @return {Boolean}
     *
     */
    isDraggable : function() {
        return this.draggable;
    },
    /**
     * 设置当前组件的可拖拽性
     * @method   setDraggable
     *
     */
    setDraggable : function(draggable) {
        if (this.draggable == draggable) {
            return;
        }

        this.draggable = draggable;
        if (this.isRendered()) {
            this.applyDraggable();
        }

    },
    /**
     * 设置当前组件的可拖拽性实际执行函数
     * @method   applyDraggable
     */
    applyDraggable : function() {
        var draggable = this.isDraggable();

        if (draggable) {

            var dragConfig = {helper: "clone"};
            if (this.containment) {
                dragConfig.containment = this.containment;
            }

            this.getDragElement().draggable(dragConfig).droppable({
                accept: "." + this.acceptDragClass,
                hoverClass : this.dropHoverClass,
                drop: Sui.makeFunction(this, this.onDrop)
            });
            this.draggableUsed = true;
        } else {

            if (this.draggableUsed) {
                this.getDragElement().draggable("destroy");
            }
            this.draggableUsed = false;

        }
    },
    /**
     * 当鼠标开始放下当前组件时执行
     * @method  onDrop
     * @param {Sui.util.Event} event
     * @param {Mixed} 被拖拽组件
     * @private
     */
    onDrop : function(event, ui) {
        this.fireEvent("drop", new Sui.util.Event({
            drag : ui.draggable,
            drop : this
        }));

        // 鼠标在上面释放，会添加overClass样式。
        this.getApplyToElement().removeClass(this.overClass);
    },
    /**
     * 执行判断是否可删除，是则显示删除按钮，否则隐藏
     * @method applyRemovable
     * @private
     */
    applyRemovable : function() {
        var removable = this.isRemovable();

        if (removable) {
            this.checkRemovableIcon();
            this.removableIcon.show()
        } else {
            if (this.removableIcon) {
                this.removableIcon.hide();
            }
        }

    },
    /**
     * 初始化事件
     * @method initEvent
     * @private
     *
     */
    initEvent : function() {

        Sui.ListItem.superclass.initEvent.apply(this, arguments);

        this.getApplyToElement().click(Sui.makeFunction(this, this.onClick));

        this.data.on("propertyChange", Sui.makeFunction(this, this.onPropertyChange));

    },
    /**
     * 当前组件的data成员属性变化时触发
     * @method  onPropertyChange
     * @private
     */
    onPropertyChange : function(event) {
        if (event.field == this.removableName) {
            if (this.isRendered()) {
                this.applyRemovable();
            }
        }
    },
    /**
     * 当前组件被点击时触发
     * @method  onClick
     * @param {Event} e
     */
    onClick : function(e) {

        // 判断是否是点击关闭图标
        if (this.isRemovable()) {
            if (this.removableIcon.containDom(e.target)) {

                Sui.log("点击关闭图标");

                this.destroy();

                return;
            }
        }

        this.fireEvent("click", new Sui.util.Event({
            target : this
        }));

    },
    /**
     * 当前组件失效时，添加失效样式
     * @method  applyDisabled
     *
     */
    applyDisabled : function() {
        Sui.ListItem.superclass.applyDisabled.apply(this, arguments);
        if (this.isRendered()) {
            if (this.isDisabled()) {
                this.getDisabledElement().addClass("sui_listitem_disabled");
            } else {
                this.getDisabledElement().removeClass("sui_listitem_disabled");
            }
        }
    },
    /**
     * 移除某个样式
     * @method removeKeyOnClass
     * @private
     */
    removeKeyOnClass : function() {
        this.getApplyToElement().removeClass(this.overClass);
    },
    /**
     * 添加某个样式
     * @method   addKeyOnClass
     * @private
     */
    addKeyOnClass : function() {
        this.getApplyToElement().addClass(this.overClass);
    },
    /**
     * 获取当前组件的顶部元素
     * @method  getTopElement
     * @return {DOM}
     *
     */
    getTopElement : function() {
        return this.getApplyToElement();
    },
    /**
     * 设置当前组件的选中状态
     * @method   setSelected
     * @param {Boolean} selected
     */
    setSelected : function(selected) {
        if (this.selected != selected) {
            this.selected = selected;
            if (this.isRendered()) {
                this.applySelected();
            }
        }
    },
    /**
     * 设置选中状态样式
     * @method applySelected
     * @private
     */
    applySelected : function() {
        if (this.selected) {
            this.getApplyToElement().addClass(this.selectedClass);
        } else {
            this.getApplyToElement().removeClass(this.selectedClass);
        }
    },
    /**
     * 移除该组件
     * @method   destroy
     *
     */
    destroy : function() {
        this.fireEvent('beforeDestroy', new Sui.util.Event({
            target : this
        }));

        if (this.removableIcon) {
            this.removableIcon.destroy()
        }

        if (this.draggableUsed) {
            this.getDragElement().draggable("destroy");
        }

        this.getApplyToElement().remove();

        Sui.ListItem.superclass.destroy.apply(this, arguments);
    }
});
/**
 * Sui.MultiList的子组件，继承了Sui.ListItem
 * @class  Sui.MultiListItem
 * @extends Sui.ListItem
 * @constructor
 * @param {Object} config 配置参数请参照Sui.ListItem
 */
Sui.MultiListItem = Sui.extend(Sui.ListItem, {
    /**
     * 渲染组件的描述值
     * @method renderLabel
     */
    renderLabel : function() {

        var id = Sui.generateId();
        var checkbox = this.checkboxElement = $("<input type='checkbox' class='checkbox' />").appendTo(this.getApplyToElement()).attr("id", id);

        var label = $("<label></label>").insertAfter(checkbox).attr("for", id);
        label.text(this.getLabel() == "" ? "" : this.getLabel());

    }
});

/**
 * List组件，用于实现数据选择功能，
 * 依赖scrollTo
 * @class Sui.List
 * @extends Sui.Container
 * @constructor
 * @param {Object} config 配置参数请参考构造函数
 * @param {Boolean} config.draggable 是否可拖拽
 * @param {String} config.itemClass List项样式
 * @param {String} config.itemOverClass 鼠标悬浮在项上的样式
 * @param {String} config.itemSelectedClass 选中项样式
 * @param {String} config.itemDropHoverClass  项被拖拽时的样式
 * @param {String} config.labelField 表单提交时label变量，默认为“label”
 * @param {String} config.valueField 表单提交时value变量，默认为“value”
 * @param {Boolean} config.initDisabledAll 初始化时禁止全部项目，默认为false
 * @param {Boolean} config.emptyToClear 是否显示清空操作项，
 * @param {Number} config.itemWidth 选项的宽度，有时候list项流式排列时会用到，默认为null
 * @param {Boolean} config.iconClass  选项字段前的图标样式，不指定则不生成图标
 */
Sui.List = Sui.extend(Sui.Container, {

    // 数据
    store : null,
    /**
     * @temp 在通过键盘导航时，保存当前导航到的元素。
     */
    keyonIndex : -1,
    visibleItemIndexs : null,
    selectedItem : null,

    draggable : false,

    emptyToClear : false,
    /**
     * 服务器数据中与List组件选项描述值对应的属性名，比如服务器输出的初始化数据为
     * [{user:'张三',id:'0001'},{user:'李四',id:'0002'}]，
     * 则List组件对应的labelField为'user'
     * @property  labelField
     * @type String
     * @default "label"
     */
    labelField : 'label',
    /**
     * 服务器数据中与List组件选项实际值对应的属性名，比如服务器输出的初始化数据为
     * [{user:'张三',id:'0001'},{user:'李四',id:'0002'}]，
     * 则List组件对应的valueField为'id'
     * @property  labelField
     * @type String
     * @default "label"
     */
    valueField : 'value',
     /**
     * @property itemWidth
     * @type Number
     * @default null
     */
    itemWidth:null,
    /**
     * 选项字段前的图标样式，不指定则不生成图标
     * @property iconClass
     * @type String
     * @default null
     */
    iconClass:null,

    initDisabledAll : false,

    noCheckedItemsVisible : true,

    maxHeight : Sui.LIST_MAX_HEIGHT,
    minWidth : Sui.LIST_MIN_WIDTH,

    // 样式定义
    defaultClass : 'sui_list',
    itemClass : 'sui_list_item',
    itemOverClass : 'sui_list_item_over',
    itemSelectedClass : 'sui_list_item_selected',

    /* 一个标识样式，自动生成的唯一的样式类 */
    itemAcceptDragClass : '',

    itemDropHoverClass : 'sui_list_item_drophover',
    
    tbuttons : "",
    
    /**
     * 初始化配置
     * @method initConfig
     * @private
     */
    initConfig : function(config) {

        Sui.List.superclass.initConfig.apply(this, arguments);

        Sui.applyProps(this, config, ["draggable", "itemClass", "itemOverClass", "itemSelectedClass",
            "itemDropHoverClass", "labelField", "valueField", "initDisabledAll", "emptyToClear","itemWidth","iconClass", "tbuttons"]);

        if (config.store) {
            this.store = config.store;
        } else {
            if (config.items) {
                this.store = new Sui.data.Store(config.items);
            }else {
                this.store = new Sui.data.Store();
            }
        }
        this.createComponents();

    },
    /**
     * 更新待选项
     * @method updataComponents
    **/
    updataComponents:function(){
        this.removeAllComponents();
        this.createComponents();
        this.render();
    },
    /**
     * 创建待选项
     * @method createComponents
     * @return
    **/
    createComponents:function() {
        for (var i = 0,len =  this.store.getCount(); i <len; i++) {
            var record = this.store.getRecord(i);
            this.addComponent(this.createListItem(record), i);
        }
    },
    /*
    * 初始化各种属性
    * @method initPropertise
    * @private
     */
    initProperties : function() {
        Sui.List.superclass.initProperties.apply(this);
        // 初始化默认属性
        this.itemAcceptDragClass = Sui.generateUniqueClass();
    },
    
    getStore : function(){
        return this.store;
    },
    
    /**
     * 创建List项
     * @method createListItem
     * @param {Sui.data.Record} record
     * @returns {Sui.ListItem}
     */
    createListItem : function(record) {
        var listItem = new Sui.ListItem({
            emptyToClear : this.emptyToClear,
            data : record,
            labelField : this.labelField,
            valueField : this.valueField,
            disabled : this.initDisabledAll,
            draggable : this.draggable,
            defaultClass : this.itemClass + " " + this.itemAcceptDragClass,
            overClass : this.itemOverClass,
            selectedClass : this.itemSelectedClass,
            dropHoverClass : this.itemDropHoverClass,
            acceptDragClass : this.itemAcceptDragClass,
            width: this.itemWidth ,
            iconClass: this.iconClass
        });

        listItem.on("click", Sui.makeFunction(this, this.onItemClick));
        listItem.on("drop", Sui.makeFunction(this, this.onItemDragDrop));
        return listItem;
    },
    /**
     * 更新数据源
     * @method setStore
     * @param {Array} newData
     */
    setStore:function(newData){
        this.store.clear();
        for (var i = 0,len = newData.length; i < len; i++) {
            this.store.addRecordData(newData[i]);
        }
    },
    /**
     * List项开始被拖拽或放下时执行
     * @method onItemDragDrop
     * @param {Sui.util.Event} event
     */
    onItemDragDrop : function(event) {
        var drag = event.drag;
        var drop = event.drop;

        var dragIndex = -1;
        for (var i = 0; i < this.getComponentCount(); i++) {
            var comp = this.getComponent(i);
            if (Sui.equals(comp.getDragElement(), drag)) {
                dragIndex = i;
                break;
            }
        }

        var dropIndex = this.indexOfComponent(drop);

        if (dragIndex != -1 && dropIndex != -1 && dragIndex != dropIndex) {
            var min = Math.min(dragIndex, dropIndex);
            var max = Math.max(dragIndex, dropIndex);

            this.exchangeItem(min, max);
        }
    },
    /**
     * 渲染组件
     * @method render
     *
     */
    render : function() {
        Sui.List.superclass.render.apply(this, arguments);
        this.applyDraggable();
        this._applyToolbar();
    },
    
    /**
     * 生成顶部工具栏
     * @private
     */
    _applyToolbar : function(){
        if(Sui.isNotEmpty(this.tbuttons)){
            var toolPanel = $("<div class='topbar'></div>").prependTo(this.getApplyToElement());
            for(var i = 0; i<this.tbuttons.length; i++){
                var tbutton = this.tbuttons[i];
                $(tbutton.html).appendTo(toolPanel).click(tbutton.click)
            }
        }
    },
    
    /**
     * 渲染子组件
     * @method  renderChildren
     * @private
     */
    renderChildren : function() {
        for (var i = 0; i < this.getComponentCount(); i++) {
            var comp = this.getComponent(i);
            comp.setContainment(this.getApplyToElement());
        }
        Sui.List.superclass.renderChildren.apply(this, arguments);

    },
    /**
     * 渲染之后执行
     * @method afterRender
     * @private
     */
    afterRender : function() {
        Sui.List.superclass.afterRender.apply(this);

        this.initVisibleItemIndexs();
    },
    /**
     * 初始化事件
     * @method initEvent
     * @private
     */
    initEvent : function() {

        Sui.List.superclass.initEvent.call(this);

        this.store.on("removeRecord", Sui.makeFunction(this, this.onRemoveRow));
        this.store.on("addRecord", Sui.makeFunction(this, this.onAddRow));
        this.store.on("exchangeRecord", Sui.makeFunction(this, this.onExchangeRecord));
        this.store.on('recordChange', Sui.makeFunction(this, this.onChangeRecord));
    },

    /**
     * 根据包含的内容动态调整宽度,让其不要出现水平滚动条
     * @method  adjustSizeByContent
     * @private
     */
    adjustSizeByContent : function(size) {

        // 是否存在垂直滚动条
        var existVerticalScrollbar = false;

        // 设置最大宽度
        var maxHeight = (size && Sui.isDefinedAndNotNull(size.maxHeight)) ? size.maxHeight : this.maxHeight;
        this.getApplyToElement().height("auto");
        var outerHeight = this.getApplyToElement().outerHeight();
        Sui.log("List组件的outerHeight=" + outerHeight);
        if (outerHeight > maxHeight) {
            Sui.setOuterHeight(this.getApplyToElement(), maxHeight);
            existVerticalScrollbar = true;
        }

        // 设置最小宽度
        var minWidth =  (size && Sui.isDefinedAndNotNull(size.minWidth)) ? size.minWidth : this.minWidth;
        this.getApplyToElement().width("auto");
        var outerWidth = this.getApplyToElement().outerWidth();
        Sui.log("List组件的outerWidth=" + outerWidth);
        if (existVerticalScrollbar) {
            var scrollbarWidth = 18;
            if (this.getApplyToElement().outerWidth() < minWidth - scrollbarWidth) {
                Sui.setOuterWidth(this.getApplyToElement(), minWidth);
            } else {
                Sui.setOuterWidth(this.getApplyToElement(), minWidth + scrollbarWidth);
            }
        } else {
            if (this.getApplyToElement().outerWidth() < minWidth) {
                Sui.setOuterWidth(this.getApplyToElement(), minWidth);
            }
        }

    },
    /**
     * 设置当前组件中第index项的可删除性
     * @method setRemovable
     * @param {Number} index 项的索引
     * @param {Boolean} removable 可否删除
     */
    setRemovable : function(index, removable) {
        this.store.getRecord(index).setFieldValue("removable", removable);
    },
    /**
     * 将选中项排序提前一位
     * @method upSelectedItem
     */
    upSelectedItem : function() {
        if (! this.selectedItem) {
            return;
        }

        var index = this.indexOfComponent(this.selectedItem);
        if (index > 0) {
            this.exchangeItem(index - 1, index);
        }
    },
    /**
     * 将选中项排序后置一位
     * @method downSelectedItem
     */
    downSelectedItem : function() {
        if (! this.selectedItem) {
            return;
        }

        var index = this.indexOfComponent(this.selectedItem);
        if (index + 1 < this.getComponentCount()) {
            this.exchangeItem(index, index + 1);
        }
    },

    /**
     * 交换两个组件的位置
     * @method exchangeItem
     * @param {Number} upIndex 组件索引
     * @param {Number} downIndex 组件索引
     */
    exchangeItem : function(upIndex, downIndex) {
        this.store.exchangeRecord(upIndex, downIndex);
    },
    /**
     * 获取选中项的值
     * @method  getSelectedValue
     * @returns {String}
     */
    getSelectedValue : function() {

        if (this.selectedItem) {
            return this.selectedItem.getValue();
        }

        return "";
    },
    /**
     * 获取选中项
     * @method  getSelectedItem
     * @returns {Sui.ListItem}
     */
    getSelectedItem : function() {
        return this.selectedItem;
    },
    /**
     * 设置组件可拖拽性
     * @method  setDraggable
     * @param {Boolean} draggable
     */
    setDraggable : function(draggable) {
        if (this.draggable == draggable) {
            return;
        }

        this.draggable = draggable;

        if (this.isRendered()) {
            this.applyDraggable();
        }
    },
    /**
     * 设置组件可拖拽性实际执行函数
     * @method  applyDraggable
     * @private
     */
    applyDraggable : function() {

        for (var i = 0; i < this.getComponentCount(); i++) {
            var comp = this.getComponent(i);
            comp.setDraggable(this.isDraggable());
        }

    },
    /**
     * 判断是否可拖拽
     * @method  isDraggable
     * @return {boolean}
     */
    isDraggable : function() {
        return this.draggable;
    },
    /**
     * 设置选中项
     * @method setSelectedItem
     * @param {Sui.ListItem} item
     */
    setSelectedItem : function(item) {

        if (item == this.selectedItem) {
            return;
        }

        if (this.selectedItem) {
            this.selectedItem.setSelected(false);
        }

        this.selectedItem = item;
        item.setSelected(true);
    },
    /**
     * 通过索引值选中列表组件某一项
     * @mehtod   setSelectedItemByIndex
     * @param {Number} index
     */
    selectedItemByIndex:function(index){
        var item = this.getComponent(index);
        if(item){
            this.onItemClick({  target:item  });
        }
    },
    /**
     * 当Record变更时触发
     * @method onExchangeRecord
     * @param {Sui.util.Event} e
     */
    onExchangeRecord : function(e) {
        var upIndex = e.upIndex;
        var downIndex = e.downIndex;

        this.layout.exchangeComponent(upIndex, downIndex);
    },
    /**
     * @method onChangeRecord
     * @param {Sui.util.Event} e
     */
    onChangeRecord:function(e){
        var listItem = this.getComponent(e.index);
       listItem.render();
    },
    /**
     * 添加一条子项
     * @method  onAddRow
     * @param {Sui.util.Event} e
     */
    onAddRow : function(e) {
        var listItem = this.createListItem(e.record);
        this.addComponent(listItem, e.index);
    },
    /**
     * 删除一条子项
     * @method onRemoveRow
     * @param {Sui.util.Event} e
     */
    onRemoveRow : function(e){
        var listItem = this.getComponent(e.index);
        this.removeComponent(listItem);
    },
    /**
     * 子项被点击时派发selected事件
     * @method  onItemClick
     * @param {Event} e
     */
    onItemClick : function(e) {

        e.label = e.target.getLabel();
        e.value = e.target.getValue();
        e.item = e.target;
        e.data = e.item.data;

        e.target = this;

        this.setSelectedItem(e.item);
        this.fireEvent("selected", e);

    },
    /**
     * 将当前组件所有子项中与指定fieldName值匹配的项设置为enable,
     * 其余的设置为disabled
     * @method  enableListItems
     * @param {String, Function} fieldValueOrFunction fieldName的值，也可以是过滤函数
     * @param {String} fieldName
     * @example
     *   ListA.enableListItems( 0,grade );
     * @example
     *   ListB.enableListItems( function(value,label,record){
     *      return value > 0;
     *   },'grade');
     */
    enableListItems : function(fieldValueOrFunction, fieldName) {
        for (var i = 0; i < this.store.getCount(); i++) {
            var record = this.store.getRecord(i);

            var disabled = true;
            if(Sui.isString(fieldValueOrFunction)){
               disabled = (record.getFieldValue(fieldName) != fieldValueOrFunction);
            }else if(Sui.isFunction(fieldValueOrFunction)){
                disabled = !fieldValueOrFunction.call(null, record.getFieldValue(this.valueField),
                    record.getFieldValue(this.labelField), record
                );
            }

            this.getComponent(i).setDisabled(disabled);
        }
    },
    /**
     * 将所有子项设置为失效
     * disabledAllListItems
     * @method disabledAllListItems
     *
     */
    disabledAllListItems : function() {
        for (var i = 0; i < this.store.getCount(); i++) {
            this.getComponent(i).setDisabled(true);
        }
    },

    /**
     * 查找当前组件所有子项中，某个属性fieldName的值与str匹配的项，
     * 将其标识出来。
     * 重新搜索之后，去掉之前通过键盘导航的项
     * @method   filter
     * @param {String} str
     * @param  {String} fieldName
     */
    filter : function(str, fieldName) {

        this.setDefaultSelect();

        for (var i = 0; i < this.store.getCount(); i++) {
            var record = this.store.getRecord(i);
            if (Sui.StringUtil.contains(record.getFieldValue(fieldName), str)) {
                this.getComponent(i).setSearchMatched(true);
            } else {
                this.getComponent(i).setSearchMatched(false);
            }
        }

        this.initVisibleItemIndexs();

    },
    /**
     * 清除过滤状态
     * @method  clearFilter
     * @private
     */
    clearFilter : function() {
        this.setDefaultSelect();

        for (var i = 0; i < this.store.getCount(); i++) {
            this.getComponent(i).setSearchMatched(true);
        }

        this.initVisibleItemIndexs();
    },
    /**
     * 初始化visibleItemIndexs，即可见的子项的索引集，如[1,2,3]
     * @method initVisibleItemIndexs
     *
     */
    initVisibleItemIndexs : function() {
        var ret = [];
        for (var i = 0; i < this.getComponentCount(); i++) {
            var comp = this.getComponent(i);
            if (comp.isVisible()) {
                ret.push(i);
            }
        }
        this.visibleItemIndexs = ret;
    },

    /**
     * 设置为默认不选中任何项
     * @method  setDefaultSelect
     * @private
     */
    setDefaultSelect : function() {
        this.select(-1);
    },
    /**
     * 选择当前选中项目的前一个
     * @method  selectPrev
     */
    selectPrev : function() {
        var visibleCount = this.visibleItemIndexs.length;
        if (visibleCount > 0) {
            if (this.keyonIndex == -1) {
                this.select(0);
            } else if (this.keyonIndex > 0) {
                this.select(this.keyonIndex - 1);
            }
        }
        //容器滚动定位到当前选中位置
        var appElement = this.getApplyToElement();
        var offsetTop = this.getComponent(this.keyonIndex).getApplyToElement()[0].offsetTop;
        if (offsetTop < appElement.scrollTop()) {
            this.getApplyToElement().scrollTop(offsetTop);
        }
    },
    /**
     * 选择当前选中项目的后一个
     * @method  selectNext
     */
    selectNext : function() {

        var visibleCount = this.visibleItemIndexs.length;
        if (visibleCount > 0) {
            if (this.keyonIndex == -1) {
                this.select(0);
            } else if (this.keyonIndex < visibleCount - 1) {
                this.select(this.keyonIndex + 1);
            }
        }
        //容器滚动定位到当前选中位置
        var appElement = this.getApplyToElement();
        var diff = this.getComponent(this.keyonIndex).getApplyToElement()[0].offsetTop - appElement.height() + parseInt(appElement.css('paddingTop'));
        if (diff > 0) {
            this.getApplyToElement().scrollTop(diff);
        }

    },
    /**
     * 选中第一个子项
     * @method  selectDefaultElementAfterQuery
     */
    selectDefaultElementAfterQuery : function(){
        this.select(0);
    },
    /**
     * 获取当前选中项对应的Sui.ListItem
     * @method getSelectedComponent
     */
    getSelectedComponent : function() {
        return this.getComponent(this.visibleItemIndexs[this.keyonIndex]);
    },
    /**
     * 选择当前组件的第index项
     * @method select
     * @param {Number} index
     */
    select : function(index) {

        if(index >= this.visibleItemIndexs.length){
            index = -1;
        }

        if (this.keyonIndex != -1) {
            this.getSelectedComponent().removeKeyOnClass();
        }

        this.keyonIndex = index;
        if (this.keyonIndex != -1) {
            this.getSelectedComponent().addKeyOnClass();
            this.scrollToItem();
        }
    },
    /**
     * 滑动条滚动到当前子组件
     * @method  scrollToItem
     * @private
     */
    scrollToItem : function() {
        var index = this.keyonIndex;
        // 有滚动插件，则让其滚动。
        if (this.getChildRenderTotElement().scrollTo) {
            this.getChildRenderTotElement().scrollTo(this.getComponent(this.keyonIndex).getBeforeElement());
        }
    },
    /**
     * 如果Sui.List组件作为自动补充输入框的一部分；
     * 下拉面板可见时, 在输入框中输入回车键,会选择下拉面板当前的高亮的项
     * @method onViewClick
     */
    onViewClick : function() {
        var visibleCount = this.visibleItemIndexs.length;
        if (visibleCount > 0) {
            if (this.keyonIndex != -1) {
                this.onItemClick({target :this.getSelectedComponent() });
                this.select(-1);
            }
        }
    }
});
/**
 * MultiList组件,用于实现多个数据选择功能
 * @class Sui.MultiList
 * @extends Sui.List
 * @constructor
 * @param {Object} config 配置参数请参考构造函数
 * @param {Boolean} draggable 是否可拖拽
 * @param {String} itemClass List项样式
 * @param {String} itemOverClass 鼠标悬浮在项上的样式
 * @param {String} itemSelectedClass 选中项样式
 * @param {String} itemDropHoverClass  项被拖拽时的样式
 * @param {String} config.labelField 表单提交时label变量，默认为“label”
 * @param {String} config.valueField 表单提交时value变量，默认为“value”
 * @param {Boolean} config.initDisabledAll 初始化时禁止全部项目，默认为false
 */
Sui.MultiList = Sui.extend(Sui.List, {
    /**
     * 设置当前组件的value值,组件会勾选与给定参数值匹配的子组件MultiListItem
     * @method  setValue
     * @param {Array} array 由字符串组成的数组，如['apple','boy','cat']
     *
     */
    setValue : function(array) {
        this.selectNone();
        for (var i = 0; i < this.getComponentCount(); i++) {
            var comp = this.getComponent(i);
            var val = comp.getValue();
            if (Sui.ArrayUtil.contains(array, val)) {
                comp.setChecked(true);
            }
        }
    },
    /**
     * 创建子组件
     * @method createListItem
     * @param {Sui.data.Record} record
     */
    createListItem : function(record) {
        var listItem = new Sui.MultiListItem({
            data : record,
            labelField : this.labelField,
            valueField : this.valueField,
            draggable : this.draggable,
            customClass : this.itemClass + " " + this.itemAcceptDragClass,
            overClass : this.itemOverClass,
            selectedClass : this.itemSelectedClass,
            dropHoverClass : this.itemDropHoverClass,
            acceptDragClass : this.itemAcceptDragClass
        });

        listItem.on("click", Sui.makeFunction(this, this.onItemClick));
        listItem.on("drop", Sui.makeFunction(this, this.onItemDragDrop));
        return listItem;
    },
    /***
     * 渲染组件
     * @method render
     */
    render : function() {
        Sui.MultiList.superclass.render.apply(this, arguments);
        this.applyMultiSelect();

    },
    /**
     * 获取子组件的容器
     * @method getChildRenderTotElement
     * @return {$DOM}
     */
    getChildRenderTotElement : function() {
        if (! this.listContainerElement) {
            this.listContainerElement = $("<div class='listContainer'></div>").appendTo(this.getApplyToElement());
        }
        return this.listContainerElement;
    },

    onItemClick : function(e) {
        // 屏蔽掉item点击事件
    },
    /**
     * 渲染选择操作组件，如全选、不选、显示已选、确定
     * @method applyMultiSelect
     */
    applyMultiSelect : function() {
        var toolPanel = $("<div class='multi_tool'></div>").prependTo(this.getApplyToElement());
        var selectAll = $('<a index="0" class="button" href="javascript:void(0);">[全选]</a>').appendTo(toolPanel);
        var selectNone = $('<a index="1" class="button"  href="javascript:void(0);">[不选]</a>').appendTo(toolPanel);
        this.showAllElement = $('<a index="2" class="button"  href="javascript:void(0);">[显示已选]</a>').appendTo(toolPanel);
        var sure = $('<a index="3"  class="button" href="javascript:void(0);">[确定]</a>').appendTo(toolPanel);
        var cancel = $('<a index="4" class="button" href="javascript:void(0);">[取消]</a> ').appendTo(toolPanel);

        selectAll.click(Sui.makeFunction(this, this.selectAll));
        selectNone.click(Sui.makeFunction(this, this.selectNone));
        this.showAllElement.click(Sui.makeFunction(this, this.toggleNoCheckedItems));
        sure.click(Sui.makeFunction(this, this.onSure));
        cancel.click(Sui.makeFunction(this,this.onCancel));
    },
    /**
     * 触发并委派selected事件
     * @method onSure
     * @private
     */
    onSure : function() {

        var items = [];

        for (var i = 0; i < this.getComponentCount(); i++) {
            var comp = this.getComponent(i);
            if (comp.isChecked()) {
                items.push({
                    label : comp.getLabel(),
                    value : comp.getValue(),
                    item : comp
                });
            }
        }
        this.fireEvent("selected", new Sui.util.Event({
            target : this,
            value : items
        }));
    },
    /**
     *  取消选择时触发
     * @method onCancel
     * @private
     */
    onCancel:function(){
        this.fireEvent("cancel", new Sui.util.Event());
    },
    /**
     * [显示已选]|[显示全部]按钮状态控制
     * @method toggleNoCheckedItems
     * @private
     */
    toggleNoCheckedItems : function() {

        this.noCheckedItemsVisible = !this.noCheckedItemsVisible;

        if (this.noCheckedItemsVisible) {
            this.showAllElement.text("[显示已选]");
        } else {
            this.showAllElement.text("[显示全部]");
        }

        for (var i = 0; i < this.getComponentCount(); i++) {
            var comp = this.getComponent(i);
            if (! comp.isChecked()) {
                comp.toggle(this.noCheckedItemsVisible);
            }
        }
    },
    /**
     * 选择全部
     * @method selectAll
     *
     */
    selectAll : function() {
        this.setAllChecked(true);
    },
    /**
     * 设置全部选项的选择性,已选或者未选
     * @method setAllChecked
     * @param {Boolean} checked
     * @private
     */
    setAllChecked : function(checked) {
        for (var i = 0; i < this.getComponentCount(); i++) {
            var comp = this.getComponent(i);
            comp.setChecked(checked);
        }
    } ,
    /**
     * 不选择任何项
     * @method selectNone
     */
    selectNone : function() {
        this.setAllChecked(false);
    }

});

/**
 * ExMultiList组件,用于实现多个数据选择功能
 * @class Sui.ExMultiList
 * @extends Sui.Container
 * @constructor
 * @param {Object} config 配置参数请参考构造函数
 * @param {String} itemClass List项样式
 * @param {String} itemOverClass 鼠标悬浮在项上的样式
 * @param {String} itemSelectedClass 选中项样式
 * @param {String} itemDropHoverClass  项被拖拽时的样式
 * @param {String} config.labelField 表单提交时label变量，默认为“label”
 * @param {String} config.valueField 表单提交时value变量，默认为“value”
 * @param {Boolean} config.initDisabledAll 初始化时禁止全部项目，默认为false
 * @param {Boolean} config.emptyToClear 是否显示清空操作项，默认为false
 * @param {Boolean} config.itemDeletedClass 表示菜单项已经被选择过的样式，默认为“sui_listitem_hide”
 */
Sui.ExMultiList = Sui.extend(Sui.Container,{

    // 数据
    store : null,
    //
    list:null,
    /**
     * 服务器数据中与List组件选项描述值对应的属性名，比如服务器输出的初始化数据为
     * [{user:'张三',id:'0001'},{user:'李四',id:'0002'}]，
     * 则List组件对应的labelField为'user'
     * @property  labelField
     * @type String
     * @default "label"
     */
    labelField : 'label',
    /**
     * 服务器数据中与List组件选项实际值对应的属性名，比如服务器输出的初始化数据为
     * [{user:'张三',id:'0001'},{user:'李四',id:'0002'}]，
     * 则List组件对应的valueField为'id'
     * @property  labelField
     * @type String
     * @default "label"
     */
    valueField : 'value',
    /**
     * 待选项的宽度
     * @property itemWidth
     * @type Number
     * @default
     */
    itemWidth: 100,
     /**
     * 表示菜单项已经被选择过的样式
     * @property  itemDeletedClass
     * @type String
     * @default "sui_listitem_hide"
     */
    itemDeletedClass:'sui_listitem_hide',

    listContainer:null,

    selectedContainer:null,

    toolBar:null,

    searchInput:null,

    defaultClass:'exmulti' ,

    /**
     * @method  initConfig
     * @param config
     */
    initConfig:function(config){

        Sui.List.superclass.initConfig.apply(this, arguments);

        Sui.applyProps(this, config, [ "itemClass", "itemOverClass", "itemSelectedClass",
            "itemDropHoverClass", "labelField", "valueField","itemWidth"]);

        if (config.store) {
            this.store = config.store;
        } else {
            if (config.items) {
                this.store = new Sui.data.Store(config.items);
            }
        }
    },
    initProperties:function(){
        Sui.List.superclass.initProperties.apply(this);
    },
    render:function(){
        Sui.List.superclass.render.apply(this, arguments);

        this.createLayout();
        this.createList();

    },
    createLayout:function(){

        var applyElement = this.getApplyToElement();
        applyElement.addClass(this.defaultClass);

        //初始化工具栏
        this.toolBar = $('<div class="exmulti_tool"></div>').appendTo(applyElement);
        this.searchInput = $('<input index="0" class="searcher" type="text"/>').appendTo(this.toolBar);
        this.searchInput.keyup(Sui.makeFunction(this,this.onSearcherKeyup));

        var selectAll = $('<a index="1" class="button" href="javascript:void(0);">[全选]</a>').appendTo(this.toolBar),
            selectNone = $('<a index="2" class="button"  href="javascript:void(0);">[不选]</a>').appendTo(this.toolBar),
            sure = $('<a index="3" class="button" href="javascript:void(0);">[确定]</a>').appendTo(this.toolBar),
            cancel = $('<a index="4" class="button" href="javascript:void(0);">[取消]</a> ').appendTo(this.toolBar);

         selectAll.click(Sui.makeFunction(this,this.selectAll));
         selectNone.click(Sui.makeFunction(this,this.selectNone));
         sure.click(Sui.makeFunction(this,this.onSure));
         cancel.click(Sui.makeFunction(this,this.onCancel));

        //初始化已选区域和待选区域
        this.listContainer = $('<div class="exmulti_list"></div>').appendTo(applyElement);
        this.selectedContainer = $('<div class="exmulti_selected_list"></div>').appendTo(applyElement);
    },
    /**
     * @method onSearcherKeyup
     * @param {Event} e
     * @private
     */
    onSearcherKeyup:function(e) {
        this.doSearch(e.currentTarget.value);
    },
    /**
     * 全部选择
     * @method selectAll
     */
    selectAll:function(){
        this.setAllSelected(true);
    },
    /**
     * 全部不选择
     * @method   selectNone
     */
    selectNone:function(){
        this.setAllSelected(false);
    },
    /**
     * 触发并委派selected事件
     * @method onSure
     * @private
     */
    onSure : function() {

        var items = [];
        var selItems = this.selectedContainer.find('.selected_item');

        for (var i = 0; i < selItems.length; i++) {
            var comp = this.list.getComponent( $(selItems[i]).data('index'));
            items.push({
                label : comp.getLabel(),
                value : comp.getValue(),
                item : comp
            });
        }

        this.fireEvent("selected", new Sui.util.Event({
            target : this,
            value : items
        }));

    },
    /**
     *  取消选择时触发
     * @method onCancel
     * @private
     */
    onCancel:function(){
        this.fireEvent("cancel", new Sui.util.Event());
    },
    /**
     * @method setAllSelected
     * @param {Boolean} sel 全选或全不选
     */
    setAllSelected:function(sel) {

        if(!sel){
            this.selectedContainer.empty();
        }

        for (var i = 0; i < this.list.getComponentCount(); i++) {

            var comp = this.list.getComponent(i),
                dom = comp.getApplyToElement();
            if (sel) {
                if( dom.is(':visible')){
                    dom.addClass('sui_listitem_hide').hide();
                    this.addSelectedItem(comp.getLabel(), comp.getValue(), i);
                }
            } else {
                dom.removeClass('sui_listitem_hide').show();
            }
        }
    },
    /**
     * 创建待选列表
     * @method  createList
     * @private
     */
    createList:function(){
        var self= this;

        this.list = new Sui.List({
            store: this.store,
            applyTo: this.listContainer,
            labelField: this.labelField,
            valueField:this.valueField,
            itemWidth:this.itemWidth,
            iconClass:'s_ico s_ico_unchecked',
            listeners:{
                'selected':function(e){
                    self.onListItemSelect(e);
                }
            }
        });
    },
    /**
     * 渲染子组件
     * @method  renderChildren
     * @private
     */
    renderChildren : function() {
        Sui.ExMultiList.superclass.renderChildren.apply(this, arguments);
    },
    /**
     * 渲染之后执行
     * @method afterRender
     * @private
     */
    afterRender : function() {
        Sui.List.superclass.afterRender.apply(this);
    },
    /**
     * 初始化事件
     * @method initEvent
     * @private
     */
    initEvent : function() {
        Sui.List.superclass.initEvent.call(this);
    },
     /**
     * 设置当前组件的value值,组件会勾选与给定参数值匹配的子组件MultiListItem
     * @method  setValue
     * @param {Array} array 由字符串组成的数组，如['apple','boy','cat']
     *
     */
    setValue : function(array) {
        this.selectNone();
        for (var i = 0; i < this.list.getComponentCount(); i++) {
            var comp = this.list.getComponent(i);
            var val = comp.getValue();
            if (Sui.ArrayUtil.contains(array, val)) {
                this.addSelectedItem(comp.getLabel(), comp.getValue(), i);
            }
        }
    },

    /**
     * 选择待选区域中的某个项
     * @merthod  selectedIndexItem
     * @param {Event} event
     */
    onListItemSelect:function(event){
        if (event.item.getApplyToElement().hasClass(this.itemDeletedClass)) {
            return;
        }
        var index = this.list.indexOfComponent(event.item);
        this.addSelectedItem(event.label, event.value, index);
    },
    /**
     * 向已选区域添加选项
     * @method  addSelectedItem
     * @param {String} label
     * @param {String} value
     * @param {Number} index
     */
    addSelectedItem:function(label,value,index){

        //将待选区的选项隐藏
        this.list.getComponent(index).getApplyToElement().addClass(this.itemDeletedClass);
        //在已选区生成一个选项
        var item = $('<div class="selected_item"></div>').width(this.itemWidth),
            icon = $('<b class="s_ico s_ico_checked"></b>').appendTo(item),
            text = $('<label></label>').text(label).attr('title', label).appendTo(item);

        item.data('index',index);
        item.appendTo(this.selectedContainer);
        item.on('click',Sui.makeFunction(this,this.removeSelectItem));
    } ,
    /**
     * @method  removeSelectItem
     * @param {Event} e
     */
    removeSelectItem:function(e){
         var item = Sui.getJQ(e.currentTarget),
            index = item.data('index');

         item.remove();
         this.list.getComponent(index).getApplyToElement().removeClass(this.itemDeletedClass);
    },
    /**
     * 执行待选区域的搜索
     * @method  doSearch
     * @param {String} q 搜索关键词
     */
    doSearch : function(q) {

        if (q === undefined || q === null) {
            q = '';
        }
        if (this.lastQuery == null || this.lastQuery !== q) {
            this.lastQuery = q;

            this.list.filter(q, this.labelField);
            // 让dataView默认选中第一个
            //this.list.selectDefaultElementAfterQuery();
        }

    },
    /**
     * 清除过滤状态
     * @method  clearFilter
     * @private
     */
    clearFilter : function() {

        for (var i = 0; i < this.store.getCount(); i++) {
            this.list.getComponent(i).setSearchMatched(true);
        }
    }
});
