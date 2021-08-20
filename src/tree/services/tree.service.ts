import { HttpService, Injectable } from '@nestjs/common';
import { NodewithChildren } from 'src/models/tree.interface';
import { data } from 'src/models/data.interface';
import { Tree } from '../function/tree';

@Injectable()
export class TreeService {
    constructor(
        private httpService: HttpService
    ) {}

    data = null;
    root = null;

    async findData() {

        // @@ consumo de datos @@
        const response = await this.httpService.get('https://test.defontana.com').toPromise();
        
        const tree = new Tree();
       
        let result = await this.generateTree(response)
        const data = JSON.stringify([result])

        // @@ HTML DE Arbol graficado interactivo @@
        let HTML = await `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
        
            <title>Tree Example</title>
        
            <style>
            
            .node {
                cursor: pointer;
            }
        
            .node circle {
              fill: #fff;
              stroke: steelblue;
              stroke-width: 3px;
            }
        
            .node text {
              font: 12px sans-serif;
            }
        
            .link {
              fill: none;
              stroke: #ccc;
              stroke-width: 2px;
            }
            
            </style>
        
          </head>
        
          <body>
        
        <!-- load the d3.js library -->	
        <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js"></script>
            
        <script>
        
        var treeData = [
          {
            "name": "Top Level",
            "parent": "null",
            "children": [
              {
                "name": "Level 2: A",
                "parent": "Top Level",
                "children": [
                  {
                    "name": "Son of A",
                    "parent": "Level 2: A"
                  },
                  {
                    "name": "Daughter of A",
                    "parent": "Level 2: A"
                  }
                ]
              },
              {
                "name": "Level 2: B",
                "parent": "Top Level"
              }
            ]
          }
        ];
        
        
        // ************** Generate the tree diagram	 *****************
        var margin = {top: 20, right: 120, bottom: 20, left: 120},
            width = 1660 - margin.right - margin.left,
            height = 500 - margin.top - margin.bottom;
            
        var i = 0,
            duration = 750,
            root;
        
        var tree = d3.layout.tree()
            .size([height, width]);
        
        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });
        
        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        root = ${data}[0];
        root.x0 = height / 2;
        root.y0 = 0;
          
        update(root);
        
        d3.select(self.frameElement).style("height", "500px");
        
        function update(source) {
        
          // Compute the new tree layout.
          var nodes = tree.nodes(root).reverse(),
              links = tree.links(nodes);
        
          // Normalize for fixed-depth.
          nodes.forEach(function(d) { d.y = d.depth * 180; });
        
          // Update the nodes…
          var node = svg.selectAll("g.node")
              .data(nodes, function(d) { return d.id || (d.id = ++i); });
        
          // Enter any new nodes at the parent's previous position.
          var nodeEnter = node.enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
              .on("click", click);
        
          nodeEnter.append("circle")
              .attr("r", 1e-6)
              .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
        
          nodeEnter.append("text")
              .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
              .attr("dy", ".35em")
              .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
              .text(function(d) { return d.name; })
              .style("fill-opacity", 1e-6);
        
          // Transition nodes to their new position.
          var nodeUpdate = node.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
        
          nodeUpdate.select("circle")
              .attr("r", 10)
              .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
        
          nodeUpdate.select("text")
              .style("fill-opacity", 1);
        
          // Transition exiting nodes to the parent's new position.
          var nodeExit = node.exit().transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
              .remove();
        
          nodeExit.select("circle")
              .attr("r", 1e-6);
        
          nodeExit.select("text")
              .style("fill-opacity", 1e-6);
        
          // Update the links…
          var link = svg.selectAll("path.link")
              .data(links, function(d) { return d.target.id; });
        
          // Enter any new links at the parent's previous position.
          link.enter().insert("path", "g")
              .attr("class", "link")
              .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
              });
        
          // Transition links to their new position.
          link.transition()
              .duration(duration)
              .attr("d", diagonal);
        
          // Transition exiting nodes to the parent's new position.
          link.exit().transition()
              .duration(duration)
              .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
              })
              .remove();
        
          // Stash the old positions for transition.
          nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
          });
        }
        
        // Toggle children on click.
        function click(d) {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          update(d);
        }
        
        </script>
            
          </body>
        </html>`

        return await HTML;
    }

    // funcion de creacion de arbol
    async generateTree(response){
        let nodes:[] = response.data.data, i=0, index
        const tree = new Tree();

        nodes = await nodes.sort((a, b) => parseFloat(a["Parent"]) - parseFloat(b["Parent"]));
        
        // @@ Correccion de Nombres incompletos @@
        nodes.forEach((element:data) => {
            switch (element.Name) {
                case "ukaryota":
                    element.Name ="Eukaryota"
                    break;
                case "uryarchaeota":
                    element.Name ="Euryarchaeota"
                    break;
                case "renarchaeota":
                    element.Name ="Crenarchaeota"
                    break;
                case "orarchaeota":
                    element.Name ="Korarchaeota"
                    break;
                case "occals":
                    element.Name ="Coccals"
                    break;
                case "acilus":
                    element.Name ="Bacilus"
                    break;
                case "pirillum":
                    element.Name ="Spirillum"
                    break;
                case "rchaea":
                    element.Name = "Archaea"
                    break;
                case "acteria":
                    element.Name = "Bacteria"
                    break;
            
                default:
                    break;
            }
        })

        //  @@ Creacion de arbol @@
        while (nodes.length > 0) {
            let children = [], removed = []
            i++
            //  ***primera capa***
            if(tree.root === null ) {
                nodes.forEach(Element => {
                    index =  nodes.findIndex((data:data) => data.Parent === 0)
                    if (nodes[index]!= undefined && nodes[index]["Parent"] === 0) {
                        let json = {
                            "Id": Number(nodes[index]["ID"]),
                            "name": nodes[index]["Name"]
                        }
                        children.push(json)
                        removed = nodes.splice(index,1)
                    }
                    
                });
                tree.root = new NodewithChildren("")
                tree.root.children = children
               
            } else {
                //  ***segunda capa***
                await tree.root.children.forEach((element2:NodewithChildren) => {
                    children = [], removed = []
                    nodes.forEach((Element:data) => {

                        if(Element.Parent === element2.Id) {
                            let json = {
                                "Id": Element.ID,
                                "name": Element.Name
                            }
                            children.push(json)
                        }
                    });
                    let node = new NodewithChildren(element2.name);
                    node.children = children
                    if (element2.name === node.name && children.length != 0) {
                        element2.children = children
                    }
                    
                    //  ***tercera capa***
                    element2.children.forEach((element3:NodewithChildren) => {
                        children = [], removed = []
                        nodes.forEach((Element:data) => {
                            if(Element.Parent === Number(element3.Id)) {
                                let json = {
                                    "Id": Element.ID,
                                    "name": Element.Name
                                }
                                children.push(json)
                            }
                        });
                        let node = new NodewithChildren(element3.name);
                        node.children = children
                        if (element3.name === node.name && children.length != 0) {
                            element3.children = children
                        }

                        //  ***cuarta capa***
                        if (element3.children === undefined) {
                            true
                        } else {
                            element3.children.forEach((element4:NodewithChildren) => {
                                children = [], removed = []
                                nodes.forEach((Element:data) => {
                                    if(Element.Parent === Number(element4.Id)) {
                                        let json = {
                                            "Id": Element.ID,
                                            "name": Element.Name
                                        }
                                        children.push(json)
                                    }
                                });
                                let node = new NodewithChildren(element4.name);
                                node.children = children
                                if (element4.name === node.name && children.length != 0) {
                                    element4.children = children
                                }

                                //  ***quinta capa***
                                if (element4.children === undefined) {
                                    true
                                } else {
                                    element4.children.forEach((element5:NodewithChildren) => {
                                        children = [], removed = []
                                        nodes.forEach((Element:data) => {
                                            if(Element.Parent === Number(element5.Id)) {
                                                let json = {
                                                    "Id": Element.ID,
                                                    "name": Element.Name
                                                }
                                                children.push(json)
                                            }
                                        });
                                        let node = new NodewithChildren(element5.name);
                                        node.children = children
                                        if (element5.name === node.name && children.length != 0) {
                                            element5.children = children
                                        }

                                        //  ***sexta capa***
                                        if (element5.children === undefined) {
                                            true
                                        } else {
                                            element5.children.forEach((element6:NodewithChildren) => {
                                                children = [], removed = []
                                                nodes.forEach((Element:data) => {
                                                    if(Element.Parent === Number(element6.Id)) {
                                                        let json = {
                                                            "Id": Element.ID,
                                                            "name": Element.Name
                                                        }
                                                        children.push(json)
                                                    }
                                                });
                                                let node = new NodewithChildren(element6.name);
                                                node.children = children
                                                if (element6.name === node.name && children.length != 0) {
                                                    element6.children = children
                                                }

                                                //  ***septima capa***
                                                if (element6.children === undefined) {
                                                    true
                                                } else {

                                                    element6.children.forEach((element7:NodewithChildren) => {
                                                        children = [], removed = []
                                                        nodes.forEach((Element:data) => {
                                                            if(Element.Parent === Number(element7.Id)) {
                                                                let json = {
                                                                    "Id": Element.ID,
                                                                    "name": Element.Name
                                                                }
                                                                children.push(json)
                                                            }  
                                                        });
                                                        let node = new NodewithChildren(element7.name);
                                                        node.children = children
                                                        if (element7.name === node.name && children.length != 0) {
                                                            element7.children = children
                                                        }

                                                        //  ***octaba capa***
                                                        if (element7.children === undefined) {
                                                            true
                                                        } else {

                                                            element7.children.forEach((element8:NodewithChildren) => {
                                                                children = [], removed = []
                                                                nodes.forEach((Element:data) => {
                                                                    if(Element.Parent === Number(element8.Id)) {
                                                                        let json = {
                                                                            "Id": Element.ID,
                                                                            "name": Element.Name
                                                                        }
                                                                        children.push(json)
                                                                    }
                                                                });
                                                                let node = new NodewithChildren(element8.name);
                                                                node.children = children
                                                                if (element8.name === node.name && children.length != 0) {
                                                                    element8.children = children
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })

                                        }
                                    })
                                }
                            })
                        }
                        
                    })
                });
    
            }
            if(i===10) nodes = []
        }
        return tree.root
    }

}
