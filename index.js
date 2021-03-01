
const {Collection} = require('./collection');

class HomeCollection extends Collection {

    reload(_, cb) {
        let pageUrl = new PageURL(this.url);
        this.fetch(this.url).then((doc)=>{

            let items = [];

            function processNode(node) {
                let item = glib.DataItem.new();
                item.type = glib.DataItem.Type.Header;
                item.title = node.querySelector('h3.title').text.replace(',', '').trim();
                items.push(item);

                let list = node.querySelectorAll('ul.myui-vodlist > li');
                for (let vod of list) {
                    let item = glib.DataItem.new();
                    item.title = vod.querySelector('.myui-vodlist__detail h4.title').text;
                    item.subtitle = vod.querySelector('.myui-vodlist__detail .text').text;
                    let imgLink = vod.querySelector('.myui-vodlist__thumb');
                    item.link = pageUrl.href(imgLink.attr('href'));
                    item.picture = pageUrl.href(imgLink.attr('data-original'));
                    items.push(item);
                }
            }

            let panel = doc.querySelector('.myui-panel-box');
            processNode(panel);

            let list = doc.querySelectorAll('.myui-panel-box');
            for (let node of list) {
                let vlist = node.querySelector('ul.myui-vodlist');
                if (vlist) {
                    processNode(node);
                }
            }
            this.setData(items);
            cb.apply(null);
        }).catch((err)=>{
            if (err instanceof Error) {
                console.log("Err " + err.message + " stack " + err.stack);
                err = glib.Error.new(305, err.message);
            }
            cb.apply(err);
        });
        return true;
    }
}

class CategoryCollection extends Collection {

    constructor(data) {
        super(data);
        this.page = 0;
    }

    async fetch(url) {
        let pageUrl = new PageURL(url);

        let doc = await super.fetch(url);
        let nodes = doc.querySelectorAll('ul.myui-vodlist > li');

        let items = [];
        for (let vod of nodes) {
            let item = glib.DataItem.new();
            item.title = vod.querySelector('.myui-vodlist__detail h4.title').text;
            item.subtitle = vod.querySelector('.myui-vodlist__detail .text').text;
            let imgLink = vod.querySelector('.myui-vodlist__thumb');
            item.link = pageUrl.href(imgLink.attr('href'));
            item.picture = pageUrl.href(imgLink.attr('data-original'));
            items.push(item);
        }
        return items;
    }

    makeURL(page) {
        if (this.url.indexOf('{0}') == -1) return this.url;
        return this.url.replace('{0}', page + 1);
    }

    reload(_, cb) {
        let page = 0;
        this.fetch(this.makeURL(page)).then((results)=>{
            this.page = page;
            this.setData(results);
            cb.apply(null);
        }).catch(function(err) {
            if (err instanceof Error) 
                err = glib.Error.new(305, err.message);
            cb.apply(err);
        });
        return true;
    }

    loadMore(cb) {
        if (this.url.indexOf('{0}') == -1) return false;
        let page = this.page + 1;
        this.fetch(this.makeURL(page)).then((results)=>{
            this.page = page;
            this.appendData(results);
            cb.apply(null);
        }).catch(function(err) {
            if (err instanceof Error) 
                err = glib.Error.new(305, err.message);
            cb.apply(err);
        });
        return true;
    }
}

module.exports = function(info) {
    let data = info.toObject();
    if (data.id === 'home') 
        return HomeCollection.new(data);
    else return CategoryCollection.new(data);
};
