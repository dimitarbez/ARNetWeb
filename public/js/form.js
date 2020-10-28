document.querySelector("#submit").disabled = true;

let imageError = 0;
let modelError = 0;

document.querySelector('.custom-file-input').addEventListener('change',function(e){
    var fileName = document.getElementById("file_to_upload").files[0].name;
    var nextSibling = e.target.nextElementSibling

    let extensionType = fileName.split(".").pop();
    if (extensionType != "glb" && extensionType != "gltf") {
        //alert("Model must be of GLB or GLTF type!");
        document.querySelector("#file_to_upload").value = null;
        nextSibling.innerText = "Choose a 3D model with the GLB or GLTF format!";
        document.querySelector("#submit").disabled = true;
        modelError = 1;
    }
    else {
        nextSibling.innerText = fileName
        document.querySelector("#submit").disabled = false
        modelError = 0;
    }
    console.log(extensionType);
});

document.querySelector('#image_for_model').addEventListener('change',function(e){
    var fileName = document.getElementById("image_for_model").files[0].name;
    var nextSibling = e.target.nextElementSibling

    let extensionType = fileName.split(".").pop();
    if (extensionType != "jpg" && extensionType != "png" && extensionType != "jpeg") {
        //alert("Model must be of GLB or GLTF type!");
        document.querySelector("#image_for_model").value = null;
        nextSibling.innerText = "Use a correct image format!";
        document.querySelector("#submit").disabled = true;
        imageError = 1;
    }
    else {
        imageError = 0;
        nextSibling.innerText = fileName
        if (!imageError && !modelError) {
            document.querySelector("#submit").disabled = false
        }
    }
    console.log(extensionType);
});