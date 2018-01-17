// 右侧正文导航

window.onload = function() {

    titleOfContent();

    tocFixed();

    // 生成toc
    function titleOfContent() {
        console.log("toc get data start....");
        var $postContent = document.querySelectorAll(".post-content")[0];
        var toc = [];
        var stack = [];
        $postContent.childNodes.forEach(element => {
            if (stack.length == 0) {
                if (element.nodeName == 'H2' || element.nodeName == 'H3') {
                    stack.push(element);
                    return;
                }
            } else {
                if (element.nodeName == 'H2') {
                    var $h2 = stack.shift();
                    var childs = stack;
                    toc.push({ "item": $h2, "childs": childs });

                    stack = [];
                    stack.push(element);
                    return;
                }
                if (element.nodeName == 'H3') {
                    stack.push(element);
                    return;
                }
            }
        });
        // console.log(toc);

        // 将toc转成页面
        var htmlStr = "<ul>";
        toc.forEach(element => {
            if (element.childs.length < 1) {
                htmlStr += "<li><a href='#" + element.item.id + "'>" + element.item.textContent + "</a></li>";
            } else {
                htmlStr += "<li><a href='#" + element.item.id + "'>" + element.item.textContent + "</a><ul>";
                // h3
                element.childs.forEach(element => {
                    htmlStr += "<li><a href='#" + element.id + "'>" + element.textContent + "</a></li>";
                });
                htmlStr += "</ul></li>";
            }
        });
        htmlStr += "</ul>";

        // console.log(htmlStr);
        document.getElementById("toc").innerHTML = htmlStr;
        console.log("toc get data end....");
    }

    // toc位置随鼠标滚动变化
    function tocFixed() {
        var $toc = document.getElementsByClassName("toc-widget")[0];
        var tocOffsetTop = $toc.offsetTop + document.getElementsByClassName("content-wrap")[0].offsetTop;
        var tocWidth = $toc.offsetWidth;
        // console.log(tocWidth);
        //监听滚动事件
        window.addEventListener('scroll', function() {
            var hight = document.body.scrollTop || document.documentElement.scrollTop;
            if (hight >= tocOffsetTop) {
                // console.log("距离达到");
                $toc.style.position = 'fixed';
                $toc.style.top = '0';
                $toc.style.width = tocWidth + 'px';
            } else {
                $toc.style.cssText = '';
                $toc.style.position = "relative";
            }
        });
    }
};