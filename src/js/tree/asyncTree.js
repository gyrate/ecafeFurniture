Sui.tree.AsyncTreeNode = Sui.extend(Sui.tree.TreeNode, {

    // private
    loaded : false,
    nodeId : '',

    constructor : function(config) {
        Sui.tree.AsyncTreeNode.superclass.constructor.apply(this, arguments);
        Sui.applyProps(this, config, ["loaded", "nodeId"]);
    },

    getNodeId : function() {
        return this.nodeId;
    },

    isLoaded : function() {
        return this.loaded;
    },

    setLoaded : function(loaded) {
        this.loaded = loaded;
    },

    isLeaf : function() {

        // 如果没有加载的话，则默认是可展开的。
        if (! this.isLoaded()) {
            return false;
        } else {
            return Sui.tree.AsyncTreeNode.superclass.isLeaf.apply(this, arguments);
        }

    },

    expand : function() {

        if (! this.isLoaded()) {
            this.loadChildrenNodeData();
            return;
        } else {
            Sui.tree.AsyncTreeNode.superclass.expand.apply(this, arguments);
        }

    },

    onSuccessLoadChildrenNodeData : function(data) {

        Sui.debug("onSuccessLoadChildrenNodeData");
        this.foldElement.removeClass("sui_tree_loading");
        for (var i = 0; i < data.length; i++) {
            var nodeConfig = data[i];
            var treeNode = new Sui.tree.AsyncTreeNode(nodeConfig);
            this.addChildNode(treeNode);
        }
        this.setLoaded(true);

        if (data.length > 0) {
            this.expand();
        } else {
            this.updatePaddingFoldNodeIconStyle();
        }

    },

    onOrrorLoadChildrenNodeData : function(request, status, err) {
        this.foldElement.removeClass("sui_tree_loading");
        Sui.error(Sui.StringUtil.formatByNumber("onOrrorLoadChildrenNodeData，status={0}，err={1}", status, err));
    },

    loadChildrenNodeData : function() {
        this.foldElement.addClass("sui_tree_loading");
        var requestConfig = {
            success: Sui.makeFunction(this, this.onSuccessLoadChildrenNodeData),
            error : Sui.makeFunction(this, this.onOrrorLoadChildrenNodeData)
        }
        this.getOwnerTree().loadChildrenNodeData(this.getNodeId(), requestConfig);
    }

});
