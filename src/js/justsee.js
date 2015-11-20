!function(a) {
    function b() {
        var a = window.navigator.userAgent.toLowerCase(),b = a.indexOf("msie"),c = a.indexOf("maxthon/"),d = a.indexOf("trident/");
        return b > 0 || d > 0 || c > 0 ? !0 : !1
    }

    var c = {},d = function() {
        c = {main:a(".main"),header:a(".layout-header"),footer:a(".footer"),selection:a(".product-pumel"),wrapper:a(".wrapper"),dot:a(".progress-nav"),pross:a(".product-nav-slide"),_window:a(window)}
    },e = {progressTextArr:["主页","设计","功能","操作系统"],dark:!1,fullpage:!1,index:0,selectionLength:0,destiTop:0,mouse:"down",isLast:!1,isFirst:!1,isFooter:!1,backTop:!1,nextPage:!this.fullPage && !this.isLast,dotLayout:'<div class="progress-nav"><ul></ul></div>',template:'<li><a><span class="dot"></span><span class="dot-stroke"></span><span class="progress-nav-text"></span></a></li>',clientValue:{bodyHeight:function() {
        return e.fetch(["main","footer","header"])
    },headerHeight:function() {
        return e.fetch(["header"])
    },footerHeight:function() {
        return e.fetch(["footer"])
    },windowHeight:function() {
        return e.fetch(["_window"])
    }},reset:function() {
        var a = this;
        a.index = 0,a.selectionLength = 0,a.destiTop = 0
    },init:function() {
        this.reset(),e.selectionLength = c.selection.length,a("body").append(e.dotLayout),c.dot = a(".progress-nav");
        for (var b = 0; b < e.selectionLength; b++)e.progressTextArr[b] || "" == e.progressTextArr[b],a(e.template).appendTo(a(".progress-nav").find("ul")).find(".progress-nav-text").text(e.progressTextArr[b]);
        a(".progress-nav").find("ul li").eq(e.index).addClass("active"),a(".progress-nav").find("ul li").bind("click", e.dotClick)
    },animate:function(a) {
        a()
    },mouseWheelHandle:function(a, d) {
        a.preventDefault(),a = window.event || a,b() || (c.wrapper.animate(),e.scroll(e.destiTop),e.$animationCollection(e.index, d),e.indexScroll(e.destiTop, d))
    },fetch:function(a, b) {
        var d = 0;
        switch (typeof a) {
            case"object":
                for (var e in a)d += c[a[e]].height();
                break;
            case"number":
                if ("up" == b)if (a >= 2)for (var e = 0; a - 2 >= e; e++)d += c.selection.eq(e).height(); else 1 == a && (d = c.selection.eq(0).height()); else if ("down" == b)for (var e = 0; a >= e; e++)d += c.selection.eq(e).height()
        }
        return d
    },scroll:function(a, b, d) {
        c.wrapper.css("0" == b || "1" == b && d > 0 ? {webkitTransform:"translate3d(0px, -" + a + "px, 0px)",webkitTransition:"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)","-moz-transform":"translate3d(0px, -" + a + "px, 0px)","-moz-transition":"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)"} : {webkitTransform:"translate3d(0px, -" + a + "px, 0px)",webkitTransition:"all 1000ms cubic-bezier(0.860, 0.000, 0.070, 1.000)","-moz-transform":"translate3d(0px, -" + a + "px, 0px)","-moz-transition":"all 1000ms cubic-bezier(0.860, 0.000, 0.070, 1.000)"})
    },turn:function(b, c) {
        a(document).unbind("mousewheel", e.mouseWheelHandle),e.touchHandler.removeTouchHandler(),e.scroll(e.destiTop, b, c),setTimeout(function() {
            e.isInit && (a(document).bind("mousewheel", e.mouseWheelHandle),e.touchHandler.addTouchHandler())
        }, 1500),e.toggleLayout.showPross()
    },dotClick:function() {
        return a(this).hasClass("active") ? !1 : (a(document).unbind("mousewheel", e.mouseWheelHandle),e.touchHandler.removeTouchHandler(),c.dot.find("ul li").unbind("click", e.dotClick),c.dot.find("ul li").removeClass("active"),a(this).addClass("active"),e.index = 1 + a(this).index(),e.destiTop = (e.index - 1) * e.fetch(["_window"]) + e.clientValue.headerHeight(),e.turn(e.index),e.toggleLayout.prossLayout(e.index),e.$animationCollection(e.index + 1, "1"),e.$animationCollection(e.index - 1, "-1"),void setTimeout(function() {
            e.isInit && (c.dot.find("ul li").bind("click", e.dotClick),e.touchHandler.addTouchHandler())
        }, 1500))
    },toggleLayout:{prossLayout:function(a) {
        var b = c.selection.eq(a - 1).attr("data-layout");
        "false" == b ? c.pross.removeClass("header-dark") : "true" == b && c.pross.addClass("header-dark")
    },showPross:function() {
        c.pross.addClass("transition"),c.pross.css({opacity:"1",top:"0px"})
    },hidePross:function() {
        c.pross.css({opacity:"0",top:"-50px"})
    },removeTransition:function() {
        c.pross.removeClass("transition")
    },dotSwitch:function(a) {
        0 > a && (a = 0),c.dot.find("ul li").removeClass("active"),c.dot.find("ul li").eq(a).addClass("active")
    },dotHide:function() {
        c.dot.fadeOut(300)
    },dotShow:function() {
        c.dot.fadeIn(300)
    }}},f = {imagePositon:function() {
        if (e.clientValue.windowHeight() < 1e3 ? (a(".artisan .product-pumel-image img").attr("height", "900"),a(".new .product-pumel-image img").attr("height", "1900"),a(".new .product-pumel-image").css({top:"10px"}),a(".hero .product-pumel-image img").attr("height", e.clientValue.windowHeight() - 300),a(".hero .text").css({bottom:"30px"}),a(".humane .product-pumel-image img").attr("height", "1200"),a(".humane .product-pumel-image").css({top:"-100%",right:"180px"})) : e.clientValue.windowHeight() < 1580 && e.clientValue.windowHeight() > 1e3 ? (a(".artisan .product-pumel-image img").attr("height", "1305"),a(".hero .product-pumel-image img").attr("height", "740"),a(".hero .text").css({bottom:"70px"}),a(".humane .product-pumel-image img").attr("height", "1450"),a(".humane .product-pumel-image").css({top:"-150%",right:"280px"})) : e.clientValue.windowHeight() > 1580 && (a(".hero .product-pumel-image img").attr("height", "740"),a(".hero .text").css({bottom:"70px"}),a(".humane .product-pumel-image img").attr("height", "1450"),a(".humane .product-pumel-image").css({top:"-150%",right:"280px"})),c._window.width() < 1120 && c._window.width() > 1e3,c._window.width() < 1120) {
            var b = 1120 - c._window.width();
            a(".buy-col").css({"margin-right":b})
        } else a(".buy-col").css({"margin-right":"0px"})
    }};
    e.indexScroll = function(a, b) {
        e.isLast = e.index == e.selectionLength,e.isFirst = 1 == e.index,0 > b ? (!e.isLast && e.index <= c.selection.length && (e.destiTop = e.index * c._window.height() + c.header.height(),e.turn(e.index, b),e.index++,c.dot.is(":hidden") && e.toggleLayout.dotShow(),e.toggleLayout.prossLayout(e.index),c.pross.is(":hidden") && e.toggleLayout.showPross()),e.isLast && (e.toggleLayout.dotHide(),e.destiTop = (e.index - 1) * c._window.height() + c.header.height() + c.footer.height(),e.index = c.selection.length + 1,e.turn(e.index, b)),e.toggleLayout.dotSwitch(e.index - 1)) : (!e.isFirst && e.index > 0 && (e.destiTop = (e.index - 2) * c._window.height() + c.header.height(),e.turn(e.index, b),e.index--,c.dot.is(":hidden") && e.toggleLayout.dotShow(),e.toggleLayout.prossLayout(e.index)),e.isFirst && (e.destiTop = 0,e.turn(e.index, b),e.index = 0,c.pross.is(":hidden") || e.toggleLayout.hidePross()),e.toggleLayout.dotSwitch(e.index - 1))
    },e.$animationCollection = function(b, c) {
        0 > c ? ("0" == b && setTimeout(function() {
            e.isInit && e.animate(function() {
                a(".artisan").find(".product-pumel-image").css({webkitTransform:"translate3d(0px, -150px, 0px)",webkitTransition:"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)","-moz-transform":"translate3d(0px, -150px, 0px)","-moz-transition":"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)"}),a(".artisan").find(".text").css({opacity:"0",webkitTransition:"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)","-moz-transition":"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)"})
            })
        }, 0),"1" == b && setTimeout(function() {
            e.isInit && e.animate(function() {
                a(".new").find(".product-pumel-image").css({webkitTransform:"translate3d(0px, 55px, 0px)",opacity:"1",webkitTransition:"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)","-moz-transform":"translate3d(0px, 55px, 0px)",opacity:"1","-moz-transition":"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)"})
            })
        }, 500),"2" == b && setTimeout(function() {
            e.isInit && e.animate(function() {
                a(".new").find(".product-pumel-image").css({webkitTransform:"translate3d(0px, 185px, 0px)",opacity:"0",webkitTransition:"all 0ms","-moz-transform":"translate3d(0px, 185px, 0px)",opacity:"0","-moz-transition":"all 0ms"})
            })
        }, 1500),"3" == b && setTimeout(function() {
            e.isInit && e.animate(function() {
                a(".humane").find(".product-pumel-image").css({webkitTransform:"translate3d(0px, -90px, 0px)",opacity:"1",webkitTransition:"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)","-moz-transform":"translate3d(0px, -90px, 0px)",opacity:"1","-moz-transition":"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)"})
            })
        }, 500)) : ("1" == b && setTimeout(function() {
            e.isInit && e.animate(function() {
                a(".artisan").find(".product-pumel-image").css({webkitTransform:"translate3d(0px, 0px, 0px)",webkitTransition:"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)","-moz-transform":"translate3d(0px, 0px, 0px)","-moz-transition":"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)"}),a(".artisan").find(".text").css({opacity:"1",webkitTransition:"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)","-moz-transition":"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)"})
            })
        }, 0),"2" == b && setTimeout(function() {
            e.isInit && e.animate(function() {
                a(".new").find(".product-pumel-image").css({webkitTransform:"translate3d(0px, 185px, 0px)",opacity:"0",webkitTransition:"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)","-moz-transform":"translate3d(0px, 185px, 0px)",opacity:"0","-moz-transition":"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)"})
            })
        }, 500),"3" == b && setTimeout(function() {
            e.isInit && e.animate(function() {
                a(".new").find(".product-pumel-image").css({webkitTransform:"translate3d(0px, 55px, 0px)",opacity:"1",webkitTransition:"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)","-moz-transform":"translate3d(0px, 55px, 0px)",opacity:"1","-moz-transition":"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)"})
            })
        }, 500),"4" == b && setTimeout(function() {
            e.isInit && e.animate(function() {
                a(".humane").find(".product-pumel-image").css({webkitTransform:"translate3d(27px, 0px, 0px)",opacity:"0",webkitTransition:"all 0s","-moz-transform":"translate3d(27px, 0px, 0px)",opacity:"0","-moz-transition":"all 0s"})
            })
        }, 1500))
    },e.touchHandler = {isTablet:navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone|Tizen|Bada)/),touchStartX:0,touchStartY:0,touchEndX:0,touchEndY:0,touchSensitivity:5,addTouchHandler:function() {
        e.touchHandler.isTablet && (a(document).on("touchstart MSPointerDown", e.touchHandler.touchStartHandler),a(document).on("touchmove MSPointerMove", e.touchHandler.touchMoveHandler),a(document).off("touchstart MSPointerDown touchmove MSPointerMove", e.touchHandler.epreventDefault))
    },removeTouchHandler:function() {
        e.touchHandler.isTablet && (a(document).on("touchstart MSPointerDown touchmove MSPointerMove", e.touchHandler.epreventDefault),a(document).off("touchstart MSPointerDown", e.touchHandler.touchStartHandler),a(document).off("touchmove MSPointerMove", e.touchHandler.touchMoveHandler))
    },epreventDefault:function(a) {
        a.preventDefault()
    },touchMoveHandler:function(b) {
        var c = b.originalEvent,d = e.touchHandler.getEventsPage(c);
        if (!(c.targetTouches.length > 1) && 1 == c.targetTouches.length) {
            if (e.touchHandler.touchEndY = d.y,e.touchHandler.touchEndX = d.x,Math.abs(e.touchHandler.touchStartY - e.touchHandler.touchEndY) > a(window).height() / 1e3 * e.touchHandler.touchSensitivity)if (e.touchHandler.touchStartY > e.touchHandler.touchEndY)var f = -1; else if (e.touchHandler.touchEndY > e.touchHandler.touchStartY)var f = 1;
            f && e.mouseWheelHandle(b, f)
        }
    },touchStartHandler:function(a) {
        var b = a.originalEvent,c = e.touchHandler.getEventsPage(b);
        e.touchHandler.touchStartY = c.y,e.touchHandler.touchStartX = c.x
    },getEventsPage:function(a) {
        var b = new Array;
        return window.navigator.msPointerEnabled ? (b.y = a.pageY,b.x = a.pageX) : (b.y = a.touches[0].pageY,b.x = a.touches[0].pageX),b
    }},e.$resize = function() {
        c.selection.height(c._window.height()),e.isFooter = e.index == c.selection.length + 1,0 != e.index || e.isFooter ? e.isFooter ? e.isFooter && (e.destiTop = (e.index - 2) * c._window.height() + c.header.height() + c.footer.height()) : e.destiTop = (e.index - 1) * c._window.height() + c.header.height() : e.destiTop = 0,c.wrapper.css({webkitTransition:"0s",webkitTransform:"translate3d(0px, -" + e.destiTop + "px, 0px)","-moz-transform":"translate3d(0px, -" + e.destiTop + "px, 0px)","-moz-transition":"0s"})
    };
    var g = function(a) {
        return 2 == a.which ? !1 : void 0
    },h = function(a) {
        a.preventDefault()
    },i = function() {
        b() || e.touchHandler.isTablet || a(window).scrollTop(0)
    },j = function() {
        var b = c._window.height();
        a("html,body").height(b),e.$resize(b),f.imagePositon()
    },k = function() {
        e.isInit = !0,d(),a("wrapper").addClass("wrapper-transition"),b() ? (a(".new .product-pumel-image").css({opacity:"1"}),a(".humane .product-pumel-image").css({opacity:"1"})) : (a("html,body").addClass(navigator.userAgent.indexOf("Mac") > 0 ? "mac-hidden" : "hidden"),a("html,body").height(a(window).height()),a(document).mousewheel(e.mouseWheelHandle),e.init(),e.touchHandler.addTouchHandler(),a(window).on("scroll", i),c.selection.height(c._window.height()),a(window).on("resize", j),f.imagePositon(),a(document).on("mousewheel", h)),a(document).on("mousedown", g)
    },l = function() {
        e.isInit = !1,d(),a("wrapper").removeClass("wrapper-transition"),c.dot && c.dot.remove(),b() || (a("html,body").removeAttr("class style"),a(document).unmousewheel(e.mouseWheelHandle),e.touchHandler.removeTouchHandler(),a(document).off("touchstart MSPointerDown touchmove MSPointerMove", e.touchHandler.epreventDefault),a(window).off("scroll", i),a(document).off("mousewheel", h),a(window).off("resize", j)),e.toggleLayout.hidePross(),e.toggleLayout.removeTransition(),c.wrapper.attr("style", ""),a(document).off("mousedown", g)
    };
    window.overviewInit = k,window.overviewReset = l,window.checkIE = b
}(jQuery),function(a) {
    var b = {index:0,initFn:function() {
        a(".toggle-nav a").on("click", b.slideView),a(".phone-gallery .gallery-prev,.phone-gallery .gallery-next").on("click", b.phoneGallery),a("wrapper").addClass("wrapper-transition")
    },resetFn:function() {
        a(".toggle-nav a").off("click", b.slideView),a(".phone-gallery .gallery-prev,.phone-gallery .gallery-next").off("click", b.phoneGallery),a("wrapper").removeClass("wrapper-transition")
    },slideView:function(b) {
        b.preventDefault(),a(this).addClass("active").parent().siblings().find("a").removeClass("active");
        var c = a(this).parent().parent(".toggle-nav"),d = c.find("a").index(this),e = c.siblings(".slide-view").find(".slide-view-item").eq(d);
        e.addClass("show").find("h1").css({WebkitTransition:"all 1.8s ease .5s","-moz-transition":"all 1.8s ease .5s"}).addClass("show"),e.find("p").css({WebkitTransition:"all 2.2s ease 1s","-moz-transition":"all 2.2s ease 1s"}).addClass("show"),e.siblings().removeClass("show").find("h1").css({WebkitTransition:"all 1s ease 0s","-moz-ransition":"all 1s ease 0s"}).removeClass("show"),e.siblings().find("p").css({WebkitTransition:"all 1s ease 0s","-moz-ransition":"all 1s ease 0s"}).removeClass("show")
    },phoneGallery:function() {
        var c = a(this).siblings(".gallery-collection").find("li"),d = c.length;
        b.index = "gallery-prev" == a(this).attr("class") ? b.index - 1 < 0 ? d - 1 : b.index - 1 : b.index + 1 > d - 1 ? 0 : b.index + 1,c.eq(b.index).addClass("show").siblings().removeClass("show"),a(this).siblings(".photo-detail").find("a").attr("href", c.eq(b.index).attr("data-url"))
    }};
    window.featureEvent = b
}(jQuery),function(a) {
    var b = {},c = function() {
        b = {main:a(".main"),header:a(".layout-header"),footer:a(".footer"),selection:a(".product-pumel"),wrapper:a(".wrapper"),dot:a(".progress-nav"),pross:a(".product-nav-slide"),_window:a(window)}
    },d = {progressTextArr:["简约，源自隐藏的精密","让你的左右，不被产品左右","以柔韧，构建硬朗","平坦的本质，是极致的曲面","不适感，导致了全新的舒适","喜悦的封装与还原",""],dark:!1,fullpage:!1,index:0,selectionLength:0,destiTop:0,mouse:"down",isLast:!1,isFirst:!1,isFooter:!1,backTop:!1,nextPage:!this.fullPage && !this.isLast,dotLayout:'<div class="progress-nav"><ul></ul></div>',template:'<li><a><span class="dot"></span><span class="dot-stroke"></span><span class="progress-nav-text"></span></a></li>',clientValue:{bodyHeight:function() {
        return d.fetch(["main","footer","header"])
    },headerHeight:function() {
        return d.fetch(["header"])
    },footerHeight:function() {
        return d.fetch(["footer"])
    },windowHeight:function() {
        return d.fetch(["_window"])
    }},reset:function() {
        var a = this;
        a.index = 0,a.selectionLength = 0,a.destiTop = 0
    },init:function() {
        this.reset(),d.selectionLength = b.selection.length,a("body").append(d.dotLayout),b.dot = a(".progress-nav");
        for (var c = 0; c < d.selectionLength; c++)d.progressTextArr[c] || "" == d.progressTextArr[c],a(d.template).appendTo(a(".progress-nav").find("ul")).find(".progress-nav-text").text(d.progressTextArr[c]);
        a(".progress-nav").find("ul li").eq(d.index).addClass("active"),a(".progress-nav").find("ul li").bind("click", d.dotClick)
    },animate:function(a) {
        a()
    },mouseWheelHandle:function(a, c) {
        a.preventDefault(),a = window.event || a,checkIE() || (b.wrapper.animate(),d.scroll(d.destiTop),d.$animationCollection(d.index, c),d.indexScroll(d.destiTop, c))
    },fetch:function(a, c) {
        var d = 0;
        switch (typeof a) {
            case"object":
                for (var e in a)d += b[a[e]].height();
                break;
            case"number":
                if ("up" == c)if (a >= 2)for (var e = 0; a - 2 >= e; e++)d += b.selection.eq(e).height(); else 1 == a && (d = b.selection.eq(0).height()); else if ("down" == c)for (var e = 0; a >= e; e++)d += b.selection.eq(e).height()
        }
        return d
    },scroll:function(a, c, d) {
        b.wrapper.css("0" == c || "1" == c && d > 0 ? {webkitTransform:"translate3d(0px, -" + a + "px, 0px)",webkitTransition:"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)","-moz-transform":"translate3d(0px, -" + a + "px, 0px)","-moz-transition":"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)"} : {webkitTransform:"translate3d(0px, -" + a + "px, 0px)",webkitTransition:"all 1000ms cubic-bezier(0.860, 0.000, 0.070, 1.000)","-moz-transform":"translate3d(0px, -" + a + "px, 0px)","-moz-transition":"all 1000ms cubic-bezier(0.860, 0.000, 0.070, 1.000)"})
    },turn:function(b, c) {
        a(document).unbind("mousewheel", d.mouseWheelHandle),d.touchHandler.removeTouchHandler(),d.scroll(d.destiTop, b, c),setTimeout(function() {
            d.isInit && (a(document).bind("mousewheel", d.mouseWheelHandle),d.touchHandler.addTouchHandler())
        }, 1500),d.toggleLayout.showPross()
    },dotClick:function() {
        return a(this).hasClass("active") ? !1 : (a(document).unbind("mousewheel", d.mouseWheelHandle),d.touchHandler.removeTouchHandler(),b.dot.find("ul li").unbind("click", d.dotClick),b.dot.find("ul li").removeClass("active"),a(this).addClass("active"),d.index = 1 + a(this).index(),d.destiTop = (d.index - 1) * d.fetch(["_window"]) + d.clientValue.headerHeight(),d.turn(d.index),d.toggleLayout.prossLayout(d.index),d.$animationCollection(d.index + 1, "1"),d.$animationCollection(d.index - 1, "-1"),void setTimeout(function() {
            d.isInit && (b.dot.find("ul li").bind("click", d.dotClick),d.touchHandler.addTouchHandler())
        }, 1500))
    },toggleLayout:{prossLayout:function(a) {
        var c = b.selection.eq(a - 1).attr("data-layout");
        "false" == c ? b.pross.removeClass("header-dark") : "true" == c && b.pross.addClass("header-dark")
    },showPross:function() {
        b.pross.addClass("transition"),b.pross.css({opacity:"1",top:"0px"})
    },hidePross:function() {
        b.pross.css({opacity:"0",top:"-50px"})
    },removeTransition:function() {
        b.pross.removeClass("transition")
    },dotSwitch:function(a) {
        0 > a && (a = 0),b.dot.find("ul li").removeClass("active"),b.dot.find("ul li").eq(a).addClass("active")
    },dotHide:function() {
        b.dot.fadeOut(300)
    },dotShow:function() {
        b.dot.fadeIn(300)
    }}},e = {imagePositon:function() {
        if (d.clientValue.windowHeight() < 1e3 ? (a(".accessories .product-full-image img").attr("height", "380"),a(".frame .product-design-image").css({top:"40%"}),a(".frame .product-full-image img").css({top:"40%"}),a(".back .product-design-image").css({top:"-300px"}),a(".accessories .product-full-image img").css({top:"10%"})) : d.clientValue.windowHeight() < 1580 && d.clientValue.windowHeight() > 1e3 ? (a(".accessories .product-full-image img").attr("height", "517"),a(".frame .product-design-image").css({top:"50%"}),a(".back .product-design-image").css({top:"-80px"}),a(".accessories .product-full-image img").css({top:"15%"})) : d.clientValue.windowHeight() > 1580 && (a(".accessories .product-full-image img").attr("height", "517"),a(".frame .product-design-image").css({top:"50%"}),a(".back .product-design-image").css({top:"-80px"}),a(".accessories .product-full-image img").css({top:"15%"})),a(".package-gallery .phone-gallery").css(b._window.width() < 1400 ? {width:"800px"} : b._window.width() < 1540 ? {width:"940px"} : {width:"1120px"}),b._window.width() < 1120 && b._window.width() > 1e3 && (a(".new .text").css({width:b._window.width()}),a(".humane .text").css({width:b._window.width()})),b._window.width() < 1120) {
            var c = 1120 - b._window.width();
            a(".buy-col").css({"margin-right":c})
        } else a(".buy-col").css({"margin-right":"0px"})
    }};
    d.indexScroll = function(a, c) {
        d.isLast = d.index == d.selectionLength,d.isFirst = 1 == d.index,0 > c ? (!d.isLast && d.index <= b.selection.length && (d.destiTop = d.index * b._window.height() + b.header.height(),d.turn(d.index, c),d.index++,b.dot.is(":hidden") && d.toggleLayout.dotShow(),d.toggleLayout.prossLayout(d.index),b.pross.is(":hidden") && d.toggleLayout.showPross()),d.isLast && (d.toggleLayout.dotHide(),d.destiTop = (d.index - 1) * b._window.height() + b.header.height() + b.footer.height(),d.index = b.selection.length + 1,d.turn(d.index, c)),d.toggleLayout.dotSwitch(d.index - 1)) : (!d.isFirst && d.index > 0 && (d.destiTop = (d.index - 2) * b._window.height() + b.header.height(),d.turn(d.index, c),d.index--,b.dot.is(":hidden") && d.toggleLayout.dotShow(),d.toggleLayout.prossLayout(d.index)),d.isFirst && (d.destiTop = 0,d.turn(d.index, c),d.index = 0,b.pross.is(":hidden") || d.toggleLayout.hidePross()),d.toggleLayout.dotSwitch(d.index - 1))
    },d.$animationCollection = function(b, c) {
        0 > c ? ("0" == b && setTimeout(function() {
            d.isInit && d.animate(function() {
                a(".artisan").find(".product-pumel-image").css({webkitTransform:"translate3d(0px, -150px, 0px)",webkitTransition:"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)","-moz-transform":"translate3d(0px, -150px, 0px)","-moz-transition":"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)"}),a(".artisan").find("h2").css({opacity:"0",webkitTransition:"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)","-moz-transition":"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)"})
            })
        }, 0),"1" == b && setTimeout(function() {
            d.isInit && d.animate(function() {
                a(".new").find(".product-pumel-image").css({webkitTransform:"translate3d(0px, 55px, 0px)",opacity:"1",webkitTransition:"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)","-moz-transform":"translate3d(0px, 55px, 0px)",opacity:"1","-moz-transition":"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)"})
            })
        }, 500),"2" == b && setTimeout(function() {
            d.isInit && d.animate(function() {
                a(".new").find(".product-pumel-image").css({webkitTransform:"translate3d(0px, 185px, 0px)",opacity:"0",webkitTransition:"all 0ms","-moz-transform":"translate3d(0px, 185px, 0px)",opacity:"0","-moz-transition":"all 0ms"})
            })
        }, 1500),"3" == b && setTimeout(function() {
            d.isInit && d.animate(function() {
                a(".humane").find(".product-pumel-image").css({webkitTransform:"translate3d(0px, -90px, 0px)",opacity:"1",webkitTransition:"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)","-moz-transform":"translate3d(0px, -90px, 0px)",opacity:"1","-moz-transition":"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)"})
            })
        }, 500)) : ("1" == b && setTimeout(function() {
            d.isInit && d.animate(function() {
                a(".artisan").find(".product-pumel-image").css({webkitTransform:"translate3d(0px, 0px, 0px)",webkitTransition:"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)","-moz-transform":"translate3d(0px, 0px, 0px)","-moz-transition":"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)"}),a(".artisan").find("h2").css({opacity:"1",webkitTransition:"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)","-moz-transition":"all 1200ms cubic-bezier(0.165, 0.840, 0.440, 1.000)"})
            })
        }, 0),"2" == b && setTimeout(function() {
            d.isInit && d.animate(function() {
                a(".new").find(".product-pumel-image").css({webkitTransform:"translate3d(0px, 185px, 0px)",opacity:"0",webkitTransition:"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)","-moz-transform":"translate3d(0px, 185px, 0px)",opacity:"0","-moz-transition":"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)"})
            })
        }, 500),"3" == b && setTimeout(function() {
            d.isInit && d.animate(function() {
                a(".new").find(".product-pumel-image").css({webkitTransform:"translate3d(0px, 55px, 0px)",opacity:"1",webkitTransition:"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)","-moz-transform":"translate3d(0px, 55px, 0px)",opacity:"1","-moz-transition":"all 2000ms cubic-bezier(0.215, 0.610, 0.355, 1.000)"})
            })
        }, 500),"4" == b && setTimeout(function() {
            d.isInit && d.animate(function() {
                a(".humane").find(".product-pumel-image").css({webkitTransform:"translate3d(27px, 0px, 0px)",opacity:"0",webkitTransition:"all 0s","-moz-transform":"translate3d(27px, 0px, 0px)",opacity:"0","-moz-transition":"all 0s"})
            })
        }, 1500))
    },d.touchHandler = {isTablet:navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone|Tizen|Bada)/),touchStartX:0,touchStartY:0,touchEndX:0,touchEndY:0,touchSensitivity:5,addTouchHandler:function() {
        d.touchHandler.isTablet && (a(document).on("touchstart MSPointerDown", d.touchHandler.touchStartHandler),a(document).on("touchmove MSPointerMove", d.touchHandler.touchMoveHandler),a(document).off("touchstart MSPointerDown touchmove MSPointerMove", d.touchHandler.epreventDefault))
    },removeTouchHandler:function() {
        d.touchHandler.isTablet && (a(document).on("touchstart MSPointerDown touchmove MSPointerMove", d.touchHandler.epreventDefault),a(document).off("touchstart MSPointerDown", d.touchHandler.touchStartHandler),a(document).off("touchmove MSPointerMove", d.touchHandler.touchMoveHandler))
    },epreventDefault:function(a) {
        a.preventDefault()
    },touchMoveHandler:function(b) {
        var c = b.originalEvent,e = d.touchHandler.getEventsPage(c);
        if (!(c.targetTouches.length > 1) && 1 == c.targetTouches.length) {
            if (d.touchHandler.touchEndY = e.y,d.touchHandler.touchEndX = e.x,Math.abs(d.touchHandler.touchStartY - d.touchHandler.touchEndY) > a(window).height() / 1e3 * d.touchHandler.touchSensitivity)if (d.touchHandler.touchStartY > d.touchHandler.touchEndY)var f = -1; else if (d.touchHandler.touchEndY > d.touchHandler.touchStartY)var f = 1;
            f && d.mouseWheelHandle(b, f)
        }
    },touchStartHandler:function(a) {
        var b = a.originalEvent,c = d.touchHandler.getEventsPage(b);
        d.touchHandler.touchStartY = c.y,d.touchHandler.touchStartX = c.x
    },getEventsPage:function(a) {
        var b = new Array;
        return window.navigator.msPointerEnabled ? (b.y = a.pageY,b.x = a.pageX) : (b.y = a.touches[0].pageY,b.x = a.touches[0].pageX),b
    }},d.$resize = function() {
        b.selection.height(b._window.height()),d.isFooter = d.index == b.selection.length + 1,0 != d.index || d.isFooter ? d.isFooter ? d.isFooter && (d.destiTop = (d.index - 2) * b._window.height() + b.header.height() + b.footer.height()) : d.destiTop = (d.index - 1) * b._window.height() + b.header.height() : d.destiTop = 0,b.wrapper.css({webkitTransition:"0s",webkitTransform:"translate3d(0px, -" + d.destiTop + "px, 0px)","-moz-transform":"translate3d(0px, -" + d.destiTop + "px, 0px)","-moz-transition":"0s"})
    };
    var f = function(a) {
        return 2 == a.which ? !1 : void 0
    },g = function(a) {
        a.preventDefault()
    },h = function() {
        checkIE() || d.touchHandler.isTablet || a(window).scrollTop(0)
    },i = function() {
        var c = b._window.height();
        a("html,body").height(c),d.$resize(c),e.imagePositon()
    },j = function() {
        d.isInit = !0,c(),a("wrapper").addClass("wrapper-transition"),checkIE() || (a("html,body").addClass(navigator.userAgent.indexOf("Mac") > 0 ? "mac-hidden" : "hidden"),a("html,body").height(a(window).height()),a(document).mousewheel(d.mouseWheelHandle),d.init(),d.touchHandler.addTouchHandler(),a(window).on("scroll", h),b.selection.height(b._window.height()),a(window).on("resize", i),e.imagePositon(),a(document).on("mousewheel", g)),a(document).on("mousedown", f)
    },k = function() {
        d.isInit = !1,c(),a("wrapper").removeClass("wrapper-transition"),b.dot && b.dot.remove(),checkIE() || (a("html,body").removeAttr("class style"),a(document).unmousewheel(d.mouseWheelHandle),d.touchHandler.removeTouchHandler(),a(document).off("touchstart MSPointerDown touchmove MSPointerMove", d.touchHandler.epreventDefault),a(window).off("scroll", h),a(document).off("mousewheel", g),a(window).off("resize", i)),d.toggleLayout.hidePross(),d.toggleLayout.removeTransition(),b.wrapper.attr("style", ""),a(document).off("mousedown", f)
    };
    window.designInit = j,window.designReset = k
}(jQuery),function(a) {
    a.easing.jswing = jQuery.easing.swing,a.extend(a.easing, {def:"easeOutQuad",easeOutQuart:function(a, b, c, d, e) {
        return-d * ((b = b / e - 1) * b * b * b - 1) + c
    }});
    var b = {initFn:function() {
        a("wrapper").addClass("wrapper-transition"),checkIE() || a(document).on({mousewheel:b.mousewheelTrigger,mouseup:b.updateScroll,scroll:b.documentReadyScroll})
    },resetFn:function() {
        a("wrapper").removeClass("wrapper-transition"),checkIE() || a(document).off({mousewheel:b.mousewheelTrigger,mouseup:b.updateScroll,scroll:b.documentReadyScroll})
    },initVariate:function() {
        this.destiTop || (this.destiTop = 0),this.documentHeight = a(document).height(),this.windowHeight = a(window).height(),this.maxScrollHeight = this.documentHeight - this.windowHeight
    },mousewheelTrigger:function(a, c) {
        if (a.preventDefault(),"undefined" == typeof b.documentHeight && b.initVariate(),0 > c) {
            if (b.destiTop == b.maxScrollHeight)return!1;
            Math.abs(b.destiTop) >= b.maxScrollHeight - 100 ? b.destiTop = b.maxScrollHeight : b.destiTop += 100
        } else {
            if (0 == b.destiTop)return!1;
            b.destiTop <= 100 ? b.destiTop = 0 : b.destiTop -= 100
        }
        b.scrolling(b.destiTop)
    },scrolling:function(b) {
        a("html,body").animate({scrollTop:b}, {queue:!1,duration:1e3,easing:"easeOutQuart"})
    },updateScroll:function() {
        b.destiTop = a(window).scrollTop()
    },documentReadyScroll:function() {
        b.destiTop || (b.destiTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop),b.unbindWindowScroll()
    },unbindWindowScroll:function() {
        a(window).unbind("scroll", b.documentReadyScroll)
    }};
    !checkIE(),window.mwScroll = b
}(jQuery),function(a) {
    var b = {initFn:function() {
        a(".color-option-black,.color-option-white").on({mouseover:b.mouseover,mouseout:b.mouseout,click:b.click}),a("wrapper").addClass("wrapper-transition")
    },resetFn:function() {
        a(".color-option-black,.color-option-white").off({mouseover:b.mouseover,mouseout:b.mouseout,click:b.click}),a("wrapper").removeClass("wrapper-transition")
    },mouseover:function(b) {
        b.preventDefault(),a(this).find(".selected").is(":hidden") && (checkIE() ? a(this).find(".hover").show() : a(this).find(".hover").animate({opacity:"1"}, {queue:!1}))
    },mouseout:function() {
        checkIE() ? a(this).find(".hover").hide() : a(this).find(".hover").animate({opacity:"0"}, {queue:!1})
    },click:function() {
        a(this).find(".selected").fadeIn(300),a(this).siblings().find(".selected").fadeOut(300);
        var b = checkIE();
        if (window.navigator.userAgent.toLowerCase().indexOf("trident/7.0") > 0 && (b = !1),a(this).hasClass("color-option-black")) {
            if (!a(".procuct-blank").is(":hidden") && "1" == a(".procuct-blank").css("opacity"))return;
            b ? (a(".procuct-blank").show().css({opacity:"1"}),a(".procuct-white").hide().css({opacity:"0"}),a(".product-size").css({background:"url(img/product_image/webkit/detail/procuct-size-black.png) 396px 30px no-repeat","background-image":"-webkit-image-set(url(img/product_image/webkit/detail/procuct-size-black.png) 1x,url(img/product_image/webkit/detail/procuct-size-black@2x.png) 2x)"}),a(".product-interface").css({background:"url(img/product_image/webkit/detail/procuct-interface-black.jpg) left 106px no-repeat","background-image":"-webkit-image-set(url(img/product_image/webkit/detail/procuct-interface-black.jpg) 1x,url(img/product_image/webkit/detail/procuct-interface-black@2x.jpg) 2x)"})) : (a(".procuct-blank").css({opacity:"1"}),a(".procuct-white").css({opacity:"0"}),a(".product-size").css({background:"url(img/product_image/webkit/detail/procuct-size-black.png) 396px 30px no-repeat","background-image":"-webkit-image-set(url(img/product_image/webkit/detail/procuct-size-black.png) 1x,url(img/product_image/webkit/detail/procuct-size-black@2x.png) 2x)","-WebkitTransition":"background-image .3s ease-out","-moz-transition":"background-image .3s ease-out"}),a(".product-interface").css({background:"url(img/product_image/webkit/detail/procuct-interface-black.jpg) left 106px no-repeat","background-image":"-webkit-image-set(url(img/product_image/webkit/detail/procuct-interface-black.jpg) 1x,url(img/product_image/webkit/detail/procuct-interface-black@2x.jpg) 2x)","-WebkitTransition":"background-image .3s ease-out","-moz-transition":"background-image .3s ease-out"}))
        } else {
            if (!a(".procuct-white").is(":hidden") && "1" == a(".procuct-white").css("opacity"))return;
            b ? (a(".procuct-white").show().css({opacity:"1"}),a(".procuct-blank").hide().css({opacity:"0"}),a(".product-size").css({background:"url(img/product_image/webkit/detail/procuct-size-white.png) 396px 30px no-repeat","background-image":"-webkit-image-set(url(img/product_image/webkit/detail/procuct-size-white.png) 1x,url(img/product_image/webkit/detail/procuct-size-white@2x.png) 2x)"}),a(".product-interface").css({background:"url(img/product_image/webkit/detail/procuct-interface-white.jpg) left 106px no-repeat","background-image":"-webkit-image-set(url(img/product_image/webkit/detail/procuct-interface-white.jpg) 1x,url(img/product_image/webkit/detail/procuct-interface-white@2x.jpg) 2x)"})) : (a(".procuct-white").css({opacity:"1"}),a(".procuct-blank").css({opacity:"0"}),a(".product-size").css({background:"url(img/product_image/webkit/detail/procuct-size-white.png) 396px 30px no-repeat","background-image":"-webkit-image-set(url(img/product_image/webkit/detail/procuct-size-white.png) 1x,url(img/product_image/webkit/detail/procuct-size-white@2x.png) 2x)","-WebkitTransition":"background-image .3s ease-out","-moz-transition":"background-image .3s ease-out"}),a(".product-interface").css({background:"url(img/product_image/webkit/detail/procuct-interface-white.jpg) left 106px no-repeat","background-image":"-webkit-image-set(url(img/product_image/webkit/detail/procuct-interface-white.jpg) 1x,url(img/product_image/webkit/detail/procuct-interface-white@2x.jpg) 2x)","-WebkitTransition":"background-image .3s ease-out","-moz-transition":"background-image .3s ease-out"}))
        }
    }};
    window.detailEvent = b
}(jQuery);