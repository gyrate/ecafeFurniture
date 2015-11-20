/**
 * ==========================================================================================
 * Tree树组件
 * ==========================================================================================
 */
Sui.namespace("Sui.tree");

Sui.PATH_SEPERATOR = "\\";
/**
 * 树节点选择模式
 * @class Sui.TreeSelectType
 * @static
 * @constructor
 */
Sui.TreeSelectType = {
    /**
     * 级联模式。如果孩子没有被选择的话,那么父节点也不能被选中；
     * 选中当前节点,则将所有的孩子节点选中. 取消选中当前节点,则将所有的孩子节点取消选中.
     * @property   MULTI_ALL_CASCADE
     * @type String
     * @default 'multi_all_cascade'
     */
    MULTI_ALL_CASCADE : 'multi_all_cascade',
    /**
     * 如果选中当前节点,那么父节点必须选中.
     * 如果取消选中当前节点,则所有子节点都必须取消选中
     * @property MULTI_ALL_CHILD_DEPENDS_PARENT
     * @type String
     * @default 'multi_all_child_depends_parent'
     */
    MULTI_ALL_CHILD_DEPENDS_PARENT : 'multi_all_child_depends_parent',
    /**
     * 多选,可以选任何节点
     * @property MULTI_ALL
     * @type String
     * @default  'multi_all'
     */
    MULTI_ALL : 'multi_all',
    /**
     * 多选,只能选叶子节点
     * @property  MULTI_LEAF
     * @type String
     * @default  'multi_leaf'
     */
    MULTI_LEAF : 'multi_leaf',
    /**
     * 单选
     * @property  SINGLE
     * @type String
     * @default  'single'
     */
    SINGLE : 'single',
    /**
     * 默认选择模式
     * @property DEFAULT
     * @type String
     * @default ''
     */
    DEFAULT : ''
};

(function() {

    var CacheData = {

        requestParams : [],
        requestDatas : [],

        getRequestData : function(store) {

            for (var i = 0; i < this.requestParams.length; i++) {
                if (this.requestParams[i].url == store.url &&
                    this.requestParams[i].type == store.type &&
                    Sui.isStringPropertiesEquals(this.requestParams[i].data, store.data)
                    ) {
                    return this.requestDatas[i];
                }
            }
            return undefined;
        },

        setRequestData : function(store, data) {
            this.requestParams.push(store);
            this.requestDatas.push(data);
        }
    };

    /**
     * 每个组件都只请求一次
     * url,data,type用来唯一标识Store.
     */
    var AsyncTreeOnceStore = Sui.extend(Object, {

        url : '',
        data : '',
        type : "",
        dataType : "",
        success : null,
        error : null,

        constructor : function(config) {

            // 在IE8中有错
            //AsyncTreeOnceStore.superclass.constructor.apply(this, config);

            Sui.applyProps(this, config, ['url', 'data', 'type', 'success', 'error']);

            if (Sui.isEmpty(this.type)) {
                this.type = "GET";
            }

            if (Sui.isEmpty(this.dataType)) {
                this.dataType = "json";
            }
        },

        requestData : function() {

            var data = CacheData.getRequestData(this);
            if (Sui.isDefined(data)) {
                if (Sui.isFunction(this.success)) {
                    this.success.call(this, data);
                }
                return;
            }

            var thisStore = this;

            var requestConfig = {
                type : this.type,
                url : this.url,
                dataType : this.dataType,
                data : this.data,
                success : function(data) {

                    Sui.log("加载数据成功");

                    CacheData.setRequestData(thisStore, data);

                    if (data) {
                        if (Sui.isFunction(thisStore.success)) {
                            thisStore.success.call(thisStore, data);
                        }
                    }
                },
                error : function(request, status, err) {
                    Sui.error("加载数据失败");
                    if (Sui.isFunction(thisStore.error)) {
                        thisStore.error();
                    }
                }
            };

            $.ajax(requestConfig);
        }

    });

    Sui.applyIf(Sui.Stores, {

        constructorAsyncTreeOnceStore : function(config) {

            if (Sui.isEmpty(config.type)) {
                config.type = "GET";
            }

            var store = new AsyncTreeOnceStore(config);
            return store;
        }
    });

})();


/**
 * TreeNode可以看做一个包括节点自身和孩子节点容器的组件。但不是一个真正的组件。 paddingElements的个数与level的值相等
 * 为了性能只能采用字符串拼接的方式进行渲染.
 * 只控制NodeElement和孩子节点的父元素的可见性. 并不控制ApplyTo元素(包括NodeElement和孩子节点的父元素)的可见性.
 * 更新节点的数据,可能影响节点的样式变化.
 *
 * 禁用的节点不隐藏. 如果父节点被禁用了,不代表子节点不可以使用.
 * @class Sui.tree.TreeNode
 * @constructor
 * @param {Object} config 配置参数
 * @param {Boolean} config.expanded 是否展开节点
 * @param {String} config.nodeType 节点类型
 * @param {String} config.nodeText 节点描述内容
 * @param {String} config.id 节点ID
 * @param {Object} config.data 节点所携带的数据
 * @param {String} config.title 节点提示信息
 * @param {String} config.href 节点对应的超链接,超链接属性优先级高于节点事件处理函数、高于禁用状态
 * @param {String} config.menuItems 节点的右键菜单项，用'|'分隔
 * @param {Boolean} config.enabled 节点是否可用
 * @param {Boolean} config.checked  节点默认是否被勾选
 * @param {Boolean} config.selected 节点是否被选中
 * @param {String}config.nodeIconClass 节点图标样式
 * @param {Array} config.nodeTypeCanCheck 指定可选择的节点类型
 * @example
 * <pre><code>
 *     new Sui.tree.TreeNode(
 *         {"data":{},"id":"408","nodeIconClass":"","nodeText":"我的表单100","parentId":"407",href:'http://www.baidu.com'}
 *     );
 * </code></pre>
 */
Sui.tree.TreeNode = Sui.extend(Sui.data.TreeNode, {

    /**
     * 是否已经渲染
     * @property rendered
     * @type Boolean
     * @default false
     */
    rendered : false,
    /**
     * 是否已经展开
     * @property expanded
     * @type Boolean
     * @default false
     */
    expanded : false,
    /**
     * 描述内容
     * @property  nodeText
     * @type String
     * @default ""
     */
    nodeText : "",
    /**
     * 提示信息
     * @property title
     * @type String
     * @default ""
     */
    title : "",
    /**
     * 节点ID
     * @property id
     * @type String
     * @default “”
     */
    id : "",
    /**
     * 节点类型
     * @property nodeType
     * @type String
     * @default “”
     */
    nodeType : "",
    /**
     * 可选择的节点类型
     */
    nodeTypeCanCheck:[],
    /**
     * 节点对应连接
     * @property href
     * @type String
     * @default “”
     */
    href : "",
    menuItems : "",
    /**
     * 渲染之后,组件是否可见,默认是可见的
     * @property visible
     * @type Boolean
     * @default true
     */
    visible : true,
    /**
     * 可多选时，初始话多选框的状态
     * @property checked
     * @type Boolean
     * @default false
     */
    checked : false,
    /**
     * 是否被禁用,不允许选择
     * @property enabled
     * @type Boolean
     * @default true
     */
    enabled : true,
    /**
     * 初始的时候是否是被选中的
     * @property selected
     * @type Boolean
     * @default false
     */
    selected : false,
    /**
     * 自定义节点的图标样式。有些时候，需要定义每个节点的图标。
     * @property nodeIconClass
     * @type String
     * @default ''
     */
    nodeIconClass : '',
    /**
     * 默认是不过滤的
     * @property notFiltered
     * @type Boolean
     * @default true
     */
    notFiltered : true,

    // private，初始为-1，在渲染之后，它的值会被修改。 用来缓存level的计算结果。
    level : -1,

    // 1. 包含节点内容, 孩子节点容器
    applyToDom : null,
    // 1.1 包括Padding,Fold和节点的Icon和Text
    nodeDom : null,
    // 1.1.1 空白图标
    paddingDoms : [],
    // 1.1.2 折叠图标
    foldDom : null,
    // 1.1.2(可选) 单选框或多选框
    checkboxDom : null,
    // 1.1.3 包含Icon和Text
    nodeIconTextWrapDom : null,
    // 1.2 子节点容器
    childRenderToDom : null,

    defaultClass : 'sui_tree_node',
    defaultNodeIconClass : 'node_icon',
    leafFoldNodeIconClass : '',
    // 搜索节点时,节点是否匹配,显示不同的样式
    searchMatchClass : '',

    /**
     * 搜索节点时,节点是否可见
     */
    searchVisibleClass : '',

    /**
     * 节点选中的样式
     */
    nodeSelectedClass : '',

    /**
     *  上次定义的节点样式. 树统一定义的样式
     */
    lastTreeNodeClass : '',
    /**
     * @method  constructor
     * @param {Object} config
     */
    constructor : function(config) {
        Sui.tree.TreeNode.superclass.constructor.apply(this,
            arguments);
        Sui.applyProps(this, config, [ "id", "nodeText", "nodeIconClass",
            "expanded", "nodeType","nodeTypeCanCheck", "title" , "href", "menuItems", "enabled", "checked", "selected"]);
    },
    /**
     * 拷贝节点属性
     * @method  copyProperties
     * @param {Sui.tree.TreeNode} treeNode
     */
    copyProperties : function(treeNode) {
        this.setId(treeNode.getId());
        this.setNodeText(treeNode.getNodeText());
        this.setTitle(treeNode.getTitle());
        this.setNodeType(treeNode.getNodeType());
        this.setData(treeNode.getData());
        this.setChecked(treeNode.isChecked());
    },
    /**
     * 设置节点关联的菜单
     * @method setMenuItems
     * @param {Array} menuItems
     */
    setMenuItems : function(menuItems) {
        this.menuItems = menuItems;
    },
    /**
     * 设置节点是否可用
     * @method setEnabled
     * @param {Boolean} enabled
     */
    setEnabled : function(enabled) {
        this.enabled = enabled;
        this.applyEnabled();
    },
    /**
     * 设置节点是否可用的实际执行函数
     * @method applyEnabled
     * @private
     */
    applyEnabled : function() {
        if (this.isRendered()) {

            if (this.enabled) {
                this.getNodeElement().removeClass("sui_tree_node_disabled");
            } else {
                this.getNodeElement().addClass("sui_tree_node_disabled");
            }

            var checkboxElement = this.getCheckboxElement();
            if (checkboxElement) {
                checkboxElement.attr("disabled", !this.enabled);
            }

        }
    },
    /**
     * 设置节点选中
     * @method  applySelected
     * @private
     */
    applySelected : function() {
        if (this.isRendered()) {
            if (this.selected) {
                this.getOwnerTree().setSelectedNode(this);
            }
        }
    },
    /**
     * 判断节点是否可用
     * @method isEnabled
     * @returns {Boolean}
     */
    isEnabled : function() {
        return this.enabled;
    },
    /**
     * 判断节点是否禁用
     * @method isDisabled
     * @returns {Boolean}
     */
    isDisabled : function() {
        return ! this.isEnabled();
    },
    /**
     * 判断节点是否禁用
     * @method isDisabled
     * @returns {Boolean}
     */
    setNotFiltered : function(notFiltered) {
        this.notFiltered = notFiltered;
        this.applyNotFiltered();
    },
    /**
     *设置节点是否禁用的实际执行函数
     * @method applyNotFiltered
     * @private
     */
    applyNotFiltered : function() {
        if (this.isRendered()) {

            if (this.isNotFiltered()) {
                this.getNodeElement().removeClass("sui_tree_node_filtered");
            } else {
                this.getNodeElement().addClass("sui_tree_node_filtered");
            }
        }
    },
    /**
     * 获取属性notFiltered 
     * @method isNotFiltered
     * @return Boolean
     */
    isNotFiltered : function() {
        return this.notFiltered;
    },
    /**
     * 判断存在子节点没有被过滤
     * @method existChildNotFiltered
     * @return Boolean
     */
    existChildNotFiltered : function(){
        for(var i = 0; i<this.getChildNodeCount(); i++){
            if(this.getChildNode(i).isNotFiltered()){
                return true;
            }
        }
        return false;
    },
    /**
     * 获取title属性 
     * @method getTitle
     * @return {String}
     */
    getTitle : function() {
        return this.title;
    },
    /**
     * 设置title属性
     * @method setTitle
     * @return {String}
     */
    setTitle : function(title) {
        this.title = title;
    },
    /**
     * 获取nodeType属性
     * @method getNodeType
     * @return String
     */
    getNodeType : function() {
        return this.nodeType;
    },
    /**
     * 设置节点属性nodeType
     * @method setNodeType
     * @return String
     */
    setNodeType : function(nodeType) {
        this.nodeType = nodeType;
    },
    /**
     * 获取属性nodeText
     * @method getNodeText
     * @return String 
     */
    getNodeText : function() {
        return this.nodeText;
    },
    /**
     * 设置nodeText属性
     * @method  setNodeText
     * 
     */
    setNodeText : function(nodeText) {
        this.nodeText = nodeText;

        if (this.isRendered()) {
            this.getTextElement().text(nodeText);
        }
    },
    /**
     * 获取描述文本所在的DOM元素
     * @method getTextElement
     * @return ｛DOM｝
     */
    getTextElement : function() {
        return this.getNodeIconTextWrapElement().children("span");
    },
    /**
     * 获得组件ID
     * @method getId
     * @return {Sting}
     */
    getId : function() {
        return this.id;
    },
    /**
     * 设置组件ID
     * @method setId
     * 
     */
    setId : function(id) {
        this.id = id;
    },
    /**
     * 获得组件最外层DOM
     * @method  getBeforeElement
     * @return {DOM}
     */
    getBeforeElement : function() {
        return this.getApplyToElement();
    },
    /**
     * 获取节点元素，包括Padding,Fold和节点的Icon和Text
     * @method  getNodeElement
     * @return {$DOM}
     *
     */
    getNodeElement : function() {
        return $(this.nodeDom);
    },
    /**
     * 计算节点的层级
     * @method calcLevel
     * @private
     */
    calcLevel : function() {
        var parent = this.getParentNode();
        if (parent) {
            return this.getParentNode().getLevel() + 1;
        } else {
            return 0;
        }
    },
    /**
     * 充值节点的层级为－1
     * @method  resetLevel
     * @private
     */
    resetLevel : function() {
        this.level = -1;
    },
    /**
     * 获得节点的层级
     * @method getLevel
     *
     */
    getLevel : function() {
        if (this.level == -1) {
            var level = this.calcLevel();
            this.level = level;
        }
        return this.level;
    },
    /**
     * 更改折叠图标样式
     * @method  updateFoldIconStyle
     * @private
     */
    updateFoldIconStyle : function() {
        // 更改折叠图标样式
        this.setFoldClass(this.buildFoldIconStyle());
    },
    /**
     * 渲染折叠图标的样式
     * @method buildFoldIconStyle
     * @private
     */
    buildFoldIconStyle : function() {
        var foldClass = "";
        if (this.isLeaf()) {
            if (this.isLastChild()) {
                // 末尾叶子节点
                foldClass = "sui_tree_elbow_end";
            } else {
                // 非末尾叶子节点
                foldClass = "sui_tree_elbow";
            }
        } else {
            if (this.isLastChild()) {
                if (this.isExpanded()) {
                    foldClass = "sui_tree_elbow_end_minus";
                } else {
                    foldClass = "sui_tree_elbow_end_plus";
                }
            } else {
                if (this.isExpanded()) {
                    foldClass = "sui_tree_elbow_minus";
                } else {
                    foldClass = "sui_tree_elbow_plus";
                }
            }
        }

        return foldClass;
    },
    /**
     * 更新padding图标的样式
     * @method  updatePaddingIconStyle
     * @private
     */
    updatePaddingIconStyle : function() {
        /*
         * 判断根节点是否显示，更新padding图标样式。
         * 根节点显示，更新一级以上的节点；根节点隐藏，更新二级以上的节点。
         */
        var minLevel = this.getOwnerTree().isRootVisible() ? 2 : 1;

        if (this.getLevel() >= minLevel) {

            var paddingDoms = this.getPaddingDoms();
            var paddingLength = paddingDoms.length;

            var paddingElement = Sui.getJQ(paddingDoms[paddingLength - 1]);
            if (this.getParentNode().isLastChild()) {

            } else {
                paddingElement.addClass("sui_tree_elbow_line")
            }

            var node = this.getParentNode();
            for (var i = paddingLength - 2; i >= 0; i--) {
                paddingElement = Sui.getJQ(paddingDoms[i]);
                node = node.getParentNode();
                if (node.isLastChild()) {

                } else {
                    paddingElement
                        .addClass("sui_tree_elbow_line")
                }
            }
        }
    },
    /**
     * 更新padding图标、折叠图标的样式
     * @method  updatePaddingFoldNodeIconStyle
     * @private
     */
    updatePaddingFoldNodeIconStyle : function(includeChildren) {

        if (! this.isRendered()) {
            return;
        }

        // 如果要更改孩子节点，则遍历子树
        if (includeChildren) {

            this.preorderTraversal(function(node) {
                node.updatePaddingFoldNodeIconStyle();
            });

            return;
        }

        this.updateNodeIconStyle();
        this.updateFoldIconStyle();
        this.updatePaddingIconStyle();

    },
    /**
     * 多选模式下，获取子节点的id并做处理
     * @param includeChildren
     * @param {Boolean} includeChildren
     * @param {Function} callback
     * @private
     */
    getSelectChildNodesAndHandle:function(includeChildren, callback) {

        if(includeChildren){
            this.preorderTraversal(function(node) {
                node.getSelectChildNodesAndHandle(null, callback);
            });
            return;
        }

        var checkbox = this.getCheckboxElement();
        if (checkbox !== null) {
            //全多选模式下所有节点都有checkbox，叶子模式下叶子节点才有checkbox
            var ischecked = checkbox.attr("checked");
            if (ischecked) {
                callback.call(this, this.id);
            }
        }
    },
    /**
     * 获得子节点容器
     * @method getChildRenderTotElement
     * @private
     * @return {$DOM}
     */
    getChildRenderTotElement : function() {
        return $(this.childRenderToDom);
    },
    /**
     * 获得元素，包含节点内容, 孩子节点容器
     * @method  getApplyToElement
     * @private {$DOM}
     */
    getApplyToElement : function() {
        return $(this.applyToDom);
    },
    /**
     * 获得折叠图标
     * @method getFoldElement
     * @private {$DOM}
     */
    getFoldElement : function() {
        return $(this.foldDom);
    },
    /**
     * 获得空白图标
     * @method  getPaddingDoms
     * @private {$DOM}
     */
    getPaddingDoms : function() {
        return this.paddingDoms;
    },
    /**
     * 设置空白图标paddingDoms
     * @method setPaddingElements
     * @private
     */
    setPaddingElements : function(paddingElements) {
        var paddingDoms = this.paddingDoms = [];
        var size = paddingElements.size();
        for (var i = 0; i < size; i++) {
            paddingDoms[i] = paddingElements[i];
        }
    },
    /**
     * 设置第一个空白图标的可见性
     * @method  setFirstPaddingVisible
     * @param {Boolean} visible
     * @private
     */
    setFirstPaddingVisible : function(visible) {
        var paddingDoms = this.getPaddingDoms();
        if (paddingDoms.length > 0) {
            Sui.getJQ(paddingDoms[0]).toggle(visible);
        }
    },
    /**
     * 获得第i个空白图标
     * @method getPaddingElement
     * @param {Number} i
     * @private
     */
    getPaddingElement : function(i) {
        return $(this.paddingDoms[i]);
    },
    /**
     * 清除所有空白图标
     * @method  removePaddingElements
     * @private
     */
    removePaddingElements : function() {
        Sui.each(this.getPaddingDoms(),
            function(paddingElement) {
                $(paddingElement).remove();
            });
        this.paddingDoms = [];
    },
    /**
     * 获得所有前置图标
     * @method   getNodeIconElement
     * @private
     * @return
     */
    getNodeIconElement : function() {
        return $(this.nodeIconDom);
    },
    /**
     * 获得节点文本所在元素
     * @method getTextNodeElement
     * @private
     * @return {$DOM}
     */
    getTextNodeElement : function() {
        return $(this.textNodeDom);
    },
    /**
     * 获得元素，包含Icon和Text
     * @method  getNodeIconTextWrapElement
     * @private
     * @return {DOM}
     */
    getNodeIconTextWrapElement : function() {
        return $(this.nodeIconTextWrapDom);
    },
    /**
     * 获得checkbox或radio元素
     * @method getCheckboxElement
     * @private
     * @return ($DOM)
     *
     */
    getCheckboxElement : function() {
        return Sui.getJQ(this.checkboxDom);
    },
    /**
     * 判断是否已渲染
     * @method  isRendered
     * @return Boolean
     * @private
     */
    isRendered : function() {
        return this.rendered;
    },

    /**
     * 渲染组件，采用先序遍历的方式进行渲染。
     * @method render
     * @param {DOM} parentElement
     * @param {DOM} insertBefore
     * @param {Boolean} notRecusion 不递归
     */
    render : function(parentElement, insertBefore, notRecusion) {
        if (!this.isRendered()) {
            this.renderSelf(parentElement, insertBefore);

            if (! notRecusion) {
                this.renderChildren();
            }

            this.afterRender();
        }
    },
    /**
     * 从配置参数中获取图标样式
     * @method  getNodeIconClassFromConfig
     * @private
     * @return {String}
     */
   getNodeIconClassFromConfig : function(nodeClassConfig){
        var iconClass = "";
        if (Sui.isObject(nodeClassConfig)) {
            if (nodeClassConfig.iconClass) {
                iconClass = nodeClassConfig.iconClass;
            }
        }
        return iconClass;
    },
    /**
     * 从配置参数中获取nodeClass
     * @method getNodeClassFromConfig
     * @return {String}
     * @private
     */
    getNodeClassFromConfig : function(nodeClassConfig){
        var nodeClass = "";
        if (Sui.isString(nodeClassConfig)) {
            nodeClass = nodeClassConfig;
        } else if (Sui.isObject(nodeClassConfig)) {
            if (nodeClassConfig.nodeClass) {
                nodeClass = nodeClassConfig.nodeClass;
            }
        }
        return nodeClass;
    },
    /**
     * 从配置参数中获取nodeClass
     * @method getNodeTextClassFromConfig
     * @return {String}
     * @private
     */
    getNodeTextClassFromConfig : function(nodeClassConfig){
        var nodeTextClass = "";
        if (Sui.isObject(nodeClassConfig)) {
            if (nodeClassConfig.textClass) {
                nodeTextClass = nodeClassConfig.textClass;
            }
        }
        return nodeTextClass;
    },
    /**
     * 从配置参数中获取NodeIconStyle
     * @method getNodeIconStyleFromConfig
     * @return {String}
     * @private
     */
    getNodeIconStyleFromConfig : function(nodeClassConfig){
        var nodeIconStyle = "";

        if (Sui.isObject(nodeClassConfig)) {

            if (nodeClassConfig.iconStyle) {
                nodeIconStyle = nodeClassConfig.iconStyle;
            }

            if (nodeClassConfig.image) {
                nodeIconStyle += "background-image:" + "url(" + nodeClassConfig.image + ");";
            }
        }

        return nodeIconStyle;
    },
    /**
     * 生成一颗HTML格式的树
     * @method  generateTreeString
     * @private
     */

   generateTreeString : function() {
        this.rendered = true;

        //1. li 节点顶层
        //1.1 div 节点内容
        //1.1.1 img... padding图标
        //1.1.2 img 折叠图标
        //1.1.3 a 包含节点图标和文本
        //1.1.3.1 img 节点图标
        //1.1.3.2 span 节点文本
        //1.2 ul 孩子节点的父元素

        var nodeClassConfig = this.getOwnerTree().getTreeNodeClass(this);
        this.lastTreeNodeClass = nodeClassConfig;

        var nodeClass = this.getNodeClassFromConfig(nodeClassConfig);
        var nodeIconClass = this.getNodeIconClassFromConfig(nodeClassConfig);
        var nodeTextClass = this.getNodeTextClassFromConfig(nodeClassConfig);

        // iconStyle 不建议使用.
        var nodeIconStyle = this.getNodeIconStyleFromConfig(nodeClassConfig);

        // 节点样式,折叠或展开图标
        nodeClass += " " + (this.isExpanded() ? "treenode_expanded" : "treenode_collapse");

        // 节点图标样式(文件夹或文件)
        this.leafFoldNodeIconClass = this.getNodeIconClassByLeaf();
        nodeIconClass += " " + this.leafFoldNodeIconClass;

        var applyToArray = "";
        applyToArray += "<li>";
        applyToArray += " <div class='" + this.defaultClass + "'>";

        // 生成空白填充
        for (var i = 0; i < this.getLevel(); i++) {
            applyToArray += this.getEmptyIcon("paddingClass");
        }

        // 折叠图标
        applyToArray += this.getEmptyIcon("foldClass " + this.buildFoldIconStyle());

        // 是否生成checkbox
        if (this.renderCheckbox()) {
            applyToArray += this.buildCheckboxString();
        }

        // 生成节点图标和节点文本的容器
        var nodeHref = this.href ? " href=" + this.href : "";
        applyToArray += "<a class='" + this.getOwnerTree().getTreeNodeAcceptDragClass()
            + " " + nodeClass + "' " + nodeHref + " >";

        // 节点图标
        if (! this.isNodeIconVisible()) {
            nodeIconStyle += "display:none;";
        }
        applyToArray += this.getEmptyIcon(this.defaultNodeIconClass + " " + nodeIconClass, nodeIconStyle);

        // 节点文本
        applyToArray += "<span class='sui_node_text " + nodeTextClass + " '>" + this.getNodeText() + "</span>";

        applyToArray += "</a>";
        applyToArray += "</div>";

        // 孩子节点的容器
        var childParentStyle = (this.isExpanded() ? "" : "display:none");
        applyToArray += "<ul style='" + childParentStyle + "'>";
        applyToArray += this.generateChildrenString();
        applyToArray += "</ul>";
        applyToArray += "</li>";

        return applyToArray;

    },
    /**
     * 将所有子节点转换为字符串以便于拼接
     * @method generateChildrenString
     * @return {String}
     * @private
     */
    generateChildrenString : function() {
        var ret = "";
        var count = this.getChildNodeCount();
        if (count > 0) {
            for (var i = 0; i < count; i++) {
                var node = this.getChildNode(i);
                ret += node.generateTreeString();
            }
        }
        return ret;
    },
    /**
     * 初始化各个节点对应的HTML
     * @method  initTreeNodeData
     * @param {DOM} ul
     * @param {Number} childIndex
     * @private
     */
    initTreeNodeData : function(ul, childIndex) {

        if (Sui.isUndefinedOrNull(childIndex)) {
            childIndex = 0;
        }

        var applyToElement = Sui.getChildElement(ul, "li", childIndex);
        this.applyToDom = applyToElement[0];

        // 处理节点元素
        var nodeElement = applyToElement.children("div");
        nodeElement.data("treeNode", this);
        this.nodeDom = nodeElement[0];

        // 节点包含的空白元素
        var paddingElements = nodeElement.children(".paddingClass");
        this.setPaddingElements(paddingElements);

        // 折叠图标点击事件
        var foldElement = nodeElement.children(".foldClass");
        this.foldDom = foldElement[0];
        foldElement.click(
            Sui.makeFunction(this, this.onFoldClick))
            .toggle(this.getOwnerTree().isFoldable());

        // 包含节点文本和图标
        var nodeIconTextWrap = nodeElement.children("a").click(Sui.makeFunction(this, this.onNodeContentClick));
        this.nodeIconTextWrapDom = nodeIconTextWrap[0];

        // checkbox
        var checkboxElement = nodeElement.children(".sui_treenode_check");
        if (checkboxElement && checkboxElement.size() > 0) {
            this.checkboxDom = checkboxElement[0];
            checkboxElement.click(Sui.makeFunction(this,
                this.onCheckboxClick));
        }

        // 节点图标
        var nodeIconElement = nodeIconTextWrap.children("img");
        this.nodeIconDom = nodeIconElement[0];

        // 节点文本
        var textNode = nodeIconTextWrap.children("span");

        // 子节点容器
        var childRenderToElement = this.getApplyToElement().children("ul");
        this.childRenderToDom = childRenderToElement[0];

        this.updatePaddingIconStyle();

        // 是否展开的属性
        this.toggleExpanded(this.expanded);

        var childCount = this.getChildNodeCount();
        for (var i = 0; i < childCount; i++) {
            this.getChildNode(i).initTreeNodeData(childRenderToElement, i);
        }
    },
    /**
     * 渲染节点自身（不包括子节店）
     * @method renderSelf
     * @param {DOM} parentElement
     * @param {DOM} insertBefore
     * @private
     */
    renderSelf : function(parentElement, insertBefore) {

        this.rendered = true;

        //1. li 节点顶层
        //1.1 div 节点内容
        //1.1.1 img... padding图标
        //1.1.2 img 折叠图标
        //1.1.3 a 包含节点图标和文本
        //1.1.3.1 img 节点图标
        //1.1.3.2 span 节点文本
        //1.2 ul 孩子节点的父元素

        var applyToArray = [];
        applyToArray.push("<li>");
        applyToArray.push(" <div class='" + this.defaultClass + "'>");

        // 生成空白填充
        for (var i = 0; i < this.getLevel(); i++) {
            applyToArray.push(this.getEmptyIcon("paddingClass"));
        }

        // 折叠图标
        applyToArray.push(this.getEmptyIcon("foldClass"));

        // 生成节点图标和节点文本的容器
        applyToArray.push("<a class='" + this.getOwnerTree()
            .getTreeNodeAcceptDragClass() + "'>");

        // 节点图标
        applyToArray.push(this.getEmptyIcon(this.defaultNodeIconClass));
        applyToArray.push("<span class='sui_node_text'>" + this.getNodeText() + "</span>");

        applyToArray.push("</a>");
        applyToArray.push("</div>");
        applyToArray.push("<ul></ul>");
        applyToArray.push("</li>");

        // 处理applyTo元素
        var applyToElement = $(applyToArray.join(""));
        this.applyToDom = applyToElement[0];
        Sui.appendOrBefore(applyToElement, parentElement,
            insertBefore);

        // 处理节点元素
        var nodeElement = applyToElement.children("div");
        nodeElement.data("treeNode", this);
        this.nodeDom = nodeElement[0];

        // 节点包含的空白元素
        var paddingElements = nodeElement.children(".paddingClass");
        this.setPaddingElements(paddingElements);

        // 折叠图标点击事件
        var foldElement = nodeElement.children(".foldClass");
        this.foldDom = foldElement[0];
        foldElement.click(
            Sui.makeFunction(this, this.onFoldClick))
            .toggle(this.getOwnerTree().isFoldable());

        // 包含节点文本和图标
        var nodeIconTextWrap = nodeElement.children("a").click(Sui.makeFunction(this, this.onNodeContentClick));
        this.nodeIconTextWrapDom = nodeIconTextWrap[0];
        if (this.href) {
            nodeIconTextWrap.attr("href", this.href);
        }

        // 节点图标
        var nodeIconElement = nodeIconTextWrap.children("img");
        this.nodeIconDom = nodeIconElement[0];

        // 节点文本
        var textNode = nodeIconTextWrap.children("span");
        this.textNodeDom = textNode[0];

        // 子节点容器
        this.childRenderToDom = this.getApplyToElement().children("ul")[0];

        this.updateNodeIconElementVisible();
        this.updatePaddingFoldNodeIconStyle();
        this.updateCheckboxStyle();

        // 是否展开的属性
        this.toggleExpanded(this.expanded);

        // 应用可见性
        this.applyVisible();

        // 应用搜索样式, 选中样式
        this.getSelectedElement().addClass(this.searchMatchClass + " " + this.nodeSelectedClass);

        // 更新样式
        this.updateNodeStyle();

        this.getNodeElement().addClass(this.searchVisibleClass);

    },

    /**
     * 更新节点样式
     * @method updateNodeStyle
     * @private
     */
   updateNodeStyle : function() {

        this.deleteOldNodeStyle();
        this.updateNowNodeStyle();

    },
    /**
     * 更新当前节点的新样式
     * @method updateNowNodeStyle
     * @private
     */
    updateNowNodeStyle : function(){

        // 应用新的样式
        var nodeElement = this.getNodeElement();
        var nodeIconElement = this.getNodeIconElement();
        var textNode = this.getTextNodeElement();

        var treeNodeClass = this.getOwnerTree().getTreeNodeClass(this);
        this.lastTreeNodeClass = treeNodeClass;

        if (Sui.isString(treeNodeClass)) {
            nodeElement.addClass(treeNodeClass);
        } else if (Sui.isObject(treeNodeClass)) {

            if (treeNodeClass.nodeClass) {
                nodeElement.addClass(treeNodeClass.nodeClass);
            }

            if (treeNodeClass.iconClass) {
                nodeIconElement.addClass(treeNodeClass.iconClass);
            }

            if (treeNodeClass.iconStyle) {
                nodeIconElement.css(treeNodeClass.iconStyle);
            }

            if (treeNodeClass.image) {
                nodeIconElement.css("background-image", "url(" + treeNodeClass.image + ")");
            }

            if (treeNodeClass.textClass) {
                textNode.addClass(treeNodeClass.textClass);
            }
        }
    },
    /**
     * 删除当前点的旧样式
     * @method deleteOldNodeStyle
     * @private
     */
    deleteOldNodeStyle : function(){
        // 删除旧的样式
        var nodeElement = this.getNodeElement();
        var nodeIconElement = this.getNodeIconElement();
        var textNode = this.getTextNodeElement();

        if (this.lastTreeNodeClass) {
            var treeNodeClass = this.lastTreeNodeClass;
            if (Sui.isString(treeNodeClass)) {
                nodeElement.removeClass(treeNodeClass);
            } else if (Sui.isObject(treeNodeClass)) {
                if (treeNodeClass.nodeClass) {
                    nodeElement.removeClass(treeNodeClass.nodeClass);
                }

                if (treeNodeClass.iconClass) {
                    nodeIconElement.removeClass(treeNodeClass.iconClass);
                }

                if (treeNodeClass.iconStyle) {
                    if (Sui.isObject(treeNodeClass.iconStyle)) {
                        if (treeNodeClass.iconStyle.background) {
                            nodeIconElement.css("background", "");
                        }
                    }
                }

                if (treeNodeClass.image) {
                    nodeIconElement.css("background-image", "");
                }

                if (treeNodeClass.textClass) {
                    textNode.removeClass(treeNodeClass.textClass);
                }
            }
        }
    },

    /**
     * 渲染孩子节点
     * @method renderChildren
     * @param {Boolean} notRecusion 是否递归下去
     */
    renderChildren : function(notRecusion) {
        var count = this.getChildNodeCount();
        if (count > 0) {
            for (var i = 0; i < count; i++) {
                var node = this.getChildNode(i);
                this.renderChildNode(node, i, notRecusion);
            }
        }
    },
    /**
     * 执行渲染某个孩子节点
     * @method  renderChildNode
     * @param {Sui.tree.TreeNode} node
     * @param {Number} i
     * @param {Boolean} notRecusion
     * @private
     */
    renderChildNode : function(node, i, notRecusion) {
        var count = this.getChildNodeCount();
        if (Sui.isUndefinedOrNull(i)) {
            i = count - 1;
        }

        var insertBefore = false;
        if (i < count - 1) {
            // 如果不是渲染到末尾
            // 当前节点已经添加到父节点中,所以在第i+1个节点的前面插入
            insertBefore = this.getChildNode(i + 1).getBeforeElement();
        }

        node.render(this.getChildRenderTotElement(), insertBefore, notRecusion);

    },
    /**
     * 当节点位置改变时执行
     * @method onPositionChanged
     * @private
     */
    onPositionChanged : function(positionChanged){
        var oldPosition = positionChanged.oldPosition;
        var newPosition =  positionChanged.newPosition;
        Sui.logFormat("节点的位置发生,旧位置{0},新位置{1}", oldPosition, newPosition);
        var parentNode = this.getParentNode();
        // 是否是最后一个元素
        if(this.isLastPosition(newPosition)){
            this.getApplyToElement().appendTo(parentNode.getChildRenderTotElement());
        }else {
            this.getApplyToElement().insertBefore(parentNode.getChildNode(newPosition + 1).getBeforeElement());
        }
    },
    /**
     * 渲染组件后执行
     * @method afterRender
     * @private
     */
    afterRender : function() {
        if (!this.getOwnerTree().isRootVisible()) {
            this.setFirstPaddingVisible(false);
        }

        this.applyEnabled();
        this.applySelected();
        this.applyNotFiltered();
    },
    /**
     * 执行可拖拽
     * @method draggable
     * @private
     */
    draggable : function() {

        var thisNode = this;

        var dragConfig = {
            helper : "clone",
            cursor : 'pointer',
            cursorAt : {
                left : 0,
                top : 0
            },
            // 限制树节点拖放的范围
            containment : this.getOwnerTree()
                .getApplyToElement().parent()
        };

        var nodeIconTextWrap = this.getNodeIconTextWrapElement()
            .draggable(dragConfig)
            .droppable(
            {
                accept : "."
                    + this
                    .getOwnerTree()
                    .getTreeNodeAcceptDragClass(),
                hoverClass : this
                    .getOwnerTree()
                    .getTreeNodeDropHoverClass(),
                drop : Sui.makeFunction(this,
                    this.onDrop),
                tolerance : 'pointer',
                over : function(e, ui) {
                    nodeIconTextWrap.data(
                        "dropOver", true);
                    Sui.log("over");
                    var indicator = thisNode
                        .getOwnerTree()
                        .getDropIndicator();
                    indicator.show();
                },

                out : function(e, ui) {
                    nodeIconTextWrap.data(
                        "dropOver", false);
                    Sui.log("out");
                    var indicator = thisNode
                        .getOwnerTree()
                        .getDropIndicator();
                    indicator.hide();
                }

            })
            .mousemove(
            function(e) {
                var dropOver = nodeIconTextWrap
                    .data("dropOver");
                if (dropOver) {
                    var indicator = thisNode
                        .getOwnerTree()
                        .getDropIndicator();
                    indicator.show();

                    var mouseClientY = e.originalEvent.clientY;
                    var elementTop = nodeIconTextWrap
                        .offset().top;
                    Sui.log(mouseClientY + " "
                        + elementTop);

                    var height = nodeIconTextWrap
                        .outerHeight();

                    var notInMiddle = -3;

                    var indicatorY = 0;
                    if (mouseClientY <= elementTop
                        + height / 3) {
                        indicatorY = elementTop;
                    } else if (mouseClientY <= elementTop
                        + height * 2 / 3) {
                        indicatorY = elementTop
                            + height / 2;
                        notInMiddle = 0;
                    } else {
                        indicatorY = elementTop
                            + height;
                    }

                    indicator
                        .offset({
                        left : nodeIconTextWrap
                            .offset().left
                            - indicator
                            .outerWidth()
                            + notInMiddle,
                        top : indicatorY
                            - indicator
                            .outerHeight()
                            / 2
                    });
                }
            });
    },
    /**
     * 撤除组件的可拖拽性
     * @method draggableDestroy
     * @private
     */
    draggableDestroy : function() {
        this.getNodeIconTextWrapElement().draggable("destroy");
    },
    /**
     * 通过DOM元素查找节点
     * @method findTreeNodeByDom
     * @private
     */
    findTreeNodeByDom : function(dom) {
        var treeNodeElement = Sui.findFirstAncestorBySelector(
            dom, "." + this.defaultClass, false);
        return treeNodeElement.data("treeNode");
    },
    /**
     * 当拖拽节点被放下时执行
     * @method  onDrop
     * @private
     */
    onDrop : function(e, ui) {
        Sui.log("drop");

        var nodeIconTextWrap = this.getNodeIconTextWrapElement();

        nodeIconTextWrap.data("dropOver", false);
        this.getOwnerTree().getDropIndicator().hide();

        var mouseClientY = e.originalEvent.clientY;
        var elementTop = nodeIconTextWrap.offset().top;
        var height = nodeIconTextWrap.outerHeight();

        var type = this.calcDropType(mouseClientY, elementTop,
            height);

        var dragTreeNode = this.findTreeNodeByDom(ui.draggable);
        if (type == 0) {
            this.moveNode(dragTreeNode,
                Sui.data.TreeNodeMoveType.BEFORE);
        } else if (type == 1) {
            this.moveNode(dragTreeNode,
                Sui.data.TreeNodeMoveType.ADD_CHILD);
        } else if (type == 2) {
            this.moveNode(dragTreeNode,
                Sui.data.TreeNodeMoveType.AFTER);
        }

    },
    /**
     * 获取拖拽的节点被放置时的类型，前置、作为子节点或后置。
     * 代表type值分别为0,1,2
     * @method calcDropType
     * @param {Number} mouseClientY
     * @param {Number} elementTop
     * @param {Number} height
     * @return {Number}
     * @private
     */
    calcDropType : function(mouseClientY, elementTop, height) {
        var type = 0;
        if (mouseClientY <= elementTop + height / 3) {
            type = 0;
        } else if (mouseClientY <= elementTop + height * 2 / 3) {
            type = 1;
        } else {
            type = 2;
        }
        return type;
    },

    /**
     * 自动触发点击事件
     * @method  triggerNodeContentClick
     * @private
     */
    triggerNodeContentClick : function(){
        this.handleNodeContentClick();
    },
    /**
     * 当节点被点击时出发
     * @method  onNodeContentClick
     * @private
     */
    onNodeContentClick : function(e){
        this.handleNodeContentClick();
    },
    /**
     * 节点被点击时的处理函数
     * @method handleNodeContentClick
     * @private
     */
    handleNodeContentClick : function() {

        if (this.isDisabled()) {
            return;
        }

        if (! this.isNodeTypeSelectable()) {
            return;
        }

        this.getOwnerTree().setSelectedNode(this);

        this.getOwnerTree().fireEvent("nodeClick",
            new Sui.util.Event({
                node : this,
                nodeText : this.getNodeText(),
                id : this.getId()
            }));

        if (this.getOwnerTree().nodeContextClickFireChecked) {
            if(this.selectType != Sui.TreeSelectType.SINGLE){
                this.getCheckboxElement().attr("checked", !this.getCheckboxElement().attr("checked"));
            }
            this.onCheckboxClick();
        }
    },

    /**
     * 更新节点图标样式
     * @method  updateNodeIconStyle
     * @private
     */
    updateNodeIconStyle : function() {

        var nodeIconElement = this.getNodeIconElement();

        // 文件或文件夹图标
        if (this.leafFoldNodeIconClass) {
            nodeIconElement
                .removeClass(this.leafFoldNodeIconClass);
        }

        this.leafFoldNodeIconClass = this.getNodeIconClassByLeaf();

        nodeIconElement
            .addClass(this.leafFoldNodeIconClass);

        // 折叠或展开图标
        if (this.isExpanded()) {
            Sui.replaceClass(this.getNodeElement(),
                "treenode_collapse", "treenode_expanded");
        } else {
            Sui.replaceClass(this.getNodeElement(),
                "treenode_expanded", "treenode_collapse");
        }

    },
    /**
     * 设置节点图标样式
     * @method setNodeIconClass
     * @param {String} nodeIconClass
     * @private
     */
    setNodeIconClass : function(nodeIconClass){
        this.nodeIconClass = nodeIconClass;
        this.updateNodeIconStyle();
    },
    /**
     * 获取叶子节点或可展开节点的图标样式
     * @method getNodeIconClassByLeaf
     * @private
     */
    getNodeIconClassByLeaf : function(){
        if(this.nodeIconClass){
            return this.nodeIconClass;
        }else {
            return this.isLeaf() ? "node_icon_leaf"
                : "node_icon_folder";
        }
    },
    /**
     * 判断节点是否可见
     * @method  isNodeIconVisible
     * @private
     */
    isNodeIconVisible : function() {
        return this.getOwnerTree().isNodeIconVisible();
    },
    /**
     * 更新节点图标的可见性
     * @method updateNodeIconElementVisible
     * @private
     */
    updateNodeIconElementVisible : function() {
        this.getNodeIconElement().toggle(
            this.isNodeIconVisible());
    },
    /**
     *  创建节点前的checkbox或radio
     * @method createCheckbox
     * @private
     */
    createCheckbox : function() {
        if (!this.getCheckboxElement()) {
            var str = this.buildCheckboxString();
            var checkboxElement = $(str).insertAfter(
                this.getFoldElement());
            checkboxElement.click(Sui.makeFunction(this,
                this.onCheckboxClick));

            this.checkboxDom = checkboxElement[0];
        }
    },
    /**
     * 更新checkbox
     * @mehtod updataCheckbox
     */
    updataCheckbox: function() {

        this.removeCheckbox();
        if(this.renderCheckbox()){
            var str = this.buildCheckboxString();
            var checkboxElement = $(str).insertAfter(
                this.getFoldElement());
            checkboxElement.click(Sui.makeFunction(this,
                this.onCheckboxClick));

            this.checkboxDom = checkboxElement[0];

        }
    },
    /**
     *   拼接节点前checkbox或radio的字符串
     * @method  buildCheckboxString
     * @private
     */
    buildCheckboxString : function() {

        var ret = "";

        var checkedType = this.getOwnerTree().getCheckedType();
        ret += (checkedType == Sui.TreeSelectType.SINGLE ? "<input type='radio' "
            : "<input type='checkbox' ");

        ret += " class='sui_treenode_check'";
        ret += (this.checked ? " checked " : "");

        var checkedElementName = "";
        var checkboxConfig = this.getOwnerTree().checkboxConfig;
        if (checkboxConfig) {
            checkedElementName = checkboxConfig.name;

            var value = checkboxConfig.value;
            if (value) {
                if (value == "id") {
                    ret += " value='" + this.getId() + "' ";
                } else {
                    ret += " value='" + this.getData()[value] + "' ";
                }
            }
        }

        if(!checkedElementName ){
            checkedElementName = this.getOwnerTree().getTreeNodeCheckedElementName();
        }

        ret += " name='" + checkedElementName + "'";

        ret += "/>";

        return ret;

    },
    /**
     *  删除节点前的checkbox或radio
     * @method  removeCheckbox
     * @private
     */
    removeCheckbox : function() {
        if (this.getCheckboxElement()) {
            this.getCheckboxElement().remove();
            this.checkboxDom = null;
            this.checked = false;
        }
    },
    /**
     * 更新节点前checkbox的样式
     * @method  updateCheckboxStyle
     * @private
     */
    updateCheckboxStyle : function(includeChildren) {

        if (includeChildren) {

            this.preorderTraversal(function(node) {
                node.updateCheckboxStyle();
            });

            return;
        }

        // 更新多选框
        this.updataCheckbox();
    },

    /**
     * 判断当前的节点类型是否可选
     * @method isNodeTypeSelectable
     * @return {Boolean}
     * @private
     */
    isNodeTypeSelectable : function() {
        var selectType = this.getOwnerTree().getSelectType();
        if (! Sui.isArray(selectType)) {
            if (Sui.isDefinedAndNotNull(selectType) && selectType != "") {
                selectType = [selectType];
            } else {
                selectType = [];
            }

        }
        // 如果节点类型不属于此类，则不渲染选择框（单选框或多选框）
        if (selectType.length != 0 && !Sui.ArrayUtil.contains(selectType, this.getNodeType())) {
            return false;
        }

        return true;
    },
    /**
     * 根据树的配置判断是否要创建多选框
     * @method  renderCheckbox
     * @return  {Boolean}
     * @private
     */
    renderCheckbox : function() {

        /**
         * 根据节点类型进行控制
         */
        var nodeTypeCanCheck = this.getOwnerTree().nodeTypeCanCheck;
        if(nodeTypeCanCheck && nodeTypeCanCheck.length > 0){
            var i = 0;
            for(; i < nodeTypeCanCheck.length;i++){
                if(this.getNodeType() === nodeTypeCanCheck[i]){
                    break;
                }
            }
            if(i >= nodeTypeCanCheck.length){
                return false;
            }
        }

        // 根据树的配置判断是否要创建多选框
        var checkboxConfig = this.getOwnerTree().checkboxConfig;
        if (checkboxConfig && Sui.isFunction(checkboxConfig.ifCreate)) {
            var ifCreate = checkboxConfig.ifCreate.call(null, this);
            if (! ifCreate) {
                return false;
            }
        }

        if (! this.isNodeTypeSelectable()) {
            return false;
        }

        var checkedType = this.getOwnerTree().getCheckedType();
        var TreeSelectType = Sui.TreeSelectType;
        if (checkedType == TreeSelectType.MULTI_ALL_CASCADE
            || checkedType == TreeSelectType.MULTI_ALL || checkedType == TreeSelectType.MULTI_ALL_CHILD_DEPENDS_PARENT) {
            return true;
        } else if (checkedType == TreeSelectType.MULTI_LEAF
            && this.isLeaf()) {
            return true;
        } else if (checkedType == TreeSelectType.SINGLE) {
            return true;
        }
        return false;
    },
    /**
     * 判断节点的checkbox是否选中
     * @method  isChecked
     * @return {Boolean}
     * @private
     */
    isChecked : function() {
        if (this.isRendered()) {
            if (this.getCheckboxElement()) {
                return !!this.getCheckboxElement().attr("checked");
            }
            return false;
        } else {
            return this.checked;
        }
    },

    /**
     *
     *
     */
    /**
     * 设置checkbox的状态，如果状态与checked相同的话，则不进行设置。
     * @method setChecked
     * @param {Boolean} checked
     * @private
     */
    setChecked : function(checked) {
        if (this.isChecked() != checked) {
            this.checked = checked;

            if (this.getCheckboxElement()) {
                this.getCheckboxElement().attr("checked",
                    this.checked);
            }
        }
    },
    /**
     * 设置节点的选中状态且派发onChecked事件
     * @method setCheckAndFire
     * @param {Boolean} checked
     * @private
     */
    setCheckAndFire : function(checked) {
        if (this.isChecked() != checked) {
            this.checked = checked;

            if (this.getCheckboxElement()) {
                this.getCheckboxElement().attr("checked",
                    this.checked);
            }
            this.onChecked(this.checked);
        }
    },

    /**
     * 没有孩子节点被选中
     * @method  isChildrenNoneChecked
     * @return {Boolean}
     * @private
     */
    isChildrenNoneChecked : function() {

        var ret = true;
        for (var i = 0; i < this.getChildNodeCount(); i++) {
            var child = this.getChildNode(i);
            if (child.isChecked()) {
                ret = false;
            }
        }
        return ret;

    },

    /**
     * 选择树节点组件自身
     * @method checkSelf
     * @private
     */
    checkSelf : function() {
        this.setChecked(true);
        if(this.renderCheckbox()){
            this.onChecked(true);
        }
    },

    /**
     * 鼠标点击的话,会改变Checked。肯定要触发事件。
     * @method onCheckboxClick
     * @param {Event} e
     * @private
     */
    onCheckboxClick : function(e) {
        this.getOwnerTree().setSelectedNode(this);
        var nodeChecked = this.isChecked();
        this.onChecked(nodeChecked);
    },

    /**
     * 触发事件的函数
     * @method onChecked
     * param {Boolean} nodeChecked
     * @private
     */
    onChecked : function(nodeChecked) {

        if (this.isDisabled()) {
            return;
        }

        var checkedType = this.getOwnerTree().getCheckedType();
        if (checkedType == Sui.TreeSelectType.MULTI_ALL_CASCADE) {

            // 级联父节点
            var parent = this.getParentNode();
            while (parent) {
                if (parent.isChildrenNoneChecked()) {
                    parent.setChecked(false)
                } else {
                    parent.setChecked(true);
                }
                parent = parent.getParentNode();
            }

            // 级联孩子节点
            this.preorderTraversal(function(childNode) {
                childNode.setChecked(nodeChecked);
            });

        } else if (checkedType == Sui.TreeSelectType.MULTI_ALL_CHILD_DEPENDS_PARENT) {

            if (nodeChecked) {
                // 如果选中当前节点,则必须选中父节点
                var parent = this.getParentNode();
                while (parent) {
                    parent.setChecked(true);
                    parent = parent.getParentNode();
                }
            } else {
                //如果取消选中当前节点,则所有子节点都必须取消选中
                this.preorderTraversal(function(childNode) {
                    childNode.setChecked(false);
                });
            }
        }

        if (this.renderCheckbox()) {
            this.getOwnerTree().fireEvent("nodeChecked",
                new Sui.util.Event({
                    node : this,
                    checked : nodeChecked
                }));
        }

    },
    /**
     * 清除当前节点自身
     * @method destroy
     * @private
     */
    destroy : function() {
        var applyTo = this.getApplyToElement();
        if (applyTo) {
            applyTo.remove();
        }
    },
    /**
     * 删除自身
     * @method remove
     *
     */
    remove : function() {

        var isLastChild = this.isLastChild();

        // 从父节点中移除
        var parentNode = this.getParentNode();
        if (parentNode) {
            parentNode.removeChildNode(this);

            // 清除当前节点
            this.destroy();

            parentNode.updatePaddingFoldNodeIconStyle();
            if (isLastChild && parentNode.existChild()) {
                parentNode.getLastChild()
                    .updatePaddingFoldNodeIconStyle(true);
            }

            // 祖先节点的多选框可能会受到影响。因为效率影响不大，全部统一处理。
            while (parentNode) {
                parentNode.updateCheckboxStyle();
                parentNode = parentNode.getParentNode();
            }

        } else {

            this.getOwnerTree().setRoot(null);

        }
    },
    /**
     * 移除某个节点
     * @method moveNode
     * @param {Sui.tree.TreeNode} node
     * @param {String} type
     * @private
     */
    moveNode : function(node, type) {

        if (type == Sui.data.TreeNodeMoveType.ADD_CHILD) {

            if (node.getParentNode() != this) {

                Sui.tree.TreeNode.superclass.moveNode.apply(
                    this, arguments);

                this.getChildRenderTotElement().append(node.getApplyToElement());

                node.changeLevel();

            }
        } else if (type == Sui.data.TreeNodeMoveType.BEFORE) {

            if (node.getNextSibling != this) {

                Sui.tree.TreeNode.superclass.moveNode.apply(
                    this, arguments);

                node.getApplyToElement()
                    .insertBefore(this.getApplyToElement());

                node.changeLevel();

            }
        } else if (type == Sui.data.TreeNodeMoveType.AFTER) {

            if (node.getPrevSibling() != this) {

                Sui.tree.TreeNode.superclass.moveNode.apply(
                    this, arguments);

                this.getApplyToElement().after(node.getApplyToElement());

                node.changeLevel();

            }
        }
    },
    /**
     * 获取节点的层级路径
     * @method  getPath
     * @param {String} seperate
     * @param {Boolean} containRoot
     * @private
     */
    getPath : function(seperate, containRoot) {

        if (Sui.isUndefinedOrNull(seperate)) {
            seperate = Sui.PATH_SEPERATOR;
        }

        if (Sui.isUndefinedOrNull(containRoot)) {
            containRoot = this.getOwnerTree().isRootVisible();
        }

        var node = this;

        var path = node.getNodeText();

        var parent = node.getParentNode();
        while (parent) {
            if (! containRoot && parent.isRoot()) {
                break;
            }
            path = parent.getNodeText() + seperate + path;
            parent = parent.getParentNode();
        }

        return path;
    },
    /**
     * 迭代地改变节点层级
     * @method changeLevelRecursion
     * @private
     */
    changeLevelRecursion : function() {
        this.preorderTraversal(function(node) {
            node.changeLevel();
        });
    },
    /**
     * 改变节点层级
     * @method  changeLevel
     * @private
     */
    changeLevel : function() {
        this.resetLevel();
        this.level = this.getLevel();

        this.removePaddingElements();

        // 生成paddings
        if (this.getLevel() > 0) {
            var paddingElement = $(this.getEmptyIcon())
                .prependTo(this.getNodeElement())
            this.paddingDoms.push(paddingElement[0]);
        }

        for (var i = 1; i < this.getLevel(); i++) {
            var paddingElement = $(this.getEmptyIcon())
                .insertAfter(this.getPaddingElement(i - 1));
            this.paddingDoms.push(paddingElement[0]);
        }

        this.updatePaddingFoldIconStyle();

    },
    /**
     * 添加子节点
     * @method addChildNode
     * @private
     */
    addChildNode : function(treeNode) {
        if (treeNode) {

            Sui.tree.TreeNode.superclass.addChildNode.apply(
                this, arguments);
            if (this.isRendered()) {
                this.renderChildNode(treeNode, this.indexOf(treeNode));

                // 当前节点可能受到影响
                this.updatePaddingFoldNodeIconStyle();

                // 末尾子节点会受到影响
                var childNodeCount = this.getChildNodeCount();
                if (childNodeCount > 1) {
                    this.getChildNode(childNodeCount - 2)
                        .updatePaddingFoldNodeIconStyle(
                        true);
                }

                this.updateCheckboxStyle();
                // 祖先节点的多选框可能会受到影响。因为效率影响不对，全部统一处理。
                var parentNode = this.getParentNode();
                while (parentNode) {
                    parentNode.updateCheckboxStyle();
                    parentNode = parentNode.getParentNode();
                }
            }
        }
    },

    /**
     * 折叠图标被点击事件处理函数
     * @method onFoldClick
     * @private
     */
    onFoldClick : function(e) {
        if (!this.isLeaf()) {
            this.toggleExpanded();
        }
    },
    /**
     * 判断当前节点是否被展开
     * @method isExpanded
     * @return {Boolean}
     * @private
     */
    isExpanded : function() {
        return this.expanded;
    },
    /**
     * 判断是否使用树结构线
     * @method isLineVisible
     * @private
     */
    isLineVisible : function() {
        return this.getOwnerTree().isLineVisible();
    },

    /**
     * 展开树节点
     * @method expand
     * @private
     */
    expand : function() {

        this.expanded = true;

        if (this.isRendered()) {
            this.renderChildren(true);

            // 展开的话，孩子节点是可见的。
            // 有折叠样式,说明是展开的,需要折叠. 有展开样式,说明是折叠的,需要展开.
            this.getChildRenderTotElement().toggle(true);

            this.updateFoldIconStyle();
            this.updateNodeIconStyle();
        }
    },
    /**
     * 收缩树节点
     * @method collapse
     * @private
     */
    collapse : function() {

        this.expanded = false;
        // 收缩的话，孩子节点是不可见的。
        // 有折叠样式,说明是展开的,需要折叠. 有展开样式,说明是折叠的,需要展开.
        this.getChildRenderTotElement().toggle(false);

        this.updateFoldIconStyle();
        this.updateNodeIconStyle();
    },
    /**
     * 设置foldClass属性的值
     * @method setFoldClass
     * @param {String}   cls
     * @private
     */
    setFoldClass : function(cls) {
        if (this.foldClass) {
            this.getFoldElement().removeClass(this.foldClass);
        }

        this.foldClass = cls;
        this.getFoldElement().addClass(cls);
    },
    /**
     * 切换折叠状态。叶子节点，等不能进行折叠操作
     * @method toggleExpanded
     * @private
     */
    // 叶子节点，等不能进行折叠操作。
    toggleExpanded : function(expanded) {

        if (Sui.isUndefined(expanded)) {
            expanded = !this.isExpanded();
        }

        if (expanded) {
            this.expand();
        } else {
            this.collapse();
        }
    },
    /**
     * 设置节点(包括子节点)的折叠状态
     * @method  setFoldable
     * @param  {Boolean} foldabel
     * @private
     */
    setFoldable : function(foldabel) {
        this.getFoldElement().toggle(foldabel);
        for (var i = 0; i < this.getChildNodeCount(); i++) {
            var node = this.getChildNode(i);
            node.setFoldable(foldabel);
        }
    },
    /**
     * 创建并返回一个空白图标字符串
     * @method getEmptyIcon
     * @return {String}
     * @private
     */
    getEmptyIcon : function(className, iconStyle) {
        if (Sui.isUndefinedOrNull(className)) {
            className = "";
        }
        if (Sui.isUndefinedOrNull(iconStyle)) {
            iconStyle = "";
        }
        return '<img class="sui_tree_emptyicon ' + className + '" style="' + iconStyle + '" src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" />';
    },
    /**
     *  获得icon和text的容器元素
     * @method getSelectedElement
     * @return {DOM}
     * @private
     */
    getSelectedElement : function() {
        return this.getNodeIconTextWrapElement();
    },
    /**
     * 为节点设置选中样式
     * @method  setSelectedClass
     * @private
     */
    setSelectedClass : function() {
        this.nodeSelectedClass = "sui_treenode_selected";
        if (this.isRendered()) {
            this.getSelectedElement().addClass(
                "sui_treenode_selected");
        }
    },
    /**
     * 为节点去除选中样式
     * @method clearSelectedClass
     * @private
     */
    clearSelectedClass : function() {
        this.nodeSelectedClass = "";
        if(this.isRendered()){
            this.getSelectedElement().removeClass(
                "sui_treenode_selected");
        }
    },
    /**
     * 为节点设置搜索匹配样式
     * @method setSearchMatchClass
     * @private
     */
    setSearchMatchClass : function() {
        this.searchMatchClass = "sui_treenode_searchmatch";
        if (this.isRendered()) {
            this.getSelectedElement().addClass("sui_treenode_searchmatch");
        }
    },
    /**
     *  为节点去除搜索匹配样式
     * @method  clearSearchMatchClass
     * @private
     */
    clearSearchMatchClass : function() {
        this.searchMatchClass = "";
        if (this.isRendered()) {
            this.getSelectedElement()
                .removeClass("sui_treenode_searchmatch");
        }
    },
    /**
     * 设置组件属性ownerTree
     * @method  setOwnerTree
     * @param {Sui.tree.Tree} tree
     * @private
     */
    setOwnerTree : function(tree) {
        this.ownerTree = tree;
    },
    /**
     * 获取组件属性ownerTree
     * @method getOwnerTree
     * @return {Sui.tree.Tree}
     * @private
     */
    getOwnerTree : function() {
        if (!this.ownerTree) {
            var p = this;
            while (p) {
                if (p.ownerTree) {
                    this.ownerTree = p.ownerTree;
                    break;
                }
                p = p.getParentNode();
            }
        }
        return this.ownerTree;
    },
    /**
     * 获取可见元素
     * @method getVisibleElement
     * @return {$DOM}
     * @private
     */
    getVisibleElement : function() {
        return this.getNodeElement();
    },
    /**
     * 显示
     * @method  show
     * @private
     */
    show : function() {
        this.toggle(true);
    },
    /**
     * 隐藏
     * @method hide
     * @private
     */
    hide : function() {
        this.toggle(false);
    },

    /**
     * 判断当前节点是否可见。 父节点是否折叠，不影响当前节点可见性。
     * @method  isVisible
     * @return {Boolean}
     * @private
     */
    isVisible : function() {
        if (this.isRendered()) {
            return Sui.isDisplayVisible(this.getVisibleElement());
        }
        return this.visible;
    },
    /**
     * 设置组件可见性的实际执行函数
     * @method applyVisible
     * @private
     */
    applyVisible : function() {
        if (this.isRendered()) {
            var elements = this.getNodeElement();
            elements.toggle(this.visible);
        }
    },
    /**
     * 显示或隐藏
     * @method toggle
     * @param {Boolean} visible
     * @private
     */
    toggle : function(visible) {
        this.visible = visible;
        if (this.isRendered()) {
            this.getVisibleElement().toggle(visible);
        }
    },
    /**
     * 执行搜索功能
     * @method search
     * @param {String} val
     * @param  {Object} config
     * @return {Array}
     * @private
     */
    search : function(val, config) {

        var shouldSearchPath = this.getOwnerTree().isSelectPath() && Sui.StringUtil.contains(val, Sui.PATH_SEPERATOR);

        var searchResult = null;
        if (shouldSearchPath) {
            // 搜索路径
            searchResult = this.searchPath(val);
        } else {
            searchResult = this.searchText(val);
        }

        // 搜索完之后，默认展开第一个搜索到的节点的所有祖先节点
        if (searchResult.length > 0) {
            searchResult[0].expandParents();
        }

        // 如果是搜索path,并且最后一个字符是"\",则展开该节点
        if (shouldSearchPath && Sui.StringUtil.endsWith(val, Sui.PATH_SEPERATOR)) {
            if (searchResult.length > 0) {
                searchResult[0].expand();
            }
        }

        return  searchResult;

    },

    /**
     * 遍历搜索，如果孩子节点可见的话，那么父节点也必须可见。
     * 如果父节点匹配,那么子节点也应该可见。用户可能先搜索父节点，然后往下展开。
     * @method searchText
     * @param {String} val
     * @param {Object} config
     * @return {Array}
     */
    searchText : function(val, config) {

        // 初始化配置
        config = config || {};
        Sui.applyIf(config, {
            showNotMatch : true
        });

        // 搜索的结果
        var searchResult = [];

        // 匹配函数
        var matchFunc = null;
        if (config.matchFun) {
            matchFunc = config.matchFun;
        } else {
            matchFunc = function(string, val) {
                // 默认不区分大小写
                string = string.toLowerCase();
                val = val.toLowerCase();
                return Sui.StringUtil.contains(string, val);
            }
        }

        var timekeeper = new Sui.Timekeeper();

        // 进行搜索
        this.searchInner(val, matchFunc, searchResult,
            config.showNotMatch, false);

        Sui.log("搜索树节点内容,花费" + timekeeper.getFormattedTime());

        // 返回搜索结果
        return searchResult;

    },
    /**
     * 按路径遍历搜索
     * @method searchPath
     * @param {String} val
     * @return {Array}
     * @private
     */
    searchPath : function(val) {
        var nodeTexts = val.split(Sui.PATH_SEPERATOR);
        var searchResult = [this];
        for (var i = 0; i < nodeTexts.length; i++) {
            var nodeText = Sui.StringUtil.trim(nodeTexts[i]);
            if (nodeText) {
                var subSearchResults = [];
                for (var j = 0; j < searchResult.length; j++) {
                    var subSearchResult = searchResult[j].searchText(nodeText);
                    if (subSearchResult && subSearchResult.length > 0) {
                        Sui.ArrayUtil.addAll(subSearchResults, subSearchResult);
                    }
                }
                searchResult = subSearchResults;
            }
        }

        return searchResult;
    },


    /**
     * 展开该节点的所有祖先节点
     * @method expandParents
     * @private
     */
    expandParents : function() {
        var parent = this.getParentNode();
        while (parent) {
            parent.expand();
            parent = parent.getParentNode();
        }
    },

    /**
     *  搜索功能实际执行函数,不搜索禁用的节点
     * @method searchInner
     * @param {String} val 关键词
     * @param {Functon} matchFunc 匹配函数
     * @param {Array} searchResult搜索结果
     * @param {Boolean} showNotMatch 显示不匹配的节点
     * @param {Boolean} parentMatch 父节点是否匹配
     * @return {Boolean}
     * @private
     */
    searchInner : function(val, matchFunc, searchResult, showNotMatch, parentMatch) {

        var visible = false;
        var matched = false;

        // 如果节点匹配的话
        if (matchFunc(this.getNodeText(), val)) {
            visible = true;
            matched = true;
            searchResult.push(this);
        }

        // 如果存在孩子节点可见，那么父节点也可见。
        var childCount = this.getChildNodeCount();
        if (childCount > 0) {
            for (var i = 0; i < childCount; i++) {
                var childNode = this.getChildNode(i);
                var childVisible = childNode.searchInner(val,
                    matchFunc, searchResult, showNotMatch, matched);
                if (childVisible) {
                    visible = childVisible;
                }
            }
        }

        // 如果父节点匹配的话,则孩子节点也显示出来
//        if (parentMatch) {
//            visible = true;
//        }

        // 根节点，受rootVisible影响。设置节点是否可见
        if (this.isRoot()) {
            if (this.getOwnerTree().isRootVisible()) {
                this.applySearchVisible(visible);
            }
        } else {
            this.applySearchVisible(visible);
        }

        // 设置满足搜索条件的节点的样式。
        this.clearSearchMatchClass();
        if (matched) {
            this.setSearchMatchClass();
        }

        // 更新节点的空白和折叠图标
        this.updatePaddingFoldNodeIconStyle();

        // 搜索不会对多选框产生影响

        return visible;

    },
    /**
     * 设置节点可见性
     * @method applySearchVisible
     * @param  {Boolean} visible
     * @private
     */
    applySearchVisible : function(visible){

        if(visible){
            this.searchVisibleClass = "";
            this.getNodeElement().removeClass("sui_tree_node_searchHidden");
        }else {
            this.searchVisibleClass = "sui_tree_node_searchHidden";
            this.getNodeElement().addClass("sui_tree_node_searchHidden");
        }
    },
    /**
     * 清除搜索状态
     * @method clearSearch
     * @private
     */
    clearSearch : function() {
        this.preorderTraversal(function(node) {
            node.clearSearchMatchClass();

            // 根节点是否可见，受rootVisible影响。
            if (node.isRoot()) {
                if (node.getOwnerTree().isRootVisible()) {
                    node.applySearchVisible(true);
                }
            } else {
                node.applySearchVisible(true);
            }

        });
    },
    /**
     * 获取第一个可见的孩子节点
     * @method  getFirstVisibleChild
     * @return {Sui.tree.TreeNode}
     * @private
     */
    getFirstVisibleChild : function() {
        if (this.existChild()) {
            for (var i = 0; i < this.getChildNodeCount(); i++) {
                var childNode = this.getChildNode(i);
                if (childNode.isVisible()) {
                    return childNode;
                }
            }
        }
        return null;
    },
    /**
     * 获取第一个可见的下位兄弟节点
     * @method  getFirtVisibleNext
     * @return {Sui.tree.TreeNode}
     * @private
     */
    getFirtVisibleNext : function() {
        if (this.isRoot()) {
            return null;
        }

        var parent = this.getParentNode();
        for (var i = parent.indexOf(this) + 1; i < parent
            .getChildNodeCount(); i++) {
            var childNode = parent.getChildNode(i);
            if (childNode.isVisible()) {
                return childNode;
            }
        }

        return null;

    },
    /**
     *  获取前一个被选中的节点
     * @method  getPrevSelectedNode
     * @return {Sui.tree.TreeNode}
     * @private
     */
    getPrevSelectedNode : function() {
        var resultNode = null;
        var thisNode = this;

        // 从根节点开始进行扫描
        this.getRoot().preorderTraversal(function(node) {

            if (node == thisNode) {
                return false;
            } else {
                if (node.isVisible()) {
                    resultNode = node;
                }
            }
        });

        return resultNode;
    },
    /**
     *  获取后一个被选中的节点
     * @method   getNextSelectedNode
     * @return {Sui.tree.TreeNode}
     * @private
     */
    getNextSelectedNode : function() {

        var resultNode = null;
        var findNode = false;
        var thisNode = this;

        // 从根节点开始进行扫描
        this.getRoot().preorderTraversal(function(node) {
            if (findNode) {
                if (node.isVisible()) {
                    resultNode = node;
                    return false;
                }
            } else {
                if (node == thisNode) {
                    findNode = true;
                }
            }
        });

        return resultNode;

    }

});

/**
 *
 * @class  Sui.tree.Tree
 * @constructor
 * @private
 * @param {Object} config 配置参数
 * @param {String} config.renderTo 渲染该组件所在的DOM元素id
 * @param {Boolean} config.lineVisible  是否显示树结构线
 * @param {Boolean}  config.selectPath 选择节点之后,返回的Label是节点文本,还是节点所在路径的文本
 * @param {Boolean} config.enableDefaultContextMenu 是否允许使用右键菜单,当checkedType不是单选或默认时，enableDefaultContextMenu为true会开启[全选]右键菜单
 * @param {Object} config.listeners 事件监听器，可监听 nodeClick ,nodeChecked、afterBuildRoot、loaded、beforeContextMenu等事件
 * @param {String} config.checkedType  树节点的选择模式，可以为单选、多选或不出现选择框，详细请参考 Sui.TreeSelectType
 * @param {Sui.menu.ContextMenu} config.contextMenu 右键菜单
 */
Sui.tree.Tree = Sui.extend(Sui.Component, {
    //用于异步加载数据源
    loader : null,

    defaultClass : "sui_tree",

    /**
     * 树节点的选择模式，可以为单选、多选或不出现选择框
     * 默认值为null,不生成单选框和多选框
     * @property  checkedType
     * @type String
     * @default Sui.TreeSelectType.DEFAULT
     */
    checkedType : Sui.TreeSelectType.DEFAULT,
    /**
     * 配置生成的多选框
     */
    checkboxConfig : null,
    /**
     * 选择节点之后,返回的Label是节点文本,还是节点所在路径的文本
     * @property  selectPath
     * @type Boolean
     * @default false
     */
    selectPath : false,
    /**
     * 可被选中的节点类型组成的数组
     * @property  selectType
     * @type Array,String
     * @default ""
     */
    selectType : "",
    /**
     * 根节点
     * @property root
     * @type Sui.tree.TreeNode
     * @default null
     */
    root : null,
    /**
     * 根节点是否可见
     * @property rootVisible
     * @type Boolean
     * @default true
     */
    rootVisible : true,
    /**
     * 树结构线是否可见
     * @property lineVisible
     * @type Boolean
     * @default false
     */
    lineVisible : false,
    /**
     * 搜索树节点的关键词
     * @property searchContent
     * @type String
     * @default ""
     */
    searchContent : "",

    rootNodeParentElement : null,

    /**
     * 点击节点时，是否触发节点的check事件。
     * @property nodeContextClickFireChecked
     * @type  Boolean
     * @default  false
     */
    nodeContextClickFireChecked : false,
    /**
     * 对树节点进行操作时的监听函数集
     * @property listeners
     * @type Object
     * @default null
     * @example
     * <pre><code>
     * listeners : {
     *    nodeClick : function(event) {
     *        var text = event.nodeText;
     *        Sui.log(text);
     *    }
     * }
     * </code></pre>
     */
    listeners : null,
    /**
     * 节点前的图标是否可见
     * @property nodeIconVisible
     * @type Boolean
     * @default true
     */
    nodeIconVisible : true,
     /**
     * 树节点是否可折叠
     * @property foldable
     * @type Boolean
     * @default true
     */
    foldable : true,
    /**
     * 自定义节点的样式
     */
    nodeClasses : null,
    /**
     * 是否启用拖放
     * @property draggable
     * @type Boolean
     * @default false
     */
    draggable : false,
    // @private 启用了拖放，在未渲染之前，是没有使用拖放的。
    draggableUsed : false,

    treeNodeDropHoverClass : 'sui_treenode_drophover',

    treeNodeAcceptDragClass : '',
    /**
     * TreeNode节点中，单选框或多选框的名称
     * @property treeNodeCheckedElementName
     * @type String
     * @default ''
     */
    treeNodeCheckedElementName : '',
    /**
     * 是否允许右键菜单
     * @property enableDefaultContextMenu
     * @type Boolean
     * @default false
     */
    enableDefaultContextMenu : false,
    /**
     * 上次搜索的结果
     */
    lastSearchResult : null,
    /**
     * 根据配置参数初始化
     * @method initConfig
     * @param {Object} config
     * @private
     */
    initConfig : function(config) {

        Sui.tree.Tree.superclass.initConfig.call(this, config);

        Sui.applyProps(this, config, [
            'nodeContextClickFireChecked',
            'selectType', 'checkedType', "loader", "lineVisible",
            "rootVisible", "nodeIconVisible", "nodeClasses", "draggable",
            "treeNodeDropHoverClass", "checkboxConfig", "selectPath", "enableDefaultContextMenu", "treeNodeCheckedElementName" ]);

        if (config.root) {
            this.setRoot(config.root);
        }else if(Sui.isDefinedAndNotNull(config.treeData)) {
            var root = Sui.tree.TreeNodeUtil
                .buildTreeNodeFromJsonData(config.treeData);
           this.setRoot(root);
        } else if (config.url) {

            var thisTree = this;

            if (config.requestOnce) {
                var requestConfig = {
                    type : "GET",
                    url : config.url,
                    data : {},
                    success : function(data) {
                        if (data) {

                            // 用来计算时间花费
                            var timekeeper = new Sui.Timekeeper();

                            var root = Sui.tree.TreeNodeUtil
                                .buildTreeNodeFromJsonData(data);

                            Sui.log("构造树节点数据花费的时间为" + timekeeper.getFormattedTime());

                            thisTree.fireEvent("afterBuildRoot", {
                                root : root
                            });
                            
                            if (root) {
                                thisTree.setRoot(root);
                            } else {
                                Sui.log("根节点为空");
                            }

                        }

                        thisTree.fireEvent("loaded", {});
                    }
                };

                Sui.apply(requestConfig, config.requestConfig);
//                $.ajax(requestConfig);

                var store = Sui.Stores.constructorAsyncTreeOnceStore(requestConfig);


                // 如果马上请求数据的话
                store.requestData();

            }
        }

        this.treeNodeAcceptDragClass = Sui.generateUniqueClass();

    },
    /**
     * 根据treeData重构整个树结构
     * @method  resetTreeData
     * @param {Object} treeData
     */
    resetTreeData : function(treeData){
        var root = Sui.tree.TreeNodeUtil
            .buildTreeNodeFromJsonData(treeData);
        this.setRoot(root);
    },
    /**
     * 判断是否允许右键菜单
     * @method isEnableDefaultContextMenu
     * @return {Boolean}
     */
    isEnableDefaultContextMenu : function() {
        return this.enableDefaultContextMenu;
    },
    /**
     * 判断是否获取整个节点路径
     * @method isSelectPath
     * @return {Boolean}
     */
    isSelectPath : function() {
        return this.selectPath;
    },

    /**
     * 如果节点类型与nodeType匹配，则启用；否则禁用。
     * @method setNodeEnabledWhenNodeTypeIn
     * @param {String} nodeType  节点类型
     * @param {Boolean} enableParentIfChildEnable 如子节点启用，则父节点也启用
     * @private
     */
    setNodeEnabledWhenNodeTypeIn : function(nodeType, enableParentIfChildEnable) {

        if(! this.root){
            return ;
        }

        if (Sui.isEmpty(nodeType)) {
            this.enableAllNodes();
        } else {
            nodeType = Sui.ArrayUtil.itemToArray(nodeType);

            this.root.preorderTraversal(function(node) {
                if (Sui.ArrayUtil.contains(nodeType, node.getNodeType())) {
                    node.setEnabled(true);

                    // 如果孩子节点是激活的，那么父节点也要是激活的。
                    if (enableParentIfChildEnable) {
                        var parent = node.getParentNode();
                        while (parent && ! parent.isEnabled()) {
                            parent.setEnabled(true);
                        }
                    }

                } else {
                    node.setEnabled(false);
                }
            });
        }
    },

    /**
     * 如果节点类型与nodeType匹配，则显示；否则不显示。
     * @method setNodeNotFilteredWhenNodeTypeIn
     * @param {String} nodeType
     * @param {Boolean} keepParentIfChildKeeped   果孩子节点没有被过滤，那么父节点也不要被过滤。
     * @private
     */
    setNodeNotFilteredWhenNodeTypeIn : function(nodeType, keepParentIfChildKeeped) {

        if(! this.root){
            return ;
        }

        if (Sui.isEmpty(nodeType)) {
            this.clearAllFiltered();
        } else {
            nodeType = Sui.ArrayUtil.itemToArray(nodeType);

            this.root.preorderTraversal(function(node) {
                if (Sui.ArrayUtil.contains(nodeType, node.getNodeType())) {
                    node.setNotFiltered(true);

                    // 如果孩子节点没有被过滤，那么父节点也不要被过滤。
                    if (keepParentIfChildKeeped) {
                        var parent = node.getParentNode();
                        while (parent && ! parent.isNotFiltered()) {
                            parent.setNotFiltered(true);
                            parent = parent.getParentNode();
                        }
                    }

                } else {
                    node.setNotFiltered(false);
                }
            });
        }
    },

    /**
     * 如果节点Id与nodeId匹配，则显示；否则不显示。
     * @method  setNodeNotFilteredWhenNodeIdIn
     * @param {Array} nodeId nodeId可以为多个节点Id
     * @param {Boolean} keepParentIfChildKeeped
     * @private
     */
    setNodeNotFilteredWhenNodeIdIn : function(nodeId, keepParentIfChildKeeped) {

        if(! this.root){        	
            return ;
        }

        if (Sui.isEmpty(nodeId)) {
            this.clearAllFiltered();
        } else {
            nodeId = Sui.ArrayUtil.itemToArray(nodeId);

            this.root.preorderTraversal(function(node) {
                if (Sui.ArrayUtil.contains(nodeId, node.getId())) {
                    node.setNotFiltered(true);

                    // 如果孩子节点没有被过滤，那么父节点也不要被过滤。
                    if (keepParentIfChildKeeped) {
                        var parent = node.getParentNode();
                        while (parent && ! parent.isNotFiltered()) {
                            parent.setNotFiltered(true);
                            parent = parent.getParentNode();
                        }
                    }

                } else {
                    node.setNotFiltered(false);
                }
            });
        }
    },

    /**
     * 让所有节点不被过滤
     * @method   clearAllFiltered
     * @private
     */
    clearAllFiltered : function() {
        if(this.root){
            this.root.preorderTraversal(function(node) {
                node.setNotFiltered(true);
            });
        }
    },

    /**
     * 对节点进行以下处理
     * 1. 如果节点在ids集合内,则可见并启用。
     * 2. 如果存在孩子在ids集合内，则可见并禁用
     * 3. 其他，隐藏节点
     * @method  setNodeEnabledParentEnabledOtherHided
     * @param {Array} ids
     * @private
     */
    setNodeEnabledParentEnabledOtherHided : function(ids){
        this.root.postorderTraversal(function(node) {
            if (Sui.ArrayUtil.contains(ids, node.getId())) {
                node.setEnabled(true);
                node.setNotFiltered(true);
            } else {
                // 如果孩子节点没有被过滤,那么父节点也不要被过滤,但被禁用
                if (node.existChildNotFiltered()) {
                    node.setEnabled(false);
                    node.setNotFiltered(true);
                }else {
                    node.setEnabled(false);
                    node.setNotFiltered(false);
                }
            }
        })
    },

    /**
     * 如果节点的id在集合内,则启用;否则禁用.
     * @method setNodeEnabledWhenNodeIdIn
     * @param {Array} ids
     * @param {Boolean} enableParentIfChildEnable 如果孩子节点是激活的，那么父节点也要是激活的
     * @private
     */
    setNodeEnabledWhenNodeIdIn : function(ids, enableParentIfChildEnable) {

        this.root.preorderTraversal(function(node) {
            if (Sui.ArrayUtil.contains(ids, node.getId())) {
                node.setEnabled(true);

                // 如果孩子节点是激活的，那么父节点也要是激活的。
                if (enableParentIfChildEnable) {
                    var parent = node.getParentNode();
                    while (parent && ! parent.isEnabled()) {
                        parent.setEnabled(true);
                        parent = parent.getParentNode();
                    }
                }

            } else {
                node.setEnabled(false);
            }
        })
    },

    /**
     * 启用所有节点
     * @method enableAllNodes
     * @private
     */
    enableAllNodes : function() {
    	if(this.root){
            this.root.preorderTraversal(function(node) {
                node.setEnabled(true);
            });
    	}
    },

    /**
     * 获取当前的节点选取类型
     * @method  getSelectType
     * @return {Array}
     */
    getSelectType : function() {
        return this.selectType;
    },
    /**
     * 获取属性 treeNodeAcceptDragClass
     * @method  getTreeNodeAcceptDragClass
     * @return {String}
     * @private
     */
    getTreeNodeAcceptDragClass : function() {
        return this.treeNodeAcceptDragClass;
    },
    /**
     * 获取属性 treeNodeDropHoverClass
     * @method getTreeNodeDropHoverClass
     * @return {String}
     * @private
     */
    getTreeNodeDropHoverClass : function() {
        return this.treeNodeDropHoverClass;
    },
    /**
     * 获得加载器(目前还没使用到)
     * @method  getLoader
     * @return
     * @private
     */
    getLoader : function() {
        return this.loader;
    },
    /**
     * 获取属性 draggable，判断是否可拖拽
     * @method  isDraggable
     * @return {Boolean}
     */
    isDraggable : function() {
        return this.draggable;
    },
    /**
     * 设置节点可拖拽性
     * @method setDraggable
     * @param {Boolean} draggable
     */
    setDraggable : function(draggable) {
        if (this.draggable == draggable) {
            return;
        }

        this.draggable = draggable;
        this.applyDraggable();

    },
    /**
     * 设置拖拽性的实际执行函数
     * @method applyDraggable
     * @private
     */
    applyDraggable : function() {

        if (this.isRendered()) {

            var draggable = this.isDraggable();

            if (draggable) {

                this.root.preorderTraversal(function(node) {
                    node.draggable();
                });

                this.draggableUsed = true;
            } else {

                // 移除之前的draggable
                if (this.draggableUsed) {
                    this.root.preorderTraversal(function(node) {
                        node.draggableDestroy();
                    });
                }
                this.draggableUsed = false;
            }
        }

    },

    /**
     * 加载子节点数据
     * @method  loadChildrenNodeData
     * @param {String} nodeId  节点ID
     * @param {Object} requestConfig
     * @param {Function} requestConfig.success  获取数据成功的回调函数
     * @param {Function} requestConfig.error 获取数据失败的回调函数
     *
     */
    loadChildrenNodeData : function(nodeId, requestConfig) {
        var loader = this.getLoader();
        Sui.Assert.notEmpty(loader);

        loader.loadData({
            id : nodeId
        }, requestConfig);

    },
    /**
     * 获取某个树节点的样式
     * @method  getTreeNodeClass
     * @param {Sui.tree.TreeNode} treeNode
     * @return {String}
     */
    getTreeNodeClass : function(treeNode) {
        var nodeType = treeNode.getNodeType();
        var nodeText = treeNode.getNodeText();
        if (this.nodeClasses) {
            if (Sui.isFunction(this.nodeClasses)) {
                return this.nodeClasses(nodeType, nodeText, treeNode);
            } else {
                return this.nodeClasses[nodeType];
            }
        }
        return "";

    },
    /**
     * 获取折叠属性foldable的值
     * @method isFoldable
     * @return {String}
     */
    isFoldable : function() {
        return this.foldable;
    },
    /**
     * 获取根节点
     * @method getRoot
     * @return {Sui.tree.TreeNode}
     */
    getRoot : function() {
        return this.root;
    },
    /**
     * 设置根节点
     * @method setRoot
     * @param {Sui.tree.TreeNode} root
     */
    setRoot : function(root) {

        if (this.root) {
            this.root.destroy();
        }

        this.root = root;

        if (root) {
            root.setOwnerTree(this);

            if (this.isRendered()) {
                var timekeeper = new Sui.Timekeeper();
                this.renderRoot();
                Sui.log("渲染树花费的时间为" + timekeeper.getFormattedTime());
            }
        }

    },
    /**
     * 通过属性值查找到树节点
     * @method  findTreeNodeByAttr
     * @param {String} attrName
     * @param {String} attrValue
     * @return {Sui.tree.TreeNode}
     */
    findTreeNodeByAttr : function(attrName, attrValue) {
        var root = this.getRoot();
        if (root) {
            return root.findNodeByAttr(attrName, attrValue);
        } else {
            return null;
        }
    },
    /**
     * 渲染树组件
     * @method render
     * @param {DOM} container
     * @param {DOM} insertBefore
     * @private
     */
    render : function(container, insertBefore) {

        Sui.tree.Tree.superclass.render.apply(this, arguments);

        this.createApplyToElement("<div></div>", container, insertBefore);

        // 是否显示线条
        if (this.isLineVisible()) {
            this.getApplyToElement().addClass("sui_tree_showline");
        }

        // 监听键盘事件
        this.getApplyToElement().attr("tabIndex", -1);

        // 渲染根节点
        if (this.root) {
            this.renderRoot();
        }

        if (this.isEnableDefaultContextMenu()) {
            this.contextMenu = this.createDefaultContextMenu();
        }
    },
    /**
     * 创建右键菜单
     * @method  createDefaultContextMenu
     * @return {Sui.menu.ContextMenu}
     */
    createDefaultContextMenu : function() {
        if( this.contextMenu ){
            return this.contextMenu;
        }
        if (this.checkedType != Sui.TreeSelectType.DEFAULT && this.checkedType != Sui.TreeSelectType.SINGLE) {
            var contextMenu = new Sui.menu.ContextMenu();

            var checkAll = new Sui.menu.MenuItem({
                html : "全选",
                action : Sui.makeFunction(this, this.checkAll)
            });
            contextMenu.addItem(checkAll);

            return contextMenu;
        }

        return null;
    },

    /**
     * 全选。如果节点没有选中，则选中节点，并触发事件。
     * @method  checkAll
     *
     */
    checkAll : function() {
        var root = this.getRoot();
        if (root) {
            root.preorderTraversal(function(node) {
                node.setCheckAndFire(true);
            });
        }
    },
    /**
     * 渲染根节点
     * @method renderRoot
     * @private
     */
    renderRoot : function() {
        var rootNodeParentElement = this.rootNodeParentElement = $("<ul></ul>")
            .appendTo(this.getApplyToElement());

//        if (Sui.TreeNodeRenderType.RENDER_CHILDREN == this.renderType) {
//            var timerKeeper = new Sui.Timekeeper();
//            // 生成树对应的html数据
//            var treeString = this.root.generateTreeString();
//            rootNodeParentElement.html(treeString);
//            Sui.log("渲染树,生成树节点对应的字符串,花费" + timerKeeper.getFormattedTime());
//            // 初始化树各个节点的数据
//            this.root.initTreeNodeData(rootNodeParentElement);
//            Sui.log("渲染树,初始化数据节点,花费" + timerKeeper.getFormattedTime());
//        }

        var timerKeeper = new Sui.Timekeeper();
        this.root.render(rootNodeParentElement, false, true);
        this.root.expand();
        Sui.log("渲染树花费" + timerKeeper.getFormattedTime());

        this.applyRootVisible();
    },
    /**
     * 初始化事件
     * @method initEvent
     * @private
     */
    initEvent : function() {

        Sui.tree.Tree.superclass.initEvent.apply(this, arguments);
        this.getApplyToElement().keydown(Sui.makeFunction(this, this.onKeyDown));

    },
    /**
     * 当组件内有键盘事件时执行，用于实现节点选择功能。
     * 通过键盘选上下节点功能只在单选模式可用
     * @method  onKeyDown
     * @param {Event} event
     * @private
     */
    onKeyDown : function(event) {

        var KEY = Sui.KEY;
        switch (event.keyCode) {
            case KEY.UP:
                Sui.log("UP keydown");
                this.selectPrev();
                break;
            case KEY.DOWN:
                Sui.log("DOWN keydown");
                this.selectNext();
                break;
        }
    },
    /**
     * 选择前一个节点
     * @method  selectPrev
     * @private
     */
    selectPrev : function() {
        var lastSelectedNode = null;
        if (this.lastSelectedNode) {
            lastSelectedNode = this.lastSelectedNode.getPrevSelectedNode();
        } else {
            lastSelectedNode = this.getDefaultSelectedNode();
        }

        if (lastSelectedNode) {
            this.setSelectedNode(lastSelectedNode);
        } else {
            this.setCheckedElement();
        }
    },
    /**
     * 选中节点搜索结果集中的第一个节点
     * @method selectDefaultElementAfterQuery
     * @private
     */
    selectDefaultElementAfterQuery : function(){
        var lastSelectedNode = null;
        if(this.lastSearchResult && this.lastSearchResult.length > 0){
             lastSelectedNode = this.lastSearchResult[0];
        }

        this.setSelectedNode(lastSelectedNode);
    },
    /**
     * 选择后一个节点
     * @method selectNext
     */
    selectNext : function() {
        var lastSelectedNode = null;
        if (this.lastSelectedNode) {
            lastSelectedNode = this.lastSelectedNode.getNextSelectedNode();
        } else {
            lastSelectedNode = this.getDefaultSelectedNode();
        }

        if (lastSelectedNode) {
            this.setSelectedNode(lastSelectedNode);
        } else {
            this.setCheckedElement();
        }
    },
    /**
     * 设置单选模式下，选中节点的中radio状态为'选中'
     * @method setCheckedElement
     * @private
     */
    setCheckedElement : function() {
        if (this.checkedType == Sui.TreeSelectType.SINGLE) {

            var checkbox = Sui.getCheckedElements(this.getTreeNodeCheckedElementName(), this.getApplyToElement());
            if (checkbox.size() > 0) {
                var treeNode = this.findTreeNodeByDom(checkbox[0]);
                this.setSelectedNode(treeNode);
            }

        }
    },
    /**
     * 获取默认选中的节点
     * @method  getDefaultSelectedNode
     * @return {Sui.tree.Tree}
     */
    getDefaultSelectedNode : function() {
        return this.root;
    },
    /**
     * 获取选择模式,单选、多选或不选
     * @method  getCheckedType
     */
    getCheckedType : function() {
        return this.checkedType;
    },
    /**
     * 获取树节点中checkbox或radio的name属性
     * @method  getTreeNodeCheckedElementName
     * @return {String}
     */
    getTreeNodeCheckedElementName : function() {
        if (!this.treeNodeCheckedElementName) {
            this.treeNodeCheckedElementName = Sui.generateId() + "_checked";
        }
        return this.treeNodeCheckedElementName;
    },
    /**
     * 设置已选择节点的描述文本
     * @method  setSelectedNodeText
     * @param nodeText
     */
    setSelectedNodeText : function(nodeText) {
        var node = this.lastSelectedNode;
        if (node) {
            node.setNodeText(nodeText);
        }
    },
    /**
     * 获取已选择节点的描述文本
     * @method getSelectedNodeText
     * @return {String}
     */
    getSelectedNodeText : function() {
        var node = this.lastSelectedNode;
        if (node) {
            return node.getNodeText();
        }
    },
    /**
     * 设置拖拽指示器
     * @method setDragIndicator
     * @param indicator
     * @private
     */
    setDragIndicator : function(indicator) {
        this.dropIndicator = indicator;
    },
    /**
     * 获取放置指示器
     * @method  getDropIndicator
     * @return {DOM}
     */
    getDropIndicator : function() {
        if (!this.dropIndicator) {
            this.dropIndicator = $(
                "<div class='sui_tree_drag_insert_img'></div>").appendTo(
                Sui.getBody()).hide();
        }
        return this.dropIndicator;
    },
    /**
     * 取消所有节点的选择状态
     * @method clearSelectedNodes
     */
    clearSelectedNodes : function() {
        this.setSelectedNode(null);
    },
    /**
     * 删除已选中节点
     * @method   removeSelectedNodes
     */
    removeSelectedNodes : function() {
        var node = this.lastSelectedNode;
        if (node) {
            if (node == this.root) {
                return;
            }
            node.remove();
        }
    },
    /**
     * 获取已选中节点
     * @method  getSelectedNode
     * @return {Sui.tree.TreeNode}
     */
    getSelectedNode : function() {
        return this.lastSelectedNode;
    },
    /**
     * 多选模式下，获取选中节点的id并返回数组
     * @method   getSelectNodesId
     * @return {Array}
     */
    getSelectNodesId: function(){
        if (this.checkedType == Sui.TreeSelectType.MULTI_ALL ||
            this.checkedType == Sui.TreeSelectType.MULTI_LEAF) {

            var  selectedCheckNodes = [];
            this.root.getSelectChildNodesAndHandle(true, function(nodeId) {
                selectedCheckNodes.push(nodeId);
            });

            return selectedCheckNodes;
        }
    },
    /**
     * 设置选中节点
     * @method  setSelectedNode
     * @param {Sui.tree.TreeNode} node
     */
    setSelectedNode : function(node) {
        if (this.lastSelectedNode) {
            this.lastSelectedNode.clearSelectedClass();
            if (this.checkedType == Sui.TreeSelectType.SINGLE) {
                this.lastSelectedNode.setChecked(false);
            }
        }
        this.lastSelectedNode = node;
        if (this.lastSelectedNode) {
            this.lastSelectedNode.setSelectedClass();
            if (this.checkedType == Sui.TreeSelectType.SINGLE) {
                this.lastSelectedNode.setChecked(true);
            }
        }

        Sui.log("tree.lastSelectedNode=" + (this.lastSelectedNode ? this.lastSelectedNode.getPath() : ""));
    },
    /**
     * 判断根节点是否可见
     * @method isRootVisible
     * @return {Boolean}
     */
    isRootVisible : function() {
        return this.rootVisible;
    },
    /**
     * 设置根节点的可见性
     * @method   setRootVisible
     * @param {Boolean} visible
     */
    setRootVisible : function(visible) {
        visible = !!visible;
        if (this.rootVisible != visible) {
            this.rootVisible = visible;
            if (this.isRendered()) {
                this.applyRootVisible();
            }
        }
    },
    /**
     * 设置根节点的可见性的实际执行函数
     * @method  applyRootVisible
     * @private
     */
    applyRootVisible : function() {
        if (this.isRootVisible()) {
            this.showRoot();
        } else {
            this.hideRoot();
        }
    },
    /**
     * 判断树结构线是否可见
     * @method  isLineVisible
     * @return {Boolean}
     */
    isLineVisible : function() {
        return this.lineVisible;
    },
    /**
     * 设置树结构线的可见性
     * @method  setLineVisible
     * @param {Boolean} visible
     */
    setLineVisible : function(visible) {
        if (visible) {
            this.showLine();
        } else {
            this.hideLine();
        }
    },
    /**
     * 设置节点选择模式（单选、多选）
     * @method setCheckedType
     * @param {String} checkedType
     */
    setCheckedType : function(checkedType) {
        if (this.checkedType != checkedType) {
            this.checkedType = checkedType;

            if (this.root.isRendered()) {
                this.root.updatePaddingFoldNodeIconStyle(true);
                this.root.updateCheckboxStyle(true);
            }

            this.root.onChecked(false);
        }
    },
    /**
     * 隐藏树结构线
     * @method hideLine
     */
    hideLine : function() {
        this.lineVisible = false;
        if (this.isRendered()) {
            this.getApplyToElement().removeClass("sui_tree_showline");
        }
    },
    /**
     * 显示树结构线
     * @method showLine
     */
    showLine : function() {
        this.lineVisible = true;
        if (this.isRendered()) {
            this.getApplyToElement().addClass("sui_tree_showline");
        }
    },
    /**
     * 获取属性nodeIconVisible，即节点图标是否可见
     * @method isNodeIconVisible
     * @return {Boolean}
     */
    isNodeIconVisible : function() {
        return this.nodeIconVisible;
    },
    /**
     * 设置节点图标的可见性
     * @method  setNodeIconVisible
     * @param {Boolean} nodeIconVisible
     */
    setNodeIconVisible : function(nodeIconVisible) {
        this.nodeIconVisible = nodeIconVisible;
        this.applyNodeIconVisible();

    },
    /**
     * 设置节点图标可见性的实际执行函数
     * @method applyNodeIconVisible
     * @private
     */
    applyNodeIconVisible : function() {
        if (this.isRendered()) {
            this.root.preorderTraversal(function(node) {
                node.updateNodeIconElementVisible();
            });
        }
    },
    /**
     * 隐藏根节点
     * @method hideRoot
     * @private
     */
    hideRoot : function() {

        this.root.expand();
        this.root.hide();

        var thisTree = this;
        this.root.preorderTraversal(function(node) {
            if (node != thisTree.root) {
                node.setFirstPaddingVisible(false);
            }
        });

    },

    /**
     * 显示根节点
     * @method showRoot
     * @private
     */
    showRoot : function() {

        this.root.show();

        var thisTree = this;
        this.root.preorderTraversal(function(node) {
            if (node != thisTree.root) {
                node.setFirstPaddingVisible(true);
            }
        });

    },
    /**
     * 设置树节点是否可折叠
     * @method  setFoldable
     * @param {Boolean} foldable
     */
    setFoldable : function(foldable) {
        if (this.foldable != foldable) {
            this.foldable = foldable;
            this.root.setFoldable(foldable);
        }
    },
    /**
     * 展开选中的节点
     * @method  expand
     */
    expand : function() {
        var selectedNode = this.getSelectedNode();
        if (selectedNode) {
            selectedNode.expand();
        }
    },
    /**
     * 折叠选中的节点
     * @method collapse
     */
    collapse : function() {
        var selectedNode = this.getSelectedNode();
        if (selectedNode) {
            selectedNode.collapse();
        }
    },
    /**
     * 获取搜索关键词
     * @method getSearchContent
     * @return {String}
     */
    getSearchContent : function() {
        return this.searchContent;
    },

    /**
     * 搜索所有的节点
     * @method search
     * @param {String} val
     */
    search : function(val) {
        if (Sui.isUndefinedOrNull(val) || val == "") {
            this.clearSearch();
        } else {
            this.searchContent = val;
            if (this.root) {
                this.lastSearchResult = this.root.search.apply(this.root, arguments);
            }
        }

    },
    /**
     * 清除搜索状态
     * @method  clearSearch
     */
    clearSearch : function() {
        this.searchContent = "";
        if (this.isRendered() && this.root) {
            this.root.clearSearch();
        }
    },
    /**
     * 获取最近一次触发邮件菜单的节点
     * @method getContextMenuNode
     */
    getContextMenuNode : function() {
        return this.lastContextMenuNode;
    },
    /**
     * 在弹出右键菜单前执行
     * @method beforeShowContextMenu
     * @param {Event} e
     */
    beforeShowContextMenu : function(e) {

        if (this.isDisabled()) {
            return false;
        }

        var node;

        if ( Sui.getJQ(e.target).parent().parents('.sui_tree_node').size() > 0 ) {
            node = this.findTreeNodeByDom(e.target);
            this.lastContextMenuNode = node;
        }

        if (node) {
            var menuItems = node.menuItems;

            if (menuItems) {
                menuItems = menuItems.split("|");
                Sui.log("显示的菜单项包括: " + menuItems);
                this.contextMenu.hideAllItems();
                this.contextMenu.showItems(menuItems);
            }
        }

        return this.fireEvent("beforeContextMenu", new Sui.util.Event({
            node : node,
            e : e,
            contextMenu : this.contextMenu
        }));
    },
    /**
     * 通过DOM元素找到对应的树节点
     * @method  findTreeNodeByDom
     * @param {DOM} dom
     */
    findTreeNodeByDom : function(dom) {
        var treeNodeElement = Sui.findFirstAncestorBySelector(
            dom, ".sui_tree_node", false);
        if (treeNodeElement) {
            return treeNodeElement.data("treeNode");
        } else {
            return null;
        }
    }

});
/**
 *
 * 树节点的数据结构类
 * @class Sui.tree.TreeNodeUtil
 * @static
 */
Sui.tree.TreeNodeUtil = {
    /**
     * 通过JSON结构生成树节点
     * @method buildTreeNodeFromJsonData
     * @return {Sui.tree.Tree}
     * @param {Object} treeNodeData
     * @example
     * <pre><code>
     * var data = {
     *    'data':{
     *        'caption':'表单申请',
     *        'id':1,
     *        'imgCss':'',
     *        "nodeText":"我的工作台 "
     *    },
     *    'children':[
     *        {
     *            'data': { ...},
     *            'children':[...]
     *        }
     *    ]
     * }
     * </code></pre>
     **/
    buildTreeNodeFromJsonData : function(treeNodeData) {

        if (!treeNodeData) {
            return null;
        }

        if(Sui.isString(treeNodeData)){
            treeNodeData = Sui.evalJSON(treeNodeData);
        }

        var nodeConfig = Sui.applyProps({}, treeNodeData, [ "expanded",
            "nodeType", "nodeText", "id", "data", "title", "href",
            "menuItems", "enabled", "checked", "selected" , "nodeIconClass"]);

        var treeNode = new Sui.tree.TreeNode(nodeConfig);

        if (treeNodeData.children) {

            var children = treeNodeData.children;
            if (children) {
                if (!Sui.isArray(children)) {
                    children = [ children ];
                }

                for (var i = 0; i < children.length; i++) {
                    var childNode = this.buildTreeNodeFromJsonData(children[i]);
                    treeNode.addChildNode(childNode);
                }
            }

        }

        return treeNode;
    },

    /**
     * 通过数据结构生成树节点
     * @method buildTreeNode
     * @param {Array} nodeArray
     * @param {Object} config
     * @param {String} config.idName    列的名称,默认值为id
     * @param {String} config.parentIdName 父节点列的名称,默认值为parentId
     * @param {String} config.rootNodeParentId 根节点的父节点的值,默认值为null
     * @example
     * <pre><code>
     *    [
     *     {id : "1", parentId : null, nodeText : "中国"},
     *     {id : "11", parentId : "1", nodeText : "上海"},
     *     {id : "12", parentId : "1", nodeText : "广州"},
     *     {id : "13", parentId : "1", nodeText : "深圳"}，
     *     {id : "14", parentId : "1", nodeText : "北京"}
     *    ]
     * </code></pre>
     */
    buildTreeNode : function(nodeArray, config) {

        config = Sui.apply({
            idName : 'id',
            parentIdName : 'parentId',
            nodeTextName : 'nodeText'
        }, config);

        var idName = config.idName, parentIdName = config.parentIdName, nodeTextName = config.nodeTextName, rootNodeParentId = config.rootNodeParentId;

        // 保存nodeId和TreeNode的映射关系
        var nodeId_TreeNode_Map = {};
        Sui.each(nodeArray, function(nodeData) {
            var treeNode = new Sui.tree.TreeNode();
            treeNode.setNodeText(nodeData[nodeTextName]);
            treeNode.setNodeType(nodeData['nodeType']) ;
            var nodeId = nodeData[idName];
            nodeId_TreeNode_Map[nodeId] = treeNode;
        });

        // 构造树
        var root = null;
        Sui.each(
            nodeArray,
            function(nodeData) {

                var nodeId = nodeData[idName];
                var treeNode = nodeId_TreeNode_Map[nodeId];

                // 是否定义了isLeaf树形
                if (Sui.isDefined(nodeData.isLeaf)) {
                    if (treeNode.setLeaf) {
                        treeNode.setLeaf(nodeData.isLeaf);
                    }
                }

                treeNode.setData(nodeData);

                var parentId = nodeData[parentIdName];
                if ((Sui.isUndefined(rootNodeParentId) && (Sui
                    .isUndefined(parentId) || parentId == null))
                    || (Sui.isDefined(rootNodeParentId) && rootNodeParentId == parentId)) {
                    // 根节点
                    root = treeNode;
                } else {
                    var parentNode = nodeId_TreeNode_Map[parentId];
                    parentNode.addChildNode(treeNode);
                    treeNode.setParentNode(parentNode);
                }
            });

        return root;
    }

};

