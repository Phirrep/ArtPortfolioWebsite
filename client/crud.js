export async function readData(id){
    try {
        const data = await fetch(`/read?id=${id}`, {
            method: "GET",
        });
        return await data.json();
    }
    catch(err){
        console.log(err);
    }
};

export async function updateData(id, value){
    try {
        const data = await fetch(`/update?id=${id}&value=${value}`, {
            method: "PUT",
        });
        return await data.json();
    }
    catch(err){
        console.log(err);
    }
};

export async function createData(id){
    try {
        const data = await fetch(`/create?id=${id}`, {
            method: "POST",
        });
        return await data.json();
    }
    catch(err){
        console.log(err)
    }
};

export async function deleteData(id){
    try {
        const data = await fetch(`/delete?id=${id}`, {
            method: "DELETE",
        });
        return await data.json();
    }
    catch (err){
        console.log(err);
    }
};

export async function dumpData(){
    try {
        const data = await fetch("/dump", {
            method: "GET",
        });
        return await data.json();
    }
    catch (err){
        console.log(err);
    }
}

export async function getImage(src){
    try {
        const data = await fetch(`/getImage?src=${src}`, {
            method: "GET",
        });
        let blob = await data.blob();
        return URL.createObjectURL(blob);
    }
    catch (err){
        console.log(err);
    }
}