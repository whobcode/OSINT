/**
 * @file This script is the soul of the OSINT visualization, a diabolical instrument
 * for charting the vast, interconnected web of reconnaissance tools. It uses the
 * archaic but still potent magic of D3.js (v3) to render a collapsible tree.
 * Each node, a tool in our arsenal, can have its secrets revealed by the AI oracle
 * on hover. Tremble and learn.
 * @author Justin Nordine (s0lray) - The Original Creator
 * @author ivelLevi - The Mastermind of its Rebirth
 */

const margin = [20, 120, 20, 140];
const width = 1280 - margin[1] - margin[3];
const height = 800 - margin[0] - margin[2];
let i = 0;
const duration = 750;
let root;

const tree = d3.layout.tree()
    .size([height, width]);

const diagonal = d3.svg.diagonal()
    .projection(d => [d.y, d.x]);

const vis = d3.select("#body").append("svg:svg")
    .attr("width", width + margin[1] + margin[3])
    .attr("height", height + margin[0] + margin[2])
    .append("svg:g")
    .attr("transform", `translate(${margin[3]},${margin[0]})`);

d3.json("arf.json", function(json) {
    root = json;
    root.x0 = height / 2;
    root.y0 = 0;

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    root.children.forEach(collapse);
    update(root);
});

/**
 * This is the grand orchestrator. It redraws the tree of knowledge, expanding and
 * collapsing nodes with a dreadfully smooth animation. It ensures that each tool
 * finds its proper place in the grand design.
 * @param {object} source - The node that was clicked, the epicenter of the change.
 */
function update(source) {
    const nodes = tree.nodes(root).reverse();
    nodes.forEach(d => { d.y = d.depth * 180; });

    const node = vis.selectAll("g.node")
        .data(nodes, d => d.id || (d.id = ++i));

    const nodeEnter = node.enter().append("svg:g")
        .attr("class", "node")
        .attr("transform", `translate(${source.y0},${source.x0})`)
        .on("click", d => { toggle(d); update(d); })
        .on("mouseover", async function(d) {
            if (d.url) return; // Don't fetch for parent nodes
            const title = d3.select(this).select("title");
            if (title.attr("data-loaded")) return;

            title.text("The oracle is contemplating...");
            try {
                const response = await fetch(`/generate-description?tool=${encodeURIComponent(d.name)}`);
                if (!response.ok) {
                    throw new Error(`Oracle returned status ${response.status}`);
                }
                const data = await response.json();
                const description = data.response || "The oracle is silent on this matter.";
                title.text(description);
                title.attr("data-loaded", "true");
            } catch (error) {
                console.error("Failed to fetch from oracle:", error);
                title.text(`Oracle consultation failed. Relying on the old scrolls: ${d.description || ''}`);
            }
        });

    nodeEnter.append("svg:circle")
        .attr("r", 1e-6)
        .style("fill", d => d._children ? "lightsteelblue" : "#fff");

    nodeEnter.append('a')
        .attr("target", "_blank")
        .attr('xlink:href', d => d.url)
        .append("svg:text")
        .attr("x", d => d.children || d._children ? -10 : 10)
        .attr("dy", ".35em")
        .attr("text-anchor", d => d.children || d._children ? "end" : "start")
        .text(d => d.name)
        .style("fill-opacity", 1e-6);

    nodeEnter.append("svg:title")
        .text(d => d.description || "Hover to summon an insight from the oracle...");

    const nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", d => `translate(${d.y},${d.x})`);

    nodeUpdate.select("circle")
        .attr("r", 6)
        .style("fill", d => d._children ? "lightsteelblue" : "#fff");

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    const nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", `translate(${source.y},${source.x})`)
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    const link = vis.selectAll("path.link")
        .data(tree.links(nodes), d => d.target.id);

    link.enter().insert("svg:path", "g")
        .attr("class", "link")
        .attr("d", () => {
            const o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
        })
        .transition()
        .duration(duration)
        .attr("d", diagonal);

    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    link.exit().transition()
        .duration(duration)
        .attr("d", () => {
            const o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
        })
        .remove();

    nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

/**
 * A simple yet powerful incantation. This function toggles the visibility of a
 * node's children, hiding or revealing the deeper layers of our framework at my command.
 * @param {object} d - The node whose children shall be revealed or concealed.
 */
function toggle(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
}

/**
 * Plunges the interface into a more... appropriate aesthetic. Toggles 'dark-Mode'
 * on the body, for those who prefer to work in the shadows. As all true geniuses do.
 */
function goDark() {
    const element = document.body;
    element.classList.toggle("dark-Mode");
} 