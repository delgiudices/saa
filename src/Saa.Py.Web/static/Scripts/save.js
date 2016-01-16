//TODO: Hacer que solo haya una entrada y una salida.
function travelDescriptionViewModel(model) {
    var self = this;
    self.selected = ko.observable();
    self.id = ko.observable(model.article()[0].data.pk);
    self.description = ko.observable(model.article()[0].data.nombre);
    self.articleNodeName = ko.observable(model.article()[0].node);
    self.amount = ko.observable(model.amount());
}

function toAddModel() {
    var self = this;
    self.article = ko.observable();
    self.amount = ko.observable();
}

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function node(x, y, img) {
    var self = this;
    self.name = "";
    self.x = x;
    self.y = y;
    self.articles = [];
    self.img = img;
    self.guid = guid();
    self.nodes = [];

    self.isPointInside = function (x, y) {
        return (x >= self.x && x <= self.x + self.img.width && y >= self.y && y <= self.y + self.img.height);
    }

    self.draw = function (ctx) {
        ctx.drawImage(self.img, self.x, self.y);
    };
}

function edge(n1, n2) {
    var self = this;
    self.node1 = n1;
    self.node2 = n2;
    self.distance = null;

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
        ctx.stroke();
    };
}

function edges() {
    var self = this;
    self.edges = ko.observableArray();

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
}

function nodes(edges) {
    var self = this;
    self.nodes = ko.observableArray();
    self.edges = edges;

    self.addNode = function (x, y) {
        var n = new node(x, y, document.getElementById("node"));
        self.nodes.push(n);
        return n;
    }

    self.remove = function (n) {
        self.nodes.remove(n);
        self.edges.removeByNode(n);
    }

    self.save = function () {

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
    self.articles = ko.observableArray(node.articles);
    self.node = node;

    self.addArticle = function () {
        self.articles.push(new toAddArticle());
    };

    self.persist = function () {
        self.node.name = self.name();
        self.node.type = self.type();
        self.node.x = self.x();
        self.node.y = self.y();
        self.node.articles = self.articles();

    };
}

function toEditEdge(edge) {
    var self = this;
    self.node1 = ko.observable(edge.node1);
    self.node2 = ko.observable(edge.node2);
    self.distance = ko.observable(edge.distance);
    self.edge = edge;

    self.persist = function () {
        self.edge.node1 = self.node1();
        self.edge.node2 = self.node2();
        self.edge.distance = self.distance();
    };
}

function background(src, onload) {
    var self = this;
    self.img = document.createElement('img');
    self.img.src = src;
    self.img.onload = onload,

    self.draw = function (ctx) {
        ctx.drawImage(self.img, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
}

function storeCanvas(nodes, edges, bkImage) {
    var self = this;
    self.ctx = null;
    self.mode = null;
    self.nodesManager = nodes;
    self.edgesManager = edges;
    self.currentOper = function (e) { };
    self.selected = ko.observable();
    self.toEditNode = ko.observable();
    self.toEditEdge = ko.observable();
    self.background = new background(bkImage);
    self.fileImage = ko.observable();

    self.redraw = function () {
        self.ctx.clearRect(0, 0, self.ctx.canvas.width, self.ctx.canvas.height);
        self.background.draw(self.ctx);

        $.each(self.nodesManager.nodes(), function (i, e) {
            e.draw(self.ctx);
        });
        $.each(self.edgesManager.edges(), function (i, e) {
            e.draw(self.ctx);
        });
    }

    self.fileImage.subscribe(function (a) {
        var reader = new FileReader();
        reader.onload = function (e) {
            self.background = new background(e.target.result);
            self.redraw();
        }
        reader.readAsDataURL($("#mapImage").prop('files')[0]);
    });

    self.pointer = function (model, evt) {
        self.asSelectTool(evt);
        self.clearSelected();
        self.currentOper = function (e) {
            var node = self.getSelectedNode(e);
            if (node) {
                self.toEditNode(new toEditNode(node));
                self.toEditEdge(null);
                return;
            }

            self.toEditNode(null);
            var edge = self.getSelectedEdge(e);
            if (edge) {
                self.toEditEdge(new toEditEdge(edge));
            } else {
                self.toEditEdge(null);
            }
        };
    }

    self.addNodeClick = function (model, evt) {
        self.asSelectTool(evt);
        self.clearSelected();
        self.toEditEdge(null);
        self.currentOper = function (e) {
            var n = self.nodesManager.addNode(e.x, e.y);
            self.toEditNode(new toEditNode(n));
            n.draw(self.ctx);
        }
    };

    self.removePoint = function (model, evt) {
        self.asSelectTool(evt);
        self.clearSelected();
        self.toEditNode(null);
        self.toEditEdge(null);
        self.currentOper = function (e) {
            var node = self.getSelectedNode(e);
            var edge = self.getSelectedEdge(e);
            if (node) {
                self.nodesManager.remove(node);
            }
            if (edge) {
                self.edgesManager.remove(edge);
            }
            self.redraw();
        }
    }

    self.connectionModeClick = function (model, evt) {
        self.asSelectTool(evt);

        self.currentOper = function (e) {
            var node = self.getSelectedNode(e);
            if (!node) return;
            if (self.selected()) {
                var edge = self.edgesManager.addEdge(self.selected(), node);
                if (!edge) {
                    self.clearSelected();
                    return;
                }
                edge.draw(self.ctx);
                self.toEditEdge(new toEditEdge(edge));
                self.toEditNode(null);
                self.clearSelected();
                return;
            }
            self.toEditEdge(null);
            self.toEditNode(new toEditNode(node));
            self.selected(node);
        }
    };

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

    self.clearSelected = function () {
        self.selected(null);
    };

    self.save = function (model, evt) {
        self.asSelectTool(evt);
        self.clearSelected();
        //self.nodesManager.save();
        //self.edgesManager.save();
    };

    self.init = function (can) {
        self.ctx = can.getContext('2d');
        self.background.draw(self.ctx);

        $(self.ctx.canvas).click(function (e) {
            var x = e.pageX - this.offsetLeft - $(this).parent().offset().left;
            var y = e.pageY - this.offsetTop - $(this).parent().offset().top;

            self.currentOper({ x, y });
        });
    };
};

function viewModel() {
    var self = this;
    self.travels = ko.observableArray();

    self.toAddModel = ko.observable(new toAddModel());

    self.addArticle = function () {
        var arts = Enumerable.From(self.travels());
        if (arts.Any(function (a) {
            return a.id() === self.toAddModel().article()[0].data.pk;
        })) {
            var ar = arts.Single(function (a) {
                return a.id() === self.toAddModel().article()[0].data.pk;
            });
            ar.amount(parseInt(ar.amount()) + parseInt(self.toAddModel().amount()));
        } else {
            self.travels.push(new travelDescriptionViewModel(self.toAddModel()));
        }
        self.toAddModel().article(null);
        self.toAddModel().amount(null);
        $("#articulo").val(null).trigger("change");;
        $("#articulo").focus();
    }

    self.deleteArticle = function (vm) {
        self.travels.remove(vm);
    }

    self.selectAll = function (t) {
        var arts = Enumerable.From(self.travels());
        arts.ForEach(function (vm) {
            vm.selected(true);
        });
    }

    self.actionsVisible = ko.computed(function () {
        return self.travels().length > 0;
    });

    self.deleteSelectedVisible = ko.computed(function () {
        return Enumerable.From(self.travels()).Any(function (a) {
            return a.selected();
        });
    });

    self.deleteSelected = function () {
        self.travels.remove(function (a) {
            return a.selected();
        });
    }
    self.edges = new edges();
    self.nodes = new nodes(self.edges);

    self.canvas = new storeCanvas(self.nodes, self.edges, "");
    self.nodeTypes = ko.observableArray([
        { value: "punto", text: "Punto" },
        { value: "almacen", text: "Almacenamiento" },
        { value: "entrada", text: "Entrada" },
        { value: "salida", text: "Salida" }
    ]);

    self.spec = {
        ajax: {
            url: '/articulos/',
            dataType: 'json',
            delay: 250,
            processResults: function (data, page) {
                return {
                    results: $.map(data, function (item) {
                        return { id: item.pk, text: item.nombre, data: item };
                    })
                };
            }
        },
        allowClear: true,
        minimumInputLength: 1,
        placeholder: "Seleccionar un artículo",
        templateResult: function (item) {
            return item.text;
        },
        templateSelection: function (item) {
            return item.text;
        },
        escapeMarkup: function (markup) { return markup; }
    };
}