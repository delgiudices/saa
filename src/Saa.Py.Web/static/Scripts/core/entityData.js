Store = $data.define("Store", {
    pk: { type: "int", key: true, computed: true },
    nombre: { type: String, required: true, maxLength: 200 },
    mapa: { type: String, required: false, maxLength: 200 },
});

Article = $data.define("Article", {
    pk: { type: "int", key: true, computed: true },
    nombre: { type: String, required: true, maxLength: 200 },
});

Node = $data.define("Node", {
    pk: { type: "int", key: true, computed: true },
    nombre: { type: String, required: true, maxLength: 200 },
    tipo: { type: String, required: true, maxLength: 200 },
    x: { type: "int", required: true },
    y: { type: "int", required: true },
    almacen: { type: "int", required: true },
    nodos: { type: Array, elementType: "int" },
    articulos: { type: Array, elementType: "int" }
});

Edge = $data.define("Edge", {
    pk: { type: "int", key: true, computed: true },
    desde: { type: "int", required: true },
    hasta: { type: "int", required: true },
    distancia: { type: "int", required: true }
});

Robot = $data.define("Robot", {
    pk: { type: "int", key: true, computed: true },
    nombre: { type: String, required: true, maxLength: 200 },
    estado: { type: String, required: true, maxLength: 200 },
});

ArticleNode = $data.define("ArticleNode", {
    pk: { type: "int", key: true, computed: true },
    nodo: { type: "int", required: true },
    articulo: { type: "int", required: true },
    cantidad: { type: "int", required: true },
    capacidad: { type: "int", required: true }
});

$data.Entity.extend("StoreTravel", {
    id: { type: String, required: false },
    nombre: { type: String, required: false },
    mapa: { type: String, required: false }
});

$data.Entity.extend("ArticleTravel", {
    id: { type: String, required: false },
    nombre: { type: String, required: false }
});

$data.Entity.extend("TravelPath", {
    path: { type: String, required: false },
    camino: { type: String, required: false },
    articulo: { type: "int", required: false },
});

Travel = $data.define("Travel", {
    pk: { type: "int", key: true, computed: true },
    articulos: { type: Array, elementType: ArticleTravel },
    path: { type: Array, elementType: TravelPath, required: false },
    almacen: { type: StoreTravel, required: false }
});

ToWebApi(Store, "almacenes");
ToWebApi(Article, "articulos");
ToWebApi(Node, "nodos");
ToWebApi(Robot, "robots");
ToWebApi(Edge, "caminos");
ToWebApi(ArticleNode, "nodo_articulo");
ToWebApi(Travel, "viajes");

function ToWebApi(store, dataSource) {
    store.setStore('default', {
        provider: 'webApi',
        dataSource: '/' + dataSource
    });
}

function logStore(store) {
    store.readAll().then(function (data) {
        data.forEach(function (entity) {
            console.debug(JSON.stringify(entity));
        });
    })
}