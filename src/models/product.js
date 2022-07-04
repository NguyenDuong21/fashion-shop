const {ProductSchema} = require('./schema/products');
const getProduct = () => {
    return new Promise((resolve, reject) => {
        ProductSchema.find({}, function(err, products){
            if(err) reject(err);
            resolve(products);
        })
    })
    
}
const getProductlimit = (skip,limit) => {
    return new Promise( async (resolve, reject) => {
        try {
            const products = await ProductSchema.find().limit(limit).skip(skip);
            resolve(products);
        } catch (error) {
            reject(error);
        }
    });
}
const getProductGt = (price) => {
    return new Promise( async (resolve, reject) => {
        try {
            const products = await ProductSchema.findByIdAndUpdate('627a13cf88eb0e318a3e0251', {name: 'nameupdate'}).exec();
            console.log(products);
                resolve(products);
        } catch (error) {
            reject(error);
        }
        

    })
}
const getOneProductById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await ProductSchema.findById(id);
            resolve(product);
        } catch (error) {
            reject(error);            
        }
    })
}
module.exports = {getProduct,getProductGt, getProductlimit,getOneProductById}