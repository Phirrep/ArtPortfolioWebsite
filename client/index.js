import * as crud from "./crud.js";

const showcasesElement = document.getElementById("showcases");
const usersElement = document.getElementById("users");
const newShowcaseElement = document.getElementById("new-showcase");
const newShowcaseName = document.getElementById("showcase-name");
const showAllShowcasesElement = document.getElementById("showAll");
const checkFavoritesElement = document.getElementById("checkFavorites");
const checkCommentsElement = document.getElementById("checkComments");
const sortFavoritesElement = document.getElementById("sortFavorites");
const sortCommentsElement = document.getElementById("sortComments");
const orderElement = document.getElementById("order");
//List of functions for updating the showcases/forms, [() => x]
let updateList = [];
const updateAll = () => updateList.forEach(x => x());
let user = localStorage.getItem("user");
user = user === null? usersElement.value:user;
usersElement.value = user;
usersElement.addEventListener("change", () => {
    let newUser = usersElement.value;
    if (newUser !== user){
        user = newUser;
        localStorage.setItem("user", user);
        showAllShowcases();
        updateAll();
    }
});
newShowcaseElement.addEventListener("click", async () => {
    await crud.createData(newShowcaseName.value);
    newShowcaseName.value = "";
    await showAllShowcases();
});
showAllShowcasesElement.addEventListener("click", async () => {
    await showAllShowcases();
});
checkFavoritesElement.addEventListener("click", async () => {
    await showSingleCollection(x => x.likes.some(y => y === user));
});
checkCommentsElement.addEventListener("click", async () => {
    await showSingleCollection(x => x.comments.some(y => y.user === user));
});

let order;
updateList.push(() => {
    if (orderElement.value === "desc"){
        order = (x, y) => x > y;
    }
    else if (orderElement.value === "asc"){
        order = (x, y) => x < y;
    }
    else{
        order = (x, y) => x > y;
    }
});
orderElement.addEventListener("change", () => updateAll());
sortFavoritesElement.addEventListener("click", () => showSortedCollection(x => x.likes.length, order));
sortCommentsElement.addEventListener("click", () => showSortedCollection(x => x.comments.length, order));


//showcase: [{src, likes, ...}]
const createShowcase = async (showcase, e) => {
    let imgIndex = 0;

    let e1 = document.createElement("div");
    e1.classList.add("showcase");
    let e2 = document.createElement("div");
    e2.classList.add("stats");
    let showcaseTitle = document.createElement("div");
    showcaseTitle.classList.add("title");
    showcaseTitle.innerHTML = "Showcase " + e.id;
    let left = document.createElement("div");
    left.classList.add("left");
    left.classList.add("arrow");
    let right = document.createElement("div");
    right.classList.add("right");
    right.classList.add("arrow");
    let gallery = document.createElement("img");
    gallery.alt = "Empty Gallery :(";
    gallery.src = "isEmpty" in showcase[0]? "" : await crud.getImage(showcase[0].src);
    gallery.classList.add("gallery");

    let commentBox = document.createElement("form");
    commentBox.classList.add("commentBox");
    let textBox = document.createElement("textarea");
    textBox.classList.add("commentBox");
    let commentButton = document.createElement("input");
    commentButton.classList.add("commentButton");
    commentButton.type = "button";
    commentButton.value = "Comment";
    commentButton.addEventListener("click", async () => {
        if ("isEmpty" in showcase[0]){
            return;
        }
        if (textBox.value !== ""){
            showcase[imgIndex].comments.push({user: user, comment: textBox.value});
            textBox.value = "";
            saveTextbox();
            update();
            await crud.updateData(e.id, JSON.stringify(showcase));
        }
    })
    commentBox.appendChild(textBox);
    commentBox.appendChild(commentButton);
    let saveTextbox = () => localStorage.setItem(user+"%"+e.id, textBox.value)
    textBox.addEventListener("keyup", saveTextbox);
    let updateCommentText = () => {textBox.value = localStorage.getItem(user+"%"+e.id)};
    updateCommentText();
    updateList.push(updateCommentText);

    let likes = document.createElement("div");
    likes.classList.add("username");
    let title = document.createElement("div");
    title.classList.add("title");
    let description = document.createElement("div");
    description.classList.add("description");

    let favorite = document.createElement("div");
    let isFavorite = false;
    favorite.addEventListener("mouseenter", () => {
        favorite.classList.remove(isFavorite? "red-heart":"grey-heart");
        favorite.classList.add(isFavorite? "grey-heart":"red-heart");
    });
    favorite.addEventListener("mouseleave", () => {
        favorite.classList.remove(isFavorite? "grey-heart":"red-heart");
        favorite.classList.add(isFavorite? "red-heart":"grey-heart");
    });

    let comments = document.createElement("div");
    comments.classList.add("comments");

    let editing = document.createElement("div");
    let plusSign = () => {
        let button = document.createElement("div");
        button.classList.add("plus-sign");
        button.classList.add("editing-button");
        return button;
    }
    let addPhoto = document.createElement("div");
    addPhoto.classList.add("editing-option");
    addPhoto.innerHTML = `
        <div>Add Artwork </div>
        <form>
            <input type="text" id="${e.id+"%fileName"}"></input>
        </form>
    `;
    let addButton = plusSign();
    addButton.addEventListener("click", async () => {
        if ("isEmpty" in showcase[0]){
            showcase = [];
        }
        let fileName = document.getElementById(e.id+"%fileName");
        let title = document.getElementById(e.id+"%titleName");
        let description = document.getElementById(e.id+"%descriptionName");
        let newShowcase = {src: "/imgs/" + fileName.value};
        fileName.value = "";
        if (title.value !== ""){
            newShowcase.title = title.value;
            title.value = "";
        }
        if (description.value !== ""){
            newShowcase.description = description.value;
            description.value = "";
        }
        showcase.push(newShowcase);
        update();
        await crud.updateData(e.id, JSON.stringify(showcase));
    });
    addPhoto.appendChild(addButton);
    addPhoto.appendChild(document.createElement("br"));
    addPhoto.appendChild(document.createElement("br"));
    let setTitle = document.createElement("div");
    setTitle.classList.add("editing-option");
    setTitle.innerHTML = `
        <div>Set Title </div>
        <form>
            <input type="text" id="${e.id+"%titleName"}"></input>
        </form>
    `;
    addButton = plusSign();
    addButton.addEventListener("click", async () => {
        if ("isEmpty" in showcase[0]){
            return;
        }
        let title = document.getElementById(e.id+"%titleName");
        showcase[imgIndex].title = title.value;
        title.value = "";
        update();
        await crud.updateData(e.id, JSON.stringify(showcase));
    });
    setTitle.appendChild(addButton);
    setTitle.appendChild(document.createElement("br"));
    setTitle.appendChild(document.createElement("br"));
    let setDescription = document.createElement("div");
    setDescription.classList.add("editing-option");
    setDescription.innerHTML = `
        <div>Set Description </div>
        <form>
            <input type="text" id="${e.id+"%descriptionName"}"></input>
        </form>
    `;
    addButton = plusSign();
    addButton.addEventListener("click", async () => {
        if ("isEmpty" in showcase[0]){
            return;
        }
        let description = document.getElementById(e.id+"%descriptionName");
        showcase[imgIndex].description = description.value;
        description.value = "";
        update();
        await crud.updateData(e.id, JSON.stringify(showcase));
    });
    setDescription.appendChild(addButton);
    setDescription.appendChild(document.createElement("br"));
    setDescription.appendChild(document.createElement("br"));

    let minusSign = () => {
        let button = document.createElement("div");
        button.classList.add("minus-sign");
        button.classList.add("editing-button");
        return button;
    }
    let removeShowcase = document.createElement("div");
    removeShowcase.classList.add("editing-option");
    removeShowcase.innerHTML = `
        <div>Remove Showcase </div>
    `;
    let removeButton = minusSign();
    removeButton.addEventListener("click", async () => {
        updateList = updateList.filter(x => x !== update);
        await crud.deleteData(e.id);
        await showAllShowcases();
    });
    removeShowcase.appendChild(removeButton);
    let removeComments = document.createElement("div");
    removeComments.classList.add("editing-option");
    removeComments.innerHTML = `
        <div>Clear Comments </div>
    `;
    removeButton = minusSign();
    removeButton.addEventListener("click", async () => {
        if ("isEmpty" in showcase[0]){
            return;
        }
        showcase[imgIndex].comments = [];
        update();
        await crud.updateData(e.id, JSON.stringify(showcase));
        await showAllShowcases();
    });
    removeComments.appendChild(removeButton);
    let removeArtwork = document.createElement("div");
    removeArtwork.classList.add("editing-option");
    removeArtwork.innerHTML = `
        <div>Remove Artwork </div>
    `;
    removeButton = minusSign();
    removeButton.addEventListener("click", async () => {
        showcase = showcase.filter((x, i) => i !== imgIndex);
        if (showcase.length < 1){
            showcase = [{isEmpty: true}];
        }
        update();
        await crud.updateData(e.id, JSON.stringify(showcase));
        await showAllShowcases();
    });
    removeArtwork.appendChild(removeButton);
    editing.appendChild(addPhoto);
    editing.appendChild(setTitle);
    editing.appendChild(setDescription);
    editing.appendChild(removeComments);
    editing.appendChild(removeArtwork);
    editing.appendChild(removeShowcase);

    let update = async () => {
        if (imgIndex >= showcase.length - 1){
            right.classList.remove("arrow");
            right.classList.add("arrow-disabled");
        }
        else {
            right.classList.remove("arrow-disabled");
            right.classList.add("arrow");
        }
        if (imgIndex === 0){
            left.classList.remove("arrow");
            left.classList.add("arrow-disabled");
        }
        else {
            left.classList.remove("arrow-disabled");
            left.classList.add("arrow");
        }
        if ("isEmpty" in showcase[0]){
            gallery.alt = "Empty Gallery :(";
            gallery.src = "";
            return;
        }
        let image = showcase[imgIndex];
        if (!("title" in image)){
            image.title = "no title";
        }
        if (!("description" in image)){
            image.description = "no description";
        }
        if (!("likes" in image)){
            image.likes = [];
        }
        if (!("comments" in image)){
            image.comments = [];
        }
        gallery.alt = "img not found";
        gallery.src = await crud.getImage(showcase[imgIndex].src);
        title.innerHTML = image.title;
        description.innerHTML = image.description;
        likes.innerHTML = "Likes: " + image.likes.length;
        isFavorite = image.likes.some(x => x === user);
        favorite.classList.remove(isFavorite? "grey-heart":"red-heart");
        favorite.classList.add(isFavorite? "red-heart":"grey-heart");
        comments.style.gridTemplateRows = `repeat(${image.comments.length}, 1fr)`;
        comments.innerHTML = "";
        showcase[imgIndex].comments.forEach(x => {
            let username = document.createElement("div");
            username.classList.add("username");
            username.innerHTML = x.user;
            let comment = document.createElement("div");
            comment.classList.add("description");
            comment.innerHTML = x.comment;
            comments.appendChild(username);
            comments.appendChild(comment);
        });
    }
    right.addEventListener("click", async () => {
        imgIndex = Math.min(imgIndex + 1, showcase.length - 1);
        update();
    });
    left.addEventListener("click", async () => {
        imgIndex = Math.max(imgIndex - 1, 0);
        update();
    });
    favorite.addEventListener("click", async () => {
        let data = showcase[imgIndex];
        if (!("likes" in data)){
            data.likes = [user];
            isFavorite = true;
        }
        else {
            if (!isFavorite){
                data.likes.push(user);
            }
            else {
                data.likes = data.likes.filter(x => x !== user);
            }
            isFavorite = !isFavorite;
        }
        update();
        await crud.updateData(e.id, JSON.stringify(showcase));
    });
    updateList.push(update);
    update();

    e1.appendChild(left);
    e1.appendChild(gallery);
    e1.appendChild(right);
    e1.appendChild(favorite);
    e1.appendChild(commentBox);
    e1.appendChild(editing);
    e2.appendChild(likes);
    e2.appendChild(title);
    e2.appendChild(description);
    e.appendChild(showcaseTitle);
    e.appendChild(e1);
    e.appendChild(e2);
    e.appendChild(document.createElement("br"));
    e.appendChild(comments);
    e.appendChild(document.createElement("br"));
    e.appendChild(document.createElement("br"));
    showcasesElement.appendChild(e);
}

async function showAllShowcases(){
    let data = await crud.dumpData();
    showcasesElement.innerHTML = "";
    for (let id in data){
        let element = data[id];
        let e = document.createElement("div");
        e.id = id;
        createShowcase(element, e);
    }
}
//Allow queries for filtering artworks, (x => Boolean)
async function showSingleCollection(query){
    let data = await crud.dumpData();
    showcasesElement.innerHTML = "";
    let e = document.createElement("div");
    e.id = "filtered";
    let showcase = [];
    for (let id in data){
        if ("isEmpty" in data[id][0]){
            continue;
        }
        data[id].forEach(x => {
            if (query(x)){
                showcase.push(x);
            }
        });
    }
    createShowcase(showcase, e);
}
//Allow queries for sorting artworks, (x => int), (x, y) => boolean
async function showSortedCollection(query, order){
    let data = await crud.dumpData();
    showcasesElement.innerHTML = "";
    let e = document.createElement("div");
    e.id = "sorted";
    let showcase = [];
    for (let id in data){
        if ("isEmpty" in data[id][0]){
            continue;
        }
        data[id].forEach(x => {
            let item = {value: query(x), element: x};
            showcase.push(item);
            for (let i = showcase.length-1; i > 0; i--){
                if (!order(showcase[i-1].value, showcase[i].value)){
                    let temp = showcase[i];
                    showcase[i] = showcase[i-1];
                    showcase[i-1] = temp;
                }
            }
        });
    }
    createShowcase(showcase.map(x => x.element), e);
}

updateAll();
showAllShowcases();