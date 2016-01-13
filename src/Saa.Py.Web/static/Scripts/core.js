$(function () {
    var articulosModel = [
        { id: 1, description: "test1", node: "A1" },
        { id: 2, description: "test2", node: "A1" },
        { id: 3, description: "test3", node: "A2" }
    ];

    function travelDescriptionViewModel(model) {
        var self = this;
        self.selected = ko.observable();
        self.id = ko.observable(model.article().id);
        self.description = ko.observable(model.article().description);
        self.articleNodeName = ko.observable(model.article().node);
        self.amount = ko.observable(model.amount());
    }

    function toAddModel() {
        var self = this;
        self.article = ko.observable();
        self.amount = ko.observable();
    }

    function viewModel() {
        var self = this;
        self.travels = ko.observableArray();

        self.toAddModel = ko.observable(new toAddModel());
        self.addArticle = function () {
            var arts = Enumerable.From(self.travels());
            if (arts.Any(function (a) {
                return a.id() === self.toAddModel().article().id;
            })) {
                var ar = arts.Single(function (a) {
                    return a.id() === self.toAddModel().article().id;
                });
                ar.amount(parseInt(ar.amount()) + parseInt(self.toAddModel().amount()));
            } else {
                self.travels.push(new travelDescriptionViewModel(self.toAddModel()));
            }
            self.toAddModel().article(null);
            self.toAddModel().amount({});
            $("#articulos").val("");
            $("#articulos").focus();
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

        self.articles = ko.observableArray(articulosModel);

        self.spec = {
            tags: true,
            placeholder: "Seleccione un artículo...",

        };

    }

    ko.applyBindings(new viewModel());
});