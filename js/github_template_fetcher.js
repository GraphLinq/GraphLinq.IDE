const baseTemplateListUrl = "https://raw.githubusercontent.com/GraphLinq/Graph-Templates/master/graph_list.json";

export const fetchTemplatesFromGithub = async () => {
    const res = await fetch(baseTemplateListUrl);
    const json = await res.json();
    return json;
}