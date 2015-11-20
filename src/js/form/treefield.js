Sui.namespace("Sui.form");

/**
 * 下拉选择树.
 * 每次调用都创建一个新的组件
 * @class Sui.form.TreeField
 * @extends Sui.form.DropList
 * @constructor
 * @param {Object} config 参数配置
 * @param {String} config.applyTo 渲染到的组件的id
 * @param {Object} config.treeConfig 树组件的配置参数
 * @param {Sui.tree.TreeNode} config.treeConfig.root 根节点 组件可以通过跟节点获得整棵树
 * @param {String} config.treeConfig.url 组件可以通过url获得整棵树,需requestOnce 参数为true时才能使用
 * @param {String} config.treeConfig.checkedType 树节点的选择类型，默认为Sui.TreeSelectType.SINGLE,即有radio的单选节点
 * @param {Boolean} config.treeConfig.requestOnce 开启异步加载数据请求
 * @param {String} config.initLabel 组件初始描述值
 * @param {String} config.value 组件的初始值
 * @param {Boolean} config.selectText 选中节点之后，触发节点的值是否为nodeText属性值，否则为id属性值，默认为false
 * @example
 * <pre><code>
 *   new Sui.form.TreeField({
 *        applyTo: 'treeField',
 *        treeConfig:{
 *            root:root,
 *            checkedType:Sui.TreeSelectType.SINGLE
 *        }
 *    });
 * </code></pre>
 */
Sui.form.TreeField = Sui.extend(Sui.form.DropList, {

    /**
     * 是否可搜索
     * @property searchable
     * @type Boolean
     * @default true
     */
    searchable : true,

    /**
     *  选中节点之后，触发节点的值是否为nodeText属性值，否则为id
     *  @property selectText
     *  @type Boolean
     *  @default false
     */
    selectText : false,
    /**
     * 该组件的树结构
     *  @property tree
     *  @type Sui.tree.Tree
     *  @default null
     */
    tree : null,
    /**
     *  @property s
     *  @type Boolean
     *  @default
     */
    initLabel : '',

    renderLayerDirect : false,

    autoAdjustSize : false,
    /**
     *  组件初始描述值
     *  @property initLabelValue
     *  @type Boolean
     *  @default
     */
    initLabelValue : null,
    /**
     * 根据配置参数进行初始化
     * @method initConfig
     * @param {Object} config
     * @private
     */
    initConfig : function(config) {

        var treeConfig = config.treeConfig || {};
        var tree = this.createTree(treeConfig);
        this.tree = tree;
        this.handleTree(config, tree);

        Sui.form.TreeField.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, [ 'selectText', "initLabel","forceSelect" ]);

        this.initLabelValue = {
           label : config.initLabel,
           value : config.value
        }
    },

    /**
     * 将树组件设置为下拉选择面板中的组件
     * @param handleTree
     * @param {Object} tree
     * @param {Sui.tree.Tree}  tree
     * @private
     */
    handleTree : function(config, tree) {
        Sui.applyIf(config, {
            dataView : tree
        });
    },
    /**
     *  创建树结构
     * @method createTree
     * @param {Object} treeConfig
     * @return {Sui.tree.Tree}
     * @private
     */
    createTree : function(treeConfig) {
        Sui.applyIf(treeConfig, {
            nodeContextClickFireChecked : true,
            customClass : 'sui_selecttree'
        });

        var thisTreeField = this;

        treeConfig.listeners = treeConfig.listeners || {};
        Sui.applyIf(treeConfig.listeners, {
            nodeChecked : function(e) {
                var node = e.node;
                var e = new Sui.util.Event({
                    value : thisTreeField.selectText ? node.getNodeText()
                        : node.getId(),
                    item : node
                });
                tree.fireEvent("selected", e);
            }
        });
        var tree = new Sui.tree.Tree(treeConfig);

        Sui.apply(tree, {
            filter : function(q, labelField) {
                this.search(q);
            },

            clearFilter : function() {
                this.clearSearch();
            },

            setDefaultSelect : function() {
                this.clearSelectedNodes();
            },

            onViewClick : function() {
                if (this.lastSelectedNode) {
                    this.lastSelectedNode.checkSelf()
                }
            }
        });

        return tree;
    },
    /**
     * 设置value和initLabel这两个初始属性
     * @method  applyInitData
     * @private
     */
    applyInitData : function() {
        if (Sui.isDefined(this.value)) {
            this.getHiddenElement().val(this.value);
            this.getApplyToElement().val(this.initLabel);
        }
    },
    /**
     * 获得组件树结构
     * @method  getTree
     * @return {Sui.tree.Tree}
     * @private
     */
    getTree : function() {
        return this.tree;
    },
     /**
      * 通过value属性值找到对应的label值
     * @method  findLabelByValue
     * @return {String}
     */
    findLabelByValue : function() {
        if (this.selectText) {
            return this.value;
        } else {
            var node = this.dataView.findTreeNodeByAttr('id', this.value);
            if (node) {
                return this.buildNodeLabel(node);
            } else {
                if(this.initLabelValue.value == this.value){
                    return this.initLabelValue.label;
                } else if (! this.isForceSelect()) {
                    // 不强制选择的话,则等于用户输入的值
                    return this.value;
                }else{
                    return "";
                }
            }
        }
    },
    /**
     * 或得某树节点的节点描述值
     * @method  buildNodeLabel
     * @param  {Sui.tree.TreeNode}
     */
    buildNodeLabel : function(node){
        if (this.getTree().isSelectPath()) {
            return node.getPath();
        }
        return node.getNodeText();
    }

});

//treeField的缓存区
var CacheTreeFields = {
    //用于缓存tree组件
    treeCache : {},
    //用于缓存下拉层面板
    layerCache : {},
    //保存treeFiled的ID与treeFild的映射关系
    layerTreeFieldMap : {},
    /**
     * 保存TreeField与选中的TreeNode的映射关系
     */
    treeFieldTreeNodeMap : {},
    //从配置中找到缓存的tree
    //param {Object} treeConfig
    findCachedTree : function(treeConfig) {
        if (treeConfig.url && !treeConfig.data) {
            return  this.treeCache[treeConfig.url];
        }
        return null;
    },
    //从配置中找到缓存的layer
    //param {Object} treeConfig
    findCachedLayer : function(treeConfig) {
        if (treeConfig.url && !treeConfig.data) {
            return  this.layerCache[treeConfig.url];
        }
        return null;
    },
    //将tree存入缓存区
    //param {Object} treeConfig
    //param {Sui.tree.Tree} tree
    putCachedTree : function(treeConfig, tree) {
        if (treeConfig.url && !treeConfig.data) {
            return  this.treeCache[treeConfig.url] = tree;
        }
        return null;
    },
    //将layer存入缓存区
    //param {Object} treeConfig
    //param {Sui.layer} layer
    putCachedLayer : function(treeConfig, layer) {
        if (treeConfig.url && !treeConfig.data) {
            return  this.layerCache[treeConfig.url] = layer;
        }
        return null;
    },
    //将Treefiled存入缓存区
    //param {Sui.layer} layer
    //param {Sui.tree.Treefiled}
    putTreeField : function(layer, treefield) {
        this.layerTreeFieldMap[layer.getComponentId()] = treefield;
    },
    //通过layer找到Treefiled
    //param {Sui.layer} layer
    findTreeField : function(layer) {
        return this.layerTreeFieldMap[layer.getComponentId()];
    },
    //将FieldTreeNode存入缓存区
    //param {Sui.form.Treefield} treefield
    //param {Sui.tree.TreeNode} treenode
    putTreeFieldTreeNode : function(treefield, treenode) {
        this.treeFieldTreeNodeMap[treefield.getComponentId()] = treenode;
    },
    //通过treefield找到选中的树节点
    //param {Sui.form.Treefield} treefield
    //
    findTreeNode : function(treefield) {
        return this.treeFieldTreeNodeMap[treefield.getComponentId()];
    }


};

/**
 * 缓存下拉树组件，该组件是为了实现在同个页面中，几个TreeField共用同个下拉组件而存在。
 * @class Sui.form.CacheTreeField
 * @extends  Sui.form.TreeField
 * @constructor
 * @param {Object} config 配置参数
 *
 */
Sui.form.CacheTreeField = Sui.extend(Sui.form.TreeField, {
    /**
     * 创建树
     * @method  createTree
     * @param {Object} treeConfig
     * @returns {Sui.tree.Tree}
     * @private
     */
    createTree : function(treeConfig) {
        var tree = CacheTreeFields.findCachedTree(treeConfig);
        if (! tree) {
            tree = Sui.form.CacheTreeField.superclass.createTree.apply(this, arguments);
            CacheTreeFields.putCachedTree(treeConfig, tree);
        }

        return tree;
    },
    /**
     * 设置dataView和layer
     * @method  handleTree
     * @param {Object} config
     * @param {Object} tree
     * @private
     */
    handleTree : function(config, tree) {

        var treeConfig = config.treeConfig;

        var layer = CacheTreeFields.findCachedLayer(treeConfig);
        if (! layer) {
            layer = this.createDefaultLayer();
            CacheTreeFields.putCachedLayer(treeConfig, layer);
        }

        // 设置dataView和layer
        Sui.form.CacheTreeField.superclass.handleTree.apply(this, arguments);
        Sui.applyIf(config, {
            layer : layer
        });
    },
    /**
     * 点击下拉触发按钮时执行
     * @method onTrigger
     * @private
     */
    onTrigger : function() {
        this.getDataView().clearSearch();
        Sui.form.CacheTreeField.superclass.onTrigger.apply(this, arguments);
    },

    /**
     * 将TreeField与Layer绑定
     * @method showLayer
     * @private
     */
    showLayer : function() {

        // 如果有初始值的话,需要设置初始值
        var treeNode = CacheTreeFields.findTreeNode(this);
        if(! treeNode && this.getValue()){
           treeNode = this.getTree().findTreeNodeByAttr("id", this.getValue());
        }
        Sui.log("TreeField关联的treeNode为:" + (treeNode == null ? "" : treeNode.getNodeText()));
        this.getDataView().setSelectedNode(treeNode);

        Sui.form.CacheTreeField.superclass.showLayer.apply(this, arguments);
        CacheTreeFields.putTreeField(this.getLayer(), this);
    },

    /**
     * 当有选项被选中时执行，
     * 当前有效的TreeField才会被选中。
     * @method  onSelectedItem
     * @param {Event} event
     */
    onSelectedItem : function(event) {
        if (this.isActiveTreeField()) {
            CacheTreeFields.putTreeFieldTreeNode(this, event.item);
            Sui.form.CacheTreeField.superclass.onSelectedItem.apply(this, arguments);
        }
    },
    /**
     * 判断当前treeField是否有效
     * @method isActiveTreeField
     * @returns {Boolean}
     */
    isActiveTreeField : function() {
        var field = CacheTreeFields.findTreeField(this.getLayer());
        return this === field;
    },
    /**
     * 判断下拉层是否展开
     * @method isExpanded
     * @returns {Boolean}
     */
    isExpanded : function() {
        if (this.isActiveTreeField()) {
            return this.getLayer().isVisible();
        }
        return false;
    },
    /**
     * 通过当前treeFiel的的值找到其对应的描述值
     * @method findLabelByValue
     * @returns {String}
     */
    findLabelByValue : function() {
        if (this.isActiveTreeField()) {
            if (this.selectText) {
                return this.value;
            } else {
                var node = this.dataView.findTreeNodeByAttr('id', this.value);
                if (node) {
                    if (this.getTree().isSelectPath()) {
                        return node.getPath();
                    }
                    return node.getNodeText();
                } else {
                    if(this.initLabelValue.value == this.value){
                        return this.initLabelValue.label;
                    }else {
                        return "";
                    }
                }
            }
        }else {
            if(this.initLabelValue.value == this.value){
                return this.initLabelValue.label;
            }else {
                return "";
            }
        }
    }

});
