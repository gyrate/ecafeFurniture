/**
 * 初始化整个界面布局高度
 */
(function(){

    var bottom_h = $('#frame_bottom').height()
        ,sidebar_p = Sui.getDomPaddingV('sidebar')
        ,frameside_p = Sui.getDomPaddingV('frame_side')
        ,framemain_p = Sui.getDomPaddingV('frame_main')
        ,layout_p = Sui.getDomPaddingV('layout')
        ;

    /**
     * 设置整个页面布局高度
     * @method  initFrameHeight
    **/
    function initFrameHeight(){
        var w_h = Math.max( $(window).height(),100)
            ,top_h = $('#frame_top').height();

        $('#sidebar').height( w_h - top_h - bottom_h - frameside_p - sidebar_p );
        $('#sidegap').height( w_h - top_h - bottom_h - frameside_p - sidebar_p );
        $('#frame_main').height( w_h - top_h - bottom_h - framemain_p );
        $('#layout').height( w_h - top_h - bottom_h - framemain_p - layout_p );
    }

    /**
     * 初始化侧边菜单项交互
     * @method initSidebar
    **/
    function initSidebar(){
        $('#side_toggle').click(function(){
           $(this).toggleClass('toggle_show');/*切换图标*/
           $(this).attr('title', $(this).hasClass('toggle_show') ? '显示侧边栏' : '隐藏侧边栏');
           $('#sidebar').toggle();/*显示|隐藏侧边菜单*/
           var frameMain = $('#frame_main').length? $('#frame_main') : $('#frame_main_nested');
           frameMain.toggleClass('frame_main_w');/*切换主体区域margin-left值*/
        });
    }

    $(document).ready(function(){
        initFrameHeight(); //初始化框架高度
        initSidebar();//初始化侧边收缩
    });

    $(window).resize(function() {
        initFrameHeight(); //重定义框架高度
    });

})();
