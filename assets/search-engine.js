require([
    'gbook',
    'jquery'
], function(gbook, $) {
    // Global search objects
    var engine      = null;
    var initialized = false;

    // Set a new search engine
    function setEngine(Engine, config) {
        initialized = false;
        engine      = new Engine(config);

        init(config);
    }

    // 使用配置初始化搜索引擎
    function init(config) {
        if (!engine) throw new Error('没有设置搜索引擎,请使用gbook.research.setEngine(Engine)设置搜索引擎');

        return engine.init(config)
        .then(function() {
            initialized = true;
            gbook.events.trigger('search.ready');
        });
    }

    // 启动查询q的搜索
    function query(q, offset, length) {
        if (!initialized) throw new Error('搜索尚未初始化');
        return engine.search(q, offset, length);
    }

    // 获取有关搜索的统计信息
    function getEngine() {
        return engine? engine.name : null;
    }

    function isInitialized() {
        return initialized;
    }

    // 初始化 gbook.search
    gbook.search = {
        setEngine:     setEngine,
        getEngine:     getEngine,
        query:         query,
        isInitialized: isInitialized
    };
});