actualStore = null;
actualTravel = null;

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
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
        ctx.drawImage(self.img(), self.x, self.y);
    };
}

function edge(n1, n2, distance) {
    var self = this;
    self.node1 = n1;
    self.node2 = n2;
    self.distance = distance;
    self.selected = false;

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
        if (self.selected)
            ctx.strokeStyle = 'green';
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
                self.edges.push(new edge(desde, hasta, i.distancia));
            });
            Travel
                .query("it.almacen.id == " + actualStore.pk + " && it.pk == " + actualTravel.pk)
                .then(function (items) {
                    items.forEach(function (item) {
                        var i = JSON.parse(JSON.stringify(item));
                        var p = Enumerable.From(JSON.parse(i.path[0].path));
                        var edges_ = Enumerable.From(self.edges());
                        edges_
                            .Where(function (e) {
                                return (p.Any("$.path[0] == " + e.node1.pk) && p.Any("$.path[0] == " + e.node2.pk))
                                        || (p.Any("$.path[1] == " + e.node1.pk) && p.Any("$.path[1] == " + e.node2.pk));
                            })
                            .ForEach(function (e) {
                                e.selected = true;
                            });
                    });
                    done();
                });
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

    self.remove = function (n) {
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

    self.save = function () {
        var nodos = Enumerable.From(self.nodes()).Select(function (n) {
            return {
                almacen: n.store,
                pk: n.pk,
                tipo: n.type,
                x: n.x,
                y: n.y,
                nombre: n.name
            };
        }).ToArray();

        var ajaxs = function () {
            var a = [];
            $.each(nodos, function (idx, n) {
                a.push($.ajax({
                    type: n.pk ? 'put' : 'post',
                    url: document.location.origin + "/nodos/" + (n.pk ? n.pk + "/" : ''),
                    data: JSON.stringify(n),
                    contentType: "application/json",
                    async: true
                }));
            });
            return a;
        }

        $.when($, ajaxs()).then(function () {
            self.load();
        });

        var nodeArt = Enumerable.From(self.nodes()).SelectMany(function (n) {
            return Enumerable.From(n.articles()).Select(function (nA) {
                return {
                    nodo: n.pk,
                    articulo: nA.article().data.pk,
                    cantidad: nA.actualAmount(),
                    capacidad: nA.capacity()
                };
            });
        }).ToArray();

        $.each(nodeArt, function (i, nA) {
            $.ajax({
                type: nA.pk ? 'put' : 'post',
                url: document.location.origin + "/nodo_articulo/" + (nA.pk ? nA.pk + "/" : ''),
                data: JSON.stringify(nA),
                contentType: "application/json",
                async: true,
                success: function (data) {
                    self.load();
                }
            });
        });
    }

    self.load = function (done) {
        Node.query("it.almacen == " + actualStore.pk)
            .then(function (items) {
                self.nodes.removeAll();
                items.forEach(function (item) {
                    var i = JSON.parse(JSON.stringify(item));
                    self.nodes.push(new node(i));
                });
                done();
            });
    }
}

function toAddArticle() {
    var self = this;
    self.article = ko.observable();
    self.capacity = ko.observable();
    self.actualAmount = ko.observable();
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
        self.articles.push(new toAddArticle());
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
                self.nodesManager.remove(node);
            }
            else if (edge = self.getSelectedEdge(e)) {
                self.edgesManager.remove(edge);
            }
            self.redraw();
        }
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


        self.nodesManager.save();
        self.redraw();
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

    Store.readAll().then(function (data) {
        data.forEach(function (store) {
            Travel
                .readAll()
                .then(function (d) {
                    d.forEach(function (travel) {
                        actualTravel = travel;
                    });
                    actualStore = store;
                    self.canvas.init(document.getElementById("canvas"));
                });
        });
    })
}