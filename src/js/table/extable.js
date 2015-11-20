/**
 * ==========================================================================================
 * 表格组件
 * 依赖拖动来调整列宽；依赖工具栏来实现顶部工具栏和底部工具栏。DateSelectRender依赖日期组件。
 * ==========================================================================================
 */
Sui.namespace('Sui.table');

/**
 * 声明表格的排序类型，共两种，DESC降序和ASC升序
 * @class Sui
 * @property  SortType
 * @type Object
 */
Sui.SortType = {
    DESC: 'desc',
    ASC: 'asc'
};
/**
 * 声明表格的各种选择方式，如单选SINGLE，多选MULTI
 * @class  Sui.table
 * @property Sui.table.SelectType
 */
Sui.table.SelectType = {
    NONE: 'none',
    MULTI: 'multi',
    SINGLE: 'single'
};
/**
 * 表格渲染器
 * @class Sui.table.Renders
 *
 */
Sui.table.Renders = {
    /**
     * 默认的渲染函数
     * @method DefaultRender
     */
    DefaultRender: function () {
        this.renderBody = function (text, targetElementJQ) {
            targetElementJQ.html(Sui.nullToEmpty(text));
        }
    },

    /**
     * 表格的 checkbox 选择框渲染函数.
     * 属性checkboxAllName 表头中的checkbox的名称；
     * 属性checkboxName 表格中的checkbox的名称
     * @method  CheckboxRender
     * @param {Object} config 配置参数
     */
    CheckboxRender: function (config) {

        this.config = config;

        this.renderBody = function (text, targetElementJQ) {
            var checkbox = $("<input type='checkbox' />").appendTo(targetElementJQ);

            if (Sui.isDefined(this.checkboxName)) {
                checkbox.attr("name", this.checkboxName);
            }
        },

        this.renderHeader = function (display, targetElementJQ) {
            var checkbox = $("<input type='checkbox' />").appendTo(targetElementJQ);

            if (Sui.isDefined(this.checkboxAllName)) {
                checkbox.attr("name", this.checkboxAllName);
            }

        }
    },
    /**
     * 日期选择器的渲染函数
     * @method DateSelectRender
     * @param {Object} config 配置参数
     */
    DateSelectRender: function (config) {

        this.config = config;

        this.renderBody = function (text, parentElementJQ, table, cm) {
            var inputJQ = $('<div class="ipt_extxt" ><input type="text" onclick="WdatePicker()" style="width:80px" name="applyDate" class="dataslice "><b onclick="WdatePicker()" class="s_ico s_ico_date"></b></div>');

            inputJQ.appendTo(parentElementJQ);
        }
    },
    /**
     * 隐藏的文本组件的渲染函数
     * @method HiddenTextRender
     * @param {Object} config
     */
    HiddenTextRender: function (config) {

        this.config = config || {};

        this.renderBody = function (text, parentElementJQ, table, cm) {

            parentElementJQ.append(text);
            $("<input type='hidden' />").attr("name", cm.name).val("" + text).appendTo(parentElementJQ);
        }
    },
    /**
     * 文本输入框的渲染函数
     * @method  InputTextRender
     * @param {Object} config 配置参数
     * @param {String} config.prefix 前缀，添加到输入框前面
     * @param {String} config.suffix 后缀，添加到输入框后面
     */
    InputTextRender: function (config) {

        this.config = config || {};

        this.renderBody = function (text, parentElementJQ, table, cm) {

            // 添加前缀
            if (this.config.prefix) {
                parentElementJQ.append(this.config.prefix);
            }

            // 添加输入框
            var inputJQ = $("<input />").val("" + text);

            if (this.config) {
                if (Sui.isDefined(this.config['class'])) {
                    inputJQ.addClass(this.config['class']);
                }
                if (Sui.isDefined(this.config['width'])) {
                    inputJQ.width(this.config['width']);
                }
            }
            inputJQ.appendTo(parentElementJQ);

            // 添加后缀
            if (this.config.suffix) {
                parentElementJQ.append(this.config.suffix);
            }
        }
    },

    /**
     * 下拉选择菜单的渲染函数
     * @method SelectRender
     * @param {Object} config 配置参数
     * @param {Array} initDatas属性,初始的配置数据
     */
    SelectRender: function (config) {

        this.config = config;

        this.renderBody = function (text, parentElementJQ, table, cm) {

            var arr = config.initDatas;

            var select = $("<select></select>");
            Sui.each(arr, function (item) {
                $("<option></option>").text(item).appendTo(select);
            });

            select.appendTo(parentElementJQ);
        }
    },
    /**
     * 百分比进度条的渲染函数
     * @method  PercentRender
     * @param {Object} config 配置参数
     */
    PercentRender: function (config) {

        this.config = config;

        this.renderBody = function (val, parentElementJQ) {

            val = parseFloat(val);

            var percentString = val * 100 + "%";

            var outDiv = $("<div></div>").appendTo(parentElementJQ);

            var innerDiv = $("<div></div>").text(percentString).appendTo(outDiv);

            if (val > 1) {
                innerDiv.css("background-color", "#f66");
            } else {
                innerDiv.css("background-color", "#33CC00");
            }
        }
    },
    /**
     * textarea(点击时,会自动切换样式的textarea)的渲染函数
     * @method GrowTextareaRender
     * @param {Object} config
     */
    GrowTextareaRender: function (config) {
        this.config = config;

        this.renderBody = function (text, parentElementJQ) {
            var inputJQ = $("<textarea></textarea>").val("" + text);
            inputJQ.appendTo(parentElementJQ);

            var config = this.config;
            if (config) {

                if (Sui.isDefined(config['class'])) {
                    inputJQ.addClass(config['class']);
                }

                if (Sui.isDefined(config.focusClass)) {
                    inputJQ.focus(function () {
                        inputJQ.addClass(config.focusClass);
                    });

                    inputJQ.blur(function () {
                        inputJQ.removeClass(config.focusClass);
                    })
                }
            }

        }
    },
    /**
     * 日期字段的渲染函数
     * @method DateRender
     * @param {String} format 日期格式，默认为 yyyy-MM-dd
     */
    DateRender: function (format) {
        return function (val, parentElementJQ) {
            if (Sui.isDate(val)) {
                val = Sui.DateUtil.format(val, "yyyy-MM-dd");
            }
            $("<span></span>").text("" + val).appendTo(parentElementJQ);
        }
    }
};
/**
 * 文本编辑器的样式
 * @class Sui
 * @property textEditorClassName
 *
 */
Sui.textEditorClassName = "Sui.table.TextEditor";
/**
 * 文本编辑器
 * @class Sui.table.TextEditor
 * @extends Sui.Layer
 */
Sui.table.TextEditor = Sui.extend(Sui.Layer, {

    customClass: 'sui_texteditor',
    field: null,

    listenBlurEvent: true,

    cellEditingInfo: null,
    /**
     * 根据配置参数进行初始化
     * @method initConfig
     * @param config
     */
    initConfig: function (config) {

        Sui.table.TextEditor.superclass.initConfig.apply(this, arguments);
        if (!this.field) {
            if (config.fieldConfig) {
                this.field = this.createField(config.fieldConfig);
            } else {
                this.field = this.createField(config);
            }
        }

        var field = this.field;
        this.addComponent(field);
    },
    /**
     * 获取field组件
     * @method getFieldComponent
     * @return {Sui.form.TextField}
     */
    getFieldComponent : function(){
        return this.field;
    },
    /**
     * 创建field组件
     * @method createField
     * @param fieldConfig
     * @return {Sui.form.TextField}
     */
    createField: function (fieldConfig) {
        return new Sui.form.TextField(fieldConfig);
    },
    /**
     * 初始化事件监听
     * @method initEvent
     * @private
     */
    initEvent: function () {
        Sui.table.TextEditor.superclass.initEvent.apply(this, arguments);
        this.field.on("keydown", Sui.makeFunction(this, this.onFieldKeyDown))

        if (this.listenBlurEvent) {
            this.field.on("blur", Sui.makeFunction(this, this.onBlur));
        }
    },
    /**
     * field区域失去焦点时触发
     * @method onBlur
     */
    onBlur: function () {
        this.completeEdit();
    },
    /**
     * field区域有键盘敲击事件时触发
     * @method onFieldKeyDown
     * @param {Event} event
     */
    onFieldKeyDown: function (event) {
        var originalEvent = event.originalEvent;
        var KEY = Sui.KEY;
        switch (originalEvent.keyCode) {
            case KEY.RETURN:
                this.completeEdit();
                break;
            case KEY.ESC :
                this.cancelEdit();
                break;
        }
    },
    /**
     * 设置组件的外部宽度
     * @method setOuterWidth
     * @param {Number} width
     */
    setOuterWidth: function (width) {
        Sui.table.TextEditor.superclass.setOuterWidth.apply(this, arguments);
        this.field.setOuterWidth(this.getWidth());
    },

    /**
     * 开启编辑器
     * @method  startEdit
     * @param {DOM} cellDom 编辑器对应的表格单元格DOM
     * @param {String} cellVal 单元格内文本值
     * @param {Sui.table.ExTable}
     * @param {Sui.data} record 数据
     * @private
     */
    startEdit: function (cellDom, cellVal, table, record) {

        this.fireEvent("beforeStartEdit", new Sui.util.Event({
            record : record,
            table : table
        }));

        this.cellEditingInfo = {
            record: record,
            table: table
        };

        this.show();
        this.addExcludeElementsClick(cellDom);
        this.locateEditor($(cellDom));

        this.field.focus();
        this.initFieldValue(cellDom, cellVal, table, record);
    },
    /**
     * @method locateEditor
     * @param cellDom
     * @param cellVal
     * @param table
     */
    locateEditor:function(cellElement) {

        this.setOuterWidth(Sui.getDomWidth(cellElement));
        this.setOuterHeight(Sui.getDomHeight(cellElement));
        Sui.alignTo(this.getApplyToElement(), cellElement, {
            src: 'lt',
            dest: 'lt',
            hspan: 1,
            vspan: 1
        });
    },
    /**
     * 初始化field组件的值
     * @method initFieldValue
     * @param {DOM} cellDom 表格单元格的DOM
     * @param {String} cellVal 表格单元格的文本值
     * @param {Sui.table.ExTable}
     */
    initFieldValue: function (cellDom, cellVal, table) {
        //Sui.log("设置TextEditor的值为: " + cellVal);
        this.field.setValue(cellVal || '');
    },

    /**
     * 验证值是否有效
     * @mehtod validateValue
     * @return {Boolean}
     */
    validateValue: function (val) {
        return true;
    },
    /**
     * 完成编辑时派发事件 completeEdit
     * @method completeEdit
     * @param {String} val
     */
    completeEdit: function (val) {

        Sui.debugMethodCall(Sui.textEditorClassName, "completeEdit");

        this.hide();

        if (Sui.isUndefined(val)) {
            val = this.field.getValue();
        }

        val = this.beforeCompleteEdit(val);

        if (this.validateValue(val)) {

            Sui.log("触发completeEdit事件，值为: " + val);

            this.fireEvent("completeEdit", new Sui.util.Event({
                value: val
            }));
        }

    },
    /**
     * 在完成编辑之前执行,返回输入值
     * @method   beforeCompleteEdit
     * @param val
     * @return {String}
     */
    beforeCompleteEdit: function (val) {
        return val;
    },
    /**
     * 取消编辑，派发事件 cancelEdit
     * @method  cancelEdit
     */
    cancelEdit: function () {
        Sui.debugMethodCall(Sui.textEditorClassName, "cancelEdit");

        this.hide();
        this.fireEvent("cancelEdit", new Sui.util.Event());
    }

});
/**
 * 百分比编辑器
 * @class Sui.table.PercentEditor
 * @extends Sui.table.TextEditor
 */
Sui.table.PercentEditor = Sui.extend(Sui.table.TextEditor, {

    // toFixed是转换成百分比后,小数点后的位数
    toFixed: null,
    /**
     * 根据配置参数进行初始化
     * @method  initConfig
     * @param config  配置参数
     */
    initConfig: function (config) {
        config = config || {};
        Sui.table.PercentEditor.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ["toFixed"]);
    },
    /**
     * 触发编辑器
     * @method startEdit
     * @param {DOM} cellDom
     * @param {String} cellVal
     * @param {Sui.table.ExTable}
     * @private
     */
    startEdit: function (cellDom, cellVal, table) {

        cellVal = Sui.isUndefinedOrNull(cellVal) ? "" : cellVal;
        if (cellVal != "") {
            cellVal = (parseFloat(Sui.StringUtil.trim(cellVal)) * 100).toFixed(this.toFixed);
        }
        Sui.table.PercentEditor.superclass.startEdit.apply(this, arguments);

    },
    /**
     * 在完成编辑前执行
     * @method  beforeCompleteEdit
     * @param {Number} val
     * @return {Number}
     */
    beforeCompleteEdit: function (val) {

        val = Sui.isUndefinedOrNull(val) ? "" : val;
        if (val != "") {
            // toFixed必须加2
            val = (parseFloat(Sui.StringUtil.trim(val)) / 100).toFixed(this.toFixed + 2);
        }

        return val;

    },
    /**
     * 创建输入组件，NumberField 组件
     * @method  createField
     * @param {Object} fieldConfig
     */
    createField: function (fieldConfig) {
        return new Sui.form.NumberField(fieldConfig);
    }

});
/**
 * 数字编辑器
 * @class  Sui.table.NumberEditor
 * @extends Sui.table.TextEditor
 */
Sui.table.NumberEditor = Sui.extend(Sui.table.TextEditor, {

    toFixed: null,
    /**
     * 根据配置参数初始化
     * @method initConfig
     * @param {Object} config
     */
    initConfig: function (config) {
        config = config || {};
        Sui.table.NumberEditor.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ["toFixed"]);
    },
    /**
     * 触发编辑器
     * @method  startEdit
     * @param cellDom
     * @param cellVal
     * @param table
     * @private
     */
    startEdit: function (cellDom, cellVal, table) {

        cellVal = Sui.isUndefinedOrNull(cellVal) ? "" : cellVal;
        if (cellVal != "") {
            if (Sui.isDefinedAndNotNull(this.toFixed)) {
                cellVal = parseFloat(Sui.StringUtil.trim(cellVal)).toFixed(this.toFixed);
            }
        }
        Sui.table.NumberEditor.superclass.startEdit.apply(this, arguments);

    },
    /**
     * 在完成编辑之前
     * @method  beforeCompleteEdit
     * @param {String} val
     */
    beforeCompleteEdit: function (val) {

        val = Sui.isUndefinedOrNull(val) ? "" : val;
        if (val != "") {
            if (Sui.isDefinedAndNotNull(this.toFixed)) {
                val = parseFloat(Sui.StringUtil.trim(val)).toFixed(this.toFixed);
            }
        }
        return val;
    },
    /**
     * 创建输入组件，NumberField组件
     * @param {Object} fieldConfig
     */
    createField: function (fieldConfig) {
        return new Sui.form.NumberField(fieldConfig);
    }

});
/**
 * 下拉选择编辑组件
 * @class  Sui.table.SelectEditor
 * @extends Sui.table.TextEditor
 */
Sui.table.SelectEditor = Sui.extend(Sui.table.TextEditor, {

    field: null,

    listenBlurEvent: false,
    /**
     * 根据配置参数进行初始化
     * @method initConfig
     * @param {Object} config
     */
    initConfig: function (config) {

        Sui.table.SelectEditor.superclass.initConfig.apply(this, arguments);

        var field = this.field;
        this.addComponent(field);

        field.on("selected", Sui.makeFunction(this, this.onDataSelected));
    },
    /**
     * 创建输入组件，ComboBox组件
     * @method  createField
     * @param {Object} fieldConfig
     */
    createField: function (fieldConfig) {
        return new Sui.form.DropList(fieldConfig);
    },
    /**
     * 触发编辑器
     * @method
     * @param {DOM} cellDom
     * @param {String} cellVal
     * @param {Sui.table.ExTable}
     */
    startEdit: function (cellDom, cellVal, table) {
        Sui.table.SelectEditor.superclass.startEdit.apply(this, arguments);

        // 点击时，自动弹出选择对话框
//        this.field.addExcludeElementsClick(this.lastCellDom);
//        this.field.addExcludeElementsClick(cellDom);
        this.lastCellDom = cellDom;

        //this.field.expand();
    },
    /**
     * 当有数据被选择时执行
     * @method onDataSelected
     */
    onDataSelected: function () {
        this.completeEdit();
    }

});
/**
 * 树状下拉选择菜单组件
 * @class   Sui.table.TreeFieldEditor
 * @extends  Sui.table.SelectEditor
 */
Sui.table.TreeFieldEditor = Sui.extend(Sui.table.SelectEditor, {
    /**
     * 触发编辑器
     * @method startEdit
     * @param {DOM} cellDom
     * @param {String} cellVal
     * @param {Sui.table.ExTable}
     */
    startEdit: function (cellDom, cellVal, table) {

        // 清空原来的选项
        var tree = this.field.getTree();
        tree.clearSelectedNodes();
        if (cellVal) {
            var node = tree.findTreeNodeByAttr("id", cellVal);
            if (node) {
                tree.setSelectedNode(node);
            }
        }

        Sui.table.TreeFieldEditor.superclass.startEdit.apply(this, arguments);

    },
    /**
     * 重置任务树的节点数据
     * @method resetTreeData
     * @param {Data} treeData
     */
    resetTreeData : function(treeData){
       this.field.getTree().resetTreeData(treeData);
    }
});
/**
 * 日期选择组件
 * @class  Sui.table.DateEditor
 * @extends Sui.table.TextEditor
 */
Sui.table.DateEditor = Sui.extend(Sui.table.TextEditor, {
    /**
     * 根据配置参数初始化
     * @mehtod initConfig
     * @param {Object} config
     */
    initConfig: function (config) {

        Sui.table.DateEditor.superclass.initConfig.apply(this, arguments);

        var field = this.field;
        this.addComponent(field);

        field.on("selected", Sui.makeFunction(this, this.onDateSelected));
    },
    /**
     * 创建输入组件
     * @mehtod  createField
     * @param {Object} fieldConfig
     */
    createField: function (fieldConfig) {
        return new Sui.form.DateField(fieldConfig);
    },
    /**
     * 触发编辑
     * @method startEdit
     * @param {DOM} cellDom
     * @param {String} cellVal
     */
    startEdit: function (cellDom, cellVal) {
        Sui.table.DateEditor.superclass.startEdit.apply(this, arguments);

        // 点击时，自动弹出选择对话框
//        this.field.addExcludeElementsClick(this.lastCellDom);
//        this.field.addExcludeElementsClick(cellDom);
        this.lastCellDom = cellDom;
        //this.field.expand();
    },
    /**
     * 当有数据被选择时执行
     * @method  onDateSelected
     */
    onDateSelected: function () {
        this.completeEdit();
    },
    /**
     * field区域失去焦点时触发
     * @method onBlur
     */
    onBlur: function () {
       //this.completeEdit();
       //该行为会导致无浮动层时点击图标，整个组件消失
    }

});
/**
 * 段落编辑组件
 * @class  Sui.table.TextAreaEditor
 * @extends  Sui.table.TextEditor
 */
Sui.table.TextAreaEditor = Sui.extend(Sui.table.TextEditor,{
    createField:function(fieldConfig){
        return new Sui.form.TextAreaField(fieldConfig);
    }
});
/**
 *
 * @class Sui.table
 * @property  Sui.table.ColumnTypes
 * @type Object
 */
Sui.table.ColumnTypes = {
    defaultColumn : '',
    sequenceColumn : 'sequenceColumn'
}
/**
 * 表格列管理器
 * @class Sui.table.ColumnManager
 */
Sui.table.ColumnManager = {
    /**
     * 创建 ColumnModel 组件
     * @method createColumnModel
     * @param columnConfig
     */
    createColumnModel : function(columnConfig){
        var columnType = columnConfig.columnType;
        if(columnType == 'sequenceColumn'){
            return new Sui.table.SequenceColumnModel(columnConfig);
        }
        return new Sui.table.ColumnModel(columnConfig);
    }
}
/**
 * 表格列模板
 * @class  Sui.table.ColumnModel
 * @extends Sui.util.Observable
 */
Sui.table.ColumnModel = Sui.extend(Sui.util.Observable, {
    /**
     * 构造器
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
        Sui.table.ColumnModel.superclass.constructor.apply(this, arguments);
        this.initProperties();
        Sui.apply(this, config);
    },
    /**
     * 初始化属性，空函数，可被重写
     * @method  initProperties
     */
    initProperties: Sui.emptyFn,
    /**
     * 渲染表内容的函数
     * @property  renderBody
     * @type Function
     * @default null
     */
    renderBody: null,
    /**
     * 是否自动生成一个hidden元素
     * @property  renderHiddenField
     * @default false
     */
    renderHiddenField: false,
    /**
     * 渲染表头的函数
     * @property  renderHeader
     * @type Function
     * @default null
     */
    renderHeader: null,
    /**
     * 列头的名称
     * @property name
     * @type String
     * @default ''
     */
    name: "",
    /**
     * 表头的内容
     * @property display
     * @type String
     * @default null
     */
    display: null,
    /**
     * 表头的内容当作文本还是当作html内容
     * @property displayAsText
     * @type Boolean
     * @default false
     */
    displayAsText: false,
    /**
     * 控制列是否可见的下拉菜单中的文本
     * @property  hideColumnLabel
     * @type String
     * @default null
     */
    hideColumnLabel: null,
    /**
     * 升序还是降序
     * @property sort
     * @type  String
     * @default null
     */
    sort: null,
    /**
     * 是否可排序
     * @property sortable
     * @type Boolean
     * @default null
     */
    sortable: null,
    /**
     * 宽度
     * @property width
     * @type Number
     * @default 80
     */
    width: 80,
    /**
     * 最小宽度
     * @property minWidth
     * @type Number
     * @default undefined
     */
    minWidth: undefined,
    /**
     * 是否可见. 会生成相应的元素.
     * @property visible
     * @type Boolean
     * @defualt true
     */
    visible: true,
    /**
     * 文字对齐方向,有left、right、center三种
     * @property align
     * @type String
     * @default 'left'
     */
    align: 'left',
    /**
     * 单元格的编辑器。如果没有定义编辑器，单元格是不能编辑的。
     * @property editor
     * @type Mixed
     * @default null
     */
    editor: null,
    /**
     * 合并的行数
     * @property rowspan
     * @type Number
     * @default 1
     */
    rowspan: 1,
    /**
     * 合并的列数
     * @property colspan
     * @type Number
     * @default 1
     */
    colspan: 1,
    /**
     * 使用动态的Editor
     * @property  useDynamicEditor
     * @type Boolean
     * @defult false
     */
    useDynamicEditor: false,
     /**
     * 单元格是否需要title属性
     */
    needTitle:false,
    /**
     * 在table组件初始化事件之后,调用ColumnModel去初始化事件
     */
    initEventOnTable : Sui.emptyFn,
    /**
     * 判断是在使用动态编辑器
     * @method  isUseDynamicEditor
     * @return Mixed
     */
    isUseDynamicEditor: function () {
        return this.useDynamicEditor;
    },
    /**
     * 包含多个参数val, record
     * @method onCompleteEdit
     * @param val
     * @param record
     */
    onCompleteEdit: Sui.emptyFn,
    /**
     * 当编辑完成时派发事件 editorCompleteEdit
     * @method  onEditorCompleteEdit
     * @param  {Event} e
     */
    onEditorCompleteEdit: function (e) {
        this.fireEvent("editorCompleteEdit", e);
    },
    /**
     * 包含多个参数cellDom, cellVal, record, index
     */
    getDynamicEditor: Sui.emptyFn,
    /**
     * 获得编辑器
     * @method  getEditor
     * @param {DOM} cellDom 单元格的DOM
     * @param {String} cellVal  单元格内文本值
     * @param {Sui.data.Record} record
     * @param {Number} index
     */
    getEditor: function (cellDom, cellVal, record, index) {
        if (this.useDynamicEditor) {
            var editor = this.getDynamicEditor.apply(this, arguments);
            editor.on("completeEdit", Sui.makeFunction(this, this.onEditorCompleteEdit));
            return editor;
        } else {
            return this.editor;
        }
    },
    /**
     * 判断是否存在编辑器
     * @method  existEditor
     * @return {Boolean}
     */
    existEditor: function () {
        if (this.useDynamicEditor) {
            return true;
        } else {
            return Sui.isDefinedAndNotNull(this.editor);
        }
    },

    /**
     * 判断单元格是否可编辑。
     * 如果定义了editor，并不是所有单元格都可编辑，还需要根据isEditable函数进行判断。
     * 默认返回true。
     * @method isEditable
     * @return {Boolean}
     */
    isEditable: function (cellVal, columnModel, index, record, table) {
        return true;
    },
    /**
     * 获得colspan属性
     * @method  getColspan
     * @return {Number}
     */
    getColspan: function () {
        return this.colspan;
    },
    /**
     * 获得rowspan属性
     * @method  getRowspan
     * @return {Number}
     */
    getRowspan: function () {
        return this.rowspan;
    },
    /**
     * 设置 rowspan 属性值
     * @method  setRowspan
     * @param {Number} rowspan
     */
    setRowspan: function (rowspan) {
        this.rowspan = rowspan;
    },
    /**
     * 获得name 属性值
     * @return {String}
     */
    getName : function(){
        return this.name;
    },
    /**
     * 设置width属性值
     * @method setWidth
     * @param {Number} val
     *
     */
    setWidth:function(val){
        if(Sui.isNumber(val)){
            this.width = val;
        }
    }

});
/**
 * 用于显示行序号的表格列
 * @class   Sui.table.SequenceColumnModel
 * @extends   Sui.table.ColumnModel
 */
Sui.table.SequenceColumnModel = Sui.extend(Sui.table.ColumnModel, {
    /**
     * 渲染组件
     * @method renderBody
     * @param {String} text
     * @param {$DOM} targetElementJQ
     * @param {Sui.table.ExTable}
     * @param {Sui.table.columnModel} columnModel
     * @param {Sui.data.Record} record
     * @param {Number} rowIndex
     */
    renderBody: function (text, targetElementJQ, table, columnModel, record, rowIndex){
        targetElementJQ.append(rowIndex + 1);
    },
    /**
     * 初始化事件
     * @method initEventOnTable
     * @param {Sui.table.ExTable}
     */
    initEventOnTable: function (table) {

        var thisColumnModel = this;

        table.on('afterAddRow', function (e) {
            thisColumnModel.onAfterAddRow(e);
        });

        table.on('afterRemoveRow', function (e) {
            thisColumnModel.onAfterRemoveRow(e);
        });

    },
    /**
     * 添加新行后执行，刷新整个表格列
     * @mehtod onAfterAddRow
     * @param {Event} e
     */
    onAfterAddRow : function(e){
        var table = e.target;
        table.refreshColumn(this);
    },
    /**
     * 删除某行数据后执行，刷新整个表格列
     * @method  onAfterRemoveRow
     * @param {Event} e
     */
    onAfterRemoveRow : function(e){
        var table = e.target;
        table.refreshColumn(this);
    }

});
/**
 * checkbox列，用于进行选择操作
 * @class Sui.table.CheckboxColumnModel
 * @extends  Sui.table.ColumnModel
 *
 */
Sui.table.CheckboxColumnModel = Sui.extend(Sui.table.ColumnModel, {

    width: 36,
    hideColumnLabel: '全选',

    // 表头的多选框
    checkboxAll: null,
    // 表头多选框的名称
    checkboxAllName: "",
    // 表内容中的多选框
    checkboxs: null,
    // 表内容中的多选框的名称
    checkboxName: "",
    /**
     * 初始化各种属性
     * @method  initProperties
     * @private
     */
    initProperties: function () {
        Sui.table.CheckboxColumnModel.superclass.initProperties.apply(this, arguments);
        this.checkboxs = [];
    },
    /**
     * 渲染头部
     * @method  renderHeader
     * @param {String} text
     * @param {$DOM} targetElementJQ
     */
    renderHeader: function (text, targetElementJQ) {
//        var inner = $('<div class="headercell_inner"></div>');
        var checkboxJQ = this.checkboxAll = $("<input type='checkbox' />");

        checkboxJQ.appendTo(targetElementJQ);

        if (Sui.isDefined(this.checkboxAllName)) {
            checkboxJQ.attr("name", this.checkboxAllName);
        }

        checkboxJQ.click(Sui.makeFunction(this, this.onCheckboxAllClick));

    },
    /**
     * 当全选checkbox被点击时触发
     * @method  onCheckboxAllClick
     * @param {Event} e
     * @private
     */
    onCheckboxAllClick: function (e) {
        var checked = !!$(e.target).attr("checked");
        this.setAllChecked(checked);
    },
    /**
     * 渲染组件
     * @method  renderBody
     * @param {String} text
     * @param {$DOM} targetElementJQ
     * @param {Sui.table.ExTable}
     * @param {Sui.table.columnModel} columnModel
     * @param {Sui.data.Record} record
     * @param {Number} rowIndex
     */
    renderBody: function (text, targetElementJQ, table, columnModel, record, rowIndex) {
        var checkboxVisibleColumn = table.getCheckboxVisibleColumn();

        // 判断是否要生成checkbox
        var renderCheckbox = true;
        if (Sui.isString(checkboxVisibleColumn)) {
            renderCheckbox = record.getFieldValue(checkboxVisibleColumn);
        } else if (Sui.isFunction(checkboxVisibleColumn)) {
            renderCheckbox = checkboxVisibleColumn(record);
        }

        if (renderCheckbox) {
            var checkboxJQ = $("<input type='checkbox' />").appendTo(targetElementJQ);

            if (Sui.isDefined(this.checkboxName)) {
                checkboxJQ.attr("name", this.checkboxName);
            }

            checkboxJQ.click(Sui.makeFunction(this, this.onCheckboxClick));
        }

        Sui.ArrayUtil.add(this.checkboxs, checkboxJQ, rowIndex);

    },
    /**
     * 当checkbox(除了全选checkbox)被点击时触发，派发事件 click
     * @method onCheckboxClick
     * @param {Event} e
     */
    onCheckboxClick: function (e) {
        var checked = !!$(e.target).attr("checked");

        this.updateCheckboxAllState(checked);

        this.fireEvent("click", new Sui.util.Event({
            index: this.getIndexOfCheckbox(e.target),
            checked: checked
        }));
    },
    /**
     * 获取选中行的索引
     * @method getCheckedIndexs
     * @return {Array} 返回由行索引组成的数组
     */
    getCheckedIndexs: function () {
        var ret = [];

        Sui.each(this.checkboxs, function (checkbox, i) {
            if (checkbox && checkbox.attr("checked")) {
                ret.push(i);
            }
        });

        return ret;

    },
    /**
     * 判断某行的选中状态是否与给定的状态匹配
     * @method isChecked
     * @param {Number} rowIndex
     * @param {Boolean} checked  期望的状态，默认为true
     * @return {Boolean}
     */
    isChecked: function (rowIndex, checked) {
        return Sui.isChecked(this.checkboxs[rowIndex], checked);
    },
    /**
     * 判断全部行的选中状态是否给定的状态匹配
     * @method  isAllChecked
     * @param {Array} rowIndexs  由行索引值组成的数组
     * @param {Boolean} checked  期望的状态，默认为true
     */
    isAllChecked: function (rowIndexs, checked) {
        var ret = true;

        var thisCM = this;
        Sui.each(rowIndexs, function (rowIndex) {
            if (thisCM.isChecked(rowIndex, !checked)) {
                ret = false;
                return false;
            }
        });

        return ret;
    },
    /**
     * 设置某行的选中状态
     * @method  setChecked
     * @param {Number} rowIndex
     * @param {Boolean} checked
     */
    setChecked: function (rowIndex, checked) {
        this.setCheckeds([rowIndex], checked);
    },
    /**
     * 设置全部行的选中状态
     * @method  setAllChecked
     * @param {Boolean} checked
     */
    setAllChecked: function (checked) {
        this.setCheckeds(this.checkboxs, checked);
    },
    /**
     * 设置指定若干行的选中状态
     * @method  setCheckeds
     * @param {Array} rowIndexs
     * @param {Boolean} checked
     */
    setCheckeds: function (rowIndexs, checked) {
        var thisCM = this;
        Sui.each(rowIndexs, function (rowIndex) {
            var checkbox = rowIndex;
            if (Sui.isNumber(checkbox)) {
                checkbox = thisCM.checkboxs[rowIndex];
            }

            if (checkbox) {
                checkbox.attr("checked", checked);
            }

        });

        this.updateCheckboxAllState(checked);

    },
    /**
     * 更新全部checkbox的状态
     * @method  updateCheckboxAllState
     * @param {Boolean} checked
     * @private
     */
    updateCheckboxAllState: function (checked) {
        var checkboxs = this.checkboxs;
        var checkboxAll = this.checkboxAll;
        if (checked) {
            if (Sui.isAllChecked(checkboxs, true)) {
                checkboxAll.attr("checked", true);
            }
        } else {
            if (!Sui.isAllChecked(checkboxs, true)) {
                checkboxAll.attr("checked", false);
            }
        }
    },
    /**
     * 当有行删除时执行
     * @method  onRemoveRow
     * @param {Number} rowIndex
     */
    onRemoveRow: function (rowIndex) {
        Sui.ArrayUtil.removeByIndex(this.checkboxs, rowIndex);

        if (this.checkboxs.length == 0) {
            Sui.setChecked(this.checkboxAll, false);
        }
    },
    /**
     * 获得某个checkbox所对应行的索引值
     * @method  getIndexOfCheckbox
     * @param {Boolean} checkbox
     * @return {Number}
     */
    getIndexOfCheckbox: function (checkbox) {
        var index = 0;

        Sui.each(this.checkboxs, function (checkboxJQ, i) {
            if (Sui.getDom(checkboxJQ) == Sui.getDom(checkbox)) {
                index = i;
                return false;
            }
        });
        return index;
    }

});

/**
 * 二维数据(是n*m的二维数组)。用于协助实现多行列头，
 * 其中第一纬数据为行，第二维数据为列
 * @class Sui.TwoArray
 * @extends Object
 *
 */
Sui.TwoArray = Sui.extend(Object, {
    /**
     * 构造器
     * @constructor
     */
    constructor: function () {
        this.grid = [];
    },
    /**
     * 获得某行的第二维数据
     * @method  getRow
     * @param {Number} row
     * @param {Boolean} createIfNotExist  如果数据不存在是否要创建
     */
    getRow: function (row, createIfNotExist) {
        var rowObject = this.grid[row];
        if (createIfNotExist && Sui.isUndefinedOrNull(rowObject)) {
            rowObject = [];
            this.grid[row] = rowObject;
        }
        return rowObject;
    },
    /**
     * 获得某行的数据长度
     * @method getRowLength
     * @param {Number} row
     */
    getRowLength: function (row) {
        var rowObject = this.getRow(row);
        return Sui.isUndefinedOrNull(rowObject) ? 0 : rowObject.length;
    },
    /**
     * @mehtod  setValue
     * @param {Number} row 行索引
     * @param {Number} col 列索引
     * @param {String} value
     */
    setValue: function (row, col, value) {
        var row = this.getRow(row, true);
        row[col] = value;
    },
    /**
     * 取得最后一行的数据
     * @method getLastRow
     * @return {Array}
     */
    getLastRow: function () {
        return this.grid[this.grid.length - 1];
    },
    /**
     * 取得最后一行某列的值
     * @method  getValueInLastRow
     * @param  {Number} col
     */
    getValueInLastRow: function (col) {
        return this.getLastRow()[col];
    },
    /**
     * 获得行数
     * @method   getRowCount
     * @return {Number}
     */
    getRowCount: function () {
        return this.grid.length;
    }

});
/**
 * 多行列头
 * @class  Sui.table.MultiRowColumnModels
 * @construsctor
 * @param {Array} columnsArray  列头数据，是二维数组，子数组的长度有可能不同（这点与Sui.TwoArray不同）
 */
Sui.table.MultiRowColumnModels = function (columnsArray) {

    Sui.apply(this, {
        /**
         * 初始化
         * @method init
         * @param columnsArray
         */
        init: function (columnsArray) {

            this.columnModelsArray = [];

            for (var row = 0; row < columnsArray.length; row++) {
                var columnModels = [];

                var columns = columnsArray[row];
                for (var col = 0; col < columns.length; col++) {
                    columnModels[col] = Sui.table.ColumnManager.createColumnModel(columns[col]);
                }

                this.columnModelsArray.push(columnModels);
            }

            this.initRenderColumModel();

        },
        /**
         *
         */
        initEventOnTable : Sui.emptyFn,
        /**
         * 将构造参数columnsArray处理为n*m的二维数组
         * @method initRenderColumModel
         */
        initRenderColumModel: function () {

            var twoArray = new Sui.TwoArray();
            for (var row = 0; row < this.columnModelsArray.length; row++) {
                var columnModels = this.columnModelsArray[row];

                for (var col = 0; col < columnModels.length; col++) {
                    var columnModel = columnModels[col];
                    var length = twoArray.getRowLength(row);

                    for (var i = 0; i < columnModel.getRowspan(); i++) {
                        for (var j = 0; j < columnModel.getColspan(); j++) {
                            twoArray.setValue(row + i, length + j, columnModel);
                        }
                    }
                }
            }

            this.columnModelGrid = twoArray;
        },
        /**
         * 获得表头的行数
         * @method getHeaderRowCount
         * @return {Number}
         */
        getHeaderRowCount: function () {
            return this.columnModelsArray.length;
        },
        /**
         * 获得表头某行的列数
         * @method  getColumnCount
         * @param {Number} rowIndex
         * @return {Number}
         */
        getColumnCount: function (rowIndex) {
            return this.columnModelsArray[rowIndex].length;
        },
        /**
         * 获得指定行、列所在的 ColumnModel
         * @method getColumnModelByRowCol
         * @param row
         * @param col
         * @return {Sui.table.columnModel}
         */
        getColumnModelByRowCol: function (row, col) {
            return this.columnModelsArray[row][col];
        },
        /**
         * 获得列中的行数
         * @method getRenderColumnCount
         * @return {Number}
         */
        getRenderColumnCount: function () {
            return this.columnModelGrid.getRowLength(0);
        },
        /**
         * 获得最后一行中某列的值
         * @method  getRenderColumnModel
         * @param {Number} col
         * @return {Number}
         */
        getRenderColumnModel: function (col) {
            return this.columnModelGrid.getValueInLastRow(col);
        },
        /**
         * 添加某行数据
         * @method add
         * @param {Array} item
         * @param {Number} index
         */
        add: function (item, index) {
            item.setRowspan(this.columnModelGrid.getRowCount());
            Sui.ArrayUtil.add(this.columnModelsArray[0], item, index);

            this.initRenderColumModel();
        },
        /**
         * 通过索引值获取对应的columnModel
         * @method getColumnModelByIndex
         * @param {Number} index
         * @return {columnModel}
         */
        getColumnModelByIndex: function (index) {
            return this.getRenderColumnModel(index);
        },
        /**
         * 通过列名或索引值获取对应的columnModel
         * @method  getColumnModel
         * @param {String|Number} columnName
         * @return  {columnModel}
         */
        getColumnModel: function (columnName) {
            if (Sui.isNumber(columnName)) {
                var index = columnName;
            } else {
                var index = this.getColumnIndex(columnName);
            }
            return this.getRenderColumnModel(index);
        },
        /**
         * 通过columnName获取列索引值
         * @method   getColumnIndex
         * @param {String} columnName
         * @return {Number}
         */
        getColumnIndex: function (columnName) {
            var index = -1;
            Sui.each(this.columnModelGrid.getLastRow(), function (cm, i) {
                if (cm.name == columnName) {
                    index = i;
                    return false;
                }
            });
            return index;
        },
        /**
         * 计算表格的宽度
         * @method  calcTotalWidth
         * @return {Number}
         */
        calcTotalWidth: function () {
            var totalWidth = 0;
            for (var i = 0; i < this.getRenderColumnCount(); i++) {
                var columnModel = this.getRenderColumnModel(i);
                if (columnModel.visible) {
                    totalWidth += parseInt(columnModel.width);
                }
            }
            return totalWidth;
        }

    });

    this.init(columnsArray);

    return this;
};
/**
 * 表格列头集合，用于协助渲染数据表格的一部分，
 * 构造参数可参照实例
 * @class  Sui.table.ColumnModels
 * @param {Array} columns
 * @example
 *  <pre><code>
 *   columns: [
 *      {
 *          display: '名称',
 *          name: 'name',
 *          width: 100,
 *          editor : new Sui.table.TextEditor(),
 *          sortable:true
 *      },...
 *    ]
 *  </code></pre>
 */
Sui.table.ColumnModels = function (columns) {

    var cms = [];

    Sui.apply(cms, {
        /**
         * @method 根据配置参数初始化
         * @param columns
         * @private
         */
        initConfig: function (columns) {

            var thisColumnModels = this;

            Sui.each(columns, function (columnConfig) {
                thisColumnModels.push(Sui.table.ColumnManager.createColumnModel(columnConfig));
            })
        },
        /**
         * 初始化事件
         * @method   initEventOnTable
         * @param table
         */
        initEventOnTable : function(table){
            for(var i =0; i < this.getColumnCount(); i++){
                this.getColumnModel(i).initEventOnTable(table);
            }
        },
        /**
         * 添加一列
         * @method add
         * @param {Object} item
         * @param {Number} index
         */
        add: function (item, index) {
            Sui.ArrayUtil.add(this, item, index);
        },
        /**
         * 获取某个索引值对的列头信息
         * @method  getColumnModelByIndex
         * @param {Number} index 索引值
         * @return {Object}
         */
        getColumnModelByIndex: function (index) {
            return cms[index];
        },
        /**
         * 获取列名称与给定名称匹配的列信息
         * @method  getColumnModel
         * @param {String} columnName
         * @return {Object}
         */
        getColumnModel: function (columnName) {
            if (Sui.isNumber(columnName)) {
                var index = columnName;
            } else {
                var index = this.getColumnIndex(columnName);
            }
            return cms[index];
        },
        /**
         * 通过列名获取该列的索引值
         * @method getColumnIndex
         * @param columnName
         */
        getColumnIndex: function (columnName) {
            var index = -1;
            Sui.each(this, function (cm, i) {
                if (cm.name == columnName) {
                    index = i;
                    return false;
                }
            });
            return index;
        },
        /**
         * 获取列头的数量
         * @method getColumnCount
         * @return {Number}
         */
        getColumnCount: function () {
            return cms.length;
        },
        /**
         * 渲染多少列
         * @method  getRenderColumnCount
         * @return {Number}
         */
        getRenderColumnCount: function () {
            return cms.length;
        },
        /**
         * 获取第col列列头的信息
         * @method getRenderColumnModel
         */
        getRenderColumnModel: function (col) {
            return cms[col];
        },
        /**
         * 计算表格的宽度
         * @method  calcTotalWidth
         * @return {Number}
         */
        calcTotalWidth: function () {
            var totalWidth = 0;
            for (var i = 0; i < this.getColumnCount(); i++) {
                var columnModel = this.getColumnModelByIndex(i);
                if (columnModel.visible) {
                    totalWidth += parseInt(columnModel.width);
                }
            }
            return totalWidth;
        },
        /**
         * 获取没有被隐藏的列头
         * @method  getVisibleColumnModel
         * @return {Array}
         */
        getVisibleColumnModel:function(){
            var result = [];
            for (var i = 0; i < this.getColumnCount(); i++) {
                var columnModel = this.getColumnModelByIndex(i);
                if (columnModel.visible && !Sui.isEmpty(columnModel.name)) {
                    result.push(columnModel);
                }
            }
            return result;
        }
    });

    cms.initConfig(columns);

    return cms;

};
/**
 * Sui表格的默认样式
 * @class Sui
 * @proerty  tableClassName
 */
Sui.tableClassName = "Sui.table.Table";
/**
 * 自定义渲染器
 * @class Sui.table.CustomRender
 * @type {{overrideDefaultRender: Function, renderRow: Function}}
 */
Sui.table.CustomRender = {

    /**
     * 生成单元格\
     * @method createCell
     * @param {Sui.data.Record} record
     * @param {Number} rowIndex
     * @param {Sui.table.columnModel} columnModel
     * @param {Sui.table.ExTable}
     */
    createCell: function (record, rowIndex, columnModel, table) {
        return true;
    },
    /**
     * 设置生成的单元格的属性
     * @method setCellAttr
     * @param {$DOM} tdJQ
     */
    setCellAttr: function (tdJQ) {
    },
    /**
     * 设置行属性
     * @method setRowAttr
     * @param {$DOM} trJQ
     */
    setRowAttr : function(trJQ){
    	
    }
};

/**
 * 表格的渲染模式
 * @class Sui.table.TableRenderModel
 * @static
 */
Sui.table.TableRenderModel = {
    TABLE: '',
    GRID: 'grid'
};

/**
 *
 * 比Sui.table.Table更加复杂的表格组件，扩展了如显示隐藏列、调整列宽等功能。
 * 默认表格的行之间不会产生影响，一般来说，表格之间的行会有影响。
 * @class Sui.table.ExTable
 * @extends Sui.Component
 * @constructor
 * @param {Object} config
 * @param {Number} config.width 表格宽度
 * @param {Number} config.height 表格高度
 * @param {Boolean} config.showTipWhenEmpty 如果没有数据显示提示，默认为false
 * @param {String} config.tipWhenEmpty 没有数据提示消息，默认为"没有数据"
 * @param {Boolean}  config.fixWidth   是否根据列宽计算表格宽度，默认为true
 * @param {String} config.defaultClass  表格的样式，默认为'sui_table'
 * @param {String}  config.headerCellClass  表头单元格的样式，默认为'headercell'
 * @param {String}  config.bodyCellClass 表内容单元格的样式，默认为'bodycell'
 * @param {Sui.data.store} config.store  表格记录数据，默认为null
 * @param {Sui.table.columnModels}  config.columnModels  列头数据，列头数据，默认为null
 * @param {String}  config.selectType 表格当前的选择模式,单选single和多选multi
 * @param {Number} config.checkboxColumnIndex 当表格为多选模式时，checkbox所在列的索引
 * @param {String,Function} config.checkboxVisibleColumn 控制checkbox是否可见的属性
 * @param {String} config.selectedRowClass 选中行的样式，默认为'sui_selectedrow'
 * @param {String} config.mouseOverRowClass  鼠标悬浮行的样式，默认为'sui_mouseroverrow'
 * @param {String} config.editCellEvent  点击编辑单元格,还是双击编辑单元格，默认为'click'
 * @param {Boolean} config.readOnly 是否只读. 对于一些大数据量的表格,考虑性能,可以激活该属性,默认为false
 * @param {Boolean} config.ediable  单元格是否可编辑. 是否可编辑是可以动态变化的.默认为true
 * @param {Boolean} config.isMultiRowHeader 是否多行列头，默认为false
 * @param {} config.customRender  自定义渲染
 * @param {Boolean} config.defineLastRowClass  是否是多行列头，默认为false
 * @param {Boolean} config.isShowContextMenu  是否显示右键菜单,默认为false，即不显示
 * @param {Boolean} config.enableColResize 是否通过拖拽改变列宽，默认为true
 * @param {Boolean} config.enableColMove 是否支持移动表格列，默认为true
 * @param {Number} config.colMixWidth  拖拽控制宽度时，允许列的最小宽度，默认为36
 * @param {Number} config.cellHeight  每个单元格的高度，超出高度的内容将被隐藏,默认为24
 * @param {Boolean} config.oddClass 是否为奇数行定义其他样式,默认为true
 * @param {Boolean} config.showColumnCtrlPanel 是否显示列显示隐藏控制面板,默认为true
 */
Sui.table.ExTable = Sui.extend(Sui.Component, {
    /**
     * 表格宽度
     */
    width:null,
    /**
     * 表格高度
     */
    height:null,
    /**
     * 如果没有数据显示提示
     */
    showTipWhenEmpty: false,
    /**
     * 没有数据提示消息
     */
    tipWhenEmpty : "没有数据",
    /**
     * 数据为空时该单元格的样式
     */
    emptyClass:'emptycell',
    /**
     * 如果没有数据,显示提示的行
     */
    emptyTipRow : null,
    /**
     * 根据列宽计算表格宽度
     */
    fixWidth: true,
    /**
     * 表头元素
     */
    headElement: null,
    /**
     * 表内容元素
     */
    bodyElement: null,
    /**
     * 表格的样式
     */
    defaultClass: 'sui_table',
    /**
     * 表头单元格的样式
     */
    headerCellClass: 'headercell',
    /**
     * 表内容单元格的样式
     */
    bodyCellClass: 'bodycell',
    /**
     * 存在记录数据
     */
    store: null,
    /**
     * 列头数据
     */
    columnModels: null,
    /**
     * single 单选
     * multi 多选
     */
    selectType: Sui.table.SelectType.SINGLE,
    /**
     * 选中的行,不宜用索引来表示。用索引表示的话，在添加行之后，需要变化该值，比较麻烦。
     */
    selectedRowElement: null,
    /**
     * 多选的话，多选框所在列
     */
    checkboxColumnIndex: 0,
    /**
     * 控制checkbox是否可见的属性
     */
    checkboxVisibleColumn: null,
    /**
     * 选中行的样式
     */
    selectedRowClass: 'sui_selectedrow',
    mouseOverRowClass: 'sui_mouseroverrow',
    /**
     * 点击编辑单元格,还是双击编辑单元格
     */
    editCellEvent: 'click',
    /**
     * 是否只读. 对于一些大数据量的表格,考虑性能,可以激活该属性.
     */
    readOnly: false,
    /**
     * 单元格是否可编辑. 是否可编辑是可以动态变化的.
     */
    ediable : true,
    /**
     * 是否是多行列头
     */
    isMultiRowHeader: false,
    /**
     * 自定义渲染
     */
    customRender: null,
    /**
     * 渲染模式,采用普通的表格方式,还是采用grid的方式.
     * @private
     */
    renderModel: Sui.table.TableRenderModel.TABLE,
    /*
     * 一组对象,每个对象包含各种数据.
     * columnModel属性 : columnModel,
     * headerDom属性 : dom元素
     * dragDom属性 : 拖放元素
     */
    headerDatas : [],
    /**
     * 最后一行是否要定义样式
     */
    defineLastRowClass : false,
    /**
     * 右键菜单 
     */
    contextMenu:null,
    /**
     * 是否显示右键菜单,默认不显示
     */
    isShowContextMenu: false,
    /**
     * 记录上一次点击右键菜单的行 onContextMenu 修改
     */
    lastContextMenuRowIndex: -1,
    /**
     * 获取指定插入位置函数，该函数可被覆盖
     * @method  getInsertPlace
     */
    getInsertPlace : Sui.emptyFn,
    /**
     * 表格列控制面板
     */
    headerCtrlPanel:null,
    /**
     * 当前被激活的表格控制面板触发器
     */
    curHeaderCtrlPanelTrigger:null,
    /**
     * 是否通过拖拽改变列宽
     * @property colResize
     * @type Boolean
     * @default true
     */
    enableColResize:true,
    /**
     * 是否支持移动表格列
     * @property  enableColMove
     * @type Boolean
     * @default true
     */
    enableColMove:true,
    /**
     * 每个单元格的高度，超出高度的内容将被隐藏
     * @property  cellHeight
     * @type {Number}
     * @default 24
     */
    cellHeight:24,
    /**
     * 拖拽控制宽度时，允许列的最小宽度
     * @property    colMixWidth
     * @type {Number}
     * @default 36
     */
    colMixWidth:36,
    /**
     * 是否为奇数行定义其他样式
     * @property
     * @type Boolean
     * @default true
     */
    oddClass:true,
    /**
     * 列头容器
     * 表格数据容器
     */
    gHead:null,
    gBody:null,
    /**
     * 是否显示列显示隐藏控制面板
     * @property showColumnCtrlPanel
     * @type Boolean
     * @default true
     */
    showColumnCtrlPanel:true,
    /**
     * 初始化属性
     * @method initProperties
     * @private
     */
    initProperties: function () {
        Sui.table.ExTable.superclass.initProperties.apply(this, arguments);
        this.selectedRows = [];
    },
    /**
     * 获取属性checkboxVisibleColumn（控制checkbox是否可见的属性）
     * @method getCheckboxVisibleColumn
     * @returns {null}
     */
    getCheckboxVisibleColumn: function () {
        return this.checkboxVisibleColumn;
    },
    /**
     * 获取checkbox所在列的columnModels
     * @method getCheckboxColumnModel
     * @returns {Sui.table.columnModels}
     */
    getCheckboxColumnModel: function () {
        return this.columnModels.getRenderColumnModel(this.checkboxColumnIndex);
    },
    /**
     * 获取表格的store（数据）
     * @method getStore
     * @returns {null}
     */
    getStore: function () {
        return this.store;
    },
    /**
     * 获取表格的columnModels
     * @method getColumnModels
     * @returns {Sui.table.getColumnModels}
     */
    getColumnModels: function () {
        return this.columnModels;
    },
    /**
     * 获取columnModel的个数
     * @method getRenderColumnCount
     * @returns {Number}
     */
    getRenderColumnCount: function () {
        return this.columnModels.getRenderColumnCount();
    },
    /**
     * 获取指定第col列的columnModel
     * @method  getRenderColumnModel
     * @param {Number} col
     * @returns {Sui.data.columnModels}
     */
    getRenderColumnModel: function (col) {
        return this.columnModels.getRenderColumnModel(col);
    },
    /**
     * 设置表格的可编辑性
     * @method  setEdiable
     * @param {Boolean} editable
     */
    setEdiable : function(editable){
        this.ediable = editable;
    },

    /**
     * 根据参数配置初始化
     * @method initConfig
     * @param {Object} config 配置参数请参考构造函数
     * @private
     */
    initConfig: function (config) {

        Sui.table.ExTable.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ['store', 'width','height','fixWidth', "customRender", "defineLastRowClass",
            'columnModels', "selectType", "checkboxColumnIndex", "checkboxVisibleColumn", "readOnly", "ediable",
            "showTipWhenEmpty", "tipWhenEmpty", 'renderModel','isShowContextMenu','getInsertPlace',
            'enableColResize','enableColMove','colMixWidth','cellHeight','oddClass','emptyClass','showColumnCtrlPanel','needTitle']);
        //  columnModels的优先级高于columns
        if (Sui.isUndefined(config.columnModels) && Sui.isDefined(config.columns)) {

            if (Sui.isDefinedAndNotNull(config.defaultColumnWidth)) {
                Sui.each(config.columns, function (column) {
                    if (Sui.isArray(column)) {
                        Sui.each(column, function (subColumn) {
                            Sui.applyIf(subColumn, {
                                width: config.defaultColumnWidth
                            })
                        });
                    } else {
                        Sui.applyIf(column, {
                            width: config.defaultColumnWidth
                        })
                    }
                })
            }

            if (Sui.isArray(config.columns[0])) {
                this.isMultiRowHeader = true;
                var columnModels = this.columnModels = new Sui.table.MultiRowColumnModels(config.columns);
            } else {
                var columnModels = this.columnModels = new Sui.table.ColumnModels(config.columns);
            }
        }

        if (this.selectType == Sui.table.SelectType.MULTI) {
            this.columnModels.add(new Sui.table.CheckboxColumnModel(), this.checkboxColumnIndex);
        }

        // 如果没有定义store,则创建一个默认的Store
        if (!this.store) {
            this.store = new Sui.data.Store(config.datas ? config.datas : []);
        }
        // 默认不显示右键菜单
        if(this.isShowContextMenu){
        	this.contextMenu = this.createDefaultContextMenu();
        }
    },
    /**
     * 渲染当前组件
     * @method render
     * @param {Object} container
     * @param {Object} insertBefore
     */
    render: function (container, insertBefore) {

        this.createApplyToElement("table", container, insertBefore);

        this.renderHeader();

        if (this.renderModel == Sui.table.TableRenderModel.GRID) {
            this.wrapTable();
        }

        this.renderBody();

        this.renderHeaderCtrlPanel();
        this.initGridWidth();
        this.setHeight(this.height);
    },
    /**
     * 渲染拖拽调整宽度的相关元素
     * @method  renderColResize
     * @private
     */
    renderColResize:function(){
        var self = this;

        this.colDragConatin = $('<div class="cDrag"></div>').appendTo(this.getApplyToElement());
        var hcells = this.headElement.find('th');
        var cheight = this.getApplyToElement().height();
        for (var i = 0,len = hcells.length; i < len; i++) {
            var _left = 0;
            var cDiv = $('<div></div>');
            this.colDragConatin.append(cDiv);

            _left += Sui.getDomWidth(hcells[i]) + hcells[i].offsetLeft - parseFloat(cDiv.width()/2) - parseInt( cDiv[0].style.borderRightWidth || 0 ) ;
            cDiv.css({top: 0,left: Math.ceil(_left) ,height:cheight});

            if( hcells[i].style.display == 'none' ){
                cDiv.hide();
            }

            cDiv.mousedown(function(e){
                self.dragStart('colresize',e);
            })
        }

    },
    /**
     * 初始化列移动的相关元素
     * @method  renderColMove
     * @private
     */
    renderColMove:function() {
        var self = this;
        this.headElement.find('.'+this.headerCellClass).mousedown(function(e){
            self.dragStart('colMove',e);
        } ).hover(function(){
            self.colMoveDropIndex = $(this).prevAll().length;
            $(this).addClass('headercell_inner_hove');
        },function(){
            self.colMoveDropIndex = null;
            $(this).removeClass('headercell_inner_hove');
        });

    },
    /**
     *  重新定位列宽度拖拽柄的位置
     *  @method posColDrag
     *  @private
     */
    posColDrag:function(){

        var hcells = this.headElement.find('th');
            cheight = this.getApplyToElement().height(),
            sl = this.gHead.scrollLeft() ;

        for (var i = 0,len = hcells.length; i < len; i++) {
            var cDiv = this.colDragConatin.find('div:eq(' + i + ')');
            var _left = Sui.getDomWidth( hcells[i] ) + hcells[i].offsetLeft - parseFloat( cDiv.width()/2 ) - parseInt(cDiv.css('borderRightWidth')) - sl ;
            cDiv.css({left:_left,height:cheight});
            if( hcells[i].style.display == 'none' ){
                cDiv.hide();
            }
        }
    },
    /**
     * 清空容器内所有组件
     * @method  clearApplyToElement
     */
    clearApplyToElement:function(){
        this.getApplyToElement().html('');
    },
    /**
     * 渲染列控制面板
     * @method renderHeaderCtrlPanel
     *
     */
    renderHeaderCtrlPanel:function(){

        if(this.headerCtrlPanel){
            return;
        }

        var col = this.columnModels,
            itemConfigs = [],
            self = this;

        for (var i = 0, len = col.length; i < len; i++) {

            if (col[i]['name']) {

                var name = col[i]['name'];

                itemConfigs.push({
                    html: col[i]['display'],
                    iconCss:'sui_table_menuitem_checked',
                    listeners:{
                        click:(function(name,self){
                            return function(event){

                                var menuitem = event.target;
                                var columnModel = self.columnModels.getColumnModel(name);

                                if ( columnModel.visible && self.columnModels.getVisibleColumnModel().length <2) {
                                    //只剩下一列，不能继续隐藏
                                    return ;
                                }else{
                                    menuitem.toggleIconCss('sui_table_menuitem_checked','sui_table_menuitem_unchecked');
                                    columnModel.visible = !columnModel.visible ;
                                    self.clearApplyToElement();
                                    self.render();
                                    self.initColOperator();
                                }
                            }
                        })(name,self)
                    }
                });
            }
        }
        this.headerCtrlPanel = new Sui.menu.Menu({
            hideOnClick:false,
            renderTo:this.getApplyToElement(),
            //html:'<b>菜单</b>',
            itemConfigs:itemConfigs

        });
        this.headerCtrlPanel.layer.on('autoHide',Sui.makeFunction(this,this.hideCurHeaderCtrlPanelTrigger));

    },

    /**
     * 显示隐藏列控制面板
     * @method toggleHeaderCtrlpanel
     * @param {DOM} obj
     */
    toggleHeaderCtrlPanel: function (obj) {
        var trigger = Sui.getJQ(obj),
            offset = trigger.offset(),
            h = Sui.getDomHeight(trigger);
        if(this.curHeaderCtrlPanelTrigger !== obj){

            this.hideCurHeaderCtrlPanelTrigger();
            this.curHeaderCtrlPanelTrigger = obj;
            this.headerCtrlPanel.layer.locate(offset.top + h, offset.left);

        }
        this.headerCtrlPanel.layer.show();

    },
    /**
     * 隐藏当前的列头触发器
     * @method  hideCurHeaderCtrlPanelTrigger
     * @private
     */
    hideCurHeaderCtrlPanelTrigger:function(){
        if (this.curHeaderCtrlPanelTrigger ){
           Sui.getJQ(this.curHeaderCtrlPanelTrigger).hide();
        }
    },
    /**
     * 为表格的DOM元素套上div外壳
     * @method wrapTable
     * @private
     */
    wrapTable: function () {
        this.getApplyToElement().wrap("<div><div></div></div>")
        // 顶部工具栏, 底部工具栏
        this.tableWrapElement = this.getApplyToElement().parent();
    },

    /**
     * 获得表格的外层divDOM
     * @method getTableWrapElement
     * @return {}
     */
    getTableWrapElement : function(){
        return this.tableWrapElement;
    },
    /**
     * 渲染列宽拖拽组件
     * @method  renderColumnResizeMoveDrags
     */
//    renderColumnResizeMoveDrags : function(){
//        if(this.renderModel == Sui.table.TableRenderModel.GRID){
//            // 如果采用Grid渲染模式,则可以调整列的大小
//            this.renderColumnResizeDrags();
//        }
//    },

    /**
     * Grid渲染模式下，
     * 渲染调整列宽的元素。所有的调整元素放在一个div中。
     * @method  renderColumnResizeDrags
     */
    renderColumnResizeDrags : function() {

        var columnResizeDrags = [];

        var parentOfColumnResizeDrag = $("<div class='resize_column_container'></div>").appendTo(this.getTableWrapElement());

        var thisTable = this;

        for(var i=0; i< this.getRenderColumnCount(); i++){
            var columnResizeDragDiv = $("<div class='resize_column'></div>").appendTo(parentOfColumnResizeDrag).draggable({
                axis : 'x',
                stop: function(event, ui) {
                    thisTable.handleDrag(ui, this);
                }
            });

            columnResizeDrags.push(columnResizeDragDiv);
        }

        this.columnResizeDrags = columnResizeDrags;
        this.parentOfColumnResizeDrag = parentOfColumnResizeDrag;

        this.resizeDrag();
    },

    resizeDrag : function() {

//        var top = this.getTableWrapElement().position().top;
//
//        // 设置包含拖放的div的top属性的值
//        this.parentOfColumnResizeDrag.css({
//            position : 'absolute',
//            top : top
//        })
//
//        var rights = [];
//        $("th", this.theadJQ).each(function(i, th) {
//            rights.push($(th).position().left + $(th).width());
//        });
//
//        var thisTable = this;
//
//        var height = this.getTableWrapElement().height();
//
//        var dragJQs = this.drags.find("div");
//        dragJQs.each(function(i, div) {
//            $(div).css({
//                position : 'absolute',
//                left : rights[i] + thisTable.dragLeftgOffset,
//                height : height
//            });
//        });

    },
    /**
     * 通过属性名查找列头数据
     * @method findHeaderDataByAttr
     * @param {String} attrName
     * @param {String} attrValue
     * @returns {Object}
     */
    findHeaderDataByAttr : function(attrName, attrValue) {
        var ret = null;
        Sui.each(this.headerDatas, function(headerData) {
            if (headerData[attrName] == attrValue) {
                ret = headerData;
                return false;
            }
        });
        return ret;
    },

    /**
     *  渲染表头
     *  @method renderHeader
     *  @private
     */
    renderHeader: function () {

        var theadJQ = this.createHeaderElement();

        if (this.isMultiRowHeader) {
            this.renderMultiRowHeader();
        } else {
            this.renderHeaderRow();
        }
    },
    /**
     * 多行表头模式下，渲染表头的实际执行函数
     * @method  renderMultiRowHeader
     */
    renderMultiRowHeader: function () {

        var headerRowCount = this.columnModels.getHeaderRowCount();

        for (var i = 0; i < headerRowCount; i++) {

            var trJQ = $("<tr></tr>").appendTo(this.headElement);

            for (var j = 0; j < this.columnModels.getColumnCount(i); j++) {

                var columnModel = this.columnModels.getColumnModelByRowCol(i, j);

                var thJQ = $("<th></th>").appendTo(trJQ);
                thJQ.attr("colspan", columnModel.getColspan());
                thJQ.attr("rowspan", columnModel.getRowspan());
                thJQ.css("width", columnModel.width + "px");
                this.renderHeaderCell(columnModel, thJQ);

                if (!columnModel.visible) {
                    thJQ.hide();
                }
            }
        }

    },
    /**
     * 单行表头模式下，渲染表头的实际执行函数
     * @method  renderHeaderRow
     */
    renderHeaderRow: function () {
        var trJQ = $('<tr></tr>');
        for (var i = 0; i < this.columnModels.length; i++) {

            var columnModel = this.columnModels[i];
            var thJQ = $("<th></th>").appendTo(trJQ);

            this.renderHeaderCell(columnModel, thJQ);

            if (!columnModel.visible) {
                thJQ.hide();
            }
        }
        trJQ.appendTo(this.headElement);
    },
    /**
     * 创建列头容器
     * @method  createHeaderElement
     * @private
     */
    createHeaderElement: function () {

        var hDiv = $('<div class="grid_thead"></div>').appendTo(this.getApplyToElement()),
            hDivBox = $('<div class="grid_thead_box"></div>').appendTo(hDiv);
            tableElement = $("<table></table>").appendTo(hDivBox);

        this.headElement = $("<thead></thead>");
        /*渲染列宽*/
        for (var i = 0; i < this.columnModels.length; i++) {

            var columnModel = this.columnModels[i];
            var colg = $('<colgroup></colgroup>').appendTo(tableElement);
            var col = $("<col></col>").appendTo(colg);
            col.css("width", columnModel.width + "px");
            if (!columnModel.visible) {
                colg.hide();
            }
        }

        this.gHead = hDiv;
        this.headElement.appendTo(tableElement);
    },

    /**
     * 渲染表头单元格
     * @method renderHeaderCell
     * @param {Sui.table.ColumnModel} columnModel 表头数据
     * @param {$DOM} thJQ 表头单元格
     * @private
     */
    renderHeaderCell: function (columnModel, thJQ) {

        var inner = $('<div class="headercell_inner"></div>').css("text-align", columnModel.align);

        if (Sui.isFunction(columnModel.renderHeader)) {
            // 如果定义了renderHeader
            columnModel.renderHeader(columnModel.display, inner, this, columnModel);
        } else if (Sui.isObject(columnModel.renderHeader) && columnModel.renderHeader.renderHeader) {
            // 如果实现了renderHeader接口
            columnModel.renderHeader.renderHeader(columnModel.display, inner, this, columnModel);
        } else {
            // 直接渲染文本
            if (columnModel.displayAsText) {
                inner.text(columnModel.display);
            } else {
                inner.html(columnModel.display);
            }
            if(this.showColumnCtrlPanel){
                this.renderHeaderCtrlTrigger(columnModel,thJQ,inner);
            }

        }
        thJQ.addClass(this.headerCellClass).append(inner);

        // 不是在渲染BodyCell时,调用
        if (columnModel.existEditor()) {
            if (columnModel.isUseDynamicEditor()) {
                columnModel.on("editorCompleteEdit", Sui.makeFunction(this, this.onCompleteEdit));
            } else {
                columnModel.editor.on("completeEdit", Sui.makeFunction(this, this.onCompleteEdit));
            }
        }

    },

    /**
     * 渲染列表控制面板触发器
     * @method  renderHeaderCtrlTrigger
     * @param {Sui.table.columnModel} columnModel
     * @param {$DOM} thJQ
     */
    //该方法可以考虑优化，将触发器从th中独立出来，
    //这样可以解决ctrlTrigger与document的鼠标事件冲突问题
    //请参考flexigrid.js
    renderHeaderCtrlTrigger:function(columnModel,thJQ,inner){

            var self = this;
            columnModel.ctrlTrigger = $('<div class="grid_thead_column_trigger"></div>').appendTo(inner);
            columnModel.ctrlTrigger.click(function(e){
                self.toggleHeaderCtrlPanel(this);
            });

            thJQ.hover(function(){

                columnModel.ctrlTrigger.show();
            },function(){
                if(this !== self.curHeaderCtrlPanelTrigger ){
                    columnModel.ctrlTrigger.hide();
                }
            });
    },
    /**
     * 渲染表格body
     * @method renderBody
     */
    renderBody: function () {

        this.createBodyElement();

        var rowCount = this.store.getCount();
        for (var i = 0; i < rowCount; i++) {
            var record = this.store.getRecord(i);
            this.renderRow(record, i, rowCount);
        }

        this.renderTipRowIfNotData();

    },
    /**
     * 创建table标签等DOM元素
     * @method createBodyElement
     */
    createBodyElement: function () {
        var div = $('<div class="grid_body"></div>').appendTo(this.getApplyToElement());
        var tableElement = $("<table></table>").appendTo(div);
        /*渲染列宽*/
        for (var i = 0; i < this.columnModels.length; i++) {

            var columnModel = this.columnModels[i];
            var colg = $('<colgroup></colgroup>').appendTo(tableElement);
            var col = $("<col></col>").appendTo(colg);
            col.css("width", columnModel.width  + "px");
            if (!columnModel.visible) {
                colg.hide();
            }
        }

        this.gBody = div;
        this.bodyElement = $("<tbody></tbody>").appendTo(tableElement);

        //令gBody和gHead的滚动同步
        var self = this;
        this.gBody.scroll(function(e){
            Sui.getJQ(self.gHead).scrollLeft( this.scrollLeft );
            //如果存在列宽拖拽柄则调整其位置
            this.enableColResize && self.posColDrag();
        })

    },
    /**
     * 当数据为空时渲染TipRow
     * @method renderTipRowIfNotData
     * @private
     */
    renderTipRowIfNotData : function(){
        if (this.store.getCount() == 0 && this.showTipWhenEmpty) {
            this.renderTipRow(this.tipWhenEmpty);
        }
    },
    /**
     * 当数据不为空时移除TipRow
     * @method removeTipRowIfExistData
     */
    removeTipRowIfExistData : function(){
        if(this.emptyTipRow){
            this.emptyTipRow.remove();
            this.emptyTipRow = null;
        }
    },
    /**
     * 渲染TipRow
     * @method  renderTipRow
     * @param tip
     */
    renderTipRow: function (tip) {
        var trJQ = this.emptyTipRow = $("<tr></tr>").appendTo(this.bodyElement);
        var td = $("<td></td>").appendTo(trJQ).text(tip).attr("colspan", this.columnModels.getRenderColumnCount()).addClass(this.emptyClass);
    },

    /**
     * 渲染一行记录
     * @method renderRow
     * @param {Sui.data.Record} record
     * @param {Number} index
     */
    renderRow: function (record, index, rowCount) {


        var className = (this.oddClass && index % 2 == 1 ) ? 'odd' : '';

        if (index == 0) {
            var trJQ = $("<tr></tr>").prependTo(this.bodyElement);
        } else {
            var trJQ = $("<tr></tr>").insertAfter(this.getRowElement(index - 1)).addClass(className);
        }
        
        if (this.contextMenu) {
            trJQ.bind('contextmenu', Sui.makeFunction(this, this.onContextMenu));
        }
        
        if(index == rowCount - 1){
        	// 最后一行
        	this.handleLastRow(trJQ);
        }

        this.renderRowInner(trJQ, record, index);

        if (this.customRender && this.customRender.setRowAttr) {
            this.customRender.setRowAttr(trJQ, record, index);
        }
        
    },
    /**
     * 处理最后表格最后一行，
     * 如果有样式定义则为期定义特殊样式
     * @method handleLastRow
     * @param {$DOM} trJQ
     * @private
     */
    handleLastRow : function(trJQ){
    	if(this.defineLastRowClass){
    		trJQ.addClass("sui_table_lastrow");
    	}
    },
    /**
     * 渲染表格行的内部DOM元素
     * @method  renderRowInner
     * @param {$DOM} trJQ
     * @param {Sui.data.Record} record
     * @param {Number} index
     * @private
     */
    renderRowInner: function (trJQ, record, index) {

        for (var i = 0; i < this.columnModels.getRenderColumnCount(); i++) {

            var columnModel = this.columnModels.getRenderColumnModel(i);

            if (! (this.customRender && this.customRender.createCell && !this.customRender.createCell(record, index, columnModel, this))) {
                // 如果要渲染单元格,才进行渲染

                var tdJQ = $("<td></td>").appendTo(trJQ);
                var cellValue = record.getFieldValue(columnModel.name);

                this.renderBodyCell(cellValue, columnModel, tdJQ, record, index);

                if (!columnModel.visible) {
                    tdJQ.hide();
                }

                if (this.customRender && this.customRender.setCellAttr) {
                    this.customRender.setCellAttr(tdJQ, record, index, columnModel, this);
                }
            }
        }

        /*
         * 添加事件监听器。注意不要在initEvent方法中添加事件处理，因为每次添加行都要添加事件处理。
         * 另外不要使用DblClick，使用DblClick的效果不好。如果用户点击行之后，快速移开鼠标，会出现闪烁情况。
         */
        trJQ.click(Sui.makeFunction(this, this.onRowClick));

        Sui.hover(trJQ, this.mouseOverRowClass, "");
    },

    /**
     * 渲染表格单元格
     * @method  renderBodyCell
     * @param {String} cellValue
     * @param {Sui.table.columnModel} columnModel
     * @param {$DOM} tdJQ
     * @param {Sui.data.Record} record
     * @param {Number} rowIndex
     * @private
     */
    renderBodyCell: function (cellValue, columnModel, tdJQ, record, rowIndex) {

        var inner = $('<div class="bodycell_inner"></div>').css("text-align", columnModel.align);

        if(Sui.isNumber(this.cellHeight)){
            inner.height(this.cellHeight);
        }

        if (Sui.isFunction(columnModel.renderBody)) {
            columnModel.renderBody(cellValue, inner, this, columnModel, record, rowIndex);
        } else if (Sui.isObject(columnModel.renderBody)){
            if(Sui.isFunction(columnModel.renderBody.renderBody)) {
                columnModel.renderBody.renderBody(cellValue, inner, this, columnModel, record, rowIndex);
            }else {
                inner.html( Sui.nullToEmpty(columnModel.renderBody[cellValue]) );
            }
        } else {
            inner.html(Sui.nullToEmpty(cellValue));
        }

        if (columnModel.renderHiddenField) {
            $("<input type='hidden'/>").val(cellValue).attr("name", columnModel.name).appendTo(tdJQ);
        }

        tdJQ.addClass(this.bodyCellClass);
        if(columnModel.needTitle){
            tdJQ.attr('title', inner.html());
        }

        if (columnModel.existEditor()) {
            tdJQ[this.editCellEvent](Sui.makeFunction(this, this.onCellEditEvent));
        }
        tdJQ.append( inner );
    },

    /**
     *  处理所有单元格的点击事件
     *  @method onCellEditEvent
     *  @param {Event} e
     */
    onCellEditEvent: function (e) {

        if (this.readOnly || !this.ediable) {
            return;
        }

        var cellDom = e.target;
        var columnModel = this.findColumnModel(cellDom);

        //如果td因为滑动条原因被隐藏了一部分，则将其滑动至编辑器左侧与表格左侧对齐
        var offset = cellDom.parentNode.offsetLeft;
        if(offset<this.gBody.scrollLeft()){
            this.gBody.scrollLeft(offset);
        }
        //如果td被隐藏了一部分，则将其滑动至编辑器左侧与表格右侧对齐
        var offsetEver = ( cellDom.parentNode.offsetLeft + Sui.getDomWidth(cellDom.parentNode) ) - this.gBody.width();
        if (offsetEver > 0) {
            this.gBody.scrollLeft(offsetEver);
        }

        if (columnModel) {
            var index = this.findDomInRowIndex(cellDom);
            var record = this.store.getRecord(index);
            var cellVal = record.getFieldValue(columnModel.name);

            if (Sui.isFunction(columnModel.isEditable)) {
                if (columnModel.isEditable(cellVal, columnModel, index, record, this)) {
                    this.startEditCell(e.target, columnModel, cellVal, record, index);
                }
            } else if (columnModel.isEditable) {
                this.startEditCell(e.target, columnModel, cellVal, record, index);
            }

        }
    },
    /**
     * 重新定位当前的单元格编辑组件
     * @method relocateEditor
     */
    relocateEditor:function() {

        if( this.currentCellEditing ){
            var cell = this.currentCellEditing,
                columnModel = this.findColumnModel(cell);
            columnModel.getEditor(cell, columnModel, null, null).locateEditor($(cell));
        }

    },
    /**
     * 触发单元格编辑器
     * @method startEditCell
     * @param {DOM} cellDom
     * @param {Sui.data.columnModel} columnModel
     * @param {String} cellVal
     * @param {Sui.data.Record} record
     * @param {Number} index
     * @private
     */
    startEditCell: function (cellDom, columnModel, cellVal, record, index) {
        this.currentCellEditing = cellDom;
        columnModel.getEditor(cellDom, cellVal, record, index).startEdit(cellDom, cellVal, this, record);
    },
    /**
     * 获得当前编辑器所在的行
     * @method getEditCellRowIndex
     * @returns {$DOM}
     */
    getEditCellRowIndex: function () {
        return this.findDomInRowIndex(this.currentCellEditing);
    },
    /**
     * 编辑完成
     * @method onCompleteEdit
     * @param {Event} e
     */
    onCompleteEdit: function (e) {

        var columnModel = this.findColumnModel(this.currentCellEditing);
        var rowIndex = this.findDomInRowIndex(this.currentCellEditing);
        var record = this.store.getRecord(rowIndex);

        var val = e.value;

        Sui.log("完成单元格编辑，返回的值为" + val);

        if (val == null) {
            val = "";
        }
        if (Sui.isString(val)) {
            record.setFieldValue(columnModel.name, val);
        } else {
            //还没用到
            for (var i = 0; i < val.length; i++) {
                var fieldName = val[i].fieldName;
                var fieldValue = val[i].fieldValue;
                record.setFieldValue(fieldName, fieldValue);
            }
        }

        // columnModel监听用户完成值编辑
        if (Sui.isFunction(columnModel.onCompleteEdit)) {
            columnModel.onCompleteEdit(val, record);
        }

    },
    /**
     * 渲染表格后执行
     * @method afterRender
     */
    afterRender: function () {
        Sui.table.ExTable.superclass.afterRender.apply(this, arguments);
        this.initColOperator();
        this.gHead.scrollLeft(0);

        //修正第一次渲染所产生的宽高误差
        this.setHeight(this.height);
        if(this.fixWidth && Sui.isUndefinedOrNull(this.width) ){
            //如果表格宽度根据内容定义，则在出现垂直滚动条的情况下拓宽表格，以消除横向滚动条
            var contain = this.gBody[0];
            var totalWidth = this.columnModels.calcTotalWidth();
            totalWidth += contain.scrollHeight > contain.offsetHeight ? 17 : 0;
            this.getApplyToElement().width(totalWidth);
        }
        this.fixHeadPaddingRight();
    },
    /**
     * 初始化列拖拽、移动等操作
     * @method  initColOperator
     * @private
     */
    initColOperator:function(){

        if(this.enableColResize){
            this.renderColResize();
        }
        if(this.enableColMove){
            this.renderColMove();
        }
        this.initDocEvent();
    },
    /**
     * 初始化Document鼠标事件
     * @method  initDocEvent
     * @private
     */
    initDocEvent:function(){
        var self = this;
        $(document).mousemove(function(e) {
            self.dragMove(e);
        }).mouseup(function(e) {
            self.dragEnd(e);
        });
        //无论函数被调用多少次，只执行一次
        this.initDocEvent = function(){};
    },
    /**
     * 开始拖拽，拖拽目的可能是调整列宽colresize，或移动列colMove
     * @method  dragStart
     * @param {String} dtype 拖拽类型,可以为colresize，colMove
     * @param {Event} event
     * @private
     */
    dragStart:function(dtype, event) {

        var obj = event.currentTarget;

        if (dtype == 'colresize') {
            var index = $('div', this.colDragConatin).index(obj),
                owidth = this.columnModels.getColumnModelByIndex(index).width ;

            $(obj).addClass('dragging');

            this.colresize = {
                startx : event.clientX,
                oleft: parseFloat(obj.style.left) ,
                index : index,
                owidth: owidth
            };
        }else if(dtype =='colMove'){

            this.colMoveDragIndex = $('th',this.headElement).index(obj);

            this.colMoveArea = this.gHead.offset();
            this.colMoveArea.bottom = this.colMoveArea.top + this.headElement.height();
            this.colMoveArea.right = this.colMoveArea.left + this.headElement.width();

            this.colMoveCopy = $('<div class="colCopy"></div>')
                .html(obj.innerHTML)
                .css({position:'absolute',display:'none',width: Sui.getJQ(obj).width()})
                .appendTo(Sui.getBody());
        }

        this.headerCtrlPanel.layer.hide();
        event.stopPropagation();
        event.preventDefault();
    },
    /***
     * 拖拽移动中
     * @method dragMove
     * @param {Event} event
     * @private
     */
    dragMove:function(event){
        if(this.colresize){
            this.colresize.diffx = event.clientX - this.colresize.startx;
            this.colresize.nwidth = Math.max(this.colMixWidth, this.colresize.owidth +  this.colresize.diffx);

            this.colDragConatin.find('div:eq(' + this.colresize.index + ')').css({left: this.colresize.oleft + this.colresize.diffx}) ;
        }else if(this.colMoveCopy){

            this.colMoveCopy.css({
                display:'block',
                left:event.clientX + 10,
                top:event.clientY + 10
            });

            if (event.clientX < this.colMoveArea.left || event.clientX > this.colMoveArea.right
                || this.clientY < this.colMoveArea.top || this.clientY > this.colMoveArea.bottom) {
                $('body').css('cursor','move');
            }else{
                $('body').css('cursor','default');
            }

        }
        event.stopPropagation();
        event.preventDefault();
    },
    /***
     * 拖拽结束，拖拽目的可能是调整列宽colresize，或移动列colMove
     * @method dragMove
     * @param {Event} event
     * @private
     */
    dragEnd:function(event){

        if(this.colresize){

            var index = this.colresize.index ,
                obj = this.colDragConatin.find('div:eq(' + this.colresize.index + ')');

            this.columnModels.getColumnModelByIndex(index).setWidth(this.colresize.nwidth);
            this.colresize = null;

            obj.removeClass('dragging');

            this.refreshColWidth();
            this.posColDrag();
        }else if(this.colMoveCopy){

            if( this.colMoveDropIndex == this.colMoveDragIndex ||
                !Sui.isNumber(this.colMoveDropIndex) || !Sui.isNumber(this.colMoveDragIndex) ){

            }else{

                this.switchColumnModel( this.colMoveDragIndex,this.colMoveDropIndex );
                this.clearApplyToElement();
                this.render();
                this.initColOperator();
            }

            this.colMoveCopy.remove();
            this.colMoveCopy = null;
            this.colMoveDragIndex = null;
            this.colMoveDropIndex = null;
            $('body').css('cursor','default');
        }
        this.fixHeadPaddingRight();
    },
    /**
     * 置换表格数据中两列的位置
     * @method  switchColumnModel
     * @param {Number} idx1
     * @param {Number} idx2
     */
    switchColumnModel:function(idx1,idx2){

        if( idx1 == idx2  ){
            return;
        }
        var temp = this.columnModels[idx1];
        this.columnModels[idx1] = this.columnModels[idx2];
        this.columnModels[idx2] = temp;
    },
    /**
     * 重新设置表格的宽度
     * @method refreshWidth
     * @private
     */
    refreshColWidth:function(){
        var cols = this.gHead.find('col'),
            hcols = this.gBody.find('col');

        for (var i = 0,len = this.columnModels.length; i < len; i++) {
            var w = this.columnModels.getColumnModelByIndex(i).width;
            $(cols[i]).css('width',w );
            $(hcols[i]).css('width',w);
        }
        this.setTableElementWidth();
    },
    /**
     * 设置表头容器gHead和表内容容器gBody的宽度
     * @method   setTableWidth
     * @private
     */
    setTableElementWidth:function(){
        var totalWidth = this.columnModels.calcTotalWidth(),
            w = Sui.isNumber(this.width) ? this.width : totalWidth ;
//        this.gHead.width(w);
        this.headElement.parent().width(totalWidth);
        this.bodyElement.parent().width(totalWidth);
    },
    /**
     * 设置表格组件的高度
     * @method setHeight
     * @param {Number} val
     */
    setHeight:function(val){

        if (Sui.isNumber(val)) {
            var gCon = this.getApplyToElement();
            this.height = val;
            val -= Sui.getDomHeight(this.gHead) - parseInt(gCon[0].style.borderTopWidth || 0) - parseInt(gCon[0].style.borderTopWidth || 0);
            this.gBody.height(val);
        }

    },
    /**
     * 初始化组件头部和身体的宽度
     * @method initGridWidth
     * @private
     */
    initGridWidth:function(){
        if (Sui.isNumber(this.width)) {
            this.getApplyToElement().width(this.width);
            this.setTableElementWidth();
        }else{
            if (this.fixWidth) {
                var totalWidth = this.columnModels.calcTotalWidth();
                this.headElement.parent().width(totalWidth);
                this.bodyElement.parent().width(totalWidth);
            }
        }
    },
    /**
     * 初始化事件
     * @method initEvent
     */
    initEvent: function () {
        this.store.on('addRecord', Sui.makeFunction(this, this.onAddRow));
        this.store.on('removeRecord', Sui.makeFunction(this, this.onRemoveRow));
        this.store.on('recordChange', Sui.makeFunction(this, this.onRecordChange));

        this.columnModels.initEventOnTable(this);

        //窗口尺寸改变时，重新计算当前单元组件编辑器的位置
        $(window).resize(Sui.makeFunction(this, this.relocateEditor));
    },
    /**
     * 当一条数据被添加时执行,
     * 主要完成了渲染对应的表格行、清除表格数据为空状态、派发添加表格行事件
     * @method onAddRow
     * @param {Obejct} event
     */
    onAddRow: function (event) {

        Sui.debugMethodCall(Sui.tableClassName, 'onAddRow');
        this.renderRow(event.record, event.index);

        this.removeTipRowIfExistData();

        this.fireEvent("afterAddRow", new Sui.util.Event({
            index : event.index,
            record : event.record
        }));
    },
    /**
     * 当有Record数据被删除时执行，
     * 主要完成了删除事件对应的行、监测是否将表格置为空状态、派发删除表格行事件
     * @method onRemoveRow
     * @param {Event} event
     */
    onRemoveRow: function (event) {

        Sui.debugMethodCall(Sui.tableClassName, 'onRemoveRow');

        var rowIndex = event.index;

        this.removeRow(rowIndex);

        this.renderTipRowIfNotData();

        this.fireEvent("afterRemoveRow", new Sui.util.Event({
            index : event.index,
            record : event.record
        }));

    },
    /**
     * 删除表格行
     * @method removeRow
     * @param {Number} rowIndex
     */
    removeRow: function (rowIndex) {

        var removeRowElement = this.getRowElement(rowIndex);
        removeRowElement.remove();

        if (this.selectType == Sui.table.SelectType.MULTI) {
            var checkboxCM = this.getCheckboxColumnModel();
            checkboxCM.onRemoveRow(rowIndex);
        }

        if (Sui.equals(this.selectedRowElement, removeRowElement)) {
            this.selectedRowElement = null;
        }

    },

    /**
     * 重新渲染行
     * @method repaintRow
     * @param {Number} rowIndex
     */
    repaintRow: function (rowIndex) {
        var record = this.getStore().getRecord(rowIndex);

        for (var i = 0; i < this.columnModels.length; i++) {

            var columnModel = this.columnModels[i];
            var cellValue = record.getFieldValue(columnModel.name);
            var cellElement = this.getCellElement(rowIndex, columnModel.name);

            cellElement.empty();

            this.renderBodyCell(cellValue, columnModel, cellElement, record);

            if (!columnModel.visible) {
                cellElement.hide();
            }
        }
    },
    /**
     * 当有Record数据变化时执行
     * @method onRecordChange
     * @param {Event} event
     */
    onRecordChange: function (event) {
        var record = event.record;
        var index = event.index;
        var changedFields = event.changedFields;

        var row = this.getRowElement(index);
        for (var i = 0; i < changedFields.length; i++) {

            var changedField = changedFields[i];
            var fieldName = changedField.field;

            // 有些数据列,是不需要显示的.
            var columnModel = this.columnModels.getColumnModel(fieldName);
            if (columnModel) {
                var cellElement = this.getCellElement(row, fieldName);
                this.repaintCell(changedField.newValue, columnModel, cellElement, record, index);
            }
        }
    },
    /**
     * 获取指定行和属性名的单元格DOM元素
     * @method  getCellElement
     * @param {Number,DOM} rowIndex
     * @param {Number} cellName
     * @returns {$DOM}
     */
    getCellElement: function (rowIndex, cellName) {
        if (Sui.isNumber(rowIndex)) {
            var trJQ = this.getRowElement(rowIndex);
        } else {
            var trJQ = rowIndex;
        }

        var cellIndex = this.columnModels.getColumnIndex(cellName);
        var tds = trJQ.children("td");

        var index = 0;
        var ret = null;
        Sui.each(tds, function (td) {
            index += Sui.getColspan(td);
            if (index > cellIndex) {
                ret = td;
                return false;
            }
        });
        return Sui.getJQ(ret);
    },
    /**
     * 根据列头的属性创建一个所有属性值为空串的数据集
     * @method  createEmptyData
     * @returns {Object}
     * @private
     */
    createEmptyData: function () {
        var defaultData = {};

        var cms = this.columnModels;
        Sui.each(cms, function (cm) {
            defaultData[cm.name] = "";
        });

        return defaultData;
    },

    /**
     * 创建数据为空的一个表格行
     * @method createEmptyRow
     */
    createEmptyRow: function () {
        var defaultData = this.createEmptyData();
        this.store.addRecordData(defaultData);
    },
    /**
     * 当表格行被点击时执行
     * @method onRowClick
     * @param {Event} e
     */
    onRowClick: function (e) {
        if (this.selectType == Sui.table.SelectType.SINGLE) {
            this.setSelectedRowByDom(e.target);
        }
    },

    /**
     * 获取第i条记录对应的元素
     * @method getRowElement
     * @param {Number} rowIndex
     * @return {$DOM}
     */
    getRowElement: function (rowIndex) {
        return this.bodyElement.children("tr:eq(" + rowIndex + ")");
    },

    /**
     * 获取dom元素所在行的索引
     * @method findDomInRowIndex
     * @return {Number}
     */
    findDomInRowIndex: function (dom) {
        dom = Sui.getJQ(dom);
        var tr = dom.parentsUntil('tbody').last();
        return this.bodyElement.children("tr").index(tr);
    },
    /**
     * 返回某一行DOM元素在表格中的索引
     * @method  findRowIndex
     * @param {DOM} trElement
     * @returns {*|Number}
     */
    findRowIndex: function (trElement) {
        return this.bodyElement.children("tr").index(trElement);
    },

    /**
     * 获取某单元格对应的列头的columnModel
     * @method
     * @param {DOM} dom
     * @returns {Sui.tabble.columnModels}
     */
    findColumnModel: function (dom) {

//        var tr = Sui.findFirstAncestorByName(dom, "tr");
//        var index = Sui.indexOf(tr.children("td"), dom);
        var tds = Sui.getJQ(dom.parentNode).prevAll();
        var index = 0;
        tds.each(function (i, td) {
            index += Sui.getColspan(td);
        });
        return this.columnModels.getColumnModelByIndex(index);
    },

    /**
     *
     * 删除选中的行
     * @method removeSelectedRows
     *
     */
    removeSelectedRows: function () {
        var indexs = this.getSelectedRowIndexs();
        this.store.removeRecords(indexs);
    },

    /**
     * 获取选中行的索引。如果有多行被选中，则返回第一个被选中行的索引。
     * @method getSelectedRowIndex
     */
    getSelectedRowIndex: function () {
        var array = this.getSelectedRowIndexs();
        if (array.length > 0) {
            return array[0];
        }
        return -1;
    },

    /**
     * 获取所有选中的行的索引
     * @method getSelectedRowIndexs
     * @return {Number,Array}
     */
    getSelectedRowIndexs: function () {
        var ret = [];
        if (this.selectType == Sui.table.SelectType.SINGLE) {
            if (this.selectedRowElement != null) {
                ret.push(this.findRowIndex(this.selectedRowElement));
            }
        } else {
            var checkboxCM = this.getCheckboxColumnModel();
            ret = checkboxCM.getCheckedIndexs();
        }
        return ret;
    },
    /**
     * 清空选中行的数据
     * @method clearSelectedRows
     */
    clearSelectedRows: function () {
        if (this.selectType == Sui.table.SelectType.SINGLE) {
            this.setSelectedRow(null);
        } else if (this.selectType == Sui.table.SelectType.MULTI) {
            var checkboxCM = this.getCheckboxColumnModel();
            checkboxCM.setAllChecked(false);
        }
    },
    /**
     * 通过DOM元素找到其对应的行，并将行选中
     * @method  setSelectedRowByDom
     * @param {DOM} dom
     */
    setSelectedRowByDom: function (dom) {
        var rowIndex = this.findDomInRowIndex(dom);
        this.setSelectedRowIndex(rowIndex);
    },
    /**
     * 为选中的行更换样式
     * @method  setSelectedRow
     * @param {DOM} rowElement
     */
    setSelectedRow: function (rowElement) {

        if (this.selectedRowElement != null) {
            this.selectedRowElement.removeClass(this.selectedRowClass);
        }

        this.selectedRowElement = rowElement;
        if (this.selectedRowElement) {
            this.selectedRowElement.addClass(this.selectedRowClass);
        }

    },
    /**
     * 为第rowIndex行更换样式
     * @method setSelectedRowIndex
     * @param {Number} rowIndex
     */
    setSelectedRowIndex: function (rowIndex) {
        if (this.selectType == Sui.table.SelectType.SINGLE) {

            var rowElement = this.getRowElement(rowIndex);
            this.setSelectedRow(rowElement);

        }
    },
    /**
     * 更新列
     * @method  refreshColumn
     * @param {Sui.table.columnModel} columnModel
     */
    refreshColumn : function(columnModel){
        var rowCount = this.store.getCount();
        for (var i = 0; i < rowCount; i++) {
            var record = this.store.getRecord(i);
            this.refreshCell(columnModel, record, i);
        }
    },
    /**
     *
     * @method refreshCell
     * @param columnModel
     * @param record
     * @param index
     */
    refreshCell: function (columnModel, record, index) {
        var row = this.getRowElement(index);
        var fieldName = columnModel.getName();
        var value = record.getFieldValue(fieldName);
        var cellElement = this.getCellElement(row, fieldName);
        this.repaintCell(value, columnModel, cellElement, record, index);
    },
    /**
     * 更新单元格的数据
     * @method repaintCell
     * @param {String} value
     * @param {Sui.data.columnModel} columnModel
     * @param {DOM} cellElement
     * @param {Sui.data.Record} record
     * @param {Number} index
     */
    repaintCell : function(value, columnModel, cellElement, record, index){
        cellElement.empty();
        this.renderBodyCell(value, columnModel, cellElement, record, index);
    },

    /**
     * ****************************************************************************************************
     * 右键菜单相关
     */
    /**
     * 创建右键菜单
     * @method  createDefaultContextMenu
     * @returns {Sui.menu.ContextMenu}
     */
    createDefaultContextMenu : function() {        
        var contextMenu = new Sui.menu.ContextMenu();

        var copy = new Sui.menu.MenuItem({
            html : "复制添加",
            action : Sui.makeFunction(this, this.copyData)
        });
        contextMenu.addItem(copy);

        return contextMenu;
    },
    /**
     * 当右键菜单事件时触发
     * @method onContextMenu
     * @param {Event} e
     */
	onContextMenu: function (e) {		
        e.preventDefault();
        
		//找到当前行号
		var trElement = Sui.findFirstAncestorBySelector(e.target, "tr");
		this.lastContextMenuRowIndex = this.findRowIndex(trElement);
		
        this.showContextMenu(e);
    },
    /**
     *  显示右键菜单
     *  @method  showContextMenu
     * @param {Event} e
     */
    showContextMenu: function (e) {
        this.contextMenu.alignToAndShow(e);
    },
    
    /**
     * 拷贝当前行数据,由用户输入拷贝几行
     * @method copyData
     * @param {Event} e
     */
    copyData: function(e) {
    	var prompt = new NumberInputPrompt({
    		title:'设置行数',
            name:'复制行数',
            defaultValue:'1',
            fun:Sui.makeFunction(this, this.copyDataBS)
        });
    },
    /**
     * 拷贝当前行数据实际执行函数
     * @method copyDataBS
     * @param {Number} num 拷贝的行数
     */
    copyDataBS: function(num) {

    	var record = this.store.getRecord(this.lastContextMenuRowIndex);
    	var data = record.copyData();
    	var insertPlace;
    	if(Sui.isDefinedAndNotNull(this.getInsertPlace)){
    		insertPlace = this.getInsertPlace();
    	}
    	for(var i=0 ; i < num; i++){
    		var temp = Sui.apply({}, data);
    		if(Sui.isDefinedAndNotNull(insertPlace))
    		{
    			this.store.addRecordData(temp, insertPlace);
    		}
    		else
    		{
    			this.store.addRecordData(temp);
    		}
    	}        
    },
    /**
     * 当x轴y轴都出现滚动条时，拖拽x轴到底时表格头部会有bug，该函数为解决这个问题
     * @method fixHeadPaddingRight
     * @private
     */
    fixHeadPaddingRight: function() {

        if(this.bodyElement.width() > this.getApplyToElement().width()){
            this.gHead.children().css('paddingRight',20) ;
        }else{
            this.gHead.children().css('paddingRight',0) ;
        }
    }

});



