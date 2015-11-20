/**
 * ==========================================================================================
 * 表格组件
 * 依赖拖动来调整列宽；依赖工具栏来实现顶部工具栏和底部工具栏。DateSelectRender依赖日期组件。
 * ==========================================================================================
 */
Sui.namespace('Sui.table');

/* 排序类型 */
Sui.SortType = {
    DESC: 'desc',
    ASC: 'asc'
}

Sui.table.SelectType = {
    NONE: 'none',
    MULTI: 'multi',
    SINGLE: 'single'
}


Sui.table.Renders = {

    DefaultRender: function () {
        this.renderBody = function (text, targetElementJQ) {
            targetElementJQ.html(Sui.nullToEmpty(text));
        }
    },

    /**
     * @param config
     * 属性checkboxAllName 表头中的checkbox的名称
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
     * config可配置的属性包括
     * prefix：前缀，添加到输入框前面。
     * suffix：后缀，添加到输入框后面。
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
     * config对象,可配置的属性包括
     * initDatas属性,初始的配置数据
     * @param config
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
     * 点击时,会自动切换样式的textarea
     * @param config
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

    DateRender: function (format) {
        return function (val, parentElementJQ) {
            if (Sui.isDate(val)) {
                val = Sui.DateUtil.format(val, "yyyy-MM-dd");
            }
            $("<span></span>").text("" + val).appendTo(parentElementJQ);
        }
    }
}

Sui.textEditorClassName = "Sui.table.TextEditor";


Sui.table.TextEditor = Sui.extend(Sui.Layer, {

    customClass: 'sui_texteditor',
    field: null,

    listenBlurEvent: true,

    cellEditingInfo: null,

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

    getFieldComponent : function(){
        return this.field;
    },

    createField: function (fieldConfig) {
        return new Sui.form.TextField(fieldConfig);
    },

    initEvent: function () {
        Sui.table.TextEditor.superclass.initEvent.apply(this, arguments);
        this.field.on("keydown", Sui.makeFunction(this, this.onFieldKeyDown));

        if (this.listenBlurEvent) {
            this.field.on("blur", Sui.makeFunction(this, this.onBlur));
        }
    },

    onBlur: function () {
        this.completeEdit();
    },

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

    setOuterWidth: function (width) {
        Sui.table.TextEditor.superclass.setOuterWidth.apply(this, arguments);
        this.field.setOuterWidth(this.getWidth());
    },

//    setOuterHeight : function(height) {
//        Sui.table.TextEditor.superclass.setOuterHeight.apply(this, arguments);
//        this.field.setOuterHeight(this.getHeight());
//    },

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
    locateEditor:function(cellElement) {

        this.setOuterWidth(Sui.getDomWidth(cellElement));
        this.setOuterHeight( Sui.getDomHeight(cellElement));
        Sui.alignTo(this.getApplyToElement(), cellElement, {
            src: 'lt',
            dest: 'lt',
            hspan: 1,
            vspan: 1
        });
    },
    initFieldValue: function (cellDom, cellVal, table) {
        //Sui.log("设置TextEditor的值为: " + cellVal);
        this.field.setValue(cellVal || '');
    },

    /**
     * 验证值是否有效
     */
    validateValue: function (val) {
        return true;
    },

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

    beforeCompleteEdit: function (val) {
        return val;
    },

    cancelEdit: function () {
        Sui.debugMethodCall(Sui.textEditorClassName, "cancelEdit");

        this.hide();
        this.fireEvent("cancelEdit", new Sui.util.Event());
    }

});

Sui.table.PercentEditor = Sui.extend(Sui.table.TextEditor, {

    // toFixed是转换成百分比后,小数点后的位数
    toFixed: null,

    initConfig: function (config) {
        config = config || {};
        Sui.table.PercentEditor.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ["toFixed"]);
    },

    startEdit: function (cellDom, cellVal, table) {

        cellVal = Sui.isUndefinedOrNull(cellVal) ? "" : cellVal;
        if (cellVal != "") {
            cellVal = (parseFloat(Sui.StringUtil.trim(cellVal)) * 100).toFixed(this.toFixed);
        }
        Sui.table.PercentEditor.superclass.startEdit.apply(this, arguments);

    },


    beforeCompleteEdit: function (val) {

        val = Sui.isUndefinedOrNull(val) ? "" : val;
        if (val != "") {
            // toFixed必须加2
            val = (parseFloat(Sui.StringUtil.trim(val)) / 100).toFixed(this.toFixed + 2);
        }

        return val;

    },

    createField: function (fieldConfig) {
        return new Sui.form.NumberField(fieldConfig);
    }

});

Sui.table.NumberEditor = Sui.extend(Sui.table.TextEditor, {

    toFixed: null,

    initConfig: function (config) {
        config = config || {};
        Sui.table.NumberEditor.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ["toFixed"]);
    },


    startEdit: function (cellDom, cellVal, table) {

        cellVal = Sui.isUndefinedOrNull(cellVal) ? "" : cellVal;
        if (cellVal != "") {
            if (Sui.isDefinedAndNotNull(this.toFixed)) {
                cellVal = parseFloat(Sui.StringUtil.trim(cellVal)).toFixed(this.toFixed);
            }
        }
        Sui.table.NumberEditor.superclass.startEdit.apply(this, arguments);

    },


    beforeCompleteEdit: function (val) {

        val = Sui.isUndefinedOrNull(val) ? "" : val;
        if (val != "") {
            if (Sui.isDefinedAndNotNull(this.toFixed)) {
                val = parseFloat(Sui.StringUtil.trim(val)).toFixed(this.toFixed);
            }
        }

        return val;

    },

    createField: function (fieldConfig) {
        return new Sui.form.NumberField(fieldConfig);
    }

});

Sui.table.SelectEditor = Sui.extend(Sui.table.TextEditor, {

    field: null,

    listenBlurEvent: false,

    initConfig: function (config) {

        Sui.table.SelectEditor.superclass.initConfig.apply(this, arguments);

        this.field.on("selected", Sui.makeFunction(this, this.onDataSelected));
        if (!config['forceSelect']) {
            this.field.on("inputComplete", Sui.makeFunction(this, this.onInputComplete));
        }

    },

    onFieldKeyDown: function (event) {
        var originalEvent = event.originalEvent;
        var KEY = Sui.KEY;
        switch (originalEvent.keyCode) {
            case KEY.RETURN:
                if(this.field.forceSelect){
                     this.completeEdit();
                }
                break;
            case KEY.ESC :
                this.cancelEdit();
                break;
        }
    },

    createField: function (fieldConfig) {
        return new Sui.form.DropList(fieldConfig);
    },

    startEdit: function (cellDom, cellVal, table) {
        Sui.table.SelectEditor.superclass.startEdit.apply(this, arguments);
        this.lastCellDom = cellDom;
    },

    onDataSelected: function () {
        this.completeEdit();
    },
    onInputComplete:function() {
        this.completeEdit();
    }
});
Sui.table.MultiSelectEditor = Sui.extend(Sui.table.SelectEditor,{

    createField: function (fieldConfig) {
        return new Sui.form.MultiDropList(fieldConfig);
    }

});

Sui.table.TreeFieldEditor = Sui.extend(Sui.table.SelectEditor, {

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
    createField: function (fieldConfig) {
        return new Sui.form.TreeField(fieldConfig);
    },

    /**
     * 重置任务树的节点数据
     * @param treeData
     */
    resetTreeData : function(treeData){
       this.field.getTree().resetTreeData(treeData);
    }
});

Sui.table.DateEditor = Sui.extend(Sui.table.TextEditor, {

    initConfig: function (config) {

        Sui.table.DateEditor.superclass.initConfig.apply(this, arguments);

        var field = this.field;
        this.addComponent(field);

        field.on("selected", Sui.makeFunction(this, this.onDateSelected));
    },

    createField: function (fieldConfig) {
        return new Sui.form.DateField(fieldConfig);
    },

    startEdit: function (cellDom, cellVal) {
        Sui.table.DateEditor.superclass.startEdit.apply(this, arguments);

        // 点击时，自动弹出选择对话框
//        this.field.addExcludeElementsClick(this.lastCellDom);
//        this.field.addExcludeElementsClick(cellDom);
        this.lastCellDom = cellDom;

        //this.field.expand();
    },


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

Sui.table.TextAreaEditor = Sui.extend(Sui.table.TextEditor,{
    createField:function(fieldConfig){
        return new Sui.form.TextAreaField(fieldConfig);
    }
});

Sui.table.ColumnTypes = {
    defaultColumn : '',
    sequenceColumn : 'sequenceColumn'
}

Sui.table.ColumnManager = {

    createColumnModel : function(columnConfig){
        var columnType = columnConfig.columnType;
        if(columnType == 'sequenceColumn'){
            return new Sui.table.SequenceColumnModel(columnConfig);
        }
        return new Sui.table.ColumnModel(columnConfig);
    }
}

/**
 *
 */
Sui.table.ColumnModel = Sui.extend(Sui.util.Observable, {

    constructor: function (config) {
        Sui.table.ColumnModel.superclass.constructor.apply(this, arguments);
        this.initProperties();
        Sui.apply(this, config);
    },

    initProperties: Sui.emptyFn,

    /**
     * 渲染表内容的函数
     */
    renderBody: null,

    /**
     * 是否自动生成一个hidden元素
     */
    renderHiddenField: false,

    /**
     * 渲染表头的函数
     */
    renderHeader: null,
    /**
     * 列头的名称
     */
    name: "",
    /**
     * 表头的内容
     */
    display: null,
    /**
     * 表头的内容当作文本还是当作html内容
     */
    displayAsText: false,
    /**
     * 在控制列是否可见的下拉菜单中的文本
     */
    hideColumnLabel: null,
    /**
     * 升序还是降序
     */
    sort: null,
    /**
     * 是否可排序
     */
    sortable: null,
    /**
     * 宽度
     */
    width: 80,
    /**
     * 最小宽度
     */
    minWidth: undefined,
    /**
     * 是否可见. 会生成相应的元素.
     */
    visible: true,
    /**
     * 文字对齐方向
     */
    align: 'left',

    /**
     * 单元格的编辑器。如果没有定义编辑器，单元格是不能编辑的。
     */
    editor: null,

    rowspan: 1,
    colspan: 1,

    /**
     * 使用动态的Editor
     */
    useDynamicEditor: false,

    /**
     * 在table组件初始化事件之后,调用ColumnModel去初始化事件
     */
    initEventOnTable : Sui.emptyFn,

    isUseDynamicEditor: function () {
        return this.useDynamicEditor;
    },

    /**
     * 包含多个参数val, record
     * @param val
     * @param record
     */
    onCompleteEdit: Sui.emptyFn,

    onEditorCompleteEdit: function (e) {
        this.fireEvent("editorCompleteEdit", e);
    },

    /**
     * 包含多个参数cellDom, cellVal, record, index
     */
    getDynamicEditor: Sui.emptyFn,

    getEditor: function (cellDom, cellVal, record, index) {
        if (this.useDynamicEditor) {
            var editor = this.getDynamicEditor.apply(this, arguments);
            editor.on("completeEdit", Sui.makeFunction(this, this.onEditorCompleteEdit));
            return editor;
        } else {
            return this.editor;
        }
    },

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
     */
    isEditable: function (cellVal, columnModel, index, record, table) {
        return true;
    },

    getColspan: function () {
        return this.colspan;
    },

    getRowspan: function () {
        return this.rowspan;
    },

    setRowspan: function (rowspan) {
        this.rowspan = rowspan;
    },

    getName : function(){
        return this.name;
    }

});

Sui.table.SequenceColumnModel = Sui.extend(Sui.table.ColumnModel, {
    renderBody: function (text, targetElementJQ, table, columnModel, record, rowIndex){
        targetElementJQ.append(rowIndex + 1);
    },

    initEventOnTable: function (table) {

        var thisColumnModel = this;

        table.on('afterAddRow', function (e) {
            thisColumnModel.onAfterAddRow(e);
        });

        table.on('afterRemoveRow', function (e) {
            thisColumnModel.onAfterRemoveRow(e);
        });

    },

    onAfterAddRow : function(e){
        var table = e.target;
        table.refreshColumn(this);
    },

    onAfterRemoveRow : function(e){
        var table = e.target;
        table.refreshColumn(this);
    }

});

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

    initProperties: function () {
        Sui.table.CheckboxColumnModel.superclass.initProperties.apply(this, arguments);
        this.checkboxs = [];
    },


    renderHeader: function (text, targetElementJQ) {

        var checkboxJQ = this.checkboxAll = $("<input type='checkbox' />").appendTo(targetElementJQ);

        if (Sui.isDefined(this.checkboxAllName)) {
            checkboxJQ.attr("name", this.checkboxAllName);
        }

        checkboxJQ.click(Sui.makeFunction(this, this.onCheckboxAllClick));

    },

    onCheckboxAllClick: function (e) {
        var checked = !!$(e.target).attr("checked");
        this.setAllChecked(checked);
    },

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

    onCheckboxClick: function (e) {
        var checked = !!$(e.target).attr("checked");

        this.updateCheckboxAllState(checked);

        this.fireEvent("click", new Sui.util.Event({
            index: this.getIndexOfCheckbox(e.target),
            checked: checked
        }));
    },

    getCheckedIndexs: function () {
        var ret = [];

        Sui.each(this.checkboxs, function (checkbox, i) {
            if (checkbox && checkbox.attr("checked")) {
                ret.push(i);
            }
        });

        return ret;

    },

    isChecked: function (rowIndex, checked) {
        return Sui.isChecked(this.checkboxs[rowIndex], checked);
    },

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

    setChecked: function (rowIndex, checked) {
        this.setCheckeds([rowIndex], checked);
    },

    setAllChecked: function (checked) {
        this.setCheckeds(this.checkboxs, checked);
    },

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

    onRemoveRow: function (rowIndex) {
        Sui.ArrayUtil.removeByIndex(this.checkboxs, rowIndex);

        if (this.checkboxs.length == 0) {
            Sui.setChecked(this.checkboxAll, false);
        }
    },

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
 * 二维数据
 */
Sui.TwoArray = Sui.extend(Object, {

    constructor: function () {
        this.grid = [];
    },

    getRow: function (row, createIfNotExist) {
        var rowObject = this.grid[row];
        if (createIfNotExist && Sui.isUndefinedOrNull(rowObject)) {
            rowObject = [];
            this.grid[row] = rowObject;
        }
        return rowObject;
    },

    getRowLength: function (row) {
        var rowObject = this.getRow(row);
        return Sui.isUndefinedOrNull(rowObject) ? 0 : rowObject.length;
    },

    setValue: function (row, col, value) {
        var row = this.getRow(row, true);
        row[col] = value;
    },

    getLastRow: function () {
        return this.grid[this.grid.length - 1];
    },

    getValueInLastRow: function (col) {
        return this.getLastRow()[col];
    },

    getRowCount: function () {
        return this.grid.length;
    }

});

//多行列头
Sui.table.MultiRowColumnModels = function (columnsArray) {

    Sui.apply(this, {

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

        initEventOnTable : Sui.emptyFn,

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

        getHeaderRowCount: function () {
            return this.columnModelsArray.length;
        },

        getColumnCount: function (rowIndex) {
            return this.columnModelsArray[rowIndex].length;
        },

        getColumnModelByRowCol: function (row, col) {
            return this.columnModelsArray[row][col];
        },

        getRenderColumnCount: function () {
            return this.columnModelGrid.getRowLength(0);
        },

        getRenderColumnModel: function (col) {
            return this.columnModelGrid.getValueInLastRow(col);
        },

        add: function (item, index) {
            item.setRowspan(this.columnModelGrid.getRowCount());
            Sui.ArrayUtil.add(this.columnModelsArray[0], item, index);

            this.initRenderColumModel();
        },

        /**
         * @deprecated
         * @param index
         * @return {*}
         */
        getColumnModelByIndex: function (index) {
            return this.getRenderColumnModel(index);
        },

        getColumnModel: function (columnName) {
            if (Sui.isNumber(columnName)) {
                var index = columnName;
            } else {
                var index = this.getColumnIndex(columnName);
            }
            return this.getRenderColumnModel(index);
        },

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

}

Sui.table.ColumnModels = function (columns) {

    var cms = [];

    Sui.apply(cms, {

        initConfig: function (columns) {

            var thisColumnModels = this;

            Sui.each(columns, function (columnConfig) {
                thisColumnModels.push(Sui.table.ColumnManager.createColumnModel(columnConfig));
            })
        },

        initEventOnTable : function(table){
            for(var i =0; i < this.getColumnCount(); i++){
                this.getColumnModel(i).initEventOnTable(table);
            }
        },

        add: function (item, index) {
            Sui.ArrayUtil.add(this, item, index);
        },

        getColumnModelByIndex: function (index) {
            return cms[index];
        },

        getColumnModel: function (columnName) {
            if (Sui.isNumber(columnName)) {
                var index = columnName;
            } else {
                var index = this.getColumnIndex(columnName);
            }
            return cms[index];
        },

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

        getColumnCount: function () {
            return cms.length;
        },

        /**
         * 渲染多少列
         */
        getRenderColumnCount: function () {
            return cms.length;
        },

        /**
         * 渲染第col列,对应的ColumnModel
         */
        getRenderColumnModel: function (col) {
            return cms[col];
        },

        /**
         * 计算表格的宽度
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
        }
    })

    cms.initConfig(columns);

    return cms;

};

Sui.tableClassName = "Sui.table.Table";


/**
 * 自定义渲染器
 * @type {{overrideDefaultRender: Function, renderRow: Function}}
 */
Sui.table.CustomRender = {

    /**
     * 是否生成单元格
     */
    createCell: function (record, rowIndex, columnModel, table) {
        return true;
    },

    /**
     * 设置生成的单元格的属性
     * @param tdJQ
     */
    setCellAttr: function (tdJQ) {
    },
    
    setRowAttr : function(trJQ){
    	
    }

}

Sui.table.TableRenderModel = {
    TABLE: '',
    GRID: 'grid'
}

/**
 * Table定义一个简单的表格展示功能。
 * 默认表格的行之间不会产生影响，一般来说，表格之间的行会有影响。
 */
/**
 *
 * Table定义一个简单的表格展示功能。
 * 默认表格的行之间不会产生影响，一般来说，表格之间的行会有影响。
 * Table的所有属性和方法请参照Sui.table.ExTable
 * @class Sui.table.Table
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
 * @param {Boolean} config.oddClass 是否为奇数行定义其他样式,默认为true
 */
Sui.table.Table = Sui.extend(Sui.Component, {

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
     * 是否为奇数行定义其他样式
     */
    oddClass:true,
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
     * 是否显示右键菜单,默认显示
     */
    isShowContextMenu: false,
    /**
     * 记录上一次点击右键菜单的行 onContextMenu 修改
     */
    lastContextMenuRowIndex: -1,
    /**
     * 获取指定插入位置
     */
    getInsertPlace : Sui.emptyFn,

    initProperties: function () {
        Sui.table.Table.superclass.initProperties.apply(this, arguments);
        this.selectedRows = [];
    },

    getCheckboxVisibleColumn: function () {
        return this.checkboxVisibleColumn;
    },

    getCheckboxColumnModel: function () {
        return this.columnModels.getRenderColumnModel(this.checkboxColumnIndex);
    },

    getStore: function () {
        return this.store;
    },

    getColumnModels: function () {
        return this.columnModels;
    },

    getRenderColumnCount: function () {
        return this.columnModels.getRenderColumnCount();
    },
    
    getRenderColumnModel: function (col) {
        return this.columnModels.getRenderColumnModel(col);
    },

    setEdiable : function(editable){
        this.ediable = editable;
    },

    /**
     * defaultColumnWidth 配置表格默认的列宽
     * @param config
     */
    initConfig: function (config) {

        Sui.table.Table.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ['store', 'fixWidth', "customRender", "defineLastRowClass",
            'columnModels', "selectType", "checkboxColumnIndex", "checkboxVisibleColumn", "readOnly", "ediable",
            "showTipWhenEmpty", "tipWhenEmpty", 'renderModel','isShowContextMenu','getInsertPlace','oddClass','emptyClass']);

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

    render: function (container, insertBefore) {

        this.createApplyToElement("table", container, insertBefore);
        
        this.renderHeader();

        if (this.renderModel == Sui.table.TableRenderModel.GRID) {
            this.wrapTable();
        }

        this.renderBody();

        this.renderColumnResizeMoveDrags();

    },

    wrapTable: function () {
        this.getApplyToElement().wrap("<div><div></div></div>")
        // 顶部工具栏, 底部工具栏
        this.tableWrapElement = this.getApplyToElement().parent();
    },

    /**
     * 表格的外层div
     * @return {*}
     */
    getTableWrapElement : function(){
        return this.tableWrapElement;
    },

    renderColumnResizeMoveDrags : function(){
        if(this.renderModel == Sui.table.TableRenderModel.GRID){
            // 如果采用Grid渲染模式,则可以调整列的大小
            this.renderColumnResizeDrags();
        }
    },

    /**
     * 渲染调整列宽的元素。所有的调整元素放在一个div中。
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
     */
    renderHeader: function () {

        var theadJQ = this.createHeaderElement();

        if (this.isMultiRowHeader) {
            this.renderMultiRowHeader();
        } else {
            this.renderHeaderRow();
        }
    },

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

    renderHeaderRow: function () {
        var trJQ = $("<tr></tr>").appendTo(this.headElement);

        for (var i = 0; i < this.columnModels.length; i++) {

            var columnModel = this.columnModels[i];
            var thJQ = $("<th></th>").appendTo(trJQ);

            thJQ.css("width", columnModel.width + "px");

            this.renderHeaderCell(columnModel, thJQ);

            if (!columnModel.visible) {
                thJQ.hide();
            }
        }
    },

    createHeaderElement: function () {
        this.headElement = $("<thead></thead>").addClass('grid_thead').appendTo(this.getApplyToElement());
    },

    /**
     * 渲染表头单元格
     * @param columnModel 表头数据
     * @param thJQ 表头单元格
     */
    renderHeaderCell: function (columnModel, thJQ) {

        thJQ.addClass(this.headerCellClass);

        if (Sui.isFunction(columnModel.renderHeader)) {
            // 如果定义了renderHeader
            columnModel.renderHeader(columnModel.display, thJQ, this, columnModel);
        } else if (Sui.isObject(columnModel.renderHeader) && columnModel.renderHeader.renderHeader) {
            // 如果实现了renderHeader接口
            columnModel.renderHeader.renderHeader(columnModel.display, thJQ, this, columnModel);
        } else {
            // 直接渲染文本
            if (columnModel.displayAsText) {
                thJQ.text(columnModel.display);
            } else {
                thJQ.html(columnModel.display);
            }
        }

        // 不是在渲染BodyCell时,调用
        if (columnModel.existEditor()) {
            if (columnModel.isUseDynamicEditor()) {
                columnModel.on("editorCompleteEdit", Sui.makeFunction(this, this.onCompleteEdit));
            } else {
                columnModel.editor.on("completeEdit", Sui.makeFunction(this, this.onCompleteEdit));
            }
        }

        thJQ.css("text-align", columnModel.align);

    },

    /**
     * 渲染表格body
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

    createBodyElement: function () {
        this.bodyElement = $("<tbody></tbody>").appendTo(this.getApplyToElement());
    },

    renderTipRowIfNotData : function(){
        if (this.store.getCount() == 0 && this.showTipWhenEmpty) {
            this.renderTipRow(this.tipWhenEmpty);
        }
    },

    removeTipRowIfExistData : function(){
        if(this.emptyTipRow){
            this.emptyTipRow.remove();
            this.emptyTipRow = null;
        }
    },

    renderTipRow: function (tip) {
        var trJQ = this.emptyTipRow = $("<tr></tr>").appendTo(this.bodyElement);
        var td = $("<td></td>").appendTo(trJQ).text(tip).attr("colspan", this.columnModels.getRenderColumnCount()).addClass(this.emptyClass);
    },

    /**
     * 渲染一行记录
     * @param record
     * @param index
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
    
    handleLastRow : function(trJQ){
    	if(this.defineLastRowClass){
    		trJQ.addClass("sui_table_lastrow");
    	}
    },

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
         * 另外不要使用skygqOneDblClick，使用skygqOneDblClick的效果不好。如果用户点击行之后，快速移开鼠标，会出现闪烁情况。
         */
        trJQ.click(Sui.makeFunction(this, this.onRowClick));

        Sui.hover(trJQ, this.mouseOverRowClass, "");
    },


    renderBodyCell: function (cellValue, columnModel, tdJQ, record, rowIndex) {

        if (Sui.isFunction(columnModel.renderBody)) {
            columnModel.renderBody(cellValue, tdJQ, this, columnModel, record, rowIndex);
        } else if (Sui.isObject(columnModel.renderBody)){
            if(Sui.isFunction(columnModel.renderBody.renderBody)) {
                columnModel.renderBody.renderBody(cellValue, tdJQ, this, columnModel, record, rowIndex);
            }else {
                tdJQ.html(Sui.nullToEmpty(columnModel.renderBody[cellValue]));
            }
        } else {
            tdJQ.html("" + Sui.nullToEmpty(cellValue));
        }

        if (columnModel.renderHiddenField) {
            $("<input type='hidden'/>").val(cellValue).attr("name", columnModel.name).appendTo(tdJQ);
        }

        tdJQ.addClass(this.bodyCellClass);

        if (columnModel.existEditor()) {
            tdJQ[this.editCellEvent](Sui.makeFunction(this, this.onCellEditEvent));
        }

        tdJQ.css("text-align", columnModel.align);
    },

    /**
     *  处理所有单元格的点击事件
     */
    onCellEditEvent: function (e) {

        if (this.readOnly || !this.ediable) {
            return;
        }

        var cellDom = e.target;
        var columnModel = this.findColumnModel(cellDom);
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
    relocateEditor:function() {

        if( this.currentCellEditing ){
            var cell = this.currentCellEditing,
                columnModel = this.findColumnModel(cell);
            columnModel.getEditor(cell, columnModel, null, null).locateEditor($(cell));
        }

    },
    startEditCell: function (cellDom, columnModel, cellVal, record, index) {
        this.currentCellEditing = cellDom;
        columnModel.getEditor(cellDom, cellVal, record, index).startEdit(cellDom, cellVal, this, record);
    },

    getEditCellRowIndex: function () {
        return this.findDomInRowIndex(this.currentCellEditing);
    },

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
        }else if( Sui.isArray(val) && val[0] && !(val[0] instanceof Object) && !(val[0] instanceof Array)){
            //当val为数字或字符串组成的非空数组
             record.setFieldValue(columnModel.name, val);
        } else {

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

    afterRender: function () {
        Sui.table.Table.superclass.afterRender.apply(this, arguments);

        if (this.fixWidth) {
            var totalWidth = this.columnModels.calcTotalWidth();
            this.getApplyToElement().width(totalWidth);
        }
    },

    initEvent: function () {
        this.store.on('addRecord', Sui.makeFunction(this, this.onAddRow));
        this.store.on('removeRecord', Sui.makeFunction(this, this.onRemoveRow));
        this.store.on('recordChange', Sui.makeFunction(this, this.onRecordChange));

        this.columnModels.initEventOnTable(this);

        //窗口尺寸改变时，重新计算当前单元组件编辑器的位置
        $(window).resize(Sui.makeFunction(this, this.relocateEditor));
    },

    /**
     * 数据操作
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
     * @param rowIndex
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

    createEmptyData: function () {
        var defaultData = {};

        var cms = this.columnModels;
        Sui.each(cms, function (cm) {
            defaultData[cm.name] = "";
        });

        return defaultData;
    },


    createEmptyRow: function () {
        var defaultData = this.createEmptyData();
        this.store.addRecordData(defaultData);
    },

    onRowClick: function (e) {
        if (this.selectType == Sui.table.SelectType.SINGLE) {
            this.setSelectedRowByDom(e.target);
        }
    },

    /**
     * 获取第i条记录对应的元素
     * @param rowIndex
     */
    getRowElement: function (rowIndex) {
        return this.bodyElement.children("tr:eq(" + rowIndex + ")");
    },

    /**
     * 获取dom元素所在行的索引
     */
    findDomInRowIndex: function (dom) {
        dom = Sui.getJQ(dom);
        var tr = dom.parentsUntil('tbody').last();
        return this.bodyElement.children("tr").index(tr);
    },

    findRowIndex: function (trElement) {
        return this.bodyElement.children("tr").index(trElement);
    },

    findColumnModel: function (dom) {

        var tds = dom.tagName.toUpperCase() == 'TD' ? Sui.getJQ(dom).prevAll() : Sui.getJQ(dom).parent('td').prevAll();
        var index = 0;
        tds.each(function (i, td) {
            index += Sui.getColspan(td);
        });
        return this.columnModels.getColumnModelByIndex(index);
    },

    /**
     * 删除选中的行
     */
    removeSelectedRows: function () {
        var indexs = this.getSelectedRowIndexs();
        this.store.removeRecords(indexs);
    },

    /**
     * 获取选中行的索引。如果有多行被选中，则返回第一个被选中行的索引。
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

    clearSelectedRows: function () {
        if (this.selectType == Sui.table.SelectType.SINGLE) {
            this.setSelectedRow(null);
        } else if (this.selectType == Sui.table.SelectType.MULTI) {
            var checkboxCM = this.getCheckboxColumnModel();
            checkboxCM.setAllChecked(false);
        }
    },

    setSelectedRowByDom: function (dom) {
        var rowIndex = this.findDomInRowIndex(dom);
        this.setSelectedRowIndex(rowIndex);

        this.fireEvent( 'rowClick',new Sui.util.Event({
            target:dom,
            index:rowIndex
        }));
    },

    setSelectedRow: function (rowElement) {

        if (this.selectedRowElement != null) {
            this.selectedRowElement.removeClass(this.selectedRowClass);
        }

        this.selectedRowElement = rowElement;
        if (this.selectedRowElement) {
            this.selectedRowElement.addClass(this.selectedRowClass);
        }

    },

    setSelectedRowIndex: function (rowIndex) {
        if (this.selectType == Sui.table.SelectType.SINGLE) {

            var rowElement = this.getRowElement(rowIndex);
            this.setSelectedRow(rowElement);

        }
    },

    refreshColumn : function(columnModel){
        var rowCount = this.store.getCount();
        for (var i = 0; i < rowCount; i++) {
            var record = this.store.getRecord(i);
            this.refreshCell(columnModel, record, i);
        }
    },

    refreshCell: function (columnModel, record, index) {
        var row = this.getRowElement(index);
        var fieldName = columnModel.getName();
        var value = record.getFieldValue(fieldName);
        var cellElement = this.getCellElement(row, fieldName);
        this.repaintCell(value, columnModel, cellElement, record, index);
    },

    repaintCell : function(value, columnModel, cellElement, record, index){
        cellElement.empty();
        this.renderBodyCell(value, columnModel, cellElement, record, index);
    },

    /**
     * ****************************************************************************************************
     * 右键菜单相关
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

	onContextMenu: function (e) {		
        e.preventDefault();
        
		//找到当前行号
		var trElement = Sui.findFirstAncestorBySelector(e.target, "tr");
		this.lastContextMenuRowIndex = this.findRowIndex(trElement);
		
        this.showContextMenu(e);
    },

    showContextMenu: function (e) {
        this.contextMenu.alignToAndShow(e);
    },
    
    /**
     * 拷贝当前行数据,由用户输入拷贝几行
     */
    copyData: function(e) {
    	var prompt = new NumberInputPrompt({
    		title:'设置行数',
            name:'复制行数',
            defaultValue:'1',
            fun:Sui.makeFunction(this, this.copyDataBS)
        });
    },
    
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
    }
    ,
    /**
     * @显示隐藏某列
     * @method toggleCol
     * @param {Array} cols
     */
    toggleCols:function( cols,show){

        var isShow = !!show;

        var headThs = this.headElement.find('tr')[0].cells;
        var bodyTrs = this.bodyElement[0].rows;
        for (var i = 0,len = cols.length; i < len; i++) {

            headThs[cols[i]].style.display = isShow ? '' : 'none';
            for (var j = 0,len1 = bodyTrs.length; j < len1; j++) {
                bodyTrs[j].cells[cols[i]].style.display = isShow ? '' : 'none' ;
            }

            this.columnModels[cols[i]].visible = isShow;
        }
    }
    ,
    refresh:function(){
        this.getApplyToElement().html('');
        this.render();
    }
    /**
     * ***************************************************************************************************
     */
});



