import Handlebars from "handlebars";

const templates = [];

export const fetchHandlebarTemplate = async(url) => {
    if(templates[url] != null) return templates[url];
    const template = Handlebars.compile(await (await fetch(url)).text());
    templates[url] = template;
    return template;
}