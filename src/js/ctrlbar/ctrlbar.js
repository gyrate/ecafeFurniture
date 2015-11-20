//Sui.namespace('Sui.Ctrlbar');
/**
 * 选项卡组件
 * @class Sui.Ctrlbar
 * @extends Sui.Container
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.applyTo  渲染到的组件id
 * @param {Object} config.config 组件参数，可参考例子
 * @param {String} config.buttonClass 按钮组件的样式名
 * @param {String} config.labelClass 字段组件的样式名
 * @example
 * <pre><code>
 * var toolbar = new Sui.Ctrlbar({
 *      applyTo:'ctrlbar',
 *      config:[{
 *          displayName: '添加数据',
 *          iconCss:'s_ico s_ico_add',
 *          componentType : "button",
 *          position:'left',
 *          action: function(scope) {
 *              ...
 *          }
 *      },{
 *          displayName:'共N个记录',
 *          position:'right'
 *      }]
 * });
 * </code></pre>
 */
Sui.Ctrlbar = Sui.extend(Sui.Container, {

    defaultClass:'ctrlbar',
    buttonClass: 'button',
    labelClass: 'label',
    /**
     * 工具条组件配置参数
     * @property config
     * @type Object
     * @default null
    **/
    config:null,
    /**
     * 根据配置参数初始化
     * @method initConfig
     * @param {Object} config
     * @private
     */
    initConfig: function (config) {
        Sui.Ctrlbar.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ['defaultClass','buttonClass','labelClass','config']);
    },
    /**
     * 渲染组件
     * @method  render
     * @param {DOM} container
     * @param {DOM} insertBefore
     * @private
     */
    render:function(container, insertBefore){
        Sui.Ctrlbar.superclass.render.apply(this, arguments);

        this.getApplyToElement().addClass(this.defaultClass);
        this.createComponents();
    } ,
    /**
     * 渲染后执行
     * @method afterRender
     * @private
     */
    afterRender:function(){
        Sui.Ctrlbar.superclass.afterRender.apply(this, arguments);
    },
    /**
     * 初始化事件
     * @method initEvent
     * @private
     */
    initEvent:function() {
        Sui.Ctrlbar.superclass.initEvent.apply(this, arguments);
    } ,
    /**
     * 创建Ctrlbar上的组件
     * @method createComponents
     * @private
    **/
    createComponents:function() {

        var dom = this.getApplyToElement();
        this.leftArea = $('<div class="ctrlbar_left"></div>').appendTo(dom);
        this.rightArea = $('<div class="ctrlbar_right"></div>').appendTo(dom);

        for (var i = 0,len = this.config.length; i < len; i++) {

            var config = this.config[i]
                ,component;

            if (config['componentType'] == 'button') {

                component = $('<a href="javascript:void(0);"></a>').addClass(this.buttonClass);
                var innerhtml = (Sui.isString(config['iconCss']) ? '<b class="' + config['iconCss'] + '"></b>' : '') + config['displayName'];
                component.html(innerhtml);

                var self = this;
                if (Sui.isFunction(config['action'])) {
                    (function(action){
                        component.on('click', function() {
                            action(self);
                        })
                    })(config['action']);
                }

            } else if (config['componentType'] == 'label') {

                component = $('<label></label>').html(config['displayName']).addClass(this.labelClass) ;

            } else if (config['componentType'] == 'break') {
                component = $('<span class="break"></span>');
            }

            if( config['position'] == 'right'){
                this.rightArea.append( component );
            }else{
                this.leftArea.append( component );
            }
        }
    }
});
