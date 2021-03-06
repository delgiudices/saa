﻿actualStore = null;
actualTravel = null;

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function travel(art, nodes) {
    var self = this;
    self.edges = ko.observableArray();
    self.art = ko.observable();
    self.nodes = nodes;
    $.get(document.location.origin + "\\articulos\\" + art + "\\", function (article) {
        self.art(article.nombre);
    });
}

function node(n) {
    var self = this;
    self.pk = n.pk;
    self.name = n.nombre;
    self.x = n.x;
    self.y = n.y;
    self.store = n.almacen;
    self.type = n.tipo;
    self.articles = ko.observableArray([]);
    self.guid = guid();
    self.nodes = ko.observableArray(n.nodes);

    self.selected = false;
    self.img = function () {
        return self.selected ? document.getElementById("selectedNode") : document.getElementById("node");
    };
    self.isPointInside = function (x, y) {
        return (x >= self.x && x <= self.x + self.img().width && y >= self.y && y <= self.y + self.img().height);
    }
    self.draw = function (ctx) {
        if (self.name) {
            ctx.save();
            ctx.font = "bold 12px Comic Sans MS";
            ctx.fillStyle = "black";
            ctx.fillText(self.name, self.x - 20, self.y - 2);
            ctx.restore();
        }
        ctx.drawImage(self.img(), self.x, self.y);
    };
}

function edge(n1, n2, distance, pk) {
    var self = this;
    self.pk = pk;
    self.node1 = n1;
    self.node2 = n2;
    self.distance = distance;
    self.selected = false;
    self.highLigth = false;

    self.isPointInside = function (x, y) {
        //http://stackoverflow.com/a/24044684
        // calculate the point on the line that's 
        // nearest to the mouse position
        function linepointNearestMouse(line, x, y) {
            //
            lerp = function (a, b, x) { return (a + x * (b - a)); };
            var dx = line.x1 - line.x0;
            var dy = line.y1 - line.y0;
            var t = ((x - line.x0) * dx + (y - line.y0) * dy) / (dx * dx + dy * dy);
            var lineX = lerp(line.x0, line.x1, t);
            var lineY = lerp(line.y0, line.y1, t);
            return ({ x: lineX, y: lineY });
        };
        //http://stackoverflow.com/a/24044684
        var linepoint = linepointNearestMouse({
            x0: self.node1.x,
            y0: self.node1.y,
            x1: self.node2.x,
            y1: self.node2.y
        }, x, y);
        var tolerance = 3;
        var dx = x - linepoint.x;
        var dy = y - linepoint.y;
        var distance = Math.abs(Math.sqrt(dx * dx + dy * dy));

        return distance < tolerance;
    }

    self.draw = function (ctx) {
        ctx.beginPath();
        ctx.moveTo(self.node1.x, self.node1.y);
        ctx.lineTo(self.node2.x, self.node2.y);
        ctx.lineWidth = 2;
        ctx.save();
        ctx.font = "bold 12px Arial";
        ctx.fillStyle = "red";
        var xMiddle = ((self.node1.x + self.node2.x) / 2) + 2;
        var yMiddle = ((self.node1.y + self.node2.y) / 2) - 3;
        ctx.fillText(self.distance, xMiddle, yMiddle);
        if (self.selected || self.highLigth) {
            if (self.selected) { ctx.strokeStyle = 'green'; }
            if (self.highLigth) { ctx.strokeStyle = 'red'; }
        }

        else
            ctx.restore();
        ctx.stroke();
        ctx.restore();
    };
}

function edges() {
    var self = this;
    self.edges = ko.observableArray();
    self.nodes = ko.observableArray();
    self.travels = ko.observableArray();

    self.addEdge = function (n1, n2) {
        if (n1.guid === n2.guid) {
            alert("Un nodo no puede conectarse así mismo.");
            return undefined;
        }
        if (Enumerable.From(self.edges()).Any(function (e) {
            return (e.node1.guid === n1.guid || e.node2.guid === n1.guid) && (e.node1.guid === n2.guid || e.node2.guid === n2.guid);
        })) {
            alert("Ya existe una conexión para estos nodos.");
            return undefined;
        }

        var e = new edge(n1, n2);
        n1.nodes.push(n2);
        n2.nodes.push(n1);
        self.edges.push(e);
        return e;
    };

    self.remove = function (e) {
        self.edges.remove(e);
    }

    self.removeByNode = function (node) {
        var edges = Enumerable.From(self.edges()).Where(function (e) {
            return e.node1.guid === node.guid || e.node2.guid === node.guid;
        }).ToArray();
        for (var i = 0; i < edges.length; i++) {
            self.edges.remove(edges[i]);
        }

    };

    self.byNode = function (node) {
        return Enumerable.From(self.edges()).Where(function (e) {
            return e.node1.guid === node.guid || e.node2.guid === node.guid;
        }).FirstOrDefault();
    }

    self.load = function (done) {
        Edge.query("it.desde in ids || it.hasta in ids", {
            ids: $.map(self.nodes, function (n) {
                return n.pk;
            })
        }).then(function (items) {
            self.edges.removeAll();
            items.forEach(function (item) {
                var i = JSON.parse(JSON.stringify(item));
                var nodesEnumerable = Enumerable.From(self.nodes());
                var desde = nodesEnumerable.Single(function (n) { return n.pk === i.desde; });
                var hasta = nodesEnumerable.Single(function (n) { return n.pk === i.hasta; });
                self.edges.push(new edge(desde, hasta, i.distancia, i.pk));
            });

            $.get(window.location.origin + "/viajes/" + actualTravel.pk + "/", function (item) {
                var i = JSON.parse(item.path);
                var edges_ = Enumerable.From(self.edges());

                i.forEach(function (i2) {
                    var tra_ = new travel(i2.articulo, i2.camino);
                    i2.path.forEach(function (c) {
                        var ed_ = edges_.Single(function (e) {
                            return e.pk === c;
                        });
                        ed_.selected = true;
                        tra_.edges.push(ed_);
                    });
                    self.travels.push(tra_);
                });
                done();
            })

        });
    }

    self.save = function (done) {
        var edges = Enumerable.From(self.edges()).Select(function (d) {
            return {
                pk: d.pk,
                desde: d.node1.pk,
                hasta: d.node2.pk,
                distancia: d.distance
            };
        });

        var requests = edges.Select(function (edge) {
            return $.ajax({
                type: edge.pk ? "PUT" : "POST",
                url: window.location.origin + "/caminos/" + (edge.pk ? edge.pk + "/" : ""),
                data: edge,
                cache: false,
                success: function (d) {
                    //console.debug(JSON.stringify(d) + "Done");
                }
            });
        });

        $.when($, requests.ToArray()).then(function (x) {
            self.load(done);
        });
    }
}

function nodes(edges) {
    var self = this;
    self.nodes = ko.observableArray();
    self.edges = edges;

    self.addNode = function (n) {
        var n_ = new node(n);
        self.nodes.push(n_);
        return n_;
    }

    self.remove = function (n, done) {
        if (n.pk) {
            var request = $.ajax({
                type: "DELETE",
                url: window.location.origin + "/nodos/" + n.pk + "/",
            });

            $.when($, request).then(function (x) {
                self.load(done);
            });
        }
        else {
            Enumerable.From(self.nodes()).Where(function (n2) {
                return Enumerable.From(n2.nodes()).Any(function (n3) {
                    return n3.guid === n.guid;
                });
            }).ForEach(function (n2) {
                n2.nodes.remove(n);
            });
            self.nodes.remove(n);
            self.edges.removeByNode(n);
            delete n;
        }
    }

    self.save = function (done) {
        var nodos = Enumerable.From(self.nodes()).Select(function (n) {
            return {
                almacen: n.store,
                pk: n.pk,
                tipo: n.type,
                x: n.x,
                y: n.y,
                nombre: n.name
            };
        });

        var requests = nodos.Select(function (node) {
            return $.ajax({
                type: node.pk ? "PUT" : "POST",
                url: window.location.origin + "/nodos/" + (node.pk ? node.pk + "/" : ""),
                data: node,
                cache: false,
                success: function (d) {
                    //console.debug(JSON.stringify(d) + "Done");
                }
            });
        });

        $.when($, requests.ToArray()).then(function (x) {
            var articles =
            Enumerable.From(self.nodes())
                .SelectMany(function (n) {
                    return n.articles();
                })
                .Select(function (na) {
                    return {
                        pk: na.pk,
                        nodo: na.node.pk,
                        articulo: na.article().pk,
                        cantidad: na.actualAmount(),
                        capacidad: na.capacity()
                    };
                });

            var rqs = articles.Select(function (art) {
                return $.ajax({
                    type: art.pk ? "PUT" : "POST",
                    url: window.location.origin + "/nodo_articulo/" + (art.pk ? art.pk + "/" : ""),
                    data: art,
                    cache: false,
                    success: function (d) {
                        //console.debug(JSON.stringify(d) + "Done");
                    }
                });
            });

            $.when($, rqs.ToArray()).then(function (x) {
                self.load(done);
            });
        });
    }

    self.load = function (done) {
        Node.query("it.almacen == " + actualStore.pk)
            .then(function (items) {
                self.nodes.removeAll();
                items.forEach(function (item) {
                    var i = JSON.parse(JSON.stringify(item));
                    var n = new node(i);
                    $.get(document.location.origin + "/nodo_articulo/?nodo=" + n.pk, function (nArts) {
                        nArts.forEach(function (nArt) {
                            $.get(document.location.origin + "/articulos/" + nArt.articulo, function (art) {
                                n.articles.push(new toAddArticle(n, nArt, art));
                            });
                        });
                    });
                    self.nodes.push(n);
                });
                done();
            });
    }
}

function toAddArticle(node, nArts, art) {
    var self = this;
    self.pk = nArts ? nArts.pk : null;
    self.article = nArts ? ko.observable(art) : ko.observable();
    self.capacity = nArts ? ko.observable(nArts.capacidad) : ko.observable();
    self.actualAmount = nArts ? ko.observable(nArts.cantidad) : ko.observable();
    self.node = node;
}

function toEditNode(node) {
    var self = this;
    self.name = ko.observable(node ? node.name : "");
    self.type = ko.observable(node ? node.type : "");
    self.x = ko.observable(node ? node.x : null);
    self.y = ko.observable(node ? node.y : null);
    self.articles = ko.observableArray(node.articles());
    self.node = node;

    self.addArticle = function () {
        self.articles.push(new toAddArticle(self.node));
    };

    self.persist = function () {
        self.node.name = self.name();
        self.node.type = self.type();
        self.node.x = self.x();
        self.node.y = self.y();
        self.node.articles(self.articles());
    };
}

function toEditEdge(edge) {
    var self = this;
    self.distance = ko.observable(edge.distance);
    self.edge = edge;

    self.persist = function () {
        self.edge.distance = self.distance();
    };
}

function background(onload) {
    var self = this;
    self.img = document.createElement('img');
    self.img.onload = onload,

    self.update = function (src) {
        self.img.src = src;
    }

    self.draw = function (ctx) {
        ctx.drawImage(self.img, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
}

function storeCanvas(nodes, edges) {
    var self = this;
    self.ctx = null;
    self.nodesManager = nodes;
    self.edgesManager = edges;
    self.currentOper = function (e) { };
    self.firstToConnectNode = ko.observable();
    self.toEditNode = ko.observable(null);
    self.toEditEdge = ko.observable();
    self.fileImage = ko.observable();
    self.redraw = function () {
        self.ctx.clearRect(0, 0, self.ctx.canvas.width, self.ctx.canvas.height);
        self.background.draw(self.ctx, self.redraw);

        $.each(self.nodesManager.nodes(), function (i, e) {
            e.draw(self.ctx);
        });
        $.each(self.edgesManager.edges(), function (i, e) {
            e.draw(self.ctx);
        });
    }
    self.background = new background(self.redraw);

    self.fileImage.subscribe(function (a) {
        var reader = new FileReader();
        reader.onload = function (e) {
            self.background.update(e.target.result);
        }
        reader.readAsDataURL($("#mapImage").prop('files')[0]);
    });

    self.pointer = function (model, evt) {
        self.asSelectTool(evt);
        self.clearFirstToConnectNode();
        self.currentOper = function (e) {
            var node = self.getSelectedNode(e);
            if (node) {
                self.selectNode(node);
                self.unselectEdge();
            } else {
                var edge = self.getSelectedEdge(e);
                if (edge) {
                    self.unselectNode();
                    self.selectEdge(edge);
                } else {
                    self.unselectEdge();
                    self.unselectNode();
                }
            }
            self.redraw();
        };
    }

    self.addNodeClick = function (model, evt) {
        self.asSelectTool(evt);
        self.clearFirstToConnectNode();
        self.unselectEdge();
        self.currentOper = function (e) {
            self.selectNode(self.nodesManager.addNode({ x: e.x, y: e.y, tipo: "punto", almacen: 1 }));
        }
    };

    self.connectionModeClick = function (model, evt) {
        self.asSelectTool(evt);

        self.currentOper = function (e) {
            var node = self.getSelectedNode(e);
            if (!node) return;
            if (self.firstToConnectNode()) {
                var edge = self.edgesManager.addEdge(self.firstToConnectNode(), node);
                if (!edge) {
                    self.clearFirstToConnectNode();
                    self.unselectNode();
                } else {
                    self.selectEdge(edge);
                    self.unselectNode();
                    self.clearFirstToConnectNode();
                }
            } else {
                self.unselectEdge();
                self.selectNode(node);
                self.firstToConnectNode(node);
            }
        }
    };

    self.removePoint = function (model, evt) {
        self.asSelectTool(evt);
        self.clearFirstToConnectNode();
        self.unselectEdge();
        self.unselectNode();
        self.currentOper = function (e) {
            var node = self.getSelectedNode(e);
            var edge = null;
            if (node) {
                self.nodesManager.remove(node, self.redraw);
            }
            else if (edge = self.getSelectedEdge(e)) {
                self.edgesManager.remove(edge);
            }
            self.redraw();
        }
        self.redraw();
    }

    self.showPath = function (model, evt) {
        model.edges().forEach(function (e) {
            e.highLigth = true;
        });
        self.redraw();
    }

    self.hidePath = function (model, evt) {
        model.edges().forEach(function (e) {
            e.highLigth = false;
        });
        self.redraw();
    }

    self.selectEdge = function (e) {
        self.unselectEdge();
        self.toEditEdge(new toEditEdge(e));
        self.redraw();
    }

    self.unselectEdge = function () {
        if (!self.toEditEdge()) return;
        self.toEditEdge(null);
        self.redraw();
    };

    self.selectNode = function (n) {
        self.unselectNode();
        self.toEditNode(new toEditNode(n));
        self.redraw();
    }

    self.unselectNode = function () {
        if (!self.toEditNode()) return;
        self.toEditNode(null);
        self.redraw();
    }

    self.asSelectTool = function (e) {
        var active = $(".activeTool");
        active.removeClass("activeTool");
        $(e.target).addClass("activeTool");
    };

    self.saveToEdit = function () {
        self.toEditNode().persist();
    }

    self.cancelToEdit = function () {
        self.toEditNode(new toEditNode(self.toEditNode().node));
    }

    self.saveToEditEdge = function () {
        self.toEditEdge().persist();
    }

    self.cancelToEditEdge = function () {
        self.toEditEdge(new toEditEdge(self.toEditEdge().edge));
    }

    self.deleteArticle = function (model) {
        self.toEditNode().articles.remove(model);
    }

    self.getSelectedEdge = function (e) {
        for (var i = 0; i < self.edgesManager.edges().length; i++) {
            var n = self.edgesManager.edges()[i];
            if (n.isPointInside(e.x, e.y))
                return n;
        }
    }

    self.getSelectedNode = function (e) {
        for (var i = 0; i < self.nodesManager.nodes().length; i++) {
            var n = self.nodesManager.nodes()[i];
            if (n.isPointInside(e.x, e.y))
                return n;
        }
    }

    self.clearFirstToConnectNode = function () {
        self.firstToConnectNode(null);
    }

    self.save = function (model, evt) {
        self.asSelectTool(evt);
        if ($("#mapImage").prop('files')[0]) {
            var formData = new FormData();

            formData.append("nombre", "nombre");
            formData.append("mapa", $("#mapImage").prop('files')[0]);

            $.ajax({
                url: document.location.origin + "/almacenes/" + 1 + "/",
                type: "PUT",
                data: formData,
                enctype: 'multipart/form-data',
                async: true,
                success: function (msg) {
                    alert(msg + " Guardado Exitosamente!");
                },
                cache: false,
                contentType: false,
                processData: false
            });
        }
        self.nodesManager.save(function () {
            self.edgesManager.save(self.redraw);
        });
    }

    self.init = function (can) {
        self.ctx = can.getContext('2d');
        if (actualStore.mapa)
            self.background.img.src = actualStore.mapa;
        self.nodesManager.load(function () {
            self.edgesManager.load(self.redraw);
        });
        $(self.ctx.canvas).click(function (e) {
            var x = e.pageX - this.offsetLeft - $(this).parent().offset().left;
            var y = e.pageY - this.offsetTop - $(this).parent().offset().top;

            self.currentOper({ x, y });
        });
    }
};

function viewModel() {
    var self = this;

    self.edges = new edges();
    self.nodes = new nodes(self.edges);
    self.edges.nodes = self.nodes.nodes;
    self.canvas = new storeCanvas(self.nodes, self.edges);
    self.nodeTypes = ko.observableArray([
        { value: "punto", text: "Punto" },
        { value: "almacen", text: "Almacenamiento" },
        { value: "entrada", text: "Entrada" },
        { value: "salida", text: "Salida" }
    ]);
    self.articles = ko.observableArray();
    Article.readAll().then(function (arts) {
        self.articles.removeAll();
        $(arts).each(function (i, e) {
            self.articles.push(e);
        })
    });
    self.articulos =
    Store.readAll().then(function (data) {
        data.forEach(function (store) {
            Travel
                .read(getUrlParameter("travelId"))
                .then(function (d) {
                    actualTravel = d;
                    actualStore = store;
                    self.canvas.init(document.getElementById("canvas"));
                });
        });
    })
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};