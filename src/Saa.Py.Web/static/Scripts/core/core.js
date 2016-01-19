function travelDescriptionViewModel(model) {
    var self = this;
    self.selected = ko.observable();
    self.id = ko.observable(model.article()[0].data.pk);
    self.description = ko.observable(model.article()[0].data.nombre);
    self.amount = ko.observable(model.amount());
    self.type = ko.observable(model.type());
}

function toAddModel() {
    var self = this;
    self.article = ko.observable();
    self.amount = ko.observable();
    self.type = ko.observable();
}

function viewModel() {
    var self = this;
    self.travels = ko.observableArray();

    self.toAddModel = ko.observable(new toAddModel());

    self.addArticle = function () {
        var arts = Enumerable.From(self.travels());
        if (arts.Any(function (a) {
            return a.id() === self.toAddModel().article()[0].data.pk && a.type().value === self.toAddModel().type().value;
        })) {
            var ar = arts.Single(function (a) {
                return a.id() === self.toAddModel().article()[0].data.pk && a.type().value === self.toAddModel().type().value;
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

    self.travelsTypes = [
        { text: 'Seleccionar', value: 'Seleccionar' },
        { value: 'entrada', text: 'Entrada' },
        { value: 'salida', text: 'Salida' }];

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

    self.executeTravel = function () {

        //{
        //    "articulos": [
        //    {
        //        "pk": 4,
        //        "cantidad": 2,
        //        "tipo": "entrada"
        //    },
        //    {
        //        "pk": 5,
        //        "tipo": "entrada",
        //        "cantidad": 1
        //    }
        //    ],
        //    "almacen": 1
        //}

        try {
            var ars = $.map(self.travels(), function (t) {
                return {
                    pk: t.id(),
                    cantidad: parseInt(t.amount()),
                    tipo: t.type().value
                };
            });
        } catch (e) {
            alert("Debe ingresar un número en la cantidad.");
        }

        $.ajax({
            type: "POST",
            //the url where you want to sent the userName and password to
            url: location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + "/viajes/",
            //json object to sent to the authentication url
            data: JSON.stringify({
                almacen: 1,
                articulos: ars
            }),
            dataType: "json",
            contentType: "application/json",
            success: function (t) {
                console.debug(t);
                alert("Guardado exitosamente!");
                window.location.href = "view.html?travelId=" + t.pk;
            }
        })

    }
}