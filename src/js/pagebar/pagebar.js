//Sui.namespace('Sui.Pagebar');
/**
 * 翻页组件
 * @class Sui.Pagebar
 * @extends Sui.Container
 * @constructor
 * @param {Object} config 配置参数
 * @param {Number} config.currentPage  当前页面序号，默认为1
 * @param {Number} config.totalCount 总条目数,默认为0
 * @param {Number} config.defaultCountPerPage 默认每页显示条目数，默认为20
 * @param {Array} config.countPerPageConfig 配置每页显示条目数待选项，默认为[10,20,50]
 * @example
 * <pre><code>
 * var toolbar = new Sui.Pagebar({
 *      applyTo:'pagebar',
 *      apply:'pagebar',
 *      currentPage:1,
 *      totalCount:124,
 *      countPerPageConfig:[10,20,50],
 *      defaultCountPerPage: 20,
 *
 * });
 * </code></pre>
 */
Sui.Pagebar = Sui.extend(Sui.Container, {

    defaultClass:'pagebar',
    infoSpanClass:'total',
    pageAreaClass:'page',
    jumpInputClass:'jump_ipt',
    jumpLabelClass:'jump_label',
    jumpBtnClass:'jump_btn',

    defaultCountPerPage:20,
    countPerPageConfig:[10,20,50],
    totalCount:0,
    currentPage:1,
    totalPage:null,

    totalCtrler:null,
    countPerPageCtrler:null,
    jumpToPageCtrler:null,
    jumpToPageBtn:null,
     /**
     * 根据配置参数初始化
     * @method initConfig
     * @param {Object} config
     * @private
     */
    initConfig: function (config) {
        Sui.Pagebar.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ['defaultClass','defaultCountPerPage','countPerPageConfig','totalCount','currentPage']);
    },
    /**
     * 渲染组件
     * @method  render
     * @param {DOM} container
     * @param {DOM} insertBefore
     * @private
     */
    render:function(container, insertBefore){
        Sui.Pagebar.superclass.render.apply(this, arguments);

        this.getApplyToElement().addClass(this.defaultClass);
        this.initTotalPage();
        this.createComponents();
    } ,
    /**
     * 渲染后执行
     * @method afterRender
     * @private
     */
    afterRender:function(){
        Sui.Pagebar.superclass.afterRender.apply(this, arguments);

    },
    /**
     * 初始化事件
     * @method initEvent
     * @private
     */
    initEvent:function() {

        Sui.Pagebar.superclass.initEvent.apply(this, arguments);

        var self = this;
        this.countPerPageCtrler.bind('change',function(){
             self.fireEvent('changeCountPerPage',new Sui.util.Event({
                 value: self.countPerPageCtrler.val()
             }))
        });
        this.jumpToPageBtn.bind('click', Sui.makeFunction(this,this.onJumpToPageBtnClick));
        this.btn_first.bind('click', function() {
            self.onPageBtnClick(this, '<<');
        })
        this.btn_prev.bind('click', function() {
            self.onPageBtnClick(this, '<');
        })
        this.btn_next.bind('click', function() {
            self.onPageBtnClick(this, '>');
        })
        this.btn_end.bind('click', function() {
            self.onPageBtnClick(this, '>>');
        })
    } ,
    /**
     * 跳转按钮点击时触发
     * @method onJumpToPageBtnClick
     * @private
     */
    onJumpToPageBtnClick:function(){

        var val = parseInt(this.jumpToPageCtrler.val());
        if (Sui.isNumber(val)) {
            val = Math.min(this.totalPage, Math.max(val, 1));
            this.jumpToPageCtrler.val(val);
            this.currentPage = val;

        } else {
            this.jumpToPageCtrler.val(this.currentPage);
        }
        this.fireEvent('jumpToPage', new Sui.util.Event({
            value: this.currentPage
        }))
    },
    /**
     * 翻页按钮点击时触发
     * @method onPageBtnClick
     * @param dom {DOM} 触发者
     * @param opr {String} 翻页动作类型
     * @private
     */
    onPageBtnClick:function(dom,opr) {
        if($(dom).hasClass('disable')){
            return false;
        }
        switch (opr) {
            case '<<':
                this.currentPage = 1;
                break;
            case '<':
                this.currentPage--;
                break;
            case '>':
                this.currentPage++;
                break;
            case '>>':
                this.currentPage = this.totalPage;
                break;
            default:
                break;
        }
        this.jumpToPageCtrler.val(this.currentPage);
        this.toggleBtns();
        this.fireEvent('jumpToPage', new Sui.util.Event({
            value: this.currentPage
        }))
    },
    /**
     * 初始化页面数
     * @method initTotalPage
     * @private
     */
    initTotalPage:function(){
        this.totalPage = Math.ceil(this.totalCount / this.defaultCountPerPage);
        this.currentPage = Math.min(this.totalPage, Math.max(this.currentPage, 1));
    },
    /**
     * 创建Pagebar上的组件
     * @method createComponents
     * @private
    **/
    createComponents:function() {

        var dom = this.getApplyToElement();

        var span = $('<span></span>').addClass(this.infoSpanClass);
        var totallabel = $('<label></label>').html('当前共<em>' + this.totalCount + '</em>条数据').appendTo(span);
        this.totalCtrler = totallabel.find('em');
        $('<label>每页显示</label>').appendTo(span);
        //创建控制每页条数的组件
        this.countPerPageCtrler = $('<select></select>').appendTo(span);
        $('<label>条</label>').appendTo(span);

        span.appendTo(dom);

        var div = $('<div></div>').addClass(this.pageAreaClass);
        this.btn_first = $('<a href="javascript:void(0);" class="page_btn" >首页</a>').appendTo(div);
        this.btn_prev =  $('<a href="javascript:void(0);" class="page_btn" >上一页</a>').appendTo(div);
        this.btn_next =  $('<a href="javascript:void(0);" class="page_btn" >下一页</a>').appendTo(div);
        this.btn_end =   $('<a href="javascript:void(0);" class="page_btn" >末页</a>').appendTo(div);
        div.appendTo(dom);

        this.toggleBtns();
        this.initCountPerPageCtrler();

        this.jumpToPageCtrler = $('<input type="text">').addClass(this.jumpInputClass).val(this.currentPage).appendTo(div) ;
        $('<label></label>').addClass(this.jumpLabelClass).html('/' + this.totalPage).appendTo(div);
        this.jumpToPageBtn =  $('<input type="button">').val('跳转').addClass(this.jumpBtnClass).appendTo(div);

    },
    /**
     * 判断哪些翻页组件需要激活或失效
     * @method toggleBtns
     * @private
     */
    toggleBtns:function() {

        var c = this.currentPage,
            m = this.totalPage;
        this.btn_first.toggleClass('disable', c <= 1);
        this.btn_prev.toggleClass('disable', c <= 1);
        this.btn_next.toggleClass('disable', c >= m);
        this.btn_end.toggleClass('disable', c >= m);

    },
    /**
     * @method setCurrentPage
     * 设置当前页面
     */
    setCurrentPage:function(val){

        val = parseInt(val);
        if (Sui.isNumber(val)) {
            val = Math.min(this.totalPage, Math.max(val, 1));
            this.jumpToPageCtrler.val(val);
            this.currentPage = val;

        } else {
            return;
        }
        this.toggleBtns();
        this.fireEvent('jumpToPage', new Sui.util.Event({
            value: this.currentPage
        }))
    },
    /**
     *  初始化每页条数组件
     *  @method initCountPerPageCtrler
     *  @private
     */
    initCountPerPageCtrler:function() {

        for (var i = 0,len = this.countPerPageConfig.length; i < len; i++) {
            var item = this.countPerPageConfig[i];
            $('<option>' + item + '</option>').val(item).appendTo(this.countPerPageCtrler);
            if (item == this.defaultCountPerPage) {
                this.countPerPageCtrler.val(item);
            }
        }
    }

});