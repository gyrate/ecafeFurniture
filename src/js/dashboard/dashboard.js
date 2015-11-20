//Sui.namespace('Sui.dashboard');
/**
 * @class  Sui.Dashboard
 * @extend Sui.Container
 * @constructor
 * @param {String} applyTo 指定渲染的DOM元素id
 * @param {Array} columnConfig  列的配置参数,数组成员的大小表示列的宽度比例
 * @param {Sui.data.Store} store  组件数据源
 * @param {String} titleField  栏目面板标题属性名
 * @param {String}  contentField 栏目面板内容地址
 * @param {String}  columnField  栏目面板所属列的属性名
 * @param {String}  showField  栏目面板是否显示的属性名
 * @param {String}  detailField  栏目面板的更多链接属性名
 * @param {String}  boxIdField  栏目面板id属性名
 * @param {Object}  listeners 事件监听参数，目前支持remove
 */
Sui.Dashboard = Sui.extend(Sui.Container, {
    /**
     * 组件的样式名
     * @property defaultClass
     * @type String
     * @default 'dashboard'
     **/
    defaultClass:'dashboard',
    /**
     * 列的样式名
     * @property columnClass
     * @type String
     * @default 'dash_sortlist'
    **/
    columnClass:'dash_sortlist',
    /**
     * 栏目面板的样式名
     * @property boxClass
     * @type String
     * @default 'dash_box'
    **/
    boxClass:'dash_box',
    /**
     * 列的配置参数,数组成员的大小表示列的宽度比例
     * @property columnConfig
     * @type Array
     * @default [1,2,1]
    **/
    columnConfig:[1,2,1],

    columns:[],
    boxs:[],
    /**
     * 组件数据源
     * @property store
     * @type Sui.data.Store
     * @default null
    **/
    store:null,
    /**
     * 栏目面板标题属性名
     * @property titleField
     * @type String
     * @default 'html'
    **/
    titleField:'html',
    /**
     * 栏目面板内容地址
     * @property contentField
     * @type String
     * @default 'src'
    **/
    contentField:'src',
    /**
     * 栏目面板是否显示的属性名
     * @property showField
     * @type String
     * @default 'show'
    **/
    showField:'show',
    /**
     * 栏目面板的更多链接属性名
     * @property detailField
     * @type String 
     * @default 'more'
    **/ 
    detailField:'more',
    /**
     * 栏目面板所属列的属性名
     * @property columnField
     * @type String
     * @default 'columnId'
    **/
    columnField: 'columnId',
    /**
     * 栏目面板id属性名
     * @property boxIdField
     * @type String
     * @default 'id'
     */
    boxIdField:'id',
    /**
     * 根据配置参数进行初始化
     * @method initConfig
     * @param {Object} config
     **/
    initConfig:function(config) {
        Sui.Dashboard.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ['defaultClass', 'boxClass', 'columnConfig', 'store','titleField','contentField','showField','detailField','columnField','boxIdField']);
    },
    /**
     * 渲染组件
     * @method render
     * @param {DOM} container
     * @param {DOM} insertBefore
     **/
    render:function(container, insertBefore) {
        Sui.Dashboard.superclass.render.apply(this, arguments);

        this.initColumn();
        this._createBoxs();
    },
    /**
     * 初始化列
     * @method initColumn
     **/
    initColumn:function() {

        var total = eval(this.columnConfig.join('+'));
        var dashbox = this.getApplyToElement();

        for (var i = 0,len = this.columnConfig.length; i < len; i++) {

            var column = $('<div class="_column ' +  this.columnClass + '"></div>')
                .width((this.columnConfig[i] / total * 100).toFixed(2) + '%')
                .appendTo(dashbox);

            this.columns.push(column);
        }

    },
    /**
     * 初始化栏目面板
     * @method _createBoxs
     * @private
    **/
    _createBoxs:function() {

        for (var i = 0, len = this.store.getCount(); i < len; i++) {

            var record = this.store.getRecord(i);
            if (record.getFieldValue(this.showField)) {
                this._addBox(record, this.columns[ record.getFieldValue(this.columnField) ]);
            }
        }
    },
    /**
     * 添加一个栏目面板
     * @method _addBox
     * @private
     * @param {Object} config 配置参数
     * @param {DOM} parent 父容器
     * @return Object
     **/
    _addBox:function( config,  parent) {

        var props = {};
        if(config instanceof Sui.data.Record){
            props = config.copyData();
        }else if( config instanceof Object){
            props = config;
        }else{
            return null;
        }

        var box = $('<div class="dash_box"></div>').attr('box_id',props[this.boxIdField]);
        var box_title = $('<div class="box_title"></div>').appendTo(box),
            span = $('<span></span>').html(props[this.titleField]).appendTo(box_title),
            more = $('<a class="ico ico_more" title="更多">更多</a>').attr('detail_src',props[this.detailField]).appendTo(box_title),
            remove = $('<a class="ico ico_delete" title="删除">删除</a>').attr('box_id',props[this.boxIdField]).appendTo(box_title);

        var box_content = $('<div class="box_content"></div>').appendTo(box),
            frame = $('<iframe src="' + props[this.contentField] + '"></iframe>').appendTo(box_content);
            box.appendTo( parent );
            this.boxs[ props[this.boxIdField]] = box;

        var self = this;
        more.click(function(){
            window.open($(this).attr('detail_src'));
        });
        remove.click(function(){
            var value = $(this).attr('box_id');
            self.removeBox(value);
        });

    },
    /**
    * 删除一个栏目面板
    * @method removeBox
    * @param {String} boxid
    **/
    removeBox:function(boxid) {
        this.boxs[boxid].remove();
        this.store.findRecordByNameValue(this.boxIdField, boxid).setFieldValue(this.showField,false);
        this.fireEvent('remove',new Sui.util.Event({
            boxid: boxid
        }));
        this.getApplyToElement().height(this._getColumnMaxHeight());
    },
    /**
     * 显示可以栏目面板
     * @method showBox
     * @param {String} boxid
    **/
    showBox:function(boxid){
        var record  = this.store.findRecordByNameValue(this.boxIdField, boxid),
            columnId = record.getFieldValue(this.columnField) || 0;

        this._addBox(record, this.columns[columnId] );
        record.setFieldValue(this.showField,true);
        record.setFieldValue(this.columnField, columnId );
    },
    /**
     * 渲染后执行函数
     * @method afterRender
    **/
    afterRender:function() {
        Sui.Dashboard.superclass.afterRender.apply(this, arguments);

        var self = this;
        this.getApplyToElement().find('._column').sortable({
            connectWith: "._column"
            //,tolerance:'pointer'
            //, forceHelperSize: true
            ,distance: 50
            ,placeholder: "sortable-placeholder"
            ,forcePlaceholderSize:true
            ,opacity: 0.5
            ,stop: function(event,ui){
                self.getApplyToElement().height(self._getColumnMaxHeight());
            }
        });

    },
    /**
     * 获取最高列的高度
     * @method _getColumnMaxHeight
     * @private
     * @return {Number}
     */
    _getColumnMaxHeight:function(){
        var maxH = 0,h;
        this.getApplyToElement().height('auto');
        for (var i = 0,len = this.columns.length; i < len; i++) {
            h = this.columns[i].height();
            maxH = h > maxH ? h : maxH;
        }
        return maxH;
    },
    /**
     * 获取当前栏目面板的排序
     * @method getColumnSort
     * @return {Array}
     * @example
     * <pre><code>
     *      [ ['1','2'],['3','4'],['5','6'] ] //返回的数据表示共3列，每一列分别有两个栏目面板，二级数组成员为栏目面板的id属性
     * </code></pre>
    **/
    getColumnSort:function(){

        var sortResult = [];

        for (var i = 0,len = this.columns.length; i < len; i++) {

            var boxs = this.columns[i].find('.' + this.boxClass),
                arr = [];
            for (var j = 0,jlen = boxs.length; j < jlen; j++) {
                arr.push(boxs[j].getAttribute('box_id'));
            }
            sortResult.push(arr);
        }

        return sortResult;
    }

});