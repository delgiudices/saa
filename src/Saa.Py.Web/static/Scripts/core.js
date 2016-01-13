$(function () {
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

    ko.applyBindings(new viewModel());
});