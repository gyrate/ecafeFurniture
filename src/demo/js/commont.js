
/**
 * 初始化左侧导航树
 */

var zTree;

var setting = {
    view: {
        dblClickExpand: false,
        showLine: true,
        selectedMulti: false,
        expandSpeed: ($.browser.msie && parseInt($.browser.version)<=6)?"":"fast"
    },
    data: {
        simpleData: {
            enable:true,
            idKey: "id",
            pIdKey: "pId",
            rootPId: ""
        },
        key: {
            title: "t"
        }
    },
    callback: {
        beforeClick: function(treeId, treeNode, clickFlag) {
            if(treeNode.target == '_blank'){
                window.open(treeNode._url);
            }else{
                location.href = treeNode._url + '?node=' + treeNode.id;
            }

        }
    }
};

var zNodes = [
    { id:0,name:"BQ V1.0",open:true,target:"_self",_url:"index.html"},
//    { id:4,pId:0,name:"文件目录说明",t:"文件目录说明",open:false,target:"_self",_url:"directory.html"},

//    { id:2, pId:0, name:"css组件", t:"version1.0", open:false,target:"_self", _url:"css_btn.html"},
//        { id:201,pId:2,name:"button",t:"按钮",open:false,target:"_self",_url:"css_btn.html"},
//        { id:202,pId:2,name:"table",t:"表格",open:false,target:"_self",_url:"css_table.html"},
//        { id:203,pId:2,name:"input",t:"输入框",open:false,target:"_self",_url:"css_input.html"},
//        { id:204,pId:2,name:"select",t:"选择菜单",open:false,target:"_self",_url:"css_select.html"},
//        { id:205,pId:2,name:"tip",t:"提示信息",open:false,target:"_self",_url:"css_tip.html"},
//        { id:206,pId:2,name:"loading",t:"进度条",open:false,target:"_self",_url:"css_loading.html"},
//        { id:207,pId:2,name:"hr",t:"分割线",open:false,target:"_self",_url:"css_hr.html"},
//        { id:208,pId:2,name:"box",t:"分割线",open:false,target:"_self",_url:"css_box.html"},
    { id:1, pId:0, name:"js组件", t:"version1.0", open:true,target:"_self", _url:""},
//        { id:11, pId:1, name:"sui", t:"公共基础函数集", _url:"js_base.html"},
//        { id:11, pId:1, name:"suibase.js", t:"公共基础组件", _url:"js_base.html"},
        { id:102, pId:1, name:"Date",t:"",open:true,target:"_self",_url:"js_Date.html"},
        { id:103, pId:1, name:"Datepicker",t:"",open:true,target:"_self",_url:"js_Datepicker.html"},
        { id:104, pId:1, name:"List",t:"",open:true,target:"_self",_url:"js_List.html"},
        { id:105, pId:1, name:"DropList",t:"",open:true,target:"_self",_url:"js_DropList.html"},
        { id:106, pId:1, name:"MultiDropList",t:"",open:true,target:"_self",_url:"js_MultiDropList.html"},
        { id:107, pId:1, name:"TreeField",t:"",open:true,target:"_self",_url:"js_Treefield.html"},
        { id:108, pId:1, name:"Table",t:"",open:true,target:"_self",_url:"js_Table.html"},
        { id:10801, pId:108, name:"ExTable",t:"",open:true,target:"_self",_url:"js_ExTable.html"},
        { id:109, pId:1, name:"TreeTable",t:"",open:true,target:"_self",_url:"js_TreeTable.html"},
        { id:10901, pId:109, name:"ExTreeTable",t:"",open:true,target:"_self",_url:"js_ExTreeTable.html"},
        { id:110, pId:1, name:"Tree",t:"",open:true,target:"_self",_url:"js_Tree.html"},
        { id:111, pId:1, name:"Spinner",t:"",open:true,target:"_self",_url:"js_Spinner.html"},
        { id:112, pId:1, name:"Menu",t:"",open:true,target:"_self",_url:"js_Menu.html"},
        { id:113, pId:1, name:"Tab",t:"",open:true,target:"_self",_url:"js_Tab.html"},
        { id:114, pId:1, name:"SysDialog",t:"",open:true,target:"_self",_url:"js_SysDialog.html"},
        { id:115, pId:114, name:"SysAlert",t:"",open:true,target:"_self",_url:"js_SysAlert.html"},
        { id:116, pId:114, name:"SysPrompt",t:"",open:true,target:"_self",_url:"js_SysPrompt.html"},
        { id:117, pId:114, name:"MsgDialog",t:"",open:true,target:"_self",_url:"js_MsgDialog.html"},
        { id:118, pId:114, name:"MsgTip",t:"",open:true,target:"_self",_url:"js_MsgTip.html"},
        { id:119, pId:1, name:"Ctrlbar",t:"",open:true,target:"_self",_url:"js_Ctrlbar.html"},
        { id:120, pId:1, name:"Pagebar",t:"",open:true,target:"_self",_url:"js_Pagebar.html"},
        { id:121, pId:1, name:"Processbar",t:"",open:true,target:"_self",_url:"js_Processbar.html"},

    { id:'2',pId:0,name:'静态页面',t:'',open:true,target:'_blank',_url:''} ,
    { id:'201',pId:2,name:'css组件',t:'',open:false,target:'_blank',_url:'../../html/demo.html'} ,
    { id:'202',pId:2,name:'常规布局',t:'',open:false,target:'_blank',_url:'../../html/layout/dataGrid.html'} ,
    { id:'203',pId:2,name:'常规布局2',t:'',open:false,target:'_blank',_url:'../../html/layout/dataGrid_single.html'} ,
    { id:'204',pId:2,name:'表单布局',t:'',open:false,target:'_blank',_url:'../../html/layout/tab_form1.html'}


//        { id:12, pId:1, name:"dialog 对话框", t:"对话窗口", open:true,target:"_self", _url:""},
//            { id:121,pId:12,name:"SysDialog",t:"模态对话窗口", _url:"SysDialog.html"},
//            { id:122,pId:12,name:"SysAlert",t:"消息窗口", _url:"SysAlert.html"},
//            { id:123,pId:12,name:"SysPrompt",t:"赋值窗口", _url:"SysPrompt.html"},
//            { id:124,pId:12,name:"MsgDialog",t:"系统提示窗口", _url:"MsgDialog.html"},
//            { id:125,pId:12,name:"SysReader",t:"文章阅读器", _url:"SysReader.html"},
//        { id:13, pId:1, name:"SingleSelect", t:"单选浮动层菜单", _url:"SingleSelect.html"},
//        { id:14,pId:1,name:"SysTable",t:"轻量级表格", _url:"SysTable.html"},
//        { id:15,pId:1,name:"SysTab",t:"选项卡", _url:"SysTab.html"},
//        { id:16,pId:1,name:"dataChangeList",t:"数据交换组件", _url:"dataChangeList.html"}
];

/**
 * 执行pre内代码
 * @method  runCode
 */
$.fn.runCode = function () {
	var getText = function(elems) {
		var ret = "", elem;
		for ( var i = 0; elems[i]; i++ ) {
			elem = elems[i];
			if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
                // 3 文本 4  CDATA 片段  8 注释
				ret += elem.nodeValue;
			} else if ( elem.nodeType !== 8 ) {
				ret += getText( elem.childNodes );
			};
		};

		return ret;
	};
	var code = getText(this);
	new Function(code).call(window);

	return this;
};

/**
 * 设置代码折叠&展开
 * @method setCodeToggle
 */
function setCodeToggle(){
    $('#demo').find('section .toggle-code').click(function(){
        $(this).next().toggleClass('pre_fold');
    })
}

$(function(){

    //初始化树状目录
    var nid = document.location.search.split('=')[1] || 0;

    if( $("#treeDemo").length >0 && $.fn.zTree){
        $.fn.zTree.init($("#treeDemo"), setting, zNodes);
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        zTree.selectNode(zTree.getNodeByParam("id", nid));
    }

    //激活点击button运行pre代码
    $('._runCode').click(function() {
        var target = $('#' + $(this).attr('pre'));
        target.runCode();
    });

    //设置代码展开|折叠
    setCodeToggle();

});

