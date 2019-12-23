require([
    'gbook',
    'jquery'
], function(gbook, $) {
    var MAX_RESULTS = 15;
    var MAX_DESCRIPTION_SIZE = 500;

    var usePushState = (typeof history.pushState !== 'undefined');

    // DOM Elements
    var $body = $('body');
    var $bookSearchResults;
    var $searchInput;
    var $searchList;
    var $searchTitle;
    var $searchResultsCount;
    var $searchQuery;

    // 限制搜索
    function throttle(fn, wait) {
        var timeout;

        return function() {
            var ctx = this, args = arguments;
            if (!timeout) {
                timeout = setTimeout(function() {
                    timeout = null;
                    fn.apply(ctx, args);
                }, wait);
            }
        };
    }

    function displayResults(res) {
        $bookSearchResults.addClass('open');

        var noResults = res.count == 0;
        $bookSearchResults.toggleClass('no-results', noResults);

        // 清除旧结果
        $searchList.empty();

        // 从搜索结果中展示标题
        $searchResultsCount.text(res.count);
        $searchQuery.text(res.query);

		// 遍历搜索结果创建<li>进行展示
        res.results.forEach(function(res) {
            var $li = $('<li>', {
                'class': 'search-results-item'
            });

            var $title = $('<h3>');

            var $link = $('<a>', {
                'href': gbook.state.basePath + '/' + res.url,
                'text': res.title,
                'click': function(e) {
                    closeSearch();
                }
            });

            var content = res.body.trim();
            if (content.length > MAX_DESCRIPTION_SIZE) {
                content = content.slice(0, MAX_DESCRIPTION_SIZE).trim()+'...';
            }
            var $content = $('<p>').html(content);

            $link.appendTo($title);
            $title.appendTo($li);
            $content.appendTo($li);
            $li.appendTo($searchList);
        });
    }

    function launchSearch(q) {
        // 添加要加载的类
        $body.addClass('with-search');
        $body.addClass('search-loading');

        // 启动搜索查询
        throttle(gbook.search.query(q, 0, MAX_RESULTS)
        .then(function(results) {
            displayResults(results);
        })
        .always(function() {
            $body.removeClass('search-loading');
        }), 1000);
    }

    function closeSearch() {
        $body.removeClass('with-search');
        $bookSearchResults.removeClass('open');
        // 将搜索输入框置空
        $searchInput.val('');
    }

    function launchSearchFromQueryString() {
        var q = getParameterByName('q');
        if (q && q.length > 0) {
            // 更新搜索输入框
            $searchInput.val(q);

            // 启动搜索
            launchSearch(q);
        }
    }

    function bindSearch() {
        // 绑定 DOM
        $searchInput        = $('#book-search-input input');
        $bookSearchResults  = $('#book-search-results');
        $searchList         = $bookSearchResults.find('.search-results-list');
        $searchTitle        = $bookSearchResults.find('.search-results-title');
        $searchResultsCount = $searchTitle.find('.search-results-count');
        $searchQuery        = $searchTitle.find('.search-query');

        // 基于输入内容启动查询
        function handleUpdate() {
            var q = $searchInput.val();

            if (q.length == 0) {
                closeSearch();
            }
            else {
                launchSearch(q);
            }
        }

        // 检测搜索输入中的真实内容更改
		// IE<9的解决方案
        var propertyChangeUnbound = false;
        $searchInput.on('propertychange', function(e) {
            if (e.originalEvent.propertyName == 'value') {
                handleUpdate();
            }
        });

        // HTML5 (IE9 & others)
        $searchInput.on('input', function(e) {
            // Unbind propertychange event for IE9+
            if (!propertyChangeUnbound) {
                $(this).unbind('propertychange');
                propertyChangeUnbound = true;
            }

            handleUpdate();
        });

        // Push to history on blur
        $searchInput.on('blur', function(e) {
            // 更新历史状态
            if (usePushState) {
                var uri = updateQueryString('q', $(this).val());
                history.pushState({ path: uri }, null, uri);
            }
        });
    }

    gbook.events.on('page.change', function() {
        bindSearch();
        closeSearch();

        // 基于查询参数的启动搜索
        if (gbook.search.isInitialized()) {
            launchSearchFromQueryString();
        }
    });

    gbook.events.on('search.ready', function() {
        bindSearch();

        // 在开始时从查询参数启动搜索
        launchSearchFromQueryString();
    });

    function getParameterByName(name) {
        var url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)', 'i'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    function updateQueryString(key, value) {
        value = encodeURIComponent(value);

        var url = window.location.href;
        var re = new RegExp('([?&])' + key + '=.*?(&|#|$)(.*)', 'gi'),
            hash;

        if (re.test(url)) {
            if (typeof value !== 'undefined' && value !== null)
                return url.replace(re, '$1' + key + '=' + value + '$2$3');
            else {
                hash = url.split('#');
                url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
                if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                    url += '#' + hash[1];
                return url;
            }
        }
        else {
            if (typeof value !== 'undefined' && value !== null) {
                var separator = url.indexOf('?') !== -1 ? '&' : '?';
                hash = url.split('#');
                url = hash[0] + separator + key + '=' + value;
                if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                    url += '#' + hash[1];
                return url;
            }
            else
                return url;
        }
    }
});
