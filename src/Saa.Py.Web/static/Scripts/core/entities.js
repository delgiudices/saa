function Store(e) {
    var self = this;
    self.pk = e.pk;
    self.nombre = e.nombre;
    self.mapa = e.mapa;
}

function Node(n) {
    var self = this;
    self.pk = n.pk;
    self.nombre = n.nombre;
    self.almacen = n.almacen;
    self.tipo = n.tipo;
    self.articulos = n.articulos;
    self.nodos = n.nodos;
    self.x = n.x;
    self.y = n.y;
}

function Robot(r) {
    var self = this;
    self.pk = r.pk;
    self.nombre = r.nombre;
    self.estado = r.estado;
}

function Article(a) {
    var self = this;
    self.pk = a.pk;
    self.nombre = a.nombre;
}

function Edge(e) {
    var self = this;
    self.pk = e.pk;
    self.desde = e.desde;
    self.hasta = e.hasta;
    self.distancia = e.distancia;
}

function NodeArticle(nA) {
    var self = this;
    self.pk = nA.pk;
    self.nodo = nA.nodo;
    self.articulo = nA.articulo;
    self.cantidad = nA.cantidad;
    self.capacidad = nA.capacidad;
}