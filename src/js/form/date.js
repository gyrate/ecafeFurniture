/**
 * ==========================================================================================
 * 日期组件，该组件的构成为：
 * div
 *   div（切换年份的面板）
 *   div（显示天的面板）
 *   div（显示其他按钮的面板）
 * 如果要选择时间的话，依赖TimeField
 *
 * 可触发的事件包括: beforeRefreshDays, yearChanged
 * ==========================================================================================
 */

/**
 * 日期组件,
 * 继承自Sui.Component
 * @class Sui.Date
 * @extends Sui.Component
 * @constructor
 */

Sui.Date = Sui.extend(Sui.Component, {

    applyToTagName : 'div',

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
    currentDate : null,

    // 年份对应的输入框
    yearField : null,

    // 月份对应的输入框
    monthField : null,

    // 年份选择器
    yearSelect : null,

    // 月份选择器
    monthSelect : null,

    // 当前选择的年份
    currentYearSelect : null,

    // 日对应的所有单元格
    dateTdElements : null,

    /**
     * 数组。包括月份左边导航按钮，月份控件，月份右边导航按钮。
     */
    monthNavElements : null,

    /**
     * 快速选择面板
     */
    quickSelect : null,

    /**
     * 天选择面板
     */
    daysPanel : null,

    /**
     * 今天的按钮
     */
    todayButton : null,
    /**
     * 确定按钮
     */
    sureButton:null,
    /**
     * 是否隐藏确定按钮
     * @property  hiddenSureButton
     * @type {Boolean}
     * @default false
     */
    hiddenSureButton : false,

    /**
     * 隐藏清空按钮
     * @property  hiddenClearButton
     * @type {Boolean}
     * @default false
     */
    hiddenClearButton : false,
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
    specialDates : null,
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
    specailDatesFunction : null,
    /**
     * 日期样式定义
     * @property defaultClass
     * @type {String}
     * @default 'sui_date'
     */
    defaultClass : 'sui_date',
    /**
     * 标题样式定义
     * @property titleClass
     * @type {String}
     * @default 'sui_date_title'
     */
    titleClass : 'sui_date_title',
    /**
     * 日期格式，可以在初始化时指定，
     * 允许格式有 yyyy, yyyy-MM, yyyy-MM-dd,yyyy-MM-dd hh, yyyy-MM-dd hh:mm, yyyy-MM-dd hh:mm:ss 等
     * 日期面板会根据格式的情况进行调整，比如指定dateFormat为yyyy，
     * 则日期面板只出现年份选择器
     * @property dateFormat
     * @type {String}
     * @default 'yyyy-MM-dd'
     */
    dateFormat : 'yyyy-MM-dd',

    timeField : null,
    /**
     * 最小日期,默认为 1900,1,1
     * @property minDate
     * @type {Date}
     * @default new Date('1900/1/1')
     */
    minDate : new Date('1900/1/1'),
    /**
     * 最大日期,默认为 2099,12,31
     * @property maxDate
     * @type {Date}
     * @default new Date('2099/12/31')
     */
    maxDate :  new Date('2099/12/31'),
    /**
     * 日期可选范围，接受数组与函数如 [startDate, endDate],
     * 推荐用['2013/12/12','2014/01/15']这种格式,日期范围不应超过1900,1,1到2099/12/31
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
    /**
     * @private
     * 初始化各种属性
     * @method initProperties
     * @private
     */
    initProperties : function() {
        Sui.Date.superclass.initProperties.apply(this, arguments);
        this.currentDate = new Date();
        this.dateTdElements = [];
    },
    /**
     * @private
     * 初始化配置
     * @private
     * @method initConfig
     * @param {Object} config 配置
     * @param {String} config.dateFormat 日期格式
     * @param {Array} config.specialDates 特殊日期
     * @param {Function} config.specailDatesFunction 过滤特殊日期的函数
     * @param {Boolean} config.hiddenSureButton  是否隐藏确定按钮，默认为false
     * @param {Boolean} config.hiddenClearButton 是否隐藏清空按钮，默认为false
     * @param {Date} config.currentDate 当前日期
     * @param {Date} config.maxDate  最大可选日期
     * @param {Date} config.minDate 最小可选日期
     * @param {Array} config.range 日期可选范围，可以为[Start]
     */
    initConfig : function(config) {
        Sui.Date.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ["dateFormat", "specialDates", "specailDatesFunction",
            "hiddenSureButton", "hiddenClearButton",
            "currentDate", "maxDate", "minDate","range"]);

        if(Sui.isString(this.currentDate)){
            this.currentDate = Sui.DateUtil.convertStrToDate(this.currentDate , this.dateFormat);
        }
        
        this.initRange();
    },
    /**
     * 初始化日期可选范围
     * @method initRange
     *
     */
    initRange:function(){

        //如果有参数，则会覆盖一遍range
        if(arguments[0]){
            this.range = arguments[0];
        }

        var range = this.range;

        if(range instanceof Array ){
            if(range[0]){
                this.minDate = Sui.DateUtil.parseDate(range[0]);
            }
            if(range[1]){
                this.maxDate = Sui.DateUtil.parseDate(range[1]);
            }
        }
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
        this.setCurrentDate( Sui.DateUtil.cloneDate(this.minDate) );
    },
    /**
     * 设置特殊日期
     * @method setSpecialDates
     * @param {String} specialDates 特殊日期
     * @example
     *  <pre><code>
     *     setSpecialDates({
     *         '20130811':{
     *             'background':'@ff00ff'
     *         }
     *     });
     *  </code></pre>
     */
    setSpecialDates : function(specialDates){
       this.specialDates = specialDates;
        if(this.isRendered()){
            this.refreshDays();
        }
    },
    /**
     * 获取当前的年份选择器
     *
     * @method getYearSelectElement
     * @return {String}  返回当前的年份选择器
     */
    getYearSelectElement : function(){
       return this.yearSelect;
    },
    /**
     * 获取当前的月份选择器
     *
     * @method getMonthSelectElement
     * @return {String} 返回当前的月份选择器
     */
    getMonthSelectElement : function(){
       return this.monthSelect;
    },
    /**
     * 获取当前的日期
     * @method getCurrentDate
     * @return {String} 按格式返回当前的日期
     */
    getCurrentDate : function(){
        return this.currentDate;
    },
    /**
     * 设置当前的日期
     * @method setCurrentDate
     * @param {Date} date
     */
    setCurrentDate : function(date){
        this.currentDate = date;
        this.refresh();
    },
    /**
     * 设置日期格式
     *
     * @method getCurrentDate
     * @param {String} 日期格式如，yyyy-MM-dd
     */
    setDateFormat : function(dateFormat) {
        this.dateFormat = dateFormat;
        this.applyDateFormat();
    },
    /**
     * 根据设置的日期格式隐藏或显示相关组件
     * @private
     * @method getCurrentDate
     */
    applyDateFormat : function() {
        if (this.isRendered()) {
            if (this.isSelectYear()) {
                // 隐藏月份导航
                this.setMonthNavVisible(false);
                // 隐藏天选择
                this.daysPanel.hide();
                // 显示快速选择
                this.quickSelect.show();
                // 更改今天按钮
                this.todayButton.val("今年");
            } else if (this.isSelectMonth()) {
                // 显示月份导航
                this.setMonthNavVisible(true);
                // 隐藏天选择
                this.daysPanel.hide();
                // 显示快速选择
                this.quickSelect.show();
                // 更改今天按钮
                this.todayButton.val("当月");

            } else {

                // 显示月份导航
                this.setMonthNavVisible(true);
                // 显示天选择
                this.daysPanel.show();
                // 隐藏快速选择
                this.quickSelect.hide();
                // 更改今天按钮
                this.todayButton.val("今天");
            }

            if (this.isSelectTime()) {

                this.getOrCreateTimeField().setTimeFormat(this.parseTimeFormat());
                this.getOrCreateTimeField().show()
            } else {
                if (this.timeField) {
                    this.timeField.hide();
                }
            }

            this.refresh();
        }
    },
    /**
     *
     */
    parseTimeFormat : function() {
        var dateFormat = this.getDateFormat();
        var h = dateFormat.indexOf('h');
        var timeFormat = dateFormat.substring(h);
        return Sui.StringUtil.trim(timeFormat);
    },
    /**
     * @private
     * 判断是否需要进行“时”选择
     * @method  isSelectTime
     */
    isSelectTime : function() {
        return  Sui.StringUtil.contains(this.dateFormat, 'h');
    },
    /**
     *  @private
     *  判断是否需要进行“年”选择
     *  @method isSelectYear
     */
    isSelectYear : function() {
        return ! Sui.StringUtil.contains(this.dateFormat, 'M');
    },
    /**
     * @private
     * 判断是否需要进行“月”选择
     */
    isSelectMonth : function() {
        return ! Sui.StringUtil.contains(this.dateFormat, 'd') &&
            Sui.StringUtil.contains(this.dateFormat, 'M');
    },

    setMonthNavVisible : function(visible) {
        if (this.monthNavElements) {
            Sui.each(this.monthNavElements, function(element) {
                element.toggle(visible);
            });
        }
    },
    /**
     * 获取日期的格式
     * @method getDateFormat
     */
    getDateFormat : function() {
        return this.dateFormat;
    },
    /**
     * 渲染日期组件
     * @method render
     * @param {DOM} container
     * @param {DOM} insertBefore
     */
    render :  function(container, insertBefore) {

        Sui.Date.superclass.render.apply(this, arguments);

        this.monthNavElements = [];

        var thisDate = this;

        var dateDiv = this.getApplyToElement();

        // 创建切换年月的面板
        var title = $("<div id='dpTitle'></div>").appendTo(dateDiv);
        title.addClass(this.titleClass);

        // 创建年月,左边导航按钮
        var yearLeftNav = $("<div><a></a></div>").addClass("NavImg NavImgll").appendTo(title);
        var monthLeftNav = $("<div><a></a></div>").addClass("NavImg NavImgl").appendTo(title);
        this.monthNavElements.push(monthLeftNav);


        // 创建月份选择面板
        var monthElement = $("<div style='float:left'></div>").appendTo(title);
        var monthSelect = this.monthSelect = $("<div style='display: none; left: 34px;'></div>").appendTo(monthElement).addClass("menuSel MMenu");
        this.renderMonthSelect(monthSelect);

        this.monthNavElements.push(monthElement);

        // 禁止月份输入框获取焦点
        var monthField = this.monthField = $("<input class='yminput'/>").appendTo(monthElement);
        monthField.focus(
            function(e) {
                $(e.target).blur();
            }).click(function(e) {
                var msLeft = monthElement[0].offsetLeft;
                monthSelect.css({left:msLeft}).show();
            });

        // 创建年份选择面板
        var yearElement = $("<div style='float: left;'></div>").appendTo(title);
        var yearSelect = this.yearSelect = $("<div style='display: none; left: 84px;'></div>").appendTo(yearElement).addClass("menuSel YMenu");
        this.renderYearSelect(yearSelect);

        // 禁止年份输入框获取焦点
        var yearFiled = this.yearField = $("<input class='yminput'  readOnly='true' />").appendTo(yearElement);
        yearFiled.focus(
            function(e) {
                $(e.target).blur();
            }).click(function(e) {
                thisDate.currentYearSelect = thisDate.getYear();
                var ysLeft = yearElement[0].offsetLeft;
                yearSelect.css({left:ysLeft});
                thisDate.refreshYearSelect();
            });

        // 创建年月右边导航按钮
        var yearRightNav = $("<div><a href='javascript:void(0);'></a></div>").addClass("NavImg NavImgrr").appendTo(title);
        var monthRightNav = $("<div><a href='javascript:void(0);'></a></div>").addClass("NavImg NavImgr").appendTo(title);

        this.monthNavElements.push(monthRightNav);

        // 导航按钮事件处理
        yearLeftNav.click(function() {
            thisDate.onYearAdd(-1);
        });
        yearRightNav.click(function() {
            thisDate.onYearAdd(1);
        });

        monthLeftNav.click(function() {
            thisDate.onMonthAdd(-1);
        });
        monthRightNav.click(function() {
            thisDate.onMonthAdd(1);
        });
        //针对IE8浏览器，检测到双击事件则再执行一次单击事件处理函数
        if(Sui.isIE8){
            yearLeftNav.dblclick(function() {
                thisDate.onYearAdd(-1);
            });
            yearRightNav.dblclick(function() {
                thisDate.onYearAdd(1);
            });
            monthLeftNav.dblclick(function() {
                thisDate.onMonthAdd(-1);
            });
            monthRightNav.dblclick(function() {
                thisDate.onMonthAdd(1);
            });
        }

        var cellDiv = this.daysPanel = $("<div></div>").appendTo(dateDiv);
        var table = $("<table class='WdayTable' border=0 cellSpacing=0 cellPadding=0 width='100%'></table>").appendTo(cellDiv);

        // 生成一,二,三,四,五,六,日
        var titleTr = $("<tr class='MTitle' align='center'></tr>").appendTo(table);
        var titles = ['一', '二', '三', '四', '五','六','日'];
        Sui.each(titles, function(title) {
            var td = $("<td></td>").appendTo(titleTr);
            td.text(title);
        });

        // 生成每月的天
        var weekDays = 7;
        for (var row = 0; row < 6; row ++) {
            var dayTr = $("<tr></tr>").appendTo(table);
            for (var col = 0; col < weekDays; col++) {
                var td = $("<td></td>").appendTo(dayTr);
                td.html("&nbsp;");

                td.hover(
                    Sui.makeFunction(this, this.onMouseOverDay),
                    Sui.makeFunction(this, this.onMouseOutDay)
                );

                td.click(Sui.makeFunction(this, this.onDayElementClick));

                this.dateTdElements.push(td);
            }
        }

        this.renderQuickSelect(dateDiv);

        // 生成今天
        var buttonsDiv = this.buttonsDiv = $("<div class='dpControl' style='text-align:center'></div>").appendTo(dateDiv);
        var clearButton = $("<input class='dpButton' type='button' value='清空' />").appendTo(buttonsDiv);
        clearButton.click(Sui.makeFunction(this, this.onClearClick));
        var todayButton = this.todayButton = $("<input class='dpButton' type='button' value='今天' />").appendTo(buttonsDiv);
        todayButton.click(Sui.makeFunction(this, this.onTodayClick));
        var sureButton = this.sureButton = $("<input class='dpButton' type='button' value='确定' />").appendTo(buttonsDiv);
        sureButton.click(Sui.makeFunction(this, this.onSureClick));

        clearButton.toggle(! this.hiddenClearButton);
        sureButton.toggle(! this.hiddenSureButton);

        this.refresh();
    },
    /**
     * @private
     * 判断某个日期单元格对应的日期是否禁用
     * @method  isDayDisabled
     * @param {DOM} td
     */
    isDayDisabled : function(td) {
        return Sui.getJQ(td).attr("disabled");
    },
    /**
    * 鼠标悬浮入某日期
     * @method  onMouseOverDay
     * @param {Event} e
     * @private
    */
    onMouseOverDay : function(e) {
        if (! this.isDayDisabled(e.target)) {
            var text = Sui.StringUtil.trim($(e.target).text());
            if (text) {
                Sui.replaceClass($(e.target), "Wday", "WdayOn");
            }
        }
        this.fireEvent('dayMouseOver',new Sui.util.Event({
            target:e.target,
            text:text
        }));
    },
    /**
     * 鼠标悬浮出某日期
     * @method onMouseOutDay
     * @param {Event} e
     * @private
     */
    onMouseOutDay : function(e) {
        if (! this.isDayDisabled(e.target)) {
            var text = Sui.StringUtil.trim($(e.target).text());
            if (text) {
                Sui.replaceClass($(e.target), "WdayOn", "Wday");
            }
        }
        this.fireEvent('dayMouseOut',new Sui.util.Event({
            target:e.target,
            text:text
        }));
    },
    /**
     * 获得时间编辑输入框，没有则创建
     * @method  getOrCreateTimeField\
     * @private
     */
    getOrCreateTimeField : function() {
        if (! this.timeField) {
            this.timeField = new Sui.form.TimeField({
          		renderTo : [
           		 	this.getApplyToElement() , 
          		  	this.buttonsDiv
          	    ],
                hourInfo : {
                    value : this.currentDate.getHours()
                },
                minuteInfo : {
                    value :  Sui.StringUtil.contains(this.dateFormat, 'm') ? this.currentDate.getMinutes() : '00'
                },
                secondInfo : {
                    value :  Sui.StringUtil.contains(this.dateFormat, 's') ? this.currentDate.getSeconds() : '00'
                }
            });
        }
        return this.timeField;
    },
    /**
     * 当清除按钮被点击时的处理函数
     * @method onClearClick
     * @private
     */
    onClearClick : function() {
        this.fireSelectedEvent(true);
    },
    /**
     * @private
     * 今天对应的日期单元格被点击时执行
     * @method  onTodayClick
     */
    onTodayClick : function() {
        this.currentDate = new Date();
        this.refresh();
        this.fireSelectedEvent();
    },
    /**
     * 当确定按钮被点击时的处理函数
     * @method onSureClick
     * @private
     */
    onSureClick : function() {

        if (this.isSelectTime()) {
            // 更新时间
            if (this.timeField) {
                if (this.timeField.isSelectHour()) {
                    var hour = this.timeField.getFieldValue(this.timeField.HOUR);
                    this.currentDate.setHours(parseInt(hour) || 0);
                }

                if (this.timeField.isSelectMinute()) {
                    var minute = this.timeField.getFieldValue(this.timeField.MINUTE);
                    this.currentDate.setMinutes(parseInt(minute) ||  0);
                }

                if (this.timeField.isSelectSecond()) {
                    var second = this.timeField.getFieldValue(this.timeField.SECOND);
                    this.currentDate.setSeconds(parseInt(second) || 0);
                }
            }
        }

        this.fireSelectedEvent();
    },
    /**
     * 渲染快速选择框
     * @method  renderQuickSelect
     * @param {DOM} parent
     */
    renderQuickSelect : function(parent) {
        var quickSelect = this.quickSelect = $("<div></div>").appendTo(parent);
        quickSelect.addClass("quickSelect").hide();

        var tipElement = $("<div></div>").appendTo(quickSelect);
        tipElement.addClass("MTitle");
        tipElement.html("快速选择");

        for (var i = 0; i < 5; i++) {
            var itemSelect = $("<div></div>").appendTo(quickSelect);

            itemSelect.addClass("quickItem").addClass("menu").click(Sui.makeFunction(this, this.onQuickItemClick));
            Sui.hover(itemSelect, "menuOn", "menu");
        }

    },
    /**
     * @private
     * 快速选择项被点击时执行
     * @method  onQuickItemClick
     * @param {Event} e
     */
    onQuickItemClick : function(e) {

        var text = $(e.target).text();

        if (this.isSelectYear()) {
            this.setYear(parseInt(text));
        } else if (this.isSelectMonth()) {
            var yearMonth = Sui.NumberUtil.extractInts(text);
            this.setYear(yearMonth[0]);
            this.setMonth(yearMonth[1]);
        }

        this.fireSelectedEvent();

    },
    /**
     * @private
     * 渲染后执行
     * @method  afterRender
     */
    afterRender : function() {
        Sui.Date.superclass.afterRender.apply(this, arguments);
        this.applyDateFormat();

        $(Sui.getBody()).click(Sui.makeFunction(this, this.onDocClick));
    },
    /**
     * body标签被点击时执行的处理函数
     * @method  onDocClick
     * @param {Event} e
     * @private
     */
    onDocClick : function(e){

        Sui.log("Sui.Date组件处理document点击事件");

        // 如果不是点击年份选择器,则将年份选择器隐藏
        if (! Sui.isChildOf(e.target, this.getYearSelectElement()) && ! Sui.isChildOf(e.target, this.yearField) ) {
            this.getYearSelectElement().hide();
        }

         // 如果不是点击月份选择器,则将月份选择器隐藏
        if (! Sui.isChildOf(e.target, this.getMonthSelectElement())  && ! Sui.isChildOf(e.target, this.monthField) ) {
            this.getMonthSelectElement().hide();
        }

    },
    /**
     * 渲染月下拉选择菜单
     * @method renderMonthSelect
     * @private
    */
    renderMonthSelect  : function(target) {

        var table = $('<table border=0 cellSpacing=0 cellPadding=3 nowrap="nowrap"></table>').appendTo(target);
        for (var row = 0; row < 6; row++) {
            var tr = $("<tr></tr>").appendTo(table);
            for (var col = 0; col < 2; col++) {
                var text = row * 2 + col + 1;
                text = this.convertNumberToChinese(text) + (text < 11 ? '月' : '');
                var td = $("<td class='monthCell'></td>").appendTo(tr).text(text);
            }
        }

        Sui.hoverEach(target.find("td"), "menuOn", "menu");

        var thisDate = this;
        target.find("td").click(function(e) {
            var text = $(e.target).text();

            text = Sui.StringUtil.removeEnd(text, '月');
            var month = thisDate.convertChineseToNumber(text);

            thisDate.setMonth(month);
            target.hide();
        })

    },

    /**
     * @private
     * 刷新年份下拉选择框，设置年下拉选择框中,不同单元格包括的年份的值
     * @method refreshYearSelect
     * @param {Boolean} add
     */
    refreshYearSelect : function(add) {

        if (add) {
            this.currentYearSelect += add;
        }
        var year = this.currentYearSelect;

        var yearSelect = this.yearSelect;

        var table = yearSelect.find('table:eq(0)');
        var tds = table.find("td");
        tds.each(function(i, td) {

            var val = year - 5;
            if (i % 2 == 0) {
                val += Math.div(i, 2);
            } else {
                val = year + Math.div(i - 1, 2);
            }

            $(td).text(val);

        });

        yearSelect.show();
    },
    /**
     * 渲染年份选择下拉菜单
     * @method renderYearSelect
     * @param {DOM} target 下拉菜单的容器
     */
    renderYearSelect : function(target) {
        var table = $('<table border=0 cellSpacing=0 cellPadding=3 nowrap="nowrap"></table>').appendTo(target);
        for (var row = 0; row < 5; row++) {
            var tr = $("<tr></tr>").appendTo(table);
            for (var col = 0; col < 2; col++) {
                var td = $("<td class='yearCell'></td>").appendTo(tr);
            }
        }

        var table2 = $('<table border=0 cellSpacing=0 cellPadding=3 align=center></table>').appendTo(target);
        var tr2 = $('<tr></tr>').appendTo(table2);
        var leftTd = $('<td class="yearButton">←</td>').appendTo(tr2);
        var closeTd = $('<td class="yearButton">×</td>').appendTo(tr2);
        var rightTd = $('<td class="yearButton">→</td>').appendTo(tr2);

        var thisDate = this;
        target.find("td").click(function(e) {
            var text = $(e.target).text();
            if (text == '←') {
                thisDate.refreshYearSelect(-10);
            } else if (text == '→') {
                thisDate.refreshYearSelect(10);
            } else if (text == '×') {
                target.hide();
            } else {
                thisDate.setYear(text);
                target.hide();
            }
        }).hover(function(e){
            $(this).addClass('menuOn');
        },function(){
            $(this).removeClass('menuOn');
        })
    },
    /**
     * 获取当前年份
     * @method getYear
     * @return {number} 返回数字类型的年份yyyy
     * */
    getYear : function() {
        return this.currentDate.getFullYear();
    },
    /**
     * 获取选中年份
     * @method getYear
     * @param {number} year 年份，可以是字符串或数字，格式为yyyy
     * */
    setYear : function(year) {
        year = parseInt(year);
        this.currentDate.setFullYear(year);
        this.refresh();

        this.fireEvent('yearChanged', new Sui.util.Event(this));
    },

    /**
     * 获取当前月份，月份从0开始
     * @method getMonth
     * @return {number} 返回数字类型的月份,1-2位数
     */
    getMonth : function() {
        return this.currentDate.getMonth();
    },

    /**
     * 设置选中的月份，月份从1开始
     *
     * @method setMonth
     * @param {number} month 月份
     */
    setMonth : function(month) {
        this.currentDate.setMonth(month - 1);
        this.refresh();

        this.fireEvent('monthChanged', new Sui.util.Event(this));
    },
    /**
     * 设置选中的日期，从1开始
     * @method setDayOfMonth
     * @param {number} dayOfMonth 日期
     */
    setDayOfMonth : function(dayOfMonth) {
        this.currentDate.setDate(dayOfMonth);
    },
    /**
     * 获取当前日期，即为本月的第几天，从0开始
     *
     * @method getDayOfMonth
     * @return {number}
     */
    getDayOfMonth : function() {
        this.currentDate.getDate();
    },

    setLoadMaskVisible : function(visible){
//        if(! this.loadMask){
//            this.createLoadMask();
//        }
//        this.loadMask.setVisible(visible);
    },

    convertNumberToChinese : function(i) {
        var months = ['零', '一', '二', '三', '四', '五','六','七','八','九','十', '十一','十二'];
        return months[i];
    },
    /**
     * @private
     * 将中文月份转换为数字
     * @param {String} text
     * @return {Number}
     */
    convertChineseToNumber : function(text) {
        var months = ['一', '二', '三', '四', '五','六','七','八','九'];
        var ret = 0;
        if (Sui.StringUtil.startWith(text, "十")) {
            ret = 10;
            text = Sui.StringUtil.removeStart(text, "十");
        }

        ret += Sui.ArrayUtil.indexOf(months, text) + 1;

        return ret;
    },
    /**
     * 刷新头部年份
     * @method refreshYear
     * */
    refreshYear : function() {

        var year = this.getYear();
        this.yearField.val(year);
    },
    /**
     * 刷新头部月份
     * @method refreshMonth
     * */
    refreshMonth : function() {
        var month = this.getMonth();
        var months = ['一', '二', '三', '四', '五','六','七','八','九','十', '十一','十二'];
        this.monthField.val(months[month] + '月');
    },
    /**
     * 刷新日期
     * @method refreshDays
     */
    refreshDays : function() {

        var year = this.getYear();
        var month = this.getMonth();

        var day = this.getDayOfFirstDateOfMonth(this.currentDate);

        var monthMaxDate = Sui.DateUtil.getDaysInMonth(year, month);

        var thisDate = this;

        Sui.each(this.dateTdElements, function(td, i) {

            // 移除禁用样式、当日样式和特殊日期的样式
            td.removeClass("disabledDate");
            td.removeClass("Wselday");
            td.css("background-color", "");

            var date = i - day + 1;
            if (1 <= date && date <= monthMaxDate) {

                td.html(date);

                var enabled = thisDate.checkEnabledDates(year, month + 1, date, i % 7 + 1);
                if (enabled) {
                    //如果是特殊日期，则设定特殊样式
                    thisDate.checkSpecialDates(year, month + 1, date, i % 7 + 1, td);
                    //如果是当前日期，则设定特殊样式
                    thisDate.checkCurrentDate(year, month , date ,td);
                } else {
                    td.addClass("disabledDate");
                }
                td.attr("disabled", !enabled);

            } else {
                td.html("&nbsp;")
            }
        });
    },

    checkCurrentDate:function( year,month,date,td ){
        if (this.currentDate.getFullYear() == year && this.currentDate.getMonth() == month && this.currentDate.getDate() == date) {
            this.applyAttrs({'class':'Wselday'}, td);
        }
    },
    /**
     * @private
     * 判断是否是可用的日期，月份从1开始
     * @method checkEnabledDates
     * @param {Number} year  年
     * @param {Number} month 月
     * @param {Number} date  日
     * @param {Number} day   星期
     */
    checkEnabledDates : function(year, month, date,day) {

        if (! this.checkMaxDate(year, month, date)) {
            return false;
        }
        if(! this.checkMinDate(year, month, date)){
            return false;
        }
        //通过函数确定是否可用
        if( this.range instanceof Function){
            return this.range(year, month, date,day);
        }
        return true;
    },

    /**
     * 检测是否超出最大日期，月份从1开始
     * @method checkMaxDate
     * @param {Number} year
     * @param {Number} month
     * @param {Number} date
     * @return {boolean}
     */
    checkMaxDate : function(year, month, date) {
        if (this.maxDate) {
            if (Sui.DateUtil.compareDate([this.maxDate.getFullYear(), this.maxDate.getMonth(), this.maxDate.getDate()],
                [year, month - 1, date]) >= 0) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    },

    /**
     * @private
     * 检测是否超出最小日期，月份从1开始
     * @method checkMinDate
     * @param {Number} year
     * @param {Number} month
     * @param {Number} date
     * @return {boolean}
     */
    checkMinDate : function(year, month, date) {
        if (this.minDate) {
            if (Sui.DateUtil.compareDate([this.minDate.getFullYear(), this.minDate.getMonth(), this.minDate.getDate()],
                [year, month - 1, date]) <= 0) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    },
    /**
     * 激活被禁用的日期
     * @method activeDisableDate
     *
     */
    activeDisableDate:function() {
        this.range = [];
        this.minDate = new Date('1900/01/01');
        this.maxDate = new Date('2013/12/31');
        this.refresh();
    },
    /**
     * 刷新快速选择面板
     * @method refreshQuickSelect
     */
    refreshQuickSelect : function() {

        var quickItems = this.quickSelect.children(".quickItem");

        if (this.isSelectYear()) {
            var year = this.getYear();
            year -= 2;

            for (var i = 0; i < 5; i++) {
                quickItems.eq(i).html(year + i);
                var enable = this.checkEnabledDates(year + i),
                item = quickItems.eq(i);
                item.toggleClass("disabledDate",!enable)
            }
        } else if (this.isSelectMonth()) {

            var initYear = this.getYear();
            var initMonth = this.getMonth() + 1;

            for (var i = 0; i < 5; i++) {
                var item = quickItems.eq(i);
                // 计算年和月
                var yearMonth = Sui.DateUtil.calcYearMonth(initYear, initMonth, i - 2);
                var enable = this.checkEnabledDates(yearMonth[0],yearMonth[1]);

                item.html(yearMonth[0] + "年" + yearMonth[1] + "月");
                item.toggleClass('disabledDate',!enable);
            }

        }

    },
    /**
     * 刷新日期组件
     * @method refresh
     */
    refresh : function() {

        this.refreshYear();

        if (! this.isSelectYear()) {
            this.refreshMonth();
        }

        if (! this.isSelectYear() && !this.isSelectMonth()) {
            this.refreshDays();
        }

        if (this.isSelectYear() || this.isSelectMonth()) {
            this.refreshQuickSelect();
        }

        this.refreshButtonsDiv();
    },
    /**
     * 刷新底部按钮,如果今天、当月或今年不在可选范围内则按钮失效
     * @method  refreshButtonsDiv
     */
    refreshButtonsDiv:function(){

        var today = new Date(),
            curr = this.currentDate,
            enableToday = true,
            enableCurrentDate = true;

        if (! this.isSelectYear() && !this.isSelectMonth()) {
            enableToday = this.checkEnabledDates(today.getFullYear(), today.getMonth() + 1, today.getDate());
            enableCurrentDate = this.checkEnabledDates(curr.getFullYear(), curr.getMonth() + 1, curr.getDate());
        }
        if (this.isSelectYear()) {
            enableToday = this.checkEnabledDates(today.getFullYear());
            enableCurrentDate = this.checkEnabledDates(curr.getFullYear());
        }
        if(this.isSelectMonth()){
            enableToday = this.checkEnabledDates(today.getFullYear(), today.getMonth()+1);
            enableCurrentDate = this.checkEnabledDates(curr.getFullYear(), curr.getMonth()+1);
        }

        this.todayButton.attr('disabled',!enableToday);
        this.sureButton.attr('disabled',!enableCurrentDate);
    },
    /**
     * @private
     * 判断是否特殊日期,
     * month从1开始
     * day从1开始, 星期一的值为1,星期天的值为7
     * @method checkSpecialDates
     * @param {Number} year
     * @param {Number} month
     * @param {Number} date
     * @param {DOM}  td
     */
    checkSpecialDates : function(year, month, date, day, td) {
        if (this.specialDates) {
            var key = year * 10000 + (month) * 100 + date;
            var props = this.specialDates[key];
            this.applyAttrs(props, td);
        }

        if (this.specailDatesFunction) {
            var props = this.specailDatesFunction(year, month, date, day, this);
            this.applyAttrs(props, td);
        }
    },
    /**
     *  为特殊日期设置特定样式属性
     * @method  applyAttrs
     * @param {Object} props
     * @param {DOM} td
     * @private
     *
     */
    applyAttrs : function(props, jq) {
        if (props) {
            for (var p in props) {
                var pv = props[p];
                if (p == 'class') {
                    jq.addClass(pv);
                } else {
                    jq.css(p, pv);
                }
            }
        }
    },
    /**
     * @private
     * 添加年份时执行
     * @method onYearAdd
     * @param {Number} years 添加年份数量
     */
    onYearAdd : function(years) {

        var date = Sui.DateUtil.cloneDate( this.currentDate );
        date = Sui.DateUtil.addYears(date, years);

            this.currentDate = date;
            this.refresh();
            this.fireEvent('yearChanged', new Sui.util.Event(this));

    },
    /**
     * @private
     * 添加月份时执行
     * @method onMonthAdd
     * @param {Number} months 添加月份数量
     */
    onMonthAdd : function(months) {

        var date = Sui.DateUtil.cloneDate( this.currentDate );
        date = Sui.DateUtil.addMonths(date, months);

            Sui.DateUtil.addMonths(this.currentDate, months);
            this.refresh();
            this.fireEvent('monthChanged', new Sui.util.Event(this));

    },
    /**
     * @private
     * 当表格项被点击
     * @param {Event} e
     */
    onDayElementClick : function(e) {

        // 获取天所在单元格
        var dayElement = Sui.findFirstAncestorByName($(e.target), "td");

        if(this.isDayDisabled(dayElement)){
            return ;
        }

        // 获取是第几个单元格
        var index = -1;
        for (var i = 0; i < this.dateTdElements.length; i++) {
            if (Sui.equals(dayElement, this.dateTdElements[i])) {
                index = i;
                break;
            }
        }

        if (index != -1) {
            var day = this.getDayOfFirstDateOfMonth(this.currentDate);
            var dayOfMonth = index - day + 1;

            // 如果点击空白地区,则不允许
            if(1 <= dayOfMonth && dayOfMonth <= Sui.DateUtil.getDaysInMonth(this.getYear(), this.getMonth())){
                this.setDayOfMonth(dayOfMonth);
                this.fireSelectedEvent();
                // 如果不选择时间的话,则触发已选择事件
                if (this.isSelectTime()) {
                	this.setCurrentDate(this.currentDate);
                }else {
                	this.fireSelectedEvent();
                }
            }
        }
    },
    /**
     * @private
     * 触发选择事件
     * @method  fireSelectedEvent
     * @param {Boolean} clear 如果clear为true，表示清空事件内容
     *
     */
    fireSelectedEvent : function(clear) {
        this.setCurrentDate(this.currentDate);
        if (clear) {
            this.fireEvent("selected", new Sui.util.Event({
                date : "",
                value : ""
            }));
        } else {
            this.fireEvent("selected", new Sui.util.Event({
                date : this.currentDate,
                value : Sui.DateUtil.format(this.currentDate, this.dateFormat)
            }));
        }
    },

    /**
     * @private
     * 获取单元格元素对应的日期
     * @method getDateByDateElementIndex
     * @param {Number} i 单元格号码，从0开始
     * @return {number}
     */
    getDateByDateElementIndex : function(i) {
        var day = this.getDayOfFirstDateOfMonth(this.currentDate);
        return  i - day + 1;
    },

    /**
     * @private
     *  获取每月一号是星期几。
     *  如果一号是星期一(day的值为0)，那第一个单元格的值就是1。
     *  @method getDayOfFirstDateOfMonth
     *  @param {Date}
     *  @return {Number}
     */
    getDayOfFirstDateOfMonth : function(date) {
        var day = Sui.DateUtil.getFirstDateOfMonth(date).getDay();
        // 星期天,day的值为0
        if (day == 0) {
            day = 6;
        } else {
            day--;
        }
        return day;
    }

});
