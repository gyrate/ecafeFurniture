/**
 * TreeTable组件
 */
Sui.namespace('Sui.data');

/**
 * TreeTable的数据源类。
 * 可触发的事件包括: addRow, removeRow
 * @class Sui.data.TreeStore
 * @extends Sui.data.Store
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.idName  节点对应的属性名
 * @param {String} config.parentIdName 父节点对应的属性名
 * @example
 * <pre><code>
 *  new Sui.data.TreeStore({
 *      idName : 'taskName',
 *      parentIdName : 'parentTaskName',
 *      leafName: 'isLeaf',
 *      datas : [
 *          {
 *              parentTaskName : null,
 *              taskName : '节点1',
 *              isLeaf : false,
 *              taskType: '编码'
 *          },...
 *   })
 * </code></pre>
 */
Sui.data.TreeStore = Sui.extend(Sui.data.Store, {
    /**
     * 节点对应的属性名
     * @property idName
     * @type {String}
     * @default  'id'
     */
    idName : 'id',
    /**
     * 父节点对应的属性名
     * @property  parentIdName
     * @type {String}
     * @default  'parentId'
     */
    parentIdName : 'parentId',

    /**
     * 构造器
     * @method  constructor
     * @param {Object} config
     * @private
     */
    constructor : function(config) {
        Sui.data.TreeStore.superclass.constructor.call(this, config);
        Sui.applyProps(this, config, ['idName', 'parentIdName']);
    },
    /**
     * 将数据转化成树结构数据源
     * @method  convertDataToRecord
     * @param {Object} data
     * @return {Sui.data.TreeRecord}
     * @private
     */
    convertDataToRecord : function(data) {
        return new Sui.data.TreeRecord({
            data : data,
             store : this,
            treeStore : this
        });
    },
    /**
     * 插入一组数据
     * @method insertRecordNotSortData
     * @param {Array} datas 数据
     * @param {Function,Boolean} sortFunction 如果值为true,则采用默认的排序方式
     */
    insertRecordNotSortData : function(datas, sortFunction) {

        // 构造id和节点的映射
        var idNodeMap = {};
        for (var i = 0; i < datas.length; i++) {
            var taskDTO = datas[i];
            var nodeId = taskDTO[this.idName];
            idNodeMap[nodeId] = new Sui.data.TreeNode({
                data : taskDTO
            });
        }

        // 构造一颗树, rootNodes保存所有的根节点
        var rootNodes = [];
        for (var i = 0; i < datas.length; i++) {
            var taskDTO =datas[i];
            var nodeId = taskDTO[this.idName];
            var parentId = taskDTO[this.parentIdName];
            if (parentId) {
                idNodeMap[parentId].addChildNode(idNodeMap[nodeId]);
            } else {
                rootNodes.push(idNodeMap[nodeId]);
            }
        }

        // 对节点进行排序,有孩子节点的放在前面.
        if(sortFunction === true){
            for (var i = 0; i < rootNodes.length; i++) {
                rootNodes[i].preorderTraversal(function(node) {
                    node.sortChildNodes();
                });
            }
        }

        var thisStore = this;
        for (var i = 0; i < rootNodes.length; i++) {
            rootNodes[i].preorderTraversal(function(node) {
                var taskDTO = node.getData();
                thisStore.addRecordData(taskDTO);
            });
        }

    },
    /**
     * 在某个索引前插入数据
     * @method   insertRecordDataBefore
     * @param {Object} data
     * @param {Number} recordIndex
     *
     */
    insertRecordDataBefore : function(data, recordIndex) {
        this.insertRecordBefore(this.convertDataToRecord(data), recordIndex);
    },
    /**
     * @method  insertRecordBefore
     * @param {Sui.data.TreeRecord} record
     * @param {Number}  recordIndex
     * @private
     */
    insertRecordBefore : function(record, recordIndex) {
        this.addRecord(record, recordIndex);
    },
    /**
     * 添加多个孩子节点数据
     * @method   addChildRecordData
     * @param {Object} data
     * @param {Number}  parentRecordIndex 父节点的索引值
     *
     */
    addChildRecordData : function(data, parentRecordIndex) {
        this.addChildRecord(this.convertDataToRecord(data), parentRecordIndex);
    },
    /**
     * 添加单个孩子节点数据
     * @method  addChildRecord
     * @param {Sui.data.TreeRecord} record
     * @param {Number} parentRecordIndex
     *
     */
    addChildRecord : function(record, parentRecordIndex) {
        if (this.getRecord(parentRecordIndex).isLeaf()) {
            this.addRecord(record, parentRecordIndex + 1);
        } else {
            var lastChildIndex = this.getLastChildIndex(this.getRecord(parentRecordIndex));
            this.insertRecordAfter(record, lastChildIndex);
        }
    },
    /**
     * 获取最后一个子节点的索引，找不到则返回-1
     * @method  getLastChildIndex
     * @param {Sui.data.TreeRecord} record
     * @return {Number}
     * @private
     */
    getLastChildIndex : function(record) {
        var childRecordIndexs = this.getChildRecordIndexs(record);
        if (childRecordIndexs && childRecordIndexs.length > 0) {
            return childRecordIndexs[childRecordIndexs.length - 1];
        }
        return -1;
    },
    /**
     * 在某个索引后插入数据
     * @method  insertRecordDataAfter
     * @param {Object} data
     * @param {Number} recordIndex
     *
     */
    insertRecordDataAfter : function(data, recordIndex) {
        this.insertRecordAfter(this.convertDataToRecord(data), recordIndex);
    },
    /**
     * 在某个索引值后插入记录
     * @method  insertRecordAfter
     * @param {Sui.data.TreeRecord} record
     * @param {Number} recordIndex
     * @private
     */
    insertRecordAfter : function(record, recordIndex) {
        var index = -1;
        if (record.isRoot()) {
            var rootIndex = this.findNextRoot(recordIndex + 1);
            if (rootIndex == -1) {
                index = this.getCount();
            } else {
                index = rootIndex;
            }
        } else {
            var nextSibling = this.findIndexByParentId(record.getParentId(), recordIndex + 1);
            if (nextSibling == -1) {
                // 获取最后一个孩子节点的位置
                index = this.getLastAllChildrenIndex(recordIndex) + 1;
            } else {
                index = nextSibling;
            }
        }

        this.addRecord(record, index);

    },
    /**
     * 获取整个数据最后一个孩子节点的位置
     * @method  getLastAllChildrenIndex
     * @param {Number} recordIndex
     * @private
     */
    getLastAllChildrenIndex : function(recordIndex) {
        var record = this.getRecord(recordIndex);
        var array = this.getChildRecordIndexs(record);
        if (array && array.length > 0) {
            return this.getLastAllChildrenIndex(array[array.length - 1]);
        } else {
            return recordIndex;
        }
    },
    /**
     * 指定父节点id，找到某节点的索引(从后开始找)
     * @method  findPrevIndexByParentId
     * @param {String} parentId
     * @param {Number} end
     *
     */
    findPrevIndexByParentId : function(parentId, end) {
        var ret = -1;
        for (var i = end; i >= 0; i--) {
            if (this.getRecord(i).getParentId() == parentId) {
                ret = i;
                break;
            }
        }
        return ret;
    },
    /**
     * 指定父节点id，找到某节点的索引(从前开始找)
     * @method  findIndexByParentId
     * @param {String} parentId
     * @param {Number} start
     * @private
     */
    findIndexByParentId : function(parentId, start) {
        var ret = -1;
        for (var i = start; i < this.getCount(); i++) {
            if (this.getRecord(i).getParentId() == parentId) {
                ret = i;
                break;
            }
        }
        return ret;
    },
    /**
     * 查找上一个根节点
     * @method  findPrevRoot
     * @param {Number} end
     * @private
     */
    findPrevRoot : function(end) {
        var rootIndex = -1;
        for (var i = end; i >= 0; i--) {
            if (this.getRecord(i).isRoot()) {
                rootIndex = i;
                break;
            }
        }
        return rootIndex;
    },
    /**
     * 查找下一个根节点
     * @method
     * @param {Number} start
     * @private
     */
    findNextRoot : function(start) {
        var rootIndex = -1;
        for (var i = start; i < this.getCount(); i++) {
            if (this.getRecord(i).isRoot()) {
                rootIndex = i;
                break;
            }
        }
        return rootIndex;
    },
     /**
     * 移除多条记录。不仅删除父节点，还要删除所有的孩子节点
     * @method removeRecords
     * @param {Array} rowIndexs
     * @private
     */
    removeRecords : function(rowIndexs) {

        // 需要将索引转换成Record对象。如果不转换的话，在删除其他节点时，索引的位置是会变的。
        var records = [];
        for (var i = 0; i < rowIndexs.length; i++) {
            records.push(this.getRecord(rowIndexs[i]));
        }

        for (var i = 0; i < records.length; i++) {
            this.removeRecord(records[i]);
        }

    },

    /**
     * 移除记录，同时删除它的子记录。
     * @method
     * @param {Number} rowIndex
     *
     */
    removeRecord : function(rowIndex) {
        var allChild = this.getChildRecordIndexs(rowIndex, true);

        var thisIndex = rowIndex;
        if (! Sui.isNumber(rowIndex)) {
            thisIndex = this.indexOf(rowIndex);
        }

        if (thisIndex != -1) {
            allChild.push(thisIndex);
        }

        Sui.ArrayUtil.sort(allChild, "desc");

        var thisStore = this;
        Sui.each(allChild, function(row) {
            Sui.data.TreeStore.superclass.removeRecord.call(thisStore, row);
        });

    },
    /**                \
     * 获得记录的idName属性值
     * @method  getRecordId
     * @param {Sui.data.TreeRecord} record
     * @return {String}
     *
     */
    getRecordId : function(record) {
        return  record.getFieldValue(this.idName);
    },
    /**
     * 获得记录的parentIdName属性值
     * @method  getParentRecordId
     * @param {Sui.data.TreeRecord} record
     *
     */
    getParentRecordId : function(record) {
        return  record.getFieldValue(this.parentIdName);
    },

    /**
     * 判断是否叶子节点
     * @method isLeaf
     * @param {Sui.data.TreeRecord} config
     *
     */
    isLeaf : function(record) {
        var array = this.getChildRecordIndexs(record);
        return array.length <= 0;
    },

    /**
     * 获得父节点记录
     * @method  getParentRecord
     * @param {Sui.data.TreeRecord} record
     * @return  {Sui.data.TreeRecord}
     *
     */
    getParentRecord : function(record) {
        var parentIndex = this.getParentRecordIndex(record);
        if (parentIndex == -1) {
            return null;
        } else {
            return this.getRecord(parentIndex);
        }
    },

    /**
     * 获得父节点的索引
     * @method  getParentRecordIndex
     * @param {Sui.data.TreeRecord} record
     *
     */
    getParentRecordIndex : function(record) {
        if (Sui.isNumber(record)) {
            record = this.getRecord(record);
        }

        if (record.isRoot()) {
            return -1;
        } else {
            var parentId = record.getParentId();
            return this.getRecordIndexById(parentId);
        }
    },

    /**
     * 通过id找到节点数据的索引
     * @method  getRecordIndexById
     * @param {String} id
     * @return {Number}
     *
     */
    getRecordIndexById : function(id) {
        var ret = -1;
        Sui.each(this.items, function(record, i) {
            if (record.getId() == id) {
                ret = i;
                return false;
            }
        });
        return ret;
    },
    /**
     * 获得最后一个兄弟节点的索引
     * @method  getLastSiblingIndex
     * @param {Sui.data.TreeRecord} record
     *
     */
    getLastSiblingIndex : function(record) {
        var indexs = this.getChildRecordIndexs(record.getParentRecord());
        if (indexs.length > 0) {
            return indexs[indexs.length - 1];
        } else {
            return -1;
        }
    },

    /**
     * 查找record的所有的孩子节点的索引
     * @method  getChildRecordIndexs
     * @param {Sui.data.TreeRecord} record
     * @param {Boolean} recursive 是否递归查找
     * @return {Array}
     *
     */
    getChildRecordIndexs : function(record, recursive) {

        if (Sui.isNumber(record)) {
            record = this.getRecord(record);
        }

        var thisStore = this;

        var ret = [];

        if (recursive) {

            var parentIdSet = new Sui.util.HashSet();
            parentIdSet.add(record.getId());

            Sui.each(this.items, function(item, i) {
                if (parentIdSet.contains(item.getParentId())) {
                    parentIdSet.add(item.getId());
                    ret.push(i);
                }
            });
        } else {
            Sui.each(this.items, function(item, i) {
                if (item.getParentId() == record.getId()) {
                    ret.push(i);
                }
            });
        }
        return ret;
    }
});
/**
 * 树节点数据记录
 * @class  Sui.data.TreeRecord
 * @extends Sui.data.Record
 * @constructor
 * @param {Object} config 配置参数
 * @param {Object} data
 * @param {Sui.tree.TreeStore}  store
 * @param {Sui.tree.TreeStore}  treeStore
 */
Sui.data.TreeRecord = Sui.extend(Sui.data.Record, {
    /**
     * @property treeStore
     * @type {Sui.data.TreeStore}
     * @default null
     */
    treeStore : null,
    /**
     * 该节点的深度
     * @property level
     * @type {Number}
     * @default null
     */
    level : null,
    /**
     * 构造器
     * @method  constructor
     * @param {Object} config
     * @private
     */
    constructor : function(config) {
        Sui.data.TreeRecord.superclass.constructor.call(this, config);
        Sui.applyProps(this, config, ["treeStore"]);
    },
    /**
     * 获得节点id
     * @method getId
     * @return {Number}
     *
     */
    getId : function() {
        return this.treeStore.getRecordId(this);
    },
    /**
     * 获得父节点id
     * @method getParentId
     * @return {Number}
     *
     */
    getParentId : function() {
        return this.treeStore.getParentRecordId(this);
    },
    /**
     * 获得父节点的TreeRecord
     * @method getParentRecord
     * @return {Sui.tree.TreeRecord}
     */
    getParentRecord : function() {
        return this.treeStore.getParentRecord(this);
    },
    /**
     * 获得父节点的索引
     * @method  getParentIndex
     * @return {Number}
     */
    getParentIndex : function() {
        return this.treeStore.getParentRecordIndex(this);
    },
    /**
     * 获得最末一个兄弟节点的索引
     * @method  getLastSiblingIndex
     * @return {Number}
     */
    getLastSiblingIndex : function() {
        return this.treeStore.getLastSiblingIndex(this);
    },
     /**
      * 判断是否根节点
     * @method  isRoot
     * @return {Boolean}
     */
    isRoot : function() {
        return !this.getParentId();
    },
    /**
     * 判断是否叶子节点
     * @method   isLeaf
     * @return {Boolean}
     */
    isLeaf : function() {
        return this.treeStore.isLeaf(this);
    },
    /**
     * 计算节点的深度,根节点深度为0
     * @method calcTreeNodeLevel
     * @return {Number}
     * @private
     */
    calcTreeNodeLevel : function() {
        if (this.isRoot()) {
            return 0;
        } else {
            return 1 + this.getParentRecord().calcTreeNodeLevel();
        }
    },
    /**
     * 设置并返回节点深度
     * @method  getTreeNodeLevel
     * @return {Number}
     */
    getTreeNodeLevel : function() {
        if (Sui.isEmpty(this.level)) {
            this.level = this.calcTreeNodeLevel();
        }
        return this.level;
    }
});

Sui.namespace('Sui.table');
/**
 * @class  Sui.table.ExTreeTable
 * @extends Sui.table.Table
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.selectType 节点选择类型,可支持多选、单选、不选
 * @param  {String} config.applyTo 渲染到的组件的id
 * @param  {String} config.treeColumnName 展示树结构那一列的名称
 * @param {Sui.tree.TreeStore} store 数据源
 * @param {Array} columns 列头信息
 * @example
 * <pre><code>
 * new Sui.table.ExTreeTable({
 *      selectType : Sui.table.SelectType.MULTI,
 *      applyTo : 'dateReportTable',
 *      treeColumnName : 'taskName',
 *      columns: [
 *          { display: '任务名称', name: 'taskName', width: 200 },
 *          { display: '任务类型', name: 'taskType', width: 100, align: 'left' }
 *      ],
 *      store :  store
 * })
 * </code></pre>
 */
Sui.table.ExTreeTable = Sui.extend(Sui.table.ExTable, {

    /**
     * 展示树结构那一列的名称
     * @property   treeColumnName
     * @type String
     * @defualt null
     */
    treeColumnName : null,
    /**
     * 不同级别的节点,缩进宽度的基数
     * @property spacingWidth
     * @type Number
     * @defult 20
     */
    spacingWidth : 20,
    /**
     * 折叠图标的宽度
     * @property  foldIconWidth
     * @type Number
     * @defult 16
     */
    foldIconWidth : 16,
    /**
     * 根据配置参数初始化
     * @method  initConfig
     * @param {Object} config
     * @private
     */
    initConfig : function(config) {

        Sui.table.ExTreeTable.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ['treeColumnName']);

        if (this.selectType == Sui.table.SelectType.MULTI) {
            var checkboxCM = this.getCheckboxColumnModel();
            checkboxCM.addListener("click", Sui.makeFunction(this, this.onCheckboxClick));
        }
    } ,
    /**
     * 当节点前checkbox或radio被选中时触发
     * @method  onCheckboxClick
     * @param {Event} e
     * @private
     */
    onCheckboxClick : function(e) {

        var checkboxCM = this.getCheckboxColumnModel();
        var rowIndex = e.index;
        var checked = e.checked;
        var store = this.store;

        // 调整子节点的被选中的状态
        var rowIndexs = store.getChildRecordIndexs(rowIndex, true);
        checkboxCM.setCheckeds(rowIndexs, checked);

        //调整父节点选中的状态
        var parentRow = store.getParentRecordIndex(rowIndex);
        while (parentRow != -1) {
            var childRecordIndexs = store.getChildRecordIndexs(parentRow, false);
            /**
             * 如果当前节点被选中,则父节点要被选中.
             * 如果当前节点没被选中,并且邻节点都没有被选中,则父节点也不要被选中.
             */
            if (checked ||
                !checked && checkboxCM.isAllChecked(childRecordIndexs, false)) {
                checkboxCM.setChecked(parentRow, checked);
            }

            parentRow = store.getParentRecordIndex(parentRow);
        }
    },
    /**
     * 渲染td单元
     * @method renderBodyCell
     * @param {String} cellValue
     * @param {Sui.table.columnModel} columnModel
     * @param {DOM} tdJQ
     * @param {Sui.data.Record} record
     * @private
     */
    renderBodyCell : function(cellValue, columnModel, tdJQ, record) {

        Sui.table.ExTreeTable.superclass.renderBodyCell.apply(this, arguments);

        // 树节点
        if (columnModel.name == this.treeColumnName) {
            var con = tdJQ.children().first();
            var foldIcon = $("<b class='sui_treetable_foldicon'></b>").prependTo(con);
            foldIcon.click(Sui.makeFunction(this, this.onFoldClick));

            // 生成填充空白
            var level = record.getTreeNodeLevel();
            $(this.getHSpacing(this.spacingWidth * level)).prependTo(con);

            this.updateFoldIconStyle(record, foldIcon);


        }
    },
    /**
     * 更新节点前的折叠展开图标
     * @method updateFoldIconStyle
     * @param {Sui.data.TreeRecord} record
     * @param {DOM}  foldIcon
     * @private
     */
    updateFoldIconStyle : function(record, foldIcon) {
        if (record.isLeaf()) {
            foldIcon.removeClass("sui_treetable_plus sui_treetable_minus");
        } else {
            if (! this.hasFoldClass(foldIcon)) {
                foldIcon.addClass("sui_treetable_minus")
            }
        }
    },
    /**
     * 判断节点是否有折叠展开样式
     * @method  foldIcon
     * @param {DOM}  foldIcon
     * @return {Boolean}
     * @private
     */
    hasFoldClass : function(foldIcon) {
        return foldIcon.hasClass("sui_treetable_plus") || foldIcon.hasClass("sui_treetable_minus")
    },
    /**
     * 当折叠展开图标被点击时执行
     * @method onFoldClick
     * @param {Event} e
     * @private
     */
    onFoldClick : function(e) {
        var targetJQ = $(e.target);

        if (! this.hasFoldClass(targetJQ)) {
            return;
        }

        // 更改折叠图标的样式
        targetJQ.toggleClass("sui_treetable_minus");
        targetJQ.toggleClass("sui_treetable_plus");

        var rowIndex = this.findDomInRowIndex(e.target);
        this.updateRowFoldState(rowIndex, targetJQ.hasClass("sui_treetable_plus"));
    },
    /**
     * 添加行时执行。需要根据父节点判断是否可见。
     * @method  onAddRow
     * @param {Sui.util.Event} event
     * @private
     */
    onAddRow : function(event) {
        Sui.table.ExTreeTable.superclass.onAddRow.apply(this, arguments);

        var record = event.record;
        this.updateParentRecordFoldIconStyle(record);

        /**
         *  1. 不存在父节点，默认是可见的。
         *  2. 父节点可见，如果父节点折叠，则不可见；否则可见。
         *  3. 父节点不可见，则不可见。
         */

        var visible = false;
        var parentIndex = record.getParentIndex();
        if (parentIndex == -1) {
            visible = true;
        } else {
            if (this.isRowVisible(parentIndex)) {
                if (this.isRowFold(parentIndex)) {
                    visible = false;
                } else {
                    visible = true;
                }
            } else {
                visible = false;
            }
        }

        var index = event.index;
        this.setRowVisible(index, visible);

    },
    /**
     * 删除行时执行
     * @method onRemoveRow
     * @param {Sui.util.Event} event
     * @private
     */
    onRemoveRow : function(event) {
        Sui.table.ExTreeTable.superclass.onRemoveRow.apply(this, arguments);

        var record = event.record;
        this.updateParentRecordFoldIconStyle(record);

    },
    /**
     * 更新父节点的折叠展开图标
     * @method  updateParentRecordFoldIconStyle
     * @param  {Sui.data.TreeRecord}
     * @private
     */
    updateParentRecordFoldIconStyle:function(record) {
        var parentRecord = record.getParentRecord();

        if (parentRecord) {
            var parentIndex = this.store.getRecordIndexById(parentRecord.getId());
            this.updateFoldIconStyle(parentRecord, this.getFoldElement(parentIndex));
        }
    },
    /**
     * 如果折叠的话,将所有子节点(包含孩子节点下面的子节点)隐藏. 如果展开的话,将直接孩子节点显示出来,如果孩子节点是展开的话,则继续展开
     * @method updateRowFoldState
     * @param {Number} rowIndex
     * @param {Boolean}  isFold
     * @private
     */
    updateRowFoldState : function(rowIndex, isFold) {

        if (Sui.isUndefined(isFold)) {
            isFold = this.isRowFold(rowIndex);
        }
        var record = this.store.getRecord(rowIndex);

        // 如果折叠的话,将所有子节点(包含孩子节点下面的子节点)隐藏. 如果展开的话,将直接孩子节点显示出来,如果孩子节点是展开的话,则继续展开.
        if (isFold) {
            var subRecordIndexs = this.store.getChildRecordIndexs(record, true);
            this.setRowsVisible(subRecordIndexs, !isFold);
        } else {
            var subRecordIndexs = this.store.getChildRecordIndexs(record, false);
            if (subRecordIndexs) {
                this.setRowsVisible(subRecordIndexs, !isFold)
                for (var i = 0; i < subRecordIndexs.length; i++) {
                    var childIndex = subRecordIndexs[i];
                    var isChildFold = this.isRowFold(childIndex);
                    if (! isChildFold) {
                        this.updateRowFoldState(childIndex, isChildFold);
                    }
                }
            }
        }
    },
     /**
     * 判断行是否被折叠
     * @method  isRowFold
     * @param {Number} rowIndex
     * @private
     */
    isRowFold : function(rowIndex) {
        return this.getFoldElement(rowIndex).hasClass("sui_treetable_plus");
    },
    /**
     * 获取第rowIndex行的折叠图标
     * @method  getFoldElement
     * @param {Number} rowIndex
     * @private
     */
    getFoldElement : function(rowIndex) {
        var tdJQ = this.getCellElement(rowIndex, this.treeColumnName);
        return tdJQ.find(".sui_treetable_foldicon");
    },
    /**
     * 设置多行的可见度
     * @method  setRowsVisible
     * @param {Array} rowIndexs
     * @param {Boolean} visible
     * @private
     */
    setRowsVisible : function(rowIndexs, visible) {

        Sui.debugMethodCall('Sui.table.TreeGrid', 'setRowsVisible', arguments);

        var thisProxy = this;
        Sui.each(rowIndexs, function(index) {
            thisProxy.setRowVisible(index, visible);
        });
    },
    /**
     * 判断某行是否可见
     * @method isRowVisible
     * @param  {Number} index
     * @return Boolean
     * @private
     */
    isRowVisible : function(index) {
        return Sui.isDisplayVisible(this.getRowElement(index));
    },
    /**
     * 设置行的可见性
     * @method setRowVisible
     * @param  {Number} index
     * @param {Boolean} visible
     * @private
     */
    setRowVisible : function(index, visible) {
        this.getRowElement(index).toggle(visible);
    },
    /**
     * 生成填充空白
     * @method  getHSpacing
     * @param {Number} width
     * @private
     */
    getHSpacing : function(width) {
        return Sui.getHSpacing(width);
    }

});


