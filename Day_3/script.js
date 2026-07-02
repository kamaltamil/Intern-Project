document.addEventListener("DOMContentLoaded", startApp);

// API URLs
const API_URL = "https://jsonplaceholder.typicode.com/posts";

let editingPostId = null;


const STORAGE_KEY = "localPosts";

const getLocalPosts = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
};

const saveLocalPosts = (posts) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

// Fetch all data from API
const fetchData = async () => {
    try {

        const response = await fetch(API_URL);
        const apiPosts = await response.json();

        const localPosts = getLocalPosts();

        const allPosts = [...localPosts, ...apiPosts];

        listAllProducts(allPosts);

    } catch (error) {
        console.error(error);
    }
}

// Fetch a specific product by ID
const getProduct = async (id) => {
    try {
        if (id > 100) {
            const localPosts = getLocalPosts();
            return localPosts.find(post => post.id == id);
        }

        const response = await fetch(API_URL + "/" + id);
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error){
        console.error("Error fetching product:", error);
    }
}

// Add a new product to the API


const addProduct = async () => {
    try {

        const userId = document.getElementById("user-id");
        const newPostTitle = document.getElementById("post-title");
        const newPostBody = document.getElementById("post-body");

        const newProduct = {
            userId: userId.value,
            title: newPostTitle.value,
            body: newPostBody.value
        };

        const localPosts = getLocalPosts();

        const nextId =
                localPosts.length > 0
                    ? Math.max(...localPosts.map(post => post.id)) + 1
                    : 101;

            newProduct.id = nextId;

        localPosts.push(newProduct);

        saveLocalPosts(localPosts);

        console.log(newProduct);

        userId.value = "";
        newPostTitle.value = "";
        newPostBody.value = "";

        fetchData();


    } catch (error) {
        console.error("Error adding product:", error);
    }
};


// Update a product completely 
const fullUpdateProduct = async (id, updateData) => {
    try {
        if (id > 100) {
            let posts = getLocalPosts();
            posts = posts.map(post =>
                post.id == id ? { ...post, ...updateData } : post
            );
            saveLocalPosts(posts);
            fetchData();
            return;
        }

        const response = await fetch(API_URL + "/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updateData)
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error updating product:", error);
    }
}

// Update a product partially
const partialUpdateProduct = async (id, updateData) => {
    try {
        const response = await fetch(API_URL +"/"+id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updateData)
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error partially updating product:", error);
    }
}

// Delete a product by ID
const deleteProduct = async (id) => {
    try {
        if (id > 100) {
            let posts = getLocalPosts();
            posts = posts.filter(post => post.id != id);
            saveLocalPosts(posts);
            fetchData();
            return;
        }
        const reponse = await fetch(API_URL + "/" + id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (reponse.ok){
            console.log(`Product with ID ${id} deleted successfullly`);
        } else {
            console.error(`Failed to delete product with ID ${id}`);
        }
    } catch (error) {
        console.error("Error deleting product:", error);
    }
}

// List all products from the API
const postTableBody = document.getElementById("post-table-body");

const listAllProducts = async (data) => {
    postTableBody.innerHTML = "";
    data.forEach((post) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${post.userId}</td>
        <td>${post.id}</td>
        <td>${post.title}</td>
        <td>${post.body}</td>
        <td>
            <button class="btn" onclick="editProduct(${post.id})">Edit</button>
            <button class="btn" onclick="deleteProduct(${post.id})">Delete</button>
         </td>
        `;
        postTableBody.appendChild(row);
    })
}
    
const editProduct = (id) => {

    getProduct(id)
        .then((product) => {

            document.getElementById("user-id").value = product.userId;
            document.getElementById("post-title").value = product.title;
            document.getElementById("post-body").value = product.body;

            editingPostId = id;

            document.getElementById("create-post").innerText = "Update";

        })
        .catch((error) => {
            console.error("Error editing product:", error);
        });
}

document.getElementById("create-post").addEventListener("click", async () => {

    const product = {
        userId: document.getElementById("user-id").value.trim(),
        title: document.getElementById("post-title").value.trim(),
        body: document.getElementById("post-body").value.trim()
    };

    if (!product.userId || !product.title || !product.body) {
        alert("Please fill all fields");
        return;
    }

    if (editingPostId === null) {

        await addProduct();

    } else {

        await fullUpdateProduct(editingPostId, product);

        editingPostId = null;

        document.getElementById("create-post").innerText = "Create";

        document.getElementById("user-id").value = "";
        document.getElementById("post-title").value = "";
        document.getElementById("post-body").value = "";

        fetchData();
    }

});

// Initialize the app
function startApp() {
    console.log("App started");

    fetchData();

}