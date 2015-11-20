/**
 * ==========================================================================================
 * suibase.js
 * 所有组件的功能调用，都是通过方法调用。不能直接操作组件的属性。
 * ==========================================================================================
 */

/**
 * Sui组件的常量
 */
// Layer组件z-index属性的默认值
Sui.ZINDEX_LAYER = 20;
// List的最大高度默认值
Sui.LIST_MAX_HEIGHT = 150;
Sui.LIST_MIN_WIDTH = 128;

var cssPropties = [
    'background-attachment', 'background-color', 'background-image', 'background-position', 'background-repeat',
    'background', 'border', 'border-bottom', 'border-bottom', 'color',
    'border-bottom', 'style', 'border-bottom', 'width', 'border-break',
    'border-collapse', 'border-color', 'border-left', 'border-image', 'border-left',
    'color', 'border-left', 'style', 'border-left', 'width',
    'border-radius', 'border-right', 'color', 'border-right', 'style',
    'border-right', 'width', 'border-right', 'border-spacing', 'border-style',
    'border-top', 'border-top', 'color', 'border-top', 'style',
    'border-top', 'width', 'border-width', 'bottom', 'caption-side',
    'clear', 'clip', 'color', 'content', 'counter-increment',
    'counter-reset', 'cue-after', 'cue-before', 'cue', 'cursor',
    'direction', 'display', 'elevation', 'empty-cells', 'float',
    'font-family', 'font-size', 'font-style', 'font-variant', 'font-weight',
    'font', 'height', 'left', 'letter-spacing', 'line-height',
    'list-style', 'image', 'list-style', 'position', 'list-style',
    'type', 'list-style', 'margin-right', 'margin-left', 'margin-top',
    'margin-bottom', 'margin', 'max-height', 'max-width', 'min-height',
    'min-width', 'opacity', 'orphans', 'outline-color', 'outline-style',
    'outline-width', 'outline', 'overflow', 'padding-top', 'padding-right',
    'padding-bottom', 'padding-left', 'padding', 'page-break', 'after',
    'page-break', 'before', 'page-break', 'inside', 'pause-after',
    'pause-before', 'pause', 'pitch-range', 'pitch', 'play-during',
    'position', 'quotes', 'richness', 'right', 'speak-header',
    'speak-numeral', 'speak-punctuation', 'speak', 'speech-rate', 'stress',
    'table-layout', 'text-align', 'text-decoration', 'text-indent', 'text-transform',
    'top', 'unicode-bidi', 'vertical-align', 'visibility', 'voice-family',
    'volume', 'white-space', 'widows', 'width', 'word-spacing',
    'z-index'];
Sui.cssProperties = new Sui.util.HashSet();

Sui.each(cssPropties, function (propName) {
    Sui.cssProperties.add(propName);
});

/**
 * Sui.ComponentManager用来管理所有创建的组件。将创建的组件与JQuery元素绑定。
 * 将创建的组件绑定到JQuery元素的data中。
 * @class Sui.ComponentManager
 * @static
 */
Sui.ComponentManager = {

    componentKey: 'suiComponent',

    /**
     * 根据元素id获取对应的组件
     * @method getComponent
     * @param {String} id
     * @return {$DOM}
     */
    getComponent: function (id) {
        var jq = Sui.getJQ(id);
        return jq.data(Sui.ComponentManager.componentKey);
    },
    /**
     * 注册组件，使它能够被 Sui.ComponentManager 控制
     * @method registerComponent
     * @param {Mixed} comp 组件
     */
    registerComponent: function (comp) {
        // applyToElement是必须存在的
        if (comp.getApplyToElement()) {
            comp.getApplyToElement().data(Sui.ComponentManager.componentKey, comp);
        } else {
            throw Sui.errorFormat("组件{0}没有对应的applyToElement", comp.getComponentId());
        }

    }

};

//与浏览器尺寸、焦点相关的Sui方法
Sui.apply(Sui, {

    /**
     * 请求json格式的数据
     * @class Sui
     * @method getJsonData
     * @param {String,Object} url 请求模板路径,或请求配置参数，如{ type: 'GET' | 'POST' , url:'...', data:{{Object,Array,String}} , dataType:'json'}
     * @param {Function} callback 回调函数
     * @param {Function} errorCallback 出错时回调函数
     */
	getJsonData : function(url, callback,errorCallback){

        var _type = 'GET',
            _dataType = 'json' ,
            _data = null ,
            _url;

        if (typeof  url == "string") {
            _url = url
        } else {
            //如果url的格式为Object
            _type = url['type'] || 'GET';
            _dataType = url['dataType'] || 'json';
            _data = url['data'];
            _url = url['url'];
        }

        // 通过ajax提交数据，最好采用POST方式。采用GET方式，中文会出现乱码。
        var requestConfig = {
            type: _type,
            url: _url,
            dataType: _dataType,
            data:_data,
            success: function (ajaxMessage) {
                ajaxMessage = Sui.convertIfNotJSON(ajaxMessage);
                callback(ajaxMessage);
            },
            error: function (request, status, err) {
                errorCallback && errorCallback({status:status, error:err});
            }
        };
        $.ajax(requestConfig);
    },
    
    /**
     * 如果数据是字符串,则转换成对象
     * @class Sui
     * @method convertIfNotJSON
     * @param {String} ajaxMessage
     * @return {Object}
     */ 
    convertIfNotJSON: function (ajaxMessage) {
        if (Sui.isString(ajaxMessage)) {
            return jQuery.evalJSON(ajaxMessage);
        }
        return ajaxMessage;
    },
    
    /**
     * 将焦点放在jq对象上,
     * 在IE中, 某些状态下的元素不能获取焦点
     * @class Sui
     * @method focusIfCan
     * @param {$DOM} jq
     */
    focusIfCan : function(jq){
        if(jq.attr("type") == "hidden" || jq.attr("display") == "none" || jq.attr("disabled")){
            return ;
        }
        jq.focus();
    },
    /**
     * 调整元素的高度,使其他元素保持可见。
     * 判断页面内容高度是否比窗口高度大，如果大的话，则减少ele的大小。
     * @method adjustHeightToKeepOtherInView
     * @param {DOM} ele 组件
     * @param {DOM} scrollElement 带滚动条的容器
     */
    adjustHeightToKeepOtherInView: function (ele, scrollElement) {
        ele = Sui.getJQ(ele);

        var subHeight = this.getElementScrollLength(scrollElement);
        if (subHeight > 0) {
            subHeightSetOverflowAuto(ele, subHeight);
        }

        function subHeightSetOverflowAuto(ele) {
            var oldHeight = ele.height();
            var newHeight = oldHeight - (subHeight);
            ele.height(newHeight);
            ele.css("overflow", "auto");

            Sui.logFormat("元素旧的高度={0},新的高度={1}", oldHeight, newHeight);
        }
    },

    /**
     * 获取元素的未显示的滚动区域高度
     * @method getElementScrollLength
     * @param scrollElement
     * @return {Number}
     */
    getElementScrollLength: function (scrollElement) {

        if (Sui.isEmpty(scrollElement)) {
            return this.getWindowScrollLength();
        } else {
            scrollElement = Sui.getJQ(scrollElement);
            var scrollHeight = scrollElement[0].scrollHeight;
            var eleHeight = scrollElement.height();
            Sui.logFormat("元素高度={0},整个区域,包含滚动区域的高度={1}", eleHeight, scrollHeight);

            return scrollHeight - eleHeight;
        }
    },
    /**
     * 获取窗口的未显示的滚动区域高度
     * @method getWindowScrollLength
     * @return {Number}
     */
    getWindowScrollLength: function () {

        var windowHeight = $(window).height();
        var docHeight = Sui.getJQ(Sui.getBody()).height();
        Sui.logFormat("窗口高度={0},页面文档的高度={1},滚动条高度={2}", windowHeight, docHeight);
        var subHeight = docHeight - windowHeight;
        return subHeight;
    },

    /**
     * 存储元素的状态,比如，某元素的初始状态为display:none,将其储存在data中
     * @method storeState
     * @param {$DOM} jq jQuery元素
     * @param {String} attrName 状态名
     */
    storeState : function(jq, attrName){
       jq.data("suiStoreState", {
           attrName : jq.attr(attrName)
       });
    },
    /**
     * 恢复元素某个属性的初始值，比如
     * 元素A初始状态为display:none,在执行一系列操作后，display属性已不是初始值，
     * 如果要display属性恢复到初始值，则可用该方法
     * @method restoreState
     * @param {$DOM} jq
     * @param {String} attrName
     */
    restoreState : function(jq, attrName){
        var keyValues = jq.data("suiStoreState");

        // 如果将undefined设置到disabled,也会有问题.
        if(Sui.isDefinedAndNotNull(keyValues[attrName])){
            jq.removeAttr(attrName);
        }else {
            jq.attr(attrName, keyValues[attrName]);
        }
    },
    /**
     * 获取元素的左右margin值
     * @method getMargins
     * @param {$DOM} ele
     */
    getMargins: function (ele) {

        return parseMargin(ele, "margin-right") + parseMargin(ele, "margin-left");

        function parseMargin(ele, attrName){
            var width = ele.css("margin-right");
            if(Sui.isUndefinedOrNull(width)){
                return 0;
            }
            return parseInt(width);
        }
    },

    /**
     * 深度拷贝属性. 会打断链接.
     * @method deepCopy
     * @param object
     *
     */
    deepCopy: function (object) {
        if (object === undefined) {
            return undefined;
        } else if (object === null) {
            return null;
        }
        return jQuery.evalJSON(jQuery.toJSON(object));
    },
    /**
     * 通过id获取元素
     * @method getComponent
     * @param {String} id
     */
    getComponent: function (id) {
        return Sui.ComponentManager.getComponent(id);
    },

    /**
     * 获取光标的位置
     * @method getCursortPosition
     * @param {DOM} ctrl
     * @return {Number} 返回值可能为1,2,3...n,分别代表第n个可聚焦的控件
     */
    getCursortPosition: function (ctrl) {

        var CaretPos = 0;
        // IE Support
        if (document.selection) {
            ctrl.focus();
            var Sel = document.selection.createRange();
            Sel.moveStart('character', -ctrl.value.length);
            CaretPos = Sel.text.length;
        }
        // Firefox support
        else if (ctrl.selectionStart || ctrl.selectionStart == '0'){
            CaretPos = ctrl.selectionStart;
        }
        return (CaretPos);
    },

    /**
     * 设置光标位置
     * @method setCursorPosition
     * @param  {DOM} ctrl
     * @param {Number} pos 参数值可能为1,2,3...n,分别代表第n个可聚焦的控件
     */
    setCursorPosition: function (ctrl, pos) {
        if (ctrl.setSelectionRange) {
            ctrl.focus();
            ctrl.setSelectionRange(pos, pos);
        }
        else if (ctrl.createTextRange) {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    },

    /**
     * 获取可见区域宽度
     * @method getClientWidth
     * @return {Number}
     */
    getClientWidth: function () {
        var w = document.documentElement.clientWidth;
        Sui.log("可见区域宽度的值为:" + w);
        return w;
    },

    /**
     * 获取可见区域的高度
     * @method getClientHeight
     * @return {Number}
     */
    getClientHeight: function () {
        var h = document.documentElement.clientHeight;
        Sui.log("可见区域高度的值为:" + h);
        return h;
    },
    /**
     * 获得所有匹配name属性值的input元素
     * @method getInputElement
     * @param {String} inputName
     * @param {DOM} context 可限定搜索范围,比如在表单form内
     * @return {Array}
     */
    getInputElement: function (inputName, context) {
        return $('input[name="' + inputName + '"]', context);
    },
    /**
     * 获得所有input元素的值
     * @method getValues
     * @param {Array} inputElements
     * @return {Array} 由input值组成的数组，如['apple','boy','cat']
     */
    getValues: function (inputElements) {
        var ret = [];
        inputElements.each(function (i, input) {
            ret.push($(input).val());
        });
        return ret;
    },
    /**
     * 使事件中的当前元素失去焦点
     * @method blurOnFocus
     * @param {Event} e
     */
    blurOnFocus: function (e) {
        $(e.target).blur();
    },
    /**
     * 在textfield中按回车键，将触发对应的button的点击事件
     * @method bindTextReturnToButtonClick
     * @paran {$DOM} textfield
     * @param {$DOM} button
     */
    bindTextReturnToButtonClick: function (textfield, button) {
        textfield.bind('keyup', 'return', function () {
            button.click();
        });
    },
    /**
     * 获取元素的第一个子元素
     * @method getFirstChild
     * @param {DOM} element
     * @return {Array} 返回只有一个成员的数组，该成员是jQ封装过的子元素
     */
    getFirstChild: function (element) {
        return this.getJQ(element).children(":first-child");
    },

    /**
     * 设置元素的值，如果是input元素,则设置value属性。否则采用text方法。
     * 采用该方法，在切换元素时，不需要修改代码。
     * 比如我们之前采用input元素实现，后来我们又修改成div元素。
     * @method setValue
     * @param {$DOM} element
     * @param {String} value
     */
    setValue: function (element, value) {
        if (element[0].tagName.toLowerCase() == 'input') {
            element.val(value);
        } else {
            element.text(value);
        }
    },
    /**
     * 设置元素（包含内补丁padding、边框border）的宽度
     * @example
     *  <pre><code>
     *    Sui.setOuterWidth($div,400);
     *    //假如$div的内补丁为20，边框宽度为10，则$div的实际宽度 = 400-20*2-10*2 = 340
     *  </code></pre>
     * @method setOuterWidth
     * @param {$DOM} element
     * @param {Number} outerWidth
     */
    setOuterWidth: function (element, outerWidth) {
        var borderPaddingWidth = element.outerWidth() - element.width();
        element.width(outerWidth - borderPaddingWidth);
    },
    /**
     * 设置元素（包含内补丁padding、边框border）的高度度,
     * 使用方法可参考 setOuterWidth
     * @method setOutHeight
     * @param {$DOM} element
     * @param {Number} outerHeight
     */
    setOuterHeight: function (element, outerHeight) {
        var borderPaddingHeight = element.outerHeight() - element.height();
        element.height(outerHeight - borderPaddingHeight);
    },
    /**
     * 获取元素属下能够匹配条件的元素，
     * 可设置是否需要排除自身
     * @method findFirstAncestorBySelector
     * @param {DOM} dom 元素
     * @param {String} selector 选择条件
     * @param {Boolean} excludeSelf 是否排除自己，默认为false，即不排除
     * @return {$DOM}
     */
    findFirstAncestorBySelector: function (dom, selector, excludeSelf) {
        if (!excludeSelf) {
            var filter = Sui.getJQ(dom).filter(selector);
            if (filter.size() > 0) {
                return filter;
            }
        }
        return Sui.getJQ(dom).parents(selector).first();
    },

    /**
     * 查找第一个祖先元素，祖先元素的标签名称为elementName
     * @method findFirstAncestorByName
     * @param {DOM} dom
     * @param {String} elementName 标签名称
     * @param {Boolean} excludeSelf 是否排除自身，默认为false,即不排除自身
     * @return {$DOM}
     */
    findFirstAncestorByName: function (dom, elementName, excludeSelf) {

        if (!excludeSelf) {
            if (Sui.getTagName(dom) == elementName) {
                return dom;
            }
        }
        return Sui.getJQ(dom).parents(elementName).first();
    },
    /**
     * 判断是否css属性
     * @isCssProperty
     * @param {String} name
     * @return {Boolean}
     */
    isCssProperty: function (name) {
        return Sui.cssProperties.contains(name);
    },

    /**
     * html编码，比如将<a> 转换成&lt;a&gt
     * @mehtod htmlEncode
     * @param {String} text
     * @return {String}
     */
    htmlEncode: function (text) {
        var divEle = $("<div></div>").text(text);
        var text = divEle.html();
        divEle.remove();
        return text;
    },

    /**
     * html解码，比如将&lt;a&gt转换成<a>
     * @method htmlDecode
     * @param {String} text
     * @return {DOM}
     */
    htmlDecode: function (text) {
        var divEle = $("<div></div>").html(text);
        var text = divEle.text();
        divEle.remove();
        return text;
    },
    /**
     * 获取窗口body标签
     * @method getBody
     * @return {DOM}
     */
    getBody: function () {
        var DOC = document;
        return (DOC.body || DOC.documentElement);
    },
    /**
     * 通过表签名创建元素
     * @method createElementByTagName
     * @param {String} tagName
     */
    createElementByTagName: function (tagName) {
        if (tagName == "input") {
            tagName = "<" + tagName + " />";
        } else {
            tagName = "<" + tagName + "></" + tagName + ">";
        }
        return tagName;
    },

    /**
     * 插入元素，可设置放置在哪一个元素之前
     * @method appendOrBefore
     * @param {String} html
     * @param {$DOM} container  被放置元素的父容器
     * @param {$DOM} insertBefore 被放置元素的后一个元素
     */
    appendOrBefore: function (html, container, insertBefore) {
        if (insertBefore && insertBefore.size() > 0) {
            insertBefore.before(html);
        } else {
            container.append(html);
        }
    },

    /**
     * 获取元素queryDom在jq集中中的位置，
     * 如果不存在jq集中，则返回-1
     * @method indexOf
     * @param {Array} jq
     * @param {DOM,$DOM} queryDom
     * @return {Number}
     */
    indexOf: function (jq, queryDom) {
        queryDom = Sui.getDom(queryDom);

        var ret = -1;
        jq.each(function (index, dom) {
            if (dom == queryDom) {
                ret = index;
                return false;
            }
        });
        return ret;
    },

    /**
     * 在parentJQ下的子元素中查找与事件e的目标对象相同，并且符合选择器selector，的元素。
     * @method getTarget
     * @param {Event} e
     * @param {String} selector
     * @param {$DOM} parentJQ
     */
    getTarget: function (e, selector, parentJQ) {
        var target = null;
        $(selector, parentJQ).each(function (i, dom) {
            if (dom === e.target) {
                target = dom;
                return false;
            }
        });
        return target;
    },
    /**
     * 判断两个元素是否相同
     * @param {DOM,$DOM} dom
     * @param {DOM,$DOM} dom2
     * @return {Boolean}
     */
    equals: function (dom, dom2) {

        return Sui.getDom(dom) == Sui.getDom(dom2);
    },

    /**
     * 判断元素dom是否包含在元素集doms中
     * @param {Array} doms
     * @param {DOM} dom
     * @return (Boolean)
     */
    containsDom: function (doms, dom) {
        var ret = false;
        Sui.each(doms, function (item) {
            if (Sui.equals(item, dom)) {
                ret = true;
            }
        });
        return ret;
    },

    /**
     * 判断元素child是否doms中中某个元素的子元素
     * @method isSomeChildOf
     * @param {DOM} child
     * @param {Array,DOM} doms
     */
    isSomeChildOf: function (child, doms) {
        doms = Sui.ArrayUtil.itemToArray(doms);
        var ret = false;
        Sui.each(doms, function (dom) {
            if (Sui.isChildOf(child, dom)) {
                ret = true;
                return false;
            }
        });
        return ret;
    },
    /**
     * 判断元素child是否元素parent的子元素
     * @method isChildOf
     * @param {String} child  元素id
     * @param {String} parent  元素id
     * @return {Boolean}
     */
    isChildOf: function (child, parent) {
        child = this.getJQ(child);
        parent = this.getJQ(parent);

        var tempParent = child;

        // 比较自己
        if (this.equals(tempParent, parent)) {
            return true;
        }

        // 比较父节点
        tempParent = tempParent.parent();
        while (tempParent.size() > 0) {
            if (this.equals(tempParent, parent)) {
                return true;
            }
            tempParent = tempParent.parent();
        }

        return false;
    },
    /**
     * 将输入框设置为只读状态
     * @method setReadOnly
     * @param {String} input  元素id
     *
     */
    setReadOnly: function (input) {
        input = Sui.getJQ(input);
        input.attr("readOnly", true);
        input.focus(function () {
            input.blur();
        });
    },
    /**
     * 判断元素是否失效
     * @method isDisable
     * @param {$DOM} jq
     * @return {Boolean}
     */
    isDisabled: function (jq) {
        return !!jq.attr("disabled");
    },
    /**
     * 将元素设置为失效
     * @method setDisabled
     * @param {$DOM} jq
     * @param {Boolean} disabled
     *
     */
    setDisabled: function (jq, disabled) {
        jq.attr("disabled", !!disabled);
    },

    /**
     * 获取被选中的元素
     * @method getCheckedElements
     * @param  {String} checkboxName 可指定checkbox的name属性值
     * @param  {$DOM , DOM} context 可指定查找范围
     * @return {Array}
     */
    getCheckedElements: function (checkboxName, context) {
        if (context) {
            if (checkboxName) {
                return $("input[name=" + checkboxName + "]:checked", context);
            } else {
                return $("input:checked", context);
            }
        } else {
            if (checkboxName) {
                return $("input[name=" + checkboxName + "]:checked");
            } else {
                return $("input:checked");
            }
        }
    },
    /**
     * 获取name属性与指定值匹配的元素的value值
     * @method getValueByName
     * @param {String} name
     * @return {String}
     */
    getValueByName: function (name) {
        var elements = document.getElementsByName(name);
        var val = "";
        this.forEach(elements, function (element) {
            if (element.name == name) {
                val = element.value;
                return false;
            }
            return true;
        }, true) ;
        return val;
    },
    /**
     * 获取id属性与指定值匹配的元素的value值
     * @method getValueById
     * @param {String} id
     * @return {String}
     */
    getValueById: function (id) {
        var ele = document.getElementById(id);
        if (ele) {
            return ele.value;
        }
        return "";
    },

    /**
     * 根据名称和值,查找并选中单选框.
     * @method getValueById
     * @param {String} id
     * @return {String}
     */
    checkedRadio : function(radioName, radioValue, context){
        $("input:[name=" + radioName + "][value=" + radioValue + "]", context).attr("checked", true);
    },

    /**
     * 获取选中的Radio的值
     * @method  getCheckedRadioValue
     * @param {String} name
     * @return {String}
     */
    getCheckedRadioValue: function (name, context) {
        // 包含特殊字符
        if (name.contains(".")) {
            var val = "";
            var radios = $("input[type=radio]:checked", context);
            this.forEach(radios, function (radio) {
                if (radio.name == name) {
                    val = radio.value;
                    return false;
                }
                return true;
            }, true);
            return val;

        } else {
            return $("input[name=" + name + "]:checked", context).val();
        }
    },

    /**
     * 监听单选框的change事件
     * @method onRadioChange
     * @param {String} radioName  单选框的name值
     * @param {String} func change事件触发时执行函数
     */
    onRadioChange: function (radioName, func) {
        $("input[name=" + radioName + "]").change(function () {
            func(this);
        });
    },

    /**
     * 初始化通过Radio控制的tab面板.
     * @method initRadioTab
     * @param radioName 单选按钮的名称
     * @param array  一个数组,每个元素都是一个对象,包含radioValue属性(radio的值)和elementId属性(被控制元素的id).
     */
    initRadioTab: function (radioName, array) {

        this.onRadioChange(radioName, function (radio) {
            changeElementVisible($(radio).val());
        });

        var selectedValue = this.getCheckedRadioValue(radioName);
        changeElementVisible(selectedValue);

        // 根据选中的Radio的值,显示与该值关联的元素,隐藏其他元素.
        function changeElementVisible(selectedValue) {
            Methods.forEach(array, function (item) {
                if (item.radioValue == selectedValue) {
                    // 显示
                    if (item.elementId) {
                        $("#" + item.elementId).show();
                    }
                } else {
                    // 隐藏
                    if (item.elementId) {
                        $("#" + item.elementId).hide();
                    }
                }
            })
        }
    },

    ID: 0,
    /**
     * 生成唯一的ID, 注意JQuery的选择器中,不能包含特殊的字符.
     * @method generateId
     * @return {String}
     */
    generateId: function () {
        return (this.ID++) + "_sui_uniqueid_gen";
    },
    /**
     * 生成唯一的class
     * @method generateUniqueClass
     * @return {String}
     */
    generateUniqueClass: function () {
        return (this.ID++) + "_sui_dragclass_gen";
    },

    /**
     * 处理jq中的每个元素
     * @method hoverEach
     * @param {Array} jq 由DOM元素组成的数组
     * @param {String} onClass 鼠标悬浮时的样式
     * @param {String} leaveClass 鼠标离开时的样式
     */
    hoverEach: function (jq, onClass, leaveClass) {
        for (var i = 0; i < jq.size(); i++) {
            this.hover(jq.eq(i), onClass, leaveClass);
        }
    },

    /**
     * 处理单个元素的hover交互
     * @method hover
     * @param {$DOM} jq
     * @param {String} onClass 鼠标悬浮时的样式
     * @param {String} leaveClass 鼠标离开时的样式
     */
    hover: function (jq, onClass, leaveClass) {

        jq.hover(function (e) {
            Sui.replaceClass(jq, leaveClass, onClass);
        }, function (e) {
            Sui.replaceClass(jq, onClass, leaveClass);
        });

    },
    /**
     * 设置checkbox的选中状态
     * @method setChecked
     * @param {DOM,$DOM} checkbox
     * @param  {Boolean} checked
     *
     */
    setChecked: function (checkbox, checked) {
        if (Sui.isUndefined(checked)) {
            checked = true;
        }
        this.getJQ(checkbox).attr("checked", checked);
    },
    /**
     * 判断checkbox是否选中
     * @mehtod isChecked
     * @param  {DOM,$DOM} checkbox
     * @param {Boolean} checked true为判断选中状态，反之判断未选中状态
     * @return {Boolean}
     */
    isChecked: function (checkbox, checked) {
        if (Sui.isUndefined(checked)) {
            checked = true;
        }
        return !!this.getJQ(checkbox).attr("checked") == !!checked;
    },

    /**
     * 判断checkboxs中所有的checkbox的checked属性的值都等于checked
     * @method isAllChecked
     * @param {Array} checkboxs
     * @param {Boolean} checked
     * @return {Boolean}
     */
    isAllChecked: function (checkboxs, checked) {
        checked = !!checked;
        var ret = true;
        Sui.each(checkboxs, function (checkbox) {
            if (checkbox) {
                if (!Sui.isChecked(checkbox, checked)) {
                    ret = false;
                    return false;
                }
            }
        });
        return ret;
    },

    /**
     * 在targetJQ的第index个位置,插入元素名为childElementName的元素
     * @method addElement
     * @param {$DOM} targetJQ
     * @param {String} childElementName 子元素的标签名，比如'<div></div>'
     * @param {Number} index
     */
    addElement: function (targetJQ, childElementName, index) {

        childElementName = Sui.StringUtil.trim(childElementName);

        if (Sui.isString(childElementName)) {

            if (Sui.StringUtil.startWith(childElementName, "<")) {
                var child = $(childElementName);
                childElementName = this.getTagName(child);
            } else {
                var child = $("<" + childElementName + "></" + childElementName + ">")
            }
        } else {
            var child = $(childElementName)
            childElementName = child.nodeName();
        }

        if (index == 0) {
            child.prependTo(targetJQ);
        } else {
            var ele = this.getChildElement(targetJQ, childElementName, index - 1);
            if (ele.size == 1) {
                child.insertAfter(ele);
            } else {
                child.appendTo(targetJQ);
            }
        }

        return child;

    },

    /**
     * 获取parentJQ元素下第index个childElementName元素
     * @method getChildElement
     * @param {$DOM} parentJQ
     * @param {String} childElementName  子元素的标签名，比如'<div></div>'
     * @param {Number} index
     */
    getChildElement: function (parentJQ, childElementName, index) {
        return parentJQ.children(childElementName + ":eq(" + index + ")");
    },
    /**
     * 设置元素的x，y轴位移
     * @method setOffset
     * @param {$DOM} ele
     * @param {Number} screenX
     * @param {Number} screenY
     */
    setOffset: function (ele, screenX, screenY) {
        Sui.log("setOffset方法调用,screenX=" + screenX + ",screenY=" + screenY);
        ele.offset({
            left: screenX,
            top: screenY
        })
    },

    /**
     * 将srcElement与destElement对齐.
     * @method alignTo
     * @param {DOM} srcElement 源DOM元素
     * @param {DOM} destElement 目标DOM元素
     * @param {Object} config
     * @param {String} config.src  字符串,第一个字符,水平方向(l,c,r);第二个字符,垂直方向(t,m,b)
     * @param {String} config.dest  字符串,第一个字符,水平方向(l,c,r);第二个字符,垂直方向(t,m,b)
     * @example
     *  <pre><code>
     *      Sui.alignTo( srcDiv, destDiv, {src:'lb', dest: 'lt'} );
     *      //源DOM元素的左侧底部与目标DOM元素的左侧顶部对齐
     *  </code></pre>
     */
    alignTo: function (srcElement, destElement, config) {

        srcElement = Sui.getJQ(srcElement);
        destElement = Sui.getJQ(destElement);

        var src = config.src;
        var dest = config.dest;

        var winWidth = $(window).width() +  $(window).scrollLeft(),
            winHeight = $(window).height() +  $(window).scrollTop() ,
            srcWidth = srcElement.outerWidth(),
            srcHeight = srcElement.outerHeight(),
            destWidth = destElement.outerWidth(),
            destHeight = destElement.outerHeight();

        var srcH = this.calcElementPosition(srcElement, src.charAt(0));
        var destH = this.calcElementPosition(destElement, dest.charAt(0));

        Sui.log("srcH=" + srcH + ",destH=" + destH);
        if (destH + srcWidth > winWidth && (src.charAt(0) == 'l' && dest.charAt(0) == 'l')) {
            //src元素位置超过窗口宽度时，与dest元素右对齐
            this.moveX(srcElement, destH + destWidth - srcWidth - srcH);
        } else {
            this.moveX(srcElement, destH - srcH + (Sui.isNumber(config.hspan) ? config.hspan : 0));
        }

        var srcV = this.calcElementPosition(srcElement, src.charAt(1));
        var destV = this.calcElementPosition(destElement, dest.charAt(1));

        Sui.log("srcV=" + srcV + ",destV=" + destV);
        if( (destV + srcHeight > winHeight) && (srcHeight < destV - destHeight) ){
            //src元素位置超过窗口高度时，移至dest上方
            this.moveY( srcElement, destV - destHeight - srcHeight - srcV - (Sui.isNumber(config.vspan) ? config.vspan : 0) );
        }else{
            this.moveY( srcElement, destV - srcV + (Sui.isNumber(config.vspan) ? config.vspan : 0));
        }

    },
    /**
     * 将元素往x轴移动
     * @method moveX
     * @param {$DOM} element
     * @param {Number} val
     */
    moveX: function (element, val) {
        var left = element.offset().left;
        element.offset({
            left: left + val
        });
    },
    /**
     * 将元素往y轴移动
     * @method moveY
     * @param {$DOM} element
     * @param {Number} val
    */
    moveY: function (element, val) {
        var top = element.offset().top;
        element.offset({
            top: top + val
        });
    },
    /**
     * 设置元素的对齐方式
     * @private
     * @method calcElementPosition
     * @param {$DOM} element
     * @param {Number} pos
     */
    calcElementPosition: function (element, pos) {
        if (pos == 'l') {
            return  element.offset().left;
        } else if (pos == 'c') {
            return  element.offset().left + element.outerWidth() / 2;
        } else if (pos == 'r') {
            return  element.offset().left + element.outerWidth();
        } else if (pos == 't') {
            return  element.offset().top;
        } else if (pos == 'm') {
            return  element.offset().top + element.outerHeight() / 2;
        } else if (pos == 'b') {
            return  element.offset().top + element.outerHeight();
        }
    },

    /**
     * 生成占位字符串
     * @method getHSpacing
     * @param {Number} width
     * @return {String}
     */
    getHSpacing: function (width) {
        return "<span style='display:inline-block;width:" + width + "px'></span>";
    },

    /**
     * 将jq包含的样式类srcClass替换成destClass
     * @method replaceClass
     * @param {DOM} jq
     * @param {String} src
     * @param {String} dest
     */
    replaceClass: function (jq, srcClass, destClass) {
        Sui.getJQ(jq).addClass(destClass).removeClass(srcClass);
    },
    /**
     * 设置元素的可见性
     * @method setVisible
     * @param {$DOM} jq
     * @param {Boolean} visible
     */
    setVisible: function (jq, visible) {
        if (visible) {
            jq.show();
        } else {
            jq.hide();
        }
    },
    /**
     * 判断元素是否可见
     * @method  isDisplayVisible
     * @param {$DOM} jq
     */
    isDisplayVisible: function (jq) {
        return jq.css("display") != "none";
    },

    /**
     * 获取单元格的colspan。如果没有值，则返回1。
     * @method getColspan
     * @param {DOM} td
     * @return {Mixed}
     */
    getColspan : function(td){
        var colspan = this.getJQ(td).attr("colspan");
        if(Sui.isEmpty(colspan)){
            return 1;
        }else {
            return parseInt(colspan);
        }
    },

    /**
     * 获取单元格的rowspan。如果没有值，则返回1。
     * @method getRowspan
     * @param {DOM} td
     * @return {Mixed}
     */
    getRowspan : function(td){
        var rowspan = this.getJQ(td).attr("rowspan");
        if(Sui.isEmpty(rowspan)){
            return 1;
        }else {
            return parseInt(rowspan);
        }
    },

    /**
     * 根据id或dom元素,返回JQuery对象.
     * @method getJQ
     * @pram {String,DOM} idOrDom
     * @return {$DOM}
     */
    getJQ: function (idOrDom) {
        if (Sui.isUndefinedOrNull(idOrDom)) {
            return null;
        }
        if (Sui.isString(idOrDom)) {
            var jq = $("#" + idOrDom);
        } else {
            var jq = $(idOrDom);
        }
        return jq;
    },

    /**
     * 返回DOM元素
     * @method getDom
     * @param {Array,DOM} jqOrDom
     * @return {DOM}
     */
    getDom: function (jqOrDom) {

        if (Sui.isUndefinedOrNull(jqOrDom)) {
            return null;
        }
        if (!jqOrDom.tagName) {
            jqOrDom = jqOrDom[0];
        }
        return jqOrDom;
    },
    /**
     * 获得元素的标签名（小写）
     * @method getTagName
     * @param {$DOM,DOM} jqOrDom
     * @return {String}
     */
    getTagName: function (jqOrDom) {
        return this.getDom(jqOrDom).tagName.toLowerCase();
    },

    /**
     * 点击switch1元素,控制target元素是显示还是隐藏.
     * @mehtod switchVisible
     * @param {Object}  config 定义一些配置属性.
     * @param {String}  config.userDefaultCss 是否使用默认的样式，默认值为false
     * @param {Boolean} config.show 显示还是隐藏,默认值为true
     * @param {Boolean} config.listenerIcon 配置是否只监听图标点击,默认为false
     * @param {Object}  config.switchAttrs 控制开关的属性变化
     * @param {String}  config.switchAttrs.show 包含target可见时,开关的一些属性
     * @param {String}  config.switchAttrs.hide 包含target隐藏时,开关的一些属性
     * @example
     *  <pre><code>
     *      switchVisible( switchLink, targetDiv,
     *        {
     *           userDefaultCss:'class1',
     *           switchAttrs:{
     *               show:'折叠代码',
     *               hide:'展开代码'
     *           }
     *        }
     *      );
     *  </code></pre>
     */
    switchVisible: function (switch1, target, config) {

        config = Sui.apply({
            // 配置是否只监听图标点击
            listenerIcon: false,
            userDefaultCss: false,
            show: true
        }, config);

        switch1 = this.getJQ(switch1);
        target = this.getJQ(target);

        // 插入图标
        if (config.userDefaultCss) {
            var iconJQ = $("<b></b>").addClass('s_ico').prependTo(switch1);

            // 折叠fold,是减号
            if (config.show) {
                iconJQ.addClass('s_ico_fold');
                target.show();
            } else {
                iconJQ.addClass('s_ico_unfold');
                target.hide();
            }
        }

        var listenerTarget = switch1;
        if (config.listenerIcon) {
            listenerTarget = iconJQ;
        }
        listenerTarget.click(function () {

            target.toggle();

            if (config.userDefaultCss) {

                var ext = Sui;

                // 目标对象可见的话，显示折叠图标
                if (ext.isDisplayVisible(target)) {
                    ext.replaceClass(iconJQ, 's_ico_unfold', 's_ico_fold');
                } else {
                    ext.replaceClass(iconJQ, 's_ico_fold', 's_ico_unfold');
                }
            }

            if (config.switchAttrs) {

                var attrs = config.switchAttrs[Sui.isDisplayVisible(target) ? 'show' : 'hide'];
                for (var p in attrs) {
                    if (p == 'text') {
                        switch1.text(attrs[p]);
                    } else {
                        switch1.attr(p, attrs[p]);
                    }
                }

            }
        });
    }

});
/**
 * Sui与对齐相关的属性名
 * @property
 * @type {Object}
 * @default { LEFT: 'left', CENTER: 'center',RIGHT: 'right' }
 */
Sui.Align = {
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right'
};
/**
 * Sui与键盘按键代码相关的属性名
 * @type {Object}
 *
 */
Sui.KEY = {
    UP: 38,
    DOWN: 40,
    DEL: 46,
    TAB: 9,
    RETURN: 13,
    ESC: 27,
    COMMA: 188,
    PAGEUP: 33,
    PAGEDOWN: 34,
    BACKSPACE: 8,
    isSpecialKey: function (keyCode) {
        var specialKeys = new Array(this.UP, this.DOWN, this.RETURN, this.ESC);
        return Sui.ArrayUtil.contains(specialKeys, keyCode);
    }
};


/**
 * Sui组件基类
 * 为每个组件类定义一个字符串缩写。例如label对应Sui.form.Label
 * @class Sui.Components
 * @extends Sui.util.Observable
 */
Sui.Components = {
    /**
     * 已注册的组件集合
     * @property   componentMap
     * @type {Object}
     * @default {}
     */
    componentMap: {},
    /**
     * 注册组件
     * @method register
     * @param {String} compnentType 组件类型
     * @param {String} compnentClass 组件类名
     */
    register: function (compnentType, compnentClass) {
        this.componentMap[compnentType] = compnentClass;
    },
    /**
     * 通过组件类型获取组件的类名
     * @method getComponentClass
     * @param  {String} componentType
     * @return {String}
     */
    getComponentClass: function (componentType) {
        return this.componentMap[componentType];
    },
    /**
     * 通过配置构造组件
     * @method  createComponentFromConfig
     * @param compConfig 组件的配置
     * @param compConfig.compType 组件类型
     * @return {Mixed} 返回新建的组件实例
     */
    createComponentFromConfig: function (compConfig) {
        var compType = compConfig.compType;
        var Cls = this.getComponentClass(compType);
        return new Cls(compConfig);
    }
};

/**
 * 每个组件都有自己的样式。子类可以定义自己私有的样式。
 * 一般来说，子类需要继承父类的样式。因为父类可能定义很多的级联样式。这样不可能子类再定义一遍相同的样式。
 * @class Sui.Component
 * @extends Sui.util.Observable
 * @constructor
 * @param {Object} config 初始化配置
 * @param {contextMenu} config.contextMenu 组件的右键菜单
 * @param  {Number} config.width 组件宽度
 * @param {Number} config.height 组件高度
 * @param {Boolean} config.visible 可见性
 * @param {Boolean} config.disable 是否失效
 * @param {String} config.customClass 自定义样式
 * @param {String} config.defaultClass 默认样式
 * @param {String} config.overClass 鼠标悬浮时样式
 * @param {String} config.applyToTagName applyTo的表签名
 *
 * @param {DOM} config.applyTo 该组件替换掉某个元素
 * @param {DOM} config.renderTo 该组件渲染到某元素中
 * @param {Function} config.render 渲染函数
 * @param {Function} config.beforeRender 渲染前执行函数
 * @param {Function} config.afterRender 渲染后执行函数
 * @param {Function} config.initEvent 初始化时触发事件
 *
 */
Sui.Component = Sui.extend(Sui.util.Observable, {

    /**
     * applyTo的元素标签名
     * @property  applyToTagName
     * @type {String}
     * @default ''
     */
    applyToTagName: '',
    /**
     * applyTo的DOM元素
     * @property  applyToElement
     * @type {Dom}
     * @default null
     */
    applyToElement: null,
    /**
     * 宽度和高度
     */
    width: null,
    height: null,

    /**
     * 组件的位置
     */
    left : null,
    top : null,
    cssPosition : null,
    
	/**
     * 组件的z轴
     */
    zIndex : null,
	
    /**
     * 外框宽度和高度
     */
    outerHeight: null,
    outerWidth: null,

    /**
     * 定义组件默认的样式。只读，不可修改。
     */
    defaultClass: "",

    /**
     * 鼠标移到组件上，组件的样式变化
     */
    overClass: "",

    /**
     * 如果创建对象时，想自定义样式，可以通过customClass进行定义。
     */
    customClass: "",

    /**
     *  是否已经渲染过\
     */
    _rendered: false,

    /**
     * 定义右键菜单
     */
    contextMenu: null,

    /**
     * 是否被禁用
     */
    disabled: false,

    /**
     * 是否可见
     */
    visible: true,

    /**
     * 内部组件ID
     */
    componentId: null,

    /**
     * 子节点，比如子菜单
     */
    children:[],

    /**
     * 定义组件默认构造流程。先处理配置参数config，然后执行渲染。
     *
     */
    constructor: function (config) {

        this.componentId = Sui.generateId();

        Sui.Component.superclass.constructor.call(this, config);

        config = config || {};

        this.initProperties();

        Sui.applyProps(this, config, ["contextMenu", "width", "height", "left", "zIndex", "top", "cssPosition", "visible", "disabled", "customClass", "overClass","defaultClass", "applyToTagName"]);

        // 是否可以覆盖渲染函数
        if (config.overrideDefaultRender) {
            Sui.applyProps(this, config, ["render", "beforeRender", "afterRender", "initEvent"]);
        }

        this.initConfig(config);

        // 执行渲染操作
        if (config.transform) {
            this.startTransform(config.transform);
        } else if (config.applyTo) {
            this.applyTo(config.applyTo);
        } else if (config.renderTo) {
            if (Sui.isArray(config.renderTo)) {
                this.renderTo.apply(this, config.renderTo);
            } else {
                this.renderTo(config.renderTo);
            }
        }
    },

    /**
     * 初始化对象的属性。对于数组和对象，不能直接定义在prototype中。
     */
    initProperties: Sui.emptyFn,

    /**
     * 初始化配置
     */
    initConfig: Sui.emptyFn,
    /**
     * 获取组件的id
     * @method getComponentId
     * @return {String}
     */
    getComponentId: function () {
        return this.componentId;
    },
    /**
     * 设置customClass
     * @method setCustomClass
     * @param  {String}  customClass
     */
    setCustomClass: function (customClass) {

        if (this.getApplyToElement()) {
            this.getApplyToElement().removeClass(this.customClass);
        }

        this.customClass = customClass;
        this.applyCustomClass();
    },
    /**
     * 为applyToElement元素添加class
     * @method  applyCustomClass
     * @private
     */
    applyCustomClass: function () {
        if (this.getApplyToElement()) {
            this.getApplyToElement().addClass(this.customClass);
        }
    },
    /**
     * 判断组件是否被禁用
     * @method isDisabled
     * @return {Boolean}
     */
    isDisabled: function () {
        if (this.getDisabledElement()) {
            return Sui.isDisabled(this.getDisabledElement());
        }
        return this.disabled;
    },
    /**
     * 设置组件的失效状态
     * @method setDisabled
     * @param {Boolean} disabled
     *
     */
    setDisabled: function (disabled) {
        if (this.disabled != disabled) {
            this.disabled = disabled;
            this.applyDisabled();
        }
    },

    /**
     * 设置组件的失效状态，实际执行函数
     * @method applyDisabled
     * @private
     */
    applyDisabled: function () {
        if (this.isRendered()) {
            Sui.setDisabled(this.getDisabledElement(), this.disabled);
        }
    },
    /**
     * 获取需要设置为失效(或有效)的元素
     * @method getDisabledElement
     * @private
     */
    getDisabledElement: function () {
        return this.getApplyToElement();
    },
    /**
     * 为组件元素添加默认样式
     * @method applyDefaultClass
     * @private
     */
    applyDefaultClass: function () {
        if (this.getApplyToElement()) {
            this.getApplyToElement().addClass(this.getDefaultClass());
        }
    },
    /**
     * 获取默认样式
     * @method getDefaultClass
     * @return {String}
     */
    getDefaultClass: function () {
        return this.defaultClass;
    },
    /**
     * 设置组件内部宽度
     * @method setWidth
     * @param {Number} width
     */
    setWidth: function (width) {
        this.width = width;
        this.applyWidth();
    },

    /**
     * 设置组件宽度实际执行函数
     * @method applyWidth
     * @private
     */
    applyWidth: function () {
        if (this.getResizeElement()) {
            if (Sui.isDefinedAndNotNull(this.width)) {
                this.getResizeElement().width(this.width);
            }
        }
    },

    /**
     * 获取组件宽度
     * @method getWidth
     * @return {Number}
     */
    getWidth: function () {
        if (this.getResizeElement()) {
            return this.getResizeElement().width();
        }
        return this.width;
    },
    /**
     * 设置组件高度
     * @method setHeight
     * @param {Number} height
     */
    setHeight: function (height) {
        this.height = height;
        this.applyHeight();
    },

    /**
     * 设置组件高度实际执行函数
     * @method applyHeight
     * @private
     */
    applyHeight: function () {
        if (this.getResizeElement()) {
            if (Sui.isDefinedAndNotNull(this.height)) {
                this.getResizeElement().height(this.height);
            }
        }
    },
    /**
     * 获取组件高度
     * @method getHeight
     * @return {Number}
     */
    getHeight: function () {
        if (this.getResizeElement()) {
            return this.getResizeElement().height();
        }
        return this.height;
    },

    /**
     * 设置组件外部宽度
     * @method setOuterWidth
     * @param {Number} width
     */
    setOuterWidth: function (width) {
        this.outerWidth = width;
        this.applyOuterWidth();
    },

    /**
     * 设置组件外部宽度实际执行函数
     * @method  applyOuterWidth
     * @private
     */
    applyOuterWidth: function () {
        if (this.getResizeElement()) {
            if (Sui.isDefined(this.outerWidth)) {
                Sui.setOuterWidth(this.getResizeElement(), this.outerWidth);
            }
        }
    },
    /**
     * 获取组件外部宽度
     * @method  getOuterWidth
     */
    getOuterWidth: function () {
        if (this.getResizeElement()) {
            return this.getResizeElement().outerWidth();
        }
        return this.outerWidth;
    },
    /**
     * 设置组件外部高度
     * @method  setOuterHeight
     * @param {Number} height
     */
    setOuterHeight: function (height) {
        this.outerHeight = height;
        this.applyOuterHeight();
    },
    /**
     * 设置组件外部高度，实际执行函数
     * @method applyOuterHeight
     * @private
     */
    applyOuterHeight: function () {
        if (this.getResizeElement()) {
            if (Sui.isDefined(this.outerHeight)) {
                Sui.setOuterHeight(this.getResizeElement(), this.outerHeight);
            }
        }
    },
    /**
     * 获取组件外部高度
     * @method  getOuterHeight
     * @return {Number}
     */
    getOuterHeight: function () {
        if (this.getResizeElement()) {
            return this.getResizeElement().outerHeight();
        }
        return this.outerHeight;
    },
    
    /**
     * 设置组件的左边
     * @method  setLeft
     * @param {Number} left
     */
    setLeft: function (left) {
        this.left = left;
        this._applyLeft();
    },

    /**
     * @private
     */
    _applyLeft: function () {
        if (this.getTopElement()) {
            if (Sui.isDefined(this.left)) {
                this.getTopElement().css("left", this.left);
            }
        }
    },

    /**
     * 获取组件的左边
     * @method  getLeft
     * @return {Number} 
     */
    getLeft: function () {
        if (this.getTopElement()) {
            return this.getTopElement().css("left");
        }
        return this.left;
    },

    /**
     * 设置组件的顶部
     * @method  setTop
     * @param {Number} top
     */
    setTop: function (top) {
        this.top = top;
        this._applyTop();
    },

    /**
     * @private
     */
    _applyTop: function () {
        if (this.getTopElement()) {
            if (Sui.isDefined(this.top)) {
                this.getTopElement().css("top", this.top);
            }
        }
    },

    /**
     * 获取组件的顶部
     * @method  getTop
     * @return {Number} 
     */
    getTop: function () {
        if (this.getTopElement()) {
            return this.getTopElement().css("top");
        }
        return this.top;
    },

   /**
     * 设置组件的position属性的值
     * @method  setCssPosition
     * @param {String} cssPosition
     */
    setCssPosition: function (cssPosition) {
        this.cssPosition = cssPosition;
        this._applyCssPosition();
    },

    /**
     * @private
     */
    _applyCssPosition: function () {
        if (this.getTopElement()) {
            if (Sui.isDefined(this.cssPosition)) {
                this.getTopElement().css("position", this.cssPosition);
            }
        }
    },

    /**
     * 获取组件的position属性的值
     * @method  getCssPosition
     * @return {String} 
     */
    getCssPosition: function () {
        if (this.getTopElement()) {
            return this.getTopElement().css("position");
        }
        return this.cssPosition;
    },
	
	/**
     * @private
     */
    applyZIndex : function(){
        if (this.getTopElement()) {
            if (Sui.isDefinedAndNotNull(this.zIndex)) {
                this.getTopElement().css("z-index", this.zIndex);
            }
        }
    },
    
    /**
     * 获取需要调整宽度和高度的元素
     * @method getResizeElement
     * @return {DOM}
     */
    getResizeElement: function () {
        return this.applyToElement;
    },

    /**
     * 执行组件替换操作
     * @method applyTo
     * @param {DOM} applyTo
     */
    applyTo: function (applyTo) {
        if (this.isRendered()) {
            return;
        }

        this.applyToElement = Sui.getJQ(applyTo);

        this.startRender(this.applyToElement.parent());

    },
    /**
     * 开始执行组件转换操作，该函数基本无用
     * @method  startTransform
     * @param {DOM} transformElement
     *
     */
    startTransform: function (transformElement) {
        this.transform(transformElement);
        this.afterRender();
        this.initEvent();
    },

    transform: Sui.emptyFn,

    /**
     * 执行渲染操作,
     * 每个组件只能渲染一次
     * @method renderTo
     * @param {DOM} renderTo
     * @param {DOM}  insertBefore
     */
    renderTo: function (renderTo, insertBefore) {
        if (this.isRendered()) {
            return;
        }
        this.startRender(Sui.getJQ(renderTo), insertBefore);
    },

    /**
     * 执行渲染流程
     */
    startRender: function (container, insertBefore) {
        this.beforeRender(container, insertBefore);
        this.render(container, insertBefore);
        this.afterRender(container, insertBefore);
        this.initEvent();
    },

    beforeRender: Sui.emptyFn,

    render: function (container, insertBefore) {

        if (this.applyToTagName) {
            this.createApplyToElement(this.applyToTagName, container, insertBefore);
        }

    },

    afterRender: function (container, insertBefore) {
        this._rendered = true;

        this.applyWidth();
        this.applyHeight();
        this._applyLeft();
        this._applyTop();
        this._applyCssPosition();
		this.applyZIndex();
        this.applyDefaultClass();
        this.applyCustomClass();
        this.applyVisible();
        this.applyDisabled();

        // 必须在渲染后才能注册
        Sui.ComponentManager.registerComponent(this);

    },

    isRendered: function () {
        return this._rendered;
    },

    createApplyToElement: function (tagName, container, insertBefore) {

        if (!this.getApplyToElement() || this.getApplyToElement().size() == 0) {

            Sui.Assert.notEmpty(tagName);

            var jq = tagName;

            if (Sui.isString(tagName)) {
                tagName = Sui.StringUtil.trim(tagName);

                if (!Sui.StringUtil.startWith(tagName, "<")) {
                    tagName = Sui.createElementByTagName(tagName);
                }

                jq = $(tagName);
            }

            this.applyToElement = jq;
            Sui.appendOrBefore(jq, container, insertBefore);
        }

        return this.applyToElement;
    },

    getApplyToElement: function () {
        return this.applyToElement;
    },

    /**
     * 该组件的最顶层的元素。每个组件有且只能有一个顶层元素
     */
    getTopElement: function () {
        return this.applyToElement;
    },

    /**
     * 拖放的元素
     */
    getDragElement: function () {
        return this.applyToElement;
    },

    /**
     * 邻接组件插入到当前组件前面
     */
    getBeforeElement: function () {
        return this.applyToElement;
    },

    /**
     * 邻接组件插入到当前组件之后
     */
    getAfterElement: function () {
        return this.applyToElement;
    },

    /**
     * 该dom元素是否包含在该组件内
     * @param dom
     */
    containDom: function (dom) {
        var topElement = this.getTopElement();
        if (Sui.isChildOf(dom, topElement)) {
            return true;
        }
        return false;
    },
    /**
     * 初始化触发时间，主要有鼠标移入移出事件和右键菜单事件
     * @method iniEvent
     * @private
     */
    initEvent: function () {
        if (this.overClass) {
            this.getMouseOverElement().hover(Sui.makeFunction(this, this.onMouseOver), Sui.makeFunction(this, this.onMouseOut))
        }

        if (this.contextMenu) {
            this.getApplyToElement().bind('contextmenu', Sui.makeFunction(this, this.onContextMenu));
        }

        this.fireEvent("afterInitEvent");
    },
    /**
     * 在开始右键菜单前执行
     * @method beforeShowContextMenu
     * @param e
     * @returns {Mixed}
     */
    beforeShowContextMenu: function (e) {
        return this.fireEvent("beforeContextMenu", new Sui.util.Event({
            e: e,
            contextMenu: this.contextMenu
        }));
    },
    /**
     * 执行右键菜单
     * @method onContextMenu
     * @param {Event} e
     *
     */
    onContextMenu: function (e) {
        e.preventDefault();

        if (this.beforeShowContextMenu(e) === false) {
            return;

        }

        this.showContextMenu(e);
    },
    /**
     * 显示右键菜单
     * @method showContextMenu
     * @param {Event} e
     *
     */
    showContextMenu: function (e) {
        // 如果没有子菜单可见,不显示右键菜单
        if(this.contextMenu.existVisibleItem()){
            this.contextMenu.alignToAndShow(e);
        }
    },

    /**
     * 获取监听鼠标over和out事件的元素
     * @method  getMouseOverElement
     * @private
     * @return {DOM}
     */
    getMouseOverElement: function () {
        return this.getApplyToElement();
    },

    onMouseOver: function () {
        this.getMouseOverElement().addClass(this.overClass);
    },

    onMouseOut: function () {
        this.getMouseOverElement().removeClass(this.overClass);
    },
    /**
     * 获得标签元素的属性
     * @method getPropertyOfElement
     * @param {String} propName 属性名，可以是html、text、css属性或标签属性
     * @param {$DOM} element
     * @returns {String}
     */
    getPropertyOfElement: function (propName, element) {
        if (element) {
            if (propName == 'html') {
                return element.html();
            } else if (propName == 'text') {
                return element.text();
            }
            if (Sui.isCssProperty(propName)) {
                return element.css(propName);
            } else {
                return element.attr(propName);
            }
        }
        return null;
    },
    /**
     * 设置标签元素的属性
     * @method setPropertyOfElement
     * @param {String} propName 属性名，可以是html、text、css属性或标签属性
     * @param {String} propValue
     * @param {$DOM} element
     */
    setPropertyOfElement: function (propName, propValue, element) {

        if (element) {
            if (propName == 'html') {
                element.html(propValue);
            } else if (propName == 'text') {
                element.text(propValue);
            }
            if (Sui.isCssProperty(propName)) {
                element.css(propName, propValue);
            } else {
                element.attr(propName, propValue);
            }
        }
    },
    /**
     * 显示组件
     * @method show
     */
    show: function () {
        this.setVisible(true);
    },
    /**
     * 隐藏组件
     * @method hide
     *
     */
    hide: function () {
        this.setVisible(false);
    },
    /**
     * 显示或隐藏组件,如果参数不赋值则将组件的可见性反置
     * @method toggle
     * @param {Boolean} visible
     */
    toggle: function (visible) {
        this.setVisible(visible);
    },

    /**
     * 设置组件可见性,
     * 首先将实例中的visible属性赋值，再设置DOM元素的可见性
     * @method setVisible
     * @param {Boolean} visible 设置为可见（true）或不可见（false）
     */
    setVisible: function (visible) {
        if (Sui.isUndefined(visible)) {
            visible = !this.visible;
        }

        this.visible = visible;

        this.applyVisible();

    },
    /**
     * 设置组件可见性后执行
     * @method   afterApplyVisible
     *
     */
    afterApplyVisible: Sui.emptyFn,

    /**
     * 设置组件可见性的实际执行函数
     * @method applyVisible
     *
     */
    applyVisible: function () {
        if (this.isRendered()) {
            var elements = this.getTopElement();
            elements.toggle(this.visible);

            this.afterApplyVisible();
        }
    },

    /**
     * 判断组件自身是否可见
     * @method isVisible
     * @returns {*}
     */
    isVisible: function () {
        if (this.isRendered()) {
            var element = this.getTopElement();
            return Sui.isDisplayVisible(element);
        } else {
            return this.visible;
        }
    },

    /**
     * 销毁组件自身
     * @method destory
     *
     */
    destroy: function () {
        var applyTo = this.getTopElement();
        if (applyTo) {
            applyTo.remove();
        }
    }

});

/**
 * 简单的标签组件,包括内容和文本对齐方式。
 * @class Sui.TagComponent
 * @extends Sui.Component
 * @constructor
 * @param {Object} config 配置参数
 * @param {String} config.html 文本内容
 * @param {String} config.textAlign 文本对齐方式
 * @param {String} config.isRoot 是否作为根节点
 */
Sui.TagComponent = Sui.extend(Sui.Component, {

    applyToTagName: 'div',

    /**
     * 文本内容
     */
    html: "",

    /**
     * 文本对齐方式
     */
    textAlign: Sui.Align.LEFT,

    /**
     * 初始化配置
     * @method initConfig
     * @param config 配置参数请查看构造函数
     */
    initConfig: function (config) {
        Sui.TagComponent.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ["html", "textAlign","isRoot"]);
    },
    /**
     * 设置标签内容
     * @method setHtml
     * @param html
     */
    setHtml: function (html) {
        this.html = html;
        this.applyHtml();
    },
    /**
     * 设置标签内容的实际执行函数
     * @method applyHtml
     * @private
     */
    applyHtml: function () {
        if (this.getApplyToElement()) {
            this.getApplyToElement().html(this.html);
        }
    },
    /**
     * 设置文本对齐方式
     * @method setTextAlign
     * @param textAlign
     */
    setTextAlign: function (textAlign) {
        this.textAlign = textAlign;
        this.applyTextAlign();
    },
    /**
     * 设置文本对齐方式实际执行函数
     * @method applyTextAlign
     * @private
     */
    applyTextAlign: function () {
        if (this.getApplyToElement()) {
            this.setPropertyOfElement("text-align", this.textAlign, this.getApplyToElement());
        }
    },
    /**
     * 渲染后执行函数
     * @method afterRender
     * @private
     */
    afterRender: function () {
        Sui.TagComponent.superclass.afterRender.apply(this, arguments);
        this.applyTextAlign();
        this.applyHtml();
    }

});

/**
 * Layout类用来对容器中的组件进行布局。
 * @class Sui.Layout
 * @extends Sui.util.Observable
 */
Sui.Layout = Sui.extend(Sui.util.Observable, {

    /**
     * 所有的子组件
     * @property children
     * @type {Array}
     * @default null
     */
    children: null,

    /**
     * 对子组件进行布局,子组件布局的位置
     * @property childRenderToElement
     * @type {DOM}
     * @default null
     */
    childRenderToElement: null,
    /**
     * @constructor
     * @param {Object} config 配置参数
     * @param {Array,DOM} config.children 子组件
     */
    constructor: function (config) {

        Sui.Layout.superclass.constructor.call(this, config);

        config = config || {};

        this.children = new Sui.util.ArrayList();

        if (config.children) {
            var children = Sui.ArrayUtil.itemToArray(config.children);
            this.children.addAll(children);
        }
    },
    /**
     * 判断是否已经做过布局
     * @method  isLayouted
     * @returns {boolean}
     */
    isLayouted: function () {
        return this.childRenderToElement != null;
    },

    /**
     * 对组件进行布局
     * @method layoutContainer
     * @param {Sui.Layout} container 父容器，即类自身
     */
    layoutContainer: function (container) {

        if (this.isLayouted()) {
            return;
        }

        this.childRenderToElement = container.getChildRenderTotElement();
        this.renderChildrenComponent(container);

    },
    /**
     * 渲染子组件
     * @method renderChildrenComponent
     * @param container
     */
    renderChildrenComponent: function (container) {

        for (var i = 0; i < this.children.count(); i++) {
            var component = this.children.get(i);
            this.renderChildComponent(component, i);
        }

    },

    afterRenderContainer : Sui.emptyFn,
    /**
     * 获取子组件的总数
     * @method getComponentCount
     * @returns {Number}
     */
    getComponentCount: function () {
        return this.children.count();
    },
    /**
     * 获取第index个子组件
     * @method getComponent
     * @param {Number} index
     * @returns {Mixed}
     */
    getComponent: function (index) {
        return this.children.get(index);
    },
    /**
     * 添加一个子组件
     * @method addComponent
     * @param {Mixed} component 子组件
     * @param {Object} config 相关配置
     */
    addComponent: function (component, config) {

        if (Sui.isUndefinedOrNull(config)) {
            config = this.getComponentCount();
        }

        this.children.add(component, config);

        if (this.isLayouted()) {
            this.renderChildComponent(component, config);
        }
    },
    /**
     * 渲染一个子组件
     * @method
     * @param {Mixed} component
     * @param {Object} config
     */
    renderChildComponent: function (component, config) {

        var childParent = this.childRenderToElement;

        if (config == this.getComponentCount() - 1) {
            component.renderTo(childParent);
        } else {
            component.renderTo(childParent, this.getComponent(config + 1).getBeforeElement());
        }
    },
    /**
     * 获取子组件在所有子组件中的索引位置
     * @param {DOM} component
     * @returns {Number}
     */
    indexOfComponent: function (component) {
        return this.children.indexOf(component);
    },
    /**
     * 销毁子组件
     * @method removeComponent
     * @param {Number,DOM} component 可以是子组件的索引值，或子组件本身
     */
    removeComponent: function (component) {

        if (Sui.isNumber(component)) {
            component = this.getComponent(component);
        }

        component.destroy();
        this.children.remove(component);
    },

    /**
     * 交换两个组件的位置
     * @method exchangeComponent
     * @param {Number} upIndex
     * @param {Number} downIndex
     */
    exchangeComponent: function (upIndex, downIndex) {

        var upElement = this.getComponent(upIndex).getTopElement();
        this.getComponent(downIndex).getTopElement().insertBefore(this.getComponent(upIndex).getBeforeElement());

        if (downIndex != upIndex + 1) {
            upElement.insertAfter(this.getComponent(downIndex - 1).getAfterElement());
        }

        this.children.exchangeElement(upIndex, downIndex);

    }

});

/**
 * 水平布局Sui.HLayer
 * @class Sui.HLayer
 * @extends Sui.Layout
 */
Sui.HLayer = Sui.extend(Sui.Layout, {

    adjustWidth : false,
    marginWidth : 10,
    /**
     * @constructor
     * @param {Object} config 初始化配置
     * @param {Boolean} config.adjustWidth 是否自适应宽度，默认为否
     */
    constructor: function (config) {
       Sui.HLayer.superclass.constructor.call(this, config);
       Sui.applyProps(this, config, ["adjustWidth"]);
    },
    /**
     * 创建子容器
     * @method createChildContainer
     * @param {} component
     * @param {Number} config
     * @return {$DOM}
     */
    createChildContainer: function (component, config) {
        var div = null;
        if (config == 0) {
            div = $("<div></div>").appendTo(this.childRenderToElement);
        } else {
            var lastCompTop = null;
            for (var i = config - 1; i >= 0; i--) {
                var lastComp = this.getComponent(i);
                if (lastComp.isRendered()) {
                    lastCompTop = lastComp.getTopElement();
                    break;
                }
            }

            if (lastCompTop == null) {
                div = $("<div></div>").appendTo(this.childRenderToElement);

            } else {
                div = $("<div></div>").insertAfter(lastCompTop.parent());
            }
        }

        this.setChildContainerStyle(div);

        return div;

    },
    /**
     * 设置子容器的外补丁
     * @method setChildContainerStyle
     * @param {Number} ele
     * @private
     */
    setChildContainerStyle : function(ele){
       ele.css("margin", this.marginWidth);
    },
    /**
     * 渲染完容器开始执行
     * @method  afterRenderContainer
     * @param {} container
     * @private
     *
     */
    afterRenderContainer : function(container){
        if(this.adjustWidth){
            var width = this.childRenderToElement.width();
            Sui.log("自动调整宽度,父容器的宽度为" + width);
            width -= this.marginWidth * 2;

            for(var i =0; i<this.getComponentCount(); i++){
                this.getComponent(i).setWidth(width);
            }
        }
    },
    /**
     * 渲染子组件
     * @method renderChildComponent
     * @param {Mixed} component
     * @param {Object} config
     */
    renderChildComponent: function (component, config) {
        // 前面的组件先渲染.
        var parentElement = this.createChildContainer(component, config);
        component.renderTo(parentElement);
    }

});


/**
 * 容器组件，可以包含子组件和布局管理，布局管理器用来设置子组件的位置。
 * 默认的布局管理器为Sui.Layer。
 * @class  Sui.Container
 * @extends Sui.Component
 * @constructor
 * @param {Object} config 配置参数，可参考Sui.Component
 * @param {String} config.applyTo 渲染到的组件id
 * @param {Sui.Layout} config.layout 布局管理器
 *
 */
Sui.Container = Sui.extend(Sui.Component, {

    applyToTagName: "div",

    /**
     * 布局管理器
     * @property layout
     * @type DOM
     * @default null
     */
    layout: null,
    /**
     * 初始化配置
     * @method initConfig
     * @param {Object} config
     */
    initConfig: function (config) {

        Sui.Container.superclass.initConfig.call(this, config);

        config = config || {};

        Sui.applyProps(this, config, ["layout"]);

        // 设置默认的布局管理器
        if (Sui.isUndefinedOrNull(this.layout)) {
            this.layout = this._createDefaultLayout();
        }

    },
    
    _createDefaultLayout : function(){
        return new Sui.Layout();
    },
    
    /**
     * 开始渲染
     * @method render
     * @param {Mixed} container 父容器
     * @param {DOM} insertBefore 插入到该元素之前
     */
    render: function (container, insertBefore) {

        Sui.Container.superclass.render.apply(this, arguments);
        this.createApplyToElement(this.applyToTagName, container, insertBefore);

        this.renderChildren(container, insertBefore);
    },
    /**
     * 渲染子节点
     * @method renderChildren
     */
    renderChildren: function () {
        if (this.layout) {
            this.layout.layoutContainer(this);
        }
    },
    /**
     * 渲染之后执行
     * @method  afterRender
     */
    afterRender : function(){
        Sui.Container.superclass.afterRender.apply(this, arguments);
        if(this.layout){
           this.layout.afterRenderContainer(this);
        }
    },
    /**
     * 添加组件
     * @method addComponent
     * @param {Mixed} component
     * @param {Number} index
     */
    addComponent: function (component, index) {
        this.layout.addComponent.apply(this.layout, arguments);
    },
    /**
     * 销毁子组件
     * @method removeComponent
     * @param {Mixed} component
     */
    removeComponent: function (component) {
        this.layout.removeComponent.apply(this.layout, arguments);
    },
    /**
     * 销毁所有子组件
     * @method removeAllComponents
    **/
    removeAllComponents:function (){
        var i = 0,
            component = this.getComponent(i);
        while (component) {
            this.removeComponent(component);
            component = this.getComponent(i);
        }
    },
    /**
     * 获得组件的索引
     * @method indexOfComponent
     * @param component
     * @returns {*}
     */
    indexOfComponent: function (component) {
        return this.layout.indexOfComponent.apply(this.layout, arguments);
    },
    /**
     * 获得组件的总个数
     * @method getComponentCount
     * @returns {Number}
     */
    getComponentCount: function () {
        return this.layout.getComponentCount();
    },
    /**
     * 通过索引获得组件
     * @method getComponent
     * @param {Number} index
     * @returns {Mixed}
     */
    getComponent: function (index) {
        return this.layout.getComponent(index);
    },

    /**
     * 获取子组件渲染的区域
     * 在布局管理器Layout中会调用，用来指定渲染子组件的位置。
     * @method getChildRenderTotElement
     * @return {DOM}
     */
    getChildRenderTotElement: function () {
        return this.applyToElement;
    },
    
    destroy: function () {
        for(var i = 0; i<this.getComponentCount(); i++){
            var component = this.getComponent(i);
            if(Sui.isDefinedAndNotNull(component)){
                component.destroy();
            }
        }
        Sui.Container.superclass.destroy.apply(this, arguments);
    }

});

/**
 * 浮动层组件。
 * 如果Layer打开另外一个子Layer。点击子Layer时，不应该隐藏该Layer的Opener。
 * @class Sui.Layer
 * @extends Sui.Container
 * @constructor
 * @param {Object} config 配置
 * @param {Object} config.component  必须配置，渲染组件的内容;与config.components互斥
 * @param {Object} config.components  必须配置，渲染组件的内容集合
 * @param {Number} config.zIndex  该层的z轴
 * @param {Boolean} config.excludeElementsClick  如果鼠标点击这些元素，不隐藏当前组件;默认为null
 * @param {Object} config.alignArgs  对齐方式，默认为 {src: 'lt',dest: 'lb', hspan: 0, vspan: 1}
 * @param {DOM} config.alignmentElement  Layer与哪个元素对齐
 * @param {Boolean} config.needIframeInIE  在IE浏览器是否需要使用iframe方法将layer的z轴层级提高，高于视频控件 ，该参数只对IE有效
 */
Sui.Layer = Sui.extend(Sui.Container, {

    /**
     * 默认是不可见的
     * @property  visible
     * @type {Boolean}
     * @default false
     */
    visible: false,

    /**
     * 是否监听Document点击事件。如果监听点击事件，让用户点击其他地方时，也会隐藏Layer。
     * @property listenDocumentClick
     * @type {Boolean}
     * @default true
     */
    listenDocumentClick: true,

    /**
     * 如果鼠标点击这些元素，不隐藏当前组件
     * @property  excludeElementsClick
     * @type {Array}
     * @default null
     */
    excludeElementsClick: null,

    /**
     * Layer与哪个元素对齐
     * @property  alignmentElement
     * @type {DOM}
     * @default null
     */
    alignmentElement: null,

    zIndex: Sui.ZINDEX_LAYER,

    /**
     * 对齐方式
     * @property  alignArgs
     * @type {Object}
     * @default  {src: 'lt',dest: 'lb', hspan: 0, vspan: 1}
     */
    alignArgs: {
        src: 'lt',
        dest: 'lb',
        hspan: 0,
        vspan: 1
    },

    /**
     * 是否跟鼠标对齐
     * @property  alignToMouse
     * @type {Boolean}
     * @default false
     */
    alignToMouse: false,

    childLayers: null,
    /**
     * 默认样式
     * @property  defaultClass
     * @type {String}
     * @default   'sui_layer'
     */
    defaultClass: 'sui_layer',
    /**
     * 在IE浏览器是否需要使用iframe方法将layer的z轴层级提高，高于视频控件 ，该参数只对IE有效
     * @property  needIframeInIE
     * @type {Boolean}
     * @default false
     */
    needIframeInIE:false,
    /**
     * 初始化配置
     * @method  initConfig
     * @param {Object} config
     */
    initConfig: function (config) {

        Sui.Layer.superclass.initConfig.apply(this, arguments);

        config = config || {};

        Sui.applyProps(this, config, ["zIndex", "excludeElementsClick", "alignArgs", "alignmentElement","listenDocumentClick","needIframeInIE","alignToMouse"]);

        if (config.component) {
            this.addComponent(config.component);
        } else if (config.components) {
            Sui.each(config.components, Sui.makeFunction(this, this.addComponent));
        }
    },
    /**
     * 开始渲染
     * @method render
     *
     */
    render: function () {
        Sui.Layer.superclass.render.apply(this, arguments);
        this.getApplyToElement().css("z-index", this.zIndex);

        if( this.needIframeInIE && Sui.isIE ){
            //避免IE下弹出层被第三方插件如视频遮挡
            var iframe = document.createElement('iframe');
            iframe.style.cssText = 'border:none;z-index: -1; position: absolute; filter: alpha(opacity=0);height:100%;width:100%; background: none transparent scroll repeat 0% 0%; top:0px;left:0px;';
            this.getApplyToElement().append(iframe);
        }
    },
    /**
     * 定位
     * @method locate
     * @param {Number} top
     * @param {Number} left
     */
    locate:function(top,left){
        this.getApplyToElement().css({'top':top || 0,'left':left || 0});
    },
    /**
     * 初始化事件，除继承父类事件，主要为listenDocumentClick事件
     * @method initEvent
     * @private
     */
    initEvent: function () {
        Sui.Layer.superclass.initEvent.call(this);

        if (this.listenDocumentClick) {

            $(document).mousedown(Sui.makeFunction(this, this.onDocMousedown));
        }

//        $(Sui.getBody()).mousewheel(Sui.makeFunction(this, this.onDocMouseWheel));

    },
    /**
     *当鼠标滚轮时触发执行
     * @method onDocMouseWheel
     * @private
     */
    onDocMouseWheel: function (e) {
        Sui.log('document.click!!!');
        Sui.debugMethodCall("Sui.Layer", "onDocMouseWheel");
        this.hideIf(e.target);
    },
    /**
     *鼠标按下时触发执行
     * @method onDocMousedown
     * @param {Event} e
     * @private
     */
    onDocMousedown: function (e) {
        Sui.debugMethodCall("Sui.Layer", "onDocMousedown");
        this.hideIf(e.target);
    },
    /**
     *如果某组件应当隐藏，则将它隐藏
     * @method hideIf
     * @param {DOM}
     *
     */
    hideIf: function (target) {

        if (!this.isVisible()) {
            return;
        }

        if (this.shouldHide(target)) {
            this.hide();
            this.fireEvent("autoHide", this);
            this.afterAutoHide();
        }

    },
    /**
     *判断元素是否应该被隐藏
     * @method shouldHide
     * @param {DOM} target
     * @return {Boolean}
     */
    shouldHide: function (target) {
        var hidden = true;

        // 如果鼠标点击的元素，在当前组件内，则不隐藏当前组件。
        if (this.containDom(target)) {
            hidden = false;
        }

        if (hidden) {
            if (this.excludeElementsClick) {
                // 如果点击的元素，在excludeElementsClick中，则不隐藏当前组件。
                if (Sui.isSomeChildOf(target, this.excludeElementsClick)) {
                    hidden = false;
                }
            }
        }

        if (hidden) {
            if (this.childLayers) {
                for (var i = 0; i < this.childLayers.length; i++) {
                    // 如果子Layer不隐藏的话,则当前Layer也不隐藏
                    if (!this.childLayers[i].shouldHide(target)) {
                        hidden = false;
                        break;
                    }
                }
            }
        }

        return hidden;
    },

    /**
     * 在点击其他地方,自动关闭后
     */
    afterAutoHide: Sui.emptyFn,
    /**
     * 设置excludeElementsClick（如果鼠标点击这些元素，不隐藏当前组件）
     * @method setExcludeElementsClick
     * @param {Array} excludeElementsClick
     */
    setExcludeElementsClick: function (excludeElementsClick) {
        this.excludeElementsClick = excludeElementsClick;
    },
    /**
     * 添加excludeElementsClick
     * @method  addExcludeElementsClick
     * @param {DOM} excludeElementsClick
     */
    addExcludeElementsClick: function (excludeElementsClick) {

        if (Sui.isUndefinedOrNull(excludeElementsClick)) {
            return;
        }

        if (Sui.isUndefinedOrNull(this.excludeElementsClick)) {
            this.excludeElementsClick = [];
        } else {
            this.excludeElementsClick = Sui.ArrayUtil.itemToArray(this.excludeElementsClick);
        }

        excludeElementsClick = Sui.ArrayUtil.itemToArray(excludeElementsClick);

        Sui.ArrayUtil.addAll(this.excludeElementsClick, excludeElementsClick);

    },
    /**
     *移除removeExcludeElementsClick
     * @method  removeExcludeElementsClick
     * @param {DOM} excludeElementsClick
     */
    removeExcludeElementsClick: function (excludeElementsClick) {

        if (Sui.isUndefinedOrNull(excludeElementsClick)) {
            return;
        }

        if (Sui.isUndefinedOrNull(this.excludeElementsClick)) {
            return;
        }

        this.excludeElementsClick = Sui.ArrayUtil.itemToArray(this.excludeElementsClick);

        excludeElementsClick = Sui.ArrayUtil.itemToArray(excludeElementsClick);

        Sui.ArrayUtil.removeAll(this.excludeElementsClick, excludeElementsClick);

    },

    /**
     * 设置当前组件的显示、隐藏情况的实际执行函数
     * @method  applyVisible
     * @private
     */
    applyVisible : function(){
        if(this.visible){
            if (!this.isRendered()) {
            this.renderTo(Sui.getBody());
        }
        }
        Sui.Layer.superclass.applyVisible.apply(this, arguments);
    },
    /**
     * 添加子布局
     * @method addChildLayer
     * @param {Sui.Layer}  childLayer
     */
    addChildLayer: function (childLayer) {
        if (this.childLayers == null) {
            this.childLayers = [];
        }

        if (!Sui.ArrayUtil.contains(this.childLayers, childLayer)) {
            this.childLayers.push(childLayer);
        }
    },
    /**
     *移除去子布局
     * @method  removeChildLayer
     * @param {Sui.Layer}  childLayer
     */
    removeChildLayer: function (childLayer) {
        if (this.childLayers) {
            Sui.ArrayUtil.remove(this.childLayers, childLayer);
        }
    },
    /**
     * 移除自身
     * @method  removeLastOpener
     */
    removeLastOpener: function () {
        if (this.opener) {
            this.opener.removeChildLayer(this);
        }
    },
    /**
     * 设置opener
     * @method  setOpener
     * @param {DOM} opener
     * @private
     */
    setOpener: function (opener) {

        this.removeLastOpener();

        this.opener = opener;
        if (opener) {
            opener.addChildLayer(this);
        }

    },
    /**
     * 找到并设置组件之间的opener与被open组件关系
     * @method findAndSetOpener
     * @param {DOM}   alignmentElement
     * @private
     */
    findAndSetOpener: function (alignmentElement) {
        if (alignmentElement) {
            var maybeLayers = $(alignmentElement).parents("." + this.defaultClass);
            var opener = null;
            Sui.each(maybeLayers, function (layer) {
                var component = Sui.getComponent($(layer));
                if (component && component instanceof Sui.Layer) {
                    opener = component;
                    return false;
                }
            });

            this.setOpener(opener);
        }
    },

    /**
     * 对齐组件并显示
     * @method alignToAndShow
     * @param {DOM} alignmentElement
     */
    alignToAndShow: function (alignmentElement) {
        this.findAndSetOpener(alignmentElement);

        this.show();
        // 在IE8中, 第一次打开下拉列表, 显示有偏差
        this.alignToElement(alignmentElement);
        this.alignToElement(alignmentElement);
    },
    /**
     * 对齐组件
     * @method  alignToElement
     * @param {DOM}  alignmentElement  与该元素对齐
     */
    alignToElement: function (alignmentElement) {

        var src = this.getTopElement();
        if (this.alignToMouse) {
            var e = alignmentElement;
            Sui.setOffset(src, e.pageX, e.pageY);
        } else {
            if (alignmentElement) {
                Sui.alignTo(src, alignmentElement, this.alignArgs);
            } else if (this.alignmentElement) {
                Sui.alignTo(src, this.alignmentElement, this.alignArgs);
            }
        }
    }

});


/**
 * 窗体组件
 * @class  Sui.Window
 * @extends  Sui.Layer
 * @constructor
 */
Sui.Window = Sui.extend(Sui.Layer, {
    /**
     * @property defaultClass
     * @type  {String}
     * @default  'sui_window'
     */
    defaultClass: 'sui_window',

    /**
     * 点击其他地方不隐藏当前组件
     * @property listenDocumentClick
     * @type  {Boolean}
     * @default  false
     */
    listenDocumentClick: false,

    /**
     * 标题
     * @property title
     * @type  {String}
     * @default ""
     */
    title: '',
    /**
     * 包裹标题内容的html标签
     * @property  titleElement
     * @type  {DOM}
     * @default  null
     */
    titleElement: null,
    /**
     * main区域DOM元素
     * @property  contentContainer
     * @type  {$DOM}
     * @default null
     */
    contentContainer: null,
    /**
     * content 内容区域DOM标签
     * @property
     * @type  {$DOM}
     * @default null
     */
    contextPanel: null,
    /**
     * 内容
     * @property html
     * @type  {String}
     * @default ""
     */
    html: '',
    /**
     * 是否绑定位置
     * @property bindPosition
     * @type  {Boolean}
     * @default false
     */
    bindPosition: false,
    /**
     * 初始化配置
     * @method  initConfig
     * @param {Object} config 配置参数
     * @param {String} config.title 窗体标题
     * @param {String} config.html 窗体内容
     */
    initConfig: function (config) {
        Sui.Window.superclass.initConfig.apply(this, arguments);
        Sui.applyProps(this, config, ["title", "html"]);
    },
    /**
     * 渲染组件
     * @method render
     * @param {DOM} container 容器
     * @param {DOM} insertBefore 渲染在该元素前面
     */
    render: function (container, insertBefore) {
        Sui.Window.superclass.render.apply(this, arguments);
        this.renderWindowHeader();
    },

    /**
     * 渲染窗体头部，例如标题栏（包括标题，关闭按钮）。
     * @method  renderWindowHeader
     *
     */
    renderWindowHeader: function () {

        var applyTo = this.getApplyToElement();

        applyTo.addClass("std_pop");

        var table = $("<table></table>").appendTo(applyTo);
        var headerTr = $("<tr></tr>").appendTo(table);
        var hreaderTd = $("<td></td>").appendTo(headerTr);
        var titleDiv = $('<div actor="drager" class="pop_title move"></div> ').appendTo(hreaderTd);
        var titleElement = this.titleElement = $('<span actor="title">添加用户</span>').appendTo(titleDiv);
        var closeButton = $(' <b actor="closer" class="close _close"></b>').appendTo(titleDiv);

        var bodyTr = $("<tr></tr>").appendTo(table);
        var bodyTd = this.contentContainer = $('<td class="pop_main" ></td>').appendTo(bodyTr);
        var content = this.contextPanel = $('<div class="pop_content" ></div>').appendTo(bodyTd);

    },
    /**
     * 渲染后执行
     * @method  afterRender
     * @private
     */
    afterRender: function () {
        Sui.Window.superclass.afterRender.apply(this, arguments);
        this.applyTitle();
        this.applyContent();
    },
    /**
     * 获取需要改变尺寸的组件
     * @method  getResizeElement
     * @return {DOM}
     */
    getResizeElement: function () {
        return this.contentContainer;
    },

    /**
     * 设置内容实际执行函数
     * @method applyContent
     *
     */
    applyContent: function () {
        if (this.isRendered()) {
            if (this.html) {
                this.contextPanel.html(this.html);
            }
        }
    },
    /**
     * 设置标题内容实际执行函数
     * @method  applyTitle
     */
    applyTitle: function () {
        if (this.isRendered()) {
            this.titleElement.text(this.title);
        }
    },
    /**
     * 显示组件
     * @method  show
     */
    show: function () {
        if (!this.isRendered()) {
            this.renderTo(Sui.getBody())
        }
        Sui.Window.superclass.show.apply(this, arguments);
    }
});

/**
 *  避免在没有contextPath时出现错误
 *  @class Sui.LoadMaskIcon
 *
 *
 */
Sui.LoadMaskIcon = window.contextPath ?  (window.contextPath + "/images/loading-big.gif") : "/images/loading-big.gif";

/**
 * 当界面出现数据加载提示时的遮罩层组件
 * @class  Sui.LoadMask
 * @extends  Sui.Component
 * @constructor
 */
Sui.LoadMask = Sui.extend(Sui.Component, {
    /**
     * 将要覆盖的区域，一般为body
     * @property target
     * @type {DOM}
     * @default null
     */
    target: null,
    /**
     * 数据加载图标的路径，由Sui.LoadMaskIcon定义
     * @property
     * @type {String}
     * @default “”
     */
    src: "",
    /**
     *
     * @constructor
     * @param {Object} config
     * @param {} config.target
     * @param {} config.src
     */
    constructor: function (config) {
        Sui.LoadMask.superclass.constructor.apply(this, config);
        Sui.applyProps(this, config, ['target', "src"]);

        if (!this.src) {
            this.src = Sui.LoadMaskIcon;
        }

        this.renderTo(null, null);
    },
    /**
     * 渲染组件
     * @method render
     */
    render: function () {

        var zIndex = 10;

        // 默认是隐藏的
        this.applyToElement = $("<div class='sui_loadMask' style='position:relative'></div>").css("z-index", zIndex).hide().insertAfter(this.target);
        var img = $("<img />").attr("src", this.src).appendTo(this.applyToElement);

    },
    /**
     * 设置可见性后执行
     * @method  afterApplyVisible
     * @private
     */
    afterApplyVisible: function () {
        this.applyToElement.width(Sui.getJQ(this.target).width());
        this.applyToElement.height(Sui.getJQ(this.target).height());
    }

});

