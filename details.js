
const {Collection} = require('./collection');
const detail_url = "https://agefans.org/myapp/_get_ep_plays?ep={0}&anime_id={1}";

class DetailsCollection extends Collection {
    
    async fetch(url) {
        let pageUrl = new PageURL(url);
        let doc = await super.fetch(url);

        let info_data = this.info_data;
        info_data.summary = doc.querySelector('.content').text.trim();

        let tabs = doc.querySelector('ul.nav-tabs');
        let items = [];
        let list = tabs.querySelectorAll('li > a');
        for (let tab of list) {
            let subtitle = tab.text;
            let id = tab.attr('href');
            let nodes = doc.querySelectorAll(`${id} > ul > li > a`);
            for (let link of nodes) {
                let item = glib.DataItem.new();
                item.title = link.text;
                item.subtitle = subtitle;
                item.link = pageUrl.href(link.attr('href'));
                items.push(item);
            }
        }

        return items;
    }

    reload(_, cb) {
        this.fetch(this.url).then((results)=>{
            this.setData(results);
            cb.apply(null);
        }).catch(function(err) {
            if (err instanceof Error) 
                err = glib.Error.new(305, err.message);
            cb.apply(err);
        });
        return true;
    }
}

module.exports = function(item) {
    return DetailsCollection.new(item);
};