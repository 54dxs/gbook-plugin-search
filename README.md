# 搜索

该插件是GBook的默认插件，它为您的书添加了一个交互式搜索栏。

该插件与后端无关。

### 禁用此插件

这是默认插件，可以使用以下 `book.json` 配置禁用它：

```
{
    plugins: ["-search"]
}
```

### Backends

| Backend |   插件名称   |    描述     |
| ------- | ----------- | ----------- |
| [Lunr](https://github.com/GitbookIO/plugin-lunr) | `lunr` | Index the content into a local/offlien index |
| [Algolia](https://github.com/GitbookIO/plugin-algolia) | `algolia` | Index the content in Algolia |

### 搜索选项

`plugin-search` 的大多数后端将支持下面列出的一系列常见配置。**如果某些backend不支持某些选项，则应检查每个backend的描述。**.


#### 向页面添加关键字

您可以为任何页面指定显式关键字。搜索这些关键字时，该页面在搜索结果中的排名应更高。

```md
---
search:
    keywords: ['keyword1', 'keyword2', 'etc.']
---

# My Page

此页面应该是第一个搜索结果中的"keyword1"。
```

#### 禁用页面索引

您可以通过向页面添加YAML标头来禁用特定页面的索引：

```md
---
search: false
---

# My Page

此页面将不会出现在搜索结果中。
```
