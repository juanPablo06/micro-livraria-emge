const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const products = require('./products.json');

const productsRepository = JSON.parse(JSON.stringify(products))

const packageDefinition = protoLoader.loadSync('proto/inventory.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const inventoryProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// implementa os métodos do InventoryService
server.addService(inventoryProto.InventoryService.service, {
    searchAllProducts: (_, callback) => {
        callback(null, {
            products: productsRepository,
        });
    },

    SearchProductByID: (payload, callback) => {
        callback(
            null,
            productsRepository.find((product) => product.id == payload.request.id)
        );
    },

    addProduct: (payload, callback) => {
        let id = 1;
        for (const item of productsRepository) {
            if (item.id >= id) {
                id = item.id + 1
            }
        }
        const product = payload.request
        product.id = id;
        productsRepository.push(product);
        callback(null, product)
    },

    updateInventory: (payload, callback) => {
        const product = payload.request;
        let productResponse = {};
        for (const key in productsRepository) {
            const item = productsRepository[key]
            if (item.id === product.id) {
                productsRepository[key] = { ...item, ...product }
                productResponse = productsRepository[key]
            }
        }
        for (let item of productsRepository) {
            if (item.id === product.id) {
                item = { ...item, ...product }
                productResponse = item
            }
        }
        //productsRepository.push(product);
        callback(null, productResponse);
    }
});

server.bindAsync('127.0.0.1:3002', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Inventory Service running at http://127.0.0.1:3002');
    server.start();
});
