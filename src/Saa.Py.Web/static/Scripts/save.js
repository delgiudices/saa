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

    self.isPointInside = function (x, y) {
        var x1 = self.node1.x;
        var x2 = self.node2.x;
        var y1 = self.node1.y;
        var y2 = self.node2.y;

        var A = (x2 - x1);
        var B = (y2 - y1);
        var C = (-B * x1) + (A * y1);

        var r = B * x - A * y + C;
        return false;
        //return (x >= self.x && x <= self.x + self.img.width && y >= self.y && y <= self.y + self.img.height);
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
        var e = new edge(n1, n2);
        self.edges.push(e);
        return e;
    };

    self.removeByNode = function (node) {
        var edges = Enumerable.From(self.edges()).Where(function (n) {
            return n.node1.guid === node.guid || n.node2.guid === node.guid;
        }).ToArray();
        for (var i = 0; i < edges.length; i++) {
            self.edges.remove(edges[i]);
        }

    };
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

        //TODO: Use update funcion. sucks... but it's the way to go :(
        //TODO: Load the map when saved
        //TODO: List maps

        //TODO: Add edges distance
        //TODO: Edit map funcionality
        //TODO: Add server side validations
        //TODO: Add client side validations
        //TODO: Avoid edges to self node
        //TODO: Travels should added to a queue

        //TODO: Center lines
        //TODO: Center (Point) related to mouse position when adding nodes
        //TODO: Style points by type
        //TODO: Make a resume of the point on mouse over
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
        node.name = self.name();
        node.type = self.type();
        node.x = self.x();
        node.y = self.y();
        node.articles = self.articles();
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
            var toSelect = self.getSelectedNode(e);
            if (!toSelect) {
                self.toEditNode(null);
                return;
            }
            self.toEditNode(new toEditNode(toSelect));
        };
    }

    self.addNodeClick = function (model, evt) {
        self.asSelectTool(evt);
        self.clearSelected();
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
        self.currentOper = function (e) {
            var toSelect = self.getSelectedNode(e);
            self.getSelectedEdge(e);
            if (!toSelect) return;
            console.log(toSelect);
            self.nodesManager.remove(toSelect);
            self.redraw();
        }
    }

    self.connectionModeClick = function (model, evt) {
        self.asSelectTool(evt);
        self.currentOper = function (e) {
            var toSelect = self.getSelectedNode(e);
            if (!toSelect) return;
            if (self.selected()) {
                self.edgesManager.addEdge(self.selected(), toSelect).draw(self.ctx);
                self.clearSelected();
                return;
            }
            self.selected(toSelect);
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

    self.cancelToEdit = function (model) {
        self.toEditNode(new toEditNode(self.toEditNode().node));
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
        self.nodesManager.save();
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
        { value: "almacenamiento", text: "Almacenamiento" },
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