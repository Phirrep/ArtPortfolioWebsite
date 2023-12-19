import logger from "morgan";
import express from "express";
import {readFile, writeFile} from 'fs/promises';
import * as Mongo from "mongodb";

const path = "./data.json";
const client = new Mongo.MongoClient("mongodb+srv://ptphan:5ssW4Pj4LWwjQzzd@portfolio.gk7bxqz.mongodb.net/?retryWrites=true&w=majority");
const db = "data";
//id: {type: type, data: data}
let elements = {};

async function reload(fileName){
    try {
        await client.connect();
        const result = client.db(db);
        const collections = (await result.listCollections().toArray()).map(x => x.name);
        for (let i = 0; i < collections.length; i++){
            let name = collections[i];
            elements[name] = await result.collection(name).find().toArray();
        }
    }
    catch (err){
        console.log(err);
        try {
            const data = await readFile(fileName, "utf-8");
            elements = JSON.parse(data);
        }
        catch (err){
            console.log(err);
        }
    }
    finally {
        //console.log("closing");
        await client.close();
    }
}
async function saveData(fileName){
    try {
        await writeFile(fileName, JSON.stringify(elements), "utf-8");
    }
    catch (err){
        console.log(err);
    }

    try {
        console.log('trying to connect');
        await client.connect();
        const result = client.db(db);
        const collections = (await result.listCollections().toArray()).map(x => x.name);
        console.log(collections);
        for (let id in elements){
            if (!collections.some(x => x === id)){
                await result.createCollection(id);
            }
            console.log("saving " + id);
            await result.collection(id).deleteMany();
            await result.collection(id).insertMany(elements[id]);
        }
        for (let i = 0; i < collections.length; i++){
            let name = collections[i];
            if (!(name in elements)){
                await result.dropCollection(name);
            }
        }
    }
    catch (err){
        console.log(err);
    }
    finally{
        await client.close();
    }
}

//element: id
async function readData(response, id){
    await reload(path);
    if (!(id in elements)){
        response.status(400);
        response.json("Element invalid");
    }
    else {
        let element = elements[id];
        response.json(element);
    }
};
async function updateData(response, id, value){
    if (!(id in elements)){
        response.status(400);
        response.json("Element invalid");
    }
    else {
        elements[id] = JSON.parse(value);
        await saveData(path);
        response.status(200);
    }
};
async function createData(response, id){
    if (id in elements){
        response.status(400);
        response.json("Element already exists");
    }
    else {
        elements[id] = [{isEmpty: true}];
        await saveData(path);
        response.status(200);
        response.json(elements[id]);
    }
};
async function deleteData(response, id){
    await reload(path);
    if (!(id in elements)){
        response.status(400);
        response.json("Element invalid");
    }
    else {
        delete elements[id];
        await saveData(path);
        response.status(200);
        response.json(elements);
    }
};
async function dumpData(response){
    await reload(path);
    response.json(elements);
}

async function getImage(response, src){
    response.sendFile(process.cwd() + src);
}

const app = express();
const port = 3000;
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/client', express.static('client'));



//read?id=id
app.get("/read", async (request, response) => {
    const query = request.query;
    await readData(response, query.id);
});
//create?type=type&id=id
app.post("/create", async (request, response) => {
    const query = request.query;
    await createData(response, query.id);
});
//update?id=id&value=value
app.put("/update", async (request, response) => {
    const query = request.query;
    await updateData(response, query.id, query.value);
});
//delete?id=id
app.delete("/delete", async (request, response) => {
    const query = request.query;
    await deleteData(response, query.id);
});
app.get("/dump", async (request, response) => {
    const query = request.query;
    await dumpData(response);
});
//getImage?src=src
app.get("/getImage", async (request, response) => {
    const query = request.query;
    await getImage(response, query.src);
});


app.get('*', async (request, response) => {
    response.status(404).send(`Not found: ${request.path}`);
});

app.listen(port, () => {
    console.log(`server started on port ${port}`);
});

//ptphan
//5ssW4Pj4LWwjQzzd