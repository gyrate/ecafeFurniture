/**
 * 下拉日期选择组件，
 * 初始化时需要指定触发元素；也可以指定触发元素和输出元素.
 * 所有构造参数的设置可参照Properties说明
 * @class Sui.Datepicker
 * @extends  Sui.Component
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.trigger 触发元素的Id
 * @param {String} config.output  输出元素的Id,只允许存在一个输出元素
 * @param {Boolean} config.outputReadonly 输出框是否为只读，默认为false
 * @param {String} config.dateFormat 日期格式
 * @param {Object} config.sprcialDates 特殊日期集合
 * @param {Function}  config.specailDatesFunction 特殊日期的过滤函数
 * @param {Date} config.currentDate 当前日期
 * @param {Date} config.maxDate 最大日期
 * @param {Date} config.minDate 最小日期
 * @param {Array} config.range 可选日期范围,
 * @param {Function} config.errorHandler  错误事件处理函数
 * @param {String} config.value 日期下拉组件的初始值
 */
Sui.Datepicker = Sui.extend(Sui.Component, {
    /**
     * 日期下拉组件的初始值
     * @property value
     * @type String
     * @default null
     */
    value:null,
    applyToTagName:'div',
    /**
     * 触发日期选择层的元素Id
     * @property trigger
     * @type String
     * @default null
     */
    trigger:null,
    triggerElement:null,
    /**
     * 显示日期内容的元素
     * @property output
     * @type String
     * @default null
     */
    output:null,
    outputElement:null,
    /**
     * 输出框是否为只读
     * @property  outputReadonly
     * @type Boolean
     * @default false
     */
    outputReadonly:false,
    //选择器
    datePanel:null,
    //日期格式
    /**
     * 日期格式
     * @property  dateFormat
     * @type String
     * @deafult 'yyyy-MM-dd'
     * @example
     * <pre><code>
     *   //日期元素可使用 - , \\ : 符号间隔
     *   dateFormat:'yyyy-MM-dd';
     *   dateFormat:'yyyy,MM,dd';
     *   dateFormat:'yyyy\\MM\\dd';
     *   dateFormat:'MM dd yyyy';
     *   //年元素支持两种写法yy、yyyy
     *   dateFormat:'yy-MM-dd';
     *   //月、日、时、分、秒等元素支持1、2位写法，1位写法时数值允许存在1位或2位；2位写法时，1位数自动补足为2位数
     *   dateFormat:'yyyy-M-d';
     *   dateFormat:'hh:mm:ss';
     *   dateFormat:'h:m:s';
     *
     * </code></pre>
     */
    dateFormat:'yyyy-MM-dd',
    /**
     *特殊日期, key为"年*10000+月*100+日"(月份从1开始),值为css属性定义或样式类class定义
     * @example
     * <pre><code>
     *  specialDates: {
     *           '20130929' : {
     *              'background-color' : '#F4A551'
     *          }，
     *          '20130918':{
     *             'class','className'
     *           }
     *    }
     * </code></pre>
     * @property specialDates
     * @type {Object}
     * @default null
     */
    sprcialDates:null,
    /**
     * 定义特殊的负责的日期，
     * 本质是一个函数，可以对指定的年月日星期进行过滤，返回true则断定为特殊日期
     * @example
     *  <pre><code>
     *  specialDates: function (year, month, date, day){
     *      return day == 2;//选定所有星期二为特殊日期
     *  }
     *  </code></pre>
     * @property  specailDatesFunction
     * @type {Function}
     * @default null
     */
    specailDatesFunction:null,
    /**
     * 日历上的初始日期，初始化方法可以为
     * <pre><code>
     * dateObj = new Date();//日期为操作系统当前日期
     * dateObj = new Date(dateVal);//日期格式为yyyy/MM/dd
     * dateObj = new Date(year, month, date[, hours[, minutes[, seconds[,ms]]]])
     * </code></pre>
     * @property currentDate
     * @type {Date}
     * @default "操作系统当前日期"
     */
    currentDate: new Date(),
    /**
     * 最小日期,默认为 1900,1,1
     * @property minDate
     * @type {Date}
     * @default new Date('1900/1/1')
     */
    minDate : new Date('1900/1/1'),
    /**
     * 最大日期,默认为 2099,12,30
     * @property maxDate
     * @type {Date}
     * @default new Date('2099/12/31')
     */
    maxDate :  new Date('2099/12/31'),
    /**
     * 日期可选范围，接受数组与函数如 [startDate, endDate],
     * 推荐用['2013/12/12','2014/01/15']这种格式，日期范围不应超过1900,1,1到2099/12/31
     * 也可以用函数过滤
     * @example
     *  设定最小和最大可选日期
     *  <pre><code>
     *     range:['2013/12/12','2014/01/15']
     *  </code></pre>
     * @example
     *  禁用所有周一、周二
     *  <pre><code>
     *  range: function(year,month,date,day) {
     *     return day > 1; //禁用所有周一、周二
     *  }
     *  </pre></code>
     *
     * @property range
     * @type {Array} {Function}
     * @default []
     */
    range:[],
    //放置日期选择器的容器
    layer:null,
    /**
     * 错误事件处理函数，
     * 当手动输入日期时可能产生错误，此时可根据需要自定义错误信息。
     * 默认处理方式为，将组件值恢复为最新的有效值。
     * @property errorHandler
     * @type Function
     * @default null
     * @example
     * <pre><code>
     *      errorHandler:function(event){
     *          var msg = {
     *              invalid:'输入格式错误'，
     *              outRange:'超出日期范围'
     *          }
     *          alert(msg[event.type]);
     *      }
     *      //event类型为Sui.util.Event
     *      //event = { errorDate:{...},  纠正后的日期元素对象
     *      //          currentDate: $Date , 组件当前日期
     *      //          dateFormat: 'yyyy-MM-dd' , 组件当前日期格式
     *      //          type:'invalid' 错误类型，有invalid（格式错误)和outRange(超出范围)两种
     *      //         }
     * </code></pre>
     */
    errorHandler:null,
    /**
     * 根据配置参数初始化
     * @method  initConfig
     * @param  {Object} config
     * @private
     */
    initConfig:function(config){
        Sui.Datepicker.superclass.initConfig.apply(this,arguments);
        Sui.applyProps(this,config,['trigger','output','dateFormat','specialDates','specailDatesFunction','currentDate',
            'maxDate','minDate','range','outputReadonly','errorHandler','value']);
        this.initRange();
    },
    /**
     * 初始化各种属性
     * @method initProperties
     * @@private
     */
    initProperties:function(){
        Sui.Datepicker.superclass.initProperties.apply(this,arguments);
        //this.dateTdElements = [];
        this.layer = new Sui.Layer({
            defaultClass : ''
        });
    },
    /**
     * 渲染组件
     * @method render
     * @param {Object} container
     * @param {DOM} insertBefore
     * @private
     */
    render:function(container, insertBefore){

        Sui.Datepicker.superclass.render.apply(this,arguments);

        var self = this;

        //初始化触发者
        this.initTrigger();

        //创建日期选择面板的容器,声明触发范围
        this.layer.setExcludeElementsClick(this.getTriggerElement());
        this.layer.renderTo(Sui.getBody());

         //创建日期选择面板
        this.datePanel = new Sui.Date({

            dateFormat:this.dateFormat,
            specialDates:this.specialDates,
            specailDatesFunction: this.specailDatesFunction,
            currentDate: Sui.DateUtil.cloneDate(this.currentDate),
            maxDate:this.maxDate,
            minDate:this.minDate,
            range:this.range,
            listeners : {
                'selected' : function(event) {

                    if(event.value == '' || event.date == ''){
                        //当'清空'事件发生时，currentDate定义为当前月份第一天
                        var date = self.currentDate;
                        date.setDate(1);
                        self.applySetValue('',date);
                    }else{
                        self.applySetValue(event.value,event.date);
                    }
                    self.layer.hide();
                }
            }
        });
        this.layer.addComponent(this.datePanel);
        this.rectifyInitValue(this.value);

    },
    /**
     * 校验初始化时的value
     * @method  rectifyInitValue
     * @param {String} val
     * @private
     */
    rectifyInitValue:function(val) {

        if (Sui.isString(val)) {
            //自动纠正错误的输入
            var reDateObj = this.rectifyDate(val,this.dateFormat);
        }else{
            return;
        }

        if(reDateObj == ''){
            this.setOutputValue('');
            return;
        }
         //纠正后格式正确且在选择范围内
        if ( Sui.isDefinedAndNotNull(reDateObj) ) {
            if(this.isInRange(reDateObj)){
                this.applySetValue(reDateObj['string'],this.switchToDate(reDateObj));
            }else{
                this.fireEvent( 'errorInput',new Sui.util.Event({
                    errorDate:reDateObj,
                    currentDate:this.currentDate,
                    dateFormat:this.dateFormat ,
                    type:'outRange'
                }) );
            }
        }else{
            this.fireEvent( 'errorInput',new Sui.util.Event({
                errorDate:reDateObj,
                currentDate:this.currentDate,
                dateFormat:this.dateFormat ,
                type:'invalid'
            }) );
        }

    },
    /**
     * @method setValue
     * @param {String} val
     */
    setValue:function(val){
        this.rectifyInitValue(val);
    },
    /**
     * @method clearValue
     */
    clearValue:function(){
        this.setValue('');

        var date = Sui.DateUtil.cloneDate( this.currentDate );
        date.setDate(1);
        //将组件的输出区域置为'',而组件currentDate保留为当前月第一天
        this.currentDate = date ;
        this.datePanel.setCurrentDate(date);
    },
    /**
     * 初始化触发元素、输出元素
     * @method initTrigger
     * @private
     */
    initTrigger:function(){

       this.triggerElement =  Sui.getJQ(this.trigger);
        //如果没有指定输出元素，则触发元素就是输入元素
       if(Sui.isUndefinedOrNull(this.output)){
           this.outputElement = this.triggerElement;
       }else{
           this.outputElement =  Sui.getJQ(this.output);
       }
       if( Sui.getTagName( this.outputElement) === 'input' ){
           this.outputElement.attr('readOnly', this.outputReadonly);
       }
    },
    /**
     * 渲染后执行
     * @method  afterRender
     * @param {Object} container
     * @param {DOM} insertBefore
     * @private
     */
    afterRender:function(container, insertBefore){
        Sui.Datepicker.superclass.afterRender.apply(this,arguments);
    },
    /**
     * 初始化事件触发
     * @method initEvent
     * @private
     */
    initEvent:function(){
        Sui.Datepicker.superclass.initEvent.apply(this, arguments);
        this.getTriggerElement().click(this, Sui.makeFunction(this, this.onClick));
        //如果 输出元素 的标签类型为input，则点击它也可以触发日期组件
        if(Sui.getTagName(this.outputElement) === 'input'){
            this.outputElement.focus(this, Sui.makeFunction(this, this.onClick));
            this.outputElement.blur(this,Sui.makeFunction(this, this.onBlur));
        }
        this.on( 'errorInput', Sui.makeFunction(this,this.handleError) );
    },

    /**
     * 处理错误输入事件，由errorInput事件触发
     * @method handlError
     * @param event
     */
    handleError:function(event){
        if(Sui.isFunction(this.errorHandler)){
            this.errorHandler(event);
        }else{
            //console.info('date error: %s',event.type);
            this.applySetValue(Sui.DateUtil.format(event.currentDate, event.dateFormat), event.currentDate);
        }
    },
    /**
     * 点击触发元素时执行
     * @method onClick
     * @param {Event} e
     * @private
     */
    onClick:function(e){
        this.locateLayer();

        if (this.currentDate.getTime() != this.datePanel.currentDate.getTime() ) {
            this.datePanel.setCurrentDate( Sui.DateUtil.cloneDate(this.currentDate)  );
        }

        this.layer.show();
    },
    /**
     * 触发元素为input元素，失去焦点后执行
     * @method onBlur
     * @param {Event} event
     */
    onBlur:function(event){
        //如果日期面板正在进行操作，则无需做日期校验
        if(  this.isDatePanelChoosing() ){
            return;
        }
        //校验格式，纠正错误格式
        var ipt = event.currentTarget;
         //自动纠正错误的输入
        var reDateObj = this.rectifyDate(ipt.value,this.dateFormat);

        //空字符串特殊处理
        if(reDateObj == ''){
            this.setOutputValue('');
            return;
        }

         //纠正后格式正确且在选择范围内
        if ( Sui.isDefinedAndNotNull(reDateObj) ) {
            if(this.isInRange(reDateObj)){
                this.applySetValue(reDateObj['string'],this.switchToDate(reDateObj));
            }else{
                this.fireEvent( 'errorInput',new Sui.util.Event({
                    errorDate:reDateObj,
                    currentDate:this.currentDate,
                    dateFormat:this.dateFormat ,
                    type:'outRange'
                }) );
            }
        }else{
            this.fireEvent( 'errorInput',new Sui.util.Event({
                errorDate:reDateObj,
                currentDate:this.currentDate,
                dateFormat:this.dateFormat ,
                type:'invalid'
            }) );
        }

    },
    /**
     * 判断日期选择面板是否为弹出状态
     * @method isDatePanelChoosing
     * @return {Boolean}
     */
    isDatePanelChoosing:function(){
        return this.datePanel.getApplyToElement().is(':visible');
    },
    /**
     * 判断日期是否在可选范围内
     * @method isInRange
     * @param {Object} dateObj 由日期元素组成的对象
     * @return {Boolean}
     * @private
     */
    isInRange:function(dateObj){

        //日期与最大、最小日期范围进行比较
        var result = true,
            minDate =  this.minDate,
            maxDate =  this.maxDate;

        if (!Sui.isObject(dateObj)) {
            result = false ;
        }

        var comDate = this.switchToDate(dateObj) ;

        if ( minDate && Sui.DateUtil.compareYMD(minDate, comDate) > 0 ) {
            result = false;
        }
        if( maxDate && Sui.DateUtil.compareYMD(comDate,maxDate) > 0 ){
            result = false;
        }
        return result;

    },
    /**
     * 将日期元素对象转换为日期
     * @method switchToDate
     * @param {Object} dateObj
     * @private
     */
    switchToDate:function(dateObj){
        //将dateObj对象转换成日期
        var currentDate = new Date();
        var _y = dateObj.yyyy || ( dateObj.yy ? '20' + dateObj.yy : null) || currentDate.getFullYear(),
            _M = parseInt(dateObj.MM) - 1 || parseInt(dateObj.M) - 1 || currentDate.getMonth(),
            _d = dateObj.dd || dateObj.d || currentDate.getDate(),
            _h = dateObj.hh || dateObj.h || currentDate.getHours(),
            _m = dateObj.mm || dateObj.m || currentDate.getMinutes(),
            _s = dateObj.ss || dateObj.s || currentDate.getSeconds();

        return  new Date(_y, _M, _d, _h, _m, _s);
    },
    /**
     * 按格式纠正某日期字符串，并返回；
     * 如字符串无法纠正，则返回null
     * @method  rectifyDate
     * @param {String} value
     * @param {String} format
     * @private rectifyDate
     */
    rectifyDate:function(value,format){

        if (Sui.isEmpty(value)) {
            return '';
        }

        var reg = format.replace(/y+/g, '([0-9]+)')
            .replace(/M+/g, '(1[012]|0?[0-9])')
            .replace(/d+/g, '([1-9][0-9]|0?[0-9])')
            .replace(/h+/g, '([0-1]?[0-9]|2[0-3])')
            .replace(/m+/g, '([0-5]?[0-9])')
            .replace(/s+/g, '([0-5]?[0-9])');

        var matchResult = value.match(new RegExp('^'+reg+'$'));

        if (matchResult && matchResult.length > 0) {

            //日期格式正确，移除第一个全匹配素，剩下子匹配元素
            matchResult.shift();
            //将format上的时间格式块（如yyyy,MM,dd等从foramt上剥离，与其输入值对应）
            var dateElements = format.match( /y+|M+|d+|h+|m+|s+/g ),
                dateObj = {};
            for (var i = 0,len = dateElements.length; i < len; i++) {
                dateObj[dateElements[i]] = matchResult[i];
            }

            var result = format;
            //根据日期格式纠正日期
            for (var prop in dateObj) {
                var val = dateObj[prop];
                switch (prop) {
                    case 'yy':
                        if (val.length < 2) {
                            val = '0' + val;
                        } else if (val.length > 2) {
                            val = val.substr(val.length - 2);
                        }
                        break;
                    case 'yyyy':
                        val = parseFloat( Math.min(Math.max(val,1900),2099) ).toString();
                        break;
                    case 'M':
                    case 'd':
                        val = ( parseFloat(val) > 0 ) ? val : '1';
                        //日期数值不能超过当月最高日期值
                        var _month = parseFloat(dateObj['MM'] || dateObj['M']) -1,
                            _year = parseFloat( dateObj['yyyy'] || dateObj['yy'] ),
                            _days = Sui.DateUtil.getDaysInMonth(_year, _month);
                        val = Math.min(parseFloat(val), _days).toString();
                        break;
                    case 'h':
                    case 'm':
                    case 's':
                        break;
                    case 'MM':
                        val = ( parseFloat(val) > 0 ) ? val : '1';
                        val = (val.length < 2 ? '0' : '' ) + val;
                        break;
                    case 'dd':
                        val = ( parseFloat(val) > 0 ) ? val : '1';
                        //日期数值不能超过当月最高日期值
                        var _month = parseFloat(dateObj['MM'] || dateObj['M']) -1,
                            _year = parseFloat( dateObj['yyyy'] || dateObj['yy'] ),
                            _days = Sui.DateUtil.getDaysInMonth(_year, _month);
                        val = Math.min(parseFloat(val), _days).toString();
                        val = (val.length < 2 ? '0' : '' ) + val;
                        break;
                    case 'hh':
                    case 'mm':
                    case 'ss':
                        val = (val.length < 2 ? '0' : '' ) + val;
                        break;
                    default:
                        break;
                }
                dateObj[prop] = val;
                result = result.replace(prop, val);
            }
            dateObj['string'] = result;
            //console.dir(dateObj);
            return dateObj ;
        } else {
            return null;
        }
    },
    /**
     * 定位日期弹出选择层
     * @method locateLayer
     * @private
     */
    locateLayer:function(){

        var h = Sui.getDomHeight(this.getOutputElement()),
            top = this.getOutputElement().offset().top,
            left = this.getOutputElement().offset().left;

        this.layer.getApplyToElement().css('position','absolute');
        this.layer.locate( top + h , left);
    },
    /**
     * 获取触发元素
     * @method  getTriggerElement
     * @return {DOM}
     */
    getTriggerElement:function(){
        return this.triggerElement;
    },
    /**
     * 获取输出元素
     * @method getOutputElement
     * @return {DOM}
     */
    getOutputElement:function(){
        return this.outputElement;
    },
    /**
     * 设置当前组件对应的值和日期
     * @method  applySetValue
     * @param {String} val
     * @param {Date} date
     */
    applySetValue:function(val,date){

        this.currentDate = date; //formate格式不确定，val应该经过分解后再生成

        this.setOutputValue(val);

        this.datePanel.setCurrentDate(Sui.DateUtil.cloneDate(date));

    },
    /**
     * 设置输出组件的值
     * @method setOutputValue
     * @param {String} val
     */
    setOutputValue:function(val){
        var dom = this.getOutputElement();
        if(Sui.getTagName(dom) === 'input'){
            dom.val(val);
        }else{
            dom.text(val);
        }
    },
    /**
     * 获得组件的当前的日期值
     * @method getValue
     * @returns {Date}
     */
    getValue: function(){

        if(this.outputElement.size()>0){
            return this.outputElement.attr('value') || this.outputElement.text();
        }else{
            return  Sui.DateUtil.format(this.currentDate,this.dateFormat)
        }
    },
    /**
     * 设置日期格式
     * @method  setDateFormat
     * @param str
     */
    setDateFormat:function(str){
        this.dateFormat = str;
        this.datePanel.setDateFormat(str);
    } ,
    /**
     * 激活被禁用的日期
     * @method activeDisableDate
     *
     */
    activeDisableDate:function() {
        this.range = [];
        this.minDate = new Date('1900/01/01');
        this.maxDate = new Date('2013/12/31');
        this.datePanel.activeDisableDate();
    },
    /**
     * 设置可选范围，接受数组与函数如 [startDate, endDate],推荐用[],
     * 也可以用函数过滤
     * @example
     * 禁用所有周一、周二
     * <pre><code>
     *  range: function(year,month,date,day) {
    *    return day > 1;
    * }
     * </code></pre>
     * @method setRange
     * @param {Array , Function} obj
     */
    setRange:function(obj){
        this.initRange(obj);
        this.datePanel.initRange(obj);

        this.currentDate = this.minDate;
        this.setOutputValue('');
        this.datePanel.setCurrentDate(Sui.DateUtil.cloneDate(this.minDate));
    },
    initRange:function(){

        //如果有参数，则会覆盖一遍range
        if(arguments[0]){
            this.range = arguments[0];
        }

        var range = this.range;

        if(range instanceof Array){
            if(range[0]){
                this.minDate = Sui.DateUtil.parseDate(range[0]);
            }
            if(range[1]){
                this.maxDate = Sui.DateUtil.parseDate(range[1]);
            }
        }
    }

});
