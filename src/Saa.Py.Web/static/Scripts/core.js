﻿
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

function node(x, y, img) {
    var self = this;
    self.x = x;
    self.y = y;
    self.img = img;

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
        return false;
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
    self.edges = [];

    self.addEdge = function (n1, n2) {
        var e = new edge(n1, n2);
        self.edges.push(e);
        return e;
    }
}

function nodes() {
    var self = this;
    self.nodes = [];

    self.addNode = function (x, y) {
        var n = new node(x, y, document.getElementById("node"));
        self.nodes.push(n);
        return n;
    }
}

function storeCanvas(nodes, edges) {
    var self = this;
    self.ctx = null;
    self.mode = null;
    self.nodesManager = nodes;
    self.edgesManager = edges;
    self.currentOper = function (e) { };
    self.selected = null;

    self.addNodeClick = function () {
        self.currentOper = function (e) {
            self.nodesManager.addNode(e.x, e.y).draw(self.ctx);
        }
    };

    self.connectionModeClick = function () {
        self.currentOper = function (e) {
            for (var i = 0; i < self.nodesManager.nodes.length; i++) {
                if (self.nodesManager.nodes[i].isPointInside(e.x, e.y)) {
                    if (self.selected !== null) {
                        var other = self.nodesManager.nodes[i];
                        self.edgesManager.addEdge(self.selected, other).draw(self.ctx);
                        self.selected = null;
                        break;
                    }
                    self.selected = self.nodesManager.nodes[i];
                }
            }
        }
    };

    self.init = function (can) {
        self.ctx = can.getContext('2d');

        var img = document.createElement('img');
        img.src = 'store.gif';
        img.onload = function () {
            self.ctx.drawImage(this, 0, 0, can.width, can.height);
        }

        $(can).click(function (e) {
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
    self.nodes = new nodes();
    self.edges = new edges();
    self.canvas = new storeCanvas(self.nodes, self.edges);

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